import { io, type Socket } from 'socket.io-client';
import type { LiveTicker, PriceAlert, TickerPriceUpdate } from '~/_types';
import { env } from '~/env';
import { tokenService } from './auth/tokenService';

type TickerSocketHandlers = {
  onInit?: (payload: LiveTicker[]) => void;
  onUpdate?: (payload: TickerPriceUpdate[]) => void;
  onAlert?: (payload: PriceAlert) => void;
};

let socket: Socket | null = null;
let subscribers = 0;

const ensureSocket = () => {
  if (socket) return socket;

  const token = tokenService.getToken();
  if (!token) {
    throw new Error('Cannot connect to ticker socket without an access token. Please log in first.');
  }

  socket = io(`${env.NEXT_PUBLIC_SOKCET_GETWAY_URL}/ws/tickers`, {
    transports: ['websocket'],
    auth: { token },
  });
  return socket;
};

/**
 * Subscribe to ticker feed using a singleton socket. Cleans up listeners and disconnects
 * when the last subscriber unsubscribes.
 */
export const subscribeToTickerSocket = (handlers: TickerSocketHandlers) => {
  let client: Socket;
  try {
    client = ensureSocket();
  } catch (error) {
    console.warn(error instanceof Error ? error.message : 'Failed to create ticker socket');
    return () => {};
  }

  subscribers += 1;

  if (handlers.onInit) client.on('tickers:init', handlers.onInit);
  if (handlers.onUpdate) client.on('tickers:update', handlers.onUpdate);
  if (handlers.onAlert) client.on('tickers:alert', handlers.onAlert);

  return () => {
    if (!socket) return;

    if (handlers.onInit) socket.off('tickers:init', handlers.onInit);
    if (handlers.onUpdate) socket.off('tickers:update', handlers.onUpdate);
    if (handlers.onAlert) socket.off('tickers:alert', handlers.onAlert);

    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) {
      socket.disconnect();
      socket = null;
    }
  };
};
