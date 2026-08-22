const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('./lamelle-core.js');

test('precificação inclui todos os custos, reserva de falha e multiplicador', () => {
  const result = core.priceProduct({grams:100, printMinutes:120, workMinutes:30, supplies:2, packaging:1, multiplier:3}, {filamentKgPrice:100, kwhRate:1, printerValue:2000, laborHour:30, printerLifeHours:2000});
  assert.equal(result.filament, 10);
  assert.equal(result.energy, 0.3);
  assert.equal(result.depreciation, 2);
  assert.equal(result.failureReserve, 1.23);
  assert.equal(result.labor, 15);
  assert.equal(result.totalCost, 31.53);
  assert.equal(result.salePrice, 94.59);
});

test('pedido aplica desconto por volume apenas a itens sem personalização individual', () => {
  const result = core.orderTotals([
    {quantity:30, unitPrice:10, unitCost:3, individualized:false},
    {quantity:30, unitPrice:10, unitCost:3, individualized:true}
  ], 300);
  assert.equal(result.gross, 600);
  assert.equal(result.discount, 45);
  assert.equal(result.total, 555);
  assert.equal(result.minimumDeposit, 277.5);
  assert.equal(result.balance, 255);
  assert.equal(result.profit, 375);
});

test('fila prioriza pedido pago e data do evento mais próxima', () => {
  const jobs = [
    {id:'portfolio', kind:'portfolio', eventDate:'2026-08-20', paid:false},
    {id:'later', kind:'order', eventDate:'2026-09-10', paid:true},
    {id:'soon', kind:'order', eventDate:'2026-09-01', paid:true},
    {id:'unpaid', kind:'order', eventDate:'2026-08-25', paid:false}
  ];
  assert.deepEqual([...jobs].sort(core.productionPriority).map(x=>x.id), ['soon','later','unpaid','portfolio']);
});

test('resumo mensal separa entradas, saídas, lucro e contas a receber', () => {
  const result = core.monthlySummary({
    cash:[{date:'2026-08-01',type:'in',amount:500},{date:'2026-08-02',type:'out',amount:120},{date:'2026-07-01',type:'in',amount:999}],
    orders:[{total:400,paid:200,status:'Em produção'},{total:100,paid:100,status:'Entregue'}]
  }, '2026-08');
  assert.deepEqual(result, {income:500, expenses:120, net:380, receivables:200});
});

test('validação de backup rejeita objeto incompleto e aceita estado operacional', () => {
  assert.equal(core.validateState({version:2, products:[]}).ok, false);
  const state = core.createInitialState();
  assert.equal(core.validateState(state).ok, true);
});

test('CSV escapa vírgulas, aspas e quebras de linha', () => {
  const csv = core.toCSV([{nome:'Caixa, "Jardim"', nota:'linha 1\nlinha 2'}], ['nome','nota']);
  assert.equal(csv, '\uFEFFnome,nota\r\n"Caixa, ""Jardim""","linha 1\nlinha 2"');
});

test('migração reaproveita configurações, peças, pedidos e parceiros legados', () => {
  const state = core.migrateLegacy({cfg:{precoKg:135,tarifaKwh:0.8,valorImpressora:2200,valorHora:35,multiplicador:3},pecas:[{id:'a',nome:'Topo',g:20,min:60}],pedidos:[{id:'p',cliente:'Ana',valor:100,status:'Entregue'}],parceiros:[{id:'x',nome:'Doce Festa'}]});
  assert.equal(state.settings.filamentKgPrice, 135);
  assert.equal(state.products[0].name, 'Topo');
  assert.equal(state.clients[0].name, 'Ana');
  assert.equal(state.orders[0].total, 100);
  assert.equal(state.partners[0].name, 'Doce Festa');
});
