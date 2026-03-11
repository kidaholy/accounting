# Comprehensive Accounting System - User Guide

## Overview
This is a complete accounting system designed for Ethiopian businesses including hotels, restaurants, retail stores, and service companies. It automates financial calculations, tracks inventory, manages fixed assets, and generates compliance reports.

## Core Features

### 1. Stock Inventory Management
**Location:** Dashboard → Management → Stock Inventory

Track all inventory with full CRUD operations:
- **Create**: Add new products with name, unit, quantity, and cost
- **Read**: View all inventory items with real-time totals
- **Update**: Edit quantities and costs inline
- **Delete**: Remove items from inventory

**Features:**
- Real-time inventory valuation
- Unit of measurement tracking (kg, pcs, liters, etc.)
- Automatic total cost calculation
- Optimistic UI updates for fast performance

**Example Usage:**
```
Product: Coffee Beans
Unit: kg
Quantity: 50
Unit Cost: 250 ETB
Total Value: 12,500 ETB
```

### 2. Fixed Assets Schedule
**Location:** Dashboard → Management → Fixed Assets

Complete fixed asset management with depreciation tracking:
- **Create**: Add new assets with depreciation rates
- **Read**: View cost and depreciation schedules
- **Update**: Modify asset values and depreciation
- **Delete**: Remove disposed assets

**Features:**
- Cost analysis (beginning, additions, ending)
- Depreciation schedule (accumulated, current year)
- Net Book Value (NBV) calculations
- Multiple depreciation rates (5%-30%)

**Asset Categories:**
- Buildings (5%)
- Furniture & Fixtures (10%)
- Vehicles (15%)
- Equipment (20%)
- Computers & Electronics (25%)
- Software (30%)

### 3. Transaction Recording
**Location:** Dashboard → Transactions

Record all business transactions:

#### Sales Recording
- Record revenue from sales
- Track by category (Food, Beverage, Services, etc.)
- Automatic VAT calculation
- Quantity and unit price tracking

#### Purchase Entries
- Record inventory purchases
- Track supplier costs
- Automatic COGS calculation
- VAT input tracking

#### Expense Management
- Payroll & Salaries
- Utilities & Service Fees
- Rent & Lease payments
- Marketing & Advertising
- General operating expenses

### 4. Financial Reports
**Location:** Dashboard → Financial Control → Audited Statements

Automated financial statement generation:

#### Income Statement
- **Revenue**: Total sales by category
- **Cost of Goods Sold**: Opening inventory + Purchases - Ending inventory
- **Gross Profit**: Revenue - COGS
- **Operating Expenses**: All expense categories
- **Net Income**: Gross Profit - Operating Expenses

#### Balance Sheet
- **Assets**: Cash, Receivables, Inventory, Fixed Assets
- **Liabilities**: Payables, Loans, VAT Payable
- **Equity**: Capital + Retained Earnings

#### Trial Balance
- Complete double-entry verification
- Debit and credit totals
- Account-by-account breakdown

#### Financial Ratios
- Gross Profit Margin
- Net Profit Margin
- Return on Assets (ROA)
- Debt Ratio

### 5. VAT Declaration
**Location:** Dashboard → Financial Control → VAT Returns

Ethiopian VAT compliance reporting:
- **Box 5**: Taxable Sales & Output VAT (15%)
- **Box 10**: Taxable Purchases & Input VAT (15%)
- **Box 15**: Net VAT Payable/Refundable
- Automatic reconciliation with accounting equation
- Period-based reporting

### 6. Category Management
**Location:** Dashboard → Management → Sales Items

Manage transaction categories:
- Create custom categories for sales, purchases, and expenses
- Assign account codes
- Organize by type
- Delete unused categories

## Complete Workflow

### Daily Operations

#### 1. Record Sales
```
Navigate to: Transactions → Sales Recording
1. Select date
2. Choose category (e.g., "Food Sales")
3. Enter quantity and unit price
4. System calculates total and VAT
5. Click "Record Transaction"
```

#### 2. Record Purchases
```
Navigate to: Transactions → Purchase Entries
1. Select date
2. Choose category (e.g., "Raw Materials")
3. Enter quantity and unit price
4. System calculates total and VAT
5. Click "Record Transaction"
```

#### 3. Record Expenses
```
Navigate to: Transactions → General Expenses
1. Select date
2. Choose expense category
3. Enter amount
4. Add description
5. Click "Record Transaction"
```

#### 4. Update Inventory
```
Navigate to: Management → Stock Inventory
1. Click "Add Product" for new items
2. Edit quantities inline for existing items
3. System automatically updates inventory value
```

### Monthly Operations

#### 1. Review Financial Statements
```
Navigate to: Financial Control → Audited Statements
- Review Income Statement
- Check Balance Sheet
- Verify Trial Balance
- Analyze Financial Ratios
```

#### 2. Prepare VAT Return
```
Navigate to: Financial Control → VAT Returns
1. Select reporting period
2. Review calculated VAT amounts
3. Verify against transactions
4. Export for submission
```

#### 3. Update Fixed Assets
```
Navigate to: Management → Fixed Assets
1. Add new asset acquisitions
2. Update depreciation
3. Remove disposed assets
4. Review Net Book Values
```

### Year-End Operations

#### 1. Depreciation Calculation
```
Navigate to: Management → Fixed Assets
1. Review all assets
2. Calculate annual depreciation
3. Update accumulated depreciation
4. Record depreciation expense
```

#### 2. Inventory Valuation
```
Navigate to: Management → Stock Inventory
1. Physical count verification
2. Update quantities
3. Adjust unit costs if needed
4. Record inventory adjustments
```

#### 3. Financial Close
```
Navigate to: Financial Control → Audited Statements
1. Review all accounts
2. Verify accounting equation balance
3. Generate annual reports
4. Export for audit
```

## Key Calculations

### Income Statement Formula
```
Revenue (Sales)
- Cost of Goods Sold (Opening Inventory + Purchases - Ending Inventory)
= Gross Profit
- Operating Expenses
= Net Income
```

### Balance Sheet Formula
```
Assets = Liabilities + Equity + Net Income
```

### VAT Calculation
```
Output VAT = Sales × 15%
Input VAT = Purchases × 15%
Net VAT Payable = Output VAT - Input VAT
```

### Depreciation Calculation
```
Annual Depreciation = Asset Cost × Depreciation Rate
Accumulated Depreciation = Beginning + Current Year
Net Book Value = Cost - Accumulated Depreciation
```

## Business Type Examples

### Hotel/Restaurant
**Daily:**
- Record room sales and restaurant revenue
- Track food and beverage purchases
- Record utility and staff expenses

**Monthly:**
- Review food cost percentage
- Analyze occupancy revenue
- Calculate labor cost ratio

### Retail Store
**Daily:**
- Record product sales
- Track inventory purchases
- Monitor stock levels

**Monthly:**
- Calculate inventory turnover
- Review gross margin
- Analyze sales trends

### Service Company
**Daily:**
- Record service revenue
- Track project expenses
- Monitor accounts receivable

**Monthly:**
- Review profitability by service
- Calculate utilization rates
- Analyze expense ratios

## Tips for Accurate Accounting

1. **Daily Entry**: Record transactions daily for accuracy
2. **Categorize Properly**: Use correct categories for all transactions
3. **Reconcile Regularly**: Check that accounting equation balances
4. **Update Inventory**: Keep stock levels current
5. **Review Reports**: Check financial statements monthly
6. **Backup Data**: System auto-saves, but export reports regularly
7. **VAT Compliance**: Submit VAT returns on time
8. **Asset Tracking**: Update fixed assets when acquired or disposed

## Security & Access Control

### User Roles
- **Super Admin**: Full system access, tenant management
- **Tenant Admin**: Organization settings, user management
- **Accountant**: Full accounting operations
- **Viewer**: Read-only access to reports

### Data Isolation
- Multi-tenant architecture
- Each organization's data is completely isolated
- No cross-tenant access possible

## Technical Features

### Real-time Calculations
- All totals update instantly
- No page reloads needed
- Optimistic UI updates

### Data Persistence
- Automatic saving to MongoDB
- Transaction history preserved
- Audit trail maintained

### Compliance
- Ethiopian accounting standards
- VAT regulations (15% rate)
- Double-entry bookkeeping
- Accounting equation validation

## Support & Troubleshooting

### Common Issues

**Data Not Saving**
- Check internet connection
- Verify you're logged in
- Check browser console for errors

**Calculations Seem Wrong**
- Verify all inputs are correct
- Check transaction categories
- Review accounting equation balance

**Can't Access Features**
- Check your user role permissions
- Contact your administrator
- Verify subscription status

### Getting Help
- Review this guide
- Check the Quick Start guide
- Contact system administrator
- Review error messages in reports

## Conclusion

This comprehensive accounting system provides everything needed for complete financial management:
- ✅ Full CRUD operations on all entities
- ✅ Automated financial calculations
- ✅ Ethiopian VAT compliance
- ✅ Multi-tenant security
- ✅ Real-time reporting
- ✅ Audit trail
- ✅ Export capabilities

The system is suitable for hotels, restaurants, retail stores, service companies, and any Ethiopian business requiring professional accounting software.
