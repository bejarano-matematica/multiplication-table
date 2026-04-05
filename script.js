let tablaActual = 2;
let respuestaCorrecta = 0;
let puntosActuales = 0;
const puntosParaGanar = 10;
let bolsaNumeros = [];
let nombreJugador = ""; 

const sonidos = {
    acierto: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    error: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
    victoria: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

const iconos = { 2: "🚲", 3: "🍀", 4: "🐕" };

function guardarNombre() {
    const input = document.getElementById('input-nombre').value.trim();
    
    if (input === "") {
        alert("¡Por favor, dime tu nombre para empezar la misión!");
        return;
    }

    nombreJugador = input;
    
    document.getElementById('nombre-jugador-menu').innerText = nombreJugador;
    document.getElementById('nombre-jugador-victoria').innerText = nombreJugador;
    document.getElementById('nombre-jugador-salida').innerText = nombreJugador;

    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
}

function iniciarMision(tabla) {
    tablaActual = tabla;
    puntosActuales = 0;
    
    // ¡Línea corregida!
    bolsaNumeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
    
    actualizarBarra();
    
    document.getElementById('titulo-mision').innerText = "Misión de la Tabla del " + tablaActual;
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('game-screen').classList.remove('hidden');
    
    generarPregunta();
}

function generarPregunta() {
    let indice = Math.floor(Math.random() * bolsaNumeros.length);
    let n = bolsaNumeros.splice(indice, 1)[0]; 
    
    respuestaCorrecta = tablaActual * n;
    
    let fraseExtra = "";
    if (tablaActual === 2) fraseExtra = "el doble de " + n;
    else if (tablaActual === 3) fraseExtra = "el triple de " + n;
    else if (tablaActual === 4) fraseExtra = "el doble del doble de " + n;

    document.getElementById('pregunta').innerHTML = `
        ${tablaActual} x ${n} = <br>
        <small>${tablaActual} veces ${n}</small>
        <small>${fraseExtra}</small>
    `;
    
    let emojisHtml = "";
    for(let i = 0; i < n; i++) {
        emojisHtml += `<div class="grupo-emoji">${iconos[tablaActual].repeat(tablaActual)}</div>`;
    }
    document.getElementById('visualizacion-emojis').innerHTML = emojisHtml;
    document.getElementById('mensaje-feedback').innerText = "";
    generarOpciones();
}

function generarOpciones() {
    let opciones = [respuestaCorrecta];
    while (opciones.length < 4) {
        let error = tablaActual * (Math.floor(Math.random() * 10) + 1);
        if (!opciones.includes(error)) opciones.push(error);
    }
    opciones.sort(() => Math.random() - 0.5);
    
    const contenedor = document.getElementById('opciones-container');
    contenedor.innerHTML = "";
    opciones.forEach(num => {
        let btn = document.createElement('button');
        btn.className = 'btn-opcion';
        btn.innerText = num;
        btn.onclick = () => verificarRespuesta(num);
        contenedor.appendChild(btn);
    });
}

function verificarRespuesta(num) {
    if (num === respuestaCorrecta) {
        sonidos.acierto.play();
        puntosActuales++;
        actualizarBarra();
        if (puntosActuales >= puntosParaGanar) {
            setTimeout(mostrarVictoria, 500);
        } else {
            setTimeout(generarPregunta, 1200);
        }
    } else {
        sonidos.error.play();
        document.getElementById('mensaje-feedback').innerText = "¡Cuenta los dibujos! 🧐";
        document.getElementById('mensaje-feedback').style.color = "#FF6B6B";
    }
}

function actualizarBarra() {
    document.getElementById('progress-bar').style.width = (puntosActuales / puntosParaGanar * 100) + "%";
}

function mostrarVictoria() {
    sonidos.victoria.play();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
}

function volverAlMenu() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('menu-screen').classList.remove('hidden');
}

function salirDelJuego() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('exit-screen').classList.remove('hidden');
}