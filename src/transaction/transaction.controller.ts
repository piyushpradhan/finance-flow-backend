import {
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from 'src/schema/transaction.schema';
import { CheckTokenExpiryGuard } from 'src/guards/token.guard';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/create')
  @UseGuards(CheckTokenExpiryGuard)
  async createNewTransaction(@Request() request): Promise<Transaction> {
    const newTransaction = request.body;
    return await this.transactionService.create(newTransaction);
  }

  @Get('/all')
  @UseGuards(CheckTokenExpiryGuard)
  async getAllTransactions(@Request() request): Promise<Transaction[]> {
    const userId = request.body.userId;
    return await this.transactionService.getAllTransactions({
      userId,
    });
  }

  @Patch('/update')
  @UseGuards(CheckTokenExpiryGuard)
  async updateTransaction(@Request() request): Promise<Transaction> {
    const transactionId = request.body.transactionId;
    return await this.transactionService.updateTransaction({
      transactionId,
    });
  }
}
