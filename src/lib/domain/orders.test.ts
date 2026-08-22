import { describe,expect,it } from "vitest";
import { calculateOrder, reversePayment } from "./orders";

describe("orders",()=>{
  it("aplica volume apenas quando unidades são idênticas",()=>{expect(calculateOrder([{quantity:30,unitPrice:10,unitCost:3,individualized:false},{quantity:30,unitPrice:10,unitCost:3,individualized:true}],300)).toEqual({gross:600,discount:45,total:555,cost:180,profit:375,minimumDeposit:277.5,paid:300,balance:255,depositSatisfied:true})});
  it("reversão reduz o pago e reabre o saldo",()=>{expect(reversePayment({total:200,paid:150},50)).toEqual({paid:100,balance:100})});
});
