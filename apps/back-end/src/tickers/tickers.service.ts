import { Injectable } from '@nestjs/common';
import { mockTickers, type Ticker } from './mock-tickers';

export type LiveTicker = Ticker & { lastUpdated: number };

const formatClockLabel = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

@Injectable()
export class TickersService {
  private tickers: LiveTicker[] = mockTickers.map((ticker) => ({
    ...ticker,
    history: ticker.history.map((point) => ({ ...point })),
    lastUpdated: Date.now(),
  }));

  getSnapshot() {
    return this.tickers;
  }

  updateTickers(): LiveTicker[] {
    this.tickers = this.tickers.map((ticker) => {
      const movement = (Math.random() - 0.45) * ticker.price * 0.0035;
      const nextPrice = Number(Math.max(ticker.week52Range[0] * 0.9, ticker.price + movement).toFixed(2));
      const history = [...ticker.history.slice(-23), { time: formatClockLabel(), price: nextPrice }];
      const dayHigh = Math.max(ticker.dayRange[1], nextPrice);
      const dayLow = Math.min(ticker.dayRange[0], nextPrice);

      return {
        ...ticker,
        price: nextPrice,
        dayRange: [dayLow, dayHigh],
        history,
        lastUpdated: Date.now(),
      };
    });

    return this.tickers;
  }
}
