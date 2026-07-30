import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./db/supabase-env";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/signup"];
const PUBLIC_AGENCY_PATHS = ["/agency/login"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes the session cookie if needed — required for Server Components,
  // which can only read cookies, not write them.
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(path);
  const isAgencyRoute = path.startsWith("/agency") && !PUBLIC_AGENCY_PATHS.includes(path);

  if ((isAdminRoute || isAgencyRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminRoute ? "/admin/login" : "/agency/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/agency/:path*"],
};
