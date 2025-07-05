// Configuración del juego
const GAME_CONFIG = {
    pointsPerChico: 30,
    numChicos: 1,
    allowFlor: true
};

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
    gamePhase: 'waiting'
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
let musicaYaSono = false;
function reproducirMusicaFondo() {
    const audio = document.getElementById('musicaFondo');
    if (!audio) {
        console.log('Elemento de audio no encontrado en reproducirMusicaFondo');
        return;
    }
    if (!musicaYaSono) {
        // Asegurar que el volumen esté sincronizado con el slider
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            audio.volume = volumeSlider.value / 100;
        }
        audio.currentTime = 57;
        audio.play().catch((error) => {
            console.log('Error reproduciendo audio:', error);
        });
        musicaYaSono = true;
        console.log('Música iniciada con volumen:', audio.volume);
    }
}

// Modificar startNewGame para llamar a la música
const startNewGameOriginal = startNewGame;
function startNewGameConMusica() {
    reproducirMusicaFondo();
    startNewGameOriginal();
}
elements.btnStart.onclick = startNewGameConMusica;

function startNewGame() {
    console.log('Iniciando nueva ronda...');
    
    buildDeck();
    shuffle(gameState.deck);
    
    gameState.playerHand = gameState.deck.splice(0, 3);
    gameState.cpuHand = gameState.deck.splice(0, 3);
    gameState.playerTricks = 0;
    gameState.cpuTricks = 0;
    
    // Determinar quién es mano
    if (gameState.currentRound === 1) {
        gameState.isPlayerMano = Math.random() < 0.5;
    } else {
        gameState.isPlayerMano = !gameState.isPlayerMano;
    }
    
    // El mano siempre empieza
    gameState.turn = gameState.isPlayerMano ? 0 : 1;
    
    gameState.currentRound++;
    gameState.trucoLevel = 0;
    gameState.envidoLevel = 0;
    gameState.florLevel = 0;
    gameState.hasEnvido = false;
    gameState.hasFlor = false;
    gameState.cardsPlayed = [];
    gameState.roundWinner = null;
    gameState.gamePhase = 'playing';
    
    console.log('Mano:', gameState.isPlayerMano ? 'Jugador' : 'CPU');
    console.log('Turno inicial:', gameState.turn === 0 ? 'Jugador' : 'CPU');
    
    renderHands();
    renderPlayArea();
    updateMessage();
    updateButtons();
    
    // Mostrar quién es mano
    const manoText = gameState.isPlayerMano ? 'TÚ' : 'LA CPU';
    pushGameMessage(`🎯 ${manoText} ES MANO - ¡COMIENZA EL JUEGO!`);
    
    // Si la CPU es mano, que juegue automáticamente
    if (gameState.turn === 1) {
        setTimeout(() => {
            console.log('CPU es mano, jugando automáticamente...');
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
    const ruta = `resources/cartas/${card.rank}de${palo}.png`;
    const img = new Image();
    img.src = ruta;
    img.onerror = () => {
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
            backImg.src = 'resources/cartas/dorsocard.png';
            backImg.style.width = '100%';
            backImg.style.height = '100%';
            backImg.style.objectFit = 'cover';
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
        backImg.src = 'resources/cartas/dorsocard.png';
        backImg.style.width = '100%';
        backImg.style.height = '100%';
        backImg.style.objectFit = 'cover';
        backDiv.appendChild(backImg);
        cardContainer.appendChild(backDiv);
        elements.cpuArea.appendChild(cardContainer);
    });
}

function renderPlayArea() {
    elements.playArea.innerHTML = '<div class="play-area-label">Mesa de Juego</div>';
    gameState.cardsPlayed.forEach((card, idx) => {
        // Marcar como jugada
        card.played = true;
        const cardElement = createCardElement(card, card.owner, false, null);
        elements.playArea.appendChild(cardElement);
    });
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
    // Estrategia mejorada:
    // 1. Si puede ganar la mano, lo intenta
    // 2. Si va ganando, guarda la mejor carta
    // 3. Si va perdiendo, tira la peor
    // 4. Si es la última carta, tira la que queda
    const manoCPU = gameState.cpuHand;
    const manoJugador = gameState.playerHand;
    const cartasJugadas = gameState.cardsPlayed;
    // Si es la primera carta de la ronda
    if (cartasJugadas.length === 0) {
        // Si tiene una carta muy fuerte, la guarda para después
        // Juega la segunda mejor
        if (manoCPU.length === 3) {
            const ordenadas = manoCPU.slice().sort((a, b) => getTrucoPower(b) - getTrucoPower(a));
            cardToPlay = ordenadas[1];
        } else {
            // Si quedan 2, juega la peor
            cardToPlay = manoCPU.reduce((best, current) => getTrucoPower(current) < getTrucoPower(best) ? current : best);
        }
    } else if (cartasJugadas.length === 1) {
        // Si ya hay una carta en la mesa, intentar ganar
        const opponentCard = cartasJugadas[0];
        const opponentPower = opponentCard.power;
        // Buscar una carta que pueda ganar
        const winningCards = manoCPU.filter(card => getTrucoPower(card) > opponentPower);
        if (winningCards.length > 0) {
            // Jugar la carta ganadora más baja
            cardToPlay = winningCards.reduce((best, current) => getTrucoPower(current) < getTrucoPower(best) ? current : best);
        } else {
            // Si no puede ganar, tira la peor
            cardToPlay = manoCPU.reduce((best, current) => getTrucoPower(current) < getTrucoPower(best) ? current : best);
        }
    } else {
        // Última carta, tira la que queda
        cardToPlay = manoCPU[0];
    }
    const cardIndex = manoCPU.indexOf(cardToPlay);
    const card = manoCPU.splice(cardIndex, 1)[0];
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
    const winnerText = winner === 'player' ? 'TÚ' : 'LA CPU';
    pushGameMessage(`🏆 ${winnerText} GANÓ LA MANO (${gameState.playerTricks}-${gameState.cpuTricks})`);
    gameState.cardsPlayed = [];
    renderPlayArea();
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
    let points = 1; // Punto base por ganar la ronda
    let pointsBreakdown = ['Ronda: +1'];
    
    // Sumar puntos de truco si se cantó
    if (gameState.trucoLevel > 0) {
        points += gameState.trucoLevel;
        pointsBreakdown.push(`Truco: +${gameState.trucoLevel}`);
    }
    
    // Sumar puntos de envido si se cantó
    if (gameState.envidoLevel > 0) {
        points += gameState.envidoLevel;
        pointsBreakdown.push(`Envido: +${gameState.envidoLevel}`);
    }
    
    // Sumar puntos de flor si se cantó
    if (gameState.florLevel > 0) {
        points += gameState.florLevel;
        pointsBreakdown.push(`Flor: +${gameState.florLevel}`);
    }
    
    if (roundWinner === 'player') {
        gameState.playerPoints += points;
    } else {
        gameState.cpuPoints += points;
    }
    
    // Mostrar mensaje de la ronda
    pushGameMessage(`${roundMessage} - ${points} punto${points > 1 ? 's' : ''} (${pointsBreakdown.join(', ')})`);
    
    // Verificar si alguien ganó un chico
    const hadChico = checkChicoWinner();
    
    updateScores();
    
    // Preparar siguiente ronda o fin del juego
    if (gameState.playerChicos >= GAME_CONFIG.numChicos || 
        gameState.cpuChicos >= GAME_CONFIG.numChicos) {
        setTimeout(endGame, 3000);
    } else {
        setTimeout(() => {
            gameState.gamePhase = 'waiting';
            elements.btnStart.textContent = 'Siguiente Ronda';
            updateMessage();
        }, 3000);
    }
}

function checkChicoWinner() {
    let hadChico = false;
    
    if (gameState.playerPoints >= GAME_CONFIG.pointsPerChico) {
        gameState.playerChicos++;
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
function mostrarBotonesCanto(opciones, onClick) {
    elements.cantoResponse.innerHTML = '';
    elements.cantoResponse.style.display = 'block';
    opciones.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.className = 'action-btn';
        btn.onclick = () => {
            elements.cantoResponse.style.display = 'none';
            onClick(opt.value);
        };
        elements.cantoResponse.appendChild(btn);
    });
}

function ocultarBotonesCanto() {
    elements.cantoResponse.style.display = 'none';
    elements.cantoResponse.innerHTML = '';
}

// --- Lógica de TRUCO ---
function handleTruco() {
    if (gameState.gamePhase !== 'playing' || gameState.turn !== 0 || cantoPendiente) return;
    if (cantoPendiente && cantoPendiente.quien === 'player') return;
    if (gameState.trucoLevel >= 3) return;
    gameState.trucoLevel++;
    gameState.gamePhase = 'truco';
    cantoPendiente = { tipo: 'truco', nivel: gameState.trucoLevel, quien: 'player' };
    pushGameMessage(`🎯 Cantaste ${getTrucoText()} - Esperando respuesta de la CPU...`);
    updateButtons();
    // Asegurar SIEMPRE respuesta de la CPU
    setTimeout(() => cpuResponderTruco(), 2000);
}

function cpuResponderTruco() {
    // Solo responder si hay un canto pendiente de truco
    if (!cantoPendiente || cantoPendiente.tipo !== 'truco') return;
    const fuerza = evaluateHandStrength(gameState.cpuHand);
    if (gameState.trucoLevel < 3 && fuerza > 0.85 && Math.random() < 0.5) {
        gameState.trucoLevel++;
        cantoPendiente = { tipo: 'truco', nivel: gameState.trucoLevel, quien: 'cpu' };
        pushGameMessage(`CPU sube: ${getTrucoText()} - ¿Qué respondes?`);
        mostrarBotonesCanto([
            {text: 'Quiero', value: 'quiero'},
            {text: gameState.trucoLevel < 3 ? 'Subir' : '', value: 'subir'},
            {text: 'No quiero', value: 'noquiero'}
        ].filter(b=>b.text), respuestaTrucoJugador);
    } else if (fuerza > 0.35 || Math.random() < 0.7) {
        cantoPendiente = null;
        gameState.gamePhase = 'playing';
        pushGameMessage(`✅ CPU aceptó ${getTrucoText()}`);
        updateButtons();
        if (gameState.turn === 1) {
            setTimeout(cpuPlay, 2000);
        }
    } else {
        cantoPendiente = null;
        pushGameMessage(`❌ CPU no quiso ${getTrucoText()}`);
        sumarPuntosTruco('player');
        endRound();
    }
}

function respuestaTrucoJugador(respuesta) {
    ocultarBotonesCanto();
    if (respuesta === 'quiero') {
        cantoPendiente = null;
        gameState.gamePhase = 'playing';
        pushGameMessage(`✅ Aceptaste ${getTrucoText()}`);
        updateButtons();
        if (gameState.turn === 1) {
            setTimeout(cpuPlay, 1000);
        }
    } else if (respuesta === 'subir') {
        gameState.trucoLevel++;
        cantoPendiente = { tipo: 'truco', nivel: gameState.trucoLevel, quien: 'player' };
        pushGameMessage(`Subís: ${getTrucoText()} - Esperando respuesta de la CPU...`);
        setTimeout(() => cpuResponderTruco(), 2000);
    } else {
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
    if (gameState.gamePhase !== 'playing' || cantoPendiente) return;
    // Truco solo si no hay truco en curso
    if (gameState.turn === 1 && gameState.trucoLevel === 0 && Math.random() < 0.18) {
        gameState.trucoLevel = 1;
        cantoPendiente = { tipo: 'truco', nivel: 1, quien: 'cpu' };
        pushGameMessage(`CPU canta Truco - ¿Qué respondes?`);
        mostrarBotonesCanto([
            {text: 'Quiero', value: 'quiero'},
            {text: 'Subir', value: 'subir'},
            {text: 'No quiero', value: 'noquiero'}
        ], respuestaTrucoJugador);
        return true;
    }
    // CPU puede cantar retruco si ya hay truco aceptado
    if (gameState.turn === 1 && gameState.trucoLevel === 1 && Math.random() < 0.10) {
        gameState.trucoLevel = 2;
        cantoPendiente = { tipo: 'truco', nivel: 2, quien: 'cpu' };
        pushGameMessage(`CPU sube: Retruco - ¿Qué respondes?`);
        mostrarBotonesCanto([
            {text: 'Quiero', value: 'quiero'},
            {text: gameState.trucoLevel < 3 ? 'Subir' : '', value: 'subir'},
            {text: 'No quiero', value: 'noquiero'}
        ].filter(b=>b.text), respuestaTrucoJugador);
        return true;
    }
    // CPU puede cantar envido si no se cantó aún
    if (gameState.turn === 1 && !gameState.hasEnvido && Math.random() < 0.12) {
        gameState.envidoLevel = 1;
        gameState.hasEnvido = true;
        gameState.gamePhase = 'envido';
        pushGameMessage(`CPU canta Envido - ¿Qué respondes?`);
        mostrarBotonesCanto([
            {text: 'Quiero', value: 'quiero'},
            {text: 'No quiero', value: 'noquiero'}
        ], respuestaEnvidoJugador);
        return true;
    }
    return false;
}

// --- Respuesta a envido de la CPU ---
function respuestaEnvidoJugador(respuesta) {
    ocultarBotonesCanto();
    if (respuesta === 'quiero') {
        const playerEnvido = calculateEnvido(gameState.playerHand);
        const cpuEnvido = calculateEnvido(gameState.cpuHand);
        let puntosEnvido = 2;
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
        updateButtons();
        if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
    } else {
        pushGameMessage('❌ No quisiste el envido');
        gameState.cpuPoints += 1;
        updateScores();
        gameState.gamePhase = 'playing';
        updateButtons();
        if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
    }
}

// --- Deshabilitar botones de canto si hay canto pendiente ---
function updateButtons() {
    const canPlay = gameState.gamePhase === 'playing' && gameState.turn === 0 && !cantoPendiente;
    elements.btnTruco.disabled = !canPlay || gameState.trucoLevel >= 3;
    elements.btnEnvido.disabled = !canPlay || gameState.hasEnvido;
    elements.btnFlor.disabled = !canPlay || !GAME_CONFIG.allowFlor || gameState.hasFlor;
}

// Funciones de apuestas
function handleEnvido() {
    if (gameState.gamePhase !== 'playing' || gameState.turn !== 0 || gameState.hasEnvido || cantoPendiente) return;
    gameState.envidoLevel++;
    gameState.hasEnvido = true;
    gameState.gamePhase = 'envido';
    const playerEnvido = calculateEnvido(gameState.playerHand);
    pushGameMessage(`🎲 Cantaste ${getEnvidoText()} (Tú: ${playerEnvido}) - Esperando respuesta...`);
    updateButtons();
    setTimeout(() => {
        const cpuEnvido = calculateEnvido(gameState.cpuHand);
        const cpuAccepts = cpuEnvido >= 20;
        if (cpuAccepts) {
            pushGameMessage(`✅ CPU aceptó ${getEnvidoText()} (CPU: ${cpuEnvido})`);
            // Resolver envido
            let puntosEnvido = 2; // Puedes ajustar según la apuesta
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
            gameState.gamePhase = 'playing';
            updateButtons();
        } else {
            pushGameMessage(`❌ CPU no quiso el envido`);
            gameState.playerPoints += 1;
            updateScores();
            gameState.gamePhase = 'playing';
            updateButtons();
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
    elements.roundInfo.textContent = `Ronda ${gameState.currentRound}`;
    updateBetStatus();
}

function updateScores() {
    elements.playerScore.textContent = `${gameState.playerChicos} (${gameState.playerPoints})`;
    elements.cpuScore.textContent = `${gameState.cpuChicos} (${gameState.cpuPoints})`;
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
updateMessage();
updateButtons(); 