import { TickersService, type LiveTicker } from './tickers.service';

const baseTicker: LiveTicker = {
  symbol: 'TEST',
  name: 'Test Corp',
  sector: 'Mock',
  price: 100,
  previousClose: 99,
  volume: 1_000_000,
  dayRange: [95, 105],
  week52Range: [90, 140],
  history: Array.from({ length: 24 }).map((_, idx) => ({
    time: `0${idx}:00`,
    price: 100,
  })),
  lastUpdated: Date.now(),
};

describe('TickersService', () => {
  let service: TickersService;

  beforeEach(() => {
    service = new TickersService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates tickers with positive drift and preserves history length', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.9);
    // narrow to one ticker for deterministic expectations
    (service as any).tickers = [{ ...baseTicker }];

    const [updated] = service.updateTickers();

    expect(updated.price).toBeGreaterThan(baseTicker.price);
    expect(updated.history).toHaveLength(24);
    expect(updated.history.at(-1)?.price).toBe(updated.price);
    expect(updated.lastUpdated).toBeGreaterThan(baseTicker.lastUpdated);
  });

  it('handles negative movement, updates lows, and keeps volume positive', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.0);
    (service as any).tickers = [{ ...baseTicker }];

    const [updated] = service.updateTickers();

    expect(updated.price).toBeLessThan(baseTicker.price);
    expect(updated.dayRange[0]).toBeLessThanOrEqual(updated.price);
    expect(updated.dayRange[0]).toBeLessThanOrEqual(baseTicker.dayRange[0]);
    expect(updated.price).toBeGreaterThanOrEqual(updated.week52Range[0] * 0.85);
    expect(updated.volume).toBeGreaterThan(0);
  });
});
