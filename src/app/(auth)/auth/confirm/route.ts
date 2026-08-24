import { NextResponse } from "next/server";
import { resolveOtpConfirmation } from "@/lib/auth/otp-confirmation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const confirmation = resolveOtpConfirmation(url);
  if (!confirmation) return NextResponse.redirect(new URL("/login", url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: confirmation.tokenHash,
    type: confirmation.type,
  });

  return NextResponse.redirect(new URL(error ? "/login" : confirmation.next, url.origin));
}
