import { describe, expect, it } from "vitest";
import { priceProduct } from "./pricing";

describe("priceProduct",()=>{
  it("inclui custos, falha, trabalho e multiplicador",()=>{
    expect(priceProduct({grams:100,printMinutes:120,workMinutes:30,supplies:2,packaging:1,multiplier:3},{filamentKgPrice:100,kwhRate:1,printerValue:2000,printerLifeHours:2000,laborHour:30,defaultMultiplier:3})).toMatchObject({filament:10,energy:.3,depreciation:2,failureReserve:1.23,labor:15,totalCost:31.53,salePrice:94.59});
  });
  it("sinaliza multiplicador abaixo do piso saudável",()=>{
    expect(priceProduct({grams:10,printMinutes:10,workMinutes:5,supplies:0,packaging:0,multiplier:2.4},{filamentKgPrice:100,kwhRate:1,printerValue:2000,printerLifeHours:2000,laborHour:30,defaultMultiplier:3}).belowFloor).toBe(true);
  });
});
