// ==========================================
// VARIABLES GLOBALES Y ESTADO
// ==========================================
let mazoGlobal = [];
let mazoActual = [];

const params = new URLSearchParams(window.location.search);
const twitchUser = params.get("user") || "sarachitv";
const rewardName = params.get("reward") || "Sacar carta del tarot";
const personalCsv = params.get("deck") || "sarachi.csv"; // Pilla tu CSV por defecto
const paletaParam = params.get("pal") || "a8e684-00e5ff-ff2a9d-ffd700-ffffff";
const paleta = paletaParam.split("-").map((c) => "#" + c);

const cardElement = document.getElementById("card");
const textElement = document.getElementById("card-text");
const shuffleVideo = document.getElementById("shuffle-animation");
const tensionCounter = document.getElementById("tension-counter");

// Carga solo el mazo común y la "valla" de la streamer seleccionada
const csvFiles = ["data/comun.csv", `data/${personalCsv}`];

// ... (Aquí sigue tu función loadTarotData() buscando row.Texto) ...
// ==========================================
// CARGA DE BASE DE DATOS LOCALES (GITHUB)
// ==========================================
const csvFiles = [
  "data/comun.csv",
  "data/eskissmee.csv",
  "data/klauwasaki.csv",
  "data/sarachi.csv",
];

async function loadTarotData() {
  try {
    const responses = await Promise.all(csvFiles.map((file) => fetch(file)));
    const texts = await Promise.all(responses.map((res) => res.text()));

    let allCards = [];

    texts.forEach((csvText) => {
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      // Busca obligatoriamente la columna 'Texto' en la fila 1 de los CSVs
      parsed.data.forEach((row) => {
        if (row.Texto && row.Texto.trim() !== "") {
          allCards.push(row.Texto.trim());
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
      "Mazo vacío. Asegúrate de que los CSV tienen 'Texto' en la fila 1.";
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

  cardElement.style.opacity = "0";
  shuffleVideo.style.display = "block";
  shuffleVideo.play();

  setTimeout(() => {
    shuffleVideo.style.display = "none";
    shuffleVideo.currentTime = 0;
    cardElement.style.opacity = "1";

    const indiceAleatorio = Math.floor(Math.random() * mazoActual.length);
    const cartaElegida = mazoActual.splice(indiceAleatorio, 1)[0];

    renderizarTextoBrutalista(cartaElegida);
    cardElement.classList.add("is-flipped");
    updateCounter();
  }, 2000);
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
