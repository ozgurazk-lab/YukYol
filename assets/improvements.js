/* Local demo workflows. Payment, verification and support require server integrations. */
db.memberships ||= {};
db.tripReviews ||= [];
db.supportTickets ||= [];
db.rewardClaims ||= [];
db.birthdayPreferences ||= {};
db.loads.forEach(l=>{
 if(!l.ownerId)l.ownerId='C-DEMO';
 if(!l.source)l.source='Üretici';
 if(l.ownerId==='C-DEMO'&&!l.ownerName)l.ownerName='Güney Yapı A.Ş. (örnek)';
});
const baseOpenLoads=openLoads;
openLoads=()=>baseOpenLoads().filter(l=>Date.parse(l.pickupTime)>Date.now());
const baseAssignmentError=assignmentError;
assignmentError=(l,v)=>{
 const error=baseAssignmentError(l,v);if(error)return error;
 if(getSession()?.role==='company'&&l.ownerId!==getSession().id)return 'Yalnız kendi firmanın yayınladığı yükü atayabilirsin.';
 if(getSession()?.role==='driver'&&!hasPremium())return 'Normal üyelikte firmalar seni seçebilir. Kendin yük seçmek için Premium demo üyeliğini aç.';
 return '';
};
function hasPremium(){return Date.parse(db.memberships[getSession()?.id]?.until)>Date.now()}
function ownedTrip(t,role){const s=getSession();return !!t&&s?.role===role&&(role==='driver'?vehicle(t.vehicleId)?.plate===s.plate:load(t.loadId)?.ownerId===s.id)}
getBackhaul=()=>{
 const t=trip();if(!t)return [];
 const current=load(t.loadId),v=vehicle(t.vehicleId);
 const available=t.stage==='Teslim edildi'?Date.now():Math.max(Date.now(),Date.parse(current.deliveryTime)+60*60000);
 return openLoads().filter(l=>l.id!==current.id&&Date.parse(l.pickupTime)>=available&&norm(l.from)===norm(current.to)&&fits(l,v).ok).map(l=>({l,score:Math.max(0,92-Math.floor(Math.abs(+l.weight-(+vspec(v).capacity*.65))/1000))})).sort((a,b)=>b.score-a.score);
};
function termsHtml(l){
 const fee=l.platformFee===''||l.platformFee==null?'Belirtilmedi':'₺'+money(effectivePlatformFee(l))+(driverFriendly(l.ownerId)?' · %10 şoför dostu indirimi':'');
 return `<div class="terms"><div class="chips"><span class="chip blue">${escapeHtml(l.source||'Belirtilmedi')}</span><span class="chip">${l.confirmedAt?'Güncellendi: '+fmtDT(l.confirmedAt):'Örnek ilan · güncellik doğrulanmadı'}</span></div><div class="ops-grid"><div class="detail"><small>Navlun / KDV</small><b>${l.price?'₺'+money(+l.price):'Belirtilmedi'} · ${escapeHtml(l.vat||'KDV belirtilmedi')}</b></div><div class="detail"><small>Ödeme vadesi</small><b>${l.paymentDays!==undefined?Number(l.paymentDays)+' gün · teslim belgesinden sonra':'Belirtilmedi'}</b></div><div class="detail"><small>Platform bedeli</small><b>${fee}</b></div><div class="detail"><small>Bekleme şartı</small><b>${l.freeWait!==undefined?Number(l.freeWait)+' dk ücretsiz / ₺'+money(+l.waitRate||0)+' saat':'Belirtilmedi'}</b></div></div><p class="muted small">Yükleme: ${escapeHtml(l.loadingMethod||'Belirtilmedi')} · Geçerlilik: yükleme saatine kadar</p><button class="btn soft" onclick="showProfit('${l.id}')">Gider ve kazanç hesapla</button></div>`;
}
const baseLoadSpecChips=loadSpecChips;
loadSpecChips=l=>baseLoadSpecChips(l)+(driverFriendly(l.ownerId)?'<span class="chip green">Şoför dostu · en az 10 taşıma değerlendirmesi</span>':'')+`<button class="btn soft" onclick="showProfit('${l.id}')">Şartlar ve kazanç</button>`;
function showProfit(id){
 const l=load(id);if(!l)return;
 document.getElementById('profitLoadId').value=id;
 document.getElementById('profitTitle').textContent=l.from+' → '+l.to;
 document.getElementById('profitTerms').innerHTML=termsHtml(l).replace(/<button.*?<\/button>/,'');
 const prefs=db.costAssumptions||{};
 for(const [key,value] of Object.entries({distance:roadKm(l.from,l.to)||0,empty:0,consumption:32,fuel:55,tolls:0,other:0,...prefs}))document.getElementById('cost-'+key).value=value;
 // Route distance must always belong to the selected load.
 document.getElementById('cost-distance').value=roadKm(l.from,l.to)||0;
 calcProfit();document.getElementById('profitDialog').showModal();
}
function effectivePlatformFee(l){return Math.round((Number(l.platformFee)||0)*(driverFriendly(l.ownerId)?0.9:1)*100)/100}
function profitResult(l,c){const fuel=(c.distance+c.empty)*c.consumption/100*c.fuel,fee=effectivePlatformFee(l);return {fuel,cost:fuel+c.tolls+c.other+fee,net:l.price==null?null:Number(l.price)-fuel-c.tolls-c.other-fee}}
function calcProfit(){
 const c={};for(const key of ['distance','empty','consumption','fuel','tolls','other']){const raw=document.getElementById('cost-'+key).value;c[key]=Number(raw);if(raw===''||!Number.isFinite(c[key])||c[key]<0){document.getElementById('profitResult').textContent='Gider alanlarına sıfır veya pozitif sayı gir.';return;}}
 const l=load(document.getElementById('profitLoadId').value),r=profitResult(l,c);
 db.costAssumptions={consumption:c.consumption,fuel:c.fuel,tolls:c.tolls,other:c.other};localStorage.setItem(K,JSON.stringify(db));
 document.getElementById('profitResult').innerHTML=`<div class="kpis"><div class="kpi"><small>Yakıt gideri</small><b>₺${money(Math.round(r.fuel))}</b></div><div class="kpi"><small>Toplam tahmini gider</small><b>₺${money(Math.round(r.cost))}</b></div><div class="kpi"><small>Gider sonrası kalan</small><b>${r.net===null?'Navlun belirtilmedi':'₺'+money(Math.round(r.net))}</b></div></div><p class="muted small">Şehirler arası mesafe yaklaşık hesaplanır; gerçek rotayı ve yakıt fiyatını gir. Amortisman, vergi, sigorta ve üyelik bedeli bu tutara dahil değildir. ${l.platformFee==null||l.platformFee===''?'Platform bedeli belirtilmedi; hesapta 0 kabul edildi.':''}</p>`;
}
function activatePremium(){const s=getSession();if(s?.role!=='driver')return;db.memberships[s.id]={until:new Date(Date.now()+30*86400000).toISOString()};save();}
function endPremium(){const s=getSession();if(!s)return;delete db.memberships[s.id];save()}
function rewardProgress(){
 const v=myVehicle();const reviews=v?db.tripReviews.filter(r=>r.role==='company'&&r.vehicleId===v.id):[];
 const score=reviews.length?reviews.reduce((n,r)=>n+r.score,0)/reviews.length:0;
 return {count:reviews.length,score};
}
function addDemoDays(days){const id=getSession().id,until=Math.max(Date.now(),Date.parse(db.memberships[id]?.until)||0);db.memberships[id]={until:new Date(until+days*86400000).toISOString()}}
function claimReward(threshold){const s=getSession(),p=rewardProgress();if(s?.role!=='driver'||![10,25,50,100].includes(threshold)||p.count<threshold||p.score<4.5||db.rewardClaims.some(c=>c.accountId===s.id&&c.threshold===threshold))return alert('Bu ödül henüz alınamaz.');db.rewardClaims.push({accountId:s.id,threshold,time:new Date().toISOString()});if(threshold<100)addDemoDays(threshold);save();}
function saveBirthday(){const s=getSession();if(s?.role!=='driver')return;const month=Number(document.getElementById('birthdayMonth').value),day=Number(document.getElementById('birthdayDay').value);if(!month&&!day){delete db.birthdayPreferences[s.id];save();return;}const date=new Date(2000,month-1,day);if(date.getMonth()!==month-1||date.getDate()!==day)return alert('Geçerli bir gün ve ay seç.');db.birthdayPreferences[s.id]={month,day};save();}
function claimBirthday(){const s=getSession(),b=db.birthdayPreferences[s?.id],today=new Date(),key='birthday-'+today.getFullYear();if(s?.role!=='driver'||!b||b.month!==today.getMonth()+1||b.day!==today.getDate()||db.rewardClaims.some(c=>c.accountId===s.id&&c.threshold===key))return;db.rewardClaims.push({accountId:s.id,threshold:key,time:today.toISOString()});addDemoDays(3);save();}
function renderMembership(){
 const s=getSession(),el=document.getElementById('membershipContent');if(!el)return;
 const p=rewardProgress(),premium=hasPremium();
 el.innerHTML=`<div class="grid g2"><div class="card"><h3>Normal · ücretsiz</h3><p>Firma aracını seçip sana yük atayabilir. Taşımanı takip eder, teslim belgelerini ekler ve firmayı değerlendirirsin.</p></div><div class="card"><h3>Premium · ₺990 / ay</h3><p>Hem seçil hem sana uygun yükü kendin seç. Fiyat bir deneme önerisidir.</p>${s?.role==='driver'?`<button class="btn primary" onclick="${premium?'endPremium':'activatePremium'}()">${premium?'Demo üyeliği kapat':'30 günlük Premium demosunu aç'}</button><p class="muted small">${premium?'Demo bitişi: '+fmtDT(db.memberships[s.id].until):'Kart veya ödeme alınmaz. Otomatik yenileme yok.'}</p>`:'<p class="muted">Şoför üyelikleri burada açıklanır. Firma fiyatlandırması henüz belirlenmedi.</p>'}</div></div><div class="card" style="margin-top:18px"><h3>İyi hizmete karşılık avantaj</h3><p>10, 25, 50 ve 100 ayrı tamamlanmış taşımanın firma değerlendirmesi; ortalama en az 4,5. Örnek profil puanları sayılmaz.</p><p><b>${p.count} değerlendirme · ${p.count?dec(p.score):'—'} ortalama</b></p><div class="reward-grid">${[10,25,50,100].map(n=>{const taken=db.rewardClaims.some(c=>c.accountId===s?.id&&c.threshold===n);return `<div class="item"><b>${n} değerlendirme</b><p class="muted">${n===100?'Hediye talep hakkı':n+' gün üyelik avantajı'} · demo ödül kaydı</p><progress max="${n}" value="${Math.min(n,p.count)}"></progress><button class="btn soft" ${taken||p.count<n||p.score<4.5||s?.role!=='driver'?'disabled':''} onclick="claimReward(${n})">${taken?'Talep kaydedildi':'Ödül talep et'}</button></div>`}).join('')}</div><p class="muted small">Üyelik avantajları yerel demo sürene eklenir. 100 değerlendirme hediyesi talep olarak saklanır; gönderim yapılmaz. Şoför dostu firma avantajı platform bedelinden verilir, şoförün navlunu azaltılmaz.</p></div>`;
 if(s?.role==='driver'){
 const b=db.birthdayPreferences[s.id]||{},today=new Date(),claimed=db.rewardClaims.some(c=>c.accountId===s.id&&c.threshold==='birthday-'+today.getFullYear()),due=b.month===today.getMonth()+1&&b.day===today.getDate();
 el.insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:18px"><h3>Doğum günü sürprizi</h3><p class="muted">İsteğe bağlı. Yalnız gün ve ay saklanır. Doğum gününde 3 günlük üyelik avantajı için demo talebi oluşturabilirsin.</p><div class="form"><label>Ay<select id="birthdayMonth"><option value="0">Seç</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${b.month===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><label>Gün<input id="birthdayDay" type="number" min="1" max="31" value="${b.day||''}"></label><button class="btn soft" onclick="saveBirthday()">Tercihi kaydet</button><button class="btn soft" onclick="claimBirthday()" ${!due||claimed?'disabled':''}>${claimed?'Talep kaydedildi':'Doğum günü avantajını talep et'}</button></div><small>Tercihi silmek için ayı Seç yapıp günü boş bırak.</small></div>`);
 }
}
function eligibleReviews(role){return db.trips.filter(t=>t.stage==='Teslim edildi'&&ownedTrip(t,role)&&!db.tripReviews.some(r=>r.tripId===t.id&&r.role===role))}
const baseRenderRatings=renderRatings;
renderRatings=()=>{
 baseRenderRatings();
 for(const [id,role] of [['rateDriverSelect','company'],['rateCompanySelect','driver']]){
 const select=document.getElementById(id),rows=eligibleReviews(role);
 select.innerHTML=rows.length?rows.map(t=>`<option value="${t.id}">${escapeHtml(load(t.loadId).loadNo)} · ${escapeHtml(role==='company'?vehicle(t.vehicleId).driver:(load(t.loadId).ownerName||'Yükü yayınlayan firma'))}</option>`).join(''):'<option value="">Değerlendirilecek tamamlanmış taşıma yok</option>';
 const card=select.closest('.card');card.style.display=getSession()?.role===role?'':'none';card.querySelector('button').disabled=!rows.length;
 }
 for(const id of ['driverRatingsList','companyRatingsList'])document.getElementById(id).insertAdjacentHTML('afterbegin','<p class="muted small">Başlangıç profil puanları örnek veridir. Ödüller yalnız bu tarayıcıda tamamlanan taşımaların yeni değerlendirmelerinden hesaplanır.</p>');
 const list=document.getElementById('verifiedReviewList');list.innerHTML=db.tripReviews.filter(r=>ownedTrip(db.trips.find(t=>t.id===r.tripId),getSession()?.role)).map(r=>`<div class="item"><b>${escapeHtml(load(db.trips.find(t=>t.id===r.tripId).loadId).loadNo)} · ★ ${dec(r.score)}</b><p>${escapeHtml(r.comment)}</p><small>${r.role==='driver'?'Şoförün firma değerlendirmesi':'Firmanın şoför değerlendirmesi'} · ${fmtDT(r.time)}</small></div>`).join('')||'<div class="empty">Tamamlanan taşımaların yeni değerlendirmeleri burada görünür.</div>';
};
function recordTripReview(role){
 const id=document.getElementById(role==='company'?'rateDriverSelect':'rateCompanySelect').value,t=eligibleReviews(role).find(t=>t.id===id);if(!t)return alert('Yalnız sana ait tamamlanmış bir taşıma bir kez değerlendirilebilir.');
 const keys=role==='company'?['driverOnTime','driverComm','driverCargo','driverPod']:['companyPayment','companyLoading','companyUnloading','companyAccuracy'];
 const values=keys.map(k=>Number(document.getElementById(k).value));if(values.some(n=>!Number.isInteger(n)||n<1||n>5))return;
 db.tripReviews.push({tripId:t.id,vehicleId:t.vehicleId,companyId:load(t.loadId).ownerId,role,dimensions:Object.fromEntries(keys.map((k,i)=>[k,values[i]])),score:values.reduce((a,b)=>a+b,0)/values.length,comment:document.getElementById(role==='company'?'driverComment':'companyComment').value.trim().slice(0,1000),time:new Date().toISOString()});save();alert('Taşıma değerlendirmesi kaydedildi.');
}
submitDriverRating=()=>recordTripReview('company');
submitCompanyRating=()=>recordTripReview('driver');
function driverFriendly(companyId){const rs=db.tripReviews.filter(r=>r.role==='driver'&&r.companyId===companyId);return rs.length>=10&&rs.every(r=>r.dimensions)&&rs.reduce((a,r)=>a+r.score,0)/rs.length>=4.5&&rs.reduce((a,r)=>a+r.dimensions.companyPayment,0)/rs.length>=4.5}
function renderSupport(){
 const s=getSession();document.getElementById('supportTickets').innerHTML=db.supportTickets.filter(t=>t.accountId===s?.id).map(t=>`<div class="item"><div class="itemtop"><b>${escapeHtml(t.id)}</b><span class="chip amber">${escapeHtml(t.status)}</span></div><p>${escapeHtml(t.type)} · ${escapeHtml(t.loadNo||'Genel')}</p><p>${escapeHtml(t.detail)}</p><small>${fmtDT(t.time)} · Yerel demo kaydı; ekibe iletilmedi</small></div>`).join('')||'<div class="empty">Henüz destek kaydın yok.</div>';
}
supportDemo=type=>{document.getElementById('supportType').value=type;go('support');document.getElementById('supportDetail').focus()};
openDriverIssue=()=>supportDemo('Taşıma sorunu');
document.getElementById('supportForm').onsubmit=e=>{
 e.preventDefault();const s=getSession();if(!s)return;const detail=document.getElementById('supportDetail').value.trim();if(!detail)return;
 const t=trip();db.supportTickets.unshift({id:uid('DESTEK-'),accountId:s.id,type:document.getElementById('supportType').value,detail:detail.slice(0,2000),loadNo:t?load(t.loadId).loadNo:'',status:'Yerel kayıt',time:new Date().toISOString()});e.target.reset();save();
};
function toggleWait(){
 const t=trip(),s=getSession();if(!t||!ownedTrip(t,s?.role)||t.stage==='Teslim edildi')return;
 t.waits ||= [];const active=t.waits.find(w=>!w.end);if(active)active.end=Date.now();else t.waits.push({start:Date.now()});save();
}
function renderWait(){
 const t=trip(),el=document.getElementById('waitTracking');if(!el)return;
 if(!t||t.stage==='Teslim edildi'){el.innerHTML='';return;}
 const l=load(t.loadId),waits=t.waits||[],minutes=waits.reduce((n,w)=>n+((w.end||Date.now())-w.start)/60000,0),active=waits.some(w=>!w.end);
 const specified=l.freeWait!==undefined&&l.waitRate!==undefined&&l.freeWait!==''&&l.waitRate!=='';
 el.innerHTML=`<h3>Bekleme kaydı</h3><p>${Math.floor(minutes)} dakika · ${specified?'Tahmini ek bedel: ₺'+money(Math.round(Math.max(0,minutes-Number(l.freeWait))*Number(l.waitRate)/60)):'Bekleme bedeli şartlarda belirtilmedi'}</p><button class="btn soft" onclick="toggleWait()">${active?'Beklemeyi bitir':'Beklemeyi başlat'}</button><p class="muted small">Yükleme ve boşaltma beklemelerinin toplamı. Bedel tahminidir; tarafların onayı ve ödeme işlemi gerekir.</p>`;
}
const baseRenderAll=renderAll;
renderAll=()=>{baseRenderAll();renderMembership();renderSupport();renderWait();};
const baseEnterSession=enterSession;
enterSession=()=>{db.loads.forEach(l=>{if(!l.ownerId&&!l.edited){l.ownerId='C-DEMO';l.ownerName='Güney Yapı A.Ş. (örnek)'}});baseEnterSession();renderAll()};
const baseCityLoadCard=cityLoadCard;
cityLoadCard=(l,km)=>{let html=baseCityLoadCard(l,km);if(getSession()?.role==='driver'&&!hasPremium())html=html.replace('Bu yükü al','Premium ile seç');return html;};
const baseRenderDriverViews=renderDriverViews;
renderDriverViews=()=>{
 baseRenderDriverViews();
 const s=getSession();if(s?.role==='driver'){
 const rs=db.tripReviews.filter(r=>r.role==='company'&&r.vehicleId===myVehicle()?.id);
 if(rs.length){document.getElementById('driverProfileRating').textContent=dec(rs.reduce((n,r)=>n+r.score,0)/rs.length);document.getElementById('driverProfileReviews').textContent=rs.length;}
 const trusted=document.getElementById('driverTrustedCompanies');
 trusted.innerHTML=db.loads.filter(l=>driverFriendly(l.ownerId)).filter((l,i,a)=>a.findIndex(x=>x.ownerId===l.ownerId)===i).map(l=>'<div class="item"><b>Şoför dostu firma</b><p>'+escapeHtml(l.ownerId===s.id?s.name:(l.ownerName||'Firma hesabı'))+'</p><small>En az 10 tamamlanmış taşıma; genel ve ödeme puanı en az 4,5.</small></div>').join('')||'<div class="empty">Henüz gerçek taşıma değerlendirmelerinden rozet kazanan firma yok. Örnek puanlar bu rozeti sağlamaz.</div>';
 }
};
const baseConfirmDelivery=confirmDelivery;
confirmDelivery=async()=>{const t=trip();await baseConfirmDelivery();if(t?.stage==='Teslim edildi'){(t.waits||[]).filter(w=>!w.end).forEach(w=>w.end=Date.now());save();}};
setInterval(renderWait,60000);
localStorage.setItem(K,JSON.stringify(db));
renderAll();
