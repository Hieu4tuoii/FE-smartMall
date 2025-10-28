import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";
import {
  UserResponse,
  PageResponse,
  UserListParams,
  EmployeeRequest,
} from "@/types/userType";

export class UserService {
  // Lấy danh sách khách hàng
  static async getCustomerList(
    params: UserListParams = {}
  ): Promise<PageResponse<UserResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.sort) queryParams.append("sort", params.sort);
    queryParams.append("page", (params.page || 0).toString());
    queryParams.append("size", (params.size || 10).toString());

    const response = await AuthService.fetchWithAuth(
      `${API_CONFIG.ENDPOINTS.USER.CUSTOMERS}?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách khách hàng thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  // Lấy danh sách nhân viên
  static async getEmployeeList(
    params: UserListParams = {}
  ): Promise<PageResponse<UserResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.sort) queryParams.append("sort", params.sort);
    queryParams.append("page", (params.page || 0).toString());
    queryParams.append("size", (params.size || 10).toString());

    const response = await AuthService.fetchWithAuth(
      `${API_CONFIG.ENDPOINTS.USER.EMPLOYEES}?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy danh sách nhân viên thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  // Tạo tài khoản nhân viên
  static async createEmployee(request: EmployeeRequest): Promise<string> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.USER.EMPLOYEES,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Tạo tài khoản nhân viên thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  // Xóa tài khoản nhân viên
  static async deleteEmployee(id: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.USER.EMPLOYEE_BY_ID(id),
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa tài khoản nhân viên thất bại");
    }
  }

  // Lấy thông tin nhân viên
  static async getEmployeeById(id: string): Promise<UserResponse> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.USER.EMPLOYEE_BY_ID(id)
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Lấy thông tin nhân viên thất bại");
    }

    const result = await response.json();
    return result.data;
  }

  // Cập nhật thông tin nhân viên
  static async updateEmployee(
    id: string,
    request: EmployeeRequest
  ): Promise<void> {
    const response = await AuthService.fetchWithAuth(
      API_CONFIG.ENDPOINTS.USER.EMPLOYEE_BY_ID(id),
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Cập nhật thông tin nhân viên thất bại");
    }
  }

  // Xóa tài khoản khách hàng (nếu cần API từ backend)
  static async deleteCustomer(id: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(`/user/customer/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa tài khoản khách hàng thất bại");
    }
  }
}


