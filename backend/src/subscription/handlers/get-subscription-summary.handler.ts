import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Subscription,
  SubscriptionType,
} from '../entities/subscription.entity';
import { GetSubscriptionSummaryQuery } from '../queries/get-subscription-summary.query';

@Injectable()
@QueryHandler(GetSubscriptionSummaryQuery)
export class GetSubscriptionSummaryHandler
  implements IQueryHandler<GetSubscriptionSummaryQuery>
{
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(query: GetSubscriptionSummaryQuery) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const subscriptions = await this.subscriptionRepository.find({
      where: { accountId: query.accountId },
    });

    const active = subscriptions.filter(
      (item) => item.status === 'active',
    ).length;
    const expired = subscriptions.filter((item) => item.expiredAt < now).length;
    const expiringSoon = subscriptions.filter(
      (item) => item.expiredAt >= now && item.expiredAt <= sevenDaysFromNow,
    ).length;

    const byType = {
      web: subscriptions.filter((item) => item.type === SubscriptionType.WEB)
        .length,
      ios: subscriptions.filter((item) => item.type === SubscriptionType.IOS)
        .length,
      android: subscriptions.filter(
        (item) => item.type === SubscriptionType.ANDROID,
      ).length,
    };

    return {
      total: subscriptions.length,
      active,
      expired,
      expiringSoon,
      byType,
    };
  }
}
