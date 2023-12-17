import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().max(100),
    email: z.string().email(),
  })
  .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;
