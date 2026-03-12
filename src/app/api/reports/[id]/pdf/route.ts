import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { resolveTenantContext, checkPermission, getTenantCollection } from '@/lib/tenantContext';
import { generateReportPDF, uploadPDF } from '@/lib/pdfGenerator';
import { logAudit } from '@/lib/auditService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Resolve tenant context
    const context = await resolveTenantContext(req);
    
    // Check permission
    if (!checkPermission(context.userRole, 'reports:export')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const { id: reportId } = await params;
    
    // Verify report exists
    const reportsCollection = getTenantCollection(context, 'reports');
    const report = await reportsCollection.findOne({ reportId });
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Generate PDF
    const { pdfBuffer, fileName } = await generateReportPDF(context, reportId);
    
    // Upload to storage
    const pdfUrl = await uploadPDF(pdfBuffer, fileName, context.tenantId);
    
    // Update report with PDF URL
    await reportsCollection.updateOne(
      { reportId },
      {
        $set: {
          pdfUrl,
          generatedAt: new Date()
        }
      }
    );
    
    // Log the PDF generation
    await logAudit(
      context,
      {
        action: 'EXPORT',
        entityType: 'report',
        entityId: reportId,
        reportId,
        reportType: report.reportType
      },
      req
    );
    
    // Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-PDF-URL': pdfUrl
      }
    });
    
  } catch (error: any) {
    console.error('PDF generation error:', error);
    
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
