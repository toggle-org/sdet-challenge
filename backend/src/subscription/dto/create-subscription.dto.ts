import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Length,
} from 'class-validator';
import { SubscriptionType } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  expiredAt: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  planMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  priceCents?: number;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  paymentCardLast4?: string;
}
