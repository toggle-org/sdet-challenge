export class RemovePaymentMethodCommand {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {}
}
