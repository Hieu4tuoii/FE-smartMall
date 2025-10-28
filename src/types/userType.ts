export type StepActive = "OTP" | "UPDATE_INFO" | "ACTIVE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "NONE";

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  stepActive: StepActive;
  status: UserStatus;
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  items: T;
}

export interface EmployeeRequest {
  email: string;
  password?: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  imageUrl?: string;
  authoritiesId: string;
}

export interface UserListParams {
  keyword?: string;
  sort?: string;
  page?: number;
  size?: number;
}

