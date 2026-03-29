# LOGISIM ◼

**European Logistics Real Estate Portfolio Simulator**

A browser-based strategy game where you build and manage a pan-European logistics real estate portfolio — acquire assets, negotiate leases, deploy capex, develop new sites, and manage disposals across UK, Germany, Poland, France, and more.

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. It auto-detects Vite — just click Deploy
4. Done. Live URL in ~60 seconds.

## How to Play

- **Start**: You begin with 3 logistics assets and €150m cash
- **Each quarter**: Collect rent, watch lease events unfold, then make decisions
- **Acquire**: Buy standing assets — evaluate occupancy, WALT, NIY, condition
- **Develop**: Commit capital to new-build sites with estimated yield on cost
- **Capex**: Upgrade asset condition (C→B→A) to push rents higher
- **Dispose**: Sell assets at 97% GAV (3% transaction cost)
- **Track**: Portfolio GAV, GRI, NOI, NOI Yield, Avg Occupancy, WALT

## Iterating

The entire game logic lives in `src/App.jsx`. To add features:
- Market mechanics (cap rate cycles, demand shifts) → modify `advanceQuarter()`
- New asset types → modify `generateAsset()` / `generateMarketAsset()`
- UI changes → modify the component functions at the bottom of the file

## Built With

- React 18 + Vite
- Zero external UI dependencies
- Inline styles (no CSS framework needed)

## License

MIT
