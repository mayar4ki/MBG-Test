import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { TickersService } from './tickers.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws/tickers',
})
export class TickersGateway implements OnGatewayInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TickersGateway.name);
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly tickersService: TickersService) {}

  afterInit() {
    this.logger.log('Ticker gateway initialized');
    this.server.emit('tickers:init', this.tickersService.getSnapshot());

    this.interval = setInterval(() => {
      const payload = this.tickersService.updateTickers();
      this.server.emit('tickers:update', payload);
    }, 3500);
  }

  handleConnection(client: any) {
    this.logger.debug(`Client connected: ${client.id}`);
    client.emit('tickers:init', this.tickersService.getSnapshot());
  }

  handleDisconnect(client: any) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
