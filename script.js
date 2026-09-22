/* =========================================================
   ÚTILHUB V21 — NOVA FLOW 5.0
   SCRIPT PRINCIPAL
   80 MODOS DE ANIMACIÓN
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const STORAGE_KEY = "utilhub-v21";

const OLD_STORAGE_KEYS = [
  "utilhub-v20",
  "utilhub-v19",
  "utilhub-v18",
  "utilhub-v17",
  "utilhub-v15-advanced",
  "utilhub-v15"
];

const defaultState = {
  theme: "dark",
  motion: true,
  performance: "balanced",
  focus: false,

  novaMode: "cosmic",
  novaIntensity: 0.8,

  favorites: [],
  recent: [],

  notes: "",
  tasks: [],
  shopping: [],

  dictionaryRecent: [],

  stopwatch: {
    running: false,
    elapsed: 0,
    startedAt: 0
  },

  timer: {
    running: false,
    endAt: 0,
    remaining: 0
  },

  settings: {}
};

let state = loadState();

/* =========================================================
   HELPERS GENERALES
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const random = (min = 0, max = 1) =>
  Math.random() * (max - min) + min;

const randomInt = (min, max) =>
  Math.floor(random(min, max + 1));

const lerp = (a, b, t) =>
  a + (b - a) * t;

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value, decimals = 6) {
  if (!Number.isFinite(value)) return "—";

  return Number(value.toFixed(decimals)).toLocaleString("es-PE", {
    maximumFractionDigits: decimals
  });
}

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return [
      String(h).padStart(2, "0"),
      String(m).padStart(2, "0"),
      String(s).padStart(2, "0")
    ].join(":");
  }

  return [
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0")
  ].join(":");
}

/* =========================================================
   STORAGE
   ========================================================= */

function normalizeState(data) {
  const safe = {
    ...defaultState,
    ...(data || {})
  };

  safe.favorites = Array.isArray(safe.favorites)
    ? safe.favorites
    : [];

  safe.recent = Array.isArray(safe.recent)
    ? safe.recent
    : [];

  safe.tasks = Array.isArray(safe.tasks)
    ? safe.tasks
    : [];

  safe.shopping = Array.isArray(safe.shopping)
    ? safe.shopping
    : [];

  safe.dictionaryRecent = Array.isArray(safe.dictionaryRecent)
    ? safe.dictionaryRecent
    : [];

  safe.stopwatch = {
    ...defaultState.stopwatch,
    ...(safe.stopwatch || {})
  };

  safe.timer = {
    ...defaultState.timer,
    ...(safe.timer || {})
  };

  return safe;
}

function loadState() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);

    if (current) {
      return normalizeState(JSON.parse(current));
    }

    for (const oldKey of OLD_STORAGE_KEYS) {
      const oldData = localStorage.getItem(oldKey);

      if (oldData) {
        const migrated = normalizeState(JSON.parse(oldData));
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(migrated)
        );
        return migrated;
      }
    }
  } catch (error) {
    console.warn("No se pudo cargar la configuración.", error);
  }

  return normalizeState({});
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("No se pudo guardar la configuración.", error);
  }
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message, icon = "✓") {
  const toast = $("#toast");
  const toastMessage = $("#toastMessage");
  const toastIcon = $("#toastIcon");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;

  if (toastIcon) {
    toastIcon.textContent = icon;
  }

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* =========================================================
   HERRAMIENTAS
   ========================================================= */

const tools = [

  {
    id: "calculator",
    title: "Calculadora",
    icon: "∑",
    category: "math",
    description: "Calcula operaciones con números y paréntesis.",
    tag: "Cálculo"
  },

  {
    id: "percentage",
    title: "Porcentaje",
    icon: "%",
    category: "math",
    description: "Calcula porcentajes de forma rápida.",
    tag: "Cálculo"
  },

  {
    id: "discount",
    title: "Descuento",
    icon: "🏷",
    category: "math",
    description: "Calcula precio final y ahorro.",
    tag: "Dinero"
  },

  {
    id: "tip",
    title: "Propina",
    icon: "☕",
    category: "math",
    description: "Calcula propina y total de una cuenta.",
    tag: "Dinero"
  },

  {
    id: "splitbill",
    title: "Dividir cuenta",
    icon: "÷",
    category: "math",
    description: "Divide una cuenta entre varias personas.",
    tag: "Dinero"
  },

  {
    id: "average",
    title: "Promedio",
    icon: "≈",
    category: "math",
    description: "Obtén el promedio de varios números.",
    tag: "Cálculo"
  },

  {
    id: "rule3",
    title: "Regla de tres",
    icon: "⅓",
    category: "math",
    description: "Resuelve reglas de tres simples.",
    tag: "Cálculo"
  },

  {
    id: "change",
    title: "Cambio porcentual",
    icon: "↗",
    category: "math",
    description: "Calcula el aumento o disminución porcentual.",
    tag: "Cálculo"
  },

  {
    id: "length",
    title: "Longitud",
    icon: "↔",
    category: "convert",
    description: "Convierte metros, kilómetros, centímetros y más.",
    tag: "Conversión"
  },

  {
    id: "weight",
    title: "Peso",
    icon: "⚖",
    category: "convert",
    description: "Convierte gramos, kilogramos, libras y onzas.",
    tag: "Conversión"
  },

  {
    id: "volume",
    title: "Volumen",
    icon: "◈",
    category: "convert",
    description: "Convierte litros y unidades de volumen.",
    tag: "Conversión"
  },

  {
    id: "area",
    title: "Área",
    icon: "▣",
    category: "convert",
    description: "Convierte unidades de superficie.",
    tag: "Conversión"
  },

  {
    id: "temperature",
    title: "Temperatura",
    icon: "🌡",
    category: "convert",
    description: "Convierte Celsius, Fahrenheit y Kelvin.",
    tag: "Conversión"
  },

  {
    id: "speed",
    title: "Velocidad",
    icon: "⚡",
    category: "convert",
    description: "Convierte km/h, mph y m/s.",
    tag: "Conversión"
  },

  {
    id: "storage",
    title: "Almacenamiento",
    icon: "💾",
    category: "convert",
    description: "Convierte bytes, KB, MB, GB y TB.",
    tag: "Digital"
  },

  {
    id: "base",
    title: "Bases numéricas",
    icon: "01",
    category: "convert",
    description: "Convierte decimal, binario, octal y hexadecimal.",
    tag: "Digital"
  },

  {
    id: "timeconvert",
    title: "Tiempo",
    icon: "◷",
    category: "time",
    description: "Convierte segundos, minutos y horas.",
    tag: "Tiempo"
  },

  {
    id: "datediff",
    title: "Diferencia de fechas",
    icon: "▦",
    category: "time",
    description: "Calcula los días entre dos fechas.",
    tag: "Tiempo"
  },

  {
    id: "age",
    title: "Calculadora de edad",
    icon: "🎂",
    category: "time",
    description: "Calcula una edad a partir de una fecha.",
    tag: "Tiempo"
  },

  {
    id: "clock",
    title: "Reloj",
    icon: "◴",
    category: "time",
    description: "Muestra la hora actual en tiempo real.",
    tag: "Tiempo"
  },

  {
    id: "countdown",
    title: "Cuenta regresiva",
    icon: "⌛",
    category: "time",
    description: "Crea una cuenta regresiva.",
    tag: "Tiempo"
  },

  {
    id: "timer",
    title: "Temporizador",
    icon: "⏱",
    category: "time",
    description: "Configura un temporizador.",
    tag: "Tiempo"
  },

  {
    id: "stopwatch",
    title: "Cronómetro",
    icon: "⏲",
    category: "time",
    description: "Mide el tiempo con precisión.",
    tag: "Tiempo"
  },

  {
    id: "text",
    title: "Contador de texto",
    icon: "Aa",
    category: "text",
    description: "Cuenta palabras, caracteres y líneas.",
    tag: "Texto"
  },

  {
    id: "case",
    title: "Cambiar mayúsculas",
    icon: "Aa",
    category: "text",
    description: "Convierte textos a diferentes formatos.",
    tag: "Texto"
  },

  {
    id: "reverse",
    title: "Invertir texto",
    icon: "↔",
    category: "text",
    description: "Invierte el orden de los caracteres.",
    tag: "Texto"
  },

  {
    id: "slug",
    title: "Generador de slug",
    icon: "#",
    category: "text",
    description: "Convierte un título en un identificador web.",
    tag: "Web"
  },

  {
    id: "dictionary",
    title: "Diccionario",
    icon: "📖",
    category: "text",
    description: "Busca definiciones en español.",
    tag: "Idioma"
  },

  {
    id: "notes",
    title: "Notas",
    icon: "📝",
    category: "organize",
    description: "Guarda notas directamente en tu navegador.",
    tag: "Organización"
  },

  {
    id: "tasks",
    title: "Tareas",
    icon: "✓",
    category: "organize",
    description: "Organiza tus tareas pendientes.",
    tag: "Organización"
  },

  {
    id: "shopping",
    title: "Lista de compras",
    icon: "🛒",
    category: "organize",
    description: "Crea y administra una lista de compras.",
    tag: "Organización"
  },

  {
    id: "focus",
    title: "Concentración",
    icon: "◉",
    category: "organize",
    description: "Activa un espacio sencillo para concentrarte.",
    tag: "Productividad"
  },

  {
    id: "currency",
    title: "Monedas",
    icon: "💱",
    category: "life",
    description: "Convierte monedas usando información externa.",
    tag: "Dinero"
  },

  {
    id: "food",
    title: "Buscar comida",
    icon: "🍽",
    category: "life",
    description: "Encuentra servicios y opciones de comida.",
    tag: "Vida diaria"
  },

  {
    id: "buy",
    title: "Compras web",
    icon: "🛍",
    category: "life",
    description: "Busca productos en servicios externos.",
    tag: "Compras"
  },

  {
    id: "random",
    title: "Número aleatorio",
    icon: "🎲",
    category: "fun",
    description: "Genera números aleatorios.",
    tag: "Diversión"
  },

  {
    id: "password",
    title: "Generador seguro",
    icon: "🔐",
    category: "fun",
    description: "Genera contraseñas aleatorias.",
    tag: "Seguridad"
  },

  {
    id: "qr",
    title: "Código QR",
    icon: "▦",
    category: "fun",
    description: "Genera un código QR a partir de un texto.",
    tag: "QR"
  },

  {
    id: "color",
    title: "Color HEX",
    icon: "◈",
    category: "fun",
    description: "Obtén valores HEX y RGB de un color.",
    tag: "Diseño"
  }

];

/* =========================================================
   RENDER HERRAMIENTAS
   ========================================================= */

let currentCategory = "all";
let searchText = "";

function renderTools() {
  const grid = $("#toolGrid");
  const empty = $("#emptyTools");

  if (!grid) return;

  const filtered = tools.filter((tool) => {

    const categoryMatch =
      currentCategory === "all" ||
      tool.category === currentCategory;

    const haystack = [
      tool.title,
      tool.description,
      tool.tag,
      tool.category,
      tool.id
    ]
      .join(" ")
      .toLowerCase();

    const searchMatch =
      !searchText ||
      haystack.includes(searchText.toLowerCase());

    return categoryMatch && searchMatch;
  });

  grid.innerHTML = filtered.map((tool) => {

    const favorite =
      state.favorites.includes(tool.id);

    return `
      <article
        class="toolCard"
        data-open="${escapeHTML(tool.id)}"
        tabindex="0"
        role="button"
        aria-label="Abrir ${escapeHTML(tool.title)}"
      >

        <div class="toolCardTop">

          <span class="toolIcon">
            ${tool.icon}
          </span>

          <button
            class="favoriteBtn ${favorite ? "active" : ""}"
            data-favorite="${escapeHTML(tool.id)}"
            type="button"
            aria-label="Favorito"
          >
            ${favorite ? "★" : "☆"}
          </button>

        </div>

        <h3>
          ${escapeHTML(tool.title)}
        </h3>

        <p>
          ${escapeHTML(tool.description)}
        </p>

        <span class="toolTag">
          ${escapeHTML(tool.tag)}
        </span>

      </article>
    `;
  }).join("");

  if (empty) {
    empty.hidden = filtered.length !== 0;
  }

  updateStats();
}

function updateStats() {
  const toolCount = $("#toolCount");
  const favoriteCount = $("#favoriteCount");
  const recentCount = $("#recentCount");

  if (toolCount) {
    toolCount.textContent = tools.length;
  }

  if (favoriteCount) {
    favoriteCount.textContent =
      state.favorites.length;
  }

  if (recentCount) {
    recentCount.textContent =
      state.recent.length;
  }
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function toggleFavorite(id) {
  if (!tools.some((tool) => tool.id === id)) return;

  if (state.favorites.includes(id)) {
    state.favorites =
      state.favorites.filter((item) => item !== id);

    showToast("Quitado de favoritos", "☆");
  } else {
    state.favorites.push(id);

    showToast("Añadido a favoritos", "★");
  }

  saveState();
  renderTools();
  renderQuickTools();
}

/* =========================================================
   RECIENTES
   ========================================================= */

function addRecent(id) {
  state.recent = [
    id,
    ...state.recent.filter((item) => item !== id)
  ].slice(0, 8);

  saveState();

  renderQuickTools();
  updateStats();
}

function renderQuickTools() {
  const container = $("#quickTools");

  if (!container) return;

  const ids = [
    ...state.favorites,
    ...state.recent
  ].filter(
    (id, index, array) =>
      array.indexOf(id) === index
  );

  if (!ids.length) {
    container.innerHTML = `
      <div class="emptyState">
        <span>✦</span>
        <h3>Aún no hay accesos rápidos</h3>
        <p>
          Abre herramientas o añádelas a favoritos.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = ids.map((id) => {

    const tool = tools.find(
      (item) => item.id === id
    );

    if (!tool) return "";

    return `
      <button
        class="quickItem"
        data-open="${escapeHTML(tool.id)}"
        type="button"
      >

        <span class="quickItemIcon">
          ${tool.icon}
        </span>

        <span>
          ${escapeHTML(tool.title)}
        </span>

      </button>
    `;
  }).join("");
}

function clearRecent() {
  state.recent = [];

  saveState();

  renderQuickTools();
  updateStats();

  showToast("Historial reciente limpiado", "✓");
}

/* =========================================================
   PANEL DE HERRAMIENTAS
   ========================================================= */

const toolPanel = $("#toolPanel");

function openTool(id) {
  const tool = tools.find(
    (item) => item.id === id
  );

  if (!tool) return;

  addRecent(id);

  const icon = $("#toolPanelIcon");
  const category = $("#toolPanelCategory");
  const title = $("#toolPanelTitle");
  const content = $("#toolContent");

  if (!content) return;

  if (icon) icon.textContent = tool.icon;
  if (category) category.textContent = tool.tag;
  if (title) title.textContent = tool.title;

  try {
    content.innerHTML = renderToolContent(id);
    setupTool(id);
  } catch (error) {
    console.error(error);

    content.innerHTML = `
      <div class="toolResult">
        <strong>No se pudo abrir esta herramienta.</strong>
        <p>
          Intenta cerrar y volver a abrirla.
        </p>
      </div>
    `;
  }

  toolPanel.classList.add("open");
  toolPanel.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeTool() {
  if (!toolPanel) return;

  toolPanel.classList.remove("open");
  toolPanel.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

/* =========================================================
   RENDER DE HERRAMIENTAS
   ========================================================= */

function renderToolContent(id) {

  switch (id) {

    case "calculator":
      return `
        <div class="toolForm">
          <h3>Calculadora</h3>
          <p>
            Usa +, -, *, /, %, ^ y paréntesis.
          </p>

          <div class="field">
            <label>Operación</label>
            <input
              id="calcInput"
              class="toolInput"
              placeholder="Ejemplo: (25 + 15) * 2"
            >
          </div>

          <div class="toolActions">
            <button class="toolButton primary" id="calcBtn">
              Calcular
            </button>
            <button class="toolButton" id="calcClear">
              Limpiar
            </button>
          </div>

          <div class="toolResult">
            <strong id="calcResult">—</strong>
          </div>
        </div>
      `;

    case "percentage":
      return `
        <div class="toolForm">
          <h3>Porcentaje</h3>

          <div class="field">
            <label>Porcentaje</label>
            <input id="percentA" class="toolInput" type="number" value="20">
          </div>

          <div class="field">
            <label>Número</label>
            <input id="percentB" class="toolInput" type="number" value="100">
          </div>

          <button class="toolButton primary" id="percentBtn">
            Calcular
          </button>

          <div class="toolResult">
            <strong id="percentResult">—</strong>
          </div>
        </div>
      `;

    case "discount":
      return `
        <div class="toolForm">
          <h3>Descuento</h3>

          <div class="field">
            <label>Precio</label>
            <input id="discountPrice" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>Descuento (%)</label>
            <input id="discountPercent" class="toolInput" type="number" value="10">
          </div>

          <button class="toolButton primary" id="discountBtn">
            Calcular
          </button>

          <div class="toolResult">
            <strong id="discountResult">—</strong>
          </div>
        </div>
      `;

    case "tip":
      return `
        <div class="toolForm">
          <h3>Propina</h3>

          <div class="field">
            <label>Total de la cuenta</label>
            <input id="tipAmount" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>Propina (%)</label>
            <input id="tipPercent" class="toolInput" type="number" value="10">
          </div>

          <button class="toolButton primary" id="tipBtn">
            Calcular
          </button>

          <div class="toolResult">
            <strong id="tipResult">—</strong>
          </div>
        </div>
      `;

    case "splitbill":
      return `
        <div class="toolForm">
          <h3>Dividir cuenta</h3>

          <div class="field">
            <label>Total</label>
            <input id="splitAmount" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>Personas</label>
            <input id="splitPeople" class="toolInput" type="number" value="2" min="1">
          </div>

          <button class="toolButton primary" id="splitBtn">
            Dividir
          </button>

          <div class="toolResult">
            <strong id="splitResult">—</strong>
          </div>
        </div>
      `;

    case "average":
      return `
        <div class="toolForm">
          <h3>Promedio</h3>
          <p>Escribe números separados por comas.</p>

          <div class="field">
            <label>Números</label>
            <input
              id="averageInput"
              class="toolInput"
              placeholder="10, 15, 20, 25"
            >
          </div>

          <button class="toolButton primary" id="averageBtn">
            Calcular
          </button>

          <div class="toolResult">
            <strong id="averageResult">—</strong>
          </div>
        </div>
      `;

    case "rule3":
      return `
        <div class="toolForm">
          <h3>Regla de tres</h3>
          <p>
            A : B = C : X
          </p>

          <div class="field">
            <label>A</label>
            <input id="r3a" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>B</label>
            <input id="r3b" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>C</label>
            <input id="r3c" class="toolInput" type="number">
          </div>

          <button class="toolButton primary" id="r3Btn">
            Resolver
          </button>

          <div class="toolResult">
            <strong id="r3Result">X = —</strong>
          </div>
        </div>
      `;

    case "change":
      return `
        <div class="toolForm">
          <h3>Cambio porcentual</h3>

          <div class="field">
            <label>Valor inicial</label>
            <input id="changeOld" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>Valor final</label>
            <input id="changeNew" class="toolInput" type="number">
          </div>

          <button class="toolButton primary" id="changeBtn">
            Calcular
          </button>

          <div class="toolResult">
            <strong id="changeResult">—</strong>
          </div>
        </div>
      `;

    case "length":
      return conversionHTML(
        "Longitud",
        "length",
        [
          ["m", "Metros"],
          ["km", "Kilómetros"],
          ["cm", "Centímetros"],
          ["mm", "Milímetros"],
          ["mi", "Millas"],
          ["ft", "Pies"],
          ["in", "Pulgadas"]
        ]
      );

    case "weight":
      return conversionHTML(
        "Peso",
        "weight",
        [
          ["kg", "Kilogramos"],
          ["g", "Gramos"],
          ["mg", "Miligramos"],
          ["lb", "Libras"],
          ["oz", "Onzas"]
        ]
      );

    case "volume":
      return conversionHTML(
        "Volumen",
        "volume",
        [
          ["l", "Litros"],
          ["ml", "Mililitros"],
          ["m3", "Metros cúbicos"],
          ["gal", "Galones"]
        ]
      );

    case "area":
      return conversionHTML(
        "Área",
        "area",
        [
          ["m2", "Metros cuadrados"],
          ["km2", "Kilómetros cuadrados"],
          ["cm2", "Centímetros cuadrados"],
          ["ft2", "Pies cuadrados"]
        ]
      );

    case "temperature":
      return `
        <div class="toolForm">
          <h3>Temperatura</h3>

          <div class="field">
            <label>Valor</label>
            <input id="tempValue" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>Desde</label>
            <select id="tempFrom" class="toolSelect">
              <option value="c">Celsius</option>
              <option value="f">Fahrenheit</option>
              <option value="k">Kelvin</option>
            </select>
          </div>

          <div class="field">
            <label>Hacia</label>
            <select id="tempTo" class="toolSelect">
              <option value="c">Celsius</option>
              <option value="f">Fahrenheit</option>
              <option value="k">Kelvin</option>
            </select>
          </div>

          <button class="toolButton primary" id="tempBtn">
            Convertir
          </button>

          <div class="toolResult">
            <strong id="tempResult">—</strong>
          </div>
        </div>
      `;

    case "speed":
      return conversionHTML(
        "Velocidad",
        "speed",
        [
          ["ms", "m/s"],
          ["kmh", "km/h"],
          ["mph", "mph"],
          ["knot", "Nudos"]
        ]
      );

    case "storage":
      return conversionHTML(
        "Almacenamiento",
        "storage",
        [
          ["b", "Bytes"],
          ["kb", "KB"],
          ["mb", "MB"],
          ["gb", "GB"],
          ["tb", "TB"]
        ]
      );

    case "base":
      return `
        <div class="toolForm">
          <h3>Bases numéricas</h3>

          <div class="field">
            <label>Número</label>
            <input id="baseInput" class="toolInput" placeholder="255">
          </div>

          <div class="field">
            <label>Base de origen</label>
            <select id="baseFrom" class="toolSelect">
              <option value="10">Decimal</option>
              <option value="2">Binario</option>
              <option value="8">Octal</option>
              <option value="16">Hexadecimal</option>
            </select>
          </div>

          <button class="toolButton primary" id="baseBtn">
            Convertir
          </button>

          <div class="toolResult">
            <strong id="baseResult">—</strong>
          </div>
        </div>
      `;

    case "timeconvert":
      return `
        <div class="toolForm">
          <h3>Conversor de tiempo</h3>

          <div class="field">
            <label>Cantidad</label>
            <input id="timeValue" class="toolInput" type="number">
          </div>

          <div class="field">
            <label>Unidad</label>
            <select id="timeUnit" class="toolSelect">
              <option value="seconds">Segundos</option>
              <option value="minutes">Minutos</option>
              <option value="hours">Horas</option>
              <option value="days">Días</option>
            </select>
          </div>

          <button class="toolButton primary" id="timeConvertBtn">
            Convertir
          </button>

          <div class="toolResult">
            <strong id="timeConvertResult">—</strong>
          </div>
        </div>
      `;

    case "datediff":
      return `
        <div class="toolForm">
          <h3>Diferencia de fechas</h3>

          <div class="field">
            <label>Fecha inicial</label>
            <input id="dateStart" class="toolInput" type="date">
          </div>

          <div class="field">
            <label>Fecha final</label>
            <input id="dateEnd" class="toolInput" type="date">
          </div>

          <button class="toolButton primary" id="dateDiffBtn">
            Calcular
          </button>

          <div class="toolResult">
            <strong id="dateDiffResult">—</strong>
          </div>
        </div>
      `;

    case "age":
      return `
        <div class="toolForm">
          <h3>Calculadora de edad</h3>

          <div class="field">
            <label>Fecha de nacimiento</label>
            <input id="birthDate" class="toolInput" type="date">
          </div>

          <button class="toolButton primary" id="ageBtn">
            Calcular edad
          </button>

          <div class="toolResult">
            <strong id="ageResult">—</strong>
          </div>
        </div>
      `;

    case "clock":
      return `
        <div class="toolForm">
          <h3>Reloj</h3>

          <div class="toolResult">
            <strong id="clockResult">--:--:--</strong>
            <p id="clockDate">—</p>
          </div>
        </div>
      `;

    case "countdown":
      return `
        <div class="toolForm">
          <h3>Cuenta regresiva</h3>

          <div class="field">
            <label>Fecha y hora final</label>
            <input id="countdownDate" class="toolInput" type="datetime-local">
          </div>

          <button class="toolButton primary" id="countdownBtn">
            Iniciar
          </button>

          <div class="toolResult">
            <strong id="countdownResult">—</strong>
          </div>
        </div>
      `;

    case "timer":
      return `
        <div class="toolForm">
          <h3>Temporizador</h3>

          <div class="field">
            <label>Minutos</label>
            <input
              id="timerMinutes"
              class="toolInput"
              type="number"
              min="0"
              value="5"
            >
          </div>

          <div class="field">
            <label>Segundos</label>
            <input
              id="timerSeconds"
              class="toolInput"
              type="number"
              min="0"
              max="59"
              value="0"
            >
          </div>

          <div class="toolActions">
            <button class="toolButton primary" id="timerStart">
              Iniciar
            </button>

            <button class="toolButton" id="timerPause">
              Pausar
            </button>

            <button class="toolButton" id="timerReset">
              Reiniciar
            </button>
          </div>

          <div class="toolResult">
            <strong id="timerResult">00:00</strong>
          </div>
        </div>
      `;

    case "stopwatch":
      return `
        <div class="toolForm">
          <h3>Cronómetro</h3>

          <div class="toolResult">
            <strong id="stopwatchResult">
              00:00:00
            </strong>
          </div>

          <div class="toolActions">
            <button class="toolButton primary" id="stopwatchStart">
              Iniciar
            </button>

            <button class="toolButton" id="stopwatchPause">
              Pausar
            </button>

            <button class="toolButton" id="stopwatchReset">
              Reiniciar
            </button>
          </div>
        </div>
      `;

    case "text":
      return `
        <div class="toolForm">
          <h3>Contador de texto</h3>

          <div class="field">
            <label>Texto</label>
            <textarea
              id="textCounter"
              class="toolTextarea"
              placeholder="Escribe o pega tu texto..."
            ></textarea>
          </div>

          <div class="toolResult">
            <strong id="textResult">
              0 palabras · 0 caracteres · 0 líneas
            </strong>
          </div>
        </div>
      `;

    case "case":
      return `
        <div class="toolForm">
          <h3>Cambiar mayúsculas</h3>

          <textarea
            id="caseInput"
            class="toolTextarea"
            placeholder="Escribe tu texto..."
          ></textarea>

          <div class="toolActions">
            <button class="toolButton" id="upperBtn">
              MAYÚSCULAS
            </button>

            <button class="toolButton" id="lowerBtn">
              minúsculas
            </button>

            <button class="toolButton" id="titleBtn">
              Título
            </button>
          </div>

          <textarea
            id="caseResult"
            class="toolTextarea"
            readonly
            placeholder="Resultado..."
          ></textarea>
        </div>
      `;

    case "reverse":
      return `
        <div class="toolForm">
          <h3>Invertir texto</h3>

          <textarea
            id="reverseInput"
            class="toolTextarea"
            placeholder="Escribe algo..."
          ></textarea>

          <button class="toolButton primary" id="reverseBtn">
            Invertir
          </button>

          <textarea
            id="reverseResult"
            class="toolTextarea"
            readonly
          ></textarea>
        </div>
      `;

    case "slug":
      return `
        <div class="toolForm">
          <h3>Generador de slug</h3>

          <div class="field">
            <label>Título</label>
            <input
              id="slugInput"
              class="toolInput"
              placeholder="Mi página web nueva"
            >
          </div>

          <button class="toolButton primary" id="slugBtn">
            Generar
          </button>

          <div class="toolResult">
            <strong id="slugResult">—</strong>
          </div>
        </div>
      `;

    case "dictionary":
      return `
        <div class="toolForm">
          <h3>Diccionario</h3>

          <div class="field">
            <label>Palabra</label>
            <input
              id="dictionaryInput"
              class="toolInput"
              placeholder="Escribe una palabra"
            >
          </div>

          <button class="toolButton primary" id="dictionaryBtn">
            Buscar
          </button>

          <div
            id="dictionaryResult"
            class="toolResult"
          >
            <strong>—</strong>
          </div>
        </div>
      `;

    case "notes":
      return `
        <div class="toolForm">
          <h3>Notas</h3>

          <textarea
            id="notesInput"
            class="toolTextarea"
            placeholder="Escribe tus notas..."
          ></textarea>

          <div class="toolActions">
            <button class="toolButton primary" id="saveNotes">
              Guardar
            </button>

            <button class="toolButton" id="clearNotes">
              Limpiar
            </button>
          </div>
        </div>
      `;

    case "tasks":
      return `
        <div class="toolForm">
          <h3>Lista de tareas</h3>

          <div class="toolActions">
            <input
              id="taskInput"
              class="toolInput"
              placeholder="Nueva tarea..."
            >

            <button
              class="toolButton primary"
              id="addTask"
            >
              Añadir
            </button>
          </div>

          <div id="taskList"></div>
        </div>
      `;

    case "shopping":
      return `
        <div class="toolForm">
          <h3>Lista de compras</h3>

          <div class="toolActions">
            <input
              id="shoppingInput"
              class="toolInput"
              placeholder="Producto..."
            >

            <button
              class="toolButton primary"
              id="addShopping"
            >
              Añadir
            </button>
          </div>

          <div id="shoppingList"></div>
        </div>
      `;

    case "focus":
      return `
        <div class="toolForm">
          <h3>Modo concentración</h3>

          <p>
            Reduce elementos visuales para ayudarte a trabajar
            con menos distracciones.
          </p>

          <button
            class="toolButton primary"
            id="focusToolBtn"
          >
            Activar concentración
          </button>
        </div>
      `;

    case "currency":
      return `
        <div class="toolForm">
          <h3>Conversor de monedas</h3>

          <div class="field">
            <label>Cantidad</label>
            <input id="currencyAmount" class="toolInput" type="number" value="1">
          </div>

          <div class="field">
            <label>Desde</label>
            <select id="currencyFrom" class="toolSelect">
              <option value="USD">USD</option>
              <option value="PEN">PEN</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          <div class="field">
            <label>Hacia</label>
            <select id="currencyTo" class="toolSelect">
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          <button class="toolButton primary" id="currencyBtn">
            Convertir
          </button>

          <div class="toolResult">
            <strong id="currencyResult">—</strong>
          </div>
        </div>
      `;

    case "food":
      return `
        <div class="toolForm">
          <h3>Buscar comida</h3>

          <p>
            Puedes buscar restaurantes o comida en servicios
            externos. Tú decides qué pedir.
          </p>

          <div class="field">
            <label>¿Qué buscas?</label>
            <input
              id="foodInput"
              class="toolInput"
              placeholder="Pizza, hamburguesa, comida peruana..."
            >
          </div>

          <div class="toolActions">
            <button class="toolButton primary" id="foodSearch">
              Buscar en Google
            </button>

            <button class="toolButton" id="foodMaps">
              Buscar en Maps
            </button>
          </div>
        </div>
      `;

    case "buy":
      return `
        <div class="toolForm">
          <h3>Compras web</h3>

          <p>
            Busca productos en sitios externos. Los precios y
            disponibilidad deben comprobarse directamente.
          </p>

          <div class="field">
            <label>Producto</label>
            <input
              id="buyInput"
              class="toolInput"
              placeholder="Audífonos, teclado, mochila..."
            >
          </div>

          <div class="toolActions">
            <button class="toolButton primary" id="googleShopping">
              Google Shopping
            </button>

            <button class="toolButton" id="mercadoLibre">
              Mercado Libre
            </button>
          </div>
        </div>
      `;

    case "random":
      return `
        <div class="toolForm">
          <h3>Número aleatorio</h3>

          <div class="field">
            <label>Mínimo</label>
            <input id="randomMin" class="toolInput" type="number" value="1">
          </div>

          <div class="field">
            <label>Máximo</label>
            <input id="randomMax" class="toolInput" type="number" value="100">
          </div>

          <button class="toolButton primary" id="randomBtn">
            Generar
          </button>

          <div class="toolResult">
            <strong id="randomResult">—</strong>
          </div>
        </div>
      `;

    case "password":
      return `
        <div class="toolForm">
          <h3>Generador seguro</h3>

          <div class="field">
            <label>Longitud</label>
            <input
              id="passwordLength"
              class="toolInput"
              type="number"
              min="8"
              max="128"
              value="16"
            >
          </div>

          <div class="toolActions">
            <button class="toolButton primary" id="passwordBtn">
              Generar
            </button>

            <button class="toolButton" id="copyPassword">
              Copiar
            </button>
          </div>

          <div class="toolResult">
            <strong id="passwordResult">—</strong>
          </div>
        </div>
      `;

    case "qr":
      return `
        <div class="toolForm">
          <h3>Código QR</h3>

          <div class="field">
            <label>Texto o enlace</label>
            <input
              id="qrInput"
              class="toolInput"
              placeholder="https://..."
            >
          </div>

          <button class="toolButton primary" id="qrBtn">
            Generar QR
          </button>

          <div
            id="qrResult"
            class="toolResult"
          ></div>
        </div>
      `;

    case "color":
      return `
        <div class="toolForm">
          <h3>Color HEX</h3>

          <div class="field">
            <label>Selecciona un color</label>
            <input
              id="colorInput"
              type="color"
              value="#6ee7ff"
              style="width:100%;height:70px"
            >
          </div>

          <div class="toolResult">
            <strong id="colorHex">#6EE7FF</strong>
            <p id="colorRgb">RGB(110, 231, 255)</p>
          </div>
        </div>
      `;

    default:
      return `
        <div class="toolResult">
          <strong>Herramienta no disponible.</strong>
        </div>
      `;
  }
}

/* =========================================================
   CONVERSORES
   ========================================================= */

const conversionData = {

  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.344,
    ft: 0.3048,
    in: 0.0254
  },

  weight: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.45359237,
    oz: 0.028349523125
  },

  volume: {
    l: 1,
    ml: 0.001,
    m3: 1000,
    gal: 3.785411784
  },

  area: {
    m2: 1,
    km2: 1000000,
    cm2: 0.0001,
    ft2: 0.09290304
  },

  speed: {
    ms: 1,
    kmh: 1 / 3.6,
    mph: 0.44704,
    knot: 0.514444
  },

  storage: {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4
  }

};

function conversionHTML(title, type, units) {

  return `
    <div class="toolForm">

      <h3>${escapeHTML(title)}</h3>

      <div class="field">
        <label>Valor</label>
        <input
          id="convertValue"
          class="toolInput"
          type="number"
          value="1"
        >
      </div>

      <div class="field">
        <label>Desde</label>

        <select
          id="convertFrom"
          class="toolSelect"
        >
          ${units.map(([value, label]) => `
            <option value="${value}">
              ${escapeHTML(label)}
            </option>
          `).join("")}
        </select>
      </div>

      <div class="field">
        <label>Hacia</label>

        <select
          id="convertTo"
          class="toolSelect"
        >
          ${units.map(([value, label]) => `
            <option value="${value}">
              ${escapeHTML(label)}
            </option>
          `).join("")}
        </select>
      </div>

      <button
        class="toolButton primary"
        id="convertBtn"
        data-convert-type="${type}"
      >
        Convertir
      </button>

      <div class="toolResult">
        <strong id="convertResult">—</strong>
      </div>

    </div>
  `;
}

/* =========================================================
   CALCULADORA SEGURA
   ========================================================= */

function calculateExpression(expression) {

  let input = String(expression)
    .trim()
    .replaceAll(",", ".")
    .replaceAll("×", "*")
    .replaceAll("÷", "/");

  if (!input) {
    throw new Error("Escribe una operación.");
  }

  if (!/^[0-9+\-*/().%^ \t]+$/.test(input)) {
    throw new Error("Operación no permitida.");
  }

  input = input.replaceAll("^", "**");

  if (input.includes("**")) {
    const parts = input.split("**");

    if (parts.length !== 2) {
      throw new Error("Exponente no válido.");
    }

    const base = calculateExpression(parts[0]);
    const exponent = calculateExpression(parts[1]);

    return Math.pow(base, exponent);
  }

  const tokens =
    input.match(/(?:\d+(?:\.\d+)?|\.\d+|[+\-*/%()])/g);

  if (!tokens || tokens.join("") !== input.replace(/\s+/g, "")) {
    throw new Error("Operación no válida.");
  }

  const values = [];
  const operators = [];

  const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "%": 2
  };

  function applyOperator() {

    const op = operators.pop();

    const b = values.pop();
    const a = values.pop();

    if (a === undefined || b === undefined) {
      throw new Error("Operación incompleta.");
    }

    let result;

    if (op === "+") result = a + b;
    if (op === "-") result = a - b;
    if (op === "*") result = a * b;

    if (op === "/") {
      if (b === 0) {
        throw new Error("No se puede dividir entre cero.");
      }

      result = a / b;
    }

    if (op === "%") {
      if (b === 0) {
        throw new Error("No se puede usar módulo con cero.");
      }

      result = a % b;
    }

    values.push(result);
  }

  let previous = "operator";

  for (const token of tokens) {

    if (!Number.isNaN(Number(token))) {

      if (previous === "number") {
        throw new Error("Falta un operador.");
      }

      values.push(Number(token));
      previous = "number";
      continue;
    }

    if (token === "(") {

      operators.push(token);
      previous = "operator";
      continue;
    }

    if (token === ")") {

      while (
        operators.length &&
        operators.at(-1) !== "("
      ) {
        applyOperator();
      }

      if (operators.pop() !== "(") {
        throw new Error("Paréntesis incorrectos.");
      }

      previous = "number";
      continue;
    }

    if (previous !== "number") {

      if (
        (token === "+" || token === "-") &&
        previous === "operator"
      ) {
        values.push(0);
      } else {
        throw new Error("Operación incorrecta.");
      }
    }

    while (
      operators.length &&
      operators.at(-1) !== "(" &&
      precedence[operators.at(-1)] >= precedence[token]
    ) {
      applyOperator();
    }

    operators.push(token);
    previous = "operator";
  }

  while (operators.length) {

    if (operators.at(-1) === "(") {
      throw new Error("Falta cerrar un paréntesis.");
    }

    applyOperator();
  }

  if (values.length !== 1) {
    throw new Error("Operación incompleta.");
  }

  return values[0];
}

/* =========================================================
   CONFIGURACIÓN DE CADA HERRAMIENTA
   ========================================================= */

function setupTool(id) {

  try {

    switch (id) {

      case "calculator":
        setupCalculator();
        break;

      case "percentage":
        setupPercentage();
        break;

      case "discount":
        setupDiscount();
        break;

      case "tip":
        setupTip();
        break;

      case "splitbill":
        setupSplitBill();
        break;

      case "average":
        setupAverage();
        break;

      case "rule3":
        setupRule3();
        break;

      case "change":
        setupChange();
        break;

      case "length":
      case "weight":
      case "volume":
      case "area":
      case "speed":
      case "storage":
        setupConversion();
        break;

      case "temperature":
        setupTemperature();
        break;

      case "base":
        setupBase();
        break;

      case "timeconvert":
        setupTimeConvert();
        break;

      case "datediff":
        setupDateDiff();
        break;

      case "age":
        setupAge();
        break;

      case "clock":
        setupClock();
        break;

      case "countdown":
        setupCountdown();
        break;

      case "timer":
        setupTimer();
        break;

      case "stopwatch":
        setupStopwatch();
        break;

      case "text":
        setupTextCounter();
        break;

      case "case":
        setupCaseTool();
        break;

      case "reverse":
        setupReverse();
        break;

      case "slug":
        setupSlug();
        break;

      case "dictionary":
        setupDictionary();
        break;

      case "notes":
        setupNotes();
        break;

      case "tasks":
        setupTasks();
        break;

      case "shopping":
        setupShopping();
        break;

      case "focus":
        setupFocusTool();
        break;

      case "currency":
        setupCurrency();
        break;

      case "food":
        setupFood();
        break;

      case "buy":
        setupBuy();
        break;

      case "random":
        setupRandom();
        break;

      case "password":
        setupPassword();
        break;

      case "qr":
        setupQR();
        break;

      case "color":
        setupColor();
        break;
    }

  } catch (error) {
    console.error(
      `Error en herramienta ${id}:`,
      error
    );
  }
}

/* =========================================================
   HERRAMIENTAS MATEMÁTICAS
   ========================================================= */

function setupCalculator() {

  const input = $("#calcInput");
  const result = $("#calcResult");
  const button = $("#calcBtn");
  const clear = $("#calcClear");

  button?.addEventListener("click", () => {

    try {

      const value =
        calculateExpression(input.value);

      result.textContent =
        formatNumber(value);

    } catch (error) {

      result.textContent =
        error.message;
    }
  });

  clear?.addEventListener("click", () => {

    input.value = "";
    result.textContent = "—";
    input.focus();
  });

  input?.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
      button?.click();
    }
  });
}

function setupPercentage() {

  $("#percentBtn")?.addEventListener("click", () => {

    const a = Number($("#percentA")?.value);
    const b = Number($("#percentB")?.value);

    const result = $("#percentResult");

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      result.textContent = "Introduce valores válidos.";
      return;
    }

    result.textContent =
      `${formatNumber((a / 100) * b)} de ${formatNumber(b)}`;
  });
}

function setupDiscount() {

  $("#discountBtn")?.addEventListener("click", () => {

    const price = Number($("#discountPrice")?.value);
    const percent = Number($("#discountPercent")?.value);

    const result = $("#discountResult");

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(percent)
    ) {
      result.textContent = "Introduce valores válidos.";
      return;
    }

    const saving = price * percent / 100;
    const finalPrice = price - saving;

    result.innerHTML = `
      Precio final: ${formatNumber(finalPrice)}<br>
      Ahorro: ${formatNumber(saving)}
    `;
  });
}

function setupTip() {

  $("#tipBtn")?.addEventListener("click", () => {

    const amount = Number($("#tipAmount")?.value);
    const percent = Number($("#tipPercent")?.value);

    const result = $("#tipResult");

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(percent)
    ) {
      result.textContent = "Introduce valores válidos.";
      return;
    }

    const tip = amount * percent / 100;
    const total = amount + tip;

    result.innerHTML = `
      Propina: ${formatNumber(tip)}<br>
      Total: ${formatNumber(total)}
    `;
  });
}

function setupSplitBill() {

  $("#splitBtn")?.addEventListener("click", () => {

    const amount = Number($("#splitAmount")?.value);
    const people = Number($("#splitPeople")?.value);

    const result = $("#splitResult");

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(people) ||
      people <= 0
    ) {
      result.textContent = "Introduce valores válidos.";
      return;
    }

    result.textContent =
      `Cada persona paga ${formatNumber(amount / people)}`;
  });
}

function setupAverage() {

  $("#averageBtn")?.addEventListener("click", () => {

    const input = $("#averageInput")?.value || "";

    const numbers = input
      .split(",")
      .map((item) => Number(item.trim()))
      .filter(Number.isFinite);

    const result = $("#averageResult");

    if (!numbers.length) {
      result.textContent = "Introduce números separados por comas.";
      return;
    }

    const average =
      numbers.reduce((a, b) => a + b, 0) /
      numbers.length;

    result.textContent =
      `Promedio: ${formatNumber(average)}`;
  });
}

function setupRule3() {

  $("#r3Btn")?.addEventListener("click", () => {

    const a = Number($("#r3a")?.value);
    const b = Number($("#r3b")?.value);
    const c = Number($("#r3c")?.value);

    const result = $("#r3Result");

    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      !Number.isFinite(c) ||
      a === 0
    ) {
      result.textContent = "Valores no válidos.";
      return;
    }

    result.textContent =
      `X = ${formatNumber((b * c) / a)}`;
  });
}

function setupChange() {

  $("#changeBtn")?.addEventListener("click", () => {

    const oldValue = Number($("#changeOld")?.value);
    const newValue = Number($("#changeNew")?.value);

    const result = $("#changeResult");

    if (
      !Number.isFinite(oldValue) ||
      !Number.isFinite(newValue) ||
      oldValue === 0
    ) {
      result.textContent = "Valores no válidos.";
      return;
    }

    const change =
      ((newValue - oldValue) / oldValue) * 100;

    const word =
      change >= 0
        ? "aumento"
        : "disminución";

    result.textContent =
      `${word}: ${formatNumber(Math.abs(change), 2)}%`;
  });
}

/* =========================================================
   CONVERSIONES
   ========================================================= */

function setupConversion() {

  $("#convertBtn")?.addEventListener("click", () => {

    const type =
      $("#convertBtn").dataset.convertType;

    const value =
      Number($("#convertValue")?.value);

    const from =
      $("#convertFrom")?.value;

    const to =
      $("#convertTo")?.value;

    const result =
      $("#convertResult");

    if (
      !Number.isFinite(value) ||
      !conversionData[type]
    ) {
      result.textContent =
        "Introduce un valor válido.";
      return;
    }

    const base =
      value * conversionData[type][from];

    const converted =
      base / conversionData[type][to];

    result.textContent =
      formatNumber(converted);
  });
}

function setupTemperature() {

  $("#tempBtn")?.addEventListener("click", () => {

    const value =
      Number($("#tempValue")?.value);

    const from =
      $("#tempFrom")?.value;

    const to =
      $("#tempTo")?.value;

    const result =
      $("#tempResult");

    if (!Number.isFinite(value)) {
      result.textContent =
        "Introduce un valor válido.";
      return;
    }

    let celsius;

    if (from === "c") celsius = value;
    if (from === "f") celsius = (value - 32) * 5 / 9;
    if (from === "k") celsius = value - 273.15;

    let converted;

    if (to === "c") converted = celsius;
    if (to === "f") converted = celsius * 9 / 5 + 32;
    if (to === "k") converted = celsius + 273.15;

    result.textContent =
      `${formatNumber(converted, 2)}°`;
  });
}

function setupBase() {

  $("#baseBtn")?.addEventListener("click", () => {

    const input =
      $("#baseInput")?.value.trim();

    const base =
      Number($("#baseFrom")?.value);

    const result =
      $("#baseResult");

    try {

      if (!input) {
        throw new Error("Escribe un número.");
      }

      const decimal =
        parseInt(input, base);

      if (!Number.isFinite(decimal)) {
        throw new Error("Número no válido.");
      }

      result.innerHTML = `
        Decimal: ${decimal}<br>
        Binario: ${decimal.toString(2)}<br>
        Octal: ${decimal.toString(8)}<br>
        Hexadecimal: ${decimal.toString(16).toUpperCase()}
      `;

    } catch (error) {
      result.textContent = error.message;
    }
  });
}

function setupTimeConvert() {

  $("#timeConvertBtn")?.addEventListener("click", () => {

    const value =
      Number($("#timeValue")?.value);

    const unit =
      $("#timeUnit")?.value;

    const result =
      $("#timeConvertResult");

    if (!Number.isFinite(value)) {
      result.textContent = "Valor no válido.";
      return;
    }

    const factors = {
      seconds: 1,
      minutes: 60,
      hours: 3600,
      days: 86400
    };

    const seconds =
      value * factors[unit];

    result.innerHTML = `
      Segundos: ${formatNumber(seconds)}<br>
      Minutos: ${formatNumber(seconds / 60)}<br>
      Horas: ${formatNumber(seconds / 3600)}<br>
      Días: ${formatNumber(seconds / 86400)}
    `;
  });
}

/* =========================================================
   FECHAS
   ========================================================= */

function setupDateDiff() {

  $("#dateDiffBtn")?.addEventListener("click", () => {

    const start =
      new Date($("#dateStart")?.value);

    const end =
      new Date($("#dateEnd")?.value);

    const result =
      $("#dateDiffResult");

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      result.textContent =
        "Selecciona ambas fechas.";
      return;
    }

    const days =
      Math.abs(
        Math.round(
          (end - start) /
          86400000
        )
      );

    result.textContent =
      `${days.toLocaleString("es-PE")} días`;
  });
}

function setupAge() {

  $("#ageBtn")?.addEventListener("click", () => {

    const value =
      $("#birthDate")?.value;

    const result =
      $("#ageResult");

    if (!value) {
      result.textContent =
        "Selecciona una fecha.";
      return;
    }

    const birth =
      new Date(`${value}T00:00:00`);

    const now =
      new Date();

    let age =
      now.getFullYear() -
      birth.getFullYear();

    const month =
      now.getMonth() -
      birth.getMonth();

    if (
      month < 0 ||
      (
        month === 0 &&
        now.getDate() < birth.getDate()
      )
    ) {
      age--;
    }

    if (age < 0 || age > 150) {
      result.textContent =
        "Fecha no válida.";
      return;
    }

    result.textContent =
      `Edad aproximada: ${age} años`;
  });
}

/* =========================================================
   RELOJ
   ========================================================= */

let clockInterval = null;

function setupClock() {

  const update = () => {

    const result =
      $("#clockResult");

    const date =
      $("#clockDate");

    if (!result) return;

    const now =
      new Date();

    result.textContent =
      now.toLocaleTimeString("es-PE");

    if (date) {
      date.textContent =
        now.toLocaleDateString(
          "es-PE",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          }
        );
    }
  };

  update();

  clearInterval(clockInterval);

  clockInterval =
    setInterval(update, 1000);
}

/* =========================================================
   COUNTDOWN
   ========================================================= */

let countdownInterval = null;

function setupCountdown() {

  $("#countdownBtn")?.addEventListener("click", () => {

    const input =
      $("#countdownDate")?.value;

    const result =
      $("#countdownResult");

    if (!input) {
      result.textContent =
        "Selecciona una fecha.";
      return;
    }

    const target =
      new Date(input).getTime();

    clearInterval(countdownInterval);

    const update = () => {

      const difference =
        target - Date.now();

      if (difference <= 0) {

        result.textContent =
          "¡Llegó el momento!";

        clearInterval(countdownInterval);

        return;
      }

      const seconds =
        Math.floor(
          difference / 1000
        );

      const days =
        Math.floor(seconds / 86400);

      const hours =
        Math.floor(
          (seconds % 86400) / 3600
        );

      const minutes =
        Math.floor(
          (seconds % 3600) / 60
        );

      const secs =
        seconds % 60;

      result.textContent =
        `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    update();

    countdownInterval =
      setInterval(update, 1000);
  });
}

/* =========================================================
   TEMPORIZADOR
   ========================================================= */

let timerInterval = null;

function setupTimer() {

  const result =
    $("#timerResult");

  const render = () => {

    let remaining =
      state.timer.remaining;

    if (
      state.timer.running &&
      state.timer.endAt
    ) {
      remaining =
        Math.max(
          0,
          Math.ceil(
            (state.timer.endAt - Date.now()) /
            1000
          )
        );

      state.timer.remaining =
        remaining;
    }

    if (result) {
      result.textContent =
        formatTime(remaining);
    }

    if (
      state.timer.running &&
      remaining <= 0
    ) {

      state.timer.running = false;

      saveState();

      showToast(
        "Temporizador terminado",
        "⏱"
      );
    }
  };

  const start = () => {

    const minutes =
      Number($("#timerMinutes")?.value || 0);

    const seconds =
      Number($("#timerSeconds")?.value || 0);

    if (
      !state.timer.remaining ||
      !state.timer.running
    ) {

      if (!state.timer.remaining) {
        state.timer.remaining =
          Math.max(
            0,
            minutes * 60 + seconds
          );
      }

      state.timer.endAt =
        Date.now() +
        state.timer.remaining * 1000;
    }

    if (state.timer.remaining <= 0) {
      showToast("Configura un tiempo.", "!");
      return;
    }

    state.timer.running = true;

    saveState();

    clearInterval(timerInterval);

    timerInterval =
      setInterval(render, 250);

    render();
  };

  const pause = () => {

    if (
      state.timer.running &&
      state.timer.endAt
    ) {
      state.timer.remaining =
        Math.max(
          0,
          Math.ceil(
            (state.timer.endAt - Date.now()) /
            1000
          )
        );
    }

    state.timer.running = false;
    state.timer.endAt = 0;

    saveState();

    render();
  };

  const reset = () => {

    state.timer.running = false;
    state.timer.endAt = 0;

    state.timer.remaining =
      Math.max(
        0,
        Number($("#timerMinutes")?.value || 0) * 60 +
        Number($("#timerSeconds")?.value || 0)
      );

    saveState();

    render();
  };

  $("#timerStart")?.addEventListener("click", start);
  $("#timerPause")?.addEventListener("click", pause);
  $("#timerReset")?.addEventListener("click", reset);

  if (state.timer.running) {

    clearInterval(timerInterval);

    timerInterval =
      setInterval(render, 250);
  }

  render();
}

/* =========================================================
   CRONÓMETRO
   ========================================================= */

let stopwatchInterval = null;

function setupStopwatch() {

  const result =
    $("#stopwatchResult");

  const getElapsed = () => {

    if (!state.stopwatch.running) {
      return state.stopwatch.elapsed;
    }

    return (
      state.stopwatch.elapsed +
      (
        Date.now() -
        state.stopwatch.startedAt
      )
    );
  };

  const render = () => {

    const elapsed =
      Math.max(
        0,
        getElapsed()
      );

    const seconds =
      Math.floor(elapsed / 1000);

    const hours =
      Math.floor(seconds / 3600);

    const minutes =
      Math.floor((seconds % 3600) / 60);

    const secs =
      seconds % 60;

    if (result) {
      result.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(secs).padStart(2, "0")}`;
    }
  };

  $("#stopwatchStart")?.addEventListener(
    "click",
    () => {

      if (!state.stopwatch.running) {

        state.stopwatch.startedAt =
          Date.now();

        state.stopwatch.running =
          true;

        saveState();

        clearInterval(stopwatchInterval);

        stopwatchInterval =
          setInterval(render, 250);
      }
    }
  );

  $("#stopwatchPause")?.addEventListener(
    "click",
    () => {

      if (state.stopwatch.running) {

        state.stopwatch.elapsed +=
          Date.now() -
          state.stopwatch.startedAt;

        state.stopwatch.running =
          false;

        saveState();

        clearInterval(stopwatchInterval);
      }

      render();
    }
  );

  $("#stopwatchReset")?.addEventListener(
    "click",
    () => {

      state.stopwatch = {
        running: false,
        elapsed: 0,
        startedAt: 0
      };

      saveState();

      clearInterval(stopwatchInterval);

      render();
    }
  );

  if (state.stopwatch.running) {

    clearInterval(stopwatchInterval);

    stopwatchInterval =
      setInterval(render, 250);
  }

  render();
}

/* =========================================================
   TEXTO
   ========================================================= */

function setupTextCounter() {

  const input =
    $("#textCounter");

  const result =
    $("#textResult");

  const update = () => {

    const text =
      input?.value || "";

    const characters =
      text.length;

    const words =
      text.trim()
        ? text.trim().split(/\s+/).length
        : 0;

    const lines =
      text
        ? text.split(/\r?\n/).length
        : 0;

    result.textContent =
      `${words} palabras · ` +
      `${characters} caracteres · ` +
      `${lines} líneas`;
  };

  input?.addEventListener(
    "input",
    update
  );

  update();
}

function setupCaseTool() {

  const input =
    $("#caseInput");

  const result =
    $("#caseResult");

  $("#upperBtn")?.addEventListener(
    "click",
    () => {
      result.value =
        input.value.toUpperCase();
    }
  );

  $("#lowerBtn")?.addEventListener(
    "click",
    () => {
      result.value =
        input.value.toLowerCase();
    }
  );

  $("#titleBtn")?.addEventListener(
    "click",
    () => {
      result.value =
        input.value
          .toLowerCase()
          .replace(
            /(^|\s)\S/g,
            (letter) => letter.toUpperCase()
          );
    }
  );
}

function setupReverse() {

  $("#reverseBtn")?.addEventListener(
    "click",
    () => {

      const input =
        $("#reverseInput")?.value || "";

      $("#reverseResult").value =
        [...input].reverse().join("");
    }
  );
}

function setupSlug() {

  $("#slugBtn")?.addEventListener(
    "click",
    () => {

      const input =
        $("#slugInput")?.value || "";

      const slug =
        input
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      $("#slugResult").textContent =
        slug || "—";
    }
  );
}

/* =========================================================
   DICCIONARIO
   ========================================================= */

async function setupDictionary() {

  const button =
    $("#dictionaryBtn");

  button?.addEventListener(
    "click",
    async () => {

      const input =
        $("#dictionaryInput");

      const result =
        $("#dictionaryResult");

      const word =
        input?.value.trim();

      if (!word) {
        result.innerHTML =
          "<strong>Escribe una palabra.</strong>";
        return;
      }

      result.innerHTML =
        "<strong>Buscando...</strong>";

      try {

        const controller =
          new AbortController();

        const timeout =
          setTimeout(
            () => controller.abort(),
            8000
          );

        const response =
          await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`,
            {
              signal: controller.signal
            }
          );

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error("No encontrada");
        }

        const data =
          await response.json();

        const entry =
          data[0];

        let html =
          `<strong>${escapeHTML(
            entry.word || word
          )}</strong>`;

        for (
          const meaning of
          entry.meanings || []
        ) {

          html += `
            <p>
              <b>${escapeHTML(
                meaning.partOfSpeech || ""
              )}</b>
            </p>
          `;

          for (
            const definition
            of (meaning.definitions || []).slice(0, 3)
          ) {

            html += `
              <p>
                • ${escapeHTML(
                  definition.definition || ""
                )}
              </p>
            `;
          }
        }

        result.innerHTML = html;

        state.dictionaryRecent = [
          word,
          ...state.dictionaryRecent.filter(
            (item) => item !== word
          )
        ].slice(0, 10);

        saveState();

      } catch (error) {

        result.innerHTML = `
          <strong>No se pudo encontrar la palabra.</strong>
          <p>
            Comprueba la escritura o la conexión.
          </p>
        `;
      }
    }
  );
}

/* =========================================================
   NOTAS
   ========================================================= */

function setupNotes() {

  const input =
    $("#notesInput");

  if (input) {
    input.value =
      state.notes || "";
  }

  $("#saveNotes")?.addEventListener(
    "click",
    () => {

      state.notes =
        input.value;

      saveState();

      showToast(
        "Notas guardadas",
        "✓"
      );
    }
  );

  $("#clearNotes")?.addEventListener(
    "click",
    () => {

      input.value = "";

      state.notes = "";

      saveState();

      showToast(
        "Notas eliminadas",
        "✓"
      );
    }
  );
}

/* =========================================================
   TAREAS
   ========================================================= */

function renderTasks() {

  const container =
    $("#taskList");

  if (!container) return;

  if (!state.tasks.length) {

    container.innerHTML = `
      <div class="toolResult">
        <strong>No hay tareas.</strong>
      </div>
    `;

    return;
  }

  container.innerHTML =
    state.tasks.map(
      (task, index) => `
        <div
          class="quickItem"
          style="margin-top:8px"
        >

          <input
            type="checkbox"
            data-task-check="${index}"
            ${task.done ? "checked" : ""}
          >

          <span
            style="
              flex:1;
              ${task.done ? "text-decoration:line-through;opacity:.5" : ""}
            "
          >
            ${escapeHTML(task.text)}
          </span>

          <button
            class="toolButton toolDanger"
            data-task-delete="${index}"
            type="button"
          >
            ×
          </button>

        </div>
      `
    ).join("");
}

function setupTasks() {

  renderTasks();

  $("#addTask")?.addEventListener(
    "click",
    () => {

      const input =
        $("#taskInput");

      const text =
        input?.value.trim();

      if (!text) return;

      state.tasks.push({
        text,
        done: false
      });

      input.value = "";

      saveState();

      renderTasks();
    }
  );

  $("#taskList")?.addEventListener(
    "click",
    (event) => {

      const deleteButton =
        event.target.closest(
          "[data-task-delete]"
        );

      if (deleteButton) {

        const index =
          Number(
            deleteButton.dataset.taskDelete
          );

        state.tasks.splice(index, 1);

        saveState();

        renderTasks();
      }
    }
  );

  $("#taskList")?.addEventListener(
    "change",
    (event) => {

      const checkbox =
        event.target.closest(
          "[data-task-check]"
        );

      if (!checkbox) return;

      const index =
        Number(
          checkbox.dataset.taskCheck
        );

      if (state.tasks[index]) {
        state.tasks[index].done =
          checkbox.checked;
      }

      saveState();

      renderTasks();
    }
  );
}

/* =========================================================
   LISTA DE COMPRAS
   ========================================================= */

function renderShopping() {

  const container =
    $("#shoppingList");

  if (!container) return;

  if (!state.shopping.length) {

    container.innerHTML = `
      <div class="toolResult">
        <strong>Lista vacía.</strong>
      </div>
    `;

    return;
  }

  container.innerHTML =
    state.shopping.map(
      (item, index) => `
        <div
          class="quickItem"
          style="margin-top:8px"
        >

          <input
            type="checkbox"
            data-shop-check="${index}"
            ${item.done ? "checked" : ""}
          >

          <span style="flex:1">
            ${escapeHTML(item.text)}
          </span>

          <button
            class="toolButton toolDanger"
            data-shop-delete="${index}"
            type="button"
          >
            ×
          </button>

        </div>
      `
    ).join("");
}

function setupShopping() {

  renderShopping();

  $("#addShopping")?.addEventListener(
    "click",
    () => {

      const input =
        $("#shoppingInput");

      const text =
        input?.value.trim();

      if (!text) return;

      state.shopping.push({
        text,
        done: false
      });

      input.value = "";

      saveState();

      renderShopping();
    }
  );

  $("#shoppingList")?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-shop-delete]"
        );

      if (!button) return;

      const index =
        Number(
          button.dataset.shopDelete
        );

      state.shopping.splice(index, 1);

      saveState();

      renderShopping();
    }
  );

  $("#shoppingList")?.addEventListener(
    "change",
    (event) => {

      const checkbox =
        event.target.closest(
          "[data-shop-check]"
        );

      if (!checkbox) return;

      const index =
        Number(
          checkbox.dataset.shopCheck
        );

      if (state.shopping[index]) {
        state.shopping[index].done =
          checkbox.checked;
      }

      saveState();

      renderShopping();
    }
  );
}

/* =========================================================
   CONCENTRACIÓN
   ========================================================= */

function setupFocusTool() {

  const button =
    $("#focusToolBtn");

  if (!button) return;

  button.addEventListener(
    "click",
    () => {

      state.focus =
        !state.focus;

      document.body.classList.toggle(
        "focusMode",
        state.focus
      );

      button.textContent =
        state.focus
          ? "Desactivar concentración"
          : "Activar concentración";

      saveState();

      showToast(
        state.focus
          ? "Modo concentración activado"
          : "Modo concentración desactivado",
        "◉"
      );
    }
  );
}

/* =========================================================
   MONEDAS
   ========================================================= */

async function setupCurrency() {

  $("#currencyBtn")?.addEventListener(
    "click",
    async () => {

      const amount =
        Number($("#currencyAmount")?.value);

      const from =
        $("#currencyFrom")?.value;

      const to =
        $("#currencyTo")?.value;

      const result =
        $("#currencyResult");

      if (
        !Number.isFinite(amount)
      ) {
        result.textContent =
          "Cantidad no válida.";
        return;
      }

      result.textContent =
        "Consultando tasa...";

      try {

        const controller =
          new AbortController();

        const timeout =
          setTimeout(
            () => controller.abort(),
            8000
          );

        const response =
          await fetch(
            `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
            {
              signal: controller.signal
            }
          );

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error("API");
        }

        const data =
          await response.json();

        const converted =
          data.rates?.[to];

        if (!Number.isFinite(converted)) {
          throw new Error("Resultado");
        }

        result.textContent =
          `${formatNumber(amount)} ${from} ≈ ` +
          `${formatNumber(converted, 4)} ${to}`;

      } catch (error) {

        result.textContent =
          "No se pudo consultar la tasa. Comprueba tu conexión.";
      }
    }
  );
}

/* =========================================================
   COMIDA
   ========================================================= */

function setupFood() {

  const getQuery = () =>
    ($("#foodInput")?.value.trim() ||
      "comida");

  $("#foodSearch")?.addEventListener(
    "click",
    () => {

      const query =
        encodeURIComponent(
          getQuery()
        );

      window.open(
        `https://www.google.com/search?q=${query}+comida`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  );

  $("#foodMaps")?.addEventListener(
    "click",
    () => {

      const query =
        encodeURIComponent(
          getQuery()
        );

      window.open(
        `https://www.google.com/maps/search/${query}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  );
}

/* =========================================================
   COMPRAS
   ========================================================= */

function setupBuy() {

  const getQuery = () =>
    ($("#buyInput")?.value.trim() ||
      "productos");

  $("#googleShopping")?.addEventListener(
    "click",
    () => {

      const query =
        encodeURIComponent(
          getQuery()
        );

      window.open(
        `https://www.google.com/search?tbm=shop&q=${query}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  );

  $("#mercadoLibre")?.addEventListener(
    "click",
    () => {

      const query =
        encodeURIComponent(
          getQuery()
        );

      window.open(
        `https://listado.mercadolibre.com.pe/${query}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  );
}

/* =========================================================
   ALEATORIO
   ========================================================= */

function setupRandom() {

  $("#randomBtn")?.addEventListener(
    "click",
    () => {

      let min =
        Number($("#randomMin")?.value);

      let max =
        Number($("#randomMax")?.value);

      const result =
        $("#randomResult");

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max)
      ) {
        result.textContent =
          "Valores no válidos.";
        return;
      }

      if (min > max) {
        [min, max] =
          [max, min];
      }

      result.textContent =
        String(
          randomInt(
            Math.ceil(min),
            Math.floor(max)
          )
        );
    }
  );
}

/* =========================================================
   CONTRASEÑAS
   ========================================================= */

function secureRandom(max) {

  if (
    window.crypto &&
    crypto.getRandomValues
  ) {

    const array =
      new Uint32Array(1);

    crypto.getRandomValues(array);

    return array[0] % max;
  }

  return Math.floor(
    Math.random() * max
  );
}

function generatePassword(length) {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789" +
    "!@#$%^&*_-+=";

  let password = "";

  for (let i = 0; i < length; i++) {

    password +=
      chars[
        secureRandom(chars.length)
      ];
  }

  return password;
}

function setupPassword() {

  $("#passwordBtn")?.addEventListener(
    "click",
    () => {

      const length =
        clamp(
          Number(
            $("#passwordLength")?.value || 16
          ),
          8,
          128
        );

      $("#passwordResult").textContent =
        generatePassword(length);
    }
  );

  $("#copyPassword")?.addEventListener(
    "click",
    async () => {

      const value =
        $("#passwordResult")?.textContent;

      if (
        !value ||
        value === "—"
      ) {
        showToast(
          "Primero genera una contraseña.",
          "!"
        );

        return;
      }

      try {

        await navigator.clipboard.writeText(
          value
        );

        showToast(
          "Contraseña copiada",
          "✓"
        );

      } catch {
        showToast(
          "No se pudo copiar.",
          "!"
        );
      }
    }
  );
}

/* =========================================================
   QR
   ========================================================= */

function setupQR() {

  $("#qrBtn")?.addEventListener(
    "click",
    () => {

      const input =
        $("#qrInput")?.value.trim();

      const result =
        $("#qrResult");

      if (!input) {

        result.innerHTML =
          "<strong>Escribe un texto o enlace.</strong>";

        return;
      }

      const encoded =
        encodeURIComponent(input);

      result.innerHTML = `
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}"
          alt="Código QR generado"
          style="
            display:block;
            width:220px;
            max-width:100%;
            margin:10px auto;
            border-radius:12px;
            background:#fff;
            padding:8px;
          "
        >
      `;
    }
  );
}

/* =========================================================
   COLOR
   ========================================================= */

function setupColor() {

  const input =
    $("#colorInput");

  const hex =
    $("#colorHex");

  const rgb =
    $("#colorRgb");

  const update = () => {

    const value =
      input.value.toUpperCase();

    const r =
      parseInt(value.slice(1, 3), 16);

    const g =
      parseInt(value.slice(3, 5), 16);

    const b =
      parseInt(value.slice(5, 7), 16);

    hex.textContent =
      value;

    rgb.textContent =
      `RGB(${r}, ${g}, ${b})`;
  };

  input?.addEventListener(
    "input",
    update
  );

  update();
}

/* =========================================================
   EVENTOS DE LA INTERFAZ
   ========================================================= */

function setupInterface() {

  $("#toolSearch")?.addEventListener(
    "input",
    (event) => {

      searchText =
        event.target.value.trim();

      renderTools();
    }
  );

  $("#categories")?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-category]"
        );

      if (!button) return;

      currentCategory =
        button.dataset.category;

      $$(".category").forEach(
        (item) => {
          item.classList.toggle(
            "active",
            item === button
          );
        }
      );

      renderTools();
    }
  );

  $("#toolGrid")?.addEventListener(
    "click",
    (event) => {

      const favorite =
        event.target.closest(
          "[data-favorite]"
        );

      if (favorite) {

        event.stopPropagation();

        toggleFavorite(
          favorite.dataset.favorite
        );

        return;
      }

      const card =
        event.target.closest(
          "[data-open]"
        );

      if (card) {
        openTool(card.dataset.open);
      }
    }
  );

  $("#toolGrid")?.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      const card =
        event.target.closest(
          "[data-open]"
        );

      if (!card) return;

      event.preventDefault();

      openTool(card.dataset.open);
    }
  );

  $("#quickTools")?.addEventListener(
    "click",
    (event) => {

      const item =
        event.target.closest(
          "[data-open]"
        );

      if (item) {
        openTool(item.dataset.open);
      }
    }
  );

  $("#clearRecentBtn")?.addEventListener(
    "click",
    clearRecent
  );

  $("#closeTool")?.addEventListener(
    "click",
    closeTool
  );

  $$(".toolPanelBackdrop").forEach(
    (item) => {
      item.addEventListener(
        "click",
        closeTool
      );
    }
  );

  $("#themeBtn")?.addEventListener(
    "click",
    toggleTheme
  );

  $("#motionBtn")?.addEventListener(
    "click",
    toggleMotion
  );

  $("#focusBtn")?.addEventListener(
    "click",
    toggleFocus
  );

  $("#exploreBtn")?.addEventListener(
    "click",
    () => {

      $("#herramientas")?.scrollIntoView({
        behavior: state.motion
          ? "smooth"
          : "auto"
      });
    }
  );

  $("#novaBtn")?.addEventListener(
    "click",
    () => {

      $("#novaSection")?.scrollIntoView({
        behavior: state.motion
          ? "smooth"
          : "auto"
      });
    }
  );

  $("#exportBtn")?.addEventListener(
    "click",
    exportData
  );

  $("#importBtn")?.addEventListener(
    "click",
    () => {
      $("#importFile")?.click();
    }
  );

  $("#importFile")?.addEventListener(
    "change",
    importData
  );

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {

        event.preventDefault();

        $("#toolSearch")?.focus();
      }

      if (event.key === "Escape") {
        closeTool();
        closeModal();
      }
    }
  );
}

/* =========================================================
   TEMA
   ========================================================= */

function applyTheme() {

  document.body.classList.toggle(
    "lightTheme",
    state.theme === "light"
  );
}

function toggleTheme() {

  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  applyTheme();

  saveState();

  showToast(
    state.theme === "dark"
      ? "Tema oscuro activado"
      : "Tema claro activado",
    "◐"
  );
}

/* =========================================================
   MOVIMIENTO
   ========================================================= */

function applyMotion() {

  document.body.classList.toggle(
    "noMotion",
    !state.motion
  );
}

function toggleMotion() {

  state.motion =
    !state.motion;

  applyMotion();

  saveState();

  showToast(
    state.motion
      ? "Animaciones activadas"
      : "Animaciones pausadas",
    "✦"
  );
}

/* =========================================================
   CONCENTRACIÓN GLOBAL
   ========================================================= */

function applyFocus() {

  document.body.classList.toggle(
    "focusMode",
    state.focus
  );
}

function toggleFocus() {

  state.focus =
    !state.focus;

  applyFocus();

  saveState();

  showToast(
    state.focus
      ? "Modo concentración activado"
      : "Modo concentración desactivado",
    "◉"
  );
}

/* =========================================================
   EXPORTAR / IMPORTAR
   ========================================================= */

function exportData() {

  try {

    const data =
      JSON.stringify(
        state,
        null,
        2
      );

    const blob =
      new Blob(
        [data],
        {
          type: "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "utilhub-v21-datos.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast(
      "Datos exportados",
      "↓"
    );

  } catch (error) {

    showToast(
      "No se pudieron exportar los datos.",
      "!"
    );
  }
}

function importData(event) {

  const file =
    event.target.files?.[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = () => {

    try {

      const imported =
        JSON.parse(
          reader.result
        );

      state =
        normalizeState(imported);

      saveState();

      applyTheme();
      applyMotion();
      applyFocus();

      renderTools();
      renderQuickTools();

      showToast(
        "Datos importados correctamente",
        "✓"
      );

    } catch (error) {

      showToast(
        "El archivo no es válido.",
        "!"
      );
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

/* =========================================================
   NOVA FLOW 5.0
   ========================================================= */

const canvas =
  $("#nova");

const ctx =
  canvas?.getContext("2d");

let dpr = 1;
let width = window.innerWidth;
let height = window.innerHeight;

let novaParticles = [];
let novaStars = [];
let novaRings = [];

let pointerX =
  width / 2;

let pointerY =
  height / 2;

let lastFrame =
  performance.now();

let fpsValue = 60;

let frameCounter = 0;
let fpsTimer = performance.now();

/* =========================================================
   80 MODOS
   ========================================================= */

const NOVA_MODES = [

  "cosmic",
  "aurora",
  "pulse",
  "matrix",
  "nebula",
  "waves",
  "starfield",
  "vortex",
  "firefly",
  "rain",
  "grid",
  "spiral",
  "orbit",
  "plasma",
  "dna",
  "snow",
  "lightning",
  "galaxy",
  "comet",
  "quantum",

  "solar",
  "meteor",
  "bubbles",
  "hexgrid",
  "ripples",
  "sparks",
  "petals",
  "constellation",
  "tunnel",
  "rings",
  "glitch",
  "spectrum",
  "fractal",
  "satellites",
  "electric",
  "chrono",
  "particles",
  "mandala",
  "eclipse",
  "crystal",

  "hologram",
  "portal",
  "rainbow",
  "circuits",
  "digitalfire",
  "luminous",
  "ringspace",
  "sunset",
  "deepsea",
  "lava",
  "clouds",
  "wind",
  "magnet",
  "atom",
  "tachyon",
  "dimension",
  "dream",
  "rainbowwave",
  "cosmicdust",
  "energy",

  "portalstorm",
  "quantumwave",
  "stardust",
  "neoncity",
  "cybergrid",
  "lightwave",
  "fireworks",
  "snowstorm",
  "starburst",
  "blackhole",
  "wormhole",
  "supernova",
  "auroraflow",
  "crystalstorm",
  "galaxyspin",
  "neonrain",
  "stargate",
  "energycore",
  "void",
  "nova"

];

function resizeNova() {

  if (!canvas || !ctx) return;

  width =
    window.innerWidth;

  height =
    window.innerHeight;

  dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  canvas.width =
    Math.floor(width * dpr);

  canvas.height =
    Math.floor(height * dpr);

  canvas.style.width =
    `${width}px`;

  canvas.style.height =
    `${height}px`;

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  createNovaParticles();
}

function getParticleCount() {

  const area =
    width * height;

  const base =
    Math.floor(
      area / 15000
    );

  if (state.performance === "high") {
    return clamp(base + 40, 100, 300);
  }

  if (state.performance === "performance") {
    return clamp(
      Math.floor(base * 0.45),
      35,
      100
    );
  }

  return clamp(base, 60, 180);
}

function createNovaParticles() {

  const count =
    getParticleCount();

  novaParticles = [];

  for (let i = 0; i < count; i++) {

    novaParticles.push({
      x: random(0, width),
      y: random(0, height),

      vx: random(-0.35, 0.35),
      vy: random(-0.35, 0.35),

      r: random(0.5, 2.4),

      a: random(0.15, 0.85),

      phase: random(0, Math.PI * 2),

      hue: random(175, 330)
    });
  }

  novaStars = [];

  for (
    let i = 0;
    i < Math.floor(count * 0.65);
    i++
  ) {

    novaStars.push({
      x: random(-width, width),
      y: random(-height, height),

      z: random(0.1, 1),

      size: random(0.4, 2.2),

      phase: random(
        0,
        Math.PI * 2
      )
    });
  }

  novaRings = [];

  for (let i = 0; i < 16; i++) {

    novaRings.push({
      radius: random(30, 400),

      speed: random(
        -0.002,
        0.002
      ),

      phase: random(
        0,
        Math.PI * 2
      )
    });
  }
}

/* =========================================================
   CANVAS HELPERS
   ========================================================= */

function clearNova(alpha = 0.18) {

  ctx.fillStyle =
    `rgba(5,9,20,${alpha})`;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}

function glowCircle(
  x,
  y,
  radius,
  color,
  alpha = 1
) {

  const gradient =
    ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      radius
    );

  gradient.addColorStop(
    0,
    color.replace("ALPHA", String(alpha))
  );

  gradient.addColorStop(
    1,
    color.replace("ALPHA", "0")
  );

  ctx.fillStyle =
    gradient;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

function drawDot(
  x,
  y,
  radius,
  color,
  alpha = 1
) {

  ctx.globalAlpha =
    alpha;

  ctx.fillStyle =
    color;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    1;
}

function drawLine(
  x1,
  y1,
  x2,
  y2,
  color,
  widthValue = 1,
  alpha = 1
) {

  ctx.globalAlpha =
    alpha;

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    widthValue;

  ctx.beginPath();

  ctx.moveTo(
    x1,
    y1
  );

  ctx.lineTo(
    x2,
    y2
  );

  ctx.stroke();

  ctx.globalAlpha =
    1;
}

function drawRing(
  x,
  y,
  radius,
  color,
  alpha = 1,
  lineWidth = 1
) {

  ctx.globalAlpha =
    alpha;

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    lineWidth;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.globalAlpha =
    1;
}

function hsl(
  hue,
  saturation = 90,
  lightness = 65,
  alpha = 1
) {

  return `
    hsla(
      ${hue},
      ${saturation}%,
      ${lightness}%,
      ${alpha}
    )
  `;
}

function centerX() {
  return width / 2;
}

function centerY() {
  return height / 2;
}

/* =========================================================
   MODO 1 — COSMIC
   ========================================================= */

function modeCosmic(t) {

  clearNova(0.13);

  const cx =
    centerX() +
    (pointerX - centerX()) * 0.02;

  const cy =
    centerY() +
    (pointerY - centerY()) * 0.02;

  glowCircle(
    cx,
    cy,
    Math.min(width, height) * 0.42,
    "rgba(110,231,255,ALPHA)",
    0.13
  );

  for (const star of novaStars) {

    const x =
      cx +
      Math.sin(t * 0.0001 + star.phase) *
      width * 0.42 *
      star.z;

    const y =
      cy +
      Math.cos(t * 0.00013 + star.phase) *
      height * 0.42 *
      star.z;

    const alpha =
      0.25 +
      Math.sin(
        t * 0.002 + star.phase
      ) * 0.25;

    drawDot(
      x,
      y,
      star.size,
      "#dffaff",
      alpha
    );
  }
}

/* =========================================================
   MODO 2 — AURORA
   ========================================================= */

function modeAurora(t) {

  clearNova(0.12);

  for (let band = 0; band < 7; band++) {

    ctx.beginPath();

    for (
      let x = -30;
      x <= width + 30;
      x += 12
    ) {

      const wave =
        Math.sin(
          x * 0.006 +
          t * 0.0007 +
          band
        ) * 55;

      const wave2 =
        Math.sin(
          x * 0.014 -
          t * 0.0004
        ) * 22;

      const y =
        height * 0.32 +
        band * 45 +
        wave +
        wave2;

      if (x === -30) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        170 + band * 24,
        85,
        65,
        0.12
      );

    ctx.lineWidth =
      22;

    ctx.stroke();
  }
}

/* =========================================================
   MODO 3 — PULSE
   ========================================================= */

function modePulse(t) {

  clearNova(0.16);

  const cx = centerX();
  const cy = centerY();

  const pulse =
    40 +
    Math.sin(t * 0.004) * 25;

  for (let i = 0; i < 12; i++) {

    const radius =
      pulse +
      i * 38 +
      (t * 0.04) % 38;

    const alpha =
      0.16 *
      (1 - (radius % 456) / 456);

    drawRing(
      cx,
      cy,
      radius,
      hsl(
        185 + i * 8,
        90,
        65
      ),
      alpha,
      1.5
    );
  }
}

/* =========================================================
   MODO 4 — MATRIX
   ========================================================= */

function modeMatrix(t) {

  clearNova(0.21);

  ctx.font =
    "12px monospace";

  const columns =
    Math.floor(width / 22);

  for (let i = 0; i < columns; i++) {

    const x = i * 22;

    const y =
      ((t * (0.08 + (i % 5) * 0.018)) +
        i * 83) %
      (height + 150) -
      100;

    const chars =
      "01◇△▽╳+×";

    for (let j = 0; j < 8; j++) {

      const char =
        chars[
          randomInt(
            0,
            chars.length - 1
          )
        ];

      ctx.fillStyle =
        hsl(
          140,
          80,
          60,
          0.08 + j * 0.018
        );

      ctx.fillText(
        char,
        x,
        y - j * 18
      );
    }
  }
}

/* =========================================================
   MODO 5 — NEBULA
   ========================================================= */

function modeNebula(t) {

  clearNova(0.08);

  for (let i = 0; i < 8; i++) {

    const x =
      width *
        (0.18 + i * 0.1) +
      Math.sin(
        t * 0.0003 + i
      ) * 100;

    const y =
      height *
        (0.25 + (i % 4) * 0.16) +
      Math.cos(
        t * 0.00025 + i
      ) * 80;

    glowCircle(
      x,
      y,
      180 + i * 15,
      hsl(
        240 + i * 20,
        80,
        65,
        0.055
      )
    );
  }
}

/* =========================================================
   MODO 6 — WAVES
   ========================================================= */

function modeWaves(t) {

  clearNova(0.13);

  for (let row = 0; row < 12; row++) {

    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += 12
    ) {

      const y =
        height * 0.25 +
        row * 45 +
        Math.sin(
          x * 0.012 +
          t * 0.001 +
          row * 0.45
        ) * 28;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        185 + row * 8,
        90,
        65,
        0.12
      );

    ctx.lineWidth =
      1.2;

    ctx.stroke();
  }
}

/* =========================================================
   MODO 7 — STARFIELD
   ========================================================= */

function modeStarfield(t) {

  clearNova(0.14);

  const cx = centerX();
  const cy = centerY();

  for (const star of novaStars) {

    const speed =
      0.0007 *
      star.z;

    const angle =
      star.phase +
      t * speed;

    const distance =
      (
        ((t * 0.04 * star.z) +
          star.x * star.z) %
        (Math.max(width, height) * 0.9)
      );

    const x =
      cx +
      Math.cos(angle) *
      distance;

    const y =
      cy +
      Math.sin(angle) *
      distance;

    drawDot(
      x,
      y,
      star.size + star.z,
      "#ffffff",
      0.3 * star.z
    );
  }
}

/* =========================================================
   MODO 8 — VORTEX
   ========================================================= */

function modeVortex(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 260; i++) {

    const p =
      i / 260;

    const angle =
      i * 0.32 +
      t * 0.0012;

    const radius =
      p *
      Math.min(width, height) *
      0.52;

    const x =
      cx +
      Math.cos(angle) * radius;

    const y =
      cy +
      Math.sin(angle) * radius;

    drawDot(
      x,
      y,
      1 + p * 2,
      hsl(
        180 + p * 130,
        90,
        65
      ),
      0.12 + p * 0.3
    );
  }
}

/* =========================================================
   MODO 9 — FIREFLY
   ========================================================= */

function modeFirefly(t) {

  clearNova(0.08);

  for (let i = 0; i < novaParticles.length; i++) {

    const p =
      novaParticles[i];

    const x =
      p.x +
      Math.sin(
        t * 0.0008 +
        p.phase
      ) * 35;

    const y =
      p.y +
      Math.cos(
        t * 0.0006 +
        p.phase
      ) * 30;

    const alpha =
      0.15 +
      (
        Math.sin(
          t * 0.003 +
          p.phase
        ) + 1
      ) * 0.35;

    glowCircle(
      x,
      y,
      14,
      "rgba(250,204,21,ALPHA)",
      alpha * 0.3
    );

    drawDot(
      x,
      y,
      p.r,
      "#fde68a",
      alpha
    );
  }
}

/* =========================================================
   MODO 10 — RAIN
   ========================================================= */

function modeRain(t) {

  clearNova(0.2);

  const drops =
    getParticleCount();

  for (let i = 0; i < drops; i++) {

    const x =
      (i * 47) %
      width;

    const y =
      (i * 91 +
        t * 0.35 *
        (1 + i % 4 * 0.15)) %
      (height + 100) -
      50;

    drawLine(
      x,
      y,
      x - 3,
      y + 18,
      "rgba(110,231,255,0.22)",
      1
    );
  }
}

/* =========================================================
   MODO 11 — GRID
   ========================================================= */

function modeGrid(t) {

  clearNova(0.16);

  const size = 55;

  const offset =
    (t * 0.015) % size;

  for (
    let x = -size + offset;
    x < width + size;
    x += size
  ) {

    drawLine(
      x,
      0,
      x,
      height,
      "rgba(110,231,255,0.08)"
    );
  }

  for (
    let y = -size + offset;
    y < height + size;
    y += size
  ) {

    drawLine(
      0,
      y,
      width,
      y,
      "rgba(139,92,246,0.07)"
    );
  }
}

/* =========================================================
   MODO 12 — SPIRAL
   ========================================================= */

function modeSpiral(t) {

  clearNova(0.13);

  const cx = centerX();
  const cy = centerY();

  ctx.beginPath();

  for (
    let i = 0;
    i < 900;
    i += 3
  ) {

    const angle =
      i * 0.08 +
      t * 0.001;

    const radius =
      i * 0.25;

    const x =
      cx +
      Math.cos(angle) * radius;

    const y =
      cy +
      Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle =
    "rgba(139,92,246,0.22)";

  ctx.lineWidth = 1.4;

  ctx.stroke();
}

/* =========================================================
   MODO 13 — ORBIT
   ========================================================= */

function modeOrbit(t) {

  clearNova(0.13);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 8; i++) {

    const radius =
      50 + i * 40;

    drawRing(
      cx,
      cy,
      radius,
      hsl(
        180 + i * 20,
        90,
        65
      ),
      0.12
    );

    const angle =
      t * 0.001 *
      (i % 2 ? -1 : 1) +
      i;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius;

    drawDot(
      x,
      y,
      3 + i * 0.3,
      "#ffffff",
      0.7
    );
  }
}

/* =========================================================
   MODO 14 — PLASMA
   ========================================================= */

function modePlasma(t) {

  clearNova(0.12);

  for (let x = 0; x < width; x += 12) {

    const y =
      height / 2 +
      Math.sin(
        x * 0.009 +
        t * 0.001
      ) * 100 +
      Math.sin(
        x * 0.021 -
        t * 0.0007
      ) * 45;

    glowCircle(
      x,
      y,
      24,
      hsl(
        190 + x * 0.05,
        90,
        65,
        0.07
      )
    );
  }
}

/* =========================================================
   MODO 15 — DNA
   ========================================================= */

function modeDNA(t) {

  clearNova(0.14);

  const center =
    width / 2;

  for (
    let y = -30;
    y < height + 30;
    y += 12
  ) {

    const phase =
      y * 0.045 +
      t * 0.002;

    const x1 =
      center +
      Math.sin(phase) *
      120;

    const x2 =
      center +
      Math.sin(phase + Math.PI) *
      120;

    drawDot(
      x1,
      y,
      2.5,
      "#6ee7ff",
      0.55
    );

    drawDot(
      x2,
      y,
      2.5,
      "#ec4899",
      0.55
    );

    drawLine(
      x1,
      y,
      x2,
      y,
      "rgba(139,92,246,0.15)"
    );
  }
}

/* =========================================================
   MODO 16 — SNOW
   ========================================================= */

function modeSnow(t) {

  clearNova(0.12);

  for (let i = 0; i < getParticleCount(); i++) {

    const x =
      (
        i * 71 +
        Math.sin(t * 0.0005 + i) * 30
      ) %
      width;

    const y =
      (
        i * 49 +
        t * (0.025 + i % 4 * 0.008)
      ) %
      (height + 50);

    drawDot(
      x,
      y,
      1 + i % 3,
      "#e8f8ff",
      0.4
    );
  }
}

/* =========================================================
   MODO 17 — LIGHTNING
   ========================================================= */

function modeLightning(t) {

  clearNova(0.2);

  const flash =
    Math.sin(t * 0.004) > 0.96;

  if (flash) {

    ctx.fillStyle =
      "rgba(255,255,255,0.08)";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  for (let i = 0; i < 4; i++) {

    let x =
      random(
        width * 0.2,
        width * 0.8
      );

    let y = 0;

    ctx.beginPath();

    ctx.moveTo(x, y);

    while (y < height) {

      x += random(-35, 35);
      y += random(25, 75);

      ctx.lineTo(x, y);
    }

    ctx.strokeStyle =
      "rgba(110,231,255,0.18)";

    ctx.lineWidth = 1;

    ctx.stroke();
  }
}

/* =========================================================
   MODO 18 — GALAXY
   ========================================================= */

function modeGalaxy(t) {

  clearNova(0.1);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 500; i++) {

    const angle =
      i * 0.21 +
      t * 0.00015;

    const radius =
      Math.sqrt(i / 500) *
      Math.min(width, height) *
      0.5;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius *
      0.45;

    drawDot(
      x,
      y,
      0.7 + random(0, 1.2),
      hsl(
        190 + radius * 0.08,
        85,
        70
      ),
      0.35
    );
  }
}

/* =========================================================
   MODO 19 — COMET
   ========================================================= */

function modeComet(t) {

  clearNova(0.14);

  const cycle =
    (t * 0.00015) % 1;

  const x =
    -150 +
    cycle *
    (width + 300);

  const y =
    height * 0.35 +
    Math.sin(
      cycle * Math.PI * 2
    ) *
    height * 0.25;

  for (let i = 0; i < 25; i++) {

    drawDot(
      x - i * 8,
      y - i * 2,
      3 - i * 0.08,
      "#6ee7ff",
      0.25 - i * 0.008
    );
  }

  glowCircle(
    x,
    y,
    50,
    "rgba(110,231,255,ALPHA)",
    0.15
  );
}

/* =========================================================
   MODO 20 — QUANTUM
   ========================================================= */

function modeQuantum(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 180; i++) {

    const angle =
      i * 0.71 +
      t * 0.001;

    const radius =
      60 +
      Math.sin(
        t * 0.002 +
        i
      ) *
      70 +
      i * 0.7;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius;

    drawDot(
      x,
      y,
      1.2,
      hsl(
        220 + i % 100,
        90,
        70
      ),
      0.45
    );
  }
}

/* =========================================================
   MODOS 21 — 40
   ========================================================= */

function modeSolar(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  glowCircle(
    cx,
    cy,
    100,
    "rgba(250,204,21,ALPHA)",
    0.3
  );

  drawDot(
    cx,
    cy,
    55 + Math.sin(t * 0.003) * 8,
    "#facc15",
    0.8
  );

  for (let i = 0; i < 7; i++) {

    const angle =
      t * 0.0007 * (i + 1) + i;

    const radius =
      100 + i * 45;

    drawRing(
      cx,
      cy,
      radius,
      hsl(
        35 + i * 12,
        90,
        65
      ),
      0.14
    );

    drawDot(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      3,
      "#fff4b0",
      0.7
    );
  }
}

function modeMeteor(t) {

  clearNova(0.14);

  for (let i = 0; i < 10; i++) {

    const progress =
      ((t * 0.00018 + i * 0.13) % 1);

    const x =
      progress * (width + 250) - 125;

    const y =
      -100 +
      progress * (height + 300);

    drawDot(
      x,
      y,
      3,
      "#ffffff",
      0.8
    );

    for (let j = 1; j < 16; j++) {

      drawDot(
        x - j * 6,
        y - j * 5,
        2,
        "#6ee7ff",
        0.12
      );
    }
  }
}

function modeBubbles(t) {

  clearNova(0.1);

  for (let i = 0; i < 45; i++) {

    const x =
      (i * 73 +
        Math.sin(t * 0.0005 + i) * 40) %
      width;

    const y =
      height -
      (
        i * 31 +
        t * (0.025 + i % 3 * 0.01)
      ) %
      (height + 100);

    const r =
      5 + (i % 8) * 2;

    drawRing(
      x,
      y,
      r,
      hsl(
        180 + i * 5,
        90,
        70
      ),
      0.18
    );
  }
}

function modeHexgrid(t) {

  clearNova(0.16);

  const size = 48;
  const h = size * 0.86;

  for (let row = -1; row < height / h + 2; row++) {

    for (let col = -1; col < width / size + 2; col++) {

      const x =
        col * size +
        (row % 2) * size / 2;

      const y =
        row * h;

      ctx.beginPath();

      for (let k = 0; k < 6; k++) {

        const a =
          Math.PI / 3 * k;

        const px =
          x + Math.cos(a) * size * 0.42;

        const py =
          y + Math.sin(a) * size * 0.42;

        if (k === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();

      ctx.strokeStyle =
        "rgba(110,231,255,0.075)";

      ctx.stroke();
    }
  }
}

function modeRipples(t) {

  clearNova(0.12);

  const cx =
    centerX() +
    Math.sin(t * 0.0005) * 120;

  const cy =
    centerY() +
    Math.cos(t * 0.0004) * 70;

  for (let i = 0; i < 14; i++) {

    const radius =
      ((t * 0.07 + i * 65) % 700);

    drawRing(
      cx,
      cy,
      radius,
      hsl(
        185 + i * 9,
        90,
        68
      ),
      Math.max(
        0,
        0.2 - radius / 5000
      )
    );
  }
}

function modeSparks(t) {

  clearNova(0.17);

  for (let i = 0; i < 120; i++) {

    const angle =
      random(0, Math.PI * 2);

    const radius =
      random(10, Math.min(width, height) * 0.5);

    const speed =
      0.0002 + random(0, 0.001);

    const x =
      centerX() +
      Math.cos(angle + t * speed) *
      radius;

    const y =
      centerY() +
      Math.sin(angle + t * speed) *
      radius;

    drawDot(
      x,
      y,
      random(0.5, 2),
      hsl(
        random(180, 320),
        90,
        70
      ),
      0.4
    );
  }
}

function modePetals(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  ctx.beginPath();

  for (let i = 0; i <= 360; i += 2) {

    const a =
      i * Math.PI / 180;

    const r =
      150 +
      Math.sin(a * 8 + t * 0.001) * 55;

    const x =
      cx + Math.cos(a) * r;

    const y =
      cy + Math.sin(a) * r;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();

  ctx.strokeStyle =
    "rgba(236,72,153,0.25)";

  ctx.stroke();
}

function modeConstellation(t) {

  clearNova(0.11);

  const points = novaStars.slice(0, 70);

  for (const a of points) {

    const x =
      (a.x + width) % width;

    const y =
      (a.y + height) % height;

    drawDot(
      x,
      y,
      1.5,
      "#ffffff",
      0.45
    );
  }

  for (let i = 0; i < points.length; i++) {

    for (let j = i + 1; j < points.length; j++) {

      const a = points[i];
      const b = points[j];

      const x1 =
        (a.x + width) % width;

      const y1 =
        (a.y + height) % height;

      const x2 =
        (b.x + width) % width;

      const y2 =
        (b.y + height) % height;

      const d =
        Math.hypot(
          x2 - x1,
          y2 - y1
        );

      if (d < 130) {

        drawLine(
          x1,
          y1,
          x2,
          y2,
          "rgba(110,231,255,0.055)"
        );
      }
    }
  }
}

function modeTunnel(t) {

  clearNova(0.14);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 30; i++) {

    const p =
      ((i * 0.045 + t * 0.00015) % 1);

    const size =
      30 + p * Math.max(width, height);

    drawRing(
      cx,
      cy,
      size,
      hsl(
        180 + i * 5,
        90,
        65
      ),
      0.1
    );
  }
}

function modeRings(t) {

  clearNova(0.13);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 25; i++) {

    const radius =
      20 +
      i * 25 +
      Math.sin(
        t * 0.001 +
        i
      ) * 10;

    drawRing(
      cx,
      cy,
      radius,
      hsl(
        200 + i * 6,
        85,
        65
      ),
      0.09
    );
  }
}

function modeGlitch(t) {

  clearNova(0.22);

  for (let i = 0; i < 70; i++) {

    const y =
      random(0, height);

    const x =
      random(0, width);

    const w =
      random(10, 150);

    drawLine(
      x,
      y,
      x + w,
      y,
      hsl(
        random(170, 330),
        90,
        65
      ),
      random(1, 3),
      random(0.05, 0.18)
    );
  }
}

function modeSpectrum(t) {

  clearNova(0.12);

  for (let x = 0; x < width; x += 5) {

    const hue =
      (x / width) * 360 +
      t * 0.03;

    const y =
      height / 2 +
      Math.sin(
        x * 0.02 +
        t * 0.001
      ) * 100;

    drawDot(
      x,
      y,
      2,
      hsl(
        hue,
        90,
        65
      ),
      0.45
    );
  }
}

function modeFractal(t) {

  clearNova(0.11);

  const cx = centerX();
  const cy = centerY();

  for (let branch = 0; branch < 18; branch++) {

    let x = cx;
    let y = cy;

    let angle =
      branch *
      Math.PI *
      2 /
      18 +
      t * 0.0002;

    for (let depth = 0; depth < 9; depth++) {

      const length =
        12 * Math.pow(1.38, depth);

      const nx =
        x + Math.cos(angle) * length;

      const ny =
        y + Math.sin(angle) * length;

      drawLine(
        x,
        y,
        nx,
        ny,
        hsl(
          180 + branch * 8,
          85,
          65
        ),
        1,
        0.07
      );

      x = nx;
      y = ny;

      angle +=
        Math.sin(
          depth * 1.7 +
          branch
        ) * 0.45;
    }
  }
}

function modeSatellites(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  drawDot(
    cx,
    cy,
    28,
    "#8b5cf6",
    0.45
  );

  for (let i = 0; i < 6; i++) {

    const radius =
      90 + i * 45;

    drawRing(
      cx,
      cy,
      radius,
      "rgba(110,231,255,0.09)"
    );

    const angle =
      t * 0.0007 *
      (i % 2 ? -1 : 1) +
      i;

    const x =
      cx +
      Math.cos(angle) * radius;

    const y =
      cy +
      Math.sin(angle) * radius;

    drawDot(
      x,
      y,
      4,
      "#6ee7ff",
      0.75
    );
  }
}

function modeElectric(t) {

  clearNova(0.17);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 12; i++) {

    let x = cx;
    let y = cy;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let j = 0; j < 12; j++) {

      x +=
        random(-45, 45);

      y +=
        random(-45, 45);

      ctx.lineTo(x, y);
    }

    ctx.strokeStyle =
      hsl(
        180 + i * 10,
        90,
        70,
        0.12
      );

    ctx.stroke();
  }
}

function modeChrono(t) {

  clearNova(0.14);

  const cx = centerX();
  const cy = centerY();

  const radius =
    Math.min(width, height) * 0.22;

  drawRing(
    cx,
    cy,
    radius,
    "rgba(110,231,255,0.2)",
    1,
    2
  );

  for (let i = 0; i < 12; i++) {

    const a =
      i * Math.PI / 6;

    const x1 =
      cx +
      Math.cos(a) *
      (radius - 8);

    const y1 =
      cy +
      Math.sin(a) *
      (radius - 8);

    const x2 =
      cx +
      Math.cos(a) *
      (radius - 20);

    const y2 =
      cy +
      Math.sin(a) *
      (radius - 20);

    drawLine(
      x1,
      y1,
      x2,
      y2,
      "#6ee7ff",
      2,
      0.35
    );
  }

  const second =
    (t * 0.006) %
    (Math.PI * 2);

  drawLine(
    cx,
    cy,
    cx +
      Math.cos(second) *
      radius * 0.8,
    cy +
      Math.sin(second) *
      radius * 0.8,
    "#ec4899",
    2,
    0.65
  );
}

function modeParticles(t) {

  clearNova(0.12);

  for (const p of novaParticles) {

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;

    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    drawDot(
      p.x,
      p.y,
      p.r,
      hsl(
        p.hue,
        90,
        70
      ),
      p.a
    );
  }
}

function modeMandala(t) {

  clearNova(0.11);

  const cx = centerX();
  const cy = centerY();

  ctx.save();

  ctx.translate(cx, cy);

  ctx.rotate(t * 0.0001);

  for (let ring = 1; ring <= 7; ring++) {

    const radius =
      ring * 35;

    ctx.beginPath();

    for (
      let i = 0;
      i <= 360;
      i += 4
    ) {

      const a =
        i * Math.PI / 180;

      const r =
        radius +
        Math.sin(
          a * ring +
          t * 0.001
        ) *
        12;

      const x =
        Math.cos(a) * r;

      const y =
        Math.sin(a) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        180 + ring * 15,
        90,
        65,
        0.13
      );

    ctx.stroke();
  }

  ctx.restore();
}

function modeEclipse(t) {

  clearNova(0.13);

  const cx =
    centerX() +
    Math.sin(t * 0.0003) * 120;

  const cy =
    centerY();

  glowCircle(
    cx,
    cy,
    130,
    "rgba(139,92,246,ALPHA)",
    0.12
  );

  drawDot(
    cx,
    cy,
    70,
    "#030712",
    1
  );

  drawRing(
    cx,
    cy,
    78,
    "#8b5cf6",
    0.3,
    2
  );
}

function modeCrystal(t) {

  clearNova(0.13);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 12; i++) {

    const a =
      i * Math.PI / 6 +
      t * 0.00015;

    const length =
      80 + (i % 4) * 50;

    drawLine(
      cx,
      cy,
      cx + Math.cos(a) * length,
      cy + Math.sin(a) * length,
      hsl(
        180 + i * 10,
        90,
        70
      ),
      2,
      0.14
    );
  }
}

/* =========================================================
   MODOS 41 — 60
   ========================================================= */

function modeHologram(t) {

  clearNova(0.15);

  const cx = centerX();
  const cy = centerY();

  for (let i = -10; i <= 10; i++) {

    const y =
      cy +
      i * 9 +
      Math.sin(
        t * 0.002 +
        i
      ) * 5;

    drawLine(
      cx - 150,
      y,
      cx + 150,
      y,
      hsl(
        180 + i * 5,
        90,
        70
      ),
      1,
      0.12
    );
  }

  drawRing(
    cx,
    cy,
    100,
    "#6ee7ff",
    0.16,
    2
  );
}

function modePortal(t) {

  clearNova(0.13);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 20; i++) {

    const radius =
      20 + i * 20;

    const rotation =
      t * 0.0005 *
      (i % 2 ? -1 : 1);

    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    drawRing(
      0,
      0,
      radius,
      hsl(
        190 + i * 7,
        90,
        65
      ),
      0.12
    );

    ctx.restore();
  }
}

function modeRainbow(t) {

  clearNova(0.1);

  for (let i = 0; i < 7; i++) {

    const y =
      height * 0.2 +
      i * 48;

    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += 10
    ) {

      const yy =
        y +
        Math.sin(
          x * 0.009 +
          t * 0.001 +
          i
        ) * 35;

      if (x === 0) {
        ctx.moveTo(x, yy);
      } else {
        ctx.lineTo(x, yy);
      }
    }

    ctx.strokeStyle =
      hsl(
        i * 50 +
        t * 0.03,
        90,
        65,
        0.16
      );

    ctx.lineWidth =
      5;

    ctx.stroke();
  }
}

function modeCircuits(t) {

  clearNova(0.15);

  const size = 55;

  for (
    let y = 0;
    y < height;
    y += size
  ) {

    for (
      let x = 0;
      x < width;
      x += size
    ) {

      const active =
        Math.sin(
          x * 0.01 +
          y * 0.01 +
          t * 0.002
        ) > 0.7;

      drawLine(
        x,
        y,
        x + size / 2,
        y,
        active
          ? "rgba(110,231,255,0.18)"
          : "rgba(110,231,255,0.05)"
      );

      drawLine(
        x + size / 2,
        y,
        x + size / 2,
        y + size / 2,
        active
          ? "rgba(139,92,246,0.18)"
          : "rgba(139,92,246,0.05)"
      );

      drawDot(
        x + size / 2,
        y,
        2,
        "#6ee7ff",
        active ? 0.5 : 0.12
      );
    }
  }
}

function modeDigitalfire(t) {

  clearNova(0.17);

  for (let i = 0; i < 160; i++) {

    const x =
      random(0, width);

    const y =
      height -
      (
        random(0, height * 0.6) +
        t * random(0.01, 0.03)
      ) %
      (height * 0.7);

    drawDot(
      x,
      y,
      random(1, 4),
      hsl(
        random(20, 70),
        95,
        60
      ),
      random(0.1, 0.4)
    );
  }
}

function modeLuminous(t) {

  clearNova(0.1);

  const cx =
    centerX() +
    Math.sin(t * 0.0004) * 150;

  const cy =
    centerY() +
    Math.cos(t * 0.0005) * 100;

  glowCircle(
    cx,
    cy,
    250,
    "rgba(110,231,255,ALPHA)",
    0.1
  );

  glowCircle(
    cx,
    cy,
    120,
    "rgba(139,92,246,ALPHA)",
    0.14
  );
}

function modeRingspace(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 18; i++) {

    const a =
      t * 0.0002 +
      i * 0.35;

    const x =
      cx +
      Math.cos(a) *
      (100 + i * 25);

    const y =
      cy +
      Math.sin(a) *
      (70 + i * 18);

    drawRing(
      x,
      y,
      20 + i * 2,
      hsl(
        190 + i * 7,
        90,
        68
      ),
      0.1
    );
  }
}

function modeSunset(t) {

  clearNova(0.08);

  const gradient =
    ctx.createLinearGradient(
      0,
      height,
      0,
      0
    );

  gradient.addColorStop(
    0,
    "rgba(236,72,153,0.11)"
  );

  gradient.addColorStop(
    0.5,
    "rgba(250,204,21,0.05)"
  );

  gradient.addColorStop(
    1,
    "rgba(110,231,255,0.02)"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  drawDot(
    width * 0.75,
    height * 0.62,
    55,
    "#facc15",
    0.14
  );
}

function modeDeepsea(t) {

  clearNova(0.1);

  for (let i = 0; i < 30; i++) {

    const x =
      i * 67 %
      width;

    const y =
      (
        i * 83 +
        t * (0.02 + i % 4 * 0.005)
      ) %
      height;

    drawDot(
      x,
      y,
      2,
      "#6ee7ff",
      0.25
    );

    drawLine(
      x,
      y,
      x,
      y - 25,
      "rgba(110,231,255,0.08)"
    );
  }
}

function modeLava(t) {

  clearNova(0.13);

  for (let i = 0; i < 15; i++) {

    const x =
      i * width / 15;

    ctx.beginPath();

    for (
      let y = height;
      y > height * 0.45;
      y -= 15
    ) {

      const xx =
        x +
        Math.sin(
          y * 0.02 +
          t * 0.001 +
          i
        ) * 35;

      if (y === height) {
        ctx.moveTo(xx, y);
      } else {
        ctx.lineTo(xx, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        10 + i * 4,
        95,
        58,
        0.12
      );

    ctx.lineWidth =
      14;

    ctx.stroke();
  }
}

function modeClouds(t) {

  clearNova(0.1);

  for (let i = 0; i < 18; i++) {

    const x =
      (
        i * 120 +
        t * 0.02
      ) %
      (width + 250) -
      125;

    const y =
      100 +
      (i % 5) * 90;

    glowCircle(
      x,
      y,
      80,
      "rgba(180,220,255,ALPHA)",
      0.045
    );
  }
}

function modeWind(t) {

  clearNova(0.14);

  for (let i = 0; i < 35; i++) {

    const y =
      i * 29 +
      Math.sin(
        t * 0.001 + i
      ) * 25;

    ctx.beginPath();

    for (
      let x = -50;
      x < width + 50;
      x += 15
    ) {

      const yy =
        y +
        Math.sin(
          x * 0.012 +
          t * 0.001 +
          i
        ) * 12;

      if (x === -50) {
        ctx.moveTo(x, yy);
      } else {
        ctx.lineTo(x, yy);
      }
    }

    ctx.strokeStyle =
      "rgba(110,231,255,0.07)";

    ctx.stroke();
  }
}

function modeMagnet(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 100; i++) {

    const a =
      i * 0.25 +
      t * 0.0005;

    const r =
      50 +
      i * 2.5;

    const x =
      cx +
      Math.cos(a) * r;

    const y =
      cy +
      Math.sin(a) * r;

    drawDot(
      x,
      y,
      1.5,
      i % 2
        ? "#6ee7ff"
        : "#ec4899",
      0.3
    );
  }
}

function modeAtom(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  drawDot(
    cx,
    cy,
    12,
    "#8b5cf6",
    0.65
  );

  for (let i = 0; i < 5; i++) {

    ctx.save();

    ctx.translate(
      cx,
      cy
    );

    ctx.rotate(
      i * Math.PI / 5 +
      t * 0.0003
    );

    ctx.scale(
      1,
      0.38
    );

    drawRing(
      0,
      0,
      100 + i * 15,
      hsl(
        180 + i * 20,
        90,
        65
      ),
      0.2,
      1.5
    );

    ctx.restore();
  }
}

function modeTachyon(t) {

  clearNova(0.16);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 120; i++) {

    const p =
      ((i / 120) +
        t * 0.0006) % 1;

    const x =
      cx +
      Math.cos(i * 2.4) *
      p *
      width *
      0.6;

    const y =
      cy +
      Math.sin(i * 2.4) *
      p *
      height *
      0.6;

    drawDot(
      x,
      y,
      1 + p * 2,
      "#6ee7ff",
      0.3
    );
  }
}

function modeDimension(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 10; i++) {

    const size =
      50 + i * 45;

    const rotation =
      t * 0.0002 +
      i * 0.15;

    ctx.save();

    ctx.translate(
      cx,
      cy
    );

    ctx.rotate(
      rotation
    );

    ctx.strokeStyle =
      hsl(
        190 + i * 9,
        90,
        65,
        0.09
      );

    ctx.strokeRect(
      -size / 2,
      -size / 2,
      size,
      size
    );

    ctx.restore();
  }
}

function modeDream(t) {

  clearNova(0.07);

  for (let i = 0; i < 14; i++) {

    const x =
      width * 0.5 +
      Math.sin(
        t * 0.0003 +
        i
      ) * width * 0.4;

    const y =
      height * 0.5 +
      Math.cos(
        t * 0.0004 +
        i * 0.7
      ) * height * 0.35;

    glowCircle(
      x,
      y,
      100,
      hsl(
        230 + i * 8,
        75,
        70,
        0.04
      )
    );
  }
}

function modeRainbowwave(t) {

  clearNova(0.1);

  for (let i = 0; i < 12; i++) {

    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += 8
    ) {

      const y =
        height * 0.25 +
        i * 35 +
        Math.sin(
          x * 0.008 +
          t * 0.001 +
          i * 0.4
        ) * 25;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        i * 30 +
        t * 0.02,
        90,
        65,
        0.09
      );

    ctx.stroke();
  }
}

function modeCosmicdust(t) {

  clearNova(0.1);

  for (let i = 0; i < 300; i++) {

    const a =
      random(0, Math.PI * 2);

    const r =
      random(
        40,
        Math.min(width, height) * 0.6
      );

    const x =
      centerX() +
      Math.cos(
        a + t * 0.00005
      ) * r;

    const y =
      centerY() +
      Math.sin(
        a + t * 0.00005
      ) * r * 0.55;

    drawDot(
      x,
      y,
      random(0.4, 1.8),
      hsl(
        random(180, 300),
        85,
        70
      ),
      random(0.1, 0.4)
    );
  }
}

function modeEnergy(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 12; i++) {

    const a =
      i * Math.PI / 6 +
      t * 0.0007;

    const r =
      90 +
      Math.sin(
        t * 0.002 +
        i
      ) * 35;

    drawLine(
      cx,
      cy,
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r,
      hsl(
        180 + i * 12,
        90,
        65
      ),
      2,
      0.15
    );
  }
}

/* =========================================================
   MODOS 61 — 80
   ========================================================= */

function modePortalstorm(t) {

  clearNova(0.12);

  for (let i = 0; i < 9; i++) {

    const cx =
      width * (0.15 + i * 0.1) +
      Math.sin(
        t * 0.0005 + i
      ) * 30;

    const cy =
      height * 0.5 +
      Math.cos(
        t * 0.0004 + i
      ) * 120;

    drawRing(
      cx,
      cy,
      25 + i * 5,
      hsl(
        180 + i * 20,
        90,
        65
      ),
      0.15,
      2
    );
  }
}

function modeQuantumwave(t) {

  clearNova(0.11);

  for (let x = 0; x < width; x += 10) {

    const y =
      height / 2 +
      Math.sin(
        x * 0.025 +
        t * 0.001
      ) *
      Math.sin(
        x * 0.005 -
        t * 0.0007
      ) *
      130;

    drawDot(
      x,
      y,
      1.5,
      hsl(
        190 + x * 0.05,
        90,
        68
      ),
      0.4
    );
  }
}

function modeStardust(t) {

  clearNova(0.09);

  for (let i = 0; i < 400; i++) {

    const angle =
      random(0, Math.PI * 2);

    const r =
      random(
        20,
        Math.min(width, height) * 0.55
      );

    const x =
      centerX() +
      Math.cos(
        angle + t * 0.0001
      ) * r;

    const y =
      centerY() +
      Math.sin(
        angle + t * 0.0001
      ) * r;

    drawDot(
      x,
      y,
      random(0.3, 1.8),
      "#ffffff",
      random(0.1, 0.45)
    );
  }
}

function modeNeoncity(t) {

  clearNova(0.15);

  const base =
    height * 0.75;

  for (let i = 0; i < 25; i++) {

    const w =
      random(25, 70);

    const h =
      random(50, 260);

    const x =
      i * (width / 22);

    ctx.fillStyle =
      hsl(
        180 + i * 9,
        85,
        60,
        0.06
      );

    ctx.fillRect(
      x,
      base - h,
      w,
      h
    );

    for (
      let y = base - h + 15;
      y < base - 8;
      y += 18
    ) {

      if (
        Math.sin(
          y + i + t * 0.002
        ) > 0.3
      ) {

        ctx.fillStyle =
          "rgba(110,231,255,0.2)";

        ctx.fillRect(
          x + 7,
          y,
          7,
          4
        );
      }
    }
  }
}

function modeCybergrid(t) {

  clearNova(0.16);

  const size = 40;

  const offset =
    (t * 0.025) %
    size;

  for (
    let x = -size + offset;
    x < width + size;
    x += size
  ) {

    drawLine(
      x,
      0,
      x,
      height,
      "rgba(139,92,246,0.09)"
    );
  }

  for (
    let y = -size + offset;
    y < height + size;
    y += size
  ) {

    drawLine(
      0,
      y,
      width,
      y,
      "rgba(110,231,255,0.09)"
    );
  }
}

function modeLightwave(t) {

  clearNova(0.1);

  for (let i = 0; i < 6; i++) {

    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += 8
    ) {

      const y =
        height * 0.3 +
        i * 55 +
        Math.sin(
          x * 0.01 +
          t * 0.0015 +
          i
        ) * 45;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        185 + i * 22,
        90,
        68,
        0.13
      );

    ctx.lineWidth =
      2;

    ctx.stroke();
  }
}

function modeFireworks(t) {

  clearNova(0.12);

  const count = 8;

  for (let i = 0; i < count; i++) {

    const phase =
      (
        t * 0.0002 +
        i * 0.19
      ) % 1;

    const x =
      width *
      (0.1 + i * 0.12);

    const y =
      height *
      (0.2 + (i % 3) * 0.2);

    for (let j = 0; j < 35; j++) {

      const angle =
        j * Math.PI * 2 / 35;

      const radius =
        phase * 120;

      drawDot(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius,
        1.5,
        hsl(
          i * 40 + j * 2,
          90,
          65
        ),
        0.35 * (1 - phase)
      );
    }
  }
}

function modeSnowstorm(t) {

  clearNova(0.16);

  for (let i = 0; i < 220; i++) {

    const speed =
      0.015 + (i % 6) * 0.006;

    const x =
      (
        i * 37 +
        Math.sin(
          t * 0.0007 + i
        ) * 60
      ) % width;

    const y =
      (
        i * 73 +
        t * speed
      ) % height;

    drawDot(
      x,
      y,
      1 + i % 3,
      "#f2fbff",
      0.28
    );
  }
}

function modeStarburst(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 120; i++) {

    const angle =
      i * Math.PI * 2 / 120;

    const pulse =
      (
        t * 0.06 +
        i * 3
      ) % 500;

    drawLine(
      cx,
      cy,
      cx +
        Math.cos(angle) * pulse,
      cy +
        Math.sin(angle) * pulse,
      hsl(
        180 + i * 1.4,
        90,
        68
      ),
      1,
      0.08
    );
  }
}

function modeBlackhole(t) {

  clearNova(0.1);

  const cx = centerX();
  const cy = centerY();

  glowCircle(
    cx,
    cy,
    220,
    "rgba(139,92,246,ALPHA)",
    0.09
  );

  drawDot(
    cx,
    cy,
    65,
    "#01030a",
    1
  );

  for (let i = 0; i < 180; i++) {

    const a =
      i * 0.31 +
      t * 0.0004;

    const r =
      80 +
      (i % 100) * 2;

    const x =
      cx +
      Math.cos(a) * r;

    const y =
      cy +
      Math.sin(a) *
      r *
      0.35;

    drawDot(
      x,
      y,
      1.5,
      hsl(
        190 + i % 100,
        90,
        70
      ),
      0.25
    );
  }
}

function modeWormhole(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 35; i++) {

    const p =
      ((i / 35) +
        t * 0.00018) % 1;

    const radius =
      20 +
      p *
      Math.max(width, height);

    const angle =
      p * 12 +
      t * 0.0005;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius;

    drawDot(
      x,
      y,
      2,
      hsl(
        200 + i * 4,
        90,
        68
      ),
      0.18
    );
  }
}

function modeSupernova(t) {

  clearNova(0.11);

  const cx = centerX();
  const cy = centerY();

  const pulse =
    1 +
    Math.sin(t * 0.003) * 0.2;

  glowCircle(
    cx,
    cy,
    170 * pulse,
    "rgba(236,72,153,ALPHA)",
    0.12
  );

  glowCircle(
    cx,
    cy,
    80 * pulse,
    "rgba(250,204,21,ALPHA)",
    0.2
  );

  for (let i = 0; i < 100; i++) {

    const angle =
      i * 0.7;

    const radius =
      100 +
      ((t * 0.08 + i * 5) % 400);

    drawDot(
      cx +
        Math.cos(angle) *
        radius,
      cy +
        Math.sin(angle) *
        radius,
      1.5,
      hsl(
        20 + i * 2,
        95,
        65
      ),
      0.25
    );
  }
}

function modeAuroraFlow(t) {

  clearNova(0.09);

  for (let band = 0; band < 12; band++) {

    ctx.beginPath();

    for (
      let x = -20;
      x < width + 20;
      x += 10
    ) {

      const y =
        height * 0.2 +
        band * 48 +
        Math.sin(
          x * 0.005 +
          t * 0.0005 +
          band
        ) * 70;

      if (x === -20) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      hsl(
        150 + band * 14,
        90,
        65,
        0.09
      );

    ctx.lineWidth =
      9;

    ctx.stroke();
  }
}

function modeCrystalstorm(t) {

  clearNova(0.14);

  for (let i = 0; i < 90; i++) {

    const x =
      random(0, width);

    const y =
      (
        random(0, height) +
        t * random(0.01, 0.04)
      ) % height;

    const size =
      random(4, 16);

    ctx.beginPath();

    ctx.moveTo(
      x,
      y - size
    );

    ctx.lineTo(
      x + size * 0.55,
      y
    );

    ctx.lineTo(
      x,
      y + size
    );

    ctx.lineTo(
      x - size * 0.55,
      y
    );

    ctx.closePath();

    ctx.strokeStyle =
      hsl(
        180 + i * 2,
        90,
        75,
        0.12
      );

    ctx.stroke();
  }
}

function modeGalaxyspin(t) {

  clearNova(0.1);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 600; i++) {

    const p =
      i / 600;

    const angle =
      i * 0.13 +
      t * 0.00035;

    const radius =
      p *
      Math.min(width, height) *
      0.55;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius *
      0.42;

    drawDot(
      x,
      y,
      0.8 + p,
      hsl(
        190 + p * 100,
        90,
        70
      ),
      0.25
    );
  }
}

function modeNeonrain(t) {

  clearNova(0.18);

  for (let i = 0; i < 100; i++) {

    const x =
      (i * 53) %
      width;

    const y =
      (
        i * 89 +
        t * 0.25
      ) %
      height;

    drawLine(
      x,
      y,
      x - 2,
      y + 28,
      hsl(
        180 + i * 2,
        90,
        65
      ),
      1,
      0.2
    );
  }
}

function modeStargate(t) {

  clearNova(0.12);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 16; i++) {

    const radius =
      30 + i * 24;

    const angle =
      t * 0.0004 +
      i * 0.25;

    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.strokeStyle =
      hsl(
        180 + i * 8,
        90,
        68,
        0.13
      );

    ctx.strokeRect(
      -radius,
      -radius * 0.45,
      radius * 2,
      radius * 0.9
    );

    ctx.restore();
  }
}

function modeEnergycore(t) {

  clearNova(0.11);

  const cx = centerX();
  const cy = centerY();

  const pulse =
    30 +
    Math.sin(t * 0.004) * 12;

  glowCircle(
    cx,
    cy,
    180,
    "rgba(110,231,255,ALPHA)",
    0.09
  );

  drawDot(
    cx,
    cy,
    pulse,
    "#6ee7ff",
    0.28
  );

  for (let i = 0; i < 40; i++) {

    const a =
      i * 0.45 +
      t * 0.001;

    const r =
      60 +
      Math.sin(
        t * 0.002 +
        i
      ) * 35;

    drawDot(
      cx +
        Math.cos(a) * r,
      cy +
        Math.sin(a) * r,
      2,
      hsl(
        180 + i * 4,
        90,
        70
      ),
      0.4
    );
  }
}

function modeVoid(t) {

  clearNova(0.07);

  const cx = centerX();
  const cy = centerY();

  for (let i = 0; i < 90; i++) {

    const angle =
      i * 0.6 +
      t * 0.0002;

    const radius =
      150 +
      Math.sin(
        t * 0.001 +
        i
      ) * 130;

    drawDot(
      cx +
        Math.cos(angle) * radius,
      cy +
        Math.sin(angle) * radius,
      1,
      "#ffffff",
      0.08
    );
  }
}

function modeNova(t) {

  clearNova(0.08);

  const cx = centerX();
  const cy = centerY();

  const pulse =
    1 +
    Math.sin(t * 0.003) * 0.15;

  glowCircle(
    cx,
    cy,
    250 * pulse,
    "rgba(110,231,255,ALPHA)",
    0.09
  );

  glowCircle(
    cx,
    cy,
    150 * pulse,
    "rgba(139,92,246,ALPHA)",
    0.12
  );

  glowCircle(
    cx,
    cy,
    75 * pulse,
    "rgba(236,72,153,ALPHA)",
    0.18
  );

  for (let i = 0; i < 160; i++) {

    const angle =
      i * 0.35 +
      t * 0.0006;

    const radius =
      80 +
      ((t * 0.05 + i * 4) % 350);

    drawDot(
      cx +
        Math.cos(angle) * radius,
      cy +
        Math.sin(angle) * radius,
      1 + (i % 3),
      hsl(
        175 + i * 1.1,
        95,
        70
      ),
      0.25
    );
  }

  for (let i = 0; i < 12; i++) {

    const angle =
      t * 0.001 +
      i * Math.PI / 6;

    drawLine(
      cx,
      cy,
      cx +
        Math.cos(angle) *
        280,
      cy +
        Math.sin(angle) *
        280,
      hsl(
        180 + i * 12,
        95,
        70
      ),
      1,
      0.08
    );
  }
}

/* =========================================================
   DISPATCHER DE NOVA
   ========================================================= */

const NOVA_RENDERERS = {

  cosmic: modeCosmic,
  aurora: modeAurora,
  pulse: modePulse,
  matrix: modeMatrix,
  nebula: modeNebula,
  waves: modeWaves,
  starfield: modeStarfield,
  vortex: modeVortex,
  firefly: modeFirefly,
  rain: modeRain,
  grid: modeGrid,
  spiral: modeSpiral,
  orbit: modeOrbit,
  plasma: modePlasma,
  dna: modeDNA,
  snow: modeSnow,
  lightning: modeLightning,
  galaxy: modeGalaxy,
  comet: modeComet,
  quantum: modeQuantum,

  solar: modeSolar,
  meteor: modeMeteor,
  bubbles: modeBubbles,
  hexgrid: modeHexgrid,
  ripples: modeRipples,
  sparks: modeSparks,
  petals: modePetals,
  constellation: modeConstellation,
  tunnel: modeTunnel,
  rings: modeRings,
  glitch: modeGlitch,
  spectrum: modeSpectrum,
  fractal: modeFractal,
  satellites: modeSatellites,
  electric: modeElectric,
  chrono: modeChrono,
  particles: modeParticles,
  mandala: modeMandala,
  eclipse: modeEclipse,
  crystal: modeCrystal,

  hologram: modeHologram,
  portal: modePortal,
  rainbow: modeRainbow,
  circuits: modeCircuits,
  digitalfire: modeDigitalfire,
  luminous: modeLuminous,
  ringspace: modeRingspace,
  sunset: modeSunset,
  deepsea: modeDeepsea,
  lava: modeLava,
  clouds: modeClouds,
  wind: modeWind,
  magnet: modeMagnet,
  atom: modeAtom,
  tachyon: modeTachyon,
  dimension: modeDimension,
  dream: modeDream,
  rainbowwave: modeRainbowwave,
  cosmicdust: modeCosmicdust,
  energy: modeEnergy,

  portalstorm: modePortalstorm,
  quantumwave: modeQuantumwave,
  stardust: modeStardust,
  neoncity: modeNeoncity,
  cybergrid: modeCybergrid,
  lightwave: modeLightwave,
  fireworks: modeFireworks,
  snowstorm: modeSnowstorm,
  starburst: modeStarburst,
  blackhole: modeBlackhole,
  wormhole: modeWormhole,
  supernova: modeSupernova,
  auroraflow: modeAuroraFlow,
  crystalstorm: modeCrystalstorm,
  galaxyspin: modeGalaxyspin,
  neonrain: modeNeonrain,
  stargate: modeStargate,
  energycore: modeEnergycore,
  void: modeVoid,
  nova: modeNova

};

/* =========================================================
   SELECTOR DE MODOS
   ========================================================= */

function setupNovaModes() {

  $$(".novaMode").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const mode =
            button.dataset.mode;

          if (
            !NOVA_RENDERERS[mode]
          ) {
            return;
          }

          state.novaMode =
            mode;

          $$(".novaMode").forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item === button
              );
            }
          );

          updateNovaModeName();

          saveState();

          showToast(
            `NOVA: ${button.textContent.replace(/^\d+\s*·\s*/, "")}`,
            "✦"
          );
        }
      );
    }
  );
}

function updateNovaModeName() {

  const element =
    $("#novaModeName");

  if (!element) return;

  const button =
    $(
      `.novaMode[data-mode="${CSS.escape(state.novaMode)}"]`
    );

  if (button) {

    element.textContent =
      button.textContent
        .replace(/^\d+\s*·\s*/, "")
        .toUpperCase();
  }
}

function setupNovaControls() {

  const intensity =
    $("#novaIntensity");

  const output =
    $("#novaIntensityValue");

  if (intensity) {

    intensity.value =
      Math.round(
        state.novaIntensity * 100
      );

    intensity.addEventListener(
      "input",
      () => {

        state.novaIntensity =
          Number(
            intensity.value
          ) / 100;

        if (output) {
          output.textContent =
            `${intensity.value}%`;
        }

        saveState();
      }
    );

    if (output) {
      output.textContent =
        `${intensity.value}%`;
    }
  }

  const performance =
    $("#performanceSelect");

  if (performance) {

    performance.value =
      state.performance;

    performance.addEventListener(
      "change",
      () => {

        state.performance =
          performance.value;

        createNovaParticles();

        saveState();

        showToast(
          "Rendimiento actualizado",
          "⚡"
        );
      }
    );
  }
}

/* =========================================================
   LOOP NOVA
   ========================================================= */

function novaLoop(now) {

  if (!ctx) return;

  const delta =
    Math.min(
      40,
      now - lastFrame
    );

  lastFrame =
    now;

  frameCounter++;

  if (
    now - fpsTimer >= 1000
  ) {

    fpsValue =
      Math.round(
        frameCounter /
        ((now - fpsTimer) / 1000)
      );

    frameCounter = 0;

    fpsTimer =
      now;

    const fps =
      $("#fps");

    if (fps) {
      fps.textContent =
        String(fpsValue);
    }
  }

  try {

    if (
      state.motion &&
      !document.body.classList.contains("noMotion")
    ) {

      const renderer =
        NOVA_RENDERERS[
          state.novaMode
        ] ||
        NOVA_RENDERERS.cosmic;

      renderer(
        now * state.novaIntensity,
        delta
      );

    } else {

      ctx.fillStyle =
        "rgba(5,9,20,0.35)";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }

  } catch (error) {

    console.warn(
      "Error en NOVA FLOW:",
      error
    );

    try {
      modeCosmic(now);
    } catch {}
  }

  requestAnimationFrame(
    novaLoop
  );
}

/* =========================================================
   CURSOR
   ========================================================= */

function setupPointer() {

  window.addEventListener(
    "pointermove",
    (event) => {

      pointerX =
        lerp(
          pointerX,
          event.clientX,
          0.08
        );

      pointerY =
        lerp(
          pointerY,
          event.clientY,
          0.08
        );
    },
    {
      passive: true
    }
  );
}

/* =========================================================
   SERVICE WORKER
   ========================================================= */

async function registerServiceWorker() {

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  try {

    const registration =
      await navigator.serviceWorker.register(
        "./sw.js"
      );

    if (
      registration.waiting
    ) {

      registration.waiting.postMessage({
        type: "SKIP_WAITING"
      });
    }

  } catch (error) {

    console.warn(
      "Service Worker no disponible:",
      error
    );
  }
}

/* =========================================================
   CONEXIÓN
   ========================================================= */

function updateConnectionStatus() {

  const element =
    $("#connectionStatus");

  if (!element) return;

  const online =
    navigator.onLine;

  element.classList.toggle(
    "offline",
    !online
  );

  const label =
    element.querySelector("b");

  if (label) {
    label.textContent =
      online
        ? "En línea"
        : "Sin conexión";
  }
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function applyInitialState() {

  applyTheme();
  applyMotion();
  applyFocus();

  renderTools();
  renderQuickTools();

  setupNovaModes();
  setupNovaControls();

  updateNovaModeName();

  $$(".novaMode").forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.mode ===
        state.novaMode
      );
    }
  );
}

function initialize() {

  try {

    applyInitialState();

    setupInterface();

    setupPointer();

    resizeNova();

    window.addEventListener(
      "resize",
      resizeNova,
      {
        passive: true
      }
    );

    window.addEventListener(
      "online",
      updateConnectionStatus
    );

    window.addEventListener(
      "offline",
      updateConnectionStatus
    );

    updateConnectionStatus();

    registerServiceWorker();

    requestAnimationFrame(
      novaLoop
    );

  } catch (error) {

    console.error(
      "Error inicializando ÚtilHub V21:",
      error
    );
  }
}

/* =========================================================
   ARRANQUE
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialize,
    {
      once: true
    }
  );

} else {

  initialize();
}
