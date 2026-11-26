import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const meRes = await fetch(`${BACKEND}/api/v1/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  // Access token expired but refresh token may still be valid —
  // the Route Handler rotates the cookies and sends the user back here.
  if (meRes.status === 401) {
    const headerStore = await headers();
    const returnTo = headerStore.get("x-pathname") ?? "/dashboard";
    redirect(`/api/auth/refresh?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (!meRes.ok) {
    redirect("/");
  }

  return children;
}
