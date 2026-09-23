'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('tr-TR', {style:'currency',currency:'TRY'}).format(n);
const products = [
 {id:'filter',name:'Filtre Kahve Aboneliği',price:650,category:'coffee',image:'filter.jpg',tag:'HER SEFERİNDE YENİ BİR KEŞİF',sub:'Mevsimsel seçki · Filtre',description:'Filtre kahve seçkisinden farklı kökenleri tanımanın bir yolu. Düzenli kahve keşifleri için hazırlanmış referans abonelik ürünü.',grind:true},
 {id:'mineral',name:'Su Minerali × APAX LAB',price:850,category:'equipment',image:'mineral.jpg',tag:'DEMLEMENİN İNCE AYARI',sub:'Su mineral konsantresi',description:'APAX LAB iş birliğiyle hazırlanan su mineral konsantresi. Demleme suyunun mineral yapısıyla kahve deneyimini keşfetmek isteyenler için.',grind:false},
 {id:'bags',name:'Demleme Poşetleri',price:500,category:'coffee',image:'bags.jpg',tag:'KAHVEN HEP YANINDA',sub:'SIBARIST',description:'SIBARIST iş birliğiyle hazırlanan demleme poşetleri. Kahveni suyla buluşturmak için sade ve pratik bir yöntem; evde, ofiste veya yolda.',grind:false},
 {id:'espresso',name:'Espresso Aboneliği',price:650,category:'coffee',image:'espresso.jpg',tag:'GÜNLÜK RİTÜELİN',sub:'Mevsimsel seçki · Espresso',description:'Espresso için hazırlanmış abonelik seçkisi. Farklı kahve kökenlerini günlük espresso ritüeline taşıyan referans plan.',grind:true}
];
let cart = [];
let currentFilter = 'all';
let brew = 'Filtre';
let focusBeforeDialog;
let toastTimer;
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notify(message){ $('#toast').textContent=message; $('#toast').classList.add('show'); clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000); }
function openDialog(id){const d=$(id);focusBeforeDialog=document.activeElement;d.showModal();document.body.classList.add('no-scroll');}
function closeDialog(d){d.close();}
$$('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!$$('dialog[open]').length){document.body.classList.remove('no-scroll');focusBeforeDialog?.focus();}});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});$('.dialog-close',d).addEventListener('click',()=>closeDialog(d));});
function renderProducts(filter='all'){
 if(!['all','coffee','equipment'].includes(filter))throw new Error('Geçersiz ürün kategorisi.');
 currentFilter=filter;const visible=products.filter(p=>filter==='all'||p.category===filter);
 $('#product-grid').innerHTML=visible.map(p=>`<article class="product-card"><div class="product-photo"><button class="card-open" data-detail="${p.id}" aria-label="${p.name} ürününü incele"><img src="assets/${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span></button><button class="quick-add" data-add="${p.id}" aria-label="${p.name} sepete ekle">+</button></div><div class="product-info"><h3><button class="plain" data-detail="${p.id}">${p.name}</button></h3><p>${money(p.price)}</p></div><p class="product-sub">${p.sub}</p></article>`).join('');
 $('#product-total').textContent=`${visible.length} ürün`;
 $$('[data-filter]').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
}
function detail(id){
 const p=products.find(p=>p.id===id);if(!p)throw new Error('Ürün bulunamadı.');
 $('#product-detail').innerHTML=`<div class="detail-layout"><img src="assets/${p.image}" alt="${p.name}"><div class="detail-copy"><p class="eyebrow">${p.sub}</p><h2 id="dialog-title">${p.name}</h2><p>${p.description}</p><div class="detail-price">${money(p.price)}</div>${p.grind?'<label for="grind">Öğütme tercihin</label><select id="grind"><option>Çekirdek</option><option>Filtre öğütüm</option><option>Espresso öğütüm</option><option>French press öğütüm</option></select>':''}<button class="button" id="detail-add">Sepete ekle <span>+</span></button><p class="fine">Referans ürün ve fiyat. Bu önizlemede sipariş verilmez.</p></div></div>`;
 $('#detail-add').addEventListener('click',()=>{addToCart(id,$('#grind')?.value||'Standart');closeDialog($('#product-dialog'));});
 openDialog('#product-dialog');
}
function addToCart(id,option){
 const p=products.find(p=>p.id===id);if(!p)throw new Error('Ürün bulunamadı.');
 option=option||(p.grind?'Çekirdek':'Standart');if(!['Çekirdek','Filtre öğütüm','Espresso öğütüm','French press öğütüm','Standart'].includes(option))throw new Error('Geçersiz seçenek.');
 const item=cart.find(x=>x.id===id&&x.option===option);
 if(item){if(item.qty>=20){notify('Bir üründen en fazla 20 adet seçebilirsin.');return;}item.qty++;}else cart.push({id,option,qty:1});
 renderCart();notify(`${p.name} sepete eklendi.`);
}
function totals(){return {quantity:cart.reduce((n,x)=>n+x.qty,0),total:Math.round(cart.reduce((n,x)=>n+products.find(p=>p.id===x.id).price*x.qty,0)*100)/100};}
function renderCart(){
 const t=totals();$('#cart-count').textContent=t.quantity;
 $('#cart-open').setAttribute('aria-label',`Sepet, ${t.quantity} ürün`);
 if(!cart.length){$('#cart-items').innerHTML='<div class="cart-empty"><p>Sepetin yeni keşiflere hazır.<br>İlk kahveni seçerek başlayabilirsin.</p><button class="button" id="continue-shopping">Kahveleri keşfet ↗</button></div>';$('#cart-summary').innerHTML='';$('#continue-shopping').addEventListener('click',()=>{closeDialog($('#cart-dialog'));$('#kahveler').scrollIntoView({behavior:'smooth'});});return;}
 $('#cart-items').innerHTML=cart.map((x,i)=>{const p=products.find(p=>p.id===x.id);return `<article class="cart-item"><img src="assets/${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><small>${escapeHTML(x.option)}</small><div class="qty-row"><div class="qty-controls"><button data-qty="${i}" data-delta="-1" aria-label="${p.name} adedini azalt">−</button><span>${x.qty}</span><button data-qty="${i}" data-delta="1" aria-label="${p.name} adedini artır" ${x.qty>=20?'disabled':''}>+</button></div><span>${money(p.price*x.qty)}</span></div></div></article>`;}).join('');
 $('#cart-summary').innerHTML=`<div class="cart-total"><span>Ara toplam</span><span>${money(t.total)}</span></div><button class="button" id="review-cart">Seçimimi incele <span>↗</span></button><p class="fine">Bu bir tasarım önizlemesidir. Ödeme alınmaz, sipariş oluşturulmaz. Sepet yalnızca bu sayfa açıkken tutulur.</p>`;
 $('#review-cart').addEventListener('click',()=>{closeDialog($('#cart-dialog'));info('Seçimin hazır.',`<p>${t.quantity} ürün · Ara toplam <strong>${money(t.total)}</strong></p><p>Bu örnek sayfada alışveriş deneyimini inceleyebilirsin. Ödeme altyapısı bağlı olmadığı için sipariş oluşturulmaz ve ücret alınmaz.</p>`);});
}
function info(title,body){$('#info-content').innerHTML=`<h2 id="info-title">${title}</h2>${body}`;openDialog('#info-dialog');}
$('#product-grid').addEventListener('click',e=>{const d=e.target.closest('[data-detail]');const a=e.target.closest('[data-add]');if(d)detail(d.dataset.detail);if(a)addToCart(a.dataset.add);});
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>renderProducts(b.dataset.filter)));
$('#cart-open').addEventListener('click',()=>{renderCart();openDialog('#cart-dialog');});
$('#cart-items').addEventListener('click',e=>{const b=e.target.closest('[data-qty]');if(!b)return;const i=Number(b.dataset.qty),delta=Number(b.dataset.delta);if(!cart[i])return;cart[i].qty=Math.min(20,cart[i].qty+delta);if(cart[i].qty<=0)cart.splice(i,1);renderCart();});
$('#menu-toggle').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');$('#menu-toggle').textContent=open?'×':'☰';});
function closeMenu(){$('nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label','Menüyü aç');$('#menu-toggle').textContent='☰';}
$$('nav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$('#vision-open').addEventListener('click',()=>info('İyi kahveye yaklaşımımız.','<p>Kahvenin yetiştiği bölgeyi, üretim yöntemini ve üreticinin emeğini anlamakla başlarız. Her çekirdeğin kendi karakterini göstermesine alan açarız.</p><ul><li>Kökeni anlaşılır, mevsimsel bir seçki.</li><li>Çekirdeğin karakterini öne çıkaran kavurma.</li><li>Her fincanda özen ve tutarlılık.</li></ul>'));
$('#privacy-open').addEventListener('click',()=>info('Gizlilik ve önizleme.','<p>Bu örnek sayfa analiz veya reklam çerezi kullanmaz. Sepet, yalnızca açık olan sayfanın belleğinde tutulur; yenilediğinde sıfırlanır.</p><p>Ödeme ve gerçek sipariş altyapısı bağlı değildir.</p><p>Görseller, ürünler, referans fiyatlar ve mekân bilgileri Türkiye verilerine göre düzenlenmiştir.</p>'));
renderProducts();renderCart();
const modelContext=document.modelContext;
if(modelContext?.registerTool){const lifecycle=new AbortController();const register=t=>{try{Promise.resolve(modelContext.registerTool(t,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'list_coffee_products',description:'Önizleme ürünlerini, TRY fiyatlarını ve kimliklerini listeler.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({products:products.map(({id,name,price,category})=>({id,name,price,currency:'TRY',category})),filter:currentFilter})});
 register({name:'filter_coffee_products',description:'Görünür ürün seçkisini kategoriye göre filtreler.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['all','coffee','equipment']}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input.category!=='string')throw new Error('Kategori gerekli.');renderProducts(input.category);return{category:currentFilter,count:products.filter(p=>currentFilter==='all'||p.category===currentFilter).length};}});
 register({name:'stage_cart_item',description:'Ürünü yalnızca bu sayfadaki önizleme sepetine ekler. Sipariş vermez veya ödeme almaz.',inputSchema:{type:'object',properties:{productId:{type:'string',enum:products.map(p=>p.id)}},required:['productId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input.productId!=='string')throw new Error('Ürün kimliği gerekli.');addToCart(input.productId);return{...totals(),currency:'TRY',orderCreated:false};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
