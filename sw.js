const CACHE = "central190-v2.7.0-f33-defesa-civil-aguia";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/i18n.js",
  "./js/assets.js",
  "./js/release.js",
  "./js/balance.js",
  "./js/tutorial.js",
  "./js/public-rc.js",
  "./js/immersion.js",
  "./js/content.js",
  "./js/campaign.js",
  "./js/call-protocol.js",
  "./js/triage.js",
  "./js/resource-dispatch.js",
  "./js/field-radio.js",
  "./js/field-units.js",
  "./js/training-academy.js",
  "./js/location-intel.js",
  "./js/save-manager.js",
  "./js/career.js",
  "./js/dispatch.js",
  "./js/map.js",
  "./js/anti-break.js",
  "./js/app.js",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/leaflet.js",
  "./vendor/leaflet/images/layers.png",
  "./vendor/leaflet/images/layers-2x.png",
  "./vendor/leaflet/images/marker-icon.png",
  "./vendor/leaflet/images/marker-icon-2x.png",
  "./vendor/leaflet/images/marker-shadow.png",
  "./manifest.webmanifest",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/badges/central190-brand.svg",
  "./assets/ui/panel-noise.svg",
  "./assets/ui/topbar-glow.svg",
  "./assets/ui/radio-waves.svg",
  "./assets/illustrations/operator-desk.svg",
  "./assets/backgrounds/bg-central-room.webp",
  "./assets/backgrounds/bg-dashboard-room.webp",
  "./assets/backgrounds/bg-dispatch-immersive.webp",
  "./assets/backgrounds/bg-map-ops.webp",
  "./assets/backgrounds/bg-career-room.webp",
  "./assets/backgrounds/bg-settings-room.webp",
  "./assets/backgrounds/bg-control-room-hall.webp",
  "./assets/backgrounds/bg-control-room-lobby.webp",
  "./assets/ui/ui-panel-kit.png",
  "./assets/units/sp-police-car-cinematic.png",
  "./assets/units/sp-police-motorcycle-cinematic.png",
  "./assets/units/sp-police-helicopter-cinematic.png",
  "./assets/units/sp-fire-truck-cinematic.png",
  "./assets/units/sp-fire-rescue-cinematic.png",
  "./assets/units/sp-samu-ambulance-cinematic.png",
  "./assets/units/sp-civil-defense-cinematic.png",
  "./assets/units/sp-police-support-cinematic.png",
  "./assets/units/unit-police-cruiser.png",
  "./assets/units/unit-ambulance-samu.png",
  "./assets/units/unit-fire-rescue.png",
  "./assets/units/unit-helicopter-police.png"
];

const OPTIONAL_ASSETS = [
  "./assets/backgrounds/bg-home-city-night.webp",
  "./assets/backgrounds/bg-home-hero-clean.png",
  "./assets/backgrounds/bg-home-hero-clean2.png",
  "./assets/backgrounds/bg-home-reference.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS).then(() => Promise.allSettled(OPTIONAL_ASSETS.map((src) => cache.add(src)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  // Tiles e demais serviços externos nunca são armazenados pelo jogo.
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const update = fetch(event.request)
        .then((response) => {
          if (response?.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || update;
    }),
  );
});
