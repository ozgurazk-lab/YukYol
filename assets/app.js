function localDate(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function activeTrip(v){return db.trips.find(t=>t.vehicleId===v.id&&t.stage!=='Teslim edildi')}
function openLoads(){return db.loads.filter(l=>!l.cancelled&&!db.trips.some(t=>t.loadId===l.id))}
function assignmentError(l,v){
 if(!l||!v)return 'Yük veya araç bulunamadı.';
 if(l.cancelled||db.trips.some(t=>t.loadId===l.id))return 'Bu yük artık açık değil.';
 if(activeTrip(v))return 'Aracın aktif taşıması var. Önce teslimatı tamamla.';
 const f=fits(l,v);if(!f.ok)return 'Araç bu yüke uygun değil: '+f.why.join(', ');
 if(!Number.isFinite(Date.parse(l.pickupTime))||Date.parse(l.deliveryTime)<=Date.parse(l.pickupTime))return 'Yükün zaman bilgileri geçersiz.';
 if(!Number.isFinite(Date.parse(l.deliveryTime)))return 'Teslim zamanı geçersiz.';
 if(Date.parse(l.pickupTime)<Date.now())return 'Bu yükün yükleme zamanı geçmiş.';
 return '';
}

const K='sevkio_ops_v3',today=localDate(new Date(Date.now()+86400000));
const seed={
 loads:[
  {id:'L1',loadNo:'SV-2026-1001',from:'Batman',to:'Gaziantep',price:24500,pickupAddress:'Batman OSB 3. Cadde',deliveryAddress:'Gaziantep 4. OSB',cargoType:'Yapı malzemesi',vehicleType:'Tır',body:'Tenteli',pallets:12,height:160,weight:12000,pickupTime:today+'T09:30',deliveryTime:today+'T15:40',receiverCompany:'Başpınar Yapı Depo',receiverCompanyVkn:'2222222222',receiver:'Ahmet Demir',receiverPhone:'0532 111 22 33',notes:'12 palet • Forklift hazır'},
  {id:'L2',loadNo:'SV-2026-1002',from:'Gaziantep',to:'Mersin',price:18000,pickupAddress:'Başpınar OSB',deliveryAddress:'Mersin Akdeniz Sanayi',cargoType:'Tekstil',vehicleType:'Tır',weight:9800,pickupTime:today+'T17:30',deliveryTime:today+'T22:00',receiverCompany:'Akdeniz Tekstil Depo',receiverCompanyVkn:'3333333333',receiver:'Murat Kaya',receiverPhone:'0533 555 19 19',notes:'Sonraki yük için uygun'},
  {id:'L3',loadNo:'SV-2026-1003',from:'Diyarbakır',to:'Mersin',price:26000,pickupAddress:'Diyarbakır OSB',deliveryAddress:'Mersin Lojistik Bölgesi',cargoType:'Gıda',vehicleType:'Frigorifik',body:'Frigorifik',weight:8000,pickupTime:today+'T10:00',deliveryTime:today+'T18:30',receiverCompany:'Mersin Soğuk Depo',receiverCompanyVkn:'4444444444',receiver:'Serkan Yıldız',receiverPhone:'0544 222 33 44',notes:'Soğuk zincir'},
  {id:'L4',loadNo:'SV-2026-1004',from:'Kahramanmaraş',to:'Ankara',price:31500,pickupAddress:'Kahramanmaraş OSB',deliveryAddress:'Ankara Sincan OSB',cargoType:'Tekstil',vehicleType:'Tır',weight:14000,pickupTime:today+'T18:00',deliveryTime:today+'T23:59',receiverCompany:'Anadolu Tekstil',receiverCompanyVkn:'5555555555',receiver:'Kemal Aydın',receiverPhone:'0535 410 20 30',notes:'Akşam yükleme'},
  {id:'L5',loadNo:'SV-2026-1005',from:'Osmaniye',to:'İzmir',price:36000,pickupAddress:'Osmaniye OSB',deliveryAddress:'İzmir Kemalpaşa OSB',cargoType:'Paletli ürün',vehicleType:'Tır',body:'Tenteli',pallets:22,height:180,weight:16000,pickupTime:today+'T19:30',deliveryTime:today+'T23:59',receiverCompany:'Ege Depo',receiverCompanyVkn:'6666666666',receiver:'Burak Şen',receiverPhone:'0536 300 40 50',notes:'22 palet'},
  {id:'L6',loadNo:'SV-2026-1006',from:'Adana',to:'İstanbul',price:39500,pickupAddress:'Adana Hacı Sabancı OSB',deliveryAddress:'İstanbul Tuzla',cargoType:'Makine',vehicleType:'Tır',weight:11000,pickupTime:today+'T20:00',deliveryTime:today+'T23:59',receiverCompany:'Marmara Makine',receiverCompanyVkn:'7777777777',receiver:'Elif Koç',receiverPhone:'0537 120 33 44',notes:'Vinçli indirme'},
  {id:'L7',loadNo:'SV-2026-1007',from:'Şanlıurfa',to:'Bursa',price:34000,pickupAddress:'Şanlıurfa OSB',deliveryAddress:'Bursa Nilüfer OSB',cargoType:'Gıda',vehicleType:'Tır',weight:13000,pickupTime:today+'T18:30',deliveryTime:today+'T23:59',receiverCompany:'Uludağ Gıda',receiverCompanyVkn:'8888888888',receiver:'Can Öztürk',receiverPhone:'0538 600 11 22',notes:'Kuru gıda'},
  {id:'L8',loadNo:'SV-2026-1008',from:'Hatay',to:'Konya',price:22000,pickupAddress:'İskenderun Limanı',deliveryAddress:'Konya OSB',cargoType:'Yapı malzemesi',vehicleType:'Kamyon',weight:8500,pickupTime:today+'T17:00',deliveryTime:today+'T23:30',receiverCompany:'Selçuklu Yapı',receiverCompanyVkn:'9999999999',receiver:'Okan Er',receiverPhone:'0539 700 80 90',notes:'Liman çıkışlı'},
  {id:'L9',loadNo:'SV-2026-1009',from:'Gaziantep',to:'Gaziantep',price:3200,pickupAddress:'Başpınar OSB 2. Bölge',deliveryAddress:'Gaziantep Şehitkamil Toptancılar Sitesi',cargoType:'Paletli ürün',vehicleType:'Kamyonet',body:'Kapalı kasa',pallets:4,height:150,weight:2200,pickupTime:today+'T14:00',deliveryTime:today+'T16:00',receiverCompany:'Antep Toptan Gıda',receiverCompanyVkn:'1212121212',receiver:'Yusuf Tan',receiverPhone:'0542 300 12 12',notes:'Şehir içi dağıtım'}
 ],
 vehicles:[
  {id:'V1',plate:'72 YY 001',type:'Tır',capacity:18000,driver:'Mehmet Kaya',company:'Kaya Nakliyat',phone:'0530 000 00 00',location:'Şanlıurfa yolu / Nizip yönü',status:'Yolda',speed:78,lastGps:'2 dk önce',fuel:63,rating:4.9,nextAvailable:'16:10',verified:true,regions:['Batman|Merkez|Batman OSB','Gaziantep|Şehitkamil|Başpınar OSB','Gaziantep|Nizip|Sanayi Bölgesi']},
  {id:'V2',plate:'21 YY 003',type:'Frigorifik',capacity:10000,driver:'Ali Güven',company:'Güven Soğuk Taşıma',phone:'0532 000 00 00',location:'Diyarbakır OSB',status:'Yükleme bekliyor',speed:0,lastGps:'1 dk önce',fuel:81,rating:4.8,nextAvailable:'19:00',verified:true,regions:['Diyarbakır|Bağlar|Diyarbakır OSB','Mersin|Akdeniz|Liman Bölgesi']},
  {id:'V3',plate:'63 YY 441',type:'Kamyon',capacity:9000,driver:'Hasan Polat',company:'Mezopotamya Lojistik',phone:'0533 000 00 00',location:'Şanlıurfa çevre yolu',status:'Boş',speed:0,lastGps:'5 dk önce',fuel:48,rating:4.7,nextAvailable:'Şimdi',verified:false,regions:['Gaziantep|Nizip|Sanayi Bölgesi','Gaziantep|Şehitkamil|Başpınar OSB']},
  {id:'V4',plate:'27 YY 214',type:'Kamyonet',body:'Kapalı kasa',capacity:3500,pallets:4,height:180,scope:'Şehir içi',driver:'Kadir Aslan',company:'Aslan Dağıtım',phone:'0534 000 00 00',location:'Gaziantep Başpınar OSB',status:'Boş',speed:0,lastGps:'3 dk önce',fuel:70,rating:4.6,nextAvailable:'Şimdi',verified:true,regions:['Gaziantep|Şehitkamil|Başpınar OSB']}
 ],
 trips:[
  {id:'T1',loadId:'L1',vehicleId:'V1',stage:'Yolda',progress:58,eta:'15:52',distanceLeft:118,emptyKm:22,delay:12,pickupConfirmed:true,pickupAt:'09:42',unloadAt:null,deliveredAt:null,pod:false,receiverConfirmed:false}
 ],
 companies:[
  {id:'C1',name:'Güney Yapı A.Ş.',city:'Batman',district:'Merkez',zone:'Batman OSB',paymentDays:7,paymentScore:4.9,opsScore:4.7,totalScore:4.8,reviews:18,loadingWait:22,unloadingWait:18},
  {id:'C2',name:'Başpınar Tekstil',city:'Gaziantep',district:'Şehitkamil',zone:'Başpınar OSB',paymentDays:3,paymentScore:5.0,opsScore:4.8,totalScore:4.9,reviews:31,loadingWait:15,unloadingWait:12},
  {id:'C3',name:'Dicle Gıda',city:'Diyarbakır',district:'Bağlar',zone:'Diyarbakır OSB',paymentDays:21,paymentScore:4.2,opsScore:4.4,totalScore:4.3,reviews:12,loadingWait:38,unloadingWait:44},
  {id:'C4',name:'Akdeniz Depolama',city:'Mersin',district:'Akdeniz',zone:'Liman Bölgesi',paymentDays:5,paymentScore:4.8,opsScore:4.6,totalScore:4.7,reviews:26,loadingWait:20,unloadingWait:17},
  {id:'C5',name:'Nizip Ambalaj',city:'Gaziantep',district:'Nizip',zone:'Sanayi Bölgesi',paymentDays:10,paymentScore:4.6,opsScore:4.5,totalScore:4.6,reviews:14,loadingWait:25,unloadingWait:21}
 ],
 driverRatings:[
  {driver:'Mehmet Kaya',plate:'72 YY 001',score:4.9,reviews:42,lastComment:'Zamanında teslim, iletişim çok iyi.'},
  {driver:'Ali Güven',plate:'21 YY 003',score:4.8,reviews:27,lastComment:'Soğuk zincir sürecini eksiksiz yönetti.'},
  {driver:'Hasan Polat',plate:'63 YY 441',score:4.7,reviews:19,lastComment:'Yük güvenliği iyi, iletişim düzenli.'}
 ],
 companyRatings:[
  {company:'Güney Yapı A.Ş.',score:4.8,paymentScore:4.9,reviews:18,lastComment:'Ödeme zamanında, yükleme hızlı.'},
  {company:'Başpınar Tekstil',score:4.9,paymentScore:5.0,reviews:31,lastComment:'Aynı gün evrak, 3 günde ödeme.'},
  {company:'Dicle Gıda',score:4.3,paymentScore:4.2,reviews:12,lastComment:'Boşaltmada zaman zaman bekleme var.'}
 ],
 payments:[
  {id:'P1',loadNo:'SV-2026-1001',driver:'Mehmet Kaya',amount:7800,due:'2026-10-08',status:'Bekliyor'},
  {id:'P2',loadNo:'SV-2026-0984',driver:'Ali Güven',amount:9200,due:'2026-10-03',status:'Ödendi'},
  {id:'P3',loadNo:'SV-2026-0971',driver:'Hasan Polat',amount:6400,due:'2026-10-01',status:'Ödendi'}
 ],
 conversations:[
  {id:'M1',name:'Mehmet Kaya',plate:'72 YY 001',last:'Gaziantep girişindeyim.',time:'15:06'},
  {id:'M2',name:'Ali Güven',plate:'21 YY 003',last:'Yükleme başladı.',time:'14:42'},
  {id:'M3',name:'Hasan Polat',plate:'63 YY 441',last:'Yeni yük bakıyorum.',time:'13:18'}
 ],
 notifications:[
  {level:'red',title:'Gecikme riski',text:'63 YY 441 tahminen 35 dk geç varacak.',action:'Canlı takibi aç'},
  {level:'amber',title:'Teslim saati yaklaşıyor',text:'72 YY 001 Gaziantep’e 46 dk sonra teslim edecek.',action:'Taşımayı aç'},
  {level:'green',title:'Belge yüklendi',text:'SV-2026-0984 numaralı yükün teslim belgesi hazır.',action:'Belgeyi gör'},
  {level:'blue',title:'Yeni eşleşme',text:'Gaziantep → Mersin yükün için %92 uygun bir araç bulundu.',action:'Eşleşmeyi gör'}
 ],
 docs:[
  {name:'Yük emri',loadNo:'SV-2026-1001',status:'Oluşturuldu',time:'08:55'},
  {name:'Yükleme onayı',loadNo:'SV-2026-1001',status:'Onaylandı',time:'09:42'},
  {name:'Konum kaydı',loadNo:'SV-2026-1001',status:'Aktif',time:'Sürekli'}
 ]
};
let db=JSON.parse(localStorage.getItem(K)||'null')||seed,selectedTrip='T1';
if((db.seedVersion||1)<2){seed.loads.forEach(x=>{const e=db.loads.find(y=>y.id===x.id);if(!e)db.loads.push(x);else if(e.price==null)e.price=x.price});db.seedVersion=2;localStorage.setItem(K,JSON.stringify(db))}
if(db.seedVersion<3){seed.loads.forEach(x=>{const e=db.loads.find(y=>y.id===x.id);if(!e)db.loads.push(x);else['body','pallets','height'].forEach(k=>{if(e[k]==null&&x[k]!=null)e[k]=x[k]})});seed.vehicles.forEach(x=>{if(!db.vehicles.some(y=>y.id===x.id))db.vehicles.push(x)});db.seedVersion=3;localStorage.setItem(K,JSON.stringify(db))}
const CITY={'Adana':[37.00,35.32],'Adıyaman':[37.76,38.28],'Afyonkarahisar':[38.76,30.54],'Ağrı':[39.72,43.05],'Aksaray':[38.37,34.03],'Amasya':[40.65,35.83],'Ankara':[39.93,32.86],'Antalya':[36.89,30.71],'Ardahan':[41.11,42.70],'Artvin':[41.18,41.82],'Aydın':[37.85,27.85],'Balıkesir':[39.65,27.89],'Bartın':[41.64,32.34],'Batman':[37.89,41.13],'Bayburt':[40.26,40.23],'Bilecik':[40.14,29.98],'Bingöl':[38.88,40.50],'Bitlis':[38.40,42.11],'Bolu':[40.74,31.61],'Burdur':[37.72,30.29],'Bursa':[40.19,29.06],'Çanakkale':[40.15,26.41],'Çankırı':[40.60,33.62],'Çorum':[40.55,34.95],'Denizli':[37.78,29.09],'Diyarbakır':[37.91,40.24],'Düzce':[40.84,31.16],'Edirne':[41.68,26.56],'Elazığ':[38.67,39.22],'Erzincan':[39.75,39.49],'Erzurum':[39.90,41.27],'Eskişehir':[39.78,30.52],'Gaziantep':[37.07,37.38],'Giresun':[40.91,38.39],'Gümüşhane':[40.46,39.48],'Hakkari':[37.58,43.74],'Hatay':[36.20,36.16],'Iğdır':[39.92,44.04],'Isparta':[37.76,30.55],'İstanbul':[41.01,28.98],'İzmir':[38.42,27.14],'Kahramanmaraş':[37.58,36.94],'Karabük':[41.20,32.62],'Karaman':[37.18,33.22],'Kars':[40.60,43.10],'Kastamonu':[41.39,33.78],'Kayseri':[38.73,35.49],'Kilis':[36.72,37.12],'Kırıkkale':[39.85,33.51],'Kırklareli':[41.73,27.23],'Kırşehir':[39.15,34.16],'Kocaeli':[40.77,29.92],'Konya':[37.87,32.48],'Kütahya':[39.42,29.98],'Malatya':[38.35,38.31],'Manisa':[38.61,27.43],'Mardin':[37.31,40.74],'Mersin':[36.81,34.64],'Muğla':[37.22,28.36],'Muş':[38.75,41.49],'Nevşehir':[38.62,34.71],'Niğde':[37.97,34.68],'Ordu':[40.98,37.88],'Osmaniye':[37.07,36.25],'Rize':[41.02,40.52],'Sakarya':[40.78,30.40],'Samsun':[41.29,36.33],'Şanlıurfa':[37.17,38.79],'Siirt':[37.93,41.94],'Sinop':[42.03,35.15],'Şırnak':[37.52,42.46],'Sivas':[39.75,37.02],'Tekirdağ':[40.98,27.51],'Tokat':[40.31,36.55],'Trabzon':[41.00,39.72],'Tunceli':[39.11,39.55],'Uşak':[38.68,29.41],'Van':[38.50,43.38],'Yalova':[40.65,29.27],'Yozgat':[39.82,34.81],'Zonguldak':[41.45,31.79]};
const cityKey=n=>Object.keys(CITY).find(c=>norm(c)===norm(n));
function roadKm(a,b){const A=CITY[cityKey(a)],B=CITY[cityKey(b)];if(!A||!B)return null;const r=Math.PI/180,dl=(B[0]-A[0])*r,dg=(B[1]-A[1])*r,h=Math.sin(dl/2)**2+Math.cos(A[0]*r)*Math.cos(B[0]*r)*Math.sin(dg/2)**2;return Math.round(6371*2*Math.asin(Math.sqrt(h))*1.25)}
const norm=s=>(s||'').trim().toLocaleLowerCase('tr-TR'),uid=p=>p+Math.random().toString(36).slice(2,8).toUpperCase(),money=n=>Number(n).toLocaleString('tr-TR');
const dec=(n,d=1)=>Number(n).toFixed(d).replace('.',','),fmtDate=v=>{const d=new Date(v);return isNaN(d)?v:d.toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'})},fmtDT=v=>{const d=new Date(v);return isNaN(d)?(v||''):d.toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})};
// Keep demo departures usable on first installation of this version.
if((db.seedVersion||0)<4){
 seed.loads.forEach(sample=>{const l=db.loads.find(l=>l.id===sample.id);if(l&&!l.edited&&!db.trips.some(t=>t.loadId===l.id)){
  l.pickupTime=sample.pickupTime;
  l.deliveryTime=new Date(Date.parse(l.pickupTime)+Math.max(2,Math.ceil((roadKm(l.from,l.to)||120)/60))*3600000).toISOString();
 }});db.seedVersion=4;localStorage.setItem(K,JSON.stringify(db));
}
function save(){localStorage.setItem(K,JSON.stringify(db));renderAll()}
const VEHICLE_DEFAULTS={'Kamyonet':{capacity:3500,pallets:4,height:180,body:'Kapalı kasa',scope:'Şehir içi'},'Kamyon':{capacity:9000,pallets:12,height:240,body:'Tenteli',scope:'Her ikisi'},'Tır':{capacity:24000,pallets:33,height:270,body:'Tenteli',scope:'Şehirler arası'},'Frigorifik':{capacity:20000,pallets:33,height:260,body:'Frigorifik',scope:'Şehirler arası'}};
const vspec=v=>({...(VEHICLE_DEFAULTS[v.type]||VEHICLE_DEFAULTS['Tır']),...Object.fromEntries(Object.entries(v).filter(([,x])=>x!=null&&x!==''))});
const isCityLoad=l=>norm(l.from)===norm(l.to);
function fits(l,v){
 const s=vspec(v),why=[],need=l.body&&l.body!=='Fark etmez'?l.body:(l.vehicleType==='Frigorifik'?'Frigorifik':null);
 if(l.vehicleType&&l.vehicleType!==v.type)why.push('araç tipi farklı');
 if(+l.weight>+s.capacity)why.push('ağırlık fazla');
 if(need&&s.body!==need&&!(need==='Kapalı kasa'&&s.body==='Frigorifik'))why.push(need.toLocaleLowerCase('tr-TR')+' gerekiyor');
 if(+l.pallets&&+s.pallets&&+l.pallets>+s.pallets)why.push('palet sayısı fazla');
 if(+l.height&&+s.height&&+l.height>+s.height)why.push('yük kasaya sığmaz');
 if(s.scope==='Şehir içi'&&!isCityLoad(l))why.push('şehirler arası yük');
 return {ok:!why.length,why};
}
function myVehicle(){const s=getSession();return s&&s.role==='driver'?db.vehicles.find(x=>x.plate===s.plate)||null:null}
function loadSpecChips(l){return (l.body&&l.body!=='Fark etmez'?`<span class="chip">${escapeHtml(l.body)}</span>`:'')+(l.pallets?`<span class="chip">${l.pallets} palet</span>`:'')+(l.height?`<span class="chip">${l.height} cm yükseklik</span>`:'')+(isCityLoad(l)?'<span class="chip amber">Şehir içi</span>':'')}
function togglePassword(id,btn){const el=document.getElementById(id);if(!el)return;const show=el.type==='password';el.type=show?'text':'password';btn.setAttribute('aria-label',show?'Şifreyi gizle':'Şifreyi göster');btn.setAttribute('aria-pressed',String(show))}
function setAuthGate(show){const g=document.getElementById('authGate');g.style.display=show?'':'none';document.documentElement.classList.toggle('auth-open',show);document.body.classList.toggle('auth-open',show);if(!show){g.scrollTop=0;window.scrollTo(0,0)}}
function openMobileNav(){document.body.classList.add('mobile-nav-open')}
function closeMobileNav(){document.body.classList.remove('mobile-nav-open')}
function go(id){
 const session=getSession();
 const driverAllowed=['driver','driverJobs','driverEarnings','driverProfile','backhaul','ratings','delivery'];
 const companyAllowed=['dashboard','loads','vehicles','matches','trips','backhaul','delivery','ratings','regional','payments','messages','notifications','docs','support'];
 if(session){
   const allowed=session.role==='driver'?driverAllowed:companyAllowed;
   if(!allowed.includes(id)){alert('Bu ekran hesabınıza açık değil.');id=session.role==='driver'?'driver':'dashboard';}
 }
 document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
 const target=document.getElementById(id);if(target)target.classList.add('active');
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
 const crumb=document.getElementById('crumb'),h=target&&target.querySelector('h1,h2');if(crumb)crumb.textContent=id==='dashboard'?'Genel bakış':(h?h.textContent:'');
 closeMobileNav();
 window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.target));
function load(id){return db.loads.find(x=>x.id===id)}
function vehicle(id){return db.vehicles.find(x=>x.id===id)}
function trip(){
 const s=getSession(),own=s?.role==='driver'?myVehicle():null;
 const rows=s?.role==='driver'?db.trips.filter(t=>own&&t.vehicleId===own.id):db.trips;
 return rows.find(t=>t.id===selectedTrip)||rows.find(t=>t.stage!=='Teslim edildi')||rows[0]||null;
}
function renderStats(){document.getElementById('sLoads').textContent=openLoads().length;document.getElementById('sVehicles').textContent=db.vehicles.length;document.getElementById('sTrips').textContent=db.trips.filter(x=>x.stage!=='Teslim edildi').length;document.getElementById('sDelivered').textContent=db.trips.filter(x=>x.stage==='Teslim edildi').length;document.getElementById('sBackhaul').textContent=getBackhaul().length}
function renderDash(){document.getElementById('dashTrips').innerHTML=db.trips.filter(t=>t.stage!=='Teslim edildi').map(t=>{const l=load(t.loadId),v=vehicle(t.vehicleId);return `<div class="item"><div class="itemtop"><div><div class="route">${escapeHtml(l.from)} → ${escapeHtml(l.to)}</div><div class="muted">${escapeHtml(l.loadNo)} • ${escapeHtml(v.plate)} • ${escapeHtml(v.driver)}</div></div><span class="chip green">${escapeHtml(t.stage)}</span></div><div class="progress"><div class="bar" style="width:${t.progress}%"></div></div><div class="chips"><span class="chip blue">Varış ${escapeHtml(t.eta)}</span><span class="chip">${t.distanceLeft} km kaldı</span>${t.delay?`<span class="chip ${t.delay>20?'red':'amber'}">${t.delay} dk gecikme</span>`:'<span class="chip green">Zamanında</span>'}</div></div>`}).join('')||'<div class="empty">Şu an yolda taşıma yok.</div>'}
function renderLoads(){
 document.getElementById('loadCount').textContent=openLoads().length+' açık yük';
 document.getElementById('loadList').innerHTML=openLoads().map(x=>`<div class="item"><div class="itemtop"><div><div class="route">${escapeHtml(x.from)} → ${escapeHtml(x.to)}</div><div class="muted">${escapeHtml(x.loadNo)} • ${escapeHtml(x.cargoType)}</div></div><span class="chip blue">${x.vehicleType}</span></div><div class="chips"><span class="chip">${money(x.weight)} kg</span>${loadSpecChips(x)}<span class="chip">${escapeHtml(x.receiverCompany||x.receiver)}</span></div><p class="muted small">${escapeHtml(x.pickupAddress)} → ${escapeHtml(x.deliveryAddress)}</p>${x.receiverCompany?'<div class="detail" style="margin-top:10px"><small>Alıcı firma</small><b>'+escapeHtml(x.receiverCompany)+' • VKN '+escapeHtml(x.receiverCompanyVkn)+'</b></div>':''}${x.pickupMediaCount?'<button class="btn soft" style="margin-top:10px" onclick="openMedia(\''+x.id+'\',\'Yükleme fotoğrafları\')"><svg class="ui-icon"><use href="#ic-image"></use></svg>Yük fotoğraflarını gör ('+x.pickupMediaCount+')</button>':''}<div class="btn-row" style="margin-top:12px"><button class="btn soft" onclick="editLoad('${x.id}')">Düzenle</button><button class="btn danger" onclick="cancelLoad('${x.id}')">İptal et</button></div></div>`).join('');
}
function renderVehicles(){document.getElementById('vehicleList').innerHTML=db.vehicles.map(v=>`<div class="card"><div class="itemtop"><div><div class="route">${escapeHtml(v.plate)}</div><div class="muted">${escapeHtml(v.company)}</div></div><span class="chip ${v.status==='Yolda'?'green':v.status==='Boş'?'blue':'amber'}">${escapeHtml(v.status)}</span></div><div class="chips"><span class="chip">${escapeHtml(v.type)}</span><span class="chip">${escapeHtml(vspec(v).body)}</span><span class="chip">${money(v.capacity)} kg</span><span class="chip">${vspec(v).pallets} palet</span><span class="chip">${vspec(v).height} cm iç yükseklik</span><span class="chip">${escapeHtml(vspec(v).scope)}</span><span class="chip">★ ${dec(v.rating)}</span></div><div class="ops-grid" style="margin-top:12px"><div class="detail"><small>Konum</small><b>${escapeHtml(v.location)}</b></div><div class="detail"><small>GPS</small><b>${escapeHtml(v.lastGps)}</b></div><div class="detail"><small>Hız</small><b>${v.speed} km/sa</b></div><div class="detail"><small>Yakıt</small><b>%${v.fuel}</b></div><div class="detail"><small>Şoför</small><b>${escapeHtml(v.driver)}</b></div><div class="detail"><small>Boşa çıkacağı saat</small><b>${escapeHtml(v.nextAvailable)}</b></div></div></div>`).join('')}
function score(l,v){const sp=vspec(v),used=+l.weight/+sp.capacity;let s=0;if(l.vehicleType===v.type)s+=15;if(fits(l,v).ok)s+=20;s+=used>=.5?10:used>=.25?5:0;if(isCityLoad(l)&&sp.scope!=='Şehirler arası')s+=5;if(norm(v.location).includes(norm(l.from))||v.status==='Boş')s+=20;if(v.verified)s+=10;s+=Math.round(v.rating*4);return Math.min(100,s)}
function renderMatches(){let a=[];openLoads().forEach(l=>db.vehicles.forEach(v=>{if(!assignmentError(l,v))a.push({l,v,s:score(l,v)})}));a.sort((a,b)=>b.s-a.s);document.getElementById('matchList').innerHTML=a.map(m=>`<div class="item"><div class="itemtop"><div><div class="route">${escapeHtml(m.l.from)} → ${escapeHtml(m.l.to)}</div><div class="muted">${escapeHtml(m.l.loadNo)} • ${escapeHtml(m.v.plate)} • ${escapeHtml(m.v.company)}</div></div><span class="chip blue">%${m.s} uygun</span></div><div class="chips"><span class="chip">${escapeHtml(m.v.type)} • ${vspec(m.v).body}</span><span class="chip">${money(m.l.weight)} / ${money(m.v.capacity)} kg</span>${m.l.pallets?`<span class="chip">${m.l.pallets} / ${vspec(m.v).pallets} palet</span>`:''}${isCityLoad(m.l)?'<span class="chip amber">Şehir içi</span>':''}<span class="chip">${escapeHtml(m.v.status)}</span></div><button class="btn primary" style="margin-top:12px" onclick="assignBackhaul('${m.l.id}','${m.v.id}')">Aracı ata</button></div>`).join('')||'<div class="empty">Müsait araçla eşleşen açık yük yok.</div>'}
function renderTripSelector(){document.getElementById('tripSelector').innerHTML=db.trips.filter(t=>getSession()?.role!=='driver'||vehicle(t.vehicleId)?.plate===getSession().plate).map(t=>{const l=load(t.loadId),v=vehicle(t.vehicleId);return `<button class="btn ${t.id===selectedTrip?'primary':'soft'}" onclick="selectedTrip='${t.id}';renderTrips()">${escapeHtml(v.plate)} • ${escapeHtml(l.from)} → ${escapeHtml(l.to)}</button>`}).join(' ')}
function renderTrips(){renderTripSelector();const t=trip();if(!t){renderBackhaul();return;}const l=load(t.loadId),v=vehicle(t.vehicleId);document.getElementById('tripRouteTitle').textContent=l.from+' → '+l.to;document.getElementById('tripMeta').textContent=l.loadNo+' • '+v.plate+' • '+v.driver;document.getElementById('tripStatus').textContent=t.stage;document.getElementById('mapPickup').textContent=l.from+' • '+l.pickupAddress;document.getElementById('mapDelivery').textContent=l.to+' • '+l.deliveryAddress;document.getElementById('gpsLabel').textContent=v.location+' • '+v.lastGps;document.getElementById('tripBar').style.width=t.progress+'%';
 const stages=['Atandı','Yüklemeye gidiyor','Yükleme','Yolda','Teslim noktasında','Boşaltma','Teslim edildi'];const cur=Math.max(0,stages.indexOf(t.stage));document.getElementById('tripTimeline').innerHTML=stages.map((s,i)=>`<div class="step ${i<cur?'done':i===cur?'now':''}">${s}</div>`).join('');
 document.getElementById('tripDetails').innerHTML=`<div class="detail"><small>Şu anki konum</small><b>${escapeHtml(v.location)}</b></div><div class="detail"><small>Son GPS</small><b>${escapeHtml(v.lastGps)}</b></div><div class="detail"><small>Hız</small><b>${v.speed} km/sa</b></div><div class="detail"><small>Tahmini varış</small><b>${escapeHtml(t.eta)}</b></div><div class="detail"><small>Kalan mesafe</small><b>${t.distanceLeft} km</b></div><div class="detail"><small>Gecikme</small><b>${t.delay?t.delay+' dk':'Yok'}</b></div><div class="detail"><small>Yükleme saati</small><b>${t.pickupAt||'Bekliyor'}</b></div><div class="detail"><small>Boş gidilen yol</small><b>${t.emptyKm} km</b></div><div class="detail"><small>Teslim alacak kişi</small><b>${escapeHtml(l.receiver)}</b></div><div class="detail"><small>Telefon</small><b>${escapeHtml(l.receiverPhone)}</b></div>`;
 renderDelivery();renderBackhaul();renderCitySearch()}
function advanceTrip(){
 const t=trip();if(!t)return;
 const stages=['Atandı','Yüklemeye gidiyor','Yükleme','Yolda','Teslim noktasında','Boşaltma'];
 const i=stages.indexOf(t.stage);if(i<0)return;
 if(i===stages.length-1){go('delivery');return;}
 t.stage=stages[i+1];t.progress=[0,15,30,50,90,96][i+1];
 const v=vehicle(t.vehicleId);
 if(t.stage==='Yolda'){t.pickupConfirmed=true;t.pickupAt=new Date().toLocaleString('tr-TR');}
 if(t.stage==='Teslim noktasında'){t.distanceLeft=0;v.speed=0;v.location=load(t.loadId).deliveryAddress;}
 v.status=t.stage;save();syncDriverSession();
}
function delayTrip(){const t=trip();if(!t||t.stage==='Teslim edildi')return;t.delay+=30;save();renderTrips()}
function renderDelivery(){const t=trip();if(!t){document.getElementById('deliveryInfo').innerHTML='<div class="empty">Teslim edilecek taşıma yok.</div>';return;}const l=load(t.loadId),v=vehicle(t.vehicleId);document.getElementById('receiverInput').value=l.receiver;document.getElementById('deliveryInfo').innerHTML=`<div class="detail"><small>Yük no</small><b>${escapeHtml(l.loadNo)}</b></div><div class="detail"><small>Araç</small><b>${escapeHtml(v.plate)}</b></div><div class="detail"><small>Teslim adresi</small><b>${escapeHtml(l.deliveryAddress)}</b></div><div class="detail"><small>Planlanan teslim</small><b>${fmtDT(l.deliveryTime)}</b></div><div class="detail"><small>Teslim alacak kişi</small><b>${escapeHtml(l.receiver)}</b></div><div class="detail"><small>Telefon</small><b>${escapeHtml(l.receiverPhone)}</b></div><div class="detail"><small>Teslim belgesi</small><b>${t.pod?'Tamamlandı':'Bekliyor'}</b></div><div class="detail"><small>Teslim edildi</small><b>${t.deliveredAt||'Henüz yok'}</b></div>`}
async function confirmDelivery(){
 const t=trip();if(!t||!['Teslim noktasında','Boşaltma'].includes(t.stage))return alert('Önce teslim noktasına varışını kaydet.');
 const l=load(t.loadId),doc=document.getElementById('deliveryDocument')?.files?.[0],photos=[...(document.getElementById('deliveryPhotos')?.files||[])];
 if(!doc)return alert('İrsaliye veya teslim belgesini ekle.');if(!photos.length)return alert('En az bir teslim fotoğrafı ekle.');
 try{await saveMediaFiles(l.id,'delivery',[doc,...photos])}catch(err){console.error(err);return alert('Teslim dosyaları kaydedilemedi.');}
 t.stage='Teslim edildi';t.progress=100;t.pod=true;t.receiverConfirmed=false;t.deliveredAt=new Date().toLocaleString('tr-TR');t.unloadAt=t.deliveredAt;t.deliveryNote=document.getElementById('deliveryNote').value.trim();
 l.receiver=document.getElementById('receiverInput').value||l.receiver;l.deliveryMediaCount=1+photos.length;l.deliveryDocument=doc.name;l.deliveryPhotoCount=photos.length;l.deliveryMediaNames=[doc.name,...photos.map(x=>x.name)];
 db.docs.push({name:'Teslim evrağı: '+doc.name,loadNo:l.loadNo,status:'Onaylandı',time:t.deliveredAt});db.docs.push({name:'Teslim fotoğrafları ('+photos.length+')',loadNo:l.loadNo,status:'Yüklendi',time:t.deliveredAt});db.docs.push({name:'Boşaltma kaydı',loadNo:l.loadNo,status:'Tamamlandı',time:t.deliveredAt});
 const v=vehicle(t.vehicleId);v.status='Boş';v.location=l.deliveryAddress;v.speed=0;v.nextAvailable='Şimdi';save();syncDriverSession();renderTrips();renderDelivery();go('backhaul');
}
function getBackhaul(){const t=trip();if(!t)return[];const current=load(t.loadId),v=vehicle(t.vehicleId);return openLoads().filter(l=>Date.parse(l.pickupTime)>=Date.now()&&l.id!==current.id&&norm(l.from)===norm(current.to)&&fits(l,v).ok).map(l=>({l,score:92-(Math.abs(+l.weight-(+vspec(v).capacity*.65))/1000|0)})).sort((a,b)=>b.score-a.score)}
function renderBackhaul(){const t=trip();if(!t){renderCitySearch();document.getElementById('backhaulCurrent').innerHTML='<div class="empty">Aktif taşıman yok. Şehir aramasından yük bulabilirsin.</div>';document.getElementById('backhaulList').innerHTML='';return;}const l=load(t.loadId),v=vehicle(t.vehicleId),a=getBackhaul();document.getElementById('backhaulCurrent').innerHTML=`<div class="item"><div class="route">${escapeHtml(v.plate)}</div><div class="muted">${escapeHtml(v.driver)} • ${escapeHtml(v.type)}</div><div class="chips"><span class="chip green">Teslim şehri: ${escapeHtml(l.to)}</span><span class="chip">${money(v.capacity)} kg kapasite</span></div><div class="kpis"><div class="kpi"><small>Boşa çıkış</small><b>${escapeHtml(v.nextAvailable)}</b></div><div class="kpi"><small>Yakıt</small><b>%${v.fuel}</b></div><div class="kpi"><small>Mevcut konum</small><b>${escapeHtml(l.to)}</b></div><div class="kpi"><small>Uygun yük</small><b>${a.length}</b></div></div></div>`;document.getElementById('backhaulList').innerHTML=a.length?a.map(x=>`<div class="nextload"><div class="itemtop"><div><b>${escapeHtml(x.l.from)} → ${escapeHtml(x.l.to)}</b><div class="muted">${escapeHtml(x.l.loadNo)} • ${escapeHtml(x.l.cargoType)}</div></div><span class="chip green">%${x.score} uygun</span></div><div class="chips"><span class="chip">${money(x.l.weight)} kg</span><span class="chip blue">${x.l.vehicleType}</span><span class="chip amber">Boş dönüşü önler</span></div><button class="btn primary" style="margin-top:10px" onclick="assignBackhaul('${x.l.id}')">Bu yükü ata</button></div>`).join(''):'<div class="empty">Bu şehirden şu an uygun yük yok. Yeni yükler geldikçe burada görünür.</div>'}
let citySearched=false;
function searchCity(){citySearched=true;renderCitySearch()}
function cityLoadCard(l,km){const dist=roadKm(l.from,l.to),mv=myVehicle(),f=mv?fits(l,mv):{ok:true,why:[]};return `<div class="nextload${f.ok?'':' unfit'}"><div class="itemtop"><div><b>${escapeHtml(l.from)} → ${escapeHtml(l.to)}</b><div class="muted">${escapeHtml(l.loadNo)} • ${escapeHtml(l.cargoType)} • ${money(l.weight)} kg</div></div>${l.price?`<span class="chip green">₺${money(l.price)}</span>`:'<span class="chip">Ücret sorulacak</span>'}</div><div class="chips">${km?`<span class="chip amber">${escapeHtml(l.from)} ${money(km)} km uzakta</span>`:`<span class="chip blue">Bu şehirden çıkıyor</span>`}<span class="chip">${l.vehicleType}</span>${loadSpecChips(l)}${dist?`<span class="chip">Yük yolu ~${money(dist)} km</span>`:''}${f.ok?'':`<span class="chip red">Aracına uymuyor: ${f.why.join(', ')}</span>`}</div><button class="btn ${f.ok?'primary':'soft'}" style="margin-top:10px" ${f.ok?'':'disabled'} onclick="assignBackhaul('${l.id}')">${f.ok?'Bu yükü al':'Aracına uygun değil'}</button></div>`}
function renderCitySearch(){
 const inp=document.getElementById('citySearch'),out=document.getElementById('cityResults');if(!inp||!out)return;
 const dl=document.getElementById('cityList');if(dl&&!dl.options.length)dl.innerHTML=Object.keys(CITY).map(c=>`<option value="${c}">`).join('');
 const t=trip(),cur=t?load(t.loadId):null;if(!inp.value&&cur)inp.value=cur.to;
 if(!citySearched){out.innerHTML='';return}
 const q=inp.value.trim();if(!q){out.innerHTML='<div class="empty">Bir şehir yaz.</div>';return}
 const city=cityKey(q)||q,open=openLoads().filter(l=>Date.parse(l.pickupTime)>=Date.now());
 const mv=myVehicle(),here=open.filter(l=>norm(l.from)===norm(city)).sort((a,b)=>mv?fits(b,mv).ok-fits(a,mv).ok:0);
 if(here.length){out.innerHTML=`<div class="city-result-head"><b>${city}</b> şehrinden çıkan ${here.length} yük var.</div>`+here.map(l=>cityLoadCard(l,0)).join('')+nearHtml(city,open,here,'Yakın şehirlerde de bak');return}
 if(!CITY[cityKey(q)]){out.innerHTML=`<div class="empty">"${q.replace(/[<>&"]/g,"")}" şehrini bulamadık. Listeden bir şehir seç.</div>`;return}
 out.innerHTML=`<div class="empty"><b>${city}</b> şehrinden şu an yük yok. Aşağıda en yakın şehirlerdeki yükler var.</div>`+nearHtml(city,open,[],'En yakın şehirlerdeki yükler')
}
function nearHtml(city,open,skip,title){
 const list=open.filter(l=>!skip.includes(l)&&norm(l.from)!==norm(city)).map(l=>({l,km:roadKm(city,l.from)})).filter(x=>x.km!=null).sort((a,b)=>a.km-b.km);
 const near=list.filter(x=>x.km<=150),show=near.length?near:list.slice(0,3);
 if(!show.length)return skip.length?'':'<div class="empty">Yakın şehirlerde de şu an yük yok.</div>';
 return `<div class="city-result-head">${title}${near.length?' (150 km içinde)':' (150 km içinde yük yok, en yakınlar)'}</div>`+show.map(x=>cityLoadCard(x.l,x.km)).join('')
}
function assignBackhaul(loadId,vehicleId){
 const s=getSession();if(!s)return;
 const l=load(loadId),v=s.role==='driver'?myVehicle():vehicle(vehicleId)|| (trip()?vehicle(trip().vehicleId):null);
 const error=assignmentError(l,v);if(error)return alert(error);
 const km=roadKm(l.from,l.to);
 const t={id:uid('T'),loadId:l.id,vehicleId:v.id,stage:'Atandı',progress:0,eta:fmtDT(l.deliveryTime),distanceLeft:km||0,emptyKm:0,delay:0,pickupConfirmed:false,pod:false,receiverConfirmed:false};
 db.trips.unshift(t);selectedTrip=t.id;v.status='Atandı';
 db.docs.push({name:'Yük ataması',loadNo:l.loadNo,status:'Atandı',time:new Date().toLocaleString('tr-TR')});
 save();if(s.role==='driver')syncDriverSession();go(s.role==='driver'?'driver':'trips');
}
function renderRatings(){
 const ds=document.getElementById('rateDriverSelect'),cs=document.getElementById('rateCompanySelect');
 if(ds) ds.innerHTML=db.vehicles.map(v=>'<option value="'+v.id+'">'+escapeHtml(v.driver)+' • '+escapeHtml(v.plate)+'</option>').join('');
 if(cs) cs.innerHTML=(db.companies||[]).map(c=>'<option value="'+c.id+'">'+escapeHtml(c.name)+' • '+escapeHtml(c.city)+'</option>').join('');
 const dl=document.getElementById('driverRatingsList'),cl=document.getElementById('companyRatingsList');
 if(dl) dl.innerHTML=(db.driverRatings||[]).sort((a,b)=>b.score-a.score).map(r=>'<div class="item"><div class="itemtop"><div><div class="route">'+escapeHtml(r.driver)+'</div><div class="muted">'+escapeHtml(r.plate)+' • '+r.reviews+' değerlendirme</div></div><span class="chip green">★ '+dec(r.score)+'</span></div><p class="muted small">“'+escapeHtml(r.lastComment)+'”</p></div>').join('');
 if(cl) cl.innerHTML=(db.companyRatings||[]).sort((a,b)=>b.score-a.score).map(r=>'<div class="item"><div class="itemtop"><div><div class="route">'+escapeHtml(r.company)+'</div><div class="muted">'+r.reviews+' şoför değerlendirmesi</div></div><span class="chip green">★ '+dec(r.score)+'</span></div><div class="chips"><span class="chip blue">Ödeme ★ '+dec(r.paymentScore)+'</span></div><p class="muted small">“'+escapeHtml(r.lastComment)+'”</p></div>').join('');
}
function submitDriverRating(){
 const id=document.getElementById('rateDriverSelect').value,v=vehicle(id);if(!v)return;
 const vals=['driverOnTime','driverComm','driverCargo','driverPod'].map(x=>+document.getElementById(x).value);
 const score=vals.reduce((a,b)=>a+b,0)/vals.length,comment=document.getElementById('driverComment').value||'Yeni değerlendirme.';
 let r=(db.driverRatings||[]).find(x=>x.driver===v.driver);if(r){r.score=((r.score*r.reviews)+score)/(r.reviews+1);r.reviews++;r.lastComment=comment}else{db.driverRatings.push({driver:v.driver,plate:v.plate,score,reviews:1,lastComment:comment})}
 v.rating=Number(r?r.score:score);save();renderRatings();alert('Şoför değerlendirmesi kaydedildi.');
}
function submitCompanyRating(){
 const id=document.getElementById('rateCompanySelect').value,c=(db.companies||[]).find(x=>x.id===id);if(!c)return;
 const pay=+document.getElementById('companyPayment').value;
 const vals=[pay,+document.getElementById('companyLoading').value,+document.getElementById('companyUnloading').value,+document.getElementById('companyAccuracy').value];
 const score=vals.reduce((a,b)=>a+b,0)/vals.length,comment=document.getElementById('companyComment').value||'Yeni değerlendirme.';
 let r=(db.companyRatings||[]).find(x=>x.company===c.name);if(r){r.score=((r.score*r.reviews)+score)/(r.reviews+1);r.paymentScore=((r.paymentScore*r.reviews)+pay)/(r.reviews+1);r.reviews++;r.lastComment=comment}else{db.companyRatings.push({company:c.name,score,paymentScore:pay,reviews:1,lastComment:comment})}
 c.totalScore=Number(r?r.score:score);c.paymentScore=Number(r?r.paymentScore:pay);save();renderRatings();alert('Firma değerlendirmesi kaydedildi.');
}
function regionData(){
 return {
  'Batman':{'Merkez':['Batman OSB']},
  'Gaziantep':{'Şehitkamil':['Başpınar OSB'],'Nizip':['Sanayi Bölgesi']},
  'Diyarbakır':{'Bağlar':['Diyarbakır OSB']},
  'Mersin':{'Akdeniz':['Liman Bölgesi']}
 };
}
function initRegionFilters(){
 const data=regionData(),city=document.getElementById('regionCity');
 if(!city)return;
 const current=city.value;
 city.innerHTML=Object.keys(data).map(c=>'<option>'+c+'</option>').join('');
 if(current&&data[current])city.value=current;
 updateRegionDistricts();
}
function updateRegionDistricts(){
 const data=regionData(),city=document.getElementById('regionCity'),district=document.getElementById('regionDistrict');
 if(!city||!district)return;
 const selectedCity=city.value||Object.keys(data)[0];
 const districts=Object.keys(data[selectedCity]||{});
 const old=district.value;
 district.innerHTML=districts.map(d=>'<option>'+d+'</option>').join('');
 if(old&&districts.includes(old))district.value=old;
}
function selectedRegion(){
 const city=document.getElementById('regionCity')?.value||'Batman';
 const district=document.getElementById('regionDistrict')?.value||'Merkez';
 return {city,district};
}
function renderRegional(){
 const r=selectedRegion(),companies=(db.companies||[]).filter(c=>c.city===r.city&&c.district===r.district);
 const drivers=db.vehicles.filter(v=>(v.regions||[]).some(x=>x.startsWith(r.city+'|'+escapeHtml(r.district)+'|')));
 const fc=document.getElementById('regionalFirmCount'),dc=document.getElementById('regionalDriverCount');
 if(fc)fc.textContent=companies.length+' firma';if(dc)dc.textContent=drivers.length+' şoför';
 const ce=document.getElementById('regionalCompanies'),de=document.getElementById('regionalDrivers'),se=document.getElementById('regionalSummary');
 if(ce)ce.innerHTML=companies.length?companies.sort((a,b)=>b.totalScore-a.totalScore).map(c=>'<div class="item"><div class="itemtop"><div><div class="route">'+escapeHtml(c.name)+'</div><div class="muted">'+escapeHtml(c.city)+' • '+escapeHtml(c.district)+' • '+escapeHtml(c.zone)+'</div></div><span class="chip green">★ '+dec(c.totalScore)+'</span></div><div class="chips"><span class="chip blue">Ödeme ★ '+dec(c.paymentScore)+'</span><span class="chip">'+c.paymentDays+' günde öder</span><span class="chip">Yüklemede '+c.loadingWait+' dk bekleme</span><span class="chip">Boşaltmada '+c.unloadingWait+' dk bekleme</span></div><p class="muted small">'+c.reviews+' şoför değerlendirmesi</p></div>').join(''):'<div class="empty">Bu bölgede henüz kayıtlı firma yok.</div>';
 if(de)de.innerHTML=drivers.length?drivers.sort((a,b)=>b.rating-a.rating).map(v=>'<div class="item"><div class="itemtop"><div><div class="route">'+escapeHtml(v.driver)+'</div><div class="muted">'+escapeHtml(v.plate)+' • '+escapeHtml(v.company)+'</div></div><span class="chip blue">★ '+dec(v.rating)+'</span></div><div class="chips"><span class="chip">'+escapeHtml(v.type)+'</span><span class="chip green">'+escapeHtml(v.status)+'</span><span class="chip">Bölgeyi biliyor</span></div></div>').join(''):'<div class="empty">Bu bölgede düzenli çalışan şoför yok.</div>';
 const avgPay=companies.length?dec(companies.reduce((s,c)=>s+c.paymentDays,0)/companies.length):'-';
 const avgScore=companies.length?dec(companies.reduce((s,c)=>s+c.totalScore,0)/companies.length):'-';
 const avgWait=companies.length?Math.round(companies.reduce((s,c)=>s+c.loadingWait+c.unloadingWait,0)/(companies.length*2)):'-';
 if(se)se.innerHTML='<div class="kpi"><small>Bölge</small><b>'+escapeHtml(r.city)+' / '+escapeHtml(r.district)+'</b></div><div class="kpi"><small>Ortalama firma puanı</small><b>★ '+avgScore+'</b></div><div class="kpi"><small>Ortalama ödeme süresi</small><b>'+avgPay+' gün</b></div><div class="kpi"><small>Ortalama bekleme</small><b>'+avgWait+' dk</b></div>';
}
function renderDriverViews(){
 const t=trip(),l=t?load(t.loadId):null,v=t?vehicle(t.vehicleId):null;
 const cur=document.getElementById('driverCurrentJob');
 if(cur) cur.innerHTML=l&&v&&t.stage!=='Teslim edildi'?'<div class="item"><div class="route">'+escapeHtml(l.from)+' → '+escapeHtml(l.to)+'</div><div class="muted">'+escapeHtml(l.loadNo)+' • '+escapeHtml(v.plate)+'</div><div class="chips"><span class="chip green">'+escapeHtml(t.stage)+'</span><span class="chip">'+t.distanceLeft+' km kaldı</span><span class="chip blue">Varış '+escapeHtml(t.eta)+'</span></div><button class="btn primary" style="margin-top:12px" onclick="go(\'driver\')">Taşımaya dön</button></div>':'<div class="empty">Şu an aktif taşıman yok.</div>';
 const next=document.getElementById('driverNextJob'),back=getBackhaul();
 if(next) next.innerHTML=back.length?'<div class="item"><div class="route">'+escapeHtml(back[0].l.from)+' → '+escapeHtml(back[0].l.to)+'</div><div class="muted">'+escapeHtml(back[0].l.loadNo)+' • '+escapeHtml(back[0].l.cargoType)+'</div><div class="chips"><span class="chip green">%'+back[0].score+' uygun</span><span class="chip">'+money(back[0].l.weight)+' kg</span></div><button class="btn primary" style="margin-top:12px" onclick="assignBackhaul(\''+back[0].l.id+'\')">Bu yükü al</button></div>':'<div class="empty">Şu an sana uygun yeni yük yok.</div>';
 const comp=document.getElementById('driverCompletedJobs');
 if(comp)comp.innerHTML=db.trips.filter(t=>t.stage==='Teslim edildi'&&(!getSession()||getSession().role!=='driver'||vehicle(t.vehicleId)?.plate===getSession().plate)).map(t=>{const l=load(t.loadId);return '<div class="item"><div class="route">'+escapeHtml(l.from)+' → '+escapeHtml(l.to)+'</div><div class="muted">'+escapeHtml(l.loadNo)+' • '+escapeHtml(t.deliveredAt)+'</div><span class="chip green">Teslim edildi</span></div>'}).join('')||'<div class="empty">Henüz tamamlanmış taşıman yok.</div>';
 const sess=getSession();const pays=(db.payments||[]).filter(p=>!sess||sess.role!=='driver'||p.driver===sess.name);
 const week=pays.reduce((s,p)=>s+p.amount,0),pending=pays.filter(p=>p.status!=='Ödendi').reduce((s,p)=>s+p.amount,0);
 const we=document.getElementById('driverWeekEarn'),pe=document.getElementById('driverPendingEarn');
 if(we)we.textContent='₺'+money(week);if(pe)pe.textContent='₺'+money(pending);
 const pl=document.getElementById('driverPaymentList');
 if(pl)pl.innerHTML=pays.map(p=>'<div class="item"><div class="itemtop"><div><b>'+escapeHtml(p.loadNo)+'</b><div class="muted">'+escapeHtml(p.driver)+'</div></div><b>₺'+money(p.amount)+'</b></div><div class="chips"><span class="chip '+(p.status==='Ödendi'?'green':'amber')+'">'+escapeHtml(p.status)+'</span><span class="chip">Son ödeme '+fmtDate(p.due)+'</span></div></div>').join('');
 const tc=document.getElementById('driverTrustedCompanies');
 if(tc)tc.innerHTML=(db.companyRatings||[]).sort((a,b)=>b.paymentScore-a.paymentScore).slice(0,3).map(r=>'<div class="item"><div class="itemtop"><b>'+escapeHtml(r.company)+'</b><span class="chip green">Ödeme ★ '+dec(r.paymentScore)+'</span></div><div class="muted">'+r.reviews+' şoför değerlendirmesi</div></div>').join('');
}
function renderPayments(){
 const payments=db.payments||[],paid=payments.filter(p=>p.status==='Ödendi'),pending=payments.filter(p=>p.status!=='Ödendi');
 for(const [id,value] of Object.entries({payTotal:'₺'+money(payments.reduce((n,p)=>n+p.amount,0)),payPaid:'₺'+money(paid.reduce((n,p)=>n+p.amount,0)),payPending:'₺'+money(pending.reduce((n,p)=>n+p.amount,0)),payCount:pending.length})){const node=document.getElementById(id);if(node)node.textContent=value;}
 const el=document.getElementById('paymentRows');if(!el)return;
 el.innerHTML=(db.payments||[]).map(p=>'<tr><td>'+escapeHtml(p.loadNo)+'</td><td>'+escapeHtml(p.driver)+'</td><td>₺'+money(p.amount)+'</td><td>'+fmtDate(p.due)+'</td><td><span class="chip '+(p.status==='Ödendi'?'green':'amber')+'">'+escapeHtml(p.status)+'</span></td><td>'+(p.status==='Ödendi'?'':'<button class="btn green" onclick="markPaid(\''+p.id+'\')">Ödendi işaretle</button>')+'</td></tr>').join('');
}
function markPaid(id){const p=(db.payments||[]).find(x=>x.id===id);if(p){p.status='Ödendi';save();renderPayments();renderDriverViews();}}
function renderMessages(){
 const list=document.getElementById('conversationList');if(list)list.innerHTML=(db.conversations||[]).map(c=>'<div class="item"><b>'+escapeHtml(c.name)+'</b><div class="muted">'+escapeHtml(c.last)+'</div></div>').join('');
 const th=document.getElementById('messageThread');if(th)th.innerHTML=(db.messages||[]).map(m=>'<div class="msg mine"><b>'+escapeHtml(m.sender)+'</b><p>'+escapeHtml(m.text)+'</p></div>').join('')||'<div class="empty">Bu tarayıcıdaki demo mesajları burada saklanır.</div>';
}
function sendDemoMessage(){
 const i=document.getElementById('messageInput');if(!i?.value.trim())return;
 db.messages=db.messages||[];db.messages.push({sender:getSession()?.name||'Sen',text:i.value.trim(),time:new Date().toISOString()});i.value='';save();
}
function renderNotifications(){
 const el=document.getElementById('notificationList');if(!el)return;
 el.innerHTML=(db.notifications||[]).map(n=>'<div class="alert '+(n.level==='red'?'red':n.level==='green'?'green':'')+'"><div class="itemtop"><div><b>'+escapeHtml(n.title)+'</b><div class="muted">'+escapeHtml(n.text)+'</div></div><button class="btn soft" onclick="notificationAction(this.dataset.title)" data-title="'+escapeHtml(n.title)+'">'+escapeHtml(n.action)+'</button></div></div>').join('');
}
function notificationAction(title){if(title.includes('Gecikme')||title.includes('Teslim'))go('trips');else if(title.includes('POD')||title.includes('Belge'))go('docs');else go('matches');}
function supportDemo(type){alert('"'+type+'" için destek kaydın açıldı. (Demo sürümünde ekibe gönderilmez.)');}
function openDriverIssue(){const t=trip(),l=t?load(t.loadId):null;const msg=l?l.loadNo+' numaralı yük için sorun kaydın açıldı.':'Sorun kaydın açıldı.';alert(msg+' Demo kaydı ekibe gönderilmez.');}
function renderDocs(){document.getElementById('docsBody').innerHTML=db.docs.map(d=>`<tr><td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.loadNo)}</td><td><span class="chip blue">${escapeHtml(d.status)}</span></td><td>${escapeHtml(d.time)}</td></tr>`).join('')}
const MEDIA_DB='sevkio_media_v1',MEDIA_STORE='files';
function openMediaDB(){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(MEDIA_DB,1);
  req.onupgradeneeded=()=>{const dbi=req.result;if(!dbi.objectStoreNames.contains(MEDIA_STORE)){const st=dbi.createObjectStore(MEDIA_STORE,{keyPath:'key'});st.createIndex('loadId','loadId',{unique:false});}};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
}
async function saveMediaFiles(loadId,kind,files){
 if(!files||!files.length)return[];
 const max=20*1024*1024;
 if(files.some(f=>f.size>max||!['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/webm','video/quicktime'].includes(f.type)))throw Error('Desteklenmeyen dosya türü veya 20 MB sınırı aşıldı.');
 if(files.reduce((n,f)=>n+f.size,0)>50*1024*1024)throw Error('Toplam dosya boyutu 50 MB sınırını aşıyor.');
 const dbi=await openMediaDB(),tx=dbi.transaction(MEDIA_STORE,'readwrite'),st=tx.objectStore(MEDIA_STORE);
 files.forEach((file,i)=>st.put({key:loadId+'|'+kind+'|'+Date.now()+'|'+i,loadId,kind,name:file.name,type:file.type,size:file.size,createdAt:new Date().toISOString(),blob:file}));
 await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});dbi.close();
}
async function getMediaFiles(loadId){
 const dbi=await openMediaDB(),tx=dbi.transaction(MEDIA_STORE,'readonly'),idx=tx.objectStore(MEDIA_STORE).index('loadId');
 const rows=await new Promise((res,rej)=>{const r=idx.getAll(loadId);r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});dbi.close();return rows;
}
function fileSize(n){if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' KB';return (n/1024/1024).toFixed(1)+' MB'}
async function openMedia(loadId,title){
 closeMediaModal();const rows=await getMediaFiles(loadId),g=document.getElementById('mediaGallery');
 document.getElementById('mediaModalTitle').textContent=title||'Fotoğraf ve belgeler';document.getElementById('mediaModalSub').textContent=rows.length+' dosya';
 if(!rows.length)g.innerHTML='<div class="empty">Bu yük için henüz dosya yüklenmemiş.</div>';
 else g.innerHTML=rows.map(r=>{const u=URL.createObjectURL(r.blob);mediaUrls.push(u);if((r.type||'').startsWith('image/'))return '<div><img src="'+u+'" alt=""><div class="media-file"><b>'+escapeHtml(r.name)+'</b><br><small>'+fileSize(r.size)+'</small></div></div>';if((r.type||'').startsWith('video/'))return '<div><video src="'+u+'" controls></video><div class="media-file"><b>'+escapeHtml(r.name)+'</b><br><small>'+fileSize(r.size)+'</small></div></div>';return '<div class="media-file"><svg class="ui-icon"><use href="#ic-file"></use></svg><b style="margin-left:8px">'+escapeHtml(r.name)+'</b><br><small>'+fileSize(r.size)+'</small><div style="margin-top:10px"><a class="btn soft" href="'+u+'" target="_blank">Dosyayı aç</a></div></div>'}).join('');
 document.getElementById('mediaModal').classList.add('open');
}
let mediaUrls=[];
function closeMediaModal(){document.getElementById('mediaModal').classList.remove('open');mediaUrls.forEach(u=>URL.revokeObjectURL(u));mediaUrls=[];document.getElementById('mediaGallery').innerHTML=''}
function updatePickupMediaSummary(){const p=[...(document.getElementById('pickupPhotos')?.files||[])],v=[...(document.getElementById('pickupVideo')?.files||[])],el=document.getElementById('pickupMediaSummary');if(el)el.innerHTML=(p.length?'<span class="chip blue">'+p.length+' fotoğraf</span>':'')+(v.length?'<span class="chip green">1 video</span>':'')}
function updateDeliveryMediaSummary(){const d=document.getElementById('deliveryDocument')?.files?.[0],p=[...(document.getElementById('deliveryPhotos')?.files||[])],el=document.getElementById('deliveryMediaSummary');if(el)el.innerHTML=(d?'<span class="chip blue">Evrak: '+escapeHtml(d.name)+'</span>':'')+(p.length?'<span class="chip green">'+p.length+' fotoğraf</span>':'')}
document.getElementById('pickupPhotos')?.addEventListener('change',updatePickupMediaSummary);
document.getElementById('pickupVideo')?.addEventListener('change',updatePickupMediaSummary);
document.getElementById('deliveryDocument')?.addEventListener('change',updateDeliveryMediaSummary);
document.getElementById('deliveryPhotos')?.addEventListener('change',updateDeliveryMediaSummary);
document.getElementById('loadForm').onsubmit=async e=>{
 e.preventDefault();if(getSession()?.role!=='company')return;const fd=new FormData(e.target),d={};for(const [k,v] of fd.entries())if(!(v instanceof File))d[k]=v;
 const vkn=(d.receiverCompanyVkn||'').replace(/\D/g,'');if(vkn.length!==10)return alert('Alıcı firmanın VKN’si 10 haneli olmalı.');
 const photos=[...(document.getElementById('pickupPhotos').files||[])],video=[...(document.getElementById('pickupVideo').files||[])];
 if(db.loads.some(l=>l.id!==e.target.dataset.editingId&&norm(l.loadNo)===norm(d.loadNo)))return alert('Bu yük numarası zaten kullanılıyor.');
 if(!Number.isFinite(Date.parse(d.pickupTime))||Date.parse(d.pickupTime)<Date.now()||Date.parse(d.deliveryTime)<=Date.parse(d.pickupTime))return alert('Gelecek bir yükleme zamanı ve sonrasında bir teslim zamanı seç.');
 const editingId=e.target.dataset.editingId;
 if(editingId&&!openLoads().some(l=>l.id===editingId))return alert('Atanmış veya iptal edilmiş yük düzenlenemez.');
 const id=editingId||uid('L'),files=[...photos,...video];
 try{await saveMediaFiles(id,'pickup',files)}catch(err){console.error(err);return alert('Dosyalar kaydedilemedi; yük yayınlanmadı.');}
 const previous=editingId?load(editingId):null;
 const updated={...previous,id,...d,edited:true,receiverCompanyVkn:vkn,weight:+d.weight,price:d.price?+d.price:null,pallets:d.pallets?+d.pallets:null,height:d.height?+d.height:null,pickupMediaCount:files.length,pickupPhotoCount:photos.length,pickupVideoCount:video.length,pickupMediaNames:files.map(x=>x.name)};
 if(previous&&!files.length){['pickupMediaCount','pickupPhotoCount','pickupVideoCount','pickupMediaNames'].forEach(k=>updated[k]=previous[k]);}
 if(previous)Object.assign(previous,updated);else db.loads.unshift(updated);save();
 
 resetLoadForm();renderLoads();
}
const AUTH_SESSION='sevkio_auth_session_v1',AUTH_ACCOUNTS='sevkio_accounts_v1';
let authRole='driver';
function getAccounts(){
 let raw=JSON.parse(localStorage.getItem(AUTH_ACCOUNTS)||'null');
 if(!raw)raw={
  drivers:[{id:'D-DEMO',firstName:'Mehmet',lastName:'Kaya',phone:'05300000000',plate:'72 YY 001',password:'123456',verified:true}],
  companies:[{id:'C-DEMO',name:'Güney Yapı A.Ş.',vkn:'1234567890',taxOffice:'Batman',phone:'04882121212',password:'Demo1234',verified:true,taxFile:'demo-vergi-levhasi.pdf'}]
 };
 raw.drivers=raw.drivers||[];raw.companies=raw.companies||[];
 if(!raw.drivers.some(x=>x.id==='D-DEMO2'))raw.drivers.push({id:'D-DEMO2',firstName:'Emre',lastName:'Şahin',phone:'05325550088',plate:'27 SV 808',password:'123456',verified:true});
 if(!raw.drivers.some(x=>x.id==='D-DEMO'))raw.drivers.push({id:'D-DEMO',firstName:'Mehmet',lastName:'Kaya',phone:'05300000000',plate:'72 YY 001',password:'123456',verified:true});
 if(!raw.companies.some(x=>x.id==='C-DEMO'))raw.companies.push({id:'C-DEMO',name:'Güney Yapı A.Ş.',vkn:'1234567890',taxOffice:'Batman',phone:'04882121212',password:'Demo1234',verified:true,taxFile:'demo-vergi-levhasi.pdf'});
 localStorage.setItem(AUTH_ACCOUNTS,JSON.stringify(raw));return raw;
}
function saveAccounts(a){localStorage.setItem(AUTH_ACCOUNTS,JSON.stringify(a))}
function getSession(){return JSON.parse(localStorage.getItem(AUTH_SESSION)||'null')}
function cleanPhone(v){let n=(v||'').replace(/\D/g,'');if(n.startsWith('90')&&n.length===12)n='0'+n.slice(2);if(n.length===10)n='0'+n;return n}
function showAuthError(msg){const e=document.getElementById('authError');e.textContent=msg;e.style.display='block'}
function clearAuthError(){const e=document.getElementById('authError');if(e)e.style.display='none'}
function showAuthTab(tab){
 document.getElementById('authGate').dataset.tab=tab;
 clearAuthError();
 ['loginPanel','registerPanel','verificationPanel'].forEach(id=>document.getElementById(id)?.classList.remove('active'));
 document.getElementById(tab+'Panel')?.classList.add('active');
 document.getElementById('loginTab')?.classList.toggle('active',tab==='login');
 document.getElementById('registerTab')?.classList.toggle('active',tab==='register');
 const t=document.getElementById('authTitle'),st=document.getElementById('authSubtitle');
 if(t)t.textContent=tab==='register'?'Ücretsiz hesap oluştur':'Hesabına giriş yap';
 if(st)st.textContent=tab==='register'?'Hesap türünü seç, bilgilerini gir.':'Önce hesap türünü seç.';
}
function setAuthRole(role){
 authRole=role;clearAuthError();
 document.getElementById('driverRoleBtn').setAttribute('aria-pressed',String(role==='driver'));
 document.getElementById('companyRoleBtn').setAttribute('aria-pressed',String(role==='company'));
 document.getElementById('driverRoleBtn').classList.toggle('active',role==='driver');
 document.getElementById('companyRoleBtn').classList.toggle('active',role==='company');
 document.getElementById('driverLogin').style.display=role==='driver'?'block':'none';
 document.getElementById('companyLogin').style.display=role==='company'?'block':'none';
 document.getElementById('driverRegister').style.display=role==='driver'?'block':'none';
 document.getElementById('companyRegister').style.display=role==='company'?'block':'none';
}
function registerDriver(){
 clearAuthError();const a=getAccounts();
 const firstName=document.getElementById('driverFirstName').value.trim(),lastName=document.getElementById('driverLastName').value.trim();
 const phone=cleanPhone(document.getElementById('driverPhone').value),plate=document.getElementById('driverPlate').value.trim().toUpperCase(),password=document.getElementById('driverPassword').value,vehicleType=document.getElementById('driverVehicleType').value;
 if(!firstName||!lastName||!/^05\d{9}$/.test(phone)||!plate||password.length<6)return showAuthError('Ad, soyad, telefon, plaka ve en az 6 karakterlik şifre gerekli.');
 if(a.drivers.some(x=>cleanPhone(x.phone)===phone))return showAuthError('Bu telefon numarasıyla zaten bir şoför hesabı var. Giriş yapmayı dene.');
 if(a.drivers.some(x=>x.plate===plate)||db.vehicles.some(v=>v.plate===plate))return showAuthError('Bu plaka zaten kayıtlı. Kendi hesabınla giriş yap.');
 const user={id:'D-'+Date.now(),firstName,lastName,phone,plate,password,vehicleType};a.drivers.push(user);saveAccounts(a);
 if(!db.vehicles.some(x=>x.plate===plate)){db.vehicles.push(newDriverVehicle(plate,vehicleType,firstName+' '+lastName,phone));save()}
 localStorage.setItem(AUTH_SESSION,JSON.stringify({role:'driver',id:user.id,name:firstName+' '+lastName,plate}));
 enterSession();
}
function registerCompany(){
 clearAuthError();const a=getAccounts();
 const name=document.getElementById('companyName').value.trim(),vkn=document.getElementById('companyVkn').value.replace(/\D/g,''),taxOffice=document.getElementById('companyTaxOffice').value.trim(),phone=cleanPhone(document.getElementById('companyPhone').value),password=document.getElementById('companyPassword').value,file=document.getElementById('companyTaxFile').files[0];
 if(!name||vkn.length!==10||!taxOffice||phone.length<10||password.length<8||!file)return showAuthError('Şirket bilgileri, 10 haneli VKN, vergi levhası ve en az 8 karakterlik şifre gerekli.');
 if(a.companies.some(x=>x.vkn===vkn))return showAuthError('Bu vergi numarasıyla zaten bir hesap var.');
 const user={id:'C-'+Date.now(),name,vkn,taxOffice,phone,password,taxFile:file.name,verified:false,verification:'pending'};a.companies.push(user);saveAccounts(a);
 document.getElementById('verifyFileState').textContent=file.name;
 ['loginPanel','registerPanel'].forEach(id=>document.getElementById(id).classList.remove('active'));document.getElementById('verificationPanel').classList.add('active');
}
function loginDriver(){
 clearAuthError();const a=getAccounts(),phone=cleanPhone(document.getElementById('driverLoginPhone').value),password=document.getElementById('driverLoginPassword').value;
 const u=a.drivers.find(x=>cleanPhone(x.phone)===phone&&x.password===password);if(!u)return showAuthError('Telefon numarası veya şifre hatalı.');
 localStorage.setItem(AUTH_SESSION,JSON.stringify({role:'driver',id:u.id,name:u.firstName+' '+u.lastName,plate:u.plate}));enterSession();
}
function loginCompany(){
 clearAuthError();const a=getAccounts(),vkn=document.getElementById('companyLoginVkn').value.replace(/\D/g,''),password=document.getElementById('companyLoginPassword').value;
 const u=a.companies.find(x=>x.vkn===vkn&&x.password===password);if(!u)return showAuthError('Vergi numarası veya şifre hatalı.');
 if(!u.verified)return showAuthError('Firma doğrulaman henüz tamamlanmadı. Doğrulanınca panelin açılacak.');
 localStorage.setItem(AUTH_SESSION,JSON.stringify({role:'company',id:u.id,name:u.name,vkn:u.vkn,verified:true}));enterSession();
}
function ensureVerifiedDriverDemoData(){
 if(!db.loads.some(x=>x.id==='L-DEMO2'))db.loads.push({id:'L-DEMO2',loadNo:'SV-2026-2048',from:'Gaziantep',to:'Adana',pickupAddress:'Başpınar OSB 4. Cadde',deliveryAddress:'Adana Hacı Sabancı OSB',cargoType:'Paletli ürün',vehicleType:'Tır',weight:14500,pickupTime:today+'T11:30',deliveryTime:today+'T16:45',receiverCompany:'Çukurova Endüstri Depo',receiverCompanyVkn:'5555555555',receiver:'Mustafa Arslan',receiverPhone:'0534 720 18 40',notes:'18 palet • Rampa hazır',pickupMediaCount:2,pickupPhotoCount:2,pickupVideoCount:0});
 if(!db.vehicles.some(x=>x.id==='V-DEMO2'))db.vehicles.push({id:'V-DEMO2',plate:'27 SV 808',type:'Tır',capacity:24000,driver:'Emre Şahin',company:'Şahin Lojistik',phone:'0532 555 00 88',location:'Osmaniye / Adana yönü',status:'Yolda',speed:82,lastGps:'1 dk önce',fuel:71,rating:4.95,nextAvailable:'17:30',verified:true,regions:['Gaziantep|Şehitkamil|Başpınar OSB','Adana|Sarıçam|Hacı Sabancı OSB']});
 if(!db.trips.some(x=>x.id==='T-DEMO2'))db.trips.push({id:'T-DEMO2',loadId:'L-DEMO2',vehicleId:'V-DEMO2',stage:'Yolda',progress:64,eta:'16:32',distanceLeft:94,emptyKm:11,delay:0,pickupConfirmed:true,pickupAt:'11:41',unloadAt:null,deliveredAt:null,pod:false,receiverConfirmed:false});
 if(!db.driverRatings.some(x=>x.driver==='Emre Şahin'))db.driverRatings.push({driver:'Emre Şahin',plate:'27 SV 808',score:4.95,reviews:67,lastComment:'Yükü zamanında ve eksiksiz teslim etti.'});
 if(!db.payments.some(x=>x.driver==='Emre Şahin'))db.payments.push({id:'P-DEMO2',loadNo:'SV-2026-2048',driver:'Emre Şahin',amount:11250,due:'2026-10-09',status:'Bekliyor'});
 save();
}
function demoVerifiedDriver(){
 ensureVerifiedDriverDemoData();
 localStorage.setItem(AUTH_SESSION,JSON.stringify({role:'driver',id:'D-DEMO2',name:'Emre Şahin',plate:'27 SV 808',verified:true}));
 selectedTrip='T-DEMO2';enterSession();
}
function syncDriverSession(){
 const s=getSession();if(!s||s.role!=='driver')return;
 let v=db.vehicles.find(x=>x.plate===s.plate);
 if(!v&&s.id==='D-DEMO2'){ensureVerifiedDriverDemoData();v=db.vehicles.find(x=>x.id==='V-DEMO2');}
 const t=v?db.trips.find(x=>x.vehicleId===v.id&&x.stage!=='Teslim edildi'):null;
 if(t)selectedTrip=t.id;
 const l=t?load(t.loadId):null;
 const rating=db.driverRatings.find(x=>x.driver===s.name);
 const setEmpty=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
 if(!l||!v||!t||t.stage==='Teslim edildi'){
  setEmpty('driverHomeRoute','Aktif taşıman yok');setEmpty('driverHomeIdentity',s.plate||'Aracını ekle');setEmpty('driverHomeStatus','Yük aramaya hazırsın');
  ['driverHomeDistance','driverHomeEta','driverHomeAddress','driverHomeReceiver','driverHomeReceiverPhone'].forEach(id=>setEmpty(id,'—'));
 }
 document.querySelectorAll('.driver-actions button').forEach((b,i)=>{b.disabled=!t||t.stage==='Teslim edildi'||(i===0&&!['Atandı','Yüklemeye gidiyor','Yükleme'].includes(t.stage))||(i===1&&t.stage!=='Yolda')||(i===2&&!['Teslim noktasında','Boşaltma'].includes(t.stage));});

 const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};
 if(l&&v&&t&&t.stage!=='Teslim edildi'){
   set('driverHomeRoute',l.from+' → '+l.to);set('driverHomeIdentity',v.plate+' • '+v.driver);set('driverHomeStatus',t.stage);
   set('driverHomeDistance',t.distanceLeft+' km kaldı');set('driverHomeEta','Varış '+t.eta);set('driverHomeAddress',l.deliveryAddress);set('driverHomeReceiver',l.receiver);set('driverHomeReceiverPhone',l.receiverPhone);
 }
 if(v){
   set('driverProfileName',v.driver);set('driverProfileMeta',v.plate+' • '+escapeHtml(v.type)+' • '+vspec(v).body);set('driverProfileRating',dec(rating?.score||v.rating,2).replace(/0$/,''));
   set('driverProfilePhone',v.phone);set('driverProfileVerify',v.verified?'Doğrulandı':'Bekliyor');set('driverProfileReviews',rating?.reviews||0);set('driverProfileCapacity',money(v.capacity)+' kg');
   const regions=document.getElementById('driverProfileRegions');if(regions)regions.innerHTML=(v.regions||[]).map(r=>'<span class="chip blue">'+escapeHtml(r.split('|').slice(-1)[0])+'</span>').join('');
 }
 fillVehicleForm();
 renderDriverViews();
}
function newDriverVehicle(plate,type,name,phone){return {id:uid('V'),plate,type,...VEHICLE_DEFAULTS[type],driver:name,company:'Bağımsız şoför',phone:phone||'',location:'Belirtilmedi',status:'Boş',speed:0,lastGps:'Henüz yok',fuel:0,rating:0,nextAvailable:'Şimdi',verified:false,regions:[]}}
function fillVehicleForm(){
 const f=document.getElementById('vehicleForm');if(!f)return;
 const v=myVehicle(),sp=vspec(v||{type:'Tır'});
 f.elements.type.value=v?v.type:'Tır';['body','capacity','pallets','height','scope'].forEach(k=>f.elements[k].value=sp[k]);
 document.getElementById('vehicleFormState').textContent='';
}
document.getElementById('vehicleForm').elements.type.addEventListener('change',e=>{const f=e.target.form,d=VEHICLE_DEFAULTS[e.target.value];['body','capacity','pallets','height','scope'].forEach(k=>f.elements[k].value=d[k])});
document.getElementById('vehicleForm').onsubmit=e=>{
 e.preventDefault();const s=getSession();if(!s||s.role!=='driver')return;
 const d=Object.fromEntries(new FormData(e.target));let v=myVehicle();
 if(!v){v=newDriverVehicle(s.plate,d.type,s.name,(getAccounts().drivers.find(x=>x.id===s.id)||{}).phone);db.vehicles.push(v)}
 Object.assign(v,{type:d.type,body:d.body,capacity:+d.capacity,pallets:+d.pallets||0,height:+d.height||0,scope:d.scope});
 save();syncDriverSession();
 document.getElementById('vehicleFormState').textContent='Kaydedildi. Yük önerilerin artık bu araca göre.';
};
function demoVerifiedCompany(){
 localStorage.setItem(AUTH_SESSION,JSON.stringify({role:'company',id:'C-DEMO',name:'Güney Yapı A.Ş.',vkn:'1234567890',verified:true}));enterSession();
}
function enterSession(){
 const s=getSession();if(!s)return;
 setAuthGate(false);
 localStorage.setItem('sevkio_role',s.role);
 document.body.classList.remove('driver-mode','company-mode');document.body.classList.add(s.role==='driver'?'driver-mode':'company-mode');
 const lbl=document.getElementById('roleLabel'),desc=document.getElementById('roleDesc');
 if(lbl)lbl.textContent=s.name||'Hesap';
 if(desc)desc.textContent=s.role==='driver'?((s.plate||'')+' • Şoför hesabı'):'Firma demo hesabı';
 const tn=document.getElementById('topUserName'),tr=document.getElementById('topUserRole'),av=document.getElementById('topAvatar');
 if(tn)tn.textContent=s.name||'Hesap';if(tr)tr.textContent=s.role==='driver'?'Şoför hesabı':'Firma hesabı';
 if(av)av.textContent=(s.name||'S').split(/\s+/).filter(w=>/^\p{L}/u.test(w)).slice(0,2).map(w=>w[0]).join('').toLocaleUpperCase('tr-TR');
 if(s.role==='driver')syncDriverSession();
 go(s.role==='driver'?'driver':'dashboard');
}
function logoutUser(){
 closeMobileNav();
 localStorage.removeItem(AUTH_SESSION);localStorage.removeItem('sevkio_role');
 document.body.classList.remove('driver-mode','company-mode');
 setAuthGate(true);showAuthTab('login');setAuthRole('driver');
}
function chooseRole(role){setAuthRole(role);showAuthTab('login');setAuthGate(true)}
function switchRole(){logoutUser()}
function initRole(){const s=getSession();if(s)enterSession();else{setAuthGate(true);setAuthRole('driver');showAuthTab('login')}}
function driverTab(id,el){
  document.querySelectorAll('.driver-bottom button').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  go(id);
}
function driverAction(type){
 const t=trip();if(!t||t.stage==='Teslim edildi')return;
 if(type==='start'&&['Atandı','Yüklemeye gidiyor','Yükleme'].includes(t.stage)){
  t.stage='Yolda';t.progress=50;t.pickupConfirmed=true;t.pickupAt=new Date().toLocaleString('tr-TR');
 }else if(type==='arrive'&&t.stage==='Yolda'){
  t.stage='Teslim noktasında';t.progress=90;t.distanceLeft=0;
 }else if(type==='deliver'&&['Teslim noktasında','Boşaltma'].includes(t.stage)){
  t.stage='Boşaltma';t.progress=96;save();go('delivery');return;
 }else return alert('Önce sıradaki yolculuk adımını tamamla.');
 const v=vehicle(t.vehicleId);v.status=t.stage;v.speed=0;save();syncDriverSession();
}
function renderAll(){renderDashboardAlerts();renderStats();renderDash();renderLoads();renderVehicles();renderMatches();renderTrips();renderRatings();initRegionFilters();renderRegional();renderDriverViews();renderPayments();renderMessages();renderNotifications();renderDocs()}
renderAll();initRole();

function resetLoadForm(){const f=document.getElementById('loadForm');f.reset();delete f.dataset.editingId;document.getElementById('loadSubmit').textContent='Yükü yayınla';document.getElementById('cancelEdit').hidden=true;updatePickupMediaSummary();}
function editLoad(id){
 if(getSession()?.role!=='company')return;
 const l=openLoads().find(l=>l.id===id);if(!l)return;
 resetLoadForm();const f=document.getElementById('loadForm');f.dataset.editingId=id;
 Object.entries(l).forEach(([k,v])=>{const el=f.elements.namedItem(k);if(el&&el.type!=='file')el.value=v??'';});
 document.getElementById('loadSubmit').textContent='Değişiklikleri kaydet';document.getElementById('cancelEdit').hidden=false;f.scrollIntoView({behavior:'smooth'});
}
function cancelLoad(id){
 if(getSession()?.role!=='company')return;
 const l=openLoads().find(l=>l.id===id);if(!l)return;
 if(!confirm(l.loadNo+' numaralı yük iptal edilsin mi?'))return;
 l.cancelled=true;if(document.getElementById('loadForm').dataset.editingId===id)resetLoadForm();save();
}

function renderDashboardAlerts(){
 const el=document.getElementById('dashboardAlerts');if(!el)return;
 const delayed=db.trips.filter(t=>t.stage!=='Teslim edildi'&&t.delay>0);
 el.innerHTML=delayed.map(t=>'<div class="alert"><b>Gecikme kaydı</b><div class="muted">'+escapeHtml(vehicle(t.vehicleId)?.plate)+' • '+Number(t.delay)+' dk gecikme</div></div>').join('')||'<div class="empty">Aktif gecikme kaydı yok.</div>';
}
