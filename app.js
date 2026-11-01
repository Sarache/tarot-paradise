// ==========================================
// VARIABLES GLOBALES Y ESTADO
// ==========================================
let mazoGlobal = [];
let mazoActual = [];

const urlParams = new URLSearchParams(window.location.search);
const twitchUser = urlParams.get("user") || "sarachitv";
const rewardName = urlParams.get("reward") || "Sacar carta del tarot";
const personalCsv = urlParams.get("deck") || "sarachi.csv";
const paletaParam =
  urlParams.get("pal") || "a8e684-00e5ff-ff2a9d-ffd700-ffffff";
const paleta = paletaParam.split("-").map((c) => "#" + c);

const cardElement = document.getElementById("card");
const textElement = document.getElementById("card-text");
const shuffleVideo = document.getElementById("shuffle-animation");
const tensionCounter = document.getElementById("tension-counter");

// Carga solo el mazo común y la "valla" de la streamer seleccionada
const useCommon = urlParams.get("common") !== "false"; // Verdadero por defecto

// Montamos la lista de descargas dinámicamente
const csvFiles = [];
if (useCommon) {
  csvFiles.push("data/comun.csv");
}
if (personalCsv) {
  csvFiles.push(`data/${personalCsv}`);
}

// ... (Aquí sigue tu función loadTarotData() buscando row.⊹ ࣪₊ ☾ ⁺˖ ࣪ ✧ PASE VIP ✧ ࣪ ˖⁺ ˚₊⊹) ...
// ==========================================
// CARGA DE BASE DE DATOS LOCALES (GITHUB)
// ==========================================
async function loadTarotData() {
  try {
    // Le añadimos la hora exacta para obligar al navegador a descargar siempre la versión nueva de GitHub
    const responses = await Promise.all(
      csvFiles.map((file) => fetch(file + "?v=" + Date.now())),
    );
    const texts = await Promise.all(responses.map((res) => res.text()));

    // ... (el resto sigue igual)

    let allCards = [];

    texts.forEach((csvText) => {
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      parsed.data.forEach((row) => {
        // Pillamos el título de la primera columna automáticamente, sea cual sea
        const nombreColumna = Object.keys(row)[0];

        if (
          nombreColumna &&
          row[nombreColumna] &&
          row[nombreColumna].trim() !== ""
        ) {
          allCards.push(row[nombreColumna].trim());
        }
      });
    });
    console.log("Mazo cargado con éxito:", allCards);
    return allCards;
  } catch (error) {
    console.error("Error al cargar los CSVs:", error);
    document.getElementById("loading").innerText =
      "Error cargando los CSV locales.";
  }
}

// Inicialización
loadTarotData().then((mazo) => {
  if (mazo && mazo.length > 0) {
    mazoGlobal = mazo;
    document.getElementById("loading").style.display = "none";
    resetDeck();
  } else {
    document.getElementById("loading").innerText =
      "Mazo vacío. Asegúrate de que los CSV tienen '⊹ ࣪₊ ☾ ⁺˖ ࣪ ✧ PASE VIP ✧ ࣪ ˖⁺ ˚₊⊹' en la fila 1.";
  }
});

// ==========================================
// LÓGICA DEL JUEGO
// ==========================================
function updateCounter() {
  tensionCounter.innerText = `[${mazoActual.length}/${mazoGlobal.length}]`;
  tensionCounter.style.color =
    mazoActual.length <= 1 ? "#ff0048" : "var(--accent)";
}

function resetDeck() {
  mazoActual = [...mazoGlobal];
  cardElement.classList.remove("is-flipped");
  updateCounter();
}

function drawCard() {
  if (mazoActual.length === 0) {
    renderizarTextoBrutalista("MAZO VACÍO");
    cardElement.classList.add("is-flipped");
    return;
  }

  const hRelaxed = document.getElementById("hand-relaxed");
  const hPinch = document.getElementById("hand-pinch");
  const hHold = document.getElementById("hand-hold");

  // 0. Resetear el estado
  cardElement.classList.remove("is-flipped");
  hRelaxed.className = "mystic-hand layer-front";
  hPinch.className = "mystic-hand layer-front no-transition";
  hHold.className = "mystic-hand layer-back";
  cardElement.style.opacity = "1";

  // 1. Aparece la mano relajada desde abajo
  setTimeout(() => {
    hRelaxed.classList.add("hand-show");
  }, 100);

  // 2. Cambio súbito a la mano de pinza (sin animación de subida)
  setTimeout(() => {
    hRelaxed.classList.remove("hand-show");
    hPinch.classList.add("hand-show");

    // Devolvemos la transición a la mano de pinza para el siguiente paso
    setTimeout(() => {
      hPinch.classList.remove("no-transition");
    }, 50);
  }, 600);

  // 3. La mano de pinza pega el tirón y la carta se voltea
  setTimeout(() => {
    // Sorteamos la carta
    const indiceAleatorio = Math.floor(Math.random() * mazoActual.length);
    const cartaElegida = mazoActual.splice(indiceAleatorio, 1)[0];
    renderizarTextoBrutalista(cartaElegida);

    hPinch.classList.remove("hand-show");
    hPinch.classList.add("hand-pull");
    cardElement.classList.add("is-flipped");
  }, 900);

  // 4. La mano de soporte aparece por detrás cuando la carta está legible
  setTimeout(() => {
    hHold.classList.add("hand-show");
    updateCounter();
  }, 1200);
}

// ==========================================
// RENDERIZADO BRUTALISTA
// ==========================================
function renderizarTextoBrutalista(texto) {
  textElement.innerHTML = "";
  textElement.className = "brutalist-container";
  textElement.style.setProperty("--escala-dinamica", "1");
  const rotacionBloque = (Math.random() * 4 - 2).toFixed(1);
  textElement.style.setProperty("--rotacion-bloque", `${rotacionBloque}deg`);

  const palabrasRaw = texto.toUpperCase().split(" ");
  const lineas = [];
  let lineaActual = "";

  for (let i = 0; i < palabrasRaw.length; i++) {
    const palabra = palabrasRaw[i];
    if (lineaActual === "") {
      lineaActual = palabra;
    } else {
      if (lineaActual.length + palabra.length + 1 <= 9) {
        lineaActual += " " + palabra;
      } else {
        lineas.push(lineaActual);
        lineaActual = palabra;
      }
    }
  }
  if (lineaActual !== "") lineas.push(lineaActual);

  const colorRandom = paleta[Math.floor(Math.random() * paleta.length)];
  textElement.style.color = colorRandom;

  lineas.forEach((linea, index) => {
    const spanLinea = document.createElement("span");
    spanLinea.innerText = linea;
    spanLinea.className = "brutalist-word";
    const factorAncho = 400;
    const tamanoFuente = factorAncho / Math.max(linea.length, 3);
    spanLinea.style.fontSize = `${tamanoFuente}px`;
    spanLinea.style.animationDelay = `${index * 0.1}s`;
    textElement.appendChild(spanLinea);
  });

  requestAnimationFrame(() => {
    const altoCarta = 480;
    const altoTexto = textElement.scrollHeight;
    let escala = (altoCarta / altoTexto) * 0.95;
    if (escala > 1.4) escala = 1.4;
    textElement.style.setProperty("--escala-dinamica", escala);
  });
}

// ==========================================
// INTEGRACIÓN CON TWITCH
// ==========================================
ComfyJS.onChat = (user, message, flags, self, extra) => {
  if (extra.customRewardId) drawCard();
};
ComfyJS.onReward = (user, reward, cost, message, extra) => {
  if (reward === rewardName) drawCard();
};
ComfyJS.Init(twitchUser);
