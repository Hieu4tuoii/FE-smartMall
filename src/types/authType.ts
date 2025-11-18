export type StepActive = "OTP" | "UPDATE_INFO" | "ACTIVE";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  stepActive: StepActive;
  role: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  stepActive: StepActive;
  jwt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  sub: string; // email
  role: string; // ROLE_ADMIN, ROLE_CUSTOMER
  iat: number;
  exp: number;
}

export interface SignUpRequest {
  email: string;
  password: string;
  rePassword: string;
}

export interface ConfirmOtpRequest {
  id: string;
  otp: string;
}

export interface RegisterInformationRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

