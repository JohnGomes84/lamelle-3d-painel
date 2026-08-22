export type AppUser={id:string};
export type Membership={role:"owner"|"member";status:"invited"|"active"|"inactive"};
export function authorize(user:AppUser|null,membership:Membership|null,minimum:"member"|"owner"){if(!user)throw new Error("Faça login para continuar.");if(!membership||membership.status!=="active")throw new Error("Seu acesso está inativo ou ainda não foi ativado.");if(minimum==="owner"&&membership.role!=="owner")throw new Error("Esta ação é exclusiva do proprietário.");return{userId:user.id,role:membership.role}}
