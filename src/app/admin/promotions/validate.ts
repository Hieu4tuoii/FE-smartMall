import { z } from "zod";

/**
 * Schema validation cho form tạo/chỉnh sửa chương trình giảm giá
 */
export const promotionFormSchema = z.object({
  startAt: z.string().min(1, { message: "Thời gian bắt đầu là bắt buộc" }),
  endAt: z.string().min(1, { message: "Thời gian kết thúc là bắt buộc" }),
  discount: z
    .number()
    .min(1, { message: "Phần trăm giảm giá phải từ 1 đến 100" })
    .max(100, { message: "Phần trăm giảm giá phải từ 1 đến 100" }),
  maximumDiscountAmount: z.number().optional().nullable(),
  productIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (!data.startAt || !data.endAt) return true;
    const startDate = new Date(data.startAt);
    const endDate = new Date(data.endAt);
    return endDate > startDate;
  },
  {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endAt"],
  }
);

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;

