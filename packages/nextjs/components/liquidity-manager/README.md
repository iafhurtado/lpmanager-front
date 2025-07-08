# Liquidity Manager Components

This directory contains all the components for the liquidity manager dashboard.

## Components

### PriceChart.tsx
Displays a real-time price chart with liquidity bounds overlaid.
- Shows current price movement
- Displays lower and upper tick bounds
- Updates every 15 seconds
- Uses mock data (replace with real charting library)

### LiquidityCards.tsx
Shows deployed and idle liquidity amounts for both tokens.
- Deployed liquidity cards (green theme)
- Idle liquidity cards (yellow theme)
- Total summary with percentages
- Updates every 15 seconds

### PriceMetrics.tsx
Displays oracle price, pool market price, and price difference.
- Oracle price card (blue theme)
- Pool market price card (primary theme)
- Price difference calculation
- Volatility indicator

### AdjustmentHistory.tsx
Shows a table of recent position adjustments.
- Transaction history with timestamps
- Deposit/withdraw badges
- Token amounts and bounds
- Etherscan links

### ContractLinks.tsx
Displays links to all relevant contract addresses.
- LP Token, Pool, Oracle, Manager addresses
- Etherscan links for each contract
- Shortened address display

### TransactionModal.tsx
Modal for deposit and withdraw operations.
- Form for token amounts
- Approval and execution flow
- Success/error states
- Transaction status indicators

## Hooks

### useLiquidityData.ts
Custom hook for fetching liquidity data.
- Returns deployed and idle amounts
- Handles loading and error states
- Polls every 15 seconds

### usePriceData.ts
Custom hook for fetching price data.
- Returns oracle and pool prices
- Calculates price differences
- Determines volatility levels

## Usage

1. Navigate to `/liquidity-manager` in your app
2. Connect your wallet
3. View real-time liquidity data
4. Use Deposit/Withdraw buttons to manage positions

## Customization

### Replacing Mock Data
Replace the mock data in each component with real contract calls:

```typescript
// Example: Replace mock price data
const { data: realPrice } = useScaffoldContractRead({
  contractName: "YourLiquidityManager",
  functionName: "getCurrentPrice",
});
```

### Adding Real Charting
Replace the placeholder chart with a real charting library:

```typescript
// Example with Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Use the priceData state to render the chart
```

### Styling
All components use DaisyUI classes and are fully responsive. Customize by:
- Modifying the `className` props
- Adding custom CSS in `globals.css`
- Using DaisyUI theme customization

## Contract Integration

To integrate with real contracts:

1. Update contract names in `useScaffoldContractRead` calls
2. Replace mock data with actual contract responses
3. Add proper error handling for failed transactions
4. Implement real approval flows for tokens

## Features

- ✅ Real-time data polling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Loading states
- ✅ Error handling
- ✅ Transaction modals
- ✅ Contract links
- ✅ Mobile-first layout 