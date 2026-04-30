import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();

  // If no session, redirect to login
  if (!session) {
    redirect("/login");
  }

  // Check RBAC: Only MANAGER or SUPERADMIN can access dashboard
  if (session.role === "CASHIER") {
    redirect("/"); // Redirect cashiers to POS page
  }

  return <DashboardClient />;
}
