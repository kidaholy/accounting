# Quick Start Guide - Hotel Accounting System

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Make sure your MongoDB connection is configured in `.env`:
```
MONGODB_URI=your_mongodb_connection_string
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the System
Open your browser and navigate to:
```
http://localhost:3000
```

## First Time Usage

### Login
1. Go to `/login`
2. Use your credentials to log in
3. You'll be redirected to the dashboard

### Access Hotel Accounting
1. From the dashboard, look for "Transactions" section in the sidebar
2. Click on "Hotel Accounting"
3. You'll see four tabs: Purchases, Sales, Expenses, and Final Report

## Quick Example

### Record a Simple Day's Transactions

#### 1. Add Purchases (Purchases Tab)
```
Item: Meat
Unit: kg
Quantity: 10
Unit Cost: 200
→ Click "Add Purchase"

Item: Vegetables  
Unit: kg
Quantity: 5
Unit Cost: 50
→ Click "Add Purchase"
```

#### 2. Add Sales (Sales Tab)
```
Item: Room Service
Quantity: 5
Unit Price: 800
→ Click "Add Sale"

Item: Restaurant
Quantity: 20
Unit Price: 150
→ Click "Add Sale"
```

#### 3. Add Expenses (Expenses Tab)
```
Category: Salaries & Wages
Amount: 2000
→ Click "Add Expense"

Category: Utilities
Amount: 300
→ Click "Add Expense"
```

#### 4. View Report (Final Report Tab)
- See your Income Statement with automatic calculations
- Enter your capital and asset information
- View complete financial summary

#### 5. Save Your Work
Click the "Save Data" button at the top right

## Key Features

✅ **Automatic Calculations** - No manual math needed
✅ **Real-time Updates** - See totals instantly
✅ **Data Persistence** - All data saved to database
✅ **Export Reports** - Download JSON backups
✅ **Multi-tenant Support** - Isolated data per organization

## Common Tasks

### View Previous Records
The system automatically loads your most recent saved record when you open it.

### Edit Entries
Currently, you can add new entries. To modify, you'll need to re-enter the data.

### Generate Reports
Navigate to the "Final Report" tab to see:
- Income Statement
- Capital & Assets Statement
- All calculations done automatically

### Export Data
Click "Export" button to download a JSON file with all your data.

## Troubleshooting

### Data Not Saving
- Check your internet connection
- Ensure you're logged in
- Check browser console for errors

### Calculations Seem Wrong
- Verify all quantities and prices are entered correctly
- Check that you're in the correct tab
- Refresh the page and try again

### Can't See Hotel Accounting
- Make sure you're logged in
- Check that your user role has access
- Contact your administrator

## Next Steps

1. ✅ Record your daily transactions
2. ✅ Review the automated reports
3. ✅ Save your data regularly
4. ✅ Export backups weekly
5. ✅ Integrate with your existing accounting workflow

## Need Help?

Refer to the complete `HOTEL_ACCOUNTING_GUIDE.md` for detailed instructions and examples.
