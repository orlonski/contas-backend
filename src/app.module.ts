import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(8).required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    InvoicesModule,
    DashboardModule,
  ],
})
export class AppModule {}
