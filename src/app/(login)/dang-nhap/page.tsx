"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

//su dung form
const formSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(5, {
    message: "Mật khẩu phải có ít nhất 5 ký tự",
  }),
});

function LoginForm() {
  // trạng thái laoding khi submit form
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Initialize form with validation schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      // Redirect based on role - this will be handled by middleware
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-screen h-screen z-50 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">Đăng nhập</CardTitle>
          <CardDescription className="mx-auto">
            Đăng nhập vào hệ thống
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mx-6">
                  <FormLabel>Tài khoản</FormLabel>
                  <FormControl>
                    <Input
                      {...field} // Truyền tất cả các thuộc tính từ field vào Input
                      id="email"
                      type="email"
                      placeholder="Tên tài khoản"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mx-6">
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      {...field} // Truyền tất cả các thuộc tính từ field vào Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter>
              <Button disabled={loading} className="w-full">
                <Loader2
                  className={`mr-2 h-4 w-4 animate-spin ${
                    loading ? "" : "hidden"
                  }`}
                />
                Đăng nhập
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
export default LoginForm;
