/* =====================================================
   CINE HORIZONTE | script.js
   Índice:
   1. Datos (películas, combos, precios)  <- edita aquí textos y precios
   2. Utilidades y almacenamiento
   3. Funciones, asientos y carrito
   4. Código QR (biblioteca qrcode-generator + generador propio de respaldo)
   5. Generador de PDF (sin librerías)
   6. Estructura común (encabezado, pie, ventanas)
   7. Ventana de película y selección de asientos
   8. Páginas: inicio, cartelera, combos, carrito, boletos
   9. Eventos e inicio
   ===================================================== */
(function () {
  "use strict";

  /* ---------- 1. Datos ---------- */
  var MOVIES = [
    { id: "coco", title: "Coco", img: "coco.jpg", genres: ["Animación", "Familiar"], dur: 105, cls: "AA", dir: "Lee Unkrich",
      desc: "Miguel sueña con ser músico, pero su familia lo tiene prohibido. Durante el Día de Muertos cruza a un mundo de colores y música para descubrir el origen de su historia familiar." },
    { id: "avengers", title: "Avengers: Endgame", img: "avengers endgame - copia.jpg", genres: ["Acción", "Ciencia ficción"], dur: 181, cls: "B", dir: "Anthony y Joe Russo",
      desc: "Después de la devastación provocada por Thanos, los héroes que quedan se unen para un último plan: deshacer lo ocurrido y salvar el universo, cueste lo que cueste." },
    { id: "deadpool", title: "Deadpool", img: "deadpool - copia.jpg", genres: ["Acción", "Comedia"], dur: 108, cls: "C", dir: "Tim Miller",
      desc: "Un exmercenario con un humor muy ácido se somete a un experimento que lo deja con habilidades increíbles y un aspecto difícil de olvidar. Ahora quiere venganza." },
    { id: "intensamente", title: "Intensamente", img: "intensamente.webp", genres: ["Animación", "Familiar"], dur: 96, cls: "AA", dir: "",
      desc: "Dentro de la mente de una chica viven sus emociones: Alegría, Tristeza, Furia, Miedo y Desagrado. Cuando todo cambia en su vida, deberán aprender a trabajar en equipo." },
    { id: "jurassic", title: "Jurassic World", img: "jurassic world - copia.jpg", genres: ["Aventura", "Ciencia ficción"], dur: 124, cls: "B", dir: "Colin Trevorrow",
      desc: "Un parque temático con dinosaurios por fin está abierto al público. Cuando una nueva criatura creada en laboratorio escapa, la diversión se convierte en una carrera por sobrevivir." },
    { id: "naufrago", title: "Náufrago", img: "naufrago.jpg", genres: ["Drama", "Aventura"], dur: 143, cls: "B", dir: "Robert Zemeckis",
      desc: "Tras un accidente aéreo, un hombre queda solo en una isla desierta. Sin nadie más, deberá ingeniárselas para sobrevivir y aferrarse a la esperanza de volver a casa." },
    { id: "rapidos9", title: "Rápidos y Furiosos 9", img: "rapidos y furiosos 9 - copia.jpg", genres: ["Acción"], dur: 143, cls: "B", dir: "Justin Lin",
      desc: "Dom y su equipo enfrentan a un enemigo que viene de su propio pasado. Autos imposibles, persecuciones por el mundo y una familia que siempre se mantiene unida." },
    { id: "spiderman", title: "Spider-Man: Sin camino a casa", img: "spider man sin camino a casa - copia.jpg", genres: ["Acción", "Aventura"], dur: 148, cls: "B", dir: "Jon Watts",
      desc: "Cuando la identidad de Peter Parker se hace pública, pide ayuda para arreglarlo. Pero el hechizo abre la puerta a enemigos de otros mundos y todo se complica." },
    { id: "titanic", title: "Titanic", img: "titanic - copia.jpg", genres: ["Romance", "Drama"], dur: 195, cls: "B", dir: "James Cameron",
      desc: "A bordo del lujoso transatlántico, una joven de clase alta y un artista de pocos recursos se enamoran. Su historia se cruza con una de las tragedias más recordadas del mar." }
  ];
  var COMBOS = [
    { id: "clasico", name: "Combo Clásico", price: 120, img: "combo clasico.png", desc: "El favorito de siempre para disfrutar la película.", items: ["Palomitas grandes", "Refresco mediano"] },
    { id: "familiar", name: "Combo Familiar", price: 200, img: "combo familiar.png", desc: "Ideal para compartir en grupo o en familia.", items: ["Palomitas jumbo", "Refrescos para compartir", "Porción extra para todos"] },
    { id: "nachos", name: "Combo Nachos", price: 150, img: "combo nachos.png", desc: "Crujientes, con queso y listos para la función.", items: ["Nachos con queso", "Refresco mediano"] },
    { id: "dulces", name: "Combo Dulces", price: 130, img: "combo dulces.png", desc: "Para los que prefieren algo dulce.", items: ["Dulces surtidos", "Refresco mediano"] }
  ];
  var FORMATS = { "2D": 85, "3D": 110, "Premium": 130 }; // precio por boleto
  var TIMES = ["13:00", "15:30", "18:00", "20:30", "22:45"];
  var ROWS = "ABCDEFGH", COLS = 10, MAX_SEATS = 8, MAX_COMBO = 10, DAYS = 4;
  var LOGO = "logo del cine horizonte.png";
  var KEY_CART = "ch-carrito", KEY_ORDERS = "ch-pedidos";
  var DECLINE_CARD = "4000000000000002";

  var MOVIE_BY_ID = {}, COMBO_BY_ID = {};
  MOVIES.forEach(function (m) { MOVIE_BY_ID[m.id] = m; });
  COMBOS.forEach(function (c) { COMBO_BY_ID[c.id] = c; });

  /* ---------- 2. Utilidades y almacenamiento ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  var money = function (n) { return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }); };
  var norm = function (s) { return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IMG = function (src, alt, title, eager) {
    return '<img src="' + esc(encodeURI(src)) + '" alt="' + esc(alt) + '" data-title="' + esc(title || alt) + '"' +
      (eager ? "" : ' loading="lazy"') + ' decoding="async">';
  };

  var mem = {};
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
      catch (e) { return mem[k] !== undefined ? mem[k] : d; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  // Si una imagen no carga, se muestra un fondo con el nombre (sin emojis)
  document.addEventListener("error", function (ev) {
    var i = ev.target;
    if (i && i.tagName === "IMG" && !i.dataset.failed) {
      i.dataset.failed = "1";
      i.style.display = "none";
      var p = i.parentElement;
      if (p) { p.classList.add("is-fallback"); p.dataset.title = i.dataset.title || i.alt || ""; }
    }
  }, true);

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 2800);
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseIso(s) { return new Date(s + "T12:00:00"); }
  function fmtLong(s) { return parseIso(s).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
  function fmtShort(s) { return parseIso(s).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }); }
  function fmtDateTime(ms) { return new Date(ms).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }); }
  function nextDates() {
    var out = [], base = new Date();
    for (var i = 0; i < DAYS; i++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      var iso = isoDate(d);
      out.push({ iso: iso, label: i === 0 ? "Hoy" : i === 1 ? "Mañana" : fmtShort(iso) });
    }
    return out;
  }
  function nowTime() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }

  /* ---------- 3. Funciones, asientos y carrito ---------- */
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = hash(seed);
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tkey(t) { return t.movieId + "|" + t.date + "|" + t.time; }

  function showingsOf(movieId, date) {
    var r = rng(movieId + date), skip = [Math.floor(r() * 5)];
    if (r() < 0.4) skip.push((skip[0] + 2) % 5);
    var out = [];
    TIMES.forEach(function (time, i) {
      var f = r(), room = 1 + Math.floor(r() * 6);
      if (skip.indexOf(i) > -1) return;
      var format = f < 0.5 ? "2D" : f < 0.8 ? "3D" : "Premium";
      out.push({ key: movieId + "|" + date + "|" + time, movieId: movieId, date: date, time: time, format: format, room: room, price: FORMATS[format] });
    });
    return out;
  }
  function seatSort(a, b) {
    return a.charAt(0) === b.charAt(0) ? parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10) : (a < b ? -1 : 1);
  }

  var orders = store.get(KEY_ORDERS, []);
  if (!Array.isArray(orders)) orders = [];

  function occupiedSet(show) {
    var r = rng("asientos" + show.key), base = show.time >= "18:00" ? 0.3 : 0.18, s = {};
    for (var i = 0; i < ROWS.length; i++) {
      for (var j = 1; j <= COLS; j++) { if (r() < base) s[ROWS.charAt(i) + j] = true; }
    }
    orders.forEach(function (o) {
      (o.tickets || []).forEach(function (t) {
        if (t.key === show.key) t.seats.forEach(function (x) { s[x] = true; });
      });
    });
    return s;
  }

  function normalizeCart(c) {
    var out = { tickets: [], combos: {} }, today = isoDate(new Date());
    if (c && Array.isArray(c.tickets)) {
      c.tickets.forEach(function (t) {
        if (t && MOVIE_BY_ID[t.movieId] && FORMATS[t.format] && Array.isArray(t.seats) && t.seats.length && t.date >= today) {
          out.tickets.push({ movieId: t.movieId, date: t.date, time: t.time, format: t.format, room: t.room, seats: t.seats.slice(0, MAX_SEATS) });
        }
      });
    }
    if (c && c.combos) {
      Object.keys(c.combos).forEach(function (id) {
        var q = Math.min(MAX_COMBO, Math.max(0, parseInt(c.combos[id], 10) || 0));
        if (COMBO_BY_ID[id] && q) out.combos[id] = q;
      });
    }
    return out;
  }
  var cart = normalizeCart(store.get(KEY_CART, null));
  function saveCart() { store.set(KEY_CART, cart); updateCartCount(); }
  function totals(c) {
    var tn = 0, tp = 0, fn = 0, fp = 0;
    c.tickets.forEach(function (t) { tn += t.seats.length; tp += t.seats.length * FORMATS[t.format]; });
    Object.keys(c.combos).forEach(function (id) { fn += c.combos[id]; fp += c.combos[id] * COMBO_BY_ID[id].price; });
    return { tn: tn, tp: tp, fn: fn, fp: fp, total: tp + fp };
  }
  function updateCartCount() {
    var el = $("#cart-count");
    if (!el) return;
    var t = totals(cart), n = t.tn + t.fn;
    el.textContent = n || "";
    el.classList.toggle("has-items", n > 0);
    el.classList.remove("bump"); void el.offsetWidth; if (n) el.classList.add("bump");
    var link = $(".cart-link");
    if (link) link.setAttribute("aria-label", "Carrito, " + n + (n === 1 ? " artículo" : " artículos"));
  }
  /* ---------- 4. Generador de código QR (byte, nivel L, versiones 1 a 10) ---------- */
  var QR_DATA = [0, 19, 34, 55, 80, 108, 136, 156, 194, 232, 274];
  var QR_ECW = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18];
  var QR_BLK = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4];
  var QR_ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  var GF_EXP = [], GF_LOG = [];
  (function () {
    var x = 1, i;
    for (i = 0; i < 255; i++) { GF_EXP[i] = x; GF_LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
    for (i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();
  function gfMul(a, b) { return a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0; }
  function rsGen(n) {
    var g = [1], i, j;
    for (i = 0; i < n; i++) {
      var ng = [];
      for (j = 0; j <= g.length; j++) ng.push(0);
      for (j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= gfMul(g[j], GF_EXP[i]); }
      g = ng;
    }
    return g;
  }
  function rsRem(data, gen) {
    var n = gen.length - 1, r = [], i;
    for (i = 0; i < n; i++) r.push(0);
    data.forEach(function (b) {
      var f = b ^ r.shift();
      r.push(0);
      for (i = 0; i < n; i++) r[i] ^= gfMul(gen[i + 1], f);
    });
    return r;
  }

  function qrBuiltIn(text) {
    var bytes = Array.prototype.slice.call(new TextEncoder().encode(text)), ver, i, j;
    for (ver = 1; ver <= 10; ver++) {
      if (Math.ceil((4 + (ver < 10 ? 8 : 16) + bytes.length * 8) / 8) <= QR_DATA[ver]) break;
    }
    if (ver > 10) return null;
    var cap = QR_DATA[ver], bits = [];
    function put(v, n) { for (var k = n - 1; k >= 0; k--) bits.push((v >>> k) & 1); }
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    for (var padB = 0xEC; bits.length < cap * 8; padB ^= 0xEC ^ 0x11) put(padB, 8);
    var data = [];
    for (i = 0; i < bits.length; i += 8) { var v = 0; for (j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; data.push(v); }

    // bloques + corrección de errores
    var nb = QR_BLK[ver], ecw = QR_ECW[ver], gen = rsGen(ecw), shortLen = Math.floor(cap / nb), longCount = cap % nb;
    var dBlocks = [], eBlocks = [], pos = 0;
    for (i = 0; i < nb; i++) {
      var len = shortLen + (i >= nb - longCount ? 1 : 0), blk = data.slice(pos, pos + len);
      pos += len; dBlocks.push(blk); eBlocks.push(rsRem(blk, gen));
    }
    var all = [];
    for (i = 0; i <= shortLen; i++) dBlocks.forEach(function (b) { if (i < b.length) all.push(b[i]); });
    for (i = 0; i < ecw; i++) eBlocks.forEach(function (b) { all.push(b[i]); });

    // matriz
    var N = ver * 4 + 17, m = [], fn = [];
    for (i = 0; i < N; i++) { m.push(new Array(N).fill(false)); fn.push(new Array(N).fill(false)); }
    function set(r, c, v) { m[r][c] = v; fn[r][c] = true; }
    for (i = 0; i < N; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    function finder(r0, c0) {
      for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) {
        var r = r0 + dr, c = c0 + dc;
        if (r < 0 || c < 0 || r >= N || c >= N) continue;
        var d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        set(r, c, d !== 2 && d !== 4);
      }
    }
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    var ap = QR_ALIGN[ver];
    ap.forEach(function (r, a) {
      ap.forEach(function (c, b) {
        if ((a === 0 && b === 0) || (a === 0 && b === ap.length - 1) || (a === ap.length - 1 && b === 0)) return;
        for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
      });
    });
    function drawFormat(mask) {
      var d = (1 << 3) | mask, rem = d, k;
      for (k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var fb = ((d << 10) | rem) ^ 0x5412, bit = function (n) { return ((fb >>> n) & 1) === 1; };
      for (k = 0; k <= 5; k++) set(k, 8, bit(k));
      set(7, 8, bit(6)); set(8, 8, bit(7)); set(8, 7, bit(8));
      for (k = 9; k < 15; k++) set(8, 14 - k, bit(k));
      for (k = 0; k < 8; k++) set(8, N - 1 - k, bit(k));
      for (k = 8; k < 15; k++) set(N - 15 + k, 8, bit(k));
      set(N - 8, 8, true);
    }
    drawFormat(0);
    if (ver >= 7) {
      var vr = ver, k2;
      for (k2 = 0; k2 < 12; k2++) vr = (vr << 1) ^ ((vr >>> 11) * 0x1F25);
      var vb = (ver << 12) | vr;
      for (k2 = 0; k2 < 18; k2++) {
        var col = ((vb >>> k2) & 1) === 1, a2 = N - 11 + (k2 % 3), b2 = Math.floor(k2 / 3);
        set(b2, a2, col); set(a2, b2, col);
      }
    }
    // datos en zigzag
    var bi = 0, total = all.length * 8;
    for (var right = N - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < N; vert++) {
        for (j = 0; j < 2; j++) {
          var x = right - j, up = ((right + 1) & 2) === 0, y = up ? N - 1 - vert : vert;
          if (!fn[y][x] && bi < total) { m[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1; bi++; }
        }
      }
    }
    // máscara
    function maskFn(mk, x, y) {
      switch (mk) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return (x * y) % 2 + (x * y) % 3 === 0;
        case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
        default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
      }
    }
    function applyMask(mk) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (!fn[y][x] && maskFn(mk, x, y)) m[y][x] = !m[y][x];
    }
    function penalty() {
      var score = 0, y, x, line, dark = 0, lines = [];
      for (y = 0; y < N; y++) { line = ""; for (x = 0; x < N; x++) { line += m[y][x] ? "1" : "0"; if (m[y][x]) dark++; } lines.push(line); }
      for (x = 0; x < N; x++) { line = ""; for (y = 0; y < N; y++) line += m[y][x] ? "1" : "0"; lines.push(line); }
      lines.forEach(function (l) {
        (l.match(/0{5,}|1{5,}/g) || []).forEach(function (run) { score += 3 + run.length - 5; });
        score += 40 * ((l.match(/00001011101/g) || []).length + (l.match(/10111010000/g) || []).length);
      });
      for (y = 0; y < N - 1; y++) for (x = 0; x < N - 1; x++) {
        if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
      }
      return score + (Math.ceil(Math.abs(dark * 20 - N * N * 10) / (N * N)) - 1) * 10;
    }
    var best = 0, bestScore = Infinity;
    for (var mk = 0; mk < 8; mk++) {
      applyMask(mk); drawFormat(mk);
      var sc = penalty();
      if (sc < bestScore) { bestScore = sc; best = mk; }
      applyMask(mk);
    }
    applyMask(best); drawFormat(best);
    return { size: N, get: function (r, c) { return m[r][c]; } };
  }

  /* QR con la biblioteca qrcode-generator (se carga en boletos.html).
     Si la biblioteca no está disponible (por ejemplo, sin internet), se usa el generador propio de arriba. */
  var qrSource = "propio";
  function qrEncode(text) {
    if (typeof window.qrcode === "function") {
      try {
        var q = window.qrcode(0, "L");
        q.addData(text);
        q.make();
        var n = q.getModuleCount();
        qrSource = "biblioteca qrcode-generator";
        return { size: n, get: function (r, c) { return q.isDark(r, c); } };
      } catch (err) { /* si falla, se usa el generador propio */ }
    }
    qrSource = "propio";
    return qrBuiltIn(text);
  }

  function drawQR(canvas, text) {
    var qr = qrEncode(text), ctx = canvas.getContext("2d");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Código QR del boleto");
    canvas.setAttribute("data-qr-source", qrSource);
    if (!qr) {
      canvas.width = canvas.height = 168;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 168, 168);
      ctx.fillStyle = "#000"; ctx.font = "13px sans-serif"; ctx.fillText("QR no disponible", 24, 88);
      return;
    }
    var sc = 6, q = 4, n = qr.size + q * 2;
    canvas.width = canvas.height = n * sc;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, n * sc, n * sc);
    ctx.fillStyle = "#000";
    for (var r = 0; r < qr.size; r++) for (var c = 0; c < qr.size; c++) if (qr.get(r, c)) ctx.fillRect((c + q) * sc, (r + q) * sc, sc, sc);
  }

  function qrText(o, t) {
    var base = new URL("boletos.html", location.href);
    base.search = ""; base.hash = "";
    var core = base.href + "?f=" + o.folio + "&m=" + t.movieId + "&d=" + t.date + "&h=" + t.time + "&s=" + t.seats.join(".");
    var first = o.customer.name.split(/\s+/)[0].slice(0, 14);
    var withName = core + "&n=" + encodeURIComponent(first);
    if (qrEncode(withName)) return withName;
    if (qrEncode(core)) return core;
    return "CINE HORIZONTE " + o.folio + " " + t.movieId + " " + t.date + " " + t.time + " " + t.seats.join(",");
  }

  /* ---------- 5. Generador de PDF ---------- */
  function buildPdf(o) {
    var W = 595, H = 842, M = 44, pages = [], cur, y;
    var clean = function (s) {
      return String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-")
        .replace(/…/g, "...").replace(/[\u00a0\u202f]/g, " ").replace(/[^\x20-\x7e¡-ÿ]/g, "?");
    };
    var pe = function (s) { return clean(s).replace(/([\\()])/g, "\\$1"); };
    var tw = function (s, sz, bold) {
      var w = 0;
      clean(s).split("").forEach(function (ch) {
        w += /[0-9]/.test(ch) ? 0.556 : /[ .,:;|!i]/.test(ch) ? 0.278 : /[A-Z]/.test(ch) ? 0.68 : /[a-z]/.test(ch) ? 0.53 : 0.6;
      });
      return w * sz * (bold ? 1.06 : 1);
    };
    function newPage() { cur = []; pages.push(cur); y = H - M; }
    function ensure(h) { if (y - h < M + 30) newPage(); }
    function text(x, yy, s, sz, bold, col, align) {
      var xx = align === "r" ? x - tw(s, sz, bold) : x;
      cur.push("BT /F" + (bold ? 2 : 1) + " " + sz + " Tf " + (col || "0 0 0") + " rg " + xx.toFixed(2) + " " + yy.toFixed(2) + " Td (" + pe(s) + ") Tj ET");
    }
    function rect(x, yy, w, h, col) { cur.push(col + " rg " + x + " " + yy + " " + w + " " + h + " re f"); }
    function hline(yy, col) { cur.push(col + " RG 0.6 w " + M + " " + yy + " m " + (W - M) + " " + yy + " l S"); }
    function qrDraw(text0, x, yBottom, size) {
      var qr = qrEncode(text0);
      rect(x, yBottom, size, size, "1 1 1");
      if (!qr) return;
      var s = size / (qr.size + 4), parts = ["0 0 0 rg"];
      for (var r = 0; r < qr.size; r++) for (var c = 0; c < qr.size; c++) {
        if (qr.get(r, c)) parts.push((x + (c + 2) * s).toFixed(2) + " " + (yBottom + size - (r + 3) * s).toFixed(2) + " " + s.toFixed(2) + " " + s.toFixed(2) + " re");
      }
      parts.push("f");
      cur.push(parts.join(" "));
    }
    var money2 = function (n) { return "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " MXN"; };

    newPage();
    rect(0, H - 92, W, 92, "0.03 0.05 0.14");
    rect(0, H - 94, W, 2, "0.2 0.88 1");
    text(M, H - 46, "CINE HORIZONTE", 24, true, "1 1 1");
    text(M, H - 68, "Boleto de compra | Pago simulado", 11, false, "0.6 0.7 0.9");
    text(W - M, H - 40, "FOLIO", 9, false, "0.6 0.7 0.9", "r");
    text(W - M, H - 62, o.folio, 17, true, "0.2 0.88 1", "r");
    y = H - 128;
    [["Cliente", o.customer.name], ["Correo", o.customer.email], ["Teléfono", o.customer.phone],
     ["Fecha de compra", fmtDateTime(o.at)], ["Pago", "Tarjeta " + o.card.brand + " **** " + o.card.last4 + " (simulado)"]].forEach(function (r) {
      text(M, y, r[0], 9.5, false, "0.4 0.45 0.55"); text(M + 110, y, r[1], 10.5, true); y -= 16;
    });
    y -= 10;

    if (o.tickets.length) {
      text(M, y, "Boletos", 14, true); y -= 14; hline(y, "0.8 0.82 0.88"); y -= 14;
      o.tickets.forEach(function (t) {
        ensure(116);
        var top = y;
        rect(M, top - 104, W - 2 * M, 104, "0.94 0.96 1");
        rect(M, top - 104, 4, 104, "0.18 0.42 1");
        text(M + 16, top - 24, t.title, 15, true);
        text(M + 16, top - 44, fmtLong(t.date) + " | " + t.time + " h", 10.5, false);
        text(M + 16, top - 60, "Sala " + t.room + " | Formato " + t.format, 10.5, false);
        text(M + 16, top - 76, "Asientos: " + t.seats.join(", "), 10.5, true);
        text(M + 16, top - 93, t.seats.length + (t.seats.length === 1 ? " boleto" : " boletos") + " x " + money2(t.unit) + " = " + money2(t.seats.length * t.unit), 10, false, "0.3 0.35 0.5");
        qrDraw(qrText(o, t), W - M - 96, top - 98, 88);
        y = top - 118;
      });
    }
    if (o.combos.length) {
      ensure(60 + o.combos.length * 18);
      text(M, y, "Alimentos y bebidas", 14, true); y -= 14; hline(y, "0.8 0.82 0.88"); y -= 16;
      o.combos.forEach(function (c) {
        text(M, y, c.qty + " x " + c.name, 10.5, false);
        text(W - M, y, money2(c.qty * c.unit), 10.5, true, "0 0 0", "r");
        y -= 18;
      });
    }
    ensure(110);
    y -= 6; hline(y, "0.8 0.82 0.88"); y -= 18;
    text(M, y, "Boletos", 10.5, false); text(W - M, y, money2(o.totals.tp), 10.5, false, "0 0 0", "r"); y -= 16;
    text(M, y, "Alimentos", 10.5, false); text(W - M, y, money2(o.totals.fp), 10.5, false, "0 0 0", "r"); y -= 24;
    text(M, y, "TOTAL", 15, true); text(W - M, y, money2(o.totals.total), 15, true, "0.12 0.31 0.85", "r"); y -= 34;
    text(M, y, "Proyecto escolar: el pago es una simulacion y no se realizo ningun cargo real.", 9, false, "0.4 0.45 0.55"); y -= 13;
    text(M, y, "Presenta el codigo QR de cada boleto en la entrada de la sala. Precios en pesos mexicanos, IVA incluido.", 9, false, "0.4 0.45 0.55");

    var objs = [null, "<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"], kids = [];
    pages.forEach(function (p, i) {
      var pid = 5 + i * 2, stream = p.join("\n");
      kids.push(pid + " 0 R");
      objs[pid] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " + (pid + 1) + " 0 R >>";
      objs[pid + 1] = "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream";
    });
    objs[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + pages.length + " >>";
    var out = "%PDF-1.4\n", offs = [], n = objs.length - 1, i;
    for (i = 1; i <= n; i++) { offs[i] = out.length; out += i + " 0 obj\n" + objs[i] + "\nendobj\n"; }
    var xref = out.length;
    out += "xref\n0 " + (n + 1) + "\n0000000000 65535 f \n";
    for (i = 1; i <= n; i++) out += ("0000000000" + offs[i]).slice(-10) + " 00000 n \n";
    out += "trailer\n<< /Size " + (n + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    var bytes = new Uint8Array(out.length);
    for (i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    return new Blob([bytes], { type: "application/pdf" });
  }

  /* ---------- 6. Estructura común ---------- */
  var PAGE = document.body.getAttribute("data-page") || "";
  var NAV = [["index.html", "Inicio", "home"], ["cartelera.html", "Cartelera", "cartelera"], ["combos.html", "Combos", "combos"], ["boletos.html", "Mis boletos", "boletos"]];
  var CART_SVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.5l2.3 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.2"/><circle cx="9.5" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>';
  var CLOSE_BTN = '<button class="icon-btn modal__close" type="button" data-act="close-dialog" aria-label="Cerrar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';

  function buildLayout() {
    var nav = NAV.map(function (n, i) {
      return '<li style="--i:' + i + '"><a href="' + n[0] + '"' + (n[2] === PAGE ? ' aria-current="page"' : "") + ">" + n[1] + "</a></li>";
    }).join("");
    document.body.insertAdjacentHTML("afterbegin",
      '<a class="skip-link" href="#contenido">Saltar al contenido</a>' +
      '<header class="site-header" id="site-header"><div class="container site-header__inner">' +
      '<a class="brand" href="index.html" aria-label="Cine Horizonte, ir al inicio">' + IMG(LOGO, "Cine Horizonte", "Cine Horizonte", true) + "</a>" +
      '<nav class="nav" id="nav" aria-label="Principal"><ul class="nav__list">' + nav + "</ul></nav>" +
      '<div class="header-actions"><a class="cart-link" href="carrito.html" aria-label="Carrito">' + CART_SVG + '<span class="cart-count" id="cart-count"></span></a>' +
      '<button class="burger" type="button" data-act="menu" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú"><span></span><span></span></button></div>' +
      "</div></header>");
    document.body.insertAdjacentHTML("beforeend",
      '<footer class="site-footer"><div class="container"><div class="footer__grid">' +
      '<div><a class="brand" href="index.html" aria-label="Cine Horizonte">' + IMG(LOGO, "Cine Horizonte", "Cine Horizonte") + "</a><p>Compra tus boletos y combos en línea, elige tus asientos y entra directo a la sala.</p></div>" +
      '<div><h2 class="footer__title">Explora</h2><ul><li><a href="cartelera.html">Cartelera</a></li><li><a href="combos.html">Combos</a></li><li><a href="carrito.html">Carrito</a></li><li><a href="boletos.html">Mis boletos</a></li></ul></div>' +
      '<div><h2 class="footer__title">Información</h2><ul><li><button class="footer__link" type="button" data-act="privacy">Política de privacidad</button></li><li>Funciones todos los días</li><li>Pagos simulados</li></ul></div>' +
      '</div><p class="footer__bottom">&copy; 2026 Cine Horizonte. Proyecto escolar: los pagos son una simulación y no se realiza ningún cargo.</p></div></footer>' +
      '<dialog class="modal" id="movie-dialog" aria-label="Película y asientos"><div class="modal__box" id="movie-box"></div></dialog>' +
      '<dialog class="modal modal--small" id="privacy-dialog" aria-labelledby="priv-title"><div class="modal__box">' + CLOSE_BTN + privacyHTML() + "</div></dialog>" +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>');
  }

  function privacyHTML() {
    return '<div class="modal__head"><h2 id="priv-title">Política de privacidad</h2></div><div class="legal-text">' +
      "<p>Cine Horizonte es un proyecto escolar. Esta política explica, de forma sencilla, qué datos se usan en esta página y para qué. Última actualización: 14 de noviembre de 2026.</p>" +
      "<h3>Qué datos pedimos</h3><ul><li>Nombre, correo electrónico y teléfono, para generar tus boletos y tu ticket de compra.</li><li>Datos de una tarjeta de prueba, solo para simular el pago.</li></ul>" +
      "<h3>Para qué los usamos</h3><p>Únicamente para mostrar tu compra, tus boletos con código QR y tu ticket. No los usamos para publicidad ni los compartimos con terceros.</p>" +
      "<h3>El pago es una simulación</h3><p>No se realiza ningún cobro real. El número completo de la tarjeta, la fecha de vencimiento y el código de seguridad no se guardan: solo se conservan los últimos 4 dígitos. Te pedimos no escribir datos de una tarjeta real; usa la tarjeta de prueba 4242 4242 4242 4242.</p>" +
      "<h3>Dónde se guardan tus datos</h3><p>Tu carrito y tus compras se guardan en este navegador (almacenamiento local), no en un servidor. Si borras los datos del navegador, también se borran.</p>" +
      "<h3>Tus derechos</h3><p>Puedes borrar tus datos en cualquier momento limpiando el almacenamiento del navegador. Para dudas, consulta a la persona responsable del proyecto.</p>" +
      '</div><div class="seat-actions" style="margin-top:1.4rem"><button class="btn btn--primary" type="button" data-act="close-dialog">Entendido</button></div>';
  }

  function openDialog(d) {
    if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
    document.body.classList.add("no-scroll");
  }
  function unlockScroll() {
    if (!$$("dialog[open]").length) document.body.classList.remove("no-scroll");
  }

  /* ---------- 7. Ventana de película y asientos ---------- */
  var ui = { movie: null, date: null, show: null, sel: {} };

  function metaHTML(m) {
    return '<ul class="meta"><li class="meta--rating" title="Clasificación">' + m.cls + "</li><li>" + m.dur + " min</li>" +
      m.genres.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul>";
  }

  function slotsHTML(m, date) {
    var today = isoDate(new Date()), now = nowTime();
    return showingsOf(m.id, date).map(function (s) {
      var past = date === today && s.time <= now, free = ROWS.length * COLS - Object.keys(occupiedSet(s)).length;
      return '<button class="slot" type="button" data-act="pick-slot" data-time="' + s.time + '"' + (past ? " disabled" : "") + ">" +
        "<strong>" + s.time + "</strong><span>" + s.format + " · Sala " + s.room + "</span>" +
        "<span><em>" + money(s.price) + "</em> · " + (past ? "Ya inició" : free + " lugares") + "</span></button>";
    }).join("");
  }

  function detailHTML(m) {
    var dates = nextDates();
    if (!ui.date) ui.date = dates[0].iso;
    return CLOSE_BTN + '<div class="mdetail"><div class="poster">' + IMG(m.img, m.title, m.title, true) + "</div><div>" +
      '<h2 id="md-title">' + esc(m.title) + "</h2>" + metaHTML(m) +
      '<p class="mdetail__text">' + esc(m.desc) + "</p>" +
      (m.dir ? '<p class="mdetail__dir"><strong>Dirección:</strong> ' + esc(m.dir) + "</p>" : "") +
      "<h3>1. Elige el día</h3>" +
      '<div class="chips" role="group" aria-label="Día de la función">' + dates.map(function (d) {
        return '<button class="chip" type="button" data-act="pick-date" data-date="' + d.iso + '" aria-pressed="' + (d.iso === ui.date) + '">' + d.label + "</button>";
      }).join("") + "</div>" +
      "<h3>2. Elige la función</h3>" +
      '<div class="slots" id="slots" aria-live="polite">' + slotsHTML(m, ui.date) + "</div></div></div>";
  }

  function openMovie(id) {
    var m = MOVIE_BY_ID[id];
    if (!m) return;
    ui.movie = m; ui.date = null; ui.show = null; ui.sel = {};
    $("#movie-box").innerHTML = detailHTML(m);
    $("#movie-dialog").setAttribute("aria-label", m.title);
    openDialog($("#movie-dialog"));
  }

  function seatsHTML() {
    var m = ui.movie, s = ui.show, occ = occupiedSet(s), rows = "";
    for (var i = 0; i < ROWS.length; i++) {
      var L = ROWS.charAt(i), r = '<div class="seat-row"><span class="row-label" aria-hidden="true">' + L + "</span>";
      for (var j = 1; j <= COLS; j++) {
        var id = L + j, taken = !!occ[id], on = !!ui.sel[id];
        r += '<button class="seat' + (on ? " is-selected" : "") + '" type="button" data-seat="' + id + '"' + (taken ? " disabled" : "") +
          ' aria-pressed="' + on + '" aria-label="Fila ' + L + ", asiento " + j + ", " + (taken ? "ocupado" : on ? "seleccionado" : "disponible") + '">' + j + "</button>";
        if (j === COLS / 2) r += '<span class="seat-gap" aria-hidden="true"></span>';
      }
      rows += r + '<span class="row-label" aria-hidden="true">' + L + "</span></div>";
    }
    return CLOSE_BTN + '<div class="seats-head"><h2 id="md-title">' + esc(m.title) + "</h2><p>" + fmtShort(s.date) + " · " + s.time + " h · " + s.format + " · Sala " + s.room + "</p></div>" +
      '<div class="screen" aria-hidden="true"><span>PANTALLA</span></div>' +
      '<div class="seatmap-wrap"><div class="seatmap" role="group" aria-label="Mapa de asientos">' + rows + "</div></div>" +
      '<div class="legend" aria-hidden="true"><span><button class="seat" tabindex="-1" type="button"></button> Disponible</span>' +
      '<span><button class="seat is-selected" tabindex="-1" type="button"></button> Seleccionado</span>' +
      '<span><button class="seat" tabindex="-1" type="button" disabled></button> Ocupado</span></div>' +
      '<div class="seat-summary"><p id="seat-text"></p><div class="seat-actions">' +
      '<button class="btn btn--ghost btn--sm" type="button" data-act="seats-back">Cambiar función</button>' +
      '<button class="btn btn--primary btn--sm" type="button" data-act="add-seats" id="add-seats">Agregar al carrito</button></div></div>';
  }

  function updateSeatSummary() {
    var list = Object.keys(ui.sel).sort(seatSort), n = list.length;
    $("#seat-text").innerHTML = n
      ? "<strong>" + n + (n === 1 ? " asiento" : " asientos") + ":</strong> " + list.join(", ") + " · <strong>" + money(n * ui.show.price) + "</strong>"
      : "Elige hasta " + MAX_SEATS + " asientos (" + money(ui.show.price) + " cada uno).";
    $("#add-seats").disabled = n === 0;
  }

  function openSeats(movieId, date, time) {
    var m = MOVIE_BY_ID[movieId];
    var show = m && showingsOf(movieId, date).filter(function (s) { return s.time === time; })[0];
    if (!show) return;
    ui.movie = m; ui.date = date; ui.show = show; ui.sel = {};
    var inCart = cart.tickets.filter(function (t) { return tkey(t) === show.key; })[0], occ = occupiedSet(show);
    if (inCart) inCart.seats.forEach(function (x) { if (!occ[x]) ui.sel[x] = true; });
    $("#movie-box").innerHTML = seatsHTML();
    updateSeatSummary();
    openDialog($("#movie-dialog"));
  }

  function toggleSeat(btn) {
    var id = btn.getAttribute("data-seat");
    if (!id || btn.disabled) return;
    if (ui.sel[id]) delete ui.sel[id];
    else {
      if (Object.keys(ui.sel).length >= MAX_SEATS) { toast("Máximo " + MAX_SEATS + " asientos por función."); return; }
      ui.sel[id] = true;
    }
    var on = !!ui.sel[id];
    btn.classList.toggle("is-selected", on);
    btn.setAttribute("aria-pressed", on);
    btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace(/seleccionado|disponible/, on ? "seleccionado" : "disponible"));
    updateSeatSummary();
  }

  function addSeatsToCart() {
    var s = ui.show, seats = Object.keys(ui.sel).sort(seatSort);
    if (!seats.length) return;
    var occ = occupiedSet(s);
    if (seats.some(function (x) { return occ[x]; })) { toast("Alguno de esos asientos ya no está disponible."); openSeats(s.movieId, s.date, s.time); return; }
    var t = { movieId: s.movieId, date: s.date, time: s.time, format: s.format, room: s.room, seats: seats };
    var i = -1;
    cart.tickets.forEach(function (x, k) { if (tkey(x) === s.key) i = k; });
    if (i > -1) cart.tickets[i] = t; else cart.tickets.push(t);
    saveCart();
    if (PAGE === "carrito") renderCart();
    $("#movie-box").innerHTML = CLOSE_BTN + '<div class="empty" style="border:0"><h2 id="md-title">¡Boletos agregados!</h2><p>' + seats.length + (seats.length === 1 ? " asiento" : " asientos") + " para " + esc(ui.movie.title) + " (" + seats.join(", ") + "). ¿Quieres agregar algo de comer?</p>" +
      '<div class="seat-actions" style="justify-content:center"><a class="btn btn--primary" href="carrito.html">Ir al carrito</a><a class="btn btn--ghost" href="combos.html">Ver combos</a><button class="btn btn--ghost" type="button" data-act="close-dialog">Seguir comprando</button></div></div>';
  }

  /* ---------- 8. Páginas ---------- */
  function movieCardHTML(m) {
    return '<article class="mcard tilt" data-tilt><button class="mcard__hit" type="button" data-act="open-movie" data-id="' + m.id + '" aria-label="Ver ' + esc(m.title) + '">' +
      '<span class="poster">' + IMG(m.img, m.title, m.title) + '</span><span class="rating" title="Clasificación">' + m.cls + '</span><span class="glare"></span></button>' +
      '<div class="mcard__body"><h3>' + esc(m.title) + "</h3><p>" + esc(m.genres.join(" · ")) + " · " + m.dur + " min</p>" +
      '<button class="btn btn--primary btn--sm" type="button" data-act="open-movie" data-id="' + m.id + '">Comprar boletos</button></div></article>';
  }

  function comboCtlHTML(id) {
    var q = cart.combos[id] || 0;
    if (!q) return '<button class="btn btn--primary btn--sm" type="button" data-act="combo-add" data-id="' + id + '">Agregar</button>';
    return '<div class="qty"><button type="button" data-act="combo-dec" data-id="' + id + '" aria-label="Quitar uno">−</button><span aria-live="polite">' + q +
      '</span><button type="button" data-act="combo-inc" data-id="' + id + '" aria-label="Agregar uno"' + (q >= MAX_COMBO ? " disabled" : "") + ">+</button></div>";
  }
  function comboCardHTML(c) {
    return '<article class="ccard tilt" data-tilt="7" data-combo="' + c.id + '"><div class="ccard__img">' + IMG(c.img, c.name, c.name) + "</div>" +
      "<h3>" + esc(c.name) + '</h3><p class="ccard__desc">' + esc(c.desc) + '</p><ul class="ccard__items">' +
      c.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + '</ul><div class="ccard__foot"><span class="price">' + money(c.price) + '</span><span class="combo-ctl">' + comboCtlHTML(c.id) + "</span></div></article>";
  }
  function refreshComboControls() {
    $$("[data-combo]").forEach(function (card) { $(".combo-ctl", card).innerHTML = comboCtlHTML(card.getAttribute("data-combo")); });
  }
  function setCombo(id, q) {
    q = Math.max(0, Math.min(MAX_COMBO, q));
    if (q) cart.combos[id] = q; else delete cart.combos[id];
    saveCart(); refreshComboControls();
    if (PAGE === "carrito") renderCart();
  }

  function initHome() {
    var ring = $("#ring");
    if (ring) ring.innerHTML = MOVIES.map(function (m, i) {
      return '<li class="ring__item" style="--i:' + i + '"><button type="button" data-act="open-movie" data-id="' + m.id + '" aria-label="Ver ' + esc(m.title) + '"><span class="poster">' + IMG(m.img, m.title, m.title, true) + "</span></button></li>";
    }).join("");
    var hm = $("#home-movies");
    if (hm) hm.innerHTML = MOVIES.slice(0, 4).map(movieCardHTML).join("");
    var hc = $("#home-combos");
    if (hc) hc.innerHTML = COMBOS.map(comboCardHTML).join("");
  }

  function initCartelera() {
    var grid = $("#movie-grid"), q = $("#q"), g = $("#genre"), genres = [];
    MOVIES.forEach(function (m) { m.genres.forEach(function (x) { if (genres.indexOf(x) < 0) genres.push(x); }); });
    genres.sort();
    g.innerHTML = '<option value="">Todos los géneros</option>' + genres.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + "</option>"; }).join("");
    function draw() {
      var term = norm(q.value.trim()), gen = g.value;
      var list = MOVIES.filter(function (m) {
        return (!term || norm(m.title).indexOf(term) > -1 || norm(m.genres.join(" ")).indexOf(term) > -1) && (!gen || m.genres.indexOf(gen) > -1);
      });
      grid.innerHTML = list.map(movieCardHTML).join("");
      $("#no-results").hidden = list.length > 0;
      $("#count").textContent = list.length + (list.length === 1 ? " película" : " películas");
    }
    q.addEventListener("input", draw); g.addEventListener("change", draw);
    $("#reset-filters").addEventListener("click", function () { q.value = ""; g.value = ""; draw(); });
    draw();
    var p = new URLSearchParams(location.search).get("pelicula");
    if (p && MOVIE_BY_ID[p]) openMovie(p);
  }

  function initCombos() {
    $("#combos-grid").innerHTML = COMBOS.map(comboCardHTML).join("");
  }

  /* --- Carrito y pago --- */
  function renderCart() {
    var empty = !cart.tickets.length && !Object.keys(cart.combos).length;
    $("#cart-empty").hidden = !empty;
    $("#cart-layout").hidden = empty;
    if (empty) return;
    var t = totals(cart);
    $("#tickets-list").innerHTML = cart.tickets.length ? cart.tickets.map(function (x) {
      var m = MOVIE_BY_ID[x.movieId], k = tkey(x);
      return '<div class="cart-item"><div class="poster">' + IMG(m.img, m.title, m.title) + "</div><div><h3>" + esc(m.title) + "</h3><p>" + fmtShort(x.date) + " · " + x.time + " h · " + x.format + " · Sala " + x.room + "</p>" +
        '<div class="seat-tags" aria-label="Asientos">' + x.seats.map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</div>" +
        '<button class="remove-btn" type="button" data-act="edit-ticket" data-key="' + esc(k) + '">Cambiar asientos</button></div>' +
        '<div class="cart-item__side"><strong>' + money(x.seats.length * FORMATS[x.format]) + "</strong><span>" + x.seats.length + " × " + money(FORMATS[x.format]) +
        '</span><button class="remove-btn" type="button" data-act="rm-ticket" data-key="' + esc(k) + '">Quitar</button></div></div>';
    }).join("") : '<p class="empty" style="padding:1.4rem">Aún no agregas boletos. <a class="link-arrow" href="cartelera.html">Ver cartelera</a></p>';
    var ids = Object.keys(cart.combos);
    $("#food-list").innerHTML = ids.length ? ids.map(function (id) {
      var c = COMBO_BY_ID[id], q = cart.combos[id];
      return '<div class="cart-item"><div class="thumb">' + IMG(c.img, c.name, c.name) + "</div><div><h3>" + esc(c.name) + "</h3><p>" + money(c.price) + " c/u</p>" +
        '<div class="qty" style="margin-top:.4rem"><button type="button" data-act="combo-dec" data-id="' + id + '" aria-label="Quitar uno">−</button><span>' + q +
        '</span><button type="button" data-act="combo-inc" data-id="' + id + '" aria-label="Agregar uno"' + (q >= MAX_COMBO ? " disabled" : "") + ">+</button></div></div>" +
        '<div class="cart-item__side"><strong>' + money(q * c.price) + '</strong><button class="remove-btn" type="button" data-act="rm-combo" data-id="' + id + '">Quitar</button></div></div>';
    }).join("") : '<p class="empty" style="padding:1.4rem">Sin alimentos. <a class="link-arrow" href="combos.html">Ver combos</a></p>';
    $("#sum-tickets-label").textContent = "Boletos (" + t.tn + ")";
    $("#sum-food-label").textContent = "Alimentos (" + t.fn + ")";
    $("#sum-tickets").textContent = money(t.tp);
    $("#sum-food").textContent = money(t.fp);
    $("#sum-total").textContent = money(t.total);
    $("#pay-btn").textContent = "Pagar " + money(t.total);
  }

  function luhn(d) {
    var sum = 0, alt = false;
    for (var i = d.length - 1; i >= 0; i--) {
      var n = +d.charAt(i);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }
  function cardBrand(d) {
    if (/^4/.test(d)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
    if (/^3[47]/.test(d)) return "American Express";
    return "Tarjeta";
  }
  var RULES = {
    name: function (v) { v = v.trim(); return v.length >= 5 && /^\S+(\s+\S+)+$/.test(v) && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$/.test(v) ? "" : "Escribe tu nombre y apellido."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com."; },
    phone: function (v) { return v.replace(/\D/g, "").length === 10 ? "" : "El teléfono debe tener 10 dígitos."; },
    card: function (v) { var d = v.replace(/\D/g, ""); return d.length >= 13 && d.length <= 19 && luhn(d) ? "" : "Número de tarjeta no válido. Prueba con 4242 4242 4242 4242."; },
    holder: function (v) { return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{2,}$/.test(v.trim()) ? "" : "Escribe el nombre como aparece en la tarjeta."; },
    exp: function (v) {
      var m = /^(\d{2})\/(\d{2})$/.exec(v.trim());
      if (!m) return "Usa el formato MM/AA.";
      var mo = +m[1], yr = 2000 + +m[2], now = new Date();
      if (mo < 1 || mo > 12) return "El mes debe ser del 01 al 12.";
      if (new Date(yr, mo, 1) <= now) return "La tarjeta está vencida.";
      return yr > now.getFullYear() + 15 ? "Revisa el año de vencimiento." : "";
    },
    cvv: function (v) { return /^\d{3,4}$/.test(v.trim()) ? "" : "El código tiene 3 o 4 dígitos."; },
    privacy: function () { return $("#f-privacy").checked ? "" : "Debes aceptar la política de privacidad."; }
  };
  var FIELD_ORDER = ["name", "email", "phone", "card", "holder", "exp", "cvv", "privacy"];
  function checkField(id) {
    var el = $("#f-" + id), err = RULES[id](el.value || ""), msg = $("#e-" + id);
    if (id !== "privacy") el.setAttribute("aria-invalid", err ? "true" : "false");
    msg.textContent = err;
    return err;
  }

  function newFolio() {
    var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", d = new Date(), f;
    do {
      var s = "";
      for (var i = 0; i < 4; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
      f = "CH-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + s;
    } while (orders.some(function (o) { return o.folio === f; }));
    return f;
  }

  function createOrder() {
    var digits = $("#f-card").value.replace(/\D/g, ""), t = totals(cart);
    var o = {
      folio: newFolio(), at: Date.now(),
      customer: { name: $("#f-name").value.trim(), email: $("#f-email").value.trim(), phone: $("#f-phone").value.trim() },
      card: { brand: cardBrand(digits), last4: digits.slice(-4) },
      tickets: cart.tickets.map(function (x) {
        return { key: tkey(x), movieId: x.movieId, title: MOVIE_BY_ID[x.movieId].title, date: x.date, time: x.time, format: x.format, room: x.room, seats: x.seats.slice(), unit: FORMATS[x.format] };
      }),
      combos: Object.keys(cart.combos).map(function (id) { return { id: id, name: COMBO_BY_ID[id].name, qty: cart.combos[id], unit: COMBO_BY_ID[id].price }; }),
      totals: { tp: t.tp, fp: t.fp, total: t.total }
    };
    orders.unshift(o);
    orders = orders.slice(0, 30);
    store.set(KEY_ORDERS, orders);
    cart = { tickets: [], combos: {} };
    saveCart();
    return o;
  }

  function initCarrito() {
    renderCart();
    var form = $("#checkout-form");
    var card = $("#f-card"), exp = $("#f-exp"), cvv = $("#f-cvv"), phone = $("#f-phone");
    card.addEventListener("input", function () {
      var d = card.value.replace(/\D/g, "").slice(0, 19);
      card.value = d.replace(/(.{4})/g, "$1 ").trim();
    });
    exp.addEventListener("input", function () {
      var d = exp.value.replace(/\D/g, "").slice(0, 4);
      exp.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
    cvv.addEventListener("input", function () { cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4); });
    phone.addEventListener("input", function () { phone.value = phone.value.replace(/[^\d\s()+-]/g, "").slice(0, 16); });
    FIELD_ORDER.forEach(function (id) {
      var el = $("#f-" + id);
      el.addEventListener("blur", function () { if (el.value || id === "privacy") checkField(id); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") checkField(id); });
      if (id === "privacy") el.addEventListener("change", function () { checkField(id); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.tickets.length && !Object.keys(cart.combos).length) { toast("Tu carrito está vacío."); return; }
      var first = null;
      FIELD_ORDER.forEach(function (id) { if (checkField(id) && !first) first = id; });
      if (first) { var f = $("#f-" + first); f.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); f.focus({ preventScroll: true }); toast("Revisa los campos marcados."); return; }
      for (var i = 0; i < cart.tickets.length; i++) {
        var x = cart.tickets[i], show = showingsOf(x.movieId, x.date).filter(function (s) { return s.time === x.time; })[0], occ = show ? occupiedSet(show) : {};
        if (!show || x.seats.some(function (s) { return occ[s]; })) {
          cart.tickets.splice(i, 1); saveCart(); renderCart();
          toast("Algunos asientos ya no estaban disponibles y se quitaron del carrito.");
          return;
        }
      }
      var overlay = document.createElement("div");
      overlay.className = "processing"; overlay.setAttribute("role", "alert");
      overlay.innerHTML = '<div class="spinner"></div><p>Procesando pago…</p><small>Simulación: no se realiza ningún cargo.</small>';
      document.body.appendChild(overlay);
      setTimeout(function () {
        overlay.remove();
        if (card.value.replace(/\D/g, "") === DECLINE_CARD) {
          $("#e-card").textContent = "Pago rechazado (simulación). Prueba con otra tarjeta.";
          card.setAttribute("aria-invalid", "true"); card.focus();
          return;
        }
        var o = createOrder();
        location.href = "boletos.html?folio=" + encodeURIComponent(o.folio) + "&nuevo=1";
      }, 1800);
    });
  }

  /* --- Boletos --- */
  function logoImg(eager) { return IMG(LOGO, "Cine Horizonte", "Cine Horizonte", eager); }
  function dticketHTML(o, t, idx) {
    var m = MOVIE_BY_ID[t.movieId];
    return '<article class="dticket tilt" data-tilt="3"><div class="dticket__main"><div class="dticket__brand">' + logoImg() + "<span>Boleto digital</span></div>" +
      '<div class="poster">' + IMG(m.img, m.title, m.title) + "</div><div><h3>" + esc(m.title) + "</h3><dl>" +
      "<div><dt>Fecha</dt><dd>" + fmtShort(t.date) + "</dd></div><div><dt>Hora</dt><dd>" + t.time + " h</dd></div>" +
      "<div><dt>Sala</dt><dd>" + t.room + "</dd></div><div><dt>Formato</dt><dd>" + t.format + "</dd></div>" +
      "<div><dt>Asientos</dt><dd>" + esc(t.seats.join(", ")) + "</dd></div><div><dt>Boletos</dt><dd>" + t.seats.length + "</dd></div></dl></div></div>" +
      '<div class="dticket__stub"><canvas data-qr="' + esc(qrText(o, t)) + '"></canvas><span class="folio">' + esc(o.folio) + "</span><small>Presenta este código en la entrada</small></div></article>";
  }
  function receiptHTML(o) {
    var rows = o.tickets.map(function (t) {
      return "<tr><td>" + esc(t.title) + "<small>" + fmtShort(t.date) + " · " + t.time + " h · Sala " + t.room + " · " + t.format + "<br>Asientos: " + esc(t.seats.join(", ")) + '</small></td><td class="num">' + t.seats.length + '</td><td class="num">' + money(t.unit) + '</td><td class="num">' + money(t.seats.length * t.unit) + "</td></tr>";
    }).concat(o.combos.map(function (c) {
      return "<tr><td>" + esc(c.name) + '</td><td class="num">' + c.qty + '</td><td class="num">' + money(c.unit) + '</td><td class="num">' + money(c.qty * c.unit) + "</td></tr>";
    })).join("");
    return '<section class="receipt" aria-label="Ticket de compra"><div class="receipt__head">' + logoImg() + '<div class="receipt__folio"><span>Folio</span><strong>' + esc(o.folio) + "</strong></div></div>" +
      '<div class="receipt__grid"><div><span>Cliente</span><strong>' + esc(o.customer.name) + "</strong></div><div><span>Correo</span><strong>" + esc(o.customer.email) + "</strong></div>" +
      "<div><span>Teléfono</span><strong>" + esc(o.customer.phone) + "</strong></div><div><span>Fecha de compra</span><strong>" + esc(fmtDateTime(o.at)) + "</strong></div>" +
      "<div><span>Pago</span><strong>" + esc(o.card.brand) + " •••• " + esc(o.card.last4) + " (simulado)</strong></div><div><span>Estado</span><strong class=\"ok-text\">Pagado (simulación)</strong></div></div>" +
      '<div class="receipt__scroll"><table class="receipt__table"><thead><tr><th>Concepto</th><th class="num">Cant.</th><th class="num">Precio</th><th class="num">Importe</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div class="receipt__totals"><div class="sum-row"><span>Boletos</span><span>' + money(o.totals.tp) + '</span></div><div class="sum-row"><span>Alimentos</span><span>' + money(o.totals.fp) +
      '</span></div><div class="sum-row sum-row--total"><span>Total</span><span>' + money(o.totals.total) + "</span></div></div>" +
      '<p class="receipt__note">Proyecto escolar: el pago es una simulación y no se realizó ningún cargo. Precios en MXN, IVA incluido.</p></section>';
  }
  function paintQRs(root) { $$("canvas[data-qr]", root).forEach(function (c) { drawQR(c, c.getAttribute("data-qr")); }); }

  var currentOrder = null;
  function setTitle(t) { var el = $("#page-title"); if (el) el.textContent = t; document.title = t + " | Cine Horizonte"; }
  function getRoot() {
    var root = $("#tickets-root");
    if (root) return root;
    // Si tu boletos.html no tiene el contenedor, se crea aquí para que el boleto siempre se muestre
    var host = $("main") || $("#contenido") || document.body;
    var sec = document.createElement("section");
    sec.className = "container";
    sec.style.cssText = "padding:8rem 0 3rem";
    root = document.createElement("div");
    root.id = "tickets-root";
    sec.appendChild(root);
    host.appendChild(sec);
    return root;
  }
  function initBoletos() {
    var root = getRoot(), p = new URLSearchParams(location.search), folio = p.get("folio");
    var bar = '<div class="actions-bar"><button class="btn btn--primary btn--sm" type="button" data-act="print">Imprimir</button><button class="btn btn--ghost btn--sm" type="button" data-act="pdf">Guardar como PDF</button><a class="btn btn--ghost btn--sm" href="cartelera.html">Seguir comprando</a><a class="btn btn--ghost btn--sm" href="boletos.html">Mis boletos</a></div>';
    var fileNote = location.protocol === "file:" ? '<p class="banner banner--info">Los códigos QR abren este boleto en otros dispositivos solo cuando el sitio está publicado o se abre desde la misma red.</p>' : "";
    var o;
    if (folio) {
      o = orders.filter(function (x) { return x.folio === folio; })[0];
      if (!o) {
        root.innerHTML = '<div class="empty"><h2>No encontramos esa compra</h2><p>Puede que se haya hecho en otro dispositivo o navegador.</p><a class="btn btn--primary" href="boletos.html">Ver mis boletos</a></div>';
        return;
      }
      currentOrder = o;
      setTitle(p.get("nuevo") ? "¡Compra exitosa!" : "Tus boletos");
      root.innerHTML = (p.get("nuevo") ? '<p class="banner" role="status">Pago aprobado (simulación). Tu folio es <strong>' + esc(o.folio) + "</strong>. Guarda tus boletos o imprímelos.</p>" : "") + fileNote + bar +
        (o.tickets.length ? '<div class="dtickets">' + o.tickets.map(function (t, i) { return dticketHTML(o, t, i); }).join("") + "</div>" : "") + receiptHTML(o);
      paintQRs(root);
      return;
    }
    var mid = p.get("m");
    if (mid && MOVIE_BY_ID[mid] && p.get("f") && /^\d{4}-\d{2}-\d{2}$/.test(p.get("d") || "")) {
      var show = showingsOf(mid, p.get("d")).filter(function (s) { return s.time === p.get("h"); })[0] || { format: "2D", room: "-", time: p.get("h") || "" };
      var seats = (p.get("s") || "").split(".").filter(function (s) { return /^[A-H](10|[1-9])$/.test(s); });
      var qf = p.get("f").replace(/[^A-Z0-9-]/gi, "").slice(0, 20).toUpperCase();
      var fake = { folio: qf, customer: { name: p.get("n") || "Cliente" } };
      var t = { movieId: mid, date: p.get("d"), time: show.time, format: show.format, room: show.room, seats: seats };
      var real = orders.filter(function (x) { return x.folio === qf; })[0], msg, cls = "banner";
      if (!real) {
        msg = "<strong>Folio " + esc(qf) + ":</strong> no está en el historial de este dispositivo. Los datos de abajo vienen del código QR y no se pueden confirmar aquí.";
        cls = "banner banner--info";
      } else {
        var rt = real.tickets.filter(function (x) { return x.movieId === mid && x.date === t.date && x.time === t.time; })[0];
        if (rt && rt.seats.slice().sort(seatSort).join(".") === seats.slice().sort(seatSort).join(".")) {
          msg = "<strong>Boleto válido.</strong> El folio " + esc(qf) + " y los datos del QR coinciden con la compra guardada (" + esc(rt.title) + ", sala " + rt.room + ").";
        } else {
          msg = "<strong>Los datos NO coinciden.</strong> El folio existe, pero película, función o asientos del QR son distintos a los de la compra guardada.";
          cls = "banner banner--warn";
        }
      }
      setTitle("Verificación de boleto");
      root.innerHTML = '<p class="' + cls + '" role="status">' + msg + '</p><div class="dtickets">' + dticketHTML(fake, t, 0) + '</div><div class="actions-bar"><a class="btn btn--ghost btn--sm" href="boletos.html">Ir a mis boletos</a></div>';
      paintQRs(root);
      return;
    }
    var verify = '<form class="verify" id="folio-form" novalidate><label for="folio-q">Consultar o verificar un folio</label><div class="verify__row"><input id="folio-q" type="text" placeholder="CH-261119-ABCD" autocomplete="off"><button class="btn btn--primary btn--sm" type="submit">Verificar</button></div><p class="field-error" id="folio-msg"></p></form>';
    if (!orders.length) {
      root.innerHTML = verify + '<div class="empty"><h2>Aún no tienes boletos</h2><p>Cuando compres, aparecerán aquí con su código QR.</p><a class="btn btn--primary" href="cartelera.html">Ver cartelera</a></div>';
      return;
    }
    setTitle("Mis boletos");
    root.innerHTML = verify + '<div class="order-list">' + orders.map(function (x) {
      var n = x.tickets.reduce(function (a, t) { return a + t.seats.length; }, 0);
      return '<div class="order"><div><strong>' + esc(x.folio) + "</strong><br><span>" + esc(fmtDateTime(x.at)) + " · " + n + (n === 1 ? " boleto" : " boletos") + '</span></div><strong>' + money(x.totals.total) +
        '</strong><a class="btn btn--ghost btn--sm" href="boletos.html?folio=' + encodeURIComponent(x.folio) + '">Ver boletos</a></div>';
    }).join("") + "</div>";
  }

  /* ---------- 9. Eventos e inicio ---------- */
  var tiltEl = null, tiltRaf = 0;
  function resetTilt() {
    if (!tiltEl) return;
    tiltEl.style.setProperty("--rx", "0deg"); tiltEl.style.setProperty("--ry", "0deg");
    tiltEl = null;
  }
  function bindTilt() {
    if (reduceMotion) return;
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var el = e.target.closest ? e.target.closest("[data-tilt]") : null;
      if (tiltEl && tiltEl !== el) resetTilt();
      if (!el) return;
      tiltEl = el;
      cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(function () {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height, amp = parseFloat(el.getAttribute("data-tilt")) || 10;
        el.style.setProperty("--ry", ((px - 0.5) * amp * 2).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * amp * 2).toFixed(2) + "deg");
        el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      });
    });
    document.addEventListener("mouseleave", resetTilt);
  }

  function setMenu(open) {
    var nav = $("#nav"), b = $(".burger");
    if (!nav || !b) return;
    nav.classList.toggle("is-open", open);
    b.setAttribute("aria-expanded", open);
    b.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("no-scroll", open);
  }

  function downloadPdf() {
    if (!currentOrder) return;
    var url = URL.createObjectURL(buildPdf(currentOrder)), a = document.createElement("a");
    a.href = url; a.download = "boletos-" + currentOrder.folio + ".pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast("PDF generado.");
  }

  function bindClicks() {
    document.addEventListener("click", function (e) {
      var dlg = e.target;
      if (dlg.tagName === "DIALOG") { dlg.close(); return; }
      var el = e.target.closest("[data-act],[data-seat]");
      if (!el) return;
      if (el.hasAttribute("data-seat")) { toggleSeat(el); return; }
      var act = el.getAttribute("data-act"), id = el.getAttribute("data-id");
      switch (act) {
        case "open-movie": openMovie(id); break;
        case "close-dialog": el.closest("dialog").close(); break;
        case "privacy": openDialog($("#privacy-dialog")); break;
        case "menu": setMenu(!$("#nav").classList.contains("is-open")); break;
        case "pick-date":
          ui.date = el.getAttribute("data-date");
          $$(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === el); });
          $("#slots").innerHTML = slotsHTML(ui.movie, ui.date);
          break;
        case "pick-slot": openSeats(ui.movie.id, ui.date, el.getAttribute("data-time")); break;
        case "seats-back": $("#movie-box").innerHTML = detailHTML(ui.movie); break;
        case "add-seats": addSeatsToCart(); break;
        case "combo-add": setCombo(id, 1); toast(COMBO_BY_ID[id].name + " agregado al carrito."); break;
        case "combo-inc": setCombo(id, (cart.combos[id] || 0) + 1); break;
        case "combo-dec": setCombo(id, (cart.combos[id] || 0) - 1); break;
        case "rm-combo": setCombo(id, 0); break;
        case "rm-ticket":
          cart.tickets = cart.tickets.filter(function (t) { return tkey(t) !== el.getAttribute("data-key"); });
          saveCart(); renderCart(); break;
        case "edit-ticket": {
          var parts = el.getAttribute("data-key").split("|");
          openSeats(parts[0], parts[1], parts[2]); break;
        }
        case "print": window.print(); break;
        case "pdf": downloadPdf(); break;
      }
      if (act === "menu") return;
      if (el.closest(".nav")) setMenu(false);
    });
    document.addEventListener("close", function () { unlockScroll(); }, true);
    document.addEventListener("submit", function (e) {
      if (e.target.id !== "folio-form") return;
      e.preventDefault();
      var v = $("#folio-q").value.trim().toUpperCase();
      if (!v) { $("#folio-msg").textContent = "Escribe el folio de tu boleto."; return; }
      var found = orders.filter(function (o) { return o.folio === v; })[0];
      if (found) location.href = "boletos.html?folio=" + encodeURIComponent(v);
      else $("#folio-msg").textContent = "No encontramos ese folio en este dispositivo.";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("scroll", function () { $("#site-header").classList.toggle("is-scrolled", window.scrollY > 12); }, { passive: true });
    $("#site-header").classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function initReveal() {
    var els = $$("[data-reveal]");
    els.forEach(function (el, i) { el.classList.add("reveal"); el.style.setProperty("--d", i % 4); });
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    buildLayout();
    updateCartCount();
    if (PAGE === "home") initHome();
    if (PAGE === "cartelera") initCartelera();
    if (PAGE === "combos") initCombos();
    if (PAGE === "carrito") initCarrito();
    if (PAGE === "boletos") initBoletos();
    bindClicks();
    bindTilt();
    initReveal();
  }
  init();
})();