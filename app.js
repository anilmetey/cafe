'use strict';
if (history.scrollRestoration) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('tr-TR', {style:'currency',currency:'TRY'}).format(n);
const products = [
 {id:'filter',name:'Filtre Kahve Aboneliği',price:650,category:'coffee',image:'filter.jpg',tag:'HER SEFERİNDE YENİ BİR KEŞİF',sub:'Mevsimsel seçki · Filtre',description:'Filtre kahve seçkisinden farklı kökenleri tanımanın bir yolu. Düzenli kahve keşifleri için hazırlanmış referans abonelik ürünü.',grind:true},
 {id:'beans',name:'Özel Kavrum Çekirdekler',price:450,category:'coffee',image:'beans.jpg',tag:'TAZE KAVRULMUŞ',sub:'Yöresel seçki · Çekirdek',description:'Özenle seçilmiş ve taze kavrulmuş yöresel kahve çekirdekleri. Geleneksel yöntemlere uygun aroma profilleri.',grind:true},
 {id:'cezve',name:'El Yapımı Bakır Cezve',price:1200,category:'equipment',image:'cezve.jpg',tag:'GELENEKSEL DOKUNUŞ',sub:'El İşçiliği · Bakır',description:'Ustaların elinden çıkan, kahve keyfinize geleneksel bir dokunuş katacak dövme bakır cezve.',grind:false},
 {id:'cups',name:'Geleneksel Fincan Seti',price:800,category:'equipment',image:'cups.jpg',tag:'ZARİF SUNUM',sub:'2 Kişilik Set',description:'Kahve sunumlarınızı taçlandıracak, işlemeli motiflere sahip geleneksel kahve fincan takımı.',grind:false},
 {id:'bags',name:'Demleme Poşetleri',price:500,category:'coffee',image:'bags.jpg',tag:'KAHVEN HEP YANINDA',sub:'Pratik Çözüm',description:'Kahveni suyla buluşturmak için sade ve pratik bir yöntem; evde, ofiste veya yolda.',grind:false},
 {id:'espresso',name:'Espresso Aboneliği',price:650,category:'coffee',image:'espresso.jpg',tag:'GÜNLÜK RİTÜELİN',sub:'Mevsimsel seçki · Espresso',description:'Espresso için hazırlanmış abonelik seçkisi. Farklı kahve kökenlerini günlük espresso ritüeline taşıyan referans plan.',grind:true}
];
let currentFilter = 'all';
let brew = 'Filtre';
let focusBeforeDialog;
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function openDialog(id){const d=$(id);focusBeforeDialog=document.activeElement;d.showModal();document.body.classList.add('no-scroll');}
function closeDialog(d){d.close();}
$$('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!$$('dialog[open]').length){document.body.classList.remove('no-scroll');focusBeforeDialog?.focus();}});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});$('.dialog-close',d).addEventListener('click',()=>closeDialog(d));});
function renderProducts(filter='all'){
 if(!['all','coffee','equipment'].includes(filter))throw new Error('Geçersiz ürün kategorisi.');
 currentFilter=filter;const visible=products.filter(p=>filter==='all'||p.category===filter);
 $('#product-grid').innerHTML=visible.map(p=>`<article class="product-card"><div class="product-photo"><button class="card-open" data-detail="${p.id}" aria-label="${p.name} ürününü incele"><img src="assets/${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span></button></div><div class="product-info"><h3><button class="plain" data-detail="${p.id}">${p.name}</button></h3><p>${money(p.price)}</p></div><p class="product-sub">${p.sub}</p></article>`).join('');
 $('#product-total').textContent=`${visible.length} ürün`;
 $$('[data-filter]').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
}
function detail(id){
 const p=products.find(p=>p.id===id);if(!p)throw new Error('Ürün bulunamadı.');
 $('#product-detail').innerHTML=`<div class="detail-layout"><img src="assets/${p.image}" alt="${p.name}"><div class="detail-copy"><p class="eyebrow">${p.sub}</p><h2 id="dialog-title">${p.name}</h2><p>${p.description}</p><div class="detail-price">${money(p.price)}</div></div></div>`;
 openDialog('#product-dialog');
}

function info(title,body){$('#info-content').innerHTML=`<h2 id="info-title">${title}</h2>${body}`;openDialog('#info-dialog');}
$('#product-grid').addEventListener('click',e=>{const d=e.target.closest('[data-detail]');if(d)detail(d.dataset.detail);});
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>renderProducts(b.dataset.filter)));
$('#menu-toggle').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');$('#menu-toggle').textContent=open?'×':'☰';});
function closeMenu(){$('nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label','Menüyü aç');$('#menu-toggle').textContent='☰';}
$$('nav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$('#vision-open').addEventListener('click',()=>info('İyi kahveye yaklaşımımız.','<p>Kahvenin yetiştiği bölgeyi, üretim yöntemini ve üreticinin emeğini anlamakla başlarız. Her çekirdeğin kendi karakterini göstermesine alan açarız.</p><ul><li>Kökeni anlaşılır, mevsimsel bir seçki.</li><li>Çekirdeğin karakterini öne çıkaran kavurma.</li><li>Her fincanda özen ve tutarlılık.</li></ul>'));

// Sliders
function initSlider(selector, textSelector = null) {
  const container = $(selector);
  if(!container) return;
  const imgs = $$('img', container);
  const texts = textSelector ? $$(textSelector) : [];
  if(imgs.length < 2) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('active');
    if(texts[i]) texts[i].classList.remove('active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('active');
    if(texts[i]) texts[i].classList.add('active');
  }, 3200);
}
initSlider('.hero-slider', '.hero-text-item');
initSlider('.craft-slider');

renderProducts();
const modelContext=document.modelContext;
if(modelContext?.registerTool){const lifecycle=new AbortController();const register=t=>{try{Promise.resolve(modelContext.registerTool(t,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'list_coffee_products',description:'Önizleme ürünlerini, TRY fiyatlarını ve kimliklerini listeler.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({products:products.map(({id,name,price,category})=>({id,name,price,currency:'TRY',category})),filter:currentFilter})});
 register({name:'filter_coffee_products',description:'Görünür ürün seçkisini kategoriye göre filtreler.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['all','coffee','equipment']}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input.category!=='string')throw new Error('Kategori gerekli.');renderProducts(input.category);return{category:currentFilter,count:products.filter(p=>currentFilter==='all'||p.category===currentFilter).length};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
