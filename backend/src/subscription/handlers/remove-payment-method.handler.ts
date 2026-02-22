import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subscription } from '../entities/subscription.entity';
import { RemovePaymentMethodCommand } from '../commands/remove-payment-method.command';

@Injectable()
@CommandHandler(RemovePaymentMethodCommand)
export class RemovePaymentMethodHandler
  implements ICommandHandler<RemovePaymentMethodCommand>
{
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async execute(
    command: RemovePaymentMethodCommand,
  ): Promise<{ success: boolean }> {
    const { id, accountId } = command;

    const subscription = await this.subscriptionRepository.findOne({
      where: { id, accountId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.paymentCardLast4 = null;
    await this.subscriptionRepository.save(subscription);

    return { success: true };
  }
}
