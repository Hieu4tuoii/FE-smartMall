import { z } from "zod";

/**
 * Schema validation cho form tạo/chỉnh sửa banner
 */
export const bannerFormSchema = z.object({
  // URL ảnh sẽ là chuỗi được server trả về (có thể là path tương đối), không ép dạng URL tuyệt đối
  imageUrl: z.string().min(1, { message: "Ảnh là bắt buộc" }),
  // Link nội bộ: string, có thể để trống, nếu nhập thì phải bắt đầu bằng '/'
  link: z.string().refine(
    (val) => {
      // Cho phép chuỗi rỗng
      if (!val || val.trim() === "") {
        return true;
      }
      // Nếu có giá trị, phải bắt đầu bằng '/'
      return val.trim().startsWith("/");
    },
    {
      message: "Link nội bộ phải bắt đầu bằng '/' (ví dụ: /san-pham)",
    }
  ),
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;


