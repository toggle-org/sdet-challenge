import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '../../auth/entities/account.entity';

export enum SubscriptionType {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    enum: SubscriptionType,
  })
  type: SubscriptionType;

  @Column()
  status: string;

  @Column()
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  accountId: string;

  @ManyToOne(() => Account, (account) => account.subscriptions)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
