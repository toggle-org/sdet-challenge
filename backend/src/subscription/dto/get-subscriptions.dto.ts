import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriptionType } from '../entities/subscription.entity';

export class GetSubscriptionsDto {
  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @IsOptional()
  @IsString()
  status?: string;
}
