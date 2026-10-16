// VARIABLES DE ESTADO
let masterDeck = []; // El mazo original de la sesión
let currentDeck = []; // El mazo que se va gastando al sacar cartas

// ELEMENTOS DEL DOM
const viewStream = document.getElementById("view-stream");
const viewBO = document.getElementById("view-bo");

// RUTEO BÁSICO: ¿Estamos en /bo?
const isBackOffice = window.location.hash === "#bo";

if (isBackOffice) {
  viewBO.classList.remove("hidden");
  initBackOffice();
} else {
  viewStream.classList.remove("hidden");
  initStreamWidget();
}

// ==========================================
// LÓGICA DEL BACK OFFICE
// ==========================================
function initBackOffice() {
  loadFromStorage();
  renderBoList();

  const input = document.getElementById("new-card-input");

  document.getElementById("btn-add-card").addEventListener("click", () => {
    if (input.value.trim() !== "") {
      masterDeck.push(input.value.trim());
      input.value = "";
      renderBoList();
    }
  });

  document.getElementById("btn-save-deck").addEventListener("click", () => {
    localStorage.setItem("tarot_master_deck", JSON.stringify(masterDeck));
    document.getElementById("save-status").innerText =
      "¡Guardado y enviado a OBS!";
    setTimeout(
      () => (document.getElementById("save-status").innerText = ""),
      2000,
    );
  });

  document.getElementById("btn-clear-all").addEventListener("click", () => {
    masterDeck = [];
    renderBoList();
  });
}

function renderBoList() {
  const list = document.getElementById("card-list");
  list.innerHTML = "";
  masterDeck.forEach((cardText, index) => {
    const li = document.createElement("li");
    li.innerText = cardText;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "X";
    deleteBtn.onclick = () => {
      masterDeck.splice(index, 1);
      renderBoList();
    };
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// ==========================================
// LÓGICA DEL WIDGET (STREAM/OBS)
// ==========================================
function initStreamWidget() {
  loadFromStorage();
  resetDeck();

  document.getElementById("btn-draw").addEventListener("click", drawCard);
  document.getElementById("btn-reset").addEventListener("click", resetDeck);

  // ESCUCHADOR MÁGICO: Si cambias algo en el #bo, OBS se entera aquí
  window.addEventListener("storage", (e) => {
    if (e.key === "tarot_master_deck") {
      loadFromStorage();
      resetDeck();
    }
  });
}

function loadFromStorage() {
  const saved = localStorage.getItem("tarot_master_deck");
  if (saved) masterDeck = JSON.parse(saved);
}

function resetDeck() {
  // Clonamos el mazo original para poder ir borrando cartas sin perderlas
  currentDeck = [...masterDeck];
  updateWidgetUI("El destino espera...", currentDeck.length);
}

function drawCard() {
  if (currentDeck.length === 0) {
    updateWidgetUI("El mazo está vacío. Toca resetear.", 0);
    return;
  }

  // Algoritmo simple para barajar/elegir carta aleatoria
  const randomIndex = Math.floor(Math.random() * currentDeck.length);
  const drawnCard = currentDeck.splice(randomIndex, 1)[0]; // Saca la carta del mazo

  updateWidgetUI(drawnCard, currentDeck.length);

  setTimeout(() => {
    shuffleVideo.style.display = "none";
    shuffleVideo.currentTime = 0;
    cardElement.style.opacity = "1";

    const indiceAleatorio = Math.floor(Math.random() * mazoActual.length);
    const cartaElegida = mazoActual.splice(indiceAleatorio, 1)[0];

    // Llamamos a la nueva función mágica en lugar del innerText normal
    renderizarTextoBrutalista(cartaElegida);

    cardElement.classList.add("is-flipped");
  }, 2000);
}

function updateWidgetUI(text, count) {
  document.getElementById("card-text").innerText = text;
  document.getElementById("deck-count").innerText = count;
}

// ... (código anterior de drawCard) ...

/* =======================================================
   FUNCIÓN DE RENDERIZADO BRUTALISTA Y MÁGICO
   ======================================================= */
function renderizarTextoBrutalista(texto) {
  const contenedor = document.getElementById("card-text");
  contenedor.innerHTML = "";
  contenedor.className = "brutalist-container";

  // Convertimos a mayúsculas para un bloque más sólido y separamos palabras
  const palabras = texto.toUpperCase().split(" ");
  let retrasoLetra = 0;

  palabras.forEach((palabra) => {
    const spanPalabra = document.createElement("span");
    spanPalabra.className = "brutalist-word";

    // Magia brutalista: Cada palabra altera su tamaño aleatoriamente
    // base 2.5em + un aleatorio hasta 1.5em extra
    const escalaAleatoria = (Math.random() * 1.5 + 2.5).toFixed(2);
    spanPalabra.style.fontSize = `${escalaAleatoria}em`;

    // Separamos cada letra para la animación
    [...palabra].forEach((letra) => {
      const spanLetra = document.createElement("span");
      spanLetra.innerText = letra;
      spanLetra.className = "magic-letter";
      // Staggering: cada letra tarda 40ms más que la anterior en salir
      spanLetra.style.animationDelay = `${retrasoLetra * 0.04}s`;

      spanPalabra.appendChild(spanLetra);
      retrasoLetra++;
    });

    contenedor.appendChild(spanPalabra);

    // Añadimos un espacio invisible para que flexbox pueda separar las palabras
    const espacio = document.createElement("span");
    espacio.innerHTML = "&nbsp;";
    espacio.style.fontSize = `${escalaAleatoria}em`;
    contenedor.appendChild(espacio);
  });
}
