/* ══════════════════════════════════════════════════════════════
   MAPA INTERATIVO DE DESTINO — Mari & Pedro
   Motor: MapLibre GL JS (vetorial, open source) + tiles OpenFreeMap.
   Sem Google Maps e sem chave de API. Google/Waze só abrem ao clicar
   em "Como chegar".
   Dados: data/weddingLocations.json (edite lá nomes, fotos, links).
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const app = document.getElementById('destino-app');
  if (!app) return;

  const DATA_URL = app.dataset.src || 'data/weddingLocations.json';
  const ML_VER = '4.7.1';
  const ML_JS = `https://unpkg.com/maplibre-gl@${ML_VER}/dist/maplibre-gl.js`;
  const ML_CSS = `https://unpkg.com/maplibre-gl@${ML_VER}/dist/maplibre-gl.css`;
  const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ehMobile = () => window.matchMedia('(max-width: 960px)').matches;

  const WA_MSG = 'Olá! Vi a indicação de vocês no site do casamento da Mari e do Pedro (14/11/2027) ' +
    'e gostaria de saber sobre disponibilidade de 12 a 15 de novembro de 2027.';

  /* ── ícones fine-line (stroke = currentColor) ──────────────── */
  const I = {
    capela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.8v3.6M10.3 3.4h3.4"/><path d="M8.2 9.2 12 5.6l3.8 3.6"/><path d="M8.8 8.8v3.4M15.2 8.8v3.4"/><path d="M4 21.5V14l4.8-2.6h6.4L20 14v7.5"/><path d="M2.8 21.5h18.4"/><path d="M10.2 21.5v-3.6a1.8 1.8 0 0 1 3.6 0v3.6"/><path d="M6.6 16.2v1.6M17.4 16.2v1.6"/></svg>',
    festa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 4.5h4.6l-.6 5.2a1.7 1.7 0 0 1-3.4 0z" transform="rotate(-12 7.5 8)"/><path d="M14.2 4.5h4.6l-.6 5.2a1.7 1.7 0 0 1-3.4 0z" transform="rotate(12 16.5 8)"/><path d="M8.3 11.6 9.6 19M15.7 11.6 14.4 19M7.6 19.6h4M12.4 19.6h4"/><path d="M12 1.6v1.6M9.6 2.4l.8 1.2M14.4 2.4l-.8 1.2"/></svg>',
    villa: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4v5M17.8 6.2h4.4"/><path d="M14.6 14.6 20 9.4l5.4 5.2"/><path d="M15.4 14v5M24.6 14v5"/><path d="M8.6 33V22.4l6.8-3.6h9.2l6.8 3.6V33"/><path d="M6 33h28"/><path d="M17.4 33v-5.2a2.6 2.6 0 0 1 5.2 0V33"/><path d="M12.2 25.4v2.2M27.8 25.4v2.2"/><path d="M3.6 33c0-4 1-7.8 3.2-10.6M3.2 24.8c1.4-.9 2.8-1.2 4.2-.9M4.4 21.6c1.2.3 2.2 1 2.8 2"/><path d="M36.4 33c0-4-1-7.8-3.2-10.6M36.8 24.8c-1.4-.9-2.8-1.2-4.2-.9M35.6 21.6c-1.2.3-2.2 1-2.8 2"/></svg>',
    pousada: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4.5l8.5 6.5"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-4.6h4V20"/><path d="M8.2 12.6h1.6M14.2 12.6h1.6"/></svg>',
    casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20.5 12 5l9 15.5"/><path d="M1.8 20.5h20.4"/><path d="M10 20.5v-4.2h4v4.2"/><path d="M8 7.6c.8-2.2 2.4-3.6 4-4 1.6.4 3.2 1.8 4 4"/></svg>',
    chale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12.5 12 5l9.5 7.5"/><path d="M5 11v7h14v-7"/><path d="M9.8 18v-3.6h4.4V18"/><path d="M2.5 21c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/></svg>',
    aluguel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="12" r="3.6"/><path d="M11.1 12H21M17.6 12v3M20.6 12v2.2"/></svg>',
    aviao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.2 13.8 3 11.4l1.4-1.4 8.4.6 4.6-4.6a1.8 1.8 0 0 1 2.6 2.6l-4.6 4.6.6 8.4-1.4 1.4-2.4-7.2-3 3v2.4l-1 1-1.4-3.2L2.6 17.6l1-1H6z"/></svg>',
    pe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.6"/><path d="m9 21 2.4-6.4M15.5 21l-2.3-5.2-2-3 .8-4.2L8.6 10l-1 3.4M12 8.6l2.6 2.6 2.8.8"/></svg>',
    carro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16.5V12l2-5h12l2 5v4.5"/><path d="M3 12h18v4.5H3z"/><circle cx="7" cy="18.2" r="1.6"/><circle cx="17" cy="18.2" r="1.6"/></svg>',
    onda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 18.5c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20.5 5.3 16A8.5 8.5 0 1 1 8.4 19z"/><path d="M9 8.6c0 3.4 2.9 6.3 6.4 6.4l1.2-1.6-2-1-1 .9a4.6 4.6 0 0 1-2.9-2.9l.9-1-1-2z"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.1" cy="6.9" r=".6" fill="currentColor"/></svg>',
    rota: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    waze: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6.2 17.4C3.8 16.6 3 14.4 3 12.6 3 7.8 7 4 12 4s9 3.6 9 8.2c0 4-3.4 6.8-7.6 6.8H10"/><circle cx="7.8" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/><path d="M9.4 9.8v.4M14.6 9.8v.4M9.6 13.2c1.4 1.2 3.4 1.2 4.8 0"/></svg>',
    gmaps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 6 6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18l-6 2.5z"/><path d="M9 3.5V18M15 6v14.5"/></svg>',
    tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c3-1 3-5 6-6s4 2 7 0 3-6 3-6"/><circle cx="4" cy="18" r="1.6"/><path d="m17.4 4.2 2.8 1.6-1.6 2.8"/></svg>',
    parar: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1"/></svg>',
    tudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const ROTULO_TIPO = { pousada: 'Pousada', casa: 'Casa de temporada', chale: 'Chalés', aluguel: 'Aluguel por temporada' };

  /* ── utilidades ─────────────────────────────────────────────── */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const metros = km => km < 1 ? `${Math.round(km * 1000 / 50) * 50} m` : `${km.toLocaleString('pt-BR')} km`;
  const duracao = min => min < 60 ? `${min} min` : `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
  const linkWaze = ([lon, lat]) => `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
  const linkGmaps = ([lon, lat]) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  const linkZap = n => `https://wa.me/55${n}?text=${encodeURIComponent(WA_MSG)}`;
  const fmtFone = n => `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;

  function carregarCSS(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
  }
  function carregarJS(src) {
    return new Promise((ok, erro) => {
      if (window.maplibregl) return ok();
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = ok; s.onerror = erro; document.head.appendChild(s);
    });
  }

  /* comprimento e interpolação de uma polilinha (para o tour) */
  function prepararTrajeto(coords) {
    const acum = [0];
    for (let i = 1; i < coords.length; i++) {
      const [x1, y1] = coords[i - 1], [x2, y2] = coords[i];
      const dx = (x2 - x1) * Math.cos((y1 + y2) / 2 * Math.PI / 180);
      acum.push(acum[i - 1] + Math.hypot(dx, y2 - y1));
    }
    const total = acum[acum.length - 1];
    function emT(t) {
      const alvo = t * total;
      let i = 1; while (i < acum.length - 1 && acum[i] < alvo) i++;
      const seg = acum[i] - acum[i - 1] || 1, f = (alvo - acum[i - 1]) / seg;
      const a = coords[i - 1], b = coords[i];
      return { pt: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], idx: i };
    }
    return { emT, coords };
  }
  function rumo([x1, y1], [x2, y2]) {
    const r = Math.PI / 180;
    const y = Math.sin((x2 - x1) * r) * Math.cos(y2 * r);
    const x = Math.cos(y1 * r) * Math.sin(y2 * r) - Math.sin(y1 * r) * Math.cos(y2 * r) * Math.cos((x2 - x1) * r);
    return Math.atan2(y, x) / r;
  }
  const suave = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ── estado ─────────────────────────────────────────────────── */
  let D, map = null, itens = [], ativo = null, filtro = 'todos', tourRodando = false, tourCancelar = null;
  const pins = new Map();

  /* ── montagem do DOM ───────────────────────────────────────── */
  function montarEsqueleto() {
    app.innerHTML = `
      <div class="destino-map-wrap">
        <div class="destino-map" id="destino-map" aria-label="Mapa do Patacho com a Villa e as pousadas próximas" role="region"></div>
        <div class="destino-status">Desenhando o Patacho…</div>
        <div class="destino-toolbar">
          <button class="dm-chip primario" type="button" data-acao="tour">${I.tour}<span>Tour: Aeroporto → Villa</span></button>
          <button class="dm-chip" type="button" data-acao="tudo">${I.tudo}<span>Ver tudo</span></button>
          <div class="dm-filtros" role="group" aria-label="Filtrar hospedagens">
            <button class="dm-chip" type="button" data-filtro="todos" aria-pressed="true">Todos</button>
            <button class="dm-chip" type="button" data-filtro="pousada" aria-pressed="false">Pousadas</button>
            <button class="dm-chip" type="button" data-filtro="casas" aria-pressed="false">Casas &amp; chalés</button>
          </div>
        </div>
        <div class="dm-badge-rota" aria-live="polite">
          ${I.aviao.replace('<svg', '<svg width="18" height="18"')}
          <span class="dm-b-longo">${esc(D.arrival.from.replace(/ \(.*\)/, ''))}</span><span class="dm-b-curto">MCZ → Villa</span><span class="sep"></span>
          <strong>${D.arrival.km} km · ${duracao(D.arrival.min)}</strong><span class="dm-b-longo">de carro até a Villa</span><span class="dm-b-curto">de carro</span>
          <span class="dm-prog"><i></i></span>
        </div>
        <div class="dm-flutuante" data-lenis-prevent></div>
      </div>
      <aside class="destino-painel" aria-label="Lista de locais">
        <div class="dm-painel-topo">
          <div class="dm-painel-eyebrow">Patacho · Porto de Pedras · AL</div>
          <div class="dm-painel-titulo">Onde ficar perto da gente</div>
          <div class="dm-painel-sub">${D.places.length} opções a poucos minutos a pé da Villa</div>
        </div>
        <ul class="dm-lista" data-lenis-prevent></ul>
        <div class="dm-painel-rodape">Toque num ponto do mapa ou da lista. Tempos calculados a pé e de carro até a Villa.</div>
      </aside>
      <div class="dm-carrossel" data-lenis-prevent></div>
      <div class="dm-pontos" aria-hidden="true"></div>`;
  }

  function cartaoHTML(it, modo) {
    const v = it.tipo === 'villa';
    const foto = `<div class="dm-card-foto"><img src="${esc(it.photo)}" alt="${esc(it.name)}" loading="lazy" decoding="async"/>
      <span class="dm-card-tipo">${v ? 'Cerimônia & festa' : esc(ROTULO_TIPO[it.kind] || 'Hospedagem')}</span>
      ${modo === 'float' ? `<button class="dm-card-fechar" type="button" aria-label="Fechar">${I.x}</button>` : ''}</div>`;

    const dist = v
      ? `<span>${I.onda}4 min a pé da praia</span><span>${I.aviao}${D.arrival.km} km do aeroporto MCZ</span>`
      : `<span>${I.pe}${it.toVilla.walkMin} min a pé</span><span>${I.carro}${it.toVilla.carMin} min de carro</span><span>${I.rota}${metros(it.toVilla.km)} da Villa</span>`;

    const momentos = v ? `<ul class="dm-card-momentos">${it.moments.map(m =>
      `<li>${I[m.icon] || I.pousada}<div><strong>${esc(m.label)}</strong>${esc(m.detail)}</div></li>`).join('')}</ul>` : '';

    const acoes = [];
    (it.whatsapp || []).forEach((n, i) => acoes.push(
      `<a class="dm-btn zap" href="${linkZap(n)}" target="_blank" rel="noopener" title="WhatsApp ${fmtFone(n)}">${I.zap}${i ? 'WhatsApp 2' : 'WhatsApp'}</a>`));
    if (it.instagram) acoes.push(
      `<a class="dm-btn" href="https://instagram.com/${esc(it.instagram)}" target="_blank" rel="noopener" title="@${esc(it.instagram)}">${I.insta}Instagram</a>`);
    if (v) acoes.push(`<a class="dm-btn" href="#local">${I.capela}A capela</a>`);
    acoes.push(`<span style="position:relative;margin-left:auto">
        <button class="dm-btn cheio" type="button" data-acao="rota" aria-expanded="false">${I.rota}Como chegar</button>
        <span class="dm-rota-menu" role="menu">
          <a role="menuitem" href="${linkWaze(it.coords)}" target="_blank" rel="noopener">${I.waze}Abrir no Waze</a>
          <a role="menuitem" href="${linkGmaps(it.coords)}" target="_blank" rel="noopener">${I.gmaps}Abrir no Google Maps</a>
        </span></span>`);

    const contato = (it.whatsapp || []).length ? `<div class="dm-card-end">WhatsApp ${it.whatsapp.map(fmtFone).join(' · ')}</div>` : '';

    return `${foto}<div class="dm-card-corpo">
        <div class="dm-card-nome">${esc(it.name)}</div>
        <div class="dm-card-end">${esc(it.address)}</div>
        <div class="dm-card-dist">${dist}</div>
        ${momentos}
        <p class="dm-card-nota">${esc(it.note || '')}</p>
        ${contato}
        <div class="dm-acoes">${acoes.join('')}</div>
      </div>`;
  }

  function montarListas() {
    const lista = app.querySelector('.dm-lista');
    const carrossel = app.querySelector('.dm-carrossel');
    const pontos = app.querySelector('.dm-pontos');
    lista.innerHTML = itens.map(it => `
      <li><button class="dm-item ${it.tipo === 'villa' ? 'villa' : ''}" type="button" data-id="${it.id}">
        <img class="dm-item-foto" src="${esc(it.photo)}" alt="" loading="lazy" decoding="async"/>
        <span><span class="dm-item-nome">${esc(it.name)}</span>
          <span class="dm-item-meta">${it.tipo === 'villa' ? 'Cerimônia, festa e hospedagem oficial'
            : `${esc(ROTULO_TIPO[it.kind])} · ${it.toVilla.walkMin} min a pé`}</span></span>
        <span class="dm-item-num">${it.tipo === 'villa' ? '✦' : String(it.n).padStart(2, '0')}</span>
      </button></li>`).join('');
    carrossel.innerHTML = itens.map(it =>
      `<article class="dm-card ${it.tipo === 'villa' ? 'villa' : ''}" data-id="${it.id}">${cartaoHTML(it, 'carousel')}</article>`).join('');
    pontos.innerHTML = itens.map(it => `<i data-id="${it.id}"></i>`).join('');

    lista.addEventListener('click', e => {
      const b = e.target.closest('.dm-item'); if (b) selecionar(b.dataset.id, { origem: 'lista' });
    });

    /* carrossel → mapa: o cartão que "assenta" vira o ativo */
    let t;
    carrossel.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const cards = [...carrossel.querySelectorAll('.dm-card:not([hidden])')];
        const x = carrossel.scrollLeft + 16;
        let melhor = cards[0], dist = Infinity;
        cards.forEach(c => { const d = Math.abs(c.offsetLeft - x); if (d < dist) { dist = d; melhor = c; } });
        if (melhor && melhor.dataset.id !== ativo) selecionar(melhor.dataset.id, { origem: 'carrossel' });
      }, 140);
    }, { passive: true });
  }

  /* ── seleção sincronizada ──────────────────────────────────── */
  function selecionar(id, { origem = 'mapa', mover = true } = {}) {
    const it = itens.find(x => x.id === id); if (!it) return;
    if (tourRodando && origem !== 'tour') pararTour();
    ativo = id;

    pins.forEach((el, pid) => el.classList.toggle('ativo', pid === id));
    app.querySelectorAll('.dm-item').forEach(b => b.classList.toggle('ativo', b.dataset.id === id));
    app.querySelectorAll('.dm-carrossel .dm-card').forEach(c => c.classList.toggle('ativo', c.dataset.id === id));
    app.querySelectorAll('.dm-pontos i').forEach(p => p.classList.toggle('ativo', p.dataset.id === id));

    if (origem !== 'lista') {
      const b = app.querySelector(`.dm-item[data-id="${id}"]`);
      if (b) b.scrollIntoView({ block: 'nearest', behavior: reduzMovimento ? 'auto' : 'smooth' });
    }
    if (origem !== 'carrossel' && ehMobile()) {
      const car = app.querySelector('.dm-carrossel'), c = car.querySelector(`.dm-card[data-id="${id}"]`);
      if (c) car.scrollTo({ left: c.offsetLeft - 16, behavior: reduzMovimento ? 'auto' : 'smooth' });
    }

    /* cartão flutuante (desktop) */
    const flut = app.querySelector('.dm-flutuante');
    flut.innerHTML = `<article class="dm-card ${it.tipo === 'villa' ? 'villa' : ''}">${cartaoHTML(it, 'float')}</article>`;
    requestAnimationFrame(() => flut.classList.add('aberto'));

    if (!map) return;
    const linha = map.getSource('trajeto');
    if (it.tipo === 'villa') {
      linha && linha.setData(vazio());
      if (mover) map.flyTo({ center: it.coords, zoom: 16.2, pitch: 45, bearing: -18, duration: reduzMovimento ? 0 : 1800, padding: padCamera(), essential: true });
    } else {
      linha && linha.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: it.toVilla.path } });
      if (mover) {
        const b = new maplibregl.LngLatBounds(it.coords, it.coords); b.extend(D.venue.coords);
        it.toVilla.path.forEach(c => b.extend(c));
        map.fitBounds(b, { padding: padCamera(true), maxZoom: 17, pitch: 30, bearing: 0, duration: reduzMovimento ? 0 : 1400 });
      }
    }
  }
  function fecharCartao() {
    app.querySelector('.dm-flutuante').classList.remove('aberto');
    pins.forEach(el => el.classList.remove('ativo'));
    app.querySelectorAll('.dm-item').forEach(b => b.classList.remove('ativo'));
    ativo = null;
    map && map.getSource('trajeto') && map.getSource('trajeto').setData(vazio());
  }
  function padCamera(folga) {
    const w = app.querySelector('.destino-map-wrap').clientWidth;
    if (ehMobile()) return { top: 70, bottom: 70, left: 40, right: 40 };
    const r = Math.min(430, w * .5);
    return folga ? { top: 90, bottom: 90, left: 80, right: r } : { top: 60, bottom: 60, left: 0, right: r };
  }
  const vazio = () => ({ type: 'FeatureCollection', features: [] });

  /* ── filtros ───────────────────────────────────────────────── */
  function aplicarFiltro(f) {
    filtro = f;
    app.querySelectorAll('[data-filtro]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filtro === f)));
    const passa = it => it.tipo === 'villa' || f === 'todos' || (f === 'pousada' ? it.kind === 'pousada' : it.kind !== 'pousada');
    itens.forEach(it => {
      const ok = passa(it);
      const p = pins.get(it.id); if (p && it.tipo !== 'villa') p.classList.toggle('esmaecido', !ok);
      const li = app.querySelector(`.dm-item[data-id="${it.id}"]`); if (li) li.classList.toggle('esmaecido', !ok);
      const c = app.querySelector(`.dm-carrossel .dm-card[data-id="${it.id}"]`); if (c) c.hidden = !ok;
      const d = app.querySelector(`.dm-pontos i[data-id="${it.id}"]`); if (d) d.hidden = !ok;
    });
    if (ativo) { const a = itens.find(x => x.id === ativo); if (a && !passa(a)) fecharCartao(); }
  }

  /* ── mapa ──────────────────────────────────────────────────── */
  function verTudo(dur) {
    if (!map) return;
    const b = new maplibregl.LngLatBounds(D.venue.coords, D.venue.coords);
    D.places.forEach(p => b.extend(p.coords));
    map.fitBounds(b, { padding: padCamera(true), pitch: 0, bearing: 0, maxZoom: 16.4, duration: dur == null ? 1200 : dur });
  }

  function estilizar() {
    /* reveste o estilo Positron com a paleta do site */
    const P = {
      fundo: '#f1ebdd', agua: '#bcd6e2', verde: '#dfe2cc', bairro: '#ebe4d4', predio: '#e3d9c4',
      via: '#fffdf7', viaBorda: '#d8cdb3', texto: '#6d7262', halo: '#f5f1e8',
    };
    map.getStyle().layers.forEach(l => {
      const id = l.id;
      try {
        if (l.type === 'background') map.setPaintProperty(id, 'background-color', P.fundo);
        else if (l.type === 'fill') {
          if (/water/.test(id)) map.setPaintProperty(id, 'fill-color', P.agua);
          else if (/park|wood|grass/.test(id)) map.setPaintProperty(id, 'fill-color', P.verde);
          else if (/residential/.test(id)) map.setPaintProperty(id, 'fill-color', P.bairro);
          else if (/building/.test(id)) { map.setPaintProperty(id, 'fill-color', P.predio); map.setPaintProperty(id, 'fill-outline-color', '#d6caaf'); }
        } else if (l.type === 'line') {
          if (/waterway/.test(id)) map.setPaintProperty(id, 'line-color', P.agua);
          else if (/boundary/.test(id)) map.setPaintProperty(id, 'line-color', '#cbbf9f');
          else if (/casing/.test(id)) map.setPaintProperty(id, 'line-color', P.viaBorda);
          else if (/highway|road|tunnel|pier/.test(id)) map.setPaintProperty(id, 'line-color', /path/.test(id) ? P.viaBorda : P.via);
        } else if (l.type === 'symbol' && l.layout && l.layout['text-field']) {
          map.setPaintProperty(id, 'text-color', /water/.test(id) ? '#5b8aa3' : P.texto);
          map.setPaintProperty(id, 'text-halo-color', P.halo);
          if (/shield/.test(id)) map.setLayoutProperty(id, 'visibility', 'none');
        }
      } catch (e) { /* camada sem a propriedade — ignora */ }
    });
  }

  function camadas() {
    const chegada = { type: 'Feature', geometry: { type: 'LineString', coordinates: D.arrival.path } };
    map.addSource('chegada', { type: 'geojson', data: chegada });
    map.addSource('chegada-prog', { type: 'geojson', data: vazio() });
    map.addSource('trajeto', { type: 'geojson', data: vazio() });

    map.addLayer({ id: 'chegada-base', type: 'line', source: 'chegada',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#a08858', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.4, 15, 3], 'line-opacity': .28 } });
    map.addLayer({ id: 'chegada-tracejado', type: 'line', source: 'chegada',
      layout: { 'line-cap': 'butt', 'line-join': 'round' },
      paint: { 'line-color': '#a08858', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.2, 15, 2.2], 'line-dasharray': [0, 4, 3] } });
    map.addLayer({ id: 'chegada-prog', type: 'line', source: 'chegada-prog',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#323e24', 'line-width': 3.2 } });
    map.addLayer({ id: 'trajeto-halo', type: 'line', source: 'trajeto',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#fdf9f0', 'line-width': 7, 'line-opacity': .9 } });
    map.addLayer({ id: 'trajeto', type: 'line', source: 'trajeto',
      layout: { 'line-cap': 'butt', 'line-join': 'round' },
      paint: { 'line-color': '#3d82aa', 'line-width': 2.6, 'line-dasharray': [0, 4, 3] } });

    /* "formiguinhas": a linha tracejada caminha em direção à Villa */
    if (!reduzMovimento) {
      const seq = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, .5], [3, 4, 0],
        [0, .5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, .5]];
      let passo = -1, ult = 0;
      const animar = ts => {
        if (!map) return;
        if (ts - ult > 70) {
          ult = ts; passo = (passo + 1) % seq.length;
          try {
            map.setPaintProperty('chegada-tracejado', 'line-dasharray', seq[passo]);
            map.setPaintProperty('trajeto', 'line-dasharray', seq[passo]);
          } catch (e) { /* estilo recarregando */ }
        }
        requestAnimationFrame(animar);
      };
      requestAnimationFrame(animar);
    }
  }

  function marcadores() {
    /* Villa: marco principal (capela + festa) */
    const v = document.createElement('div');
    v.className = 'dm-villa';
    v.setAttribute('role', 'button'); v.tabIndex = 0;
    v.setAttribute('aria-label', 'Villa Canziani & Donato: cerimônia e festa');
    v.innerHTML = `<div class="dm-villa-disco">${I.villa}</div>
      <div class="dm-villa-rotulo">Villa Canziani &amp; Donato<small>Cerimônia · Festa</small></div>`;
    v.addEventListener('click', e => { e.stopPropagation(); selecionar('villa'); });
    v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionar('villa'); } });
    new maplibregl.Marker({ element: v, anchor: 'center' }).setLngLat(D.venue.coords).addTo(map);
    pins.set('villa', v.querySelector('.dm-villa-disco'));

    /* hospedagens */
    D.places.forEach(p => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'dm-pin';
      el.setAttribute('aria-label', `${p.name}, ${p.toVilla.walkMin} minutos a pé da Villa`);
      el.innerHTML = `${I[p.kind] || I.pousada}<span class="dm-num">${p.n}</span>`;
      el.addEventListener('click', e => { e.stopPropagation(); selecionar(p.id); });
      new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(p.coords).addTo(map);
      pins.set(p.id, el);
    });

    /* aeroporto — só aparece de longe */
    const a = document.createElement('div');
    a.className = 'dm-aero';
    a.innerHTML = `${I.aviao}<span>Aeroporto MCZ</span>`;
    const ma = new maplibregl.Marker({ element: a, anchor: 'left' }).setLngLat(D.arrival.coords).addTo(map);
    const zoomAero = () => { a.style.display = map.getZoom() < 12.5 ? '' : 'none'; };
    map.on('zoom', zoomAero); zoomAero();
    return ma;
  }

  /* ── tour cinematográfico: Aeroporto → Villa ───────────────── */
  async function tour() {
    if (!map) return;
    if (tourRodando) { pararTour(); return; }
    tourRodando = true;
    const btn = app.querySelector('[data-acao="tour"]');
    const badge = app.querySelector('.dm-badge-rota'), barra = badge.querySelector('.dm-prog i');
    btn.classList.add('tour-ativo'); btn.innerHTML = `${I.parar}<span>Parar tour</span>`;
    badge.classList.add('tocando');
    fecharCartao();
    let cancelado = false;
    tourCancelar = () => { cancelado = true; };

    const espera = () => new Promise(r => map.once('moveend', r));
    const tr = prepararTrajeto(D.arrival.path);

    if (reduzMovimento) {
      const b = new maplibregl.LngLatBounds(D.arrival.coords, D.arrival.coords); D.arrival.path.forEach(c => b.extend(c));
      map.fitBounds(b, { padding: 60, duration: 0 });
      map.getSource('chegada-prog').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: D.arrival.path } });
      barra.style.width = '100%';
      finalizar(); return;
    }

    const inicio = tr.emT(0).pt, adiante = tr.emT(.04).pt;
    map.flyTo({ center: inicio, zoom: 11.4, pitch: 58, bearing: rumo(inicio, adiante), duration: 2600, essential: true });
    await espera();
    if (cancelado) return;

    const DUR = 12000;
    let t0 = null, rumoSuave = map.getBearing();
    await new Promise(fim => {
      const quadro = ts => {
        if (cancelado) return fim();
        if (t0 == null) t0 = ts;
        const tl = Math.min(1, (ts - t0) / DUR), t = suave(tl);
        const { pt, idx } = tr.emT(t);
        const alvo = rumo(pt, tr.emT(Math.min(1, t + .05)).pt);
        let delta = ((alvo - rumoSuave + 540) % 360) - 180;
        rumoSuave += delta * .04;
        map.jumpTo({ center: pt, bearing: rumoSuave, zoom: 11.4 + t * 1.6, pitch: 58 });
        map.getSource('chegada-prog').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [...tr.coords.slice(0, idx), pt] } });
        barra.style.width = `${(tl * 100).toFixed(1)}%`;
        if (tl < 1) requestAnimationFrame(quadro); else fim();
      };
      requestAnimationFrame(quadro);
    });
    if (cancelado) return;
    finalizar();

    function finalizar() {
      selecionar('villa', { origem: 'tour', mover: false });
      map.flyTo({ center: D.venue.coords, zoom: 16.2, pitch: 45, bearing: -18, duration: reduzMovimento ? 0 : 3200, padding: padCamera(), essential: true });
      encerrarUI();
    }
  }
  function pararTour() {
    if (tourCancelar) tourCancelar();
    encerrarUI();
  }
  function encerrarUI() {
    tourRodando = false; tourCancelar = null;
    const btn = app.querySelector('[data-acao="tour"]');
    btn.classList.remove('tour-ativo'); btn.innerHTML = `${I.tour}<span>Tour: Aeroporto → Villa</span>`;
    const badge = app.querySelector('.dm-badge-rota');
    badge.classList.remove('tocando');
    setTimeout(() => { badge.querySelector('.dm-prog i').style.width = '0'; map && map.getSource('chegada-prog') && map.getSource('chegada-prog').setData(vazio()); }, 3500);
  }

  /* ── eventos gerais ────────────────────────────────────────── */
  function ligarEventos() {
    app.addEventListener('click', e => {
      const ac = e.target.closest('[data-acao]');
      if (ac) {
        const a = ac.dataset.acao;
        if (a === 'tour') tour();
        else if (a === 'tudo') { pararTour(); fecharCartao(); verTudo(); }
        else if (a === 'rota') {
          const menu = ac.nextElementSibling, abrir = !menu.classList.contains('aberto');
          app.querySelectorAll('.dm-rota-menu.aberto').forEach(m => { m.classList.remove('aberto'); m.previousElementSibling.setAttribute('aria-expanded', 'false'); });
          menu.classList.toggle('aberto', abrir); ac.setAttribute('aria-expanded', String(abrir));
        }
        return;
      }
      const f = e.target.closest('[data-filtro]'); if (f) { aplicarFiltro(f.dataset.filtro); return; }
      if (e.target.closest('.dm-card-fechar')) { fecharCartao(); return; }
      if (!e.target.closest('.dm-rota-menu')) app.querySelectorAll('.dm-rota-menu.aberto').forEach(m => m.classList.remove('aberto'));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { app.querySelectorAll('.dm-rota-menu.aberto').forEach(m => m.classList.remove('aberto')); }
    });
  }

  /* ── inicialização preguiçosa ──────────────────────────────── */
  async function iniciar() {
    try {
      const r = await fetch(DATA_URL, { cache: 'no-cache' });
      D = await r.json();
    } catch (e) {
      app.innerHTML = '<p class="destino-intro">Não conseguimos carregar o mapa agora. Recarregue a página em instantes.</p>';
      return;
    }
    D.places.sort((a, b) => a.toVilla.km - b.toVilla.km || a.toVilla.walkMin - b.toVilla.walkMin);
    D.places.forEach((p, i) => { p.n = i + 1; p.tipo = 'place'; });
    D.venue.tipo = 'villa';
    itens = [D.venue, ...D.places];

    montarEsqueleto();
    montarListas();
    ligarEventos();

    const status = app.querySelector('.destino-status');
    try {
      carregarCSS(ML_CSS);
      await carregarJS(ML_JS);
      if (maplibregl.supported && !maplibregl.supported()) throw new Error('sem WebGL');
      map = new maplibregl.Map({
        container: 'destino-map',
        style: STYLE_URL,
        center: D.venue.coords,
        zoom: 15,
        minZoom: 7.5, maxZoom: 18.5,
        cooperativeGestures: true,
        attributionControl: { compact: true },
        locale: {
          'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + rolagem para dar zoom no mapa',
          'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + rolagem para dar zoom no mapa',
          'CooperativeGesturesHandler.MobileHelpText': 'Use dois dedos para mover o mapa',
          'NavigationControl.ZoomIn': 'Aproximar', 'NavigationControl.ZoomOut': 'Afastar', 'NavigationControl.ResetBearing': 'Apontar para o norte',
        },
      });
      app._map = map; // acesso para depuração no console
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.on('load', () => {
        estilizar();
        camadas();
        marcadores();
        verTudo(0);
        status.classList.add('oculto');
      });
      map.on('error', ev => { if (!map.loaded()) console.warn('[mapa-destino]', ev && ev.error); });
      ['mousedown', 'touchstart', 'wheel'].forEach(t => map.getCanvas().addEventListener(t, () => tourRodando && pararTour(), { passive: true }));
      map.on('click', () => { if (!ehMobile()) fecharCartao(); });
    } catch (e) {
      map = null;
      status.textContent = 'O mapa não abriu neste navegador, mas a lista ao lado funciona.';
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); iniciar(); }
    }, { rootMargin: '800px 0px' });
    io.observe(app);
  } else iniciar();
})();
