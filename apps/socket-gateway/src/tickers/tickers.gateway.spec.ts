import type { Server } from 'socket.io';
import { TickersGateway } from './tickers.gateway';
import type { PriceAlert, TickerPriceUpdate } from './tickers.service';
import { TickersService } from './tickers.service';

describe('TickersGateway', () => {
  let gateway: TickersGateway;
  let service: jest.Mocked<TickersService>;
  const emit = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    emit.mockClear();

    service = {
      getSnapshot: jest.fn(),
      updateTickers: jest.fn(),
    } as unknown as jest.Mocked<TickersService>;

    gateway = new TickersGateway(service);
    gateway.server = { emit } as unknown as Server;
  });

  afterEach(() => {
    gateway.onModuleDestroy();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('broadcasts the initial snapshot and schedules periodic updates', () => {
    const snapshot = [{ id: '1', symbol: 'TST' }];
    const updates: TickerPriceUpdate[] = [{ id: '1', nextPrice: 110 }];
    const alerts: PriceAlert[] = [
      { symbol: 'TST', previousPrice: 100, nextPrice: 110, changePct: 10, timestamp: 123 },
    ];

    service.getSnapshot.mockReturnValue(snapshot as any);
    service.updateTickers.mockReturnValue({ updates, alerts });

    gateway.afterInit();

    expect(emit).toHaveBeenCalledWith('tickers:init', snapshot);

    emit.mockClear();
    jest.advanceTimersByTime(3500);

    expect(service.updateTickers).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('tickers:update', updates);
    expect(emit).toHaveBeenCalledWith('tickers:alert', alerts[0]);
  });

  it('sends a fresh snapshot to connecting clients', () => {
    const client = { id: 'client-1', emit: jest.fn() };
    const snapshot = [{ id: '2', symbol: 'NEW' }];
    service.getSnapshot.mockReturnValue(snapshot as any);

    gateway.handleConnection(client as any);

    expect(client.emit).toHaveBeenCalledWith('tickers:init', snapshot);
  });

  it('clears the broadcast interval when the module is destroyed', () => {
    const clearSpy = jest.spyOn(global, 'clearInterval');
    service.getSnapshot.mockReturnValue([]);
    service.updateTickers.mockReturnValue({ updates: [], alerts: [] });

    gateway.afterInit();
    const activeInterval = gateway['interval'];

    gateway.onModuleDestroy();

    expect(activeInterval).toBeTruthy();
    expect(clearSpy).toHaveBeenCalledWith(activeInterval as NodeJS.Timeout);
  });
});
