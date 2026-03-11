import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { resolveTenantContext, checkPermission, getTenantCollection } from '@/lib/tenantContext';
import { logAudit } from '@/lib/auditService';
import { generateId } from '@/lib/tenantContext';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Resolve tenant context
    const context = await resolveTenantContext(req);
    
    // Check permission
    if (!checkPermission(context.userRole, 'reports:submit')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const { id: reportId } = await params;
    const body = await req.json();
    const { submissionNotes } = body;
    
    // Get report
    const reportsCollection = getTenantCollection(context, 'reports');
    const report = await reportsCollection.findOne({ reportId });
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Check if already submitted
    if (report.submission?.status === 'submitted') {
      return NextResponse.json(
        { error: 'Report has already been submitted' },
        { status: 400 }
      );
    }
    
    // Check if report is finalized
    if (!report.isFinal) {
      return NextResponse.json(
        { error: 'Report must be finalized before submission' },
        { status: 400 }
      );
    }
    
    // Generate submission reference
    const submissionId = generateId('submission');
    const submissionReference = `SUB-${report.period.fiscalYear}-${Date.now().toString(36).toUpperCase()}`;
    
    // Update report with submission details
    await reportsCollection.updateOne(
      { reportId },
      {
        $set: {
          'submission.status': 'submitted',
          'submission.submittedAt': new Date(),
          'submission.submittedBy': context.userId,
          'submission.submissionReference': submissionReference,
          'submission.submissionNotes': submissionNotes || ''
        },
        $push: {
          'submission.reviewHistory': {
            status: 'submitted',
            reviewedBy: context.userId,
            reviewedAt: new Date(),
            comments: submissionNotes || 'Report submitted for review'
          }
        }
      }
    );
    
    // Log the submission
    await logAudit(
      context,
      {
        action: 'SUBMIT',
        entityType: 'report',
        entityId: reportId,
        reportId,
        reportType: report.reportType,
        submissionId,
        changes: {
          before: { status: report.submission?.status || 'draft' },
          after: { status: 'submitted', submissionReference }
        }
      },
      req
    );
    
    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportId,
        submissionId,
        submissionReference,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      }
    });
    
  } catch (error: any) {
    console.error('Report submission error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Tenant not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message.includes('Subscription')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
