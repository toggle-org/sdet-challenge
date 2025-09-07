import { IsEnum, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { SubscriptionType } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  expiredAt: string;

  @IsString()
  @IsNotEmpty()
  accountId: string;
}
