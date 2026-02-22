import { SubscriptionType } from '../entities/subscription.entity';

export class UpdateSubscriptionCommand {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly type?: SubscriptionType,
    public readonly status?: string,
    public readonly expiredAt?: Date,
  ) {}
}
