let tablaActual = 2;
let puntosActuales = 0;
const puntosParaGanar = 10;
let bolsaPreguntas = []; 
let nombreJugador = ""; 
let esProActivado = false; 

let esModoEvaluacion = false;
let puntajeEvaluacion = 0;
let tiempoRestante = 20;
let temporizador;
let preguntaEnPantalla = null; 

const sonidos = {
    acierto: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    error: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
    victoria: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

const iconos = { 
    2: "🚲", 3: "🍀", 4: "🐕", 
    5: "🖐️", 6: "🎲", 7: "🌈", 8: "🕷️", 9: "🎈", 10: "🪙" 
};

// AL CARGAR LA APP: Verificamos si ya era PRO
window.onload = function() {
    if (localStorage.getItem('modoProBejarano') === 'activado') {
        activarInterfazPro();
    }
};

function guardarNombre() {
    const input = document.getElementById('input-nombre').value.trim();
    if (input === "") { alert("¡Por favor, dime tu nombre!"); return; }
    nombreJugador = input;
    document.querySelectorAll('.nombre-jugador').forEach(el => el.innerText = nombreJugador);
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
}

// === SISTEMA PRO CORREGIDO Y SIMPLIFICADO ===
function pedirCodigoPro() {
    let codigo = prompt("Ingresa el código secreto para desbloquear todas las misiones:");
    if (!codigo) return;

    // Encriptación Base64 simple
    let hashGenerado = btoa(codigo.trim());
    
    // Esta es la huella exacta para: TablasPro2026
    let hashCorrecto = "VGFibGFzUHJvMjAyNg==";

    if (hashGenerado === hashCorrecto) {
        localStorage.setItem('modoProBejarano', 'activado'); // Guardar en el celular
        activarInterfazPro();
        alert("¡Código aceptado! 🚀 Modo PRO activado permanentemente.");
    } else {
        alert("Código incorrecto. Verifica mayúsculas y minúsculas.");
    }
}

function activarInterfazPro() {
    esProActivado = true;
    document.getElementById('btn-activar-pro').classList.add('hidden');
    document.getElementById('menu-tablas-pro').classList.remove('hidden');
}

function iniciarMision(tabla) {
    esModoEvaluacion = false;
    tablaActual = tabla;
    puntosActuales = 0;
    bolsaPreguntas = [];
    for(let i = 1; i <= 10; i++) bolsaPreguntas.push({ t: tabla, n: i });
    document.getElementById('panel-evaluacion').classList.add('hidden');
    document.getElementById('titulo-mision').innerText = "Misión de la Tabla del " + tabla;
    prepararPantallaJuego();
}

function iniciarEvaluacion() {
    esModoEvaluacion = true;
    puntosActuales = 0;
    puntajeEvaluacion = 0;
    
    // ¡Línea corregida!
    let tablasAUsar = esProActivado ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 3, 4];
    
    let pozoTotal = [];
    for(let t of tablasAUsar) {
        for(let i = 1; i <= 10; i++) pozoTotal.push({ t: t, n: i });
    }
    pozoTotal.sort(() => Math.random() - 0.5);
    bolsaPreguntas = pozoTotal.slice(0, 10);
    document.getElementById('panel-evaluacion').classList.remove('hidden');
    document.getElementById('titulo-mision').innerText = "Modo Evaluación ⏱️";
    actualizarMarcadorEval();
    prepararPantallaJuego();
}

function prepararPantallaJuego() {
    actualizarBarra();
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('game-screen').classList.remove('hidden');
    generarPregunta();
}

function generarPregunta() {
    clearInterval(temporizador);
    habilitarBotones(true);
    document.getElementById('mensaje-feedback').innerText = "";
    let indice = Math.floor(Math.random() * bolsaPreguntas.length);
    
    // ¡Línea corregida!
    preguntaEnPantalla = bolsaPreguntas.splice(indice, 1)[0]; 
    
    if (!esModoEvaluacion) {
        let fraseExtra = "";
        if (preguntaEnPantalla.t === 2) fraseExtra = "<small>el doble de " + preguntaEnPantalla.n + "</small>";
        else if (preguntaEnPantalla.t === 3) fraseExtra = "<small>el triple de " + preguntaEnPantalla.n + "</small>";
        else if (preguntaEnPantalla.t === 4) fraseExtra = "<small>el doble del doble de " + preguntaEnPantalla.n + "</small>";

        document.getElementById('pregunta').innerHTML = `${preguntaEnPantalla.t} x ${preguntaEnPantalla.n} = <br><small>${preguntaEnPantalla.t} veces ${preguntaEnPantalla.n}</small>${fraseExtra}`;
        let emojisHtml = "";
        for(let i = 0; i < preguntaEnPantalla.n; i++) {
            emojisHtml += `<div class="grupo-emoji">${iconos[preguntaEnPantalla.t].repeat(preguntaEnPantalla.t)}</div>`;
        }
        document.getElementById('visualizacion-emojis').innerHTML = emojisHtml;
        document.getElementById('visualizacion-emojis').style.display = 'flex';
    } else {
        document.getElementById('pregunta').innerHTML = `${preguntaEnPantalla.t} x ${preguntaEnPantalla.n} =`;
        document.getElementById('visualizacion-emojis').style.display = 'none';
        tiempoRestante = 20;
        document.getElementById('tiempo-texto').innerText = tiempoRestante;
        temporizador = setInterval(relojTick, 1000);
    }
    generarOpciones();
}

function relojTick() {
    tiempoRestante--;
    document.getElementById('tiempo-texto').innerText = tiempoRestante;
    if (tiempoRestante <= 0) { clearInterval(temporizador); procesarRespuesta(false, "¡Tiempo agotado! ⏰"); }
}

function generarOpciones() {
    let correcta = preguntaEnPantalla.t * preguntaEnPantalla.n;
    let opciones = [correcta];
    while (opciones.length < 4) {
        let error = preguntaEnPantalla.t * (Math.floor(Math.random() * 10) + 1);
        if (!opciones.includes(error)) opciones.push(error);
    }
    opciones.sort(() => Math.random() - 0.5);
    const contenedor = document.getElementById('opciones-container');
    contenedor.innerHTML = "";
    opciones.forEach(num => {
        let btn = document.createElement('button');
        btn.className = 'btn-opcion';
        btn.innerText = num;
        btn.onclick = () => procesarRespuesta(num === correcta, num === correcta ? "¡Excelente! 🎉" : "¡Incorrecto! ❌");
        contenedor.appendChild(btn);
    });
}

function procesarRespuesta(esCorrecta, mensaje) {
    clearInterval(temporizador);
    habilitarBotones(false); 
    const feedback = document.getElementById('mensaje-feedback');
    feedback.innerText = mensaje;
    if (esCorrecta) {
        sonidos.acierto.play();
        feedback.style.color = "#4CAF50";
        if (esModoEvaluacion) puntajeEvaluacion += 10;
    } else {
        sonidos.error.play();
        feedback.style.color = "#FF6B6B";
        if (esModoEvaluacion) { puntajeEvaluacion -= 10; if (puntajeEvaluacion < 0) puntajeEvaluacion = 0; }
    }
    actualizarMarcadorEval();
    puntosActuales++; 
    actualizarBarra();
    if (puntosActuales >= puntosParaGanar) setTimeout(mostrarVictoria, 1000);
    else setTimeout(generarPregunta, 1500);
}

function actualizarBarra() { document.getElementById('progress-bar').style.width = (puntosActuales / puntosParaGanar * 100) + "%"; }
function actualizarMarcadorEval() { document.getElementById('puntaje-texto').innerText = puntajeEvaluacion; }
function habilitarBotones(estado) { document.querySelectorAll('.btn-opcion').forEach(btn => btn.disabled = !estado); }

function mostrarVictoria() {
    sonidos.victoria.play();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
    if (esModoEvaluacion) {
        document.getElementById('resultado-evaluacion').classList.remove('hidden');
        document.getElementById('puntaje-final-texto').innerText = puntajeEvaluacion;
        document.getElementById('mensaje-victoria-normal').classList.add('hidden');
    } else {
        document.getElementById('resultado-evaluacion').classList.add('hidden');
        document.getElementById('mensaje-victoria-normal').classList.remove('hidden');
    }
}

function volverAlMenu() {
    clearInterval(temporizador);
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('menu-screen').classList.remove('hidden');
}

function salirDelJuego() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    location.reload();
}
