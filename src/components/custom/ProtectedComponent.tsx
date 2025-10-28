"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedComponentProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  fallback?: ReactNode;
}

/**
 * ProtectedComponent - Wrapper component to protect content based on auth state
 * Usage in server components:
 * 
 * import { ProtectedComponent } from "@/components/custom/ProtectedComponent";
 * 
 * <ProtectedComponent requireAuth>
 *   <YourProtectedContent />
 * </ProtectedComponent>
 * 
 * Or with role:
 * <ProtectedComponent requireRole="ROLE_ADMIN">
 *   <AdminOnlyContent />
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  requireAuth = false,
  requireRole,
  fallback = null,
}: ProtectedComponentProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requireRole && !hasRole(requireRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

