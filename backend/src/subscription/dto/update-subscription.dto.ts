import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriptionType } from '../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  expiredAt?: string;
}
