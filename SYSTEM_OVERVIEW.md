# Hotel Accounting System - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (Browser)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Purchases   │  │    Sales     │  │   Expenses   │      │
│  │     Tab      │  │     Tab      │  │     Tab      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Final Report Tab                        │    │
│  │  • Income Statement                                  │    │
│  │  • Capital & Assets Statement                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GET  /api/hotel-accounting  → Load saved records           │
│  POST /api/hotel-accounting  → Create new record            │
│  PUT  /api/hotel-accounting  → Update existing record       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collection: hotelaccountings                                │
│  • Tenant-isolated data                                      │
│  • Purchases, Sales, Expenses                                │
│  • Capital & Asset information                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Input Flow
```
User Input → Component State → API Request → Database
```

### 2. Calculation Flow
```
Purchases + Sales + Expenses → Automatic Calculations → Display Results
```

### 3. Save Flow
```
Current State → API POST/PUT → MongoDB → Confirmation
```

### 4. Load Flow
```
Page Load → API GET → MongoDB → Populate State → Display
```

## Screen Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Hotel Accounting System          [Save Data] [Export]        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Purchases] [Sales] [Expenses] [Final Report]  ← Tabs        │
│  ═══════════                                                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Input Form:                                              │ │
│  │  ┌──────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐        │ │
│  │  │Item Name │ │ Unit │ │ Quantity │ │Unit Cost │ [Add]  │ │
│  │  └──────────┘ └──────┘ └──────────┘ └──────────┘        │ │
│  │                                                            │ │
│  │  Data Table:                                              │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Item    │ Unit │ Qty  │ Cost  │ Total            │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ Meat    │ kg   │ 10   │ 200   │ 2,000 ETB       │  │ │
│  │  │ Veg     │ kg   │ 5    │ 50    │ 250 ETB         │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │                    Total: 2,250 ETB                │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Calculation Engine

### Income Statement Calculations
```
┌─────────────────────────────────────────┐
│ Total Sales Revenue                     │
│ (Sum of all sales)                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ - Cost of Goods Sold                    │
│   (Sum of all purchases)                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ = Gross Profit                          │
│   (Sales - COGS)                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ - Operating Expenses                    │
│   (Sum of all expenses)                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ = Net Profit                            │
│   (Gross Profit - Expenses)             │
└─────────────────────────────────────────┘
```

### Capital Calculations
```
┌─────────────────────────────────────────┐
│ Opening Capital                         │
│ (User input)                            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ + Net Profit                            │
│   (From Income Statement)               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ = Closing Capital                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ + Total Liabilities                     │
│   (Payables + Loans)                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ = Total Capital                         │
└─────────────────────────────────────────┘
```

## User Journey

### First Time User
```
1. Login to system
   ↓
2. Navigate to Dashboard
   ↓
3. Click "Hotel Accounting" in sidebar
   ↓
4. See empty form (no previous data)
   ↓
5. Enter purchases in Purchases tab
   ↓
6. Enter sales in Sales tab
   ↓
7. Enter expenses in Expenses tab
   ↓
8. View Final Report tab
   ↓
9. Enter capital/asset information
   ↓
10. Click "Save Data"
    ↓
11. Data saved to database
```

### Returning User
```
1. Login to system
   ↓
2. Navigate to "Hotel Accounting"
   ↓
3. Previous data automatically loaded
   ↓
4. Add new entries or modify
   ↓
5. View updated calculations
   ↓
6. Click "Save Data" to update
   ↓
7. Export report if needed
```

## Component Hierarchy

```
HotelAccounting (Main Component)
│
├── State Management
│   ├── purchases[]
│   ├── sales[]
│   ├── expenses[]
│   ├── capital{}
│   └── activeTab
│
├── Tab Navigation
│   ├── Purchases Tab
│   ├── Sales Tab
│   ├── Expenses Tab
│   └── Final Report Tab
│
├── Purchases Tab
│   ├── Input Form
│   ├── Data Table
│   └── Total Summary
│
├── Sales Tab
│   ├── Input Form
│   ├── Data Table
│   └── Total Summary
│
├── Expenses Tab
│   ├── Category Dropdown
│   ├── Amount Input
│   ├── Data Table
│   └── Total Summary
│
└── Final Report Tab
    ├── Income Statement
    │   ├── Sales Revenue
    │   ├── COGS
    │   ├── Gross Profit
    │   ├── Expenses
    │   └── Net Profit
    │
    └── Capital & Assets
        ├── Capital Inputs
        ├── Asset Inputs
        ├── Liability Inputs
        └── Calculated Totals
```

## API Endpoints Detail

### GET /api/hotel-accounting
```
Request:
  Headers: x-tenant-id (optional)

Response:
  {
    success: true,
    data: [
      {
        _id: "...",
        tenant: "...",
        purchases: [...],
        sales: [...],
        expenses: [...],
        capital: {...},
        createdAt: "...",
        updatedAt: "..."
      }
    ]
  }
```

### POST /api/hotel-accounting
```
Request:
  Headers: x-tenant-id (optional)
  Body: {
    purchases: [...],
    sales: [...],
    expenses: [...],
    capital: {...}
  }

Response:
  {
    success: true,
    data: {
      _id: "...",
      ...saved data
    }
  }
```

### PUT /api/hotel-accounting
```
Request:
  Body: {
    id: "record_id",
    purchases: [...],
    sales: [...],
    expenses: [...],
    capital: {...}
  }

Response:
  {
    success: true,
    data: {
      _id: "...",
      ...updated data
    }
  }
```

## Security Features

```
┌─────────────────────────────────────────┐
│ Authentication (NextAuth)               │
│ • User must be logged in                │
│ • Session validation                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Tenant Isolation                        │
│ • Data filtered by tenant ID            │
│ • No cross-tenant access                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ API Security                            │
│ • CORS headers configured               │
│ • Input validation                      │
│ • Error handling                        │
└─────────────────────────────────────────┘
```

## Performance Considerations

### Client-Side
- React state management for instant UI updates
- Calculations performed in real-time
- No page reloads needed

### Server-Side
- Efficient MongoDB queries
- Indexed tenant field for fast lookups
- Minimal data transfer

### Database
- Single collection for hotel accounting
- Embedded documents for related data
- Automatic timestamps

## Responsive Design

The system uses inline styles that adapt to different screen sizes:
- Desktop: Full layout with side-by-side forms
- Tablet: Stacked forms with full width
- Mobile: Single column layout (future enhancement)

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Clear labels for all inputs
- Color contrast compliance
- Screen reader friendly

## Maintenance

### Regular Tasks
- Database backup (weekly)
- Monitor API performance
- Review error logs
- Update dependencies

### Monitoring Points
- API response times
- Database query performance
- User error rates
- Data integrity checks

## Conclusion

The Hotel Accounting System provides a complete, integrated solution for hotel financial management with:
- ✅ Intuitive user interface
- ✅ Automated calculations
- ✅ Secure data storage
- ✅ Export capabilities
- ✅ Multi-tenant support
- ✅ Real-time updates
