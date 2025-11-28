import { useCallback, useState } from 'react';
import { formatClockLabel } from '~/_utils';
import type { LiveTicker, TickerPriceUpdate } from '~/_types';

export const useTickers = () => {
  const [tickers, setTickers] = useState<LiveTicker[]>([]);

  const setInitialTickers = useCallback((payload: LiveTicker[]) => {
    setTickers(payload);
  }, []);

  const applyUpdates = useCallback((updates: TickerPriceUpdate[]) => {
    if (!updates.length) return;

    setTickers((currentTickers) => {
      if (!currentTickers.length) return currentTickers;

      const nextPriceById = new Map(updates.map(({ id, nextPrice }) => [id, nextPrice]));
      const timestamp = Date.now();

      return currentTickers.map((ticker) => {
        const nextPrice = nextPriceById.get(ticker.id);
        if (nextPrice === undefined) return ticker;

        const history = [...ticker.history.slice(-23), { time: formatClockLabel(timestamp), price: nextPrice }];
        const dayLow = Math.min(ticker.dayRange[0], nextPrice);
        const dayHigh = Math.max(ticker.dayRange[1], nextPrice);
        const volume = Math.max(Math.round(ticker.volume * (1 + (Math.random() - 0.5) * 0.04)), 0);

        return {
          ...ticker,
          price: nextPrice,
          dayRange: [dayLow, dayHigh],
          history,
          volume,
          lastUpdated: timestamp,
        };
      });
    });
  }, []);

  return { tickers, setInitialTickers, applyUpdates };
};
