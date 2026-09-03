/* =====================================================================
   LL VARIEDADES — CARTÃO FIDELIDADE DIGITAL
   Service Worker — habilita instalação do app e uso básico offline.

   IMPORTANTE: este arquivo precisa ficar na MESMA PASTA do index.html,
   publicado no mesmo endereço (mesmo domínio/HTTPS) do site. Sem ele
   presente no servidor, o botão "Instalar aplicativo" continua
   funcionando (usando o prompt nativo do navegador ou as instruções
   manuais), mas o app não terá cache offline nem aparecerá no menu de
   instalação automática de todos os navegadores.
   ===================================================================== */

const CACHE_NOME = "llv-cartao-fidelidade-v1";
const PAGINA_OFFLINE = "./index.html";

self.addEventListener("install", (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches
      .open(CACHE_NOME)
      .then((cache) => cache.add(PAGINA_OFFLINE))
      .catch(() => {})
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE_NOME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches
          .open(CACHE_NOME)
          .then((cache) => cache.put(evento.request, copia))
          .catch(() => {});
        return resposta;
      })
      .catch(() =>
        caches.match(evento.request).then((resposta) => resposta || caches.match(PAGINA_OFFLINE))
      )
  );
});
