// HLZ: оболочка приложения (PWA) + фоновые уведомления (Web Push). Версию V меняй, если нужно сбросить кэш у всех.
const V='hlz-v3',CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png',CDN];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=V).map(k=>caches.delete(k)))).then(()=>clients.claim())));
// сначала сеть (всегда свежая версия), без сети — из кэша; запросы к Supabase и CDN не трогаем
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!='GET')return;
 if(u.host=='cdn.jsdelivr.net'){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));return}
 if(u.origin!=location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
// пришло push-сообщение от сервера
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){d={title:'HLZ',body:e.data?e.data.text():''}}
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
  if(l.some(c=>c.visibilityState=='visible')&&!d.force)return; // приложение открыто на экране — оно покажет всё само
  return self.registration.showNotification(d.title||'HLZ',{body:d.body||'',tag:d.tag,renotify:true,icon:'icon-192.png',badge:'icon-192.png',data:{chat:d.chat},requireInteraction:!!d.call,vibrate:d.call?[300,150,300,150,300]:undefined})}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const chat=e.notification.data&&e.notification.data.chat;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
  if(l.length){const c=l[0];c.postMessage({open:chat});return c.focus()}
  return clients.openWindow('./'+(chat?'#c='+chat:''))}))});
