export class CreateSubscriptionCommand {
  constructor(
    public readonly type: string,
    public readonly status: string,
    public readonly expiredAt: Date,
    public readonly accountId: string,
  ) {}
}
