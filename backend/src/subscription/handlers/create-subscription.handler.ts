import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSubscriptionCommand } from '../commands/create-subscription.command';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler
  implements ICommandHandler<CreateSubscriptionCommand>
{
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(command: CreateSubscriptionCommand): Promise<Subscription> {
    const {
      type,
      status,
      expiredAt,
      accountId,
      planMonths,
      priceCents,
      paymentCardLast4,
    } = command;

    const existingActiveSubscription =
      await this.subscriptionRepository.findOne({
        where: { accountId, status: 'active' },
      });

    if (existingActiveSubscription) {
      throw new ConflictException('Only one active subscription is allowed');
    }

    const subscription = this.subscriptionRepository.create({
      type: type as any,
      status,
      expiredAt,
      accountId,
      planMonths: planMonths ?? null,
      priceCents: priceCents ?? null,
      paymentCardLast4: paymentCardLast4 ?? null,
    });

    return this.subscriptionRepository.save(subscription);
  }
}
