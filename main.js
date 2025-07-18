// Configuración del juego
const GAME_CONFIG = {
    pointsPerChico: 30,
    numChicos: 1,
    allowFlor: true
};

const nivelTruco = 0;
const nivelEnvido = 0;
const personaTruco = 0;
const personaEnvido = 0;

// Sistema de carga diferida para recursos no esenciales
let lazyLoadComplete = false;
const lazyLoadQueue = [];

function lazyLoadResources() {
    if (lazyLoadComplete) return;
    
    const nonEssentialCartas = [
        '4deespada.png', '4debasto.png', '4deoro.png', '4decopa.png',
        '5deespada.png', '5debasto.png', '5deoro.png', '5decopa.png',
        '6deespada.png', '6debasto.png', '6deoro.png', '6decopa.png'
    ];
    
    const nonEssentialMusica = ['laley.mp3', 'sodita.mp3', 'airbag.mp3'];
    
    console.log('🔄 Iniciando carga diferida de recursos no esenciales...');
    
    // Cargar cartas no esenciales en segundo plano
    nonEssentialCartas.forEach(carta => {
        const img = new Image();
        img.onload = () => {
            console.log(`✅ Carta diferida cargada: ${carta}`);
        };
        img.onerror = () => {
            console.warn(`⚠️ Error cargando carta diferida: ${carta}`);
        };
        img.src = `./resources/cartas/${carta}`;
    });
    
    // Cargar música no esencial en segundo plano
    nonEssentialMusica.forEach(track => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.oncanplaythrough = () => {
            console.log(`✅ Música diferida cargada: ${track}`);
        };
        audio.onerror = () => {
            console.warn(`⚠️ Error cargando música diferida: ${track}`);
        };
        audio.src = `./resources/musica/${track}`;
    });
    
    lazyLoadComplete = true;
}

// Verificación de recursos
function verificarRecursos() {
    console.log('🔍 Verificando recursos...');
    
    // Verificar audio
    const audio = document.getElementById('musicaFondo');
    if (audio) {
        audio.addEventListener('error', () => {
            console.error('❌ Error cargando audio: resources/musica/840rodrigo.mp3');
        });
        audio.addEventListener('canplaythrough', () => {
            console.log('✅ Audio cargado correctamente');
        });
    }
    
    // Verificar algunas imágenes de prueba
    const imagenesPrueba = [
        './resources/cartas/1deespada.png',
        './resources/cartas/dorsocard.png'
    ];
    
    imagenesPrueba.forEach((src, index) => {
        const img = new Image();
        img.onload = () => {
            console.log(`✅ Imagen ${index + 1} cargada: ${src}`);
        };
        img.onerror = () => {
            console.error(`❌ Error cargando imagen ${index + 1}: ${src}`);
        };
        img.src = src;
    });
}

// Ejecutar verificación cuando se carga la página
document.addEventListener('DOMContentLoaded', verificarRecursos);

// Iniciar carga diferida después de un breve delay
setTimeout(lazyLoadResources, 2000);

// Palos y valores
const SUITS = ['espada', 'basto', 'oro', 'copa'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

// Poder de las cartas para truco (de mayor a menor)
const TRUCO_POWER = {
    '1espada': 14, // As de espadas (la mayor)
    '1basto': 13,  // As de bastos
    '7espada': 12, // Siete de espadas (manilla)
    '7oro': 11,    // Siete de oros (manilla)
    '3': 10,       // Treses
    '2': 9,        // Doses
    '1': 8,        // Ases falsos (oros y copas)
    '12': 7,       // Doces
    '11': 6,       // Onces
    '10': 5,       // Dieces
    '7': 4,        // Sietes falsos (copas y bastos)
    '6': 3,        // Seises
    '5': 2,        // Cincos
    '4': 1         // Cuatros
};

// Valores para envido
const ENVIDO_VALUES = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '10': 0, '11': 0, '12': 0
};

// Estado del juego
let gameState = {
    deck: [],
    playerHand: [],
    cpuHand: [],
    playerTricks: 0,
    cpuTricks: 0,
    turn: 0, // 0 = jugador, 1 = CPU
    isPlayerMano: true,
    currentRound: 1,
    playerPoints: 0,
    cpuPoints: 0,
    playerChicos: 0,
    cpuChicos: 0,
    trucoLevel: 0,
    envidoLevel: 0,
    florLevel: 0,
    hasEnvido: false,
    hasFlor: false,
    cardsPlayed: [],
    roundWinner: null,
    gamePhase: 'waiting',
    // Nuevas variables para controlar envido
    envidoCantado: false, // Si ya se cantó envido en esta ronda
    manoActual: 1, // Contador de manos en la ronda (1, 2, 3)
    // Variables para estadísticas
    gameStartTime: null,
    totalTimePlayed: 0,
    turnsPlayed: 0,
    comodinesUsados: 0,
    // Historial de bazas
    bazasHistorial: [] // Array para almacenar todas las bazas jugadas
};

// Nuevo: Estado de canto pendiente
let cantoPendiente = null; // { tipo: 'truco'|'envido'|'flor', nivel: 1|2|3, quien: 'cpu'|'player' }

// Elementos del DOM
const elements = {
    playerArea: document.getElementById('playerArea'),
    cpuArea: document.getElementById('cpuArea'),
    playArea: document.getElementById('playArea'),
    message: document.getElementById('message'),
    btnStart: document.getElementById('btnStart'),
    btnTruco: document.getElementById('btnTruco'),
    btnEnvido: document.getElementById('btnEnvido'),
    btnFlor: document.getElementById('btnFlor'),
    playerScore: document.getElementById('playerScore'),
    cpuScore: document.getElementById('cpuScore'),
    roundInfo: document.getElementById('roundInfo'),
    turnInfo: document.getElementById('turnInfo'),
    trucoStatus: document.getElementById('trucoStatus'),
    envidoStatus: document.getElementById('envidoStatus'),
    florStatus: document.getElementById('florStatus'),
    cantoResponse: document.getElementById('cantoResponse'),
    bazasContainer: document.getElementById('bazasContainer'),
    playerPointsDisplay: document.getElementById('playerPointsDisplay'),
    cpuPointsDisplay: document.getElementById('cpuPointsDisplay'),
    highScoreDisplay: document.getElementById('highScoreDisplay'),
    runScoreDisplay: document.getElementById('runScoreDisplay'),
    // Barra de tiempo (se crea si no existe)
    turnoBar: document.getElementById('turnoBar') || (() => {
        const bar = document.createElement('div');
        bar.id = 'turnoBar';
        bar.style.position = 'fixed';
        bar.style.top = '0';
        bar.style.right = '0';
        bar.style.width = '32px';
        bar.style.height = '100vh';
        bar.style.background = 'rgba(0,0,0,0.08)';
        bar.style.zIndex = '1000';
        bar.style.display = 'none';
        bar.innerHTML = `
            <div id="turnoBarInner" style="width:100%;height:100%;background:linear-gradient(to top,#4e9cff,#b3d8ff);transition:height 0.2s;position:relative;"></div>
            <div id="turnoBarText" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg);color:#222;font-weight:bold;font-size:14px;pointer-events:none;white-space:nowrap;">TIEMPO</div>
            <div id="turnoBarSeconds" style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);color:#222;font-size:13px;font-weight:bold;pointer-events:none;">15s</div>
        `;
        document.body.appendChild(bar);
        return bar;
    })()
};

// Event listeners
elements.btnStart.onclick = startNewGame;
elements.btnTruco.onclick = handleTruco;
elements.btnEnvido.onclick = handleEnvido;
elements.btnFlor.onclick = handleFlor;

// Inicializar historial de bazas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    renderizarHistorialBazas();
    actualizarContadoresPuntos();
    
    // Asegurar que los contadores se muestren correctamente
    setTimeout(() => {
        actualizarContadoresPuntos();
    }, 100);
});

// Función para actualizar los contadores de puntos
function actualizarContadoresPuntos() {
    // Actualizar puntos del jugador
    if (elements.playerPointsDisplay) {
        elements.playerPointsDisplay.textContent = gameState.playerPoints;
        // Agregar animación si los puntos cambiaron
        if (elements.playerPointsDisplay.dataset.lastValue !== gameState.playerPoints.toString()) {
            elements.playerPointsDisplay.classList.add('updated');
            setTimeout(() => {
                elements.playerPointsDisplay.classList.remove('updated');
            }, 600);
            elements.playerPointsDisplay.dataset.lastValue = gameState.playerPoints.toString();
        }
    }
    
    // Actualizar puntos de la CPU
    if (elements.cpuPointsDisplay) {
        elements.cpuPointsDisplay.textContent = gameState.cpuPoints;
        // Agregar animación si los puntos cambiaron
        if (elements.cpuPointsDisplay.dataset.lastValue !== gameState.cpuPoints.toString()) {
            elements.cpuPointsDisplay.classList.add('updated');
            setTimeout(() => {
                elements.cpuPointsDisplay.classList.remove('updated');
            }, 600);
            elements.cpuPointsDisplay.dataset.lastValue = gameState.cpuPoints.toString();
        }
    }
    
    // Actualizar récord personal
    const highScore = localStorage.getItem('trucoHighScore') || 0;
    if (elements.highScoreDisplay) {
        elements.highScoreDisplay.textContent = highScore;
    }
    
    // Actualizar puntos de la run
    if (elements.runScoreDisplay) {
        elements.runScoreDisplay.textContent = currentRunScore;
        // Agregar animación si los puntos de la run cambiaron
        if (elements.runScoreDisplay.dataset.lastValue !== currentRunScore.toString()) {
            elements.runScoreDisplay.classList.add('updated');
            setTimeout(() => {
                elements.runScoreDisplay.classList.remove('updated');
            }, 600);
            elements.runScoreDisplay.dataset.lastValue = currentRunScore.toString();
        }
    }
}

// Función para verificar y actualizar high score
function verificarHighScore() {
    const currentHighScore = parseInt(localStorage.getItem('trucoHighScore') || 0);
    if (currentRunScore > currentHighScore) {
        localStorage.setItem('trucoHighScore', currentRunScore.toString());
        if (elements.highScoreDisplay) {
            elements.highScoreDisplay.textContent = currentRunScore;
            elements.highScoreDisplay.classList.add('updated');
            setTimeout(() => {
                elements.highScoreDisplay.classList.remove('updated');
            }, 600);
        }
        return true; // Nuevo récord
    }
    return false; // No es récord
}

// Control de volumen
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

volumeSlider.addEventListener('input', function() {
    const volume = this.value / 100;
    const audioElement = document.getElementById('musicaFondo');
    if (audioElement) {
        audioElement.volume = volume;
        console.log('Volumen cambiado a:', volume); // Debug
    } else {
        console.log('Elemento de audio no encontrado'); // Debug
    }
    volumeValue.textContent = this.value + '%';
});

// Establecer volumen inicial
document.addEventListener('DOMContentLoaded', function() {
    const audioElement = document.getElementById('musicaFondo');
    if (audioElement) {
        audioElement.volume = 0.5; // 50% por defecto
        console.log('Volumen inicial establecido en 0.5');
    }
});

// --- HISTORIAL DE MENSAJES ---
const MAX_MSG = 3;
let gameMessages = [];

function pushGameMessage(msg) {
    gameMessages.push(msg);
    if (gameMessages.length > MAX_MSG) gameMessages = gameMessages.slice(-MAX_MSG);
    renderGameMessages();
}

function renderGameMessages() {
    const msgDiv = elements.message;
    msgDiv.innerHTML = gameMessages.map(m => `<span>${m}</span>`).join('<br>');
}

// Funciones principales
function buildDeck() {
    gameState.deck = [];
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            gameState.deck.push({
                suit: suit,
                rank: rank,
                code: `${rank}${suit}`,
                envidoValue: ENVIDO_VALUES[rank] || 0
            });
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- MÚSICA DE FONDO AL INICIAR PRIMERA RONDA ---
// --- SOUNDTRACK DINÁMICO ---
const soundtrackTracks = [
  { id: 'musicaFondo', mood: 'epic' },
  { id: 'musicaLaley', mood: 'tense' },
  { id: 'musicaSodita', mood: 'rock' },
  { id: 'musicaAirbag', mood: 'neutral' }
];
let currentTrack = null;
let lastTrack = null;
let soundtrackStarted = false;

function getGameMood() {
  if (gameState.gamePhase === 'finished') return 'neutral';
  if (gameState.playerPoints > gameState.cpuPoints + 7) return 'epic';
  if (gameState.cpuPoints > gameState.playerPoints + 7) return 'tense';
  if (Math.abs(gameState.playerPoints - gameState.cpuPoints) <= 5) return 'rock';
  return 'neutral';
}

function pickNextTrack(mood) {
  let candidates = soundtrackTracks.filter(t => t.mood === mood && t.id !== lastTrack);
  if (candidates.length === 0) candidates = soundtrackTracks.filter(t => t.id !== lastTrack);
  if (candidates.length === 0) candidates = soundtrackTracks;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function fadeOut(audio, cb) {
  let v = audio.volume;
  let step = v / 15;
  let fade = setInterval(() => {
    v -= step;
    if (v <= 0.01) {
      audio.volume = 0;
      audio.pause();
      clearInterval(fade);
      if (cb) cb();
    } else {
      audio.volume = v;
    }
  }, 50);
}

function fadeIn(audio, targetVol) {
  audio.volume = 0;
  audio.play();
  let v = 0;
  let step = targetVol / 15;
  let fade = setInterval(() => {
    v += step;
    if (v >= targetVol) {
      audio.volume = targetVol;
      clearInterval(fade);
    } else {
      audio.volume = v;
    }
  }, 50);
}

function playSoundtrack(mood) {
  const vol = volumeSlider.value / 100;
  const next = pickNextTrack(mood);
  if (currentTrack && currentTrack !== next.id) {
    const prevAudio = document.getElementById(currentTrack);
    fadeOut(prevAudio, () => {
      lastTrack = currentTrack;
      currentTrack = next.id;
      const audio = document.getElementById(currentTrack);
      audio.currentTime = 0;
      fadeIn(audio, vol);
      audio.play().catch(() => mostrarMensajeSonido());
    });
  } else if (!currentTrack) {
    currentTrack = next.id;
    const audio = document.getElementById(currentTrack);
    audio.currentTime = 0;
    fadeIn(audio, vol);
    audio.play().catch(() => mostrarMensajeSonido());
  }
}

function stopAllSoundtrack() {
  soundtrackTracks.forEach(t => {
    const audio = document.getElementById(t.id);
    audio.pause();
    audio.currentTime = 0;
  });
  currentTrack = null;
}

function mostrarMensajeSonido() {
  if (document.getElementById('msg-sonido')) return;
  const msg = document.createElement('div');
  msg.id = 'msg-sonido';
  msg.textContent = '🔊 Haz click en cualquier parte para habilitar el sonido.';
  msg.style.position = 'fixed';
  msg.style.top = '20%';
  msg.style.left = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.background = '#222';
  msg.style.color = '#fff';
  msg.style.fontSize = '1.5em';
  msg.style.fontWeight = 'bold';
  msg.style.padding = '18px 36px';
  msg.style.borderRadius = '18px';
  msg.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
  msg.style.zIndex = 99999;
  msg.style.opacity = 0.97;
  document.body.appendChild(msg);
  document.body.addEventListener('click', habilitarSonidoPorInteraccion, { once: true });
}

function habilitarSonidoPorInteraccion() {
  playSoundtrack(getGameMood());
  const msg = document.getElementById('msg-sonido');
  if (msg && msg.parentNode) msg.parentNode.removeChild(msg);
}

function syncAllAudioVolume() {
  const vol = volumeSlider.value / 100;
  soundtrackTracks.forEach(t => {
    const audio = document.getElementById(t.id);
    if (audio) audio.volume = vol;
  });
}

// Hook para iniciar soundtrack al empezar la primera ronda
let startNewGameOriginalSound = startNewGame;
startNewGame = function() {
  if (!soundtrackStarted) {
    soundtrackStarted = true;
    playSoundtrack(getGameMood());
  } else {
    playSoundtrack(getGameMood());
  }
  startNewGameOriginalSound();
};

// Detener soundtrack al terminar la partida
const endGameOriginal = endGame;
endGame = function() {
  stopAllSoundtrack();
  soundtrackStarted = false;
  endGameOriginal();
};

// Sincronizar volumen de todos los audios al cargar la página
document.addEventListener('DOMContentLoaded', syncAllAudioVolume);

// Cambiar soundtrack si cambia el volumen
volumeSlider.addEventListener('input', function() {
  syncAllAudioVolume();
});

document.addEventListener('DOMContentLoaded', function() {
  syncAllAudioVolume();
  const btnStart = document.getElementById('btnStart');
  if (btnStart) {
    btnStart.addEventListener('click', function() {
      if (!soundtrackStarted) {
        soundtrackStarted = true;
        playSoundtrack(getGameMood());
      }
    }, { capture: true });
  }
});

// --- FIN SOUNDTRACK DINÁMICO ---

// --- INICIO: RUN INFINITA Y SCORE ---
let highestScore = localStorage.getItem('truco_highest_score') ? parseInt(localStorage.getItem('truco_highest_score')) : 0;
let currentRunScore = 0;
let proceduralLevel = 1;

function checkProceduralDifficulty() {
    // Aumenta la dificultad cada 3 chicos ganados
    proceduralLevel = 1 + Math.floor(currentRunScore / 3);
    // Aquí podrías modificar la IA, el mazo, etc. según proceduralLevel
}

function showGameOverScreen() {
    // Oculta elementos de juego
    document.getElementById('table').classList.add('oculto');
    document.getElementById('actions').classList.add('oculto');
    // Muestra pantalla de game over y score
    let over = document.getElementById('gameOverScreen');
    if (!over) {
        over = document.createElement('div');
        over.id = 'gameOverScreen';
        over.style.position = 'fixed';
        over.style.top = '0';
        over.style.left = '0';
        over.style.width = '100vw';
        over.style.height = '100vh';
        over.style.background = 'rgba(0,0,0,0.9)';
        over.style.display = 'flex';
        over.style.flexDirection = 'column';
        over.style.alignItems = 'center';
        over.style.justifyContent = 'center';
        over.style.zIndex = '9999';
        over.style.color = '#fff';
        over.style.backdropFilter = 'blur(10px)';
        over.innerHTML = `
            <h1 style='font-size:3em;margin-bottom:0.5em;color:#ffd700;text-shadow:0 0 20px #ffd700;'>🏆 RUN TERMINADA</h1>
            <div style='background:rgba(255,255,255,0.1);padding:2em;border-radius:20px;margin:1em 0;backdrop-filter:blur(10px);border:2px solid rgba(255,215,0,0.3);'>
                <h2 style='font-size:2em;margin-bottom:0.5em;'>Puntaje Final: <span id='runScore' style='color:#4CAF50;'>${currentRunScore}</span></h2>
                <h3 style='font-size:1.5em;margin-bottom:1em;'>Récord: <span id='maxScore' style='color:#ffd700;'>${highestScore}</span></h3>
                <div style='font-size:1.2em;margin:1em 0;'>
                    <div>🧍‍♂️ Tu multiplicador final: <span style='color:#4CAF50;'>x${playerMultiplier}</span></div>
                    <div>🤖 Multiplicador CPU: <span style='color:#FF5722;'>x${cpuMultiplier}</span></div>
                </div>
            </div>
            <button id='btnNewRun' style='font-size:1.5em;padding:1em 2em;margin-top:1em;background:linear-gradient(145deg,#4CAF50,#45a049);color:#fff;border:none;border-radius:15px;cursor:pointer;box-shadow:0 8px 32px rgba(76,175,80,0.3);transition:all 0.3s ease;'>🚀 Nueva Run</button>
        `;
        document.body.appendChild(over);
    } else {
        over.style.display = 'flex';
        document.getElementById('runScore').textContent = currentRunScore;
        document.getElementById('maxScore').textContent = highestScore;
    }
    // Actualizo el recordBanner también
    updateHighScoreUI();
    document.getElementById('btnNewRun').onclick = () => {
        over.style.display = 'none';
        startInfiniteRun();
    };
}

function startInfiniteRun() {
    currentRunScore = 0;
    proceduralLevel = 1;
    gameState.playerChicos = 0;
    gameState.cpuChicos = 0;
    gameState.playerPoints = 0;
    gameState.cpuPoints = 0;
    gameState.currentRound = 1;
    resetMultipliers();
    updateHighScoreUI();
    document.getElementById('table').classList.remove('oculto');
    document.getElementById('actions').classList.remove('oculto');
    let over = document.getElementById('gameOverScreen');
    if (over) over.style.display = 'none';
    
    // Mostrar contador de puntos
    const pointsContainer = document.getElementById('pointsContainer');
    if (pointsContainer) {
        pointsContainer.style.display = 'flex';
    }
    
    startNewGame();
    updateScores();
    updateRunScoreUI();
    updateMultiplierUI(); // Inicializar UI de multiplicadores
}

function updateRunScoreUI() {
    const el = document.getElementById('runScoreMain');
    if (el) el.textContent = currentRunScore;
    
    // Actualizar también el contador de puntos de la run en el nuevo display
    if (elements.runScoreDisplay) {
        elements.runScoreDisplay.textContent = currentRunScore;
        // Agregar animación si los puntos cambiaron
        if (elements.runScoreDisplay.dataset.lastValue !== currentRunScore.toString()) {
            elements.runScoreDisplay.classList.add('updated');
            setTimeout(() => {
                elements.runScoreDisplay.classList.remove('updated');
            }, 600);
            elements.runScoreDisplay.dataset.lastValue = currentRunScore.toString();
        }
    }
}

function startNewGame() {
    // Limpiar estados y ocultar botones de nueva ronda
    document.getElementById('actions2').classList.add('oculto');
    document.getElementById('btnStart').textContent = '🚀 Nueva Ronda';
    document.getElementById('rules').classList.add('oculto');
    // Reiniciar variables de ronda
    buildDeck();
    shuffle(gameState.deck);
    gameState.playerHand = gameState.deck.splice(0, 3);
    gameState.cpuHand = gameState.deck.splice(0, 3);
    gameState.playerTricks = 0;
    gameState.cpuTricks = 0;
    // Cambiar mano solo si no es la primera ronda
    if (gameState.currentRound === 1) {
        gameState.isPlayerMano = Math.random() < 0.5;
    } else {
        gameState.isPlayerMano = !gameState.isPlayerMano;
    }
    gameState.turn = gameState.isPlayerMano ? 0 : 1;
    gameState.currentRound++;
    currentRound = gameState.currentRound;
    gameState.trucoLevel = 0;
    gameState.envidoLevel = 0;
    gameState.florLevel = 0;
    gameState.hasEnvido = false;
    gameState.hasFlor = false;
    gameState.cardsPlayed = [];
    gameState.roundWinner = null;
    gameState.gamePhase = 'playing';
    gameState.envidoCantado = false;
    gameState.manoActual = 1;
    
    // Limpiar historial de bazas para nueva ronda
    gameState.bazasHistorial = [];
    renderizarHistorialBazas();
    
    // Mostrar la mesa para la nueva mano
    mostrarMesa();
    
    renderHands();
    renderPlayArea();
    updateMessage();
    updateButtons();
    const manoText = gameState.isPlayerMano ? 'TÚ' : 'LA CPU';
    pushGameMessage(`🎯 ${manoText} ES MANO - ¡COMIENZA EL JUEGO!`);
    if (gameState.turn === 1) {
        setTimeout(() => {
            cpuPlay();
        }, 2000);
    } else {
        startTurnTimeout();
    }
}

function createCardElement(card, owner, clickable = false, index = null, isBack = false) {
    // Usar un contenedor para el flip
    const cardContainer = document.createElement('div');
    cardContainer.className = `card-flip-container`;
    const cardElement = document.createElement(clickable ? 'button' : 'div');
    cardElement.className = `card ${owner}-card`;
    cardElement.dataset.power = getTrucoPower(card);
    if (index !== null) {
        cardElement.dataset.index = index;
    }
    // Tooltip con el nombre de la carta
    let palo = String(card.suit).toLowerCase().replace(/s$/, '');
    palo = palo.replace(/\s/g, '');
    cardElement.setAttribute('data-tooltip', `${card.rank} de ${palo}`);
    // Imagen de la carta
    const ruta = `./resources/cartas/${card.rank}de${palo}.png`;
    const img = new Image();
    img.src = ruta;
    img.onerror = () => {
        console.log('Error cargando imagen:', ruta);
        cardElement.textContent = `${card.rank} de ${palo}`;
    };
    img.onload = () => {
        cardElement.innerHTML = '';
        cardElement.appendChild(img);
    };
    // Para cartas jugadas, permitir flip
    if (owner === 'player' || owner === 'cpu') {
        cardContainer.appendChild(cardElement);
        // Si es carta jugada, permitir flip
        if (card.played || isBack) {
            cardContainer.classList.add('flippable');
            cardContainer.classList.toggle('flipped', !!card.flipped);
            // Lado dorso
            const backDiv = document.createElement('div');
            backDiv.className = 'card card-back';
            const backImg = new Image();
            backImg.src = './resources/cartas/dorsocard.png';
            backImg.style.width = '100%';
            backImg.style.height = '100%';
            backImg.style.objectFit = 'cover';
            backImg.onerror = () => {
                console.log('Error cargando dorso de carta');
                backDiv.style.background = '#e3e3e3';
                backDiv.textContent = 'DORSO';
            };
            backDiv.appendChild(backImg);
            cardContainer.appendChild(backDiv);
            // Evento flip
            cardContainer.onclick = () => {
                card.flipped = !card.flipped;
                cardContainer.classList.toggle('flipped', !!card.flipped);
            };
        }
        return cardContainer;
    }
    return cardElement;
}

function renderHands() {
    // Renderizar mano del jugador
    elements.playerArea.innerHTML = '<div class="player-label">Tú</div>';
    gameState.playerHand.forEach((card, index) => {
        const cardElement = createCardElement(card, 'player', true, index);
        cardElement.onclick = () => playPlayerCard(index);
        elements.playerArea.appendChild(cardElement);
    });
    // Renderizar mano de la CPU (boca abajo)
    elements.cpuArea.innerHTML = '<div class="player-label">CPU</div>';
    gameState.cpuHand.forEach(() => {
        // Mostrar dorso
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-flip-container';
        const backDiv = document.createElement('div');
        backDiv.className = 'card cpu-card back';
        const backImg = new Image();
        backImg.src = './resources/cartas/dorsocard.png';
        backImg.style.width = '100%';
        backImg.style.height = '100%';
        backImg.style.objectFit = 'cover';
        backImg.onerror = () => {
            console.log('Error cargando dorso de carta en mano CPU');
            backDiv.style.background = '#e3e3e3';
            backDiv.textContent = 'DORSO';
        };
        backDiv.appendChild(backImg);
        cardContainer.appendChild(backDiv);
        elements.cpuArea.appendChild(cardContainer);
    });
}

function renderPlayArea() {
    elements.playArea.innerHTML = '<div class="play-area-label"></div>';
    
    // Mostrar la mesa cuando se están jugando cartas
    mostrarMesa();
    
    // Crear contenedor para las cartas jugadas
    const cardsContainer = document.createElement('div');
    cardsContainer.style.display = 'flex';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.alignItems = 'center';
    cardsContainer.style.gap = '10px';
    cardsContainer.style.position = 'relative';
    cardsContainer.style.zIndex = '10';
    
    gameState.cardsPlayed.forEach((card, idx) => {
        // Marcar como jugada
        card.played = true;
        const cardElement = createCardElement(card, card.owner, false, null);
        cardsContainer.appendChild(cardElement);
    });
    
    elements.playArea.appendChild(cardsContainer);
}

// Función para agregar una baza al historial
function agregarBazaAlHistorial(cards, ganador, numeroBaza) {
    const baza = {
        cards: [...cards],
        ganador: ganador,
        numero: numeroBaza,
        timestamp: Date.now()
    };
    
    gameState.bazasHistorial.push(baza);
    renderizarHistorialBazas();
}

// Función para renderizar el historial de bazas
function renderizarHistorialBazas() {
    if (!elements.bazasContainer) return;
    
    elements.bazasContainer.innerHTML = '';
    
    // Actualizar contador de bazas
    const bazasCount = document.getElementById('bazasCount');
    if (bazasCount) {
        bazasCount.textContent = gameState.bazasHistorial.length;
    }
    
    // Mostrar mensaje si no hay bazas
    if (gameState.bazasHistorial.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#6c757d';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.padding = '20px';
        elements.bazasContainer.appendChild(emptyMessage);
        
        // Mostrar la mesa cuando no hay bazas
        mostrarMesa();
        return;
    }
    
    // Ocultar la mesa cuando hay bazas en el historial
    ocultarMesa();
    
    gameState.bazasHistorial.forEach((baza, index) => {
        const bazaElement = document.createElement('div');
        bazaElement.className = `baza-item ${baza.ganador === 'player' ? 'ganada-jugador' : 'ganada-cpu'}`;
        
        // Determinar qué carta ganó
        const cartaGanadora = baza.cards.reduce((ganadora, carta) => {
            return carta.power > ganadora.power ? carta : ganadora;
        });
        
        const header = `
            <div class="baza-header">
                <span class="baza-numero">Baza ${baza.numero}</span>
                <span class="baza-ganador ${baza.ganador}">${baza.ganador === 'player' ? '🏆 Tú' : '🤖 CPU'}</span>
            </div>
        `;
        
        const cartasHTML = baza.cards.map(carta => {
            const esGanadora = carta === cartaGanadora;
            const cartaClass = esGanadora ? 'baza-carta ganadora' : 'baza-carta';
            const ownerLabel = carta.owner === 'player' ? 'Tú' : 'CPU';
            return `
                <div class="${cartaClass}" title="${ownerLabel}: ${carta.rank} de ${carta.suit}">
                    <img src="./resources/cartas/${carta.rank}de${carta.suit}.png" alt="${carta.rank} de ${carta.suit}">
                    <div class="carta-owner" style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 1px 4px; border-radius: 2px; font-size: 0.6em; white-space: nowrap;">${ownerLabel}</div>
                </div>
            `;
        }).join('');
        
        const cartasContainer = `
            <div class="baza-cartas">
                ${cartasHTML}
            </div>
        `;
        
        bazaElement.innerHTML = header + cartasContainer;
        
        // Agregar animación si es la baza más reciente
        if (index === gameState.bazasHistorial.length - 1) {
            setTimeout(() => {
                bazaElement.classList.add('nueva');
            }, 100);
        }
        
        elements.bazasContainer.appendChild(bazaElement);
    });
    
    // Hacer scroll al final para mostrar la baza más reciente
    if (gameState.bazasHistorial.length > 0) {
        setTimeout(() => {
            elements.bazasContainer.scrollTop = elements.bazasContainer.scrollHeight;
        }, 200);
    }
}

// Función para ocultar la mesa
function ocultarMesa() {
    const playArea = document.getElementById('playArea');
    if (playArea) {
        playArea.style.opacity = '0';
        playArea.style.transform = 'scale(0.8)';
        playArea.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }
}

// Función para mostrar la mesa
function mostrarMesa() {
    const playArea = document.getElementById('playArea');
    if (playArea) {
        playArea.style.opacity = '1';
        playArea.style.transform = 'scale(1)';
        playArea.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }
}

function playPlayerCard(index, porTimeout = false) {
    console.log('Jugador juega carta:', index);
    if (gameState.gamePhase !== 'playing' || gameState.turn !== 0) {
        console.log('No es turno del jugador');
        return;
    }
    clearTimeout(turnoTimeout);
    clearInterval(turnoBarInterval);
    elements.turnoBar.style.display = 'none';
    const card = gameState.playerHand.splice(index, 1)[0];
    
    // Incrementar contador de turnos para estadísticas
    gameState.turnsPlayed++;
    
    // Registrar carta jugada en estadísticas
    if (typeof window.playerStats !== 'undefined') {
        const cardCode = `${card.rank}${card.suit}`;
        const isEnvido = gameState.envidoLevel > 0;
        const isTruco = gameState.trucoLevel > 0;
        window.playerStats.recordCardPlayed(cardCode, false, isEnvido, isTruco);
    }
    
    placeCard(card, 'player');
    renderHands();
    gameState.turn = 1;
    updateMessage();
    updateButtons();
    if (gameState.cardsPlayed.length === 2) {
        setTimeout(evaluateTrick, 1000);
    } else {
        // La CPU juega después de un delay
        setTimeout(cpuPlay, 2000); // SIEMPRE 2 segundos
    }
}

function cpuPlay() {
    if (cpuPuedeCantarTruco()) return;
    if (gameState.turn !== 1) {
        console.log('No es turno de la CPU');
        return;
    }
    let cardToPlay;
    const manoCPU = gameState.cpuHand;
    const manoJugador = gameState.playerHand;
    const cartasJugadas = gameState.cardsPlayed;
    if (aiLevel < 4) {
        if (cartasJugadas.length === 0) {
            if (manoCPU.length === 3) {
                const ordenadas = manoCPU.slice().sort((a, b) => getTrucoPower(b) - getTrucoPower(a));
                cardToPlay = ordenadas[1];
            } else {
                cardToPlay = manoCPU.reduce((best, current) => getTrucoPower(current) < getTrucoPower(best) ? current : best);
            }
        } else if (cartasJugadas.length === 1) {
            const opponentCard = cartasJugadas[0];
            const opponentPower = opponentCard.power;
            const winningCards = manoCPU.filter(card => getTrucoPower(card) > opponentPower);
            if (winningCards.length > 0) {
                cardToPlay = winningCards.reduce((best, current) => getTrucoPower(current) < getTrucoPower(best) ? current : best);
            } else {
                cardToPlay = manoCPU.reduce((best, current) => getTrucoPower(current) < getTrucoPower(best) ? current : best);
            }
        } else {
            cardToPlay = manoCPU[0];
        }
    } else if (aiLevel < 7) {
        if (cartasJugadas.length === 0) {
            cardToPlay = manoCPU.slice().sort((a, b) => getTrucoPower(b) - getTrucoPower(a))[0];
        } else if (cartasJugadas.length === 1) {
            const opponentCard = cartasJugadas[0];
            const winningCards = manoCPU.filter(card => getTrucoPower(card) > opponentCard.power);
            if (winningCards.length > 0) {
                cardToPlay = winningCards[0];
            } else {
                cardToPlay = manoCPU[manoCPU.length - 1];
            }
        } else {
            cardToPlay = manoCPU[0];
        }
    } else {
        let best = manoCPU[0];
        let bestScore = -Infinity;
        for (let c of manoCPU) {
            let score = getTrucoPower(c);
            if (manoJugador.length > 0) {
                let worstPlayer = manoJugador.reduce((a, b) => getTrucoPower(a) < getTrucoPower(b) ? a : b);
                score += getTrucoPower(c) - getTrucoPower(worstPlayer);
            }
            if (score > bestScore) {
                best = c;
                bestScore = score;
            }
        }
        cardToPlay = best;
    }
    const cardIndex = manoCPU.indexOf(cardToPlay);
    const card = manoCPU.splice(cardIndex, 1)[0];
    animateCardPlay('cpu', card);
    placeCard(card, 'cpu');
    renderHands();
    gameState.turn = 0;
    updateMessage();
    updateButtons();
    if (gameState.cardsPlayed.length === 2) {
        setTimeout(evaluateTrick, 1000);
    }
}

function placeCard(card, owner) {
    console.log(`${owner} juega:`, card.rank, card.suit);
    
    gameState.cardsPlayed.push({
        ...card,
        owner: owner,
        power: getTrucoPower(card)
    });
    renderPlayArea();
}

function getTrucoPower(card) {
    return TRUCO_POWER[card.code] || TRUCO_POWER[card.rank] || 0;
}

function evaluateTrick() {
    console.log('Evaluando mano...');
    if (gameState.cardsPlayed.length < 2) return;
    const card1 = gameState.cardsPlayed[0];
    const card2 = gameState.cardsPlayed[1];
    let winner;
    if (card1.power > card2.power) {
        winner = card1.owner;
    } else if (card2.power > card1.power) {
        winner = card2.owner;
    } else {
        winner = gameState.isPlayerMano ? 'player' : 'cpu';
    }
    if (winner === 'player') {
        gameState.playerTricks++;
    } else {
        gameState.cpuTricks++;
    }
    
    // Registrar carta ganadora en estadísticas
    if (typeof window.playerStats !== 'undefined' && winner === 'player') {
        const cardCode = `${card1.owner === 'player' ? card1.rank + card1.suit : card2.rank + card2.suit}`;
        const isEnvido = gameState.envidoLevel > 0;
        const isTruco = gameState.trucoLevel > 0;
        window.playerStats.recordCardPlayed(cardCode, true, isEnvido, isTruco);
    }
    
    // Agregar baza al historial antes de limpiar las cartas
    agregarBazaAlHistorial([...gameState.cardsPlayed], winner, gameState.manoActual);
    
    const winnerText = winner === 'player' ? 'TÚ' : 'LA CPU';
    pushGameMessage(`🏆 ${winnerText} GANÓ LA MANO (${gameState.playerTricks}-${gameState.cpuTricks})`);
    gameState.cardsPlayed = [];
    gameState.manoActual++; // Incrementar contador de manos
    renderPlayArea();
    
    // Deshabilitar envido después de la primera mano
    if (gameState.manoActual > 1) {
        gameState.envidoCantado = true;
    }
    
    if (gameState.playerTricks >= 2 || gameState.cpuTricks >= 2 || 
        (gameState.playerHand.length === 0 && gameState.cpuHand.length === 0)) {
        setTimeout(endRound, 2000);
    } else {
        gameState.turn = winner === 'player' ? 0 : 1;
        updateMessage();
        updateButtons();
        if (gameState.turn === 0) {
            startTurnTimeout();
        }
        if (gameState.turn === 1) {
            setTimeout(cpuPlay, 2000);
        }
    }
}

function endRound() {
    console.log('Finalizando ronda...');
    let roundWinner;
    let roundMessage = '';
    if (gameState.playerTricks > gameState.cpuTricks) {
        roundWinner = 'player';
        roundMessage = '🎉 ¡GANASTE LA RONDA!';
    } else if (gameState.cpuTricks > gameState.playerTricks) {
        roundWinner = 'cpu';
        roundMessage = '😔 La CPU ganó la ronda';
    } else {
        // Empate - gana el mano
        roundWinner = gameState.isPlayerMano ? 'player' : 'cpu';
        roundMessage = `🤝 Empate - Gana ${roundWinner === 'player' ? 'TÚ' : 'LA CPU'} (era mano)`;
    }
    gameState.roundWinner = roundWinner;
    // Calcular puntos
    let points = 1;
    let pointsBreakdown = ['Ronda: +1'];
    if (gameState.trucoLevel > 0) {
        points += gameState.trucoLevel;
        pointsBreakdown.push(`Truco: +${gameState.trucoLevel}`);
    }
    if (gameState.envidoLevel > 0) {
        points += gameState.envidoLevel;
        pointsBreakdown.push(`Envido: +${gameState.envidoLevel}`);
    }
    if (gameState.florLevel > 0) {
        points += gameState.florLevel;
        pointsBreakdown.push(`Flor: +${gameState.florLevel}`);
    }
    if (roundWinner === 'player') {
        gameState.playerPoints += Math.round(points * playerMultiplier);
    } else {
        gameState.cpuPoints += Math.round(points * cpuMultiplier);
    }
    updateMultipliers();
    pushGameMessage(`${roundMessage} - ${points} punto${points > 1 ? 's' : ''} (${pointsBreakdown.join(', ')})`);
    const hadChico = checkChicoWinner();
    updateScores();
    // Si alguien ganó la partida
    if (gameState.playerChicos >= GAME_CONFIG.numChicos || gameState.cpuChicos >= GAME_CONFIG.numChicos) {
        setTimeout(endGame, 2000);
        return;
    }
    // Si la run terminó por diferencia, mostrar game over
    if ((gameState.cpuChicos - gameState.playerChicos) >= 5) {
        if (currentRunScore > highestScore) {
            highestScore = currentRunScore;
            localStorage.setItem('truco_highest_score', highestScore);
        }
        setTimeout(showGameOverScreen, 1500);
        return;
    }
    // SIEMPRE iniciar la siguiente ronda automáticamente
    setTimeout(() => {
        startNewGame();
    }, 2000);
}

function checkChicoWinner() {
    let hadChico = false;
    if (gameState.playerPoints >= GAME_CONFIG.pointsPerChico) {
        gameState.playerChicos++;
        currentRunScore++;
        updateRunScoreUI();
        
        // Verificar si es un nuevo récord
        const esNuevoRecord = verificarHighScore();
        if (esNuevoRecord) {
            pushGameMessage(`🏆 ¡NUEVO RÉCORD! ¡${currentRunScore} puntos!`);
        }
        
        checkProceduralDifficulty();
        gameState.playerPoints = 0;
        gameState.cpuPoints = 0;
        hadChico = true;
        pushGameMessage(`🏆 ¡FELICITACIONES! Ganaste un chico. Marcador: ${gameState.playerChicos} - ${gameState.cpuChicos}`);
    } else if (gameState.cpuPoints >= GAME_CONFIG.pointsPerChico) {
        gameState.cpuChicos++;
        gameState.playerPoints = 0;
        gameState.cpuPoints = 0;
        hadChico = true;
        pushGameMessage(`😔 La CPU ganó un chico. Marcador: ${gameState.playerChicos} - ${gameState.cpuChicos}`);
    }
    if ((gameState.cpuChicos - gameState.playerChicos) >= 5) {
        if (currentRunScore > highestScore) {
            highestScore = currentRunScore;
            localStorage.setItem('truco_highest_score', highestScore);
        }
        setTimeout(showGameOverScreen, 1500);
        return true;
    }
    return hadChico;
}

function endGame() {
    const winner = gameState.playerChicos > gameState.cpuChicos ? 'player' : 'cpu';
    pushGameMessage(winner === 'player' ? 
        '🎉 ¡FELICITACIONES! ¡GANASTE EL JUEGO!' : 
        '😔 La CPU ganó el juego. ¡Mejor suerte la próxima vez!');
    
    gameState.gamePhase = 'finished';
    updateButtons();
}

// Utilidad para mostrar botones contextuales
let cantoTimeout = null; // Timer para cantos de la CPU

function mostrarBotonesCanto(opciones, onClick) {
    elements.cantoResponse.innerHTML = '';
    elements.cantoResponse.style.display = 'block';
    // Si hay un timer previo, limpiarlo
    if (cantoTimeout) {
        clearTimeout(cantoTimeout);
        cantoTimeout = null;
    }
    // Mostrar botones
    opciones.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.className = 'action-btn';
        btn.onclick = () => {
            elements.cantoResponse.style.display = 'none';
            if (cantoTimeout) {
                clearTimeout(cantoTimeout);
                cantoTimeout = null;
            }
            onClick(opt.value);
        };
        elements.cantoResponse.appendChild(btn);
    });
    // Si el canto es de la CPU, iniciar temporizador de 10 segundos
    if (cantoPendiente && cantoPendiente.quien === 'cpu') {
        // Mostrar barra visual (opcional, reutiliza turnoBar)
        const bar = elements.turnoBar;
        bar.style.display = 'block';
        const barInner = bar.querySelector('#turnoBarInner');
        const barSeconds = bar.querySelector('#turnoBarSeconds');
        let time = 10.0;
        barInner.style.height = '100%';
        barSeconds.textContent = '10s';
        if (window.cantoBarInterval) clearInterval(window.cantoBarInterval);
        window.cantoBarInterval = setInterval(() => {
            time -= 0.1;
            let percent = Math.max(0, time / 10.0);
            barInner.style.height = (percent * 100) + '%';
            barSeconds.textContent = Math.ceil(time) + 's';
            if (percent <= 0) {
                clearInterval(window.cantoBarInterval);
            }
        }, 100);
        cantoTimeout = setTimeout(() => {
            // Ocultar barra y botones
            bar.style.display = 'none';
            elements.cantoResponse.style.display = 'none';
            clearInterval(window.cantoBarInterval);
            cantoTimeout = null;
            // Ejecutar automáticamente 'no quiero'
            onClick('noquiero');
        }, 10000);
    } else {
        // Si no es canto de la CPU, ocultar barra
        elements.turnoBar.style.display = 'none';
        if (window.cantoBarInterval) clearInterval(window.cantoBarInterval);
    }
}

function ocultarBotonesCanto() {
    elements.cantoResponse.style.display = 'none';
    elements.cantoResponse.innerHTML = '';
}

// --- Lógica de TRUCO ---
function handleTruco() {
    if (gameState.gamePhase !== 'playing' || gameState.turn !== 0 || cantoPendiente) {
        console.log('No se puede cantar truco ahora');
        return;
    }
    if (gameState.trucoLevel >= 3) {
        console.log('Ya está en el nivel máximo de truco');
        return;
    }
    
    gameState.trucoLevel++;
    gameState.gamePhase = 'truco';
    cantoPendiente = { tipo: 'truco', nivel: gameState.trucoLevel, quien: 'player' };
    
    console.log('Jugador cantó truco - Nivel:', gameState.trucoLevel);
    pushGameMessage(`🎯 Cantaste ${getTrucoText()} - Esperando respuesta de la CPU...`);
    updateButtons();
    
    // Asegurar SIEMPRE respuesta de la CPU
    setTimeout(() => cpuResponderTruco(), 2000);
}

// Función para evaluar la fuerza de una mano
function evaluateHandStrength(hand) {
    if (!hand || hand.length === 0) return 0;
    
    const powers = hand.map(card => getTrucoPower(card));
    const maxPower = Math.max(...powers);
    const avgPower = powers.reduce((sum, power) => sum + power, 0) / powers.length;
    
    // Normalizar el poder máximo (el máximo posible es 14 para el As de espadas)
    const normalizedMax = maxPower / 14;
    const normalizedAvg = avgPower / 14;
    
    // Combinar ambos factores
    return (normalizedMax * 0.7) + (normalizedAvg * 0.3);
}

function cpuResponderTruco() {
    // Solo responder si hay un canto pendiente de truco
    if (!cantoPendiente || cantoPendiente.tipo !== 'truco') {
        console.log('No hay canto pendiente de truco');
        return;
    }
    
    const fuerza = evaluateHandStrength(gameState.cpuHand);
    console.log('CPU evaluando truco - Fuerza:', fuerza, 'Nivel:', gameState.trucoLevel);
    
    // Decisión de la CPU basada en la fuerza de su mano y el nivel actual
    let decisionThreshold = 0.3; // Umbral base para aceptar
    let subirThreshold = 0.7; // Umbral para subir
    
    // Ajustar umbrales según el nivel de truco
    switch (gameState.trucoLevel) {
        case 1: // Truco
            decisionThreshold = 0.3;
            subirThreshold = 0.7;
            break;
        case 2: // Retruco
            decisionThreshold = 0.5;
            subirThreshold = 0.8;
            break;
        case 3: // Vale cuatro
            decisionThreshold = 0.7;
            subirThreshold = 0.9; // Casi imposible subir vale cuatro
            break;
    }
    
    // Decidir si subir el truco
    if (gameState.trucoLevel < 3 && fuerza > subirThreshold && Math.random() < 0.5) {
        // Subir el truco
        gameState.trucoLevel++;
        cantoPendiente = { tipo: 'truco', nivel: gameState.trucoLevel, quien: 'cpu' };
        pushGameMessage(`CPU sube: ${getTrucoText()} - ¿Qué respondes?`);
        mostrarBotonesCanto([
            {text: 'Quiero', value: 'quiero'},
            {text: 'No quiero', value: 'noquiero'}
        ], respuestaTrucoJugador);
    } else if (fuerza > decisionThreshold || Math.random() < 0.6) {
        // Aceptar el truco
        cantoPendiente = null;
        gameState.gamePhase = 'playing';
        pushGameMessage(`✅ CPU aceptó ${getTrucoText()}`);
        updateButtons();
        if (gameState.turn === 1) {
            setTimeout(cpuPlay, 2000);
        }
    } else {
        // No querer el truco
        cantoPendiente = null;
        pushGameMessage(`❌ CPU no quiso ${getTrucoText()}`);
        sumarPuntosTruco('player');
        endRound();
    }
}

function respuestaTrucoJugador(respuesta) {
    ocultarBotonesCanto();
    console.log('Jugador responde truco:', respuesta);
    
    if (respuesta === 'quiero') {
        cantoPendiente = null;
        gameState.gamePhase = 'playing';
        pushGameMessage(`✅ Aceptaste ${getTrucoText()}`);
        updateButtons();
        if (gameState.turn === 1) {
            setTimeout(cpuPlay, 1000);
        }
    } else if (respuesta === 'subir') {
        // Solo permitir subir si la CPU cantó inicialmente (no si el jugador ya cantó)
        if (cantoPendiente && cantoPendiente.quien === 'cpu' && gameState.trucoLevel < 3) {
            gameState.trucoLevel++;
            cantoPendiente = { tipo: 'truco', nivel: gameState.trucoLevel, quien: 'player' };
            pushGameMessage(`Subís: ${getTrucoText()} - Esperando respuesta de la CPU...`);
            setTimeout(() => cpuResponderTruco(), 2000);
        }
    } else if (respuesta === 'envido') {
        // Anular el truco y cantar envido
        gameState.trucoLevel = 0;
        gameState.envidoLevel = 1;
        gameState.hasEnvido = true;
        gameState.envidoCantado = true;
        gameState.gamePhase = 'envido';
        cantoPendiente = { tipo: 'envido', nivel: 1, quien: 'player' };
        pushGameMessage(`🎯 Anulaste el truco y cantaste Envido - Esperando respuesta de la CPU...`);
        setTimeout(() => cpuResponderEnvido(), 2000);
    } else if (respuesta === 'noquiero') {
        cantoPendiente = null;
        pushGameMessage(`❌ No quisiste ${getTrucoText()}`);
        sumarPuntosTruco('cpu');
        endRound();
    }
}

function sumarPuntosTruco(ganador) {
    // Puntos según nivel
    const pts = [1,2,3,4][gameState.trucoLevel] || 1;
    if (ganador === 'player') gameState.playerPoints += pts;
    else gameState.cpuPoints += pts;
    updateScores();
}

// --- CPU puede iniciar cantos aleatorios ---
function cpuPuedeCantarTruco() {
    if (gameState.gamePhase !== 'playing' || cantoPendiente) {
        return false;
    }
    const fuerza = evaluateHandStrength(gameState.cpuHand);
    // Truco solo si no hay truco en curso y la CPU tiene una mano decente
    if (gameState.turn === 1 && gameState.trucoLevel === 0) {
        const probabilidadBase = 0.15;
        const probabilidadPorFuerza = fuerza * 0.3;
        const probabilidadTotal = Math.min(probabilidadBase + probabilidadPorFuerza, 0.45);
        if (Math.random() < probabilidadTotal) {
            gameState.trucoLevel = 1;
            gameState.gamePhase = 'truco';
            cantoPendiente = { tipo: 'truco', nivel: 1, quien: 'cpu' };
            pushGameMessage(`CPU canta Truco - ¿Qué respondes?`);
            mostrarBotonesCanto([
                {text: 'Quiero', value: 'quiero'},
                {text: 'Subir', value: 'subir'},
                {text: 'Envido', value: 'envido'},
                {text: 'No quiero', value: 'noquiero'}
            ], respuestaTrucoJugador);
            return true;
        }
    }
    // CPU puede cantar retruco si ya hay truco aceptado y tiene una mano fuerte
    if (gameState.turn === 1 && gameState.trucoLevel === 1) {
        if (cantoPendiente && cantoPendiente.quien === 'cpu') return false;
        if (fuerza > 0.6 && Math.random() < 0.4) {
            gameState.trucoLevel = 2;
            gameState.gamePhase = 'truco';
            cantoPendiente = { tipo: 'truco', nivel: 2, quien: 'cpu' };
            pushGameMessage(`CPU sube: Retruco - ¿Qué respondes?`);
            mostrarBotonesCanto([
                {text: 'Quiero', value: 'quiero'},
                {text: 'No quiero', value: 'noquiero'}
            ], respuestaTrucoJugador);
            return true;
        }
    }
    // CPU puede cantar vale cuatro si ya hay retruco aceptado y tiene una mano excepcional
    if (gameState.turn === 1 && gameState.trucoLevel === 2) {
        if (cantoPendiente && cantoPendiente.quien === 'cpu') return false;
        if (fuerza > 0.8 && Math.random() < 0.3) {
            gameState.trucoLevel = 3;
            gameState.gamePhase = 'truco';
            cantoPendiente = { tipo: 'truco', nivel: 3, quien: 'cpu' };
            pushGameMessage(`CPU sube: Vale cuatro - ¿Qué respondes?`);
            mostrarBotonesCanto([
                {text: 'Quiero', value: 'quiero'},
                {text: 'No quiero', value: 'noquiero'}
            ], respuestaTrucoJugador);
            return true;
        }
    }
    if (gameState.turn === 1 && !gameState.hasEnvido && !gameState.envidoCantado && gameState.manoActual === 1) {
        const envidoValue = calculateEnvido(gameState.cpuHand);
        if (envidoValue >= 20 && Math.random() < 0.25) {
            gameState.envidoLevel = 1;
            gameState.hasEnvido = true;
            gameState.envidoCantado = true;
            gameState.gamePhase = 'envido';
            cantoPendiente = { tipo: 'envido', nivel: 1, quien: 'cpu' };
            pushGameMessage(`CPU canta Envido - ¿Qué respondes?`);
            mostrarBotonesCanto([
                {text: 'Quiero', value: 'quiero'},
                {text: 'Subir', value: 'subir'},
                {text: 'No quiero', value: 'noquiero'}
            ], respuestaEnvidoJugador);
            return true;
        }
    }
    return false;
}

// --- Respuesta a envido de la CPU ---
function respuestaEnvidoJugador(respuesta) {
    ocultarBotonesCanto();
    console.log('Jugador responde envido:', respuesta);
    
    if (respuesta === 'quiero') {
        const playerEnvido = calculateEnvido(gameState.playerHand);
        const cpuEnvido = calculateEnvido(gameState.cpuHand);
        let puntosEnvido = gameState.envidoLevel === 1 ? 2 : gameState.envidoLevel === 2 ? 3 : 30;
        
        if (playerEnvido > cpuEnvido) {
            pushGameMessage(`🏆 Ganaste el envido (${playerEnvido} vs ${cpuEnvido})`);
            gameState.playerPoints += puntosEnvido;
        } else if (cpuEnvido > playerEnvido) {
            pushGameMessage(`🏆 CPU ganó el envido (${cpuEnvido} vs ${playerEnvido})`);
            gameState.cpuPoints += puntosEnvido;
        } else {
            if (gameState.isPlayerMano) {
                pushGameMessage(`🤝 Empate en envido, ganas por ser mano (${playerEnvido})`);
                gameState.playerPoints += puntosEnvido;
            } else {
                pushGameMessage(`🤝 Empate en envido, CPU gana por ser mano (${cpuEnvido})`);
                gameState.cpuPoints += puntosEnvido;
            }
        }
        updateScores();
        gameState.gamePhase = 'playing';
        // Después del envido, cualquiera puede volver a cantar truco
        gameState.trucoLevel = 0;
        updateButtons();
        if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
    } else if (respuesta === 'subir') {
        // Subir el envido
        if (gameState.envidoLevel < 3) {
            gameState.envidoLevel++;
            cantoPendiente = { tipo: 'envido', nivel: gameState.envidoLevel, quien: 'player' };
            pushGameMessage(`Subís: ${getEnvidoText()} - Esperando respuesta de la CPU...`);
            setTimeout(() => cpuResponderEnvido(), 2000);
        }
    } else if (respuesta === 'noquiero') {
        pushGameMessage('❌ No quisiste el envido');
        gameState.cpuPoints += 1;
        updateScores();
        gameState.gamePhase = 'playing';
        // Después del envido, cualquiera puede volver a cantar truco
        gameState.trucoLevel = 0;
        updateButtons();
        if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
    }
}

// Función para que la CPU responda al envido
function cpuResponderEnvido() {
    if (!cantoPendiente || cantoPendiente.tipo !== 'envido') {
        console.log('No hay canto pendiente de envido');
        return;
    }
    
    const cpuEnvido = calculateEnvido(gameState.cpuHand);
    console.log('CPU evaluando envido - Valor:', cpuEnvido, 'Nivel:', gameState.envidoLevel);
    
    // Decisión de la CPU basada en su valor de envido
    if (cpuEnvido >= 25 || Math.random() < 0.8) {
        // Aceptar el envido
        cantoPendiente = null;
        gameState.gamePhase = 'playing';
        pushGameMessage(`✅ CPU aceptó ${getEnvidoText()}`);
        
        // Resolver envido
        const playerEnvido = calculateEnvido(gameState.playerHand);
        let puntosEnvido = gameState.envidoLevel === 1 ? 2 : gameState.envidoLevel === 2 ? 3 : 30;
        
        if (playerEnvido > cpuEnvido) {
            pushGameMessage(`🏆 Ganaste el envido (${playerEnvido} vs ${cpuEnvido})`);
            gameState.playerPoints += puntosEnvido;
        } else if (cpuEnvido > playerEnvido) {
            pushGameMessage(`🏆 CPU ganó el envido (${cpuEnvido} vs ${playerEnvido})`);
            gameState.cpuPoints += puntosEnvido;
        } else {
            if (gameState.isPlayerMano) {
                pushGameMessage(`🤝 Empate en envido, ganas por ser mano (${playerEnvido})`);
                gameState.playerPoints += puntosEnvido;
            } else {
                pushGameMessage(`🤝 Empate en envido, CPU gana por ser mano (${cpuEnvido})`);
                gameState.cpuPoints += puntosEnvido;
            }
        }
        updateScores();
        // Después del envido, cualquiera puede volver a cantar truco
        gameState.trucoLevel = 0;
        updateButtons();
        if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
    } else {
        // No querer el envido
        cantoPendiente = null;
        pushGameMessage(`❌ CPU no quiso ${getEnvidoText()}`);
        gameState.playerPoints += 1;
        updateScores();
        gameState.gamePhase = 'playing';
        // Después del envido, cualquiera puede volver a cantar truco
        gameState.trucoLevel = 0;
        updateButtons();
        if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
    }
}

// --- Deshabilitar botones de canto si hay canto pendiente ---
function updateButtons() {
    const canPlay = gameState.gamePhase === 'playing' && gameState.turn === 0 && !cantoPendiente;
    const canCantarEnvido = canPlay && !gameState.hasEnvido && !gameState.envidoCantado && gameState.manoActual === 1;
    
    elements.btnTruco.disabled = !canPlay || gameState.trucoLevel >= 3;
    elements.btnEnvido.disabled = !canCantarEnvido;
    elements.btnFlor.disabled = !canPlay || !GAME_CONFIG.allowFlor || gameState.hasFlor;
    
    // Debug: mostrar estado del envido
    console.log('Estado envido:', {
        canPlay,
        hasEnvido: gameState.hasEnvido,
        envidoCantado: gameState.envidoCantado,
        manoActual: gameState.manoActual,
        canCantarEnvido
    });
}

// Funciones de apuestas
function handleEnvido() {
    if (gameState.gamePhase !== 'playing' || gameState.turn !== 0 || gameState.hasEnvido || cantoPendiente) {
        console.log('No se puede cantar envido ahora');
        return;
    }
    
    // Verificar restricciones de envido
    if (gameState.envidoCantado) {
        pushGameMessage('❌ Ya se cantó envido en esta ronda');
        return;
    }
    
    if (gameState.manoActual > 1) {
        pushGameMessage('❌ Solo se puede cantar envido en la primera mano');
        return;
    }
    
    gameState.envidoLevel++;
    gameState.hasEnvido = true;
    gameState.envidoCantado = true; // Marcar que se cantó envido
    gameState.gamePhase = 'envido';
    cantoPendiente = { tipo: 'envido', nivel: gameState.envidoLevel, quien: 'player' };
    
    const playerEnvido = calculateEnvido(gameState.playerHand);
    console.log('Jugador cantó envido - Nivel:', gameState.envidoLevel, 'Valor:', playerEnvido);
    pushGameMessage(`🎲 Cantaste ${getEnvidoText()} (Tú: ${playerEnvido}) - Esperando respuesta...`);
    updateButtons();
    
    setTimeout(() => {
        const cpuEnvido = calculateEnvido(gameState.cpuHand);
        console.log('CPU evaluando envido - Valor:', cpuEnvido);
        
        // Decisión de la CPU basada en su valor de envido
        if (cpuEnvido >= 20 || Math.random() < 0.7) {
            // Aceptar el envido
            cantoPendiente = null;
            gameState.gamePhase = 'playing';
            pushGameMessage(`✅ CPU aceptó ${getEnvidoText()} (CPU: ${cpuEnvido})`);
            
            // Resolver envido
            let puntosEnvido = gameState.envidoLevel === 1 ? 2 : gameState.envidoLevel === 2 ? 3 : 30;
            if (playerEnvido > cpuEnvido) {
                pushGameMessage(`🏆 Ganaste el envido (${playerEnvido} vs ${cpuEnvido})`);
                gameState.playerPoints += puntosEnvido;
            } else if (cpuEnvido > playerEnvido) {
                pushGameMessage(`🏆 CPU ganó el envido (${cpuEnvido} vs ${playerEnvido})`);
                gameState.cpuPoints += puntosEnvido;
            } else {
                // Empate: gana el mano
                if (gameState.isPlayerMano) {
                    pushGameMessage(`🤝 Empate en envido, ganas por ser mano (${playerEnvido})`);
                    gameState.playerPoints += puntosEnvido;
                } else {
                    pushGameMessage(`🤝 Empate en envido, CPU gana por ser mano (${cpuEnvido})`);
                    gameState.cpuPoints += puntosEnvido;
                }
            }
            updateScores();
            // Después del envido, cualquiera puede volver a cantar truco
            gameState.trucoLevel = 0;
            updateButtons();
            if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
        } else {
            // No querer el envido
            cantoPendiente = null;
            pushGameMessage(`❌ CPU no quiso el envido`);
            gameState.playerPoints += 1;
            updateScores();
            gameState.gamePhase = 'playing';
            // Después del envido, cualquiera puede volver a cantar truco
            gameState.trucoLevel = 0;
            updateButtons();
            if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
        }
    }, 2000);
}

function calculateEnvido(hand) {
    const suits = {};
    hand.forEach(card => {
        if (!suits[card.suit]) {
            suits[card.suit] = [];
        }
        suits[card.suit].push(card);
    });
    let maxEnvido = 0;
    for (let suit in suits) {
        if (suits[suit].length >= 2) {
            const values = suits[suit].map(card => card.envidoValue).sort((a, b) => b - a);
            const envido = values[0] + values[1] + 20;
            if (envido > maxEnvido) maxEnvido = envido;
        }
    }
    // Si no hay dos cartas del mismo palo, tomar el valor más alto de la mano
    if (maxEnvido === 0) {
        maxEnvido = Math.max(...hand.map(card => card.envidoValue));
        if (!isFinite(maxEnvido) || isNaN(maxEnvido)) maxEnvido = 0;
    }
    return maxEnvido;
}

function handleFlor() {
    if (gameState.gamePhase !== 'playing' || gameState.turn !== 0 || !GAME_CONFIG.allowFlor || gameState.hasFlor || cantoPendiente) return;
    if (!puedeCantarFlor()) {
        pushGameMessage('❌ No tienes flor.');
        return;
    }
    gameState.florLevel++;
    gameState.hasFlor = true;
    gameState.gamePhase = 'flor';
    
    const playerFlor = calculateFlor(gameState.playerHand);
    pushGameMessage(`🌸 Cantaste ${getFlorText()} (Tú: ${playerFlor}) - Esperando respuesta...`);
    updateButtons();
    
    setTimeout(() => {
        const cpuFlor = calculateFlor(gameState.cpuHand);
        const cpuAccepts = cpuFlor > 0;
        
        if (cpuAccepts) {
            pushGameMessage(`✅ CPU acepta ${getFlorText()} (Tú: ${playerFlor}, CPU: ${cpuFlor})`);
            gameState.gamePhase = 'playing';
            // Continuar con el juego, no reiniciar la mano
            updateMessage();
            updateButtons();
        } else {
            pushGameMessage(`❌ CPU no quiere ${getFlorText()}`);
            gameState.roundWinner = 'player';
            endRound();
        }
    }, 2000);
}

function calculateFlor(hand) {
    const suits = {};
    hand.forEach(card => {
        if (!suits[card.suit]) {
            suits[card.suit] = [];
        }
        suits[card.suit].push(card);
    });
    
    for (let suit in suits) {
        if (suits[suit].length >= 3) {
            const values = suits[suit].map(card => card.envidoValue).sort((a, b) => b - a);
            return values[0] + values[1] + values[2] + 20;
        }
    }
    
    return 0;
}

function getTrucoText() {
    switch (gameState.trucoLevel) {
        case 1: return 'Truco';
        case 2: return 'Retruco';
        case 3: return 'Vale cuatro';
        default: return '';
    }
}

function getEnvidoText() {
    switch (gameState.envidoLevel) {
        case 1: return 'Envido';
        case 2: return 'Real envido';
        case 3: return 'Falta';
        default: return '';
    }
}

function getFlorText() {
    switch (gameState.florLevel) {
        case 1: return 'Flor';
        case 2: return 'Contra flor';
        case 3: return 'Contra flor al resto';
        default: return '';
    }
}

// Funciones de utilidad
function updateMessage() {
    if (gameState.gamePhase === 'waiting') {
        pushGameMessage('Presiona "Nueva Ronda" para comenzar');
        elements.turnInfo.textContent = 'Esperando...';
        elements.turnoBar.style.display = 'none';
        clearInterval(turnoBarInterval);
        clearTimeout(turnoTimeout);
    } else if (gameState.gamePhase === 'playing') {
        if (gameState.turn === 0) {
            pushGameMessage('Tu turno - Elige una carta');
            elements.turnInfo.textContent = 'Tu turno';
            startTurnTimeout();
        } else {
            pushGameMessage('Turno de la CPU...');
            elements.turnInfo.textContent = 'Turno CPU';
            elements.turnoBar.style.display = 'none';
            clearInterval(turnoBarInterval);
            clearTimeout(turnoTimeout);
        }
    } else if (gameState.gamePhase === 'truco') {
        elements.turnInfo.textContent = 'CPU pensando...';
        elements.turnoBar.style.display = 'none';
        clearInterval(turnoBarInterval);
        clearTimeout(turnoTimeout);
    } else if (gameState.gamePhase === 'envido') {
        elements.turnInfo.textContent = 'CPU pensando...';
        elements.turnoBar.style.display = 'none';
        clearInterval(turnoBarInterval);
        clearTimeout(turnoTimeout);
    } else if (gameState.gamePhase === 'flor') {
        elements.turnInfo.textContent = 'CPU pensando...';
        elements.turnoBar.style.display = 'none';
        clearInterval(turnoBarInterval);
        clearTimeout(turnoTimeout);
    }
    elements.roundInfo.textContent = `Ronda ${gameState.currentRound} - Mano ${gameState.manoActual}`;
    updateBetStatus();
}

function updateScores() {
    elements.playerScore.textContent = `${gameState.playerChicos} (${gameState.playerPoints})`;
    elements.cpuScore.textContent = `${gameState.cpuChicos} (${gameState.cpuPoints})`;
    // Actualizar también los contadores de puntos
    actualizarContadoresPuntos();
}

function updateBetStatus() {
    if (gameState.trucoLevel > 0) {
        elements.trucoStatus.textContent = `🎯 ${getTrucoText()}`;
        elements.trucoStatus.style.display = 'block';
    } else {
        elements.trucoStatus.style.display = 'none';
    }
    
    if (gameState.envidoLevel > 0) {
        elements.envidoStatus.textContent = `🎲 ${getEnvidoText()}`;
        elements.envidoStatus.style.display = 'block';
    } else {
        elements.envidoStatus.style.display = 'none';
    }
    
    if (gameState.florLevel > 0) {
        elements.florStatus.textContent = `🌸 ${getFlorText()}`;
        elements.florStatus.style.display = 'block';
    } else {
        elements.florStatus.style.display = 'none';
    }
}

// Efecto de rotación/flotación aleatoria en hover para cartas
// (esto debe ir al final del archivo o después de la función createCardElement)
document.addEventListener('mouseover', function(e) {
    if (e.target.classList && e.target.classList.contains('card')) {
        // Rotación y flotación aleatoria
        const rot = (Math.random() - 0.5) * 8; // entre -4 y 4 grados
        e.target.style.setProperty('--hover-rot', `${rot}deg`);
    }
});
document.addEventListener('mouseout', function(e) {
    if (e.target.classList && e.target.classList.contains('card')) {
        e.target.style.setProperty('--hover-rot', `0deg`);
    }
});

// --- VALIDACIÓN DE CANTOS ---
function puedeCantarFlor() {
    // Solo si el jugador tiene flor
    const suits = {};
    gameState.playerHand.forEach(card => {
        if (!suits[card.suit]) suits[card.suit] = 0;
        suits[card.suit]++;
    });
    return Object.values(suits).some(count => count === 3);
}

// --- TURNO CON TIEMPO LIMITE ---
let turnoTimeout = null;
let turnoBarInterval = null;
function startTurnTimeout() {
    clearTimeout(turnoTimeout);
    clearInterval(turnoBarInterval);
    if (gameState.turn === 0 && gameState.gamePhase === 'playing') {
        elements.turnoBar.style.display = 'block';
        const barInner = elements.turnoBar.querySelector('#turnoBarInner');
        const barSeconds = elements.turnoBar.querySelector('#turnoBarSeconds');
        let time = 15.0;
        barInner.style.height = '100%';
        barSeconds.textContent = '15s';
        turnoBarInterval = setInterval(() => {
            time -= 0.1;
            let percent = Math.max(0, time / 15.0);
            barInner.style.height = (percent * 100) + '%';
            barSeconds.textContent = Math.ceil(time) + 's';
            if (percent <= 0) {
                clearInterval(turnoBarInterval);
            }
        }, 100);
        turnoTimeout = setTimeout(() => {
            pushGameMessage('⏰ Tiempo agotado, jugaste una carta al azar.');
            if (gameState.playerHand.length > 0) {
                const idx = Math.floor(Math.random() * gameState.playerHand.length);
                playPlayerCard(idx, true); // true = por timeout
            }
        }, 15000);
    } else {
        elements.turnoBar.style.display = 'none';
        clearInterval(turnoBarInterval);
    }
}

// Agregar CSS para flip animado y dorso
(function addFlipCardCSS() {
    const style = document.createElement('style');
    style.innerHTML = `
    .card-flip-container {
        display: inline-block;
        perspective: 600px;
        position: relative;
        width: 140px;
        height: 210px;
        vertical-align: middle;
        margin: 0 8px;
    }
    .card-flip-container .card {
        width: 140px;
        height: 210px;
        border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        background: #fff;
        position: absolute;
        top: 0; left: 0;
        backface-visibility: hidden;
        transition: transform 0.5s cubic-bezier(.4,2,.6,1);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .card-flip-container .card-back {
        background: #e3e3e3;
        transform: rotateY(180deg);
        z-index: 2;
        border: 4px solid #fff !important;
        box-sizing: border-box;
    }
    .card-flip-container.flippable .card {
        cursor: pointer;
    }
    .card-flip-container.flippable .card,
    .card-flip-container.flippable .card-back {
        pointer-events: none;
    }
    .card-flip-container.flippable.flipped .card {
        transform: rotateY(180deg);
    }
    .card-flip-container.flippable.flipped .card-back {
        transform: rotateY(0deg);
        z-index: 3;
    }
    .card-flip-container .card img, .card-flip-container .card-back img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 16px;
    }
    `;
    document.head.appendChild(style);
})();

// Inicialización
console.log('Truco Argentino iniciado');
gameState.gamePhase = 'waiting';
updateMessage();
updateButtons();

// Al cargar la página, iniciar la run infinita automáticamente
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(startInfiniteRun, 500);
});

// Sistema simplificado sin combo
let aiLevel = 1;

function animateCardPlay(owner, card) {
    let area = document.getElementById('playArea');
    if (!area) return;
    let el = document.createElement('div');
    el.className = 'epic-card-anim';
    el.innerText = card.rank + ' ' + card.suit;
    el.style.position = 'absolute';
    el.style.left = owner === 'player' ? '20%' : '70%';
    el.style.top = '40%';
    el.style.fontSize = '3em';
    el.style.fontWeight = 'bold';
    el.style.color = owner === 'player' ? '#4e9cff' : '#ff5722';
    el.style.textShadow = '0 0 20px #fff, 0 0 40px #ff9800';
    el.style.transform = 'scale(1.5) rotate(-10deg)';
    el.style.opacity = '1';
    area.appendChild(el);
    setTimeout(() => {
        el.style.transition = 'all 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
        el.style.left = '45%';
        el.style.top = '50%';
        el.style.transform = 'scale(1) rotate(0deg)';
        el.style.opacity = '0';
    }, 10);
    setTimeout(() => { area.removeChild(el); }, 800);
} 

// Sistema de multiplicadores competitivos
let playerMultiplier = 1.0;
let cpuMultiplier = 0.30;
let currentRound = 1;

// Secuencia procedural para CPU: 0.30 → 0.40 → 0.52 → 0.66 → 0.82 → 1.00 → 1.20 → 1.42 → 1.66...
function getNextCpuMultiplier(current) {
    const delta = 0.10 + (Math.floor(current * 10) - 3) * 0.02; // Crecimiento creciente
    return Math.round((current + delta) * 100) / 100;
}

function updateMultipliers() {
    // Actualizar multiplicador del jugador (+0.1 por ronda)
    playerMultiplier = Math.round((playerMultiplier + 0.1) * 10) / 10;
    
    // Actualizar multiplicador de la CPU (secuencia procedural)
    cpuMultiplier = getNextCpuMultiplier(cpuMultiplier);
    
    // Actualizar UI con animaciones
    updateMultiplierUI();
}

function updateMultiplierUI() {
    const playerEl = document.getElementById('playerMultiplier');
    const cpuEl = document.getElementById('cpuMultiplier');
    
    if (playerEl) {
        playerEl.textContent = `🧍‍♂️ x${playerMultiplier}`;
        playerEl.classList.add('updated');
        setTimeout(() => playerEl.classList.remove('updated'), 2000);
    }
    
    if (cpuEl) {
        cpuEl.textContent = `🤖 x${cpuMultiplier}`;
        cpuEl.classList.add('updated');
        setTimeout(() => cpuEl.classList.remove('updated'), 2000);
    }
}

function resetMultipliers() {
    playerMultiplier = 1.0;
    cpuMultiplier = 0.30;
    currentRound = 1;
    updateMultiplierUI();
}

function updateHighScoreUI() {
    let el = document.getElementById('recordBanner');
    if (el) {
        document.getElementById('highScoreValue').textContent = highestScore;
        el.style.display = 'block';
    }
}

function hideHighScoreUI() {
    let el = document.getElementById('recordBanner');
    if (el) el.style.display = 'none';
}

// Precarga de imágenes de cartas
const cartas = [
  "1debasto.png", "1decopa.png", "1deespada.png", "1deoro.png",
  "2debasto.png", "2decopa.png", "2deespada.png", "2deoro.png",
  "3debasto.png", "3decopa.png", "3deespada.png", "3deoro.png",
  "7debasto.png", "7decopa.png", "7deespada.png", "7deoro.png",
  "10debasto.png", "10decopa.png", "10deoro.png",
  "11debasto.png", "11decopa.png", "11deespada.png", "11deoro.png",
  "12debasto.png", "12decopa.png", "12deespada.png", "12deoro.png",
  "dorsocard.png"
];

function precargarCartas() {
  const ruta = "resources/cartas/";
  cartas.forEach(nombre => {
    const img = new Image();
    img.src = ruta + nombre;
  });
}

// Llama a esta función al cargar la página
window.addEventListener('DOMContentLoaded', precargarCartas);
