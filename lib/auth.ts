import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "pos-merch-super-secret-key";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  branchId?: string | null;
  firstName: string;
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h") // Session valid for 12 hours
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const session = (await cookies()).get("auth_token")?.value;
  if (!session) return null;
  
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function setSession(user: SessionPayload) {
  const expires = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const session = await encrypt(user);

  (await cookies()).set("auth_token", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function destroySession() {
  (await cookies()).delete("auth_token");
}
