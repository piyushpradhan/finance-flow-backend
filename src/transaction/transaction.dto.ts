import { z } from 'zod';

const transactionTypes = [
  'income',
  'expense',
  'transfer',
  'debt',
  'receivable',
] as const;

export const createTransactionSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  amount: z.number(),
  user: z.string(), // Assuming user is represented by a string (User's ObjectId)
  account: z.string(), // Assuming account is represented by a string (Account's ObjectId)
  category: z.string().optional(), // Assuming category is represented by a string (Category's ObjectId) and it's optional
  note: z.string().optional(),
  type: z.enum(transactionTypes),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

export const getTransactionSchema = z.object({
  userId: z.string(),
});

export type GetTransactionsDto = z.infer<typeof getTransactionSchema>;

export const updateTransactionSchema = z.object({
  transactionId: z.string({
    required_error: 'Which transaction do you want to update?',
  }),
  amount: z.number().optional(),
  user: z.string().optional(),
  account: z.string().optional(),
  category: z.string().optional(),
  note: z.string().optional(),
  type: z.enum(transactionTypes).optional(),
});

export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export const deleteTransactionSchema = z.object({
  transactionId: z.string(),
});

export type DeleteTransactionDto = z.infer<typeof deleteTransactionSchema>;
