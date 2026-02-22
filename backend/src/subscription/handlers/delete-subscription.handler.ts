import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeleteSubscriptionCommand } from '../commands/delete-subscription.command';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
@CommandHandler(DeleteSubscriptionCommand)
export class DeleteSubscriptionHandler
  implements ICommandHandler<DeleteSubscriptionCommand>
{
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(
    command: DeleteSubscriptionCommand,
  ): Promise<{ success: boolean }> {
    const { id, accountId } = command;

    const result = await this.subscriptionRepository.delete({ id, accountId });

    if (!result.affected) {
      throw new NotFoundException('Subscription not found');
    }

    return { success: true };
  }
}
