import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';
import { GetSubscriptionsQuery } from './queries/get-subscriptions.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const { type, status, expiredAt, accountId } = createSubscriptionDto;

    return this.commandBus.execute(
      new CreateSubscriptionCommand(
        type,
        status,
        new Date(expiredAt),
        accountId,
      ),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSubscriptions(@Request() req) {
    const accountId = req.user.id;
    return this.queryBus.execute(new GetSubscriptionsQuery(accountId));
  }
}
