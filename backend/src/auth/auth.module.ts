import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { Account } from './entities/account.entity';
import { SignUpHandler } from './handlers/sign-up.handler';
import { SignInHandler } from './handlers/sign-in.handler';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [SignUpHandler, SignInHandler, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
