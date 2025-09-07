import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { SignInCommand } from '../commands/sign-in.command';
import { Account } from '../entities/account.entity';

@Injectable()
@CommandHandler(SignInCommand)
export class SignInHandler implements ICommandHandler<SignInCommand> {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SignInCommand): Promise<{ accessToken: string; user: any }> {
    const { email, password } = command;

    // Find account by email
    const account = await this.accountRepository.findOne({
      where: { email },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: account.id, email: account.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
      },
    };
  }
}
