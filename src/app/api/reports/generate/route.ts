import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { resolveTenantContext, checkPermission, generateId } from '@/lib/tenantContext';
import { 
  calculateBalanceSheet, 
  calculateIncomeStatement, 
  calculateVatDeclaration,
  calculateFixedAssetsSchedule,
  calculateInventoryValuation,
  getEthiopianFiscalYear,
  toEthiopianDate
} from '@/lib/calculationEngine';
import { logAudit } from '@/lib/auditService';
import { getTenantCollection } from '@/lib/tenantContext';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Resolve tenant context
    const context = await resolveTenantContext(req);
    
    // Check permission
    if (!checkPermission(context.userRole, 'reports:generate')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { 
      reportType, 
      period,
      asOfDate 
    } = body;
    
    // Validate report type
    const validReportTypes = ['balance_sheet', 'income_statement', 'vat_declaration', 'fixed_assets_schedule', 'inventory_valuation'];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate period for income statement and VAT
    if ((reportType === 'income_statement' || reportType === 'vat_declaration') && !period) {
      return NextResponse.json(
        { error: 'Period (startDate and endDate) is required for this report type' },
        { status: 400 }
      );
    }
    
    // Validate asOfDate for balance sheet and schedules
    if ((reportType === 'balance_sheet' || reportType === 'fixed_assets_schedule' || reportType === 'inventory_valuation') && !asOfDate) {
      return NextResponse.json(
        { error: 'asOfDate is required for this report type' },
        { status: 400 }
      );
    }
    
    let reportData: any;
    let summary: any = {};
    let startDate: Date = new Date();
    let endDate: Date = new Date();
    let reportDate: Date = new Date();
    
    // Generate report based on type
    switch (reportType) {
      case 'balance_sheet': {
        const bsDate = new Date(asOfDate);
        reportDate = bsDate;
        reportData = await calculateBalanceSheet(context, reportDate);
        summary = {
          totalAssets: reportData.assets.totalAssets,
          totalLiabilities: reportData.liabilities.totalLiabilities,
          totalEquity: reportData.capital.totalCapital
        };
        startDate = new Date(reportDate.getFullYear(), 0, 1);
        endDate = reportDate;
        break;
      }
        
      case 'income_statement': {
        const isStartDate = new Date(period.startDate);
        const isEndDate = new Date(period.endDate);
        startDate = isStartDate;
        endDate = isEndDate;
        reportDate = endDate;
        reportData = await calculateIncomeStatement(context, startDate, endDate);
        summary = {
          totalRevenue: reportData.revenues.totalRevenues,
          totalExpenses: reportData.expenses.totalExpenses,
          netIncome: reportData.netIncomeAfterTax
        };
        break;
      }
        
      case 'vat_declaration': {
        const vatStartDate = new Date(period.startDate);
        const vatEndDate = new Date(period.endDate);
        startDate = vatStartDate;
        endDate = vatEndDate;
        reportDate = endDate;
        reportData = await calculateVatDeclaration(context, startDate, endDate);
        summary = {
          totalVat: reportData.netVatPayable
        };
        break;
      }
        
      case 'fixed_assets_schedule': {
        const faDate = new Date(asOfDate);
        reportDate = faDate;
        reportData = await calculateFixedAssetsSchedule(context, reportDate);
        summary = {
          totalAssets: reportData.totalCost,
          totalDepreciation: reportData.totalAccumulatedDepreciation
        };
        startDate = new Date(reportDate.getFullYear(), 0, 1);
        endDate = reportDate;
        break;
      }
        
      case 'inventory_valuation': {
        const invDate = new Date(asOfDate);
        reportDate = invDate;
        reportData = await calculateInventoryValuation(context, reportDate);
        summary = {
          totalValue: reportData.totalValue,
          totalItems: reportData.totalItems
        };
        startDate = new Date(reportDate.getFullYear(), 0, 1);
        endDate = reportDate;
        break;
      }
    }
    
    // Get Ethiopian fiscal year
    const fiscalYear = getEthiopianFiscalYear(reportDate);
    const ethiopianDate = toEthiopianDate(reportDate);
    
    // Generate report ID
    const reportId = generateId('report');
    
    // Save report to database
    const reportsCollection = getTenantCollection(context, 'reports');
    await reportsCollection.insertOne({
      reportId,
      reportType,
      period: {
        startDate,
        endDate,
        fiscalYear,
        month: ethiopianDate.month
      },
      data: reportData,
      summary,
      submission: {
        status: 'draft'
      },
      version: 1,
      isFinal: false,
      createdBy: context.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Log the report generation
    await logAudit(
      context,
      {
        action: 'CREATE',
        entityType: 'report',
        entityId: reportId,
        reportId,
        reportType,
        changes: {
          after: {
            reportType,
            period: { startDate, endDate, fiscalYear },
            summary
          }
        }
      },
      req
    );
    
    return NextResponse.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        reportId,
        reportType,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          fiscalYear,
          ethiopianMonth: ethiopianDate.month,
          ethiopianYear: ethiopianDate.year
        },
        summary,
        data: reportData
      }
    });
    
  } catch (error: any) {
    console.error('Report generation error:', error);
    
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
