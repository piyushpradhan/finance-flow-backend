import { z } from 'zod';

export const loginUserSchema = z
  .object({
    username: z
      .string()
      .email('Invalid username or email')
      .or(z.string().min(1, 'Invalid username or email')),
    password: z.string().min(1),
  })
  .required();

export type LoginDto = z.infer<typeof loginUserSchema>;

export const registerUserSchema = z
  .object({
    username: z.string().regex(/[a-zA-Z0-9_-]{2,20}/, 'Invalid username'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password too weak'),
  })
  .required();

export type RegisterDto = z.infer<typeof registerUserSchema>;
