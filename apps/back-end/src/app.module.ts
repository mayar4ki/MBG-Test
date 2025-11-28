import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env-validation.schema';
import { TickersModule } from './tickers/tickers.module';

@Module({
  imports: [
 
   
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true, // Make config available globally
    }),
    TickersModule,
  ],
})
export class AppModule {}
