import { v4 as uuidv4 } from 'uuid';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from 'src/schema/transaction.schema';
import {
  CreateTransactionDto,
  GetTransactionsDto,
  UpdateTransactionDto,
} from './transaction.dto';
import { User } from 'src/schema/user.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(newTransaction: CreateTransactionDto): Promise<Transaction> {
    const transaction = new this.transactionModel({
      ...newTransaction,
      id: uuidv4(),
      timestamp: Math.floor(Date.now() / 1000).toString(),
    });

    try {
      const createdTransaction = await transaction.save();
      return createdTransaction;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAllTransactions(
    getTransactionsDto: GetTransactionsDto,
  ): Promise<Transaction[]> {
    try {
      const allTransactions = this.transactionModel
        .find({ uid: getTransactionsDto.userId })
        .lean();

      return allTransactions;
    } catch (err) {
      console.error('Failed to get all transactions', err);
      throw new InternalServerErrorException(err);
    }
  }

  async updateTransaction(
    updatedTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    try {
      const transaction = this.transactionModel.findOneAndUpdate(
        {
          id: updatedTransactionDto.transactionId,
        },
        updatedTransactionDto,
        { new: true },
      );

      return transaction;
    } catch (err) {
      console.error('Failed to update transaction', err);
      throw new InternalServerErrorException(err);
    }
  }
}
