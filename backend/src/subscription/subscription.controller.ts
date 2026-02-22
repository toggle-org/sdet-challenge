import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';
import { GetSubscriptionsQuery } from './queries/get-subscriptions.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetSubscriptionsDto } from './dto/get-subscriptions.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdateSubscriptionCommand } from './commands/update-subscription.command';
import { DeleteSubscriptionCommand } from './commands/delete-subscription.command';
import { GetSubscriptionSummaryQuery } from './queries/get-subscription-summary.query';
import { RemovePaymentMethodCommand } from './commands/remove-payment-method.command';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    const {
      type,
      status,
      expiredAt,
      planMonths,
      priceCents,
      paymentCardLast4,
    } = createSubscriptionDto;
    const accountId = req.user.id;

    return this.commandBus.execute(
      new CreateSubscriptionCommand(
        type,
        status,
        new Date(expiredAt),
        accountId,
        planMonths,
        priceCents,
        paymentCardLast4,
      ),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSubscriptions(@Request() req, @Query() query: GetSubscriptionsDto) {
    const accountId = req.user.id;
    return this.queryBus.execute(
      new GetSubscriptionsQuery(accountId, query.type, query.status),
    );
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionSummary(@Request() req) {
    const accountId = req.user.id;
    return this.queryBus.execute(new GetSubscriptionSummaryQuery(accountId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    const accountId = req.user.id;
    return this.commandBus.execute(
      new UpdateSubscriptionCommand(
        id,
        accountId,
        updateSubscriptionDto.type,
        updateSubscriptionDto.status,
        updateSubscriptionDto.expiredAt
          ? new Date(updateSubscriptionDto.expiredAt)
          : undefined,
      ),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteSubscription(@Param('id') id: string, @Request() req) {
    const accountId = req.user.id;
    return this.commandBus.execute(
      new DeleteSubscriptionCommand(id, accountId),
    );
  }

  @Delete(':id/payment-method')
  @UseGuards(JwtAuthGuard)
  async removePaymentMethod(@Param('id') id: string, @Request() req) {
    const accountId = req.user.id;
    return this.commandBus.execute(
      new RemovePaymentMethodCommand(id, accountId),
    );
  }
}
