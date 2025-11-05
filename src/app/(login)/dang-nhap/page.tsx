"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// su dung form
const formSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(5, {
    message: "Mật khẩu phải có ít nhất 5 ký tự",
  }),
});

function LoginForm() {
  // trạng thái loading khi submit form
  const [loading, setLoading] = useState(false);
  // state cho UI copy từ giao_dien
  const [step, setStep] = useState<"form" | "otp" | "profile">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [profile, setProfile] = useState({ fullName: "", phone: "", address: "" });

  const { login } = useAuth();
  const router = useRouter();

  // Khởi tạo form với schema validate cho tab Đăng nhập
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // Xử lý submit đăng nhập: gọi authService và chuyển trang
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast({ title: "Đăng nhập thành công", description: "Chào mừng bạn quay trở lại!" });
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: error?.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Xử lý submit đăng ký: kiểm tra mật khẩu, chuyển sang bước OTP
  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Mật khẩu không khớp", variant: "destructive" });
      return;
    }
    setStep("otp");
  }

  // Xử lý xác thực OTP: đủ 6 số thì sang bước cập nhật hồ sơ
  function handleOTPVerify() {
    if (otp.length === 6) {
      setStep("profile");
    }
  }

  // Hoàn tất hồ sơ: hiển thị thông báo và đưa về trang chủ
  function handleProfileComplete(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Đăng ký thành công!" });
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border shadow-lg p-8">
          {step === "form" && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="mb-2">Chào mừng đến SmartMall</h1>
              <p className="text-muted-foreground">Đăng nhập hoặc tạo tài khoản mới</p>
            </div>
          )}

          {step === "form" && (
            <Tabs defaultValue="login" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="pl-10 rounded-xl"
                                placeholder="example@email.com"
                                disabled={loading}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="pl-10 rounded-xl"
                                placeholder="••••••••"
                                disabled={loading}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-right">
                      <button type="button" className="text-sm text-primary hover:underline">
                        Quên mật khẩu?
                      </button>
                    </div>

                    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
                      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${loading ? "" : "hidden"}`} />
                      Đăng nhập
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 rounded-xl"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Nhập lại mật khẩu</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-xl">
                    Đăng ký
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2">Xác thực OTP</h2>
                <p className="text-sm text-muted-foreground">Mã xác thực đã được gửi đến {email}</p>
              </div>

              <div className="flex justify-center">
                <Input
                  inputMode="numeric"
                  pattern="\\d*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="text-center tracking-widest text-lg w-48"
                  placeholder="_ _ _ _ _ _"
                />
              </div>

              <Button size="lg" className="w-full rounded-xl" onClick={handleOTPVerify} disabled={otp.length !== 6}>
                Xác nhận
              </Button>

              <div className="text-center">
                <button className="text-sm text-primary hover:underline" type="button">Gửi lại mã OTP</button>
              </div>
            </div>
          )}

          {step === "profile" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2">Hoàn thiện thông tin</h2>
                <p className="text-sm text-muted-foreground">Vui lòng cập nhật thông tin cá nhân</p>
              </div>

              <form onSubmit={handleProfileComplete} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="pl-10 rounded-xl"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-10 rounded-xl"
                      placeholder="0123456789"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      type="text"
                      required
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="pl-10 rounded-xl"
                      placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full rounded-xl">
                  Hoàn tất
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default LoginForm;
