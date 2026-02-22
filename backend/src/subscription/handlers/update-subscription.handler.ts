import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateSubscriptionCommand } from '../commands/update-subscription.command';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler
  implements ICommandHandler<UpdateSubscriptionCommand>
{
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(command: UpdateSubscriptionCommand): Promise<Subscription> {
    const { id, accountId, type, status, expiredAt } = command;

    const subscription = await this.subscriptionRepository.findOne({
      where: { id, accountId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (type !== undefined) {
      subscription.type = type;
    }

    if (status !== undefined) {
      subscription.status = status;
    }

    if (expiredAt !== undefined) {
      subscription.expiredAt = expiredAt;
    }

    return this.subscriptionRepository.save(subscription);
  }
}
