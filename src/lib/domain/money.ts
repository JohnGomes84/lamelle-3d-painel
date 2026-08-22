export const money=(value:number)=>Math.round((Number(value||0)+Number.EPSILON)*100)/100;
