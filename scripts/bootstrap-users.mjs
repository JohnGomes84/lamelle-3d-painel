import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolveInviteRedirect } from "./invite-redirect.mjs";
config({ path: ".env.local", quiet: true });
const required=["NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","LAMELLE_OWNER_EMAIL"];
const missing=required.filter((key)=>!process.env[key]);if(missing.length)throw new Error(`Variáveis ausentes: ${missing.join(", ")}`);
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const inviteRedirectTo=resolveInviteRedirect(process.env);
const ownerEmail=process.env.LAMELLE_OWNER_EMAIL.toLowerCase(),partnerEmail=process.env.LAMELLE_PARTNER_EMAIL?.toLowerCase();
const{data:existing}=await supabase.from("organizations").select("id").eq("slug","lamelle-3d").maybeSingle();let organizationId=existing?.id;
if(!organizationId){const{data,error}=await supabase.from("organizations").insert({name:"Lamelle 3D",slug:"lamelle-3d",settings:{printer:"Bambu Lab A1",weeklyCapacity:40,filamentKgPrice:120,kwhRate:.95,printerValue:2000,printerLifeHours:2000,laborHour:30,defaultMultiplier:3}}).select("id").single();if(error)throw error;organizationId=data.id;}
const invitedUsers=[[ownerEmail,"owner"],...(partnerEmail?[[partnerEmail,"member"]]:[])];
for(const[email,role]of invitedUsers){const{data:users,error:listError}=await supabase.auth.admin.listUsers({page:1,perPage:1000});if(listError)throw listError;let user=users.users.find((candidate)=>candidate.email?.toLowerCase()===email);if(!user){const{data,error}=await supabase.auth.admin.inviteUserByEmail(email,{redirectTo:inviteRedirectTo});if(error)throw error;user=data.user;}await supabase.from("profiles").upsert({id:user.id,email,display_name:email.split("@")[0]});await supabase.from("memberships").upsert({organization_id:organizationId,profile_id:user.id,email,role,status:"active",activated_at:new Date().toISOString()},{onConflict:"organization_id,email"});process.stdout.write(`Acesso preparado: ${role}\n`);}
process.stdout.write(`${invitedUsers.length} acesso(s) configurado(s).\n`);
