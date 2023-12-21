import { z } from 'zod';

export const createUserSchema = z
  .object({
    username: z.string().max(100),
    email: z.string().email(),
    displayPicture: z.string().optional(),
    // TODO: Add a union of all currencies or something
    currency: z.string(),
  })
  .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    username: z.string().max(100),
    email: z.string().email(),
    displayPicture: z.string().optional(),
    // TODO: Add a union of all currencies or something
    currency: z.string(),
  })
  .required();

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
