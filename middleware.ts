import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Отримуємо поточного користувача
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const pathname = url.pathname;

  // 1. Якщо користувач не заавторизований і намагається зайти в захищені розділи
  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/designer") || pathname.startsWith("/client") || pathname.startsWith("/project-workspace"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Перевірка ролей для захисту кабінетів від чужих очей
  if (user) {
    // Отримуємо профіль користувача з роллю
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "client";

    // Захист маршрутів адміна
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Захист маршрутів дизайнера
    if (pathname.startsWith("/designer") && role !== "designer" && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};