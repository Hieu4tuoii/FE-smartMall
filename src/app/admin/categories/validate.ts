import { z } from "zod";

/**
 * Schema validation cho form Category
 */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự" }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;


