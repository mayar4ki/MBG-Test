import { Module } from '@nestjs/common';
import { TickersGateway } from './tickers.gateway';
import { TickersService } from './tickers.service';

@Module({
  providers: [TickersGateway, TickersService],
})
export class TickersModule {}
