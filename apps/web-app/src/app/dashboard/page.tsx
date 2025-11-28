'use client';

import { toast } from '@acme/ui/sonner';
import { useEffect, useId, useMemo, useState } from 'react';
import { computeChange } from '~/_utils';
import { TickerDetailCard } from '~/app/dashboard/_components/ticker/TickerDetailCard';
import { TickerHeroCard } from '~/app/dashboard/_components/ticker/TickerHeroCard';
import { TickerListCard } from '~/app/dashboard/_components/ticker/TickerListCard';
import { useAlertSound } from '~/app/dashboard/_hooks/useAlertSound';
import { useTickers } from '~/app/dashboard/_hooks/useTickers';
import { subscribeToTickerSocket } from '~/services/tickerSocket';

import type { PriceAlert } from '~/_types';

export default function Page() {
  const { tickers, setInitialTickers, applyUpdates } = useTickers();
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const chartGradientId = useId();
  const playAlertSound = useAlertSound();

  const selectedTicker = useMemo(
    () => tickers.find((ticker) => ticker.symbol === selectedSymbol) ?? tickers[0],
    [selectedSymbol, tickers]
  );

  const selectedChange = selectedTicker ? computeChange(selectedTicker.price, selectedTicker.previousClose) : undefined;

  useEffect(() => {
    const cleanup = subscribeToTickerSocket({
      onInit: (payload) => {
        setInitialTickers(payload);
        setSelectedSymbol((current) => current || (payload[0]?.symbol ?? ''));
      },
      onUpdate: applyUpdates,
      onAlert: ({ symbol, changePct, previousPrice, nextPrice }: PriceAlert) => {
        toast.info(`${symbol} price jumped ${changePct}%`, {
          description: `$${previousPrice.toFixed(2)} -> $${nextPrice.toFixed(2)}`,
          action: {
            label: 'close',
            onClick: () => { },
          },
        });
        playAlertSound();
      },
    });

    return cleanup;
  }, [applyUpdates, setInitialTickers]);

  if (!selectedTicker || !selectedChange) {
    return (
      <div className="p-4 md:p-6 flex-1">
        <div className="grid place-items-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
          <div className="space-y-3">
            <p className="text-lg font-semibold">Connecting to live feed...</p>
            <p className="text-sm text-muted-foreground">
              Waiting for ticker data from the backend socket. Please keep this page open.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="space-y-6">
        <TickerHeroCard selectedTicker={selectedTicker} selectedChange={selectedChange} />
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <TickerListCard
            tickers={tickers}
            selectedTicker={selectedTicker}
            onSelect={setSelectedSymbol}
            chartGradientId={chartGradientId}
          />
          <TickerDetailCard selectedTicker={selectedTicker} selectedChange={selectedChange} chartGradientId={chartGradientId} />
        </div>
      </div>
    </div>
  );
}
