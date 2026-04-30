import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import POSPageClient from "./POSPageClient";

export default async function POSPage() {
  const session = await getSession();

  // If no session, redirect to login
  if (!session) {
    redirect("/login");
  }

  return <POSPageClient />;
}
