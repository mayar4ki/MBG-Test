import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Progress } from '@acme/ui/progress';
import type { TooltipProps } from 'recharts';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LiveTicker, TickerChange } from '~/_types';
import { formatClockLabel, formatNumber, formatPrice } from '~/_utils';

const PriceTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const labelValue = typeof label === 'number' ? label : Number(label);
  const labelText = Number.isFinite(labelValue) ? formatClockLabel(labelValue) : String(label ?? '');

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{labelText}</p>
      <p className="font-semibold">{formatPrice(Number(payload[0]?.value))}</p>
    </div>
  );
};

export type TickerDetailCardProps = {
  selectedTicker: LiveTicker;
  selectedChange: TickerChange;
  chartGradientId: string;
};

export const TickerDetailCard = ({ selectedTicker, selectedChange, chartGradientId }: TickerDetailCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardDescription className="text-xs uppercase tracking-[0.2em] text-primary">{selectedTicker.sector}</CardDescription>
            <CardTitle className="text-2xl">
              {selectedTicker.symbol} · {selectedTicker.name}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            Updated {formatClockLabel(selectedTicker.lastUpdated)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="text-4xl font-semibold leading-none">
            {formatPrice(selectedTicker.price, selectedTicker.price > 5000)}
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${selectedChange.delta >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}
          >
            {selectedChange.delta >= 0 ? '▲' : '▼'} {selectedChange.delta} ({selectedChange.deltaPct}%)
          </div>
          <div className="text-muted-foreground text-sm">Prev close {formatPrice(selectedTicker.previousClose)}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-[320px] rounded-xl border bg-background/60 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedTicker.history}>
              <defs>
                <linearGradient id={`gradient-${chartGradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatClockLabel(Number(value))}
              />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(Number(value))} width={90} />
              <Tooltip content={<PriceTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#6366f1"
                fill={`url(#gradient-${chartGradientId})`}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-background/60 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Day range</p>
            <div className="mt-2 flex items-center justify-between text-sm font-medium">
              <span>{formatPrice(selectedTicker.dayRange[0])}</span>
              <span>{formatPrice(selectedTicker.dayRange[1])}</span>
            </div>
            <Progress
              className="mt-2 h-1 bg-muted"
              value={Math.min(
                100,
                Math.max(
                  4,
                  ((selectedTicker.price - selectedTicker.dayRange[0]) / (selectedTicker.dayRange[1] - selectedTicker.dayRange[0])) * 100
                )
              )}
            />
          </div>
          <div className="rounded-lg border bg-background/60 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">52w range</p>
            <div className="mt-2 flex items-center justify-between text-sm font-medium">
              <span>{formatPrice(selectedTicker.week52Range[0])}</span>
              <span>{formatPrice(selectedTicker.week52Range[1])}</span>
            </div>
            <Progress
              className="mt-2 h-1 bg-muted *:data-[slot=progress-indicator]:bg-primary/80"
              value={Math.min(
                100,
                Math.max(
                  4,
                  ((selectedTicker.price - selectedTicker.week52Range[0]) /
                    (selectedTicker.week52Range[1] - selectedTicker.week52Range[0])) *
                  100
                )
              )}
            />
          </div>
          <div className="rounded-lg border bg-background/60 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Volume</p>
            <p className="mt-2 text-lg font-semibold">{formatNumber(selectedTicker.volume)}</p>
            <p className="text-xs text-muted-foreground">Mock turnover with light drift</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
