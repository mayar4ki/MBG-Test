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

const PRICE_ALERT_THRESHOLD = 0.05; // 2%

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
    const baseVolatility = 0.012 + Math.random() * 0.01; // 1.2% - 2.2% swings
    const directionBias = Math.random() - 0.5;
    const movement = directionBias * ticker.price * baseVolatility;
    const shock = this.generateShock(ticker.price);

    const rawPrice = ticker.price + movement + shock;
    const floor = ticker.week52Range[0] * 0.85;

    return Number(Math.max(floor, rawPrice).toFixed(2));
  }

  private generateShock(price: number): number {
    const shockProbability = 0.1;
    if (Math.random() >= shockProbability) return 0;
    return (Math.random() - 0.5) * price * 0.035; /* up to ~3.5% */
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
    const history = [...ticker.history.slice(-23), { time: formatClockLabel(), price: nextPrice }];
    const dayHigh = Math.max(ticker.dayRange[1], nextPrice);
    const dayLow = Math.min(ticker.dayRange[0], nextPrice);
    const volumeDrift = Math.round(ticker.volume * (1 + (Math.random() - 0.5) * 0.04));

    return {
      ...ticker,
      price: nextPrice,
      dayRange: [dayLow, dayHigh],
      history,
      volume: Math.max(volumeDrift, 0),
      lastUpdated: Date.now(),
    };
  }
}
