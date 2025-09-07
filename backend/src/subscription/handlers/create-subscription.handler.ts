import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSubscriptionCommand } from '../commands/create-subscription.command';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler implements ICommandHandler<CreateSubscriptionCommand> {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(command: CreateSubscriptionCommand): Promise<Subscription> {
    const { type, status, expiredAt, accountId } = command;

    const subscription = this.subscriptionRepository.create({
      type: type as any,
      status,
      expiredAt,
      accountId,
    });

    return this.subscriptionRepository.save(subscription);
  }
}
