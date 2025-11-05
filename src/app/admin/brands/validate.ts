import { z } from "zod";

/**
 * Schema validation cho form Brand
 */
export const brandFormSchema = z.object({
  name: z.string().trim().min(2, { message: "Tên thương hiệu phải có ít nhất 2 ký tự" }),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;


