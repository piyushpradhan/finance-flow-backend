import { z } from 'zod';

export const createCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  transactions: z.array(z.string()).default([]).optional(),
  subCategories: z.array(z.string()).default([]).optional(),
  uid: z.string(),
  isSubcategory: z.boolean().optional().default(false),
  type: z.enum(['income', 'expense']),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  icon: z.string().optional(),
  transactions: z.array(z.string()).optional(),
  subCategories: z.array(z.string()).optional(),
  uid: z.string(),
  isSubcategory: z.boolean().optional(),
  type: z.enum(['income', 'expense']).optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export const deleteCategorySchema = z.object({
  id: z.string(),
  uid: z.string(),
});

export type DeleteCategoryDto = z.infer<typeof deleteCategorySchema>;

export const getAllCategoriesSchema = z.object({
  uid: z.string({ required_error: 'Please provide a UID' }),
});

export type GetAllCategoriesDto = z.infer<typeof getAllCategoriesSchema>;

export const getCategorySchema = z.object({
  uid: z.string(),
  id: z.string(),
});

export type GetCategoryDto = z.infer<typeof getCategorySchema>;
