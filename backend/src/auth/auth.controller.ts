import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpCommand } from './commands/sign-up.command';
import { SignInCommand } from './commands/sign-in.command';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const { email, password, name } = signUpDto;
    return this.commandBus.execute(new SignUpCommand(email, password, name));
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const { email, password } = signInDto;
    return this.commandBus.execute(new SignInCommand(email, password));
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
