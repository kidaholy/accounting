import { AuditLog } from './models/platform';
import { TenantContext, generateId } from './tenantContext';
import connectDB from './db';

// Audit action types
export type AuditAction = 
  | 'CREATE' 
  | 'READ' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'SUBMIT' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'EXPORT' 
  | 'PRINT';

export type EntityType = 
  | 'transaction' 
  | 'inventory' 
  | 'asset' 
  | 'report' 
  | 'user' 
  | 'tenant' 
  | 'setting' 
  | 'subscription';

// Audit log entry interface
export interface AuditLogEntry {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  reportId?: string;
  reportType?: string;
  submissionId?: string;
  isSensitive?: boolean;
}

// Log an audit event
export async function logAudit(
  context: TenantContext,
  entry: AuditLogEntry,
  req?: Request
): Promise<void> {
  await connectDB();
  
  // Calculate retention date (7 years for tax compliance)
  const retentionUntil = new Date();
  retentionUntil.setFullYear(retentionUntil.getFullYear() + 7);
  
  // Extract IP and user agent if request is provided
  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  
  if (req) {
    ipAddress = req.headers.get('x-forwarded-for') || 
                req.headers.get('x-real-ip') || 
                'unknown';
    userAgent = req.headers.get('user-agent') || 'unknown';
  }
  
  // Filter sensitive data from changes
  const sanitizedChanges = entry.changes ? {
    before: sanitizeSensitiveData(entry.changes.before),
    after: sanitizeSensitiveData(entry.changes.after)
  } : undefined;
  
  await AuditLog.create({
    auditId: generateId('audit'),
    tenantId: context.tenantId,
    userId: context.userId,
    userRole: context.userRole,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    changes: sanitizedChanges,
    ipAddress,
    userAgent,
    reportId: entry.reportId,
    reportType: entry.reportType,
    submissionId: entry.submissionId,
    isSensitive: entry.isSensitive || false,
    retentionUntil,
    timestamp: new Date()
  });
}

// Sanitize sensitive data from audit logs
function sanitizeSensitiveData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return undefined;
  
  const sensitiveFields = ['password', 'passwordHash', 'creditCard', 'cvv', 'ssn', 'tin'];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSensitiveData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Get audit logs for a tenant
export async function getAuditLogs(
  context: TenantContext,
  filters: {
    entityType?: EntityType;
    entityId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ logs: any[]; total: number; page: number; totalPages: number }> {
  await connectDB();
  
  // Build query
  const query: Record<string, unknown> = { tenantId: context.tenantId };
  
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.entityId) query.entityId = filters.entityId;
  if (filters.action) query.action = filters.action;
  if (filters.userId) query.userId = filters.userId;
  
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) (query.timestamp as Record<string, Date>).$gte = filters.startDate;
    if (filters.endDate) (query.timestamp as Record<string, Date>).$lte = filters.endDate;
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;
  
  // Execute query
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query)
  ]);
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

// Get audit trail for a specific entity
export async function getEntityAuditTrail(
  context: TenantContext,
  entityType: EntityType,
  entityId: string
): Promise<any[]> {
  await connectDB();
  
  const logs = await AuditLog.find({
    tenantId: context.tenantId,
    entityType,
    entityId
  })
    .sort({ timestamp: 1 })
    .lean();
  
  return logs;
}

// Get report audit trail
export async function getReportAuditTrail(
  context: TenantContext,
  reportId: string
): Promise<any[]> {
  await connectDB();
  
  const logs = await AuditLog.find({
    tenantId: context.tenantId,
    $or: [
      { entityId: reportId },
      { reportId }
    ]
  })
    .sort({ timestamp: 1 })
    .lean();
  
  return logs;
}

// Get user activity summary
export async function getUserActivitySummary(
  context: TenantContext,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
  entitiesAffected: number;
}> {
  await connectDB();
  
  const logs = await AuditLog.find({
    tenantId: context.tenantId,
    userId,
    timestamp: { $gte: startDate, $lte: endDate }
  }).lean();
  
  const actionsByType: Record<string, number> = {};
  const uniqueEntities = new Set<string>();
  
  for (const log of logs) {
    actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    uniqueEntities.add(`${log.entityType}:${log.entityId}`);
  }
  
  return {
    totalActions: logs.length,
    actionsByType,
    entitiesAffected: uniqueEntities.size
  };
}

// Cleanup old audit logs (run periodically)
export async function cleanupOldAuditLogs(retentionDays: number = 2555): Promise<number> {
  await connectDB();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  const result = await AuditLog.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
  
  return result.deletedCount || 0;
}

// Export audit logs for compliance
export async function exportAuditLogs(
  context: TenantContext,
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  await connectDB();
  
  const logs = await AuditLog.find({
    tenantId: context.tenantId,
    timestamp: { $gte: startDate, $lte: endDate }
  })
    .sort({ timestamp: 1 })
    .lean();
  
  return logs.map(log => ({
    timestamp: log.timestamp,
    userId: log.userId,
    userRole: log.userRole,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    changes: log.changes,
    ipAddress: log.ipAddress,
    reportId: log.reportId,
    submissionId: log.submissionId
  }));
}

// Middleware helper to log API requests
export function createAuditMiddleware(
  action: AuditAction,
  entityType: EntityType,
  getEntityId: (req: Request) => string
) {
  return async (context: TenantContext, req: Request, next: () => Promise<any>) => {
    const entityId = getEntityId(req);
    
    // Log the action
    await logAudit(context, {
      action,
      entityType,
      entityId
    }, req);
    
    return next();
  };
}
