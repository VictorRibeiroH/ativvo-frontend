"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/home"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar se a rota atual é pública
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname?.startsWith(route)
    );

    // Se for rota pública, não precisa verificar token
    if (isPublicRoute) {
      return;
    }

    // Verificar se o token existe
    const token = localStorage.getItem("ativvo_token");

    if (!token) {
      console.warn("⚠️ Token não encontrado, redirecionando para login...");
      router.push("/sign-in");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
