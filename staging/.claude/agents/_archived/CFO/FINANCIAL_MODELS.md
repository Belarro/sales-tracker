# CFO Agent Financial Modeling Frameworks

## Comprehensive Financial Model Templates

### SaaS Business Model Template
```
=== SAAS FINANCIAL MODEL ===

REVENUE MODEL:
- Monthly Recurring Revenue (MRR) = Active Customers × Average Revenue Per User (ARPU)
- Annual Recurring Revenue (ARR) = MRR × 12
- Net Revenue Retention (NRR) = (Starting ARR + Expansion - Churn) / Starting ARR
- Gross Revenue Retention (GRR) = (Starting ARR - Churn) / Starting ARR

CUSTOMER METRICS:
- Customer Acquisition Cost (CAC) = Sales & Marketing Spend / New Customers Acquired
- Customer Lifetime Value (CLV) = ARPU × Gross Margin % / Monthly Churn Rate
- CLV:CAC Ratio = Customer Lifetime Value / Customer Acquisition Cost
- Payback Period = CAC / (ARPU × Gross Margin %)
- Magic Number = Net New ARR (Quarterly) / Sales & Marketing Spend (Previous Quarter)

UNIT ECONOMICS:
- Gross Margin = (Revenue - Cost of Goods Sold) / Revenue
- Contribution Margin = (Revenue - Variable Costs) / Revenue
- Revenue per Employee = Total Revenue / Total Employees
- ARR per Employee = Annual Recurring Revenue / Total Employees

GROWTH METRICS:
- MRR Growth Rate = (Current MRR - Previous MRR) / Previous MRR
- ARR Growth Rate = (Current ARR - Previous ARR) / Previous ARR
- Customer Growth Rate = (New Customers - Churned Customers) / Previous Customer Count
- Revenue Cohort Analysis = Track revenue retention by customer acquisition cohort
```

### Marketplace Business Model Template
```
=== MARKETPLACE FINANCIAL MODEL ===

REVENUE MODEL:
- Gross Merchandise Value (GMV) = Total Transaction Volume
- Take Rate = Platform Revenue / Gross Merchandise Value
- Net Revenue = GMV × Take Rate
- Repeat Transaction Rate = Returning Customer Transactions / Total Transactions

NETWORK EFFECTS METRICS:
- Supply Side Growth = New Suppliers / Total Suppliers
- Demand Side Growth = New Buyers / Total Buyers
- Liquidity Score = Successful Transactions / Total Attempted Transactions
- Cross-Side Network Density = Average Transactions per Supplier-Buyer Pair

UNIT ECONOMICS:
- Customer Acquisition Cost (CAC) = Marketing Spend / New Customers
- Lifetime Value (LTV) = Average Transaction Value × Transactions per Customer × Gross Margin
- Contribution Margin per Transaction = Transaction Revenue - Variable Costs
- Blended Payback Period = (Supply CAC + Demand CAC) / Monthly Contribution Margin

OPERATIONAL METRICS:
- Order Fulfillment Rate = Completed Orders / Total Orders
- Time to First Transaction = Days from Registration to First Purchase
- Multi-Homing Rate = Suppliers/Buyers Using Multiple Platforms
- Platform Stickiness = Monthly Active Users / Monthly Registered Users
```

### E-commerce Business Model Template
```
=== E-COMMERCE FINANCIAL MODEL ===

REVENUE MODEL:
- Gross Revenue = Units Sold × Average Selling Price
- Net Revenue = Gross Revenue - Returns - Discounts
- Average Order Value (AOV) = Total Revenue / Number of Orders
- Revenue per Visitor = Total Revenue / Website Visitors

CUSTOMER METRICS:
- Customer Acquisition Cost (CAC) = Marketing Spend / New Customers
- Customer Lifetime Value (CLV) = AOV × Purchase Frequency × Gross Margin × Customer Lifespan
- Repeat Purchase Rate = Customers with Multiple Orders / Total Customers
- Customer Retention Rate = Returning Customers / Previous Period Customers

OPERATIONAL METRICS:
- Inventory Turnover = Cost of Goods Sold / Average Inventory Value
- Days Sales Outstanding (DSO) = Accounts Receivable / Daily Sales
- Conversion Rate = Orders / Website Visitors
- Cart Abandonment Rate = (Initiated Checkouts - Completed Orders) / Initiated Checkouts

MARGIN ANALYSIS:
- Gross Margin = (Revenue - COGS) / Revenue
- Contribution Margin = (Revenue - Variable Costs) / Revenue
- EBITDA Margin = EBITDA / Revenue
- Net Margin = Net Income / Revenue
```

## Advanced Financial Modeling Techniques

### Monte Carlo Simulation Framework
```python
# Pseudocode for Monte Carlo Revenue Simulation
def monte_carlo_revenue_simulation(scenarios=10000):
    results = []
    for i in range(scenarios):
        # Sample from probability distributions
        customer_growth = random.normal(base_growth, growth_volatility)
        churn_rate = random.beta(alpha_churn, beta_churn)
        arpu_change = random.normal(arpu_growth, arpu_volatility)
        
        # Calculate scenario outcome
        monthly_revenue = calculate_revenue(customer_growth, churn_rate, arpu_change)
        results.append(monthly_revenue)
    
    # Statistical analysis
    p10 = percentile(results, 10)  # Bear case
    p50 = percentile(results, 50)  # Base case  
    p90 = percentile(results, 90)  # Bull case
    
    return {
        'bear_case': p10,
        'base_case': p50,
        'bull_case': p90,
        'volatility': standard_deviation(results)
    }
```

### Sensitivity Analysis Template
```
=== SENSITIVITY ANALYSIS FRAMEWORK ===

KEY VARIABLES:
1. Customer Acquisition Rate (+/- 25%)
2. Churn Rate (+/- 50%)
3. Average Revenue Per User (+/- 20%)
4. Customer Acquisition Cost (+/- 30%)
5. Gross Margin (+/- 10%)

IMPACT MATRIX:
                -25%    -10%    Base    +10%    +25%
CAC Change      +15%    +6%     0%      -6%     -15%    (Revenue Impact)
Churn Change    -20%    -8%     0%      +8%     +20%    (Revenue Impact)
ARPU Change     -25%    -10%    0%      +10%    +25%    (Revenue Impact)

TORNADO CHART PRIORITY:
1. Churn Rate (Highest Impact)
2. ARPU (High Impact)
3. CAC (Medium Impact)
4. Acquisition Rate (Medium Impact)
5. Gross Margin (Lower Impact)
```

### Cohort Analysis Framework
```
=== CUSTOMER COHORT ANALYSIS ===

COHORT STRUCTURE:
- Cohort Definition: Customers grouped by acquisition month
- Tracking Period: 24 months post-acquisition
- Metrics Tracked: Revenue, Retention, Engagement, Expansion

COHORT METRICS:
Month 0:  100% retention (by definition)
Month 1:  X% retention, $Y revenue per customer
Month 3:  X% retention, $Y revenue per customer
Month 6:  X% retention, $Y revenue per customer
Month 12: X% retention, $Y revenue per customer
Month 24: X% retention, $Y revenue per customer

COHORT INSIGHTS:
- Retention Curves: How long customers stay active
- Revenue Maturation: How revenue per customer evolves
- Seasonal Patterns: Quarterly/annual retention variations
- Product Impact: How product changes affect cohort behavior
- Channel Performance: Acquisition channel impact on lifetime value
```

## Financial Planning Models

### Three-Year Strategic Plan Template
```
=== THREE-YEAR STRATEGIC FINANCIAL PLAN ===

YEAR 1 (BASE BUILDING):
Revenue Target: $X million
Growth Rate: Y% monthly
Team Size: Z employees
Burn Rate: $A per month
Runway: B months

Key Milestones:
- Product-market fit validation
- First significant revenue milestone
- Core team building
- Initial market penetration

YEAR 2 (SCALE PREPARATION):
Revenue Target: $X million (3-5x Year 1)
Growth Rate: Y% monthly
Team Size: Z employees (2-3x Year 1)
Burn Rate: $A per month
Profitability Target: Break-even by end of year

Key Milestones:
- Market expansion
- Product development completion
- Sales team scaling
- Operational efficiency optimization

YEAR 3 (MARKET LEADERSHIP):
Revenue Target: $X million (2-3x Year 2)
Growth Rate: Y% monthly
Team Size: Z employees (1.5-2x Year 2)
Profitability: X% net margin
Market Position: Top 3 in category

Key Milestones:
- Market leadership establishment
- International expansion consideration
- Strategic partnerships
- Exit opportunity preparation
```

### Budget Planning Framework
```
=== ANNUAL BUDGET PLANNING MODEL ===

REVENUE BUDGET:
- Bottom-up: Sales team capacity × quota attainment × deal size
- Top-down: Market size × penetration rate × pricing model
- Cohort-based: Customer retention × expansion × new acquisition
- Scenario Planning: Conservative, base, aggressive cases

EXPENSE BUDGET:
Personnel (60-70% of expenses):
- Engineering: Development team salaries + benefits
- Sales & Marketing: Customer acquisition costs + team costs
- Operations: Support, finance, HR, administrative
- Executive: Leadership team compensation

Non-Personnel (30-40% of expenses):
- Technology: Infrastructure, software, security
- Marketing: Advertising, events, content, PR
- Operations: Office, travel, legal, accounting
- Other: Insurance, miscellaneous, contingency

CASH FLOW PLANNING:
- Monthly cash flow projection
- Seasonal variation consideration
- Payment timing analysis (collections vs. payments)
- Working capital requirements
- Capital expenditure planning
```

## Valuation Models

### Discounted Cash Flow (DCF) Model
```
=== DCF VALUATION MODEL ===

CASH FLOW PROJECTIONS (5 years):
Year 1: Free Cash Flow = EBITDA - CapEx - Working Capital Change
Year 2: FCF with growth rate adjustments
Year 3: FCF with market maturation
Year 4: FCF with competitive pressure
Year 5: FCF with market leadership

TERMINAL VALUE CALCULATION:
Terminal FCF = Year 5 FCF × (1 + Terminal Growth Rate)
Terminal Value = Terminal FCF / (Discount Rate - Terminal Growth Rate)

DISCOUNT RATE CALCULATION:
Risk-free Rate: 10-year Treasury Rate
Market Risk Premium: Historical equity premium
Beta: Company-specific risk adjustment
Cost of Equity = Risk-free Rate + Beta × Market Risk Premium

VALUATION CALCULATION:
Present Value = Sum of Discounted Annual FCF + Discounted Terminal Value
Enterprise Value = Present Value of FCF
Equity Value = Enterprise Value - Net Debt
Per Share Value = Equity Value / Shares Outstanding
```

### Comparable Company Analysis
```
=== COMPARABLE COMPANY VALUATION ===

REVENUE MULTIPLES:
- EV/Revenue (TTM)
- EV/Forward Revenue
- Price/Sales Ratio

PROFITABILITY MULTIPLES:
- EV/EBITDA
- P/E Ratio
- EV/EBIT

GROWTH-ADJUSTED MULTIPLES:
- PEG Ratio (P/E to Growth)
- Revenue Multiple / Growth Rate
- EV/Sales / Growth Rate

COMPARABLE SELECTION CRITERIA:
- Similar business model
- Comparable growth stage
- Similar market focus
- Competitive positioning
- Revenue scale alignment

VALUATION RANGE:
- 25th Percentile (Conservative)
- Median (Base Case)
- 75th Percentile (Optimistic)
- Premium/Discount Justification
```

---

**Model Maintenance**: These financial models should be updated quarterly with actual performance data and annually with market benchmark refreshes to ensure accuracy and relevance.

Last Updated: August 5, 2025