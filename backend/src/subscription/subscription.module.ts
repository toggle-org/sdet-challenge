import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionHandler } from './handlers/create-subscription.handler';
import { GetSubscriptionsHandler } from './handlers/get-subscriptions.handler';
import { UpdateSubscriptionHandler } from './handlers/update-subscription.handler';
import { DeleteSubscriptionHandler } from './handlers/delete-subscription.handler';
import { GetSubscriptionSummaryHandler } from './handlers/get-subscription-summary.handler';
import { RemovePaymentMethodHandler } from './handlers/remove-payment-method.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), CqrsModule],
  controllers: [SubscriptionController],
  providers: [
    CreateSubscriptionHandler,
    GetSubscriptionsHandler,
    UpdateSubscriptionHandler,
    DeleteSubscriptionHandler,
    GetSubscriptionSummaryHandler,
    RemovePaymentMethodHandler,
  ],
})
export class SubscriptionModule {}
