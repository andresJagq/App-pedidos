// Service Worker de CalculaPedidos
// Estrategia: "network-first" para archivos propios (siempre la versión más nueva si hay
// internet) con respaldo desde caché cuando no hay conexión. No toca Supabase ni los CDNs.
const CACHE = 'calculapedidos-v1'
const ASSETS = [
  './',
  './index.html',
  './app.html',
  './admin.html',
  './supabase.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const req = e.request
  // Solo GET del mismo origen: nunca interceptamos Supabase (POST/datos) ni CDNs
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone()
        caches.open(CACHE).then(c => c.put(req, copy))
        return res
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./app.html')))
  )
})
