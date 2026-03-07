import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    generateVatReport,
    generateIncomeStatement,
    generateBalanceSheet,
    generateFinancialRatios
} from '@/lib/accountingEngine';

export async function GET(request: Request) {
    try {
        const session = await auth();

        // Auth Check
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized. Please login to a tenant account.' }, { status: 401 });
        }

        const tenantId = session.user.tenantId as string;

        // Optional date filtering from query params
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        const startDate = startDateParam ? new Date(startDateParam) : undefined;
        const endDate = endDateParam ? new Date(endDateParam) : undefined;

        // Run engine calculations in parallel
        const [vatReport, incomeStatement, balanceSheet, financialRatios] = await Promise.all([
            generateVatReport(tenantId, startDate, endDate),
            generateIncomeStatement(tenantId, startDate, endDate),
            generateBalanceSheet(tenantId),
            generateFinancialRatios(tenantId, startDate, endDate)
        ]);

        // Return the "Final Accountant-Style Report" payload
        return NextResponse.json({
            success: true,
            data: {
                vatDeclaration: vatReport,
                incomeStatement: incomeStatement,
                balanceSheet: balanceSheet,
                financialRatios: financialRatios
            }
        });

    } catch (error: any) {
        console.error('Error generating financial reports:', error);

        // Handle strict Ethiopian accounting validation errors gracefully
        if (error.message && error.message.includes('Reconciliation Error')) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
