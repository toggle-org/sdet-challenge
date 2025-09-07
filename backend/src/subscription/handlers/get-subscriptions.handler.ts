import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetSubscriptionsQuery } from '../queries/get-subscriptions.query';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
@QueryHandler(GetSubscriptionsQuery)
export class GetSubscriptionsHandler implements IQueryHandler<GetSubscriptionsQuery> {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(query: GetSubscriptionsQuery): Promise<Subscription[]> {
    const { accountId } = query;

    return this.subscriptionRepository.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
    });
  }
}
