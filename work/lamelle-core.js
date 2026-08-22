(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.LamelleCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const money=v=>Math.round((n(v)+Number.EPSILON)*100)/100;
  const uid=p=>(p||'id')+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);

  function priceProduct(p={},s={}){
    const filament=n(p.grams)/1000*n(s.filamentKgPrice);
    const hours=n(p.printMinutes)/60;
    const energy=hours*0.15*n(s.kwhRate);
    const depreciation=hours*(n(s.printerValue)/(n(s.printerLifeHours)||2000));
    const failureReserve=(filament+energy+depreciation)*0.10;
    const labor=n(p.workMinutes)/60*n(s.laborHour);
    const totalCost=filament+energy+depreciation+failureReserve+labor+n(p.supplies)+n(p.packaging);
    return {filament:money(filament),energy:money(energy),depreciation:money(depreciation),failureReserve:money(failureReserve),labor:money(labor),totalCost:money(totalCost),salePrice:money(totalCost*(n(p.multiplier)||n(s.defaultMultiplier)||3)),margin:totalCost?money((1-totalCost/(totalCost*(n(p.multiplier)||n(s.defaultMultiplier)||3)))*100):0};
  }

  function volumeRate(q,individualized){ if(individualized)return 0; q=n(q); return q>=60?.20:q>=30?.15:q>=10?.10:0; }
  function orderTotals(items=[],paid=0){
    let gross=0,discount=0,cost=0;
    items.forEach(i=>{const q=Math.max(0,n(i.quantity));const subtotal=q*n(i.unitPrice);gross+=subtotal;discount+=subtotal*volumeRate(q,!!i.individualized);cost+=q*n(i.unitCost);});
    const total=gross-discount;
    return {gross:money(gross),discount:money(discount),total:money(total),cost:money(cost),profit:money(total-cost),minimumDeposit:money(total*.5),paid:money(paid),balance:money(Math.max(0,total-n(paid)))};
  }

  function productionPriority(a,b){
    const rank=x=>x.kind==='order'?(x.paid?0:1):(x.kind==='portfolio'?2:3);
    const r=rank(a)-rank(b); if(r)return r;
    return String(a.eventDate||'9999-12-31').localeCompare(String(b.eventDate||'9999-12-31'))||String(a.createdAt||'').localeCompare(String(b.createdAt||''));
  }

  function monthlySummary(state,month){
    const rows=(state.cash||[]).filter(x=>String(x.date||'').slice(0,7)===month);
    const income=rows.filter(x=>x.type==='in').reduce((a,x)=>a+n(x.amount),0);
    const expenses=rows.filter(x=>x.type==='out').reduce((a,x)=>a+n(x.amount),0);
    const receivables=(state.orders||[]).filter(x=>x.status!=='Entregue'&&x.status!=='Cancelado').reduce((a,x)=>a+Math.max(0,n(x.total)-n(x.paid)),0);
    return {income:money(income),expenses:money(expenses),net:money(income-expenses),receivables:money(receivables)};
  }

  const starterProducts=[
    ['Chaveiro com nome','Festa infantil e lembrancinha',10,25,.15,1],['Tag personalizada','Chá de bebê e casamento',5,15,.10,.8],['Caixinha temática','Doces e brindes',30,105,1.2,1.5],['Topo de bolo com nome','Aniversário',20,75,.8,2],['Litofania','Presente e casamento',40,210,.5,2],['Bicho articulado','Festa e feira',25,105,.2,1]
  ];
  const starterPosts=['Apresentação da marca','Timelapse da primeira impressão','Chaveiro personalizado','Como nasce uma peça','Litofania acendendo','5 ideias para chá de bebê','Topo de bolo','Quem faz a Lamelle','Como encomendar','Bicho articulado saindo da impressora','3 erros ao escolher a lembrancinha','Peça-destaque do mês'];
  function createInitialState(){
    const now=new Date().toISOString();
    return {version:2,updatedAt:now,settings:{businessName:'Lamelle 3D',city:'Serra · ES',printer:'Bambu Lab A1',weeklyCapacity:40,filamentKgPrice:120,kwhRate:.95,printerValue:2000,printerLifeHours:2000,laborHour:30,defaultMultiplier:3},products:starterProducts.map((x,i)=>({id:'prod-'+(i+1),name:x[0],occasion:x[1],grams:x[2],printMinutes:x[3],supplies:x[4],packaging:x[5],workMinutes:10,multiplier:3,active:true,license:'Verificar uso comercial'})),inventory:[],clients:[],orders:[],production:[],content:starterPosts.map((title,i)=>({id:'post-'+(i+1),title,week:Math.floor(i/3)+1,format:['Foto','Reels','Carrossel'][i%3],cta:['Direct','Salvar','Compartilhar'][i%3],status:'Ideia',publishDate:'',saves:0,directs:0,reach:0})),partners:[],cash:[],setup:{},launch:{prints:{}},meta:{createdAt:now}};
  }
  const arrays=['products','inventory','clients','orders','production','content','partners','cash'];
  function validateState(x){
    if(!x||typeof x!=='object'||x.version!==2||!x.settings||typeof x.settings!=='object')return {ok:false,error:'Arquivo não reconhecido como backup Lamelle 3D.'};
    const missing=arrays.find(k=>!Array.isArray(x[k]));
    return missing?{ok:false,error:'Coleção ausente: '+missing}:{ok:true};
  }
  function csvCell(v){const s=String(v==null?'':v);return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
  function toCSV(rows,columns){const cols=columns&&columns.length?columns:Object.keys(rows[0]||{});return '\uFEFF'+[cols.join(','),...rows.map(r=>cols.map(c=>csvCell(r[c])).join(','))].join('\r\n');}
  function migrateLegacy(old){
    const state=createInitialState(), c=old&&old.cfg||{};
    Object.assign(state.settings,{filamentKgPrice:n(c.precoKg)||120,kwhRate:n(c.tarifaKwh)||.95,printerValue:n(c.valorImpressora)||2000,laborHour:n(c.valorHora)||30,defaultMultiplier:n(c.multiplicador)||3});
    if(Array.isArray(old&&old.pecas)&&old.pecas.length)state.products=old.pecas.map((p,i)=>({id:p.id||uid('prod'),name:p.nome||p.n||'Produto '+(i+1),occasion:p.ocasiao||'',grams:n(p.g),printMinutes:n(p.min),workMinutes:n(p.minTrab),supplies:n(p.insumos),packaging:n(p.embalagem),multiplier:n(p.multiplicador)||state.settings.defaultMultiplier,active:true,license:'Verificar uso comercial'}));
    const clientByName=new Map();
    (old&&old.pedidos||[]).forEach(p=>{const name=p.cliente||'Cliente não informado';if(!clientByName.has(name)){const c={id:uid('cli'),name,phone:p.telefone||'',email:'',instagram:'',notes:'Importado do painel anterior'};clientByName.set(name,c);state.clients.push(c);}state.orders.push({id:p.id||uid('ped'),clientId:clientByName.get(name).id,clientName:name,status:p.status||'Orçamento enviado',eventDate:p.data||'',deliveryDate:p.data||'',items:[],total:n(p.valor),cost:0,profit:n(p.valor),paid:n(p.sinal),balance:Math.max(0,n(p.valor)-n(p.sinal)),createdAt:new Date().toISOString()});});
    state.partners=(old&&old.parceiros||[]).map(p=>({id:p.id||uid('par'),name:p.nome||'Parceiro',type:p.tipo||'Outro',contact:p.contato||'',status:p.status||'A visitar',lastContact:p.data||'',notes:p.obs||''}));
    state.setup=old&&old.setup||{};state.launch.prints=old&&old.impressao||{};
    return state;
  }
  return {n,money,uid,priceProduct,volumeRate,orderTotals,productionPriority,monthlySummary,createInitialState,validateState,toCSV,migrateLegacy};
});
