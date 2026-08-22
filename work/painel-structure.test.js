const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','outputs','painel-lamelle-3d.html');

test('entregável é um documento HTML completo e autocontido',()=>{
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/^<!doctype html>/i);
  assert.match(html,/data:image\/jpeg;base64,[A-Za-z0-9+/]{1000,}={0,2}/);
  assert.doesNotMatch(html,/window\.storage/);
  assert.match(html,/lamelle:operacional:v2/);
});

test('todos os módulos operacionais estão navegáveis',()=>{
  const html=fs.readFileSync(file,'utf8');
  for(const id of ['dashboard','products','inventory','clients','orders','production','content','partners','finance','settings']){
    assert.match(html,new RegExp(`id:["']${id}["']`));
  }
});

test('aplicação oferece backup JSON, importação e exportações CSV',()=>{
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/exportJSON/);
  assert.match(html,/importJSON/);
  assert.match(html,/exportCSV/);
  assert.match(html,/application\/json/);
  assert.match(html,/text\/csv/);
});

test('pedidos, estoque, produção e caixa possuem ações conectadas',()=>{
  const html=fs.readFileSync(file,'utf8');
  for(const action of ['editOrder','stockMove',"editSimple('production')","editSimple('cash')",'receive(id)']) assert.ok(html.includes(action),`ação ausente: ${action}`);
});
