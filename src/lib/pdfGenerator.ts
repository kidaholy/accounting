import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { TenantContext, getTenantCollection } from './tenantContext';
import connectDB from './db';

// Format currency in ETB
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Generate Balance Sheet HTML
function generateBalanceSheetHTML(reportData: any, tenantName: string, tin: string, period: any): string {
  const data = reportData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18pt; font-weight: bold; }
    .header h2 { margin: 5px 0; font-size: 14pt; color: #555; }
    .header .org-info { margin-top: 10px; font-size: 10pt; }
    .section { margin-top: 20px; }
    .section-title { font-weight: bold; font-size: 12pt; border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 4px 8px; vertical-align: top; }
    .amount { text-align: right; font-family: 'Courier New', monospace; }
    .total { font-weight: bold; border-top: 1px solid #666; }
    .grand-total { font-weight: bold; border-top: 2px solid #333; font-size: 11pt; }
    .indent { padding-left: 20px; }
    .signature-section { margin-top: 50px; page-break-inside: avoid; }
    .signature-row { display: flex; justify-content: space-between; margin-top: 30px; }
    .signature-box { width: 45%; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 9pt; }
    .footer { margin-top: 30px; font-size: 8pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${tenantName}</h1>
    <h2>Balance Sheet</h2>
    <div class="org-info">
      <div>TIN: ${tin}</div>
      <div>As of ${formatDate(new Date(period.endDate))} (Sene 30, ${period.fiscalYear} E.C.)</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">ASSETS</div>
    
    <table>
      <tr>
        <td colspan="2"><strong>Current Assets</strong></td>
      </tr>
      <tr>
        <td class="indent">Cash on Hand / Bank</td>
        <td class="amount">${formatCurrency(data.assets.currentAssets.cashOnHand + data.assets.currentAssets.bankBalances)}</td>
      </tr>
      <tr>
        <td class="indent">Trade & Other Receivables</td>
        <td class="amount">${formatCurrency(data.assets.currentAssets.tradeReceivables)}</td>
      </tr>
      <tr>
        <td class="indent">Inventory</td>
        <td class="amount">${formatCurrency(data.assets.currentAssets.inventory)}</td>
      </tr>
      <tr>
        <td class="indent">Other Current Assets</td>
        <td class="amount">${formatCurrency(data.assets.currentAssets.otherCurrentAssets)}</td>
      </tr>
      <tr class="total">
        <td><strong>Total Current Assets</strong></td>
        <td class="amount"><strong>${formatCurrency(data.assets.currentAssets.totalCurrentAssets)}</strong></td>
      </tr>
    </table>
    
    <table style="margin-top: 15px;">
      <tr>
        <td colspan="2"><strong>Property and Equipment</strong></td>
      </tr>
      <tr>
        <td class="indent">Equipment (Cost)</td>
        <td class="amount">${formatCurrency(data.assets.propertyAndEquipment.equipmentCost)}</td>
      </tr>
      <tr>
        <td class="indent">Less: Accumulated Depreciation</td>
        <td class="amount">(${formatCurrency(data.assets.propertyAndEquipment.accumulatedDepreciation)})</td>
      </tr>
      <tr class="total">
        <td><strong>Net Property and Equipment</strong></td>
        <td class="amount"><strong>${formatCurrency(data.assets.propertyAndEquipment.netBookValue)}</strong></td>
      </tr>
    </table>
    
    <table style="margin-top: 15px;">
      <tr class="grand-total">
        <td><strong>TOTAL ASSETS</strong></td>
        <td class="amount"><strong>${formatCurrency(data.assets.totalAssets)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">LIABILITIES AND CAPITAL</div>
    
    <table>
      <tr>
        <td colspan="2"><strong>Current Liabilities</strong></td>
      </tr>
      <tr>
        <td class="indent">Profit Tax Payable</td>
        <td class="amount">${formatCurrency(data.liabilities.currentLiabilities.profitTaxPayable)}</td>
      </tr>
      <tr>
        <td class="indent">VAT Payable</td>
        <td class="amount">${formatCurrency(data.liabilities.currentLiabilities.vatPayable)}</td>
      </tr>
      <tr>
        <td class="indent">Other Payables</td>
        <td class="amount">${formatCurrency(data.liabilities.currentLiabilities.otherPayables)}</td>
      </tr>
      <tr class="total">
        <td><strong>Total Current Liabilities</strong></td>
        <td class="amount"><strong>${formatCurrency(data.liabilities.totalCurrentLiabilities)}</strong></td>
      </tr>
    </table>
    
    <table style="margin-top: 15px;">
      <tr>
        <td colspan="2"><strong>Capital</strong></td>
      </tr>
      <tr>
        <td class="indent">Retained Earnings</td>
        <td class="amount">${formatCurrency(data.capital.retainedEarnings)}</td>
      </tr>
      <tr>
        <td class="indent">Net Income (Current Period)</td>
        <td class="amount">${formatCurrency(data.capital.netIncome)}</td>
      </tr>
      <tr class="total">
        <td><strong>Total Capital</strong></td>
        <td class="amount"><strong>${formatCurrency(data.capital.totalCapital)}</strong></td>
      </tr>
    </table>
    
    <table style="margin-top: 15px;">
      <tr class="grand-total">
        <td><strong>TOTAL LIABILITIES & CAPITAL</strong></td>
        <td class="amount"><strong>${formatCurrency(data.totalLiabilitiesAndCapital)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="signature-section">
    <div class="signature-row">
      <div class="signature-box">
        <div class="signature-line">Prepared by: _________________________ Date: ___________</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Approved by: _________________________ Date: ___________</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    Generated by SaaS Reporting System | Page 1 of 1
  </div>
</body>
</html>
  `;
}

// Generate Income Statement HTML
function generateIncomeStatementHTML(reportData: any, tenantName: string, tin: string, period: any): string {
  const data = reportData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18pt; font-weight: bold; }
    .header h2 { margin: 5px 0; font-size: 14pt; color: #555; }
    .header .org-info { margin-top: 10px; font-size: 10pt; }
    .section { margin-top: 20px; }
    .section-title { font-weight: bold; font-size: 12pt; border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 4px 8px; vertical-align: top; }
    .amount { text-align: right; font-family: 'Courier New', monospace; }
    .total { font-weight: bold; border-top: 1px solid #666; }
    .grand-total { font-weight: bold; border-top: 2px solid #333; font-size: 11pt; }
    .indent { padding-left: 20px; }
    .signature-section { margin-top: 50px; page-break-inside: avoid; }
    .signature-row { display: flex; justify-content: space-between; margin-top: 30px; }
    .signature-box { width: 45%; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 9pt; }
    .footer { margin-top: 30px; font-size: 8pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${tenantName}</h1>
    <h2>Income Statement</h2>
    <div class="org-info">
      <div>TIN: ${tin}</div>
      <div>For the period ${formatDate(new Date(period.startDate))} to ${formatDate(new Date(period.endDate))}</div>
      <div>(Tahsas 30, ${period.fiscalYear} E.C.)</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">REVENUES</div>
    <table>
      <tr>
        <td class="indent">Food Sales</td>
        <td class="amount">${formatCurrency(data.revenues.foodSales)}</td>
      </tr>
      <tr>
        <td class="indent">Drink Sales</td>
        <td class="amount">${formatCurrency(data.revenues.drinkSales)}</td>
      </tr>
      <tr>
        <td class="indent">Other Revenue</td>
        <td class="amount">${formatCurrency(data.revenues.otherRevenue)}</td>
      </tr>
      <tr class="total">
        <td><strong>Total Revenues</strong></td>
        <td class="amount"><strong>${formatCurrency(data.revenues.totalRevenues)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">COST OF SALES</div>
    <table>
      <tr>
        <td class="indent">Food Materials</td>
        <td class="amount">${formatCurrency(data.costOfSales.foodMaterials)}</td>
      </tr>
      <tr>
        <td class="indent">Beverage Costs</td>
        <td class="amount">${formatCurrency(data.costOfSales.beverageCosts)}</td>
      </tr>
      <tr class="total">
        <td><strong>Total Cost of Sales</strong></td>
        <td class="amount"><strong>${formatCurrency(data.costOfSales.totalCostOfSales)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <table>
      <tr class="grand-total">
        <td><strong>GROSS PROFIT</strong></td>
        <td class="amount"><strong>${formatCurrency(data.grossProfit)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">OPERATING EXPENSES</div>
    <table>
      <tr>
        <td class="indent">Food Materials Expense</td>
        <td class="amount">${formatCurrency(data.expenses.foodMaterialsExpense)}</td>
      </tr>
      <tr>
        <td class="indent">Supplies Expense</td>
        <td class="amount">${formatCurrency(data.expenses.suppliesExpense)}</td>
      </tr>
      <tr>
        <td class="indent">Salaries and Wages</td>
        <td class="amount">${formatCurrency(data.expenses.salariesExpense)}</td>
      </tr>
      <tr>
        <td class="indent">Rent Expense</td>
        <td class="amount">${formatCurrency(data.expenses.rentExpense)}</td>
      </tr>
      <tr>
        <td class="indent">Utilities Expense</td>
        <td class="amount">${formatCurrency(data.expenses.utilitiesExpense)}</td>
      </tr>
      <tr>
        <td class="indent">Depreciation Expense</td>
        <td class="amount">${formatCurrency(data.expenses.depreciationExpense)}</td>
      </tr>
      <tr>
        <td class="indent">Other Expenses</td>
        <td class="amount">${formatCurrency(data.expenses.otherExpenses)}</td>
      </tr>
      <tr class="total">
        <td><strong>Total Operating Expenses</strong></td>
        <td class="amount"><strong>${formatCurrency(data.expenses.totalExpenses)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <table>
      <tr class="grand-total">
        <td><strong>NET INCOME BEFORE TAX</strong></td>
        <td class="amount"><strong>${formatCurrency(data.netIncomeBeforeTax)}</strong></td>
      </tr>
      <tr>
        <td class="indent">Profit Tax (30%)</td>
        <td class="amount">${formatCurrency(data.profitTax)}</td>
      </tr>
      <tr class="grand-total" style="font-size: 12pt;">
        <td><strong>NET INCOME AFTER TAX</strong></td>
        <td class="amount"><strong>${formatCurrency(data.netIncomeAfterTax)}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="signature-section">
    <div class="signature-row">
      <div class="signature-box">
        <div class="signature-line">Prepared by: _________________________ Date: ___________</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Approved by: _________________________ Date: ___________</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    Generated by SaaS Reporting System | Page 1 of 1
  </div>
</body>
</html>
  `;
}

// Generate PDF from report
export async function generateReportPDF(
  context: TenantContext,
  reportId: string
): Promise<{ pdfBuffer: Buffer; fileName: string }> {
  await connectDB();
  
  // Get report data
  const reportsCollection = getTenantCollection(context, 'reports');
  const report = await reportsCollection.findOne({ reportId });
  
  if (!report) {
    throw new Error('Report not found');
  }
  
  // Get tenant info
  const { Tenant } = await import('./models/platform');
  const tenant = await Tenant.findOne({ tenantId: context.tenantId });
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  // Generate HTML based on report type
  let html: string;
  switch (report.reportType) {
    case 'balance_sheet':
      html = generateBalanceSheetHTML(report.data, tenant.organizationName, tenant.registration.tin, report.period);
      break;
    case 'income_statement':
      html = generateIncomeStatementHTML(report.data, tenant.organizationName, tenant.registration.tin, report.period);
      break;
    default:
      throw new Error(`PDF generation not yet implemented for report type: ${report.reportType}`);
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
    });
    
    // Generate filename
    const fileName = `${report.reportType}_${report.period.fiscalYear}_${reportId}.pdf`;
    
    return { pdfBuffer, fileName };
  } finally {
    await browser.close();
  }
}

// Upload PDF to storage (placeholder - implement with your storage solution)
export async function uploadPDF(
  pdfBuffer: Buffer,
  fileName: string,
  tenantId: string
): Promise<string> {
  // This is a placeholder - implement with Vercel Blob, AWS S3, or your preferred storage
  // For now, return a mock URL
  return `https://storage.example.com/${tenantId}/${fileName}`;
}
