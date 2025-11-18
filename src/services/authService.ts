import { API_CONFIG } from "@/configs/apiConfig";
import {
  AuthResponse,
  LoginRequest,
  SignUpRequest,
  ConfirmOtpRequest,
  RegisterInformationRequest,
} from "@/types/authType";
import { CookieManager } from "@/lib/cookies";

export class AuthService {
  private static baseUrl = API_CONFIG.BASE_URL;

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.SIGN_IN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Đăng nhập thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  static async fetchWithAuth(url: string, options?: RequestInit) {
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/dang-nhap";
      }
      throw new Error("Unauthorized");
    }

    return response;
  }

  static saveAuth(data: AuthResponse) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.jwt);
      localStorage.setItem("user", JSON.stringify(data));
      // Also save to cookie for middleware
      CookieManager.setCookie("token", data.jwt, 730); // 2 years
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static getUser(): AuthResponse | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      CookieManager.deleteCookie("token");
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Đăng ký tài khoản mới
   * @param request - Thông tin đăng ký (email, password, rePassword)
   * @returns userId của tài khoản vừa tạo
   */
  static async register(request: SignUpRequest): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.SIGN_UP}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Đăng ký thất bại");
    }

    const result = await response.json();
    return result.data; // userId
  }

  /**
   * Xác thực OTP
   * @param request - Thông tin xác thực OTP (id, otp)
   */
  static async confirmOtp(request: ConfirmOtpRequest): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.CONFIRM_OTP}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xác thực OTP thất bại");
    }
  }

  /**
   * Hoàn thiện thông tin đăng ký
   * @param request - Thông tin người dùng (id, fullName, phoneNumber, address)
   */
  static async registerInformation(
    request: RegisterInformationRequest
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REGISTER_INFO}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Hoàn tất đăng ký thất bại");
    }
  }
}

