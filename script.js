let filas, columnas, minas;
let tablero = [];
let tableroHTML = document.getElementById("tablero");
let minasRestantesSpan = document.getElementById("minasRestantes");

function cambiarDificultad() {
    let dificultad = document.getElementById("dificultad").value;
    if (dificultad === "facil") {
        filas = 8; columnas = 8; minas = 10;
    } else if (dificultad === "medio") {
        filas = 12; columnas = 12; minas = 20;
    } else {
        filas = 16; columnas = 16; minas = 40;
    }
    iniciarJuego();
}

function iniciarJuego() {
    tablero = [];
    tableroHTML.innerHTML = "";
    tableroHTML.style.gridTemplateRows = `repeat(${filas}, 36px)`;
    tableroHTML.style.gridTemplateColumns = `repeat(${columnas}, 36px)`;
    minasRestantesSpan.textContent = minas;

    for (let f = 0; f < filas; f++) {
        tablero[f] = [];
        for (let c = 0; c < columnas; c++) {
            tablero[f][c] = { mina: false, revelada: false, numero: 0, bandera: false };
            let celda = document.createElement("div");
            celda.classList.add("celda");
            celda.dataset.fila = f;
            celda.dataset.columna = c;

            // Click normal = revelar
            celda.addEventListener("click", revelarCelda);

            // Toque largo = poner bandera
            let presionado;
            celda.addEventListener("touchstart", e => {
                presionado = setTimeout(() => {
                    ponerBandera({ target: celda });
                }, 500); // 0.5 segundos para marcar bandera
            });
            celda.addEventListener("touchend", e => clearTimeout(presionado));

            // Para PC con clic derecho
            celda.addEventListener("contextmenu", ponerBandera);

            tableroHTML.appendChild(celda);
        }
    }

    // Colocar minas
    let minasColocadas = 0;
    while (minasColocadas < minas) {
        let f = Math.floor(Math.random() * filas);
        let c = Math.floor(Math.random() * columnas);
        if (!tablero[f][c].mina) {
            tablero[f][c].mina = true;
            minasColocadas++;
        }
    }

    // Calcular números
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            if (!tablero[f][c].mina) {
                tablero[f][c].numero = contarMinasCercanas(f, c);
            }
        }
    }
}

function contarMinasCercanas(f, c) {
    let contador = 0;
    for (let df = -1; df <= 1; df++) {
        for (let dc = -1; dc <= 1; dc++) {
            let nf = f + df;
            let nc = c + dc;
            if (nf >= 0 && nf < filas && nc >= 0 && nc < columnas) {
                if (tablero[nf][nc].mina) contador++;
            }
        }
    }
    return contador;
}

function revelarCelda(e) {
    let f = parseInt(e.target.dataset.fila);
    let c = parseInt(e.target.dataset.columna);
    let celda = tablero[f][c];

    if (celda.revelada || celda.bandera) return;

    celda.revelada = true;
    e.target.classList.add("revelada");

    if (celda.mina) {
        e.target.textContent = "💣";
        e.target.classList.add("mina");
        alert("¡Has perdido☠️☠️☠️!");
        mostrarTodas();
        return;
    }

    if (celda.numero > 0) {
        e.target.textContent = celda.numero;
    } else {
        for (let df = -1; df <= 1; df++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nf = f + df;
                let nc = c + dc;
                if (nf >= 0 && nf < filas && nc >= 0 && nc < columnas) {
                    revelarVecino(nf, nc);
                }
            }
        }
    }
}

function revelarVecino(f, c) {
    let celdaHTML = document.querySelector(`.celda[data-fila="${f}"][data-columna="${c}"]`);
    if (!tablero[f][c].revelada && !tablero[f][c].mina && !tablero[f][c].bandera) {
        tablero[f][c].revelada = true;
        celdaHTML.classList.add("revelada");
        if (tablero[f][c].numero > 0) {
            celdaHTML.textContent = tablero[f][c].numero;
        } else {
            for (let df = -1; df <= 1; df++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nf = f + df;
                    let nc = c + dc;
                    if (nf >= 0 && nf < filas && nc >= 0 && nc < columnas) {
                        revelarVecino(nf, nc);
                    }
                }
            }
        }
    }
}

function ponerBandera(e) {
    e.preventDefault();
    let f = parseInt(e.target.dataset.fila);
    let c = parseInt(e.target.dataset.columna);
    let celda = tablero[f][c];

    if (celda.revelada) return;

    if (!celda.bandera && minasRestantesSpan.textContent > 0) {
        celda.bandera = true;
        e.target.textContent = "🚩";
        minasRestantesSpan.textContent = parseInt(minasRestantesSpan.textContent) - 1;
    } else if (celda.bandera) {
        celda.bandera = false;
        e.target.textContent = "";
        minasRestantesSpan.textContent = parseInt(minasRestantesSpan.textContent) + 1;
    }
}

function mostrarTodas() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            let celdaHTML = document.querySelector(`.celda[data-fila="${f}"][data-columna="${c}"]`);
            if (tablero[f][c].mina) {
                celdaHTML.textContent = "💣";
                celdaHTML.classList.add("mina");
            } else {
                celdaHTML.textContent = tablero[f][c].numero > 0 ? tablero[f][c].numero : "";
                celdaHTML.classList.add("revelada");
            }
        }
    }
}

document.getElementById("dificultad").value = "facil";
cambiarDificultad();
