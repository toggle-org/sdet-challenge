import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionHandler } from './handlers/create-subscription.handler';
import { GetSubscriptionsHandler } from './handlers/get-subscriptions.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), CqrsModule],
  controllers: [SubscriptionController],
  providers: [CreateSubscriptionHandler, GetSubscriptionsHandler],
})
export class SubscriptionModule {}
