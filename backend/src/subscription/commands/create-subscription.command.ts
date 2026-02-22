export class CreateSubscriptionCommand {
  constructor(
    public readonly type: string,
    public readonly status: string,
    public readonly expiredAt: Date,
    public readonly accountId: string,
    public readonly planMonths?: number,
    public readonly priceCents?: number,
    public readonly paymentCardLast4?: string,
  ) {}
}
