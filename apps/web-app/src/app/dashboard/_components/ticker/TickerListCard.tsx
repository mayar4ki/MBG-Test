import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Area, AreaChart } from 'recharts';
import { computeChange, formatPrice } from '~/_utils';

import type { LiveTicker } from '~/_types';

type Props = {
  tickers: LiveTicker[];
  selectedTicker: LiveTicker;
  onSelect: (symbol: string) => void;
  chartGradientId: string;
};

export const TickerListCard = ({ tickers, selectedTicker, onSelect, chartGradientId }: Props) => {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Tickers</CardTitle>
            <CardDescription>Live updates on your mock watchlist.</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
            streaming
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="divide-y">
        {tickers.map((ticker) => {
          const { delta, deltaPct } = computeChange(ticker.price, ticker.previousClose);
          const isActive = ticker.symbol === selectedTicker.symbol;

          return (
            <button
              key={ticker.symbol}
              type="button"
              onClick={() => onSelect(ticker.symbol)}
              className={`flex w-full items-center justify-between gap-3 px-2 py-3 text-left transition hover:bg-muted/60 ${isActive ? 'rounded-lg bg-primary/5 ring-1 ring-primary/30' : ''
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {ticker.symbol.slice(0, 3)}
                </div>
                <div>
                  <p className="font-semibold">{ticker.symbol}</p>
                  <p className="text-xs text-muted-foreground">{ticker.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <AreaChart data={ticker.history.slice(-12)} width={112} height={48}>
                    <defs>
                      <linearGradient id={`${chartGradientId}-${ticker.symbol}`} x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={delta >= 0 ? 'rgb(16 185 129)' : 'rgb(244 63 94)'}
                          stopOpacity={0.25}
                        />
                        <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={delta >= 0 ? '#10b981' : '#f43f5e'}
                      fill={`url(#${chartGradientId}-${ticker.symbol})`}
                      strokeWidth={2}
                    />
                  </AreaChart>

                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(ticker.price)}</p>
                  <p className={`text-xs ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {delta >= 0 ? '+' : ''}
                    {delta} ({deltaPct}%)
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
