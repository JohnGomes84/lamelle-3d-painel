import { createClient } from "@supabase/supabase-js";
// trim(): uma quebra de linha colada junto da chave na Vercel faz o fetch falhar.
export function createAdminClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();if(!url||!key)throw new Error("Credenciais administrativas ausentes.");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
