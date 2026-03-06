import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { Account } from './auth/entities/account.entity';
import { Subscription } from './subscription/entities/subscription.entity';
import { AuthModule } from './auth/auth.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: 'database.sqlite',
      autoSave: true,
      entities: [Account, Subscription],
      synchronize: true,
      logging: true,
    }),
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
