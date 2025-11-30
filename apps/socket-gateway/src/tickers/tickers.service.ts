import { Injectable } from '@nestjs/common';
import { mockTickers, type Ticker } from './mock-tickers';

export type LiveTicker = Ticker & { lastUpdated: number };
export type PriceAlert = {
  symbol: string;
  previousPrice: number;
  nextPrice: number;
  changePct: number;
  timestamp: number;
};

export type TickerPriceUpdate = {
  id: string;
  nextPrice: number;
};

const PRICE_ALERT_THRESHOLD = 0.02; // 2% price jump triggers alert
const VOLATILITY = 0.02; // 2% max price swing per tick
const SHOCK_CHANCE = 0.05; // 10% chance of 3.5% spike

const formatClockLabel = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

@Injectable()
export class TickersService {
  private tickers: LiveTicker[] = mockTickers.map((ticker) => ({
    ...ticker,
    lastUpdated: Date.now(),
  }));

  getSnapshot() {
    return this.tickers;
  }

  updateTickers(): { updates: TickerPriceUpdate[]; alerts: PriceAlert[] } {
    const alerts: PriceAlert[] = [];
    const updates: TickerPriceUpdate[] = [];

    this.tickers = this.tickers.map((ticker) => {
      const nextPrice = this.generateNextPrice(ticker);
      const alert = this.maybeCreateAlert(ticker, nextPrice);
      if (alert) alerts.push(alert);

      updates.push({ id: ticker.id, nextPrice });

      return this.buildUpdatedTicker(ticker, nextPrice);
    });

    return { updates, alerts };
  }

  private generateNextPrice(ticker: LiveTicker): number {
    const change = (Math.random() - 0.5) * 2 * ticker.price * VOLATILITY;
    const shock = Math.random() < SHOCK_CHANCE ? (Math.random() - 0.5) * ticker.price * 0.07 : 0;
    const floor = ticker.week52Range[0] * 0.85;

    return Number(Math.max(floor, ticker.price + change + shock).toFixed(2));
  }

  private maybeCreateAlert(ticker: LiveTicker, nextPrice: number): PriceAlert | null {
    const thresholdPrice = ticker.price * (1 + PRICE_ALERT_THRESHOLD);
    if (nextPrice <= thresholdPrice) return null;

    const changePct = ((nextPrice - ticker.price) / ticker.price) * 100;
    return {
      symbol: ticker.symbol,
      previousPrice: ticker.price,
      nextPrice,
      changePct: Number(changePct.toFixed(2)),
      timestamp: Date.now(),
    };
  }

  private buildUpdatedTicker(ticker: LiveTicker, nextPrice: number): LiveTicker {
    return {
      ...ticker,
      price: nextPrice,
      dayRange: [Math.min(ticker.dayRange[0], nextPrice), Math.max(ticker.dayRange[1], nextPrice)],
      history: [...ticker.history.slice(-23), { time: formatClockLabel(), price: nextPrice }],
      volume: Math.max(0, Math.round(ticker.volume * (0.98 + Math.random() * 0.04))),
      lastUpdated: Date.now(),
    };
  }
}
