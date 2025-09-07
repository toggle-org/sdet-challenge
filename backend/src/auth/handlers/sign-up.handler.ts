import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { SignUpCommand } from '../commands/sign-up.command';
import { Account } from '../entities/account.entity';

@Injectable()
@CommandHandler(SignUpCommand)
export class SignUpHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SignUpCommand): Promise<{ accessToken: string; user: any }> {
    const { email, password, name } = command;

    // Check if user already exists
    const existingAccount = await this.accountRepository.findOne({
      where: { email },
    });

    if (existingAccount) {
      throw new ConflictException('Account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account
    const account = this.accountRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    const savedAccount = await this.accountRepository.save(account);

    // Generate JWT token
    const payload = { sub: savedAccount.id, email: savedAccount.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: savedAccount.id,
        email: savedAccount.email,
        name: savedAccount.name,
      },
    };
  }
}
