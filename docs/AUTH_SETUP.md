# Hướng dẫn sử dụng hệ thống Authentication

## Tổng quan

Hệ thống authentication đã được setup với các tính năng sau:

1. ✅ Đăng nhập với JWT
2. ✅ Phân quyền (ROLE_ADMIN, ROLE_CUSTOMER)
3. ✅ Middleware bảo vệ routes
4. ✅ SEO-friendly (không ảnh hưởng server components)
5. ✅ Cookie + localStorage sync cho middleware

## Cấu trúc thư mục

```
smartmall/src/
├── types/
│   └── auth.types.ts          # Type definitions
├── configs/
│   └── api.config.ts          # API configuration
├── services/
│   └── auth.service.ts        # Auth service
├── contexts/
│   └── AuthContext.tsx        # Auth context & provider
├── lib/
│   ├── jwt.ts                 # JWT utilities
│   └── cookies.ts             # Cookie utilities
├── components/
│   ├── providers/
│   │   └── ClientProviders.tsx
│   └── custom/
│       ├── UserMenu.tsx       # Example user menu
│       └── ProtectedComponent.tsx
├── middleware.ts              # Route protection middleware
└── app/
    ├── (login)/
    │   ├── layout.tsx         # Login layout with AuthProvider
    │   └── dang-nhap/
    │       └── page.tsx       # Login page
    ├── (user)/
    │   ├── layout.tsx         # User layout (server component)
    │   └── page.tsx           # Home page (server component)
    └── admin/
        ├── layout.tsx         # Admin layout
        ├── AdminLayoutContent.tsx
        └── page.tsx           # Admin page
```

## Setup môi trường

1. Tạo file `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://192.168.1.28:8080
```

2. Backend phải chạy tại `http://192.168.1.28:8080` hoặc cập nhật URL trong `.env.local`

## Các tính năng chính

### 1. Middleware Protection

File `middleware.ts` tự động:
- Chặn truy cập `/admin` nếu không có token hoặc không phải ROLE_ADMIN
- Redirect user đã đăng nhập khỏi trang login
- Redirect admin về `/admin`, user thường về `/`

### 2. AuthContext & Provider

```tsx
import { useAuth } from "@/contexts/AuthContext";

function YourComponent() {
  const { user, isLoading, login, logout, isAuthenticated, hasRole } = useAuth();
  
  // Check if user is admin
  if (hasRole("ROLE_ADMIN")) {
    // Show admin content
  }
}
```

### 3. Server Components & SEO

**User layout và pages vẫn là SERVER COMPONENTS** để đảm bảo SEO:

```tsx
// app/(user)/page.tsx - Server Component
export default async function Home() {
  return <div>Public content - SEO friendly</div>;
}
```

Khi cần auth trong server component, sử dụng client component con:

```tsx
// app/(user)/page.tsx - Server Component
import { UserMenu } from "@/components/custom/UserMenu";

export default async function Home() {
  return (
    <div>
      <header>
        <UserMenu /> {/* Client component */}
      </header>
      <main>Public content - SEO friendly</main>
    </div>
  );
}
```

### 4. Protected Routes

**Cách 1: Middleware (đã setup)**
```
/admin/* - Tự động được protect bởi middleware
```

**Cách 2: Component Level**
```tsx
import { ProtectedComponent } from "@/components/custom/ProtectedComponent";

<ProtectedComponent requireRole="ROLE_ADMIN">
  <AdminOnlyContent />
</ProtectedComponent>
```

### 5. Login Flow

```tsx
// app/(login)/dang-nhap/page.tsx
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  
  async function onSubmit(values) {
    await login(values.email, values.password);
    // Middleware sẽ tự động redirect
  }
}
```

## API Integration

### Backend Response Structure

Endpoint: `POST /api/auth/sign-in`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "status": 200,
  "message": "Login successfully",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "User Name",
    "phoneNumber": "0123456789",
    "address": "Address",
    "stepActive": "ACTIVE",
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### JWT Payload

```json
{
  "sub": "user@example.com",
  "role": "ROLE_ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Best Practices

### 1. Giữ Server Components cho SEO

```tsx
// ✅ GOOD - Server component
export default async function ProductPage() {
  const products = await fetchProducts(); // Server-side data fetching
  
  return (
    <div>
      <ProductList products={products} />
      <UserMenu /> {/* Client component for auth */}
    </div>
  );
}

// ❌ BAD - Unnecessary client component
"use client";
export default function ProductPage() {
  // This breaks SSR and SEO
}
```

### 2. Sử dụng AuthContext đúng cách

```tsx
// ✅ GOOD - In client component
"use client";
import { useAuth } from "@/contexts/AuthContext";

export function UserProfile() {
  const { user } = useAuth();
  return <div>{user?.fullName}</div>;
}

// ❌ BAD - In server component (will error)
import { useAuth } from "@/contexts/AuthContext";

export default async function Page() {
  const { user } = useAuth(); // Error: useContext only works in client components
}
```

### 3. API Calls với Authentication

```tsx
import { AuthService } from "@/services/auth.service";

// Sử dụng fetchWithAuth để tự động attach token
const response = await AuthService.fetchWithAuth("/api/products", {
  method: "GET"
});
```

## Roles

- `ROLE_ADMIN` - Quản trị viên (có quyền truy cập `/admin`)
- `ROLE_CUSTOMER` - Khách hàng thường

## Troubleshooting

### Lỗi: "useAuth must be used within an AuthProvider"
- Đảm bảo component đang sử dụng `useAuth()` là **client component** (`"use client"`)
- Đảm bảo component nằm trong `ClientProviders` wrapper

### Middleware không redirect
- Kiểm tra cookie đã được set chưa (DevTools > Application > Cookies)
- Xóa cookie và localStorage, đăng nhập lại

### SEO không hoạt động
- Đảm bảo page components KHÔNG có `"use client"` directive
- Chỉ wrap những component cần auth trong client components

## Examples

### Example 1: Header với UserMenu

```tsx
// components/Header.tsx - Server Component
import { UserMenu } from "@/components/custom/UserMenu";

export function Header() {
  return (
    <header>
      <nav>
        <h1>My App</h1>
        <UserMenu /> {/* Client component */}
      </nav>
    </header>
  );
}
```

### Example 2: Conditional Rendering dựa vào Role

```tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";

export function Dashboard() {
  const { hasRole } = useAuth();
  
  return (
    <div>
      <h1>Dashboard</h1>
      {hasRole("ROLE_ADMIN") && (
        <button>Admin Only Action</button>
      )}
    </div>
  );
}
```

### Example 3: Protected API Route

```tsx
// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRoleFromToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const role = getRoleFromToken(token);
  if (role !== "ROLE_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Admin only logic
  return NextResponse.json({ data: "Admin data" });
}
```

## Liên hệ

Nếu có vấn đề, vui lòng kiểm tra:
1. Backend đang chạy
2. `.env.local` đã được tạo với đúng API URL
3. Token trong cookie và localStorage đã được set sau khi login

