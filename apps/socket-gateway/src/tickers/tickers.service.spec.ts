import { type LiveTicker, TickersService } from './tickers.service';

describe('TickersService', () => {
  let service: TickersService;
  const now = 1_700_000_000_000;
  const baseTicker: LiveTicker = {
    id: 'TEST-1',
    symbol: 'TST',
    name: 'Test Corp',
    sector: 'Unit Tests',
    price: 100,
    previousClose: 99,
    volume: 1000,
    dayRange: [95, 105],
    week52Range: [80, 120],
    history: [
      { time: now - 10_000, price: 99 },
      { time: now - 5_000, price: 100 },
    ],
    lastUpdated: now - 5_000,
  };

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    service = new TickersService();
    service['tickers'] = [{ ...baseTicker }];
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the current snapshot', () => {
    const snapshot = service.getSnapshot();
    expect(snapshot).toBe(service['tickers']);
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].symbol).toBe('TST');
  });

  it('updates tickers without emitting alerts when the move is below the threshold', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.5).mockReturnValue(0.5);

    const { updates, alerts } = service.updateTickers();

    expect(updates).toEqual([{ id: 'TEST-1', nextPrice: 100 }]);
    expect(alerts).toHaveLength(0);

    const [ticker] = service.getSnapshot();
    expect(ticker.price).toBe(100);
    expect(ticker.history).toHaveLength(3);
    expect(ticker.history.at(-1)?.price).toBe(100);
    expect(ticker.lastUpdated).toBe(now);
  });

  it('emits an alert when price jumps beyond the alert threshold', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.75) // price change up
      .mockReturnValueOnce(0) // shock triggers
      .mockReturnValueOnce(1) // positive shock magnitude
      .mockReturnValue(0.5); // volume adjustment

    const { updates, alerts } = service.updateTickers();

    expect(updates).toEqual([{ id: 'TEST-1', nextPrice: 104.5 }]);
    expect(alerts).toEqual([
      {
        symbol: 'TST',
        previousPrice: 100,
        nextPrice: 104.5,
        changePct: 4.5,
        timestamp: now,
      },
    ]);

    const [ticker] = service.getSnapshot();
    expect(ticker.price).toBe(104.5);
    expect(ticker.history.at(-1)?.price).toBe(104.5);
    expect(ticker.volume).toBe(1000);
  });
});
