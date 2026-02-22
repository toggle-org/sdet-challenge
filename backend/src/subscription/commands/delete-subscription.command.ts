export class DeleteSubscriptionCommand {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {}
}
