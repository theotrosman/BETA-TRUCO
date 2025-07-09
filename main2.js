// Configuración del juego
const GAME_CONFIG = {
    pointsPerChico: 30,
    numChicos: 1,
    allowFlor: true
};

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
    manoActual: 1 // Contador de manos en la ronda (1, 2, 3)
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

// Configurar el botón de inicio
elements.btnStart.onclick = startNewGameConMusica;

function startNewGame() {
    console.log('Iniciando nueva ronda...');

    // --- REINICIO SEGURO DE ESTADOS ---
    // Limpiar canto pendiente y timers
    cantoPendiente = null;
    if (typeof cantoTimeout !== 'undefined' && cantoTimeout) {
        clearTimeout(cantoTimeout);
        cantoTimeout = null;
    }
    if (typeof window.cantoBarInterval !== 'undefined' && window.cantoBarInterval) {
        clearInterval(window.cantoBarInterval);
        window.cantoBarInterval = null;
    }
    if (typeof turnoTimeout !== 'undefined' && turnoTimeout) {
        clearTimeout(turnoTimeout);
        turnoTimeout = null;
    }
    if (typeof turnoBarInterval !== 'undefined' && turnoBarInterval) {
        clearInterval(turnoBarInterval);
        turnoBarInterval = null;
    }
    // Limpiar mensajes y estados visuales
    elements.cantoResponse.innerHTML = '';
    elements.cantoResponse.style.display = 'none';
    elements.turnoBar.style.display = 'none';
    // Limpiar efectos temporales si existen
    if (typeof efectosTemporales !== 'undefined') {
        for (let k in efectosTemporales) {
            if (efectosTemporales.hasOwnProperty(k)) {
                delete efectosTemporales[k];
            }
        }
    }
    // --- FIN REINICIO SEGURO ---

    // Remover clase oculto de todos los elementos
    document.getElementById('header').classList.remove('oculto');
    document.getElementById('table').classList.remove('oculto');
    document.getElementById('actions').classList.remove('oculto');
    // document.getElementById('gameStatus').classList.add('oculto');
    document.getElementById('actions2').classList.add('oculto');
    document.getElementById('rules').classList.add('oculto');
    
    buildDeck();
    shuffle(gameState.deck);
    
    // Aplicar cartas extra de Legado Criollo
    let cartasExtra = 0;
    if (gameState.nextRoundExtraCards && gameState.nextRoundExtraCards > 0) {
        cartasExtra = gameState.nextRoundExtraCards;
        gameState.nextRoundExtraCards = 0; // Resetear para la próxima ronda
    }
    
    gameState.playerHand = gameState.deck.splice(0, 3 + cartasExtra);
    gameState.cpuHand = gameState.deck.splice(0, 3);
    
    if (cartasExtra > 0) {
        pushGameMessage(`¡Legado Criollo activado! Tenés ${3 + cartasExtra} cartas`);
    }
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
    // Reiniciar variables de envido
    gameState.envidoCantado = false;
    gameState.manoActual = 1;
    
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
    // Renderizar mano de la CPU
    elements.cpuArea.innerHTML = '<div class="player-label">CPU</div>';
    // Mufa selectiva: si el jugador tiene mufa selectiva activa sobre la CPU
    let mufaNum = null;
    if (efectosTemporales.mufaSelectiva && (efectosTemporales.mufaSelectiva.owner === 'player' || efectosTemporales.mufaSelectiva.owner === 'global')) {
        mufaNum = efectosTemporales.mufaSelectiva.numero;
    }
    gameState.cpuHand.forEach((card, idx) => {
        let mostrarRevelada = false;
        if (mufaNum !== null && card.rank == mufaNum) {
            mostrarRevelada = true;
        }
        if (mostrarRevelada) {
            // Mostrar la carta revelada
            const cardElement = createCardElement(card, 'cpu', false, idx, false);
            elements.cpuArea.appendChild(cardElement);
        } else {
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
                backDiv.style.background = '#e3e3e3';
                backDiv.textContent = 'DORSO';
            };
            backDiv.appendChild(backImg);
            cardContainer.appendChild(backDiv);
            elements.cpuArea.appendChild(cardContainer);
        }
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
    
    // Registrar victoria de cartas en estadísticas
    if (typeof window.playerStats !== 'undefined') {
        const playerCard = card1.owner === 'player' ? card1 : card2;
        const cpuCard = card1.owner === 'cpu' ? card1 : card2;
        
        if (winner === 'player') {
            const cardCode = `${playerCard.rank}${playerCard.suit}`;
            const isEnvido = gameState.envidoLevel > 0;
            const isTruco = gameState.trucoLevel > 0;
            window.playerStats.recordCardPlayed(cardCode, true, isEnvido, isTruco);
        }
    }
    
    // Aplicar efectos de Legado Criollo
    if (winner === 'player') {
        if (efectosTemporales.legadoCriollo && efectosTemporales.legadoCriollo.owner === 'player') {
            // Contar victorias consecutivas del jugador
            if (!gameState.playerWinStreak) gameState.playerWinStreak = 0;
            gameState.playerWinStreak++;
            
            if (gameState.playerWinStreak >= 2) {
                pushGameMessage('¡Legado Criollo! Próxima ronda con 4 cartas');
                gameState.nextRoundExtraCards = 4;
                gameState.playerWinStreak = 0; // Resetear contador
            }
        }
    } else {
        // Resetear contador si pierde
        if (efectosTemporales.legadoCriollo && efectosTemporales.legadoCriollo.owner === 'player') {
            gameState.playerWinStreak = 0;
        }
    }
    
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
    
    // Registrar estadísticas si existe el sistema de perfil
    if (typeof window.playerStats !== 'undefined') {
        const gameResult = {
            won: roundWinner === 'player',
            chicosWon: roundWinner === 'player' ? 1 : 0,
            envidosWon: gameState.envidoLevel > 0 && roundWinner === 'player' ? 1 : 0,
            trucosWon: gameState.trucoLevel > 0 && roundWinner === 'player' ? 1 : 0,
            floresCantadas: gameState.florLevel > 0 ? 1 : 0,
            comodinesUsados: 0, // Se actualiza en otras funciones
            timePlayed: 0, // Se actualiza en otras funciones
            turnsPlayed: 6, // 3 manos * 2 jugadores
            perfectGame: gameState.playerTricks === 3,
            comebackWin: false, // Se calcula basado en el historial
            highEnvido: false, // Se verifica en handleEnvido
            valeCuatroWin: gameState.trucoLevel === 3 && roundWinner === 'player'
        };
        window.playerStats.updateGameStats(gameResult);
    }
    
    // Aplicar efectos de Poder Continental
    if (efectosTemporales.poderContinental && efectosTemporales.poderContinental.owner === roundWinner) {
        if (roundWinner === 'player') {
            // Dar un comodín extra al jugador
            const slot = playerComodines.findIndex(c => !c);
            if (slot !== -1) {
                const comodinesDisponibles = COMODINES.filter(c => 
                    !playerComodines.includes(c) && 
                    (!globalComodin || globalComodin.id !== c.id)
                );
                if (comodinesDisponibles.length > 0) {
                    const comodinExtra = comodinesDisponibles[Math.floor(Math.random() * comodinesDisponibles.length)];
                    playerComodines[slot] = comodinExtra;
                    pushGameMessage(`¡Poder Continental! Obtuviste: ${comodinExtra.nombre}`);
                    if (typeof window.playerStats !== 'undefined') {
                        window.playerStats.unlockComodin(comodinExtra.id);
                    }
                }
            }
        } else {
            // CPU obtiene un comodín extra
            const slot = cpuComodines.findIndex(c => !c);
            if (slot !== -1) {
                const comodinesDisponibles = COMODINES.filter(c => 
                    !cpuComodines.includes(c) && 
                    (!globalComodin || globalComodin.id !== c.id)
                );
                if (comodinesDisponibles.length > 0) {
                    const comodinExtra = comodinesDisponibles[Math.floor(Math.random() * comodinesDisponibles.length)];
                    cpuComodines[slot] = comodinExtra;
                    pushGameMessage(`CPU obtuvo comodín extra por Poder Continental: ${comodinExtra.nombre}`);
                }
            }
        }
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
        if (roundWinner === 'cpu') {
            // Si la CPU gana la ronda, iniciar la siguiente ronda automáticamente
            setTimeout(() => {
                startNewGame();
            }, 2000);
        } else {
            // Si gana el jugador, esperar que presione el botón
            setTimeout(() => {
                gameState.gamePhase = 'waiting';
                elements.btnStart.textContent = 'Siguiente Ronda';
                updateMessage();
            }, 3000);
        }
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
        // Probabilidad base de 15%, pero aumenta con la fuerza de la mano
        const probabilidadBase = 0.15;
        const probabilidadPorFuerza = fuerza * 0.3; // Máximo 30% adicional
        const probabilidadTotal = Math.min(probabilidadBase + probabilidadPorFuerza, 0.45);
        
        if (Math.random() < probabilidadTotal) {
            gameState.trucoLevel = 1;
            gameState.gamePhase = 'truco';
            cantoPendiente = { tipo: 'truco', nivel: 1, quien: 'cpu' };
            pushGameMessage(`CPU canta Truco - ¿Qué respondes?`);
            mostrarBotonesCanto([
                {text: 'Quiero', value: 'quiero'},
                {text: 'Subir', value: 'subir'},
                {text: 'No quiero', value: 'noquiero'}
            ], respuestaTrucoJugador);
            return true;
        }
    }
    
    // CPU puede cantar retruco si ya hay truco aceptado y tiene una mano fuerte
    if (gameState.turn === 1 && gameState.trucoLevel === 1) {
        // Solo cantar retruco si tiene una mano muy fuerte
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
        // Solo cantar vale cuatro si tiene una mano excepcional
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
    
    // CPU puede cantar envido si no se cantó aún y es la primera mano
    if (gameState.turn === 1 && !gameState.hasEnvido && !gameState.envidoCantado && gameState.manoActual === 1) {
        const envidoValue = calculateEnvido(gameState.cpuHand);
        // Cantar envido si tiene un valor decente
        if (envidoValue >= 20 && Math.random() < 0.25) {
            gameState.envidoLevel = 1;
            gameState.hasEnvido = true;
            gameState.envidoCantado = true; // Marcar que se cantó envido
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
            updateButtons();
            if (gameState.turn === 1) setTimeout(cpuPlay, 2000);
        } else {
            // No querer el envido
            cantoPendiente = null;
            pushGameMessage(`❌ CPU no quiso el envido`);
            gameState.playerPoints += 1;
            updateScores();
            gameState.gamePhase = 'playing';
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

// --- BASE DE COMODINES Y TIENDA ROGUELIKE ---

// Lista de comodines (nombre, descripción, id)
const COMODINES = [
  { id: 'palo_unico', nombre: 'Palo Único', desc: 'Solo podés jugar cartas de un palo elegido. +10 al Envido mientras esté activo.' },
  { id: 'dominio_ilusorio', nombre: 'Dominio Ilusorio', desc: 'Por 5 rondas, todas tus cartas cambian de palo al que elijas. Luego se destruyen.' },
  { id: 'replica_honor', nombre: 'Réplica de Honor', desc: 'Si ganás un Envido por 5 o más, agregás una copia de la carta más fuerte jugada a tu mazo.' },
  { id: 'triple_milagro', nombre: 'Triple Milagro', desc: 'Una vez, podés destruir 5 cartas y recibir Ancho, 7 y 6 de Espada.' },
  { id: 'flor_falsa', nombre: 'Flor Falsa', desc: 'Si robás 3 del mismo palo, podés declarar Flor (ganás Envido). Ese turno no podés cantar Truco.' },
  { id: 'espuelas_plata', nombre: 'Espuelas de Plata', desc: 'Si perdés una ronda de Truco, la próxima jugás con 4 cartas y descartás 1.' },
  { id: 'taba_aire', nombre: 'Taba en el Aire', desc: 'Al obtenerlo, tirás una moneda: +1 o -1 a todas tus cartas en Truco.' },
  { id: 'yerba_mala', nombre: 'Yerba Mala', desc: 'Mientras esté activo, las cartas de Oro del rival valen -2 en Envido.' },
  { id: 'desempate_criollo', nombre: 'Desempate Criollo', desc: 'Si empatás Envido o Truco, ganás vos. Usable una vez.' },
  { id: 'mate_cocido', nombre: 'Mate Cocido', desc: 'Si te tocan 3 cartas con el mismo número, las fusionás en una carta de 35 en Envido.' },
  { id: 'corazon_truquero', nombre: 'Corazón de Truquero', desc: 'Si perdés 3 manos seguidas, robás el Ancho de Espada.' },
  { id: 'mufa_selectiva', nombre: 'Mufa Selectiva', desc: 'Al inicio de cada ronda, elegís un número. Si el rival lo tiene, no la puede jugar.' },
  { id: 'gaucho_invisible', nombre: 'Gaucho Invisible', desc: 'El rival no ve tus jugadas durante la ronda. Se revelan al final.' },
  { id: 'cambalache', nombre: 'Cambalache', desc: 'Una vez por ronda, podés cambiar una carta de tu mano por una del mazo.' },
  { id: 'finta_criolla', nombre: 'Finta Criolla', desc: 'Una vez por ronda, podés jugar una carta boca abajo. Solo se revela si el rival canta Truco.' },
  // Nuevos comodines
  { id: 'venganza_gaucha', nombre: 'Venganza Gaucha', desc: 'Si perdés una mano, la próxima carta que jugues tiene +3 de poder.' },
  { id: 'poder_criollo', nombre: 'Poder Criollo', desc: 'Todas tus cartas de número 1-7 tienen +1 de poder en Truco.' },
  { id: 'estrategia_milonga', nombre: 'Estrategia Milonga', desc: 'Si cantás Truco y perdés, la próxima ronda empezás con 4 cartas.' },
  { id: 'destino_argentino', nombre: 'Destino Argentino', desc: 'Una vez por partida, podés cambiar el resultado de una mano.' },
  { id: 'suerte_patria', nombre: 'Suerte Patria', desc: 'Al inicio de cada ronda, tenés 25% de chance de robar una carta extra.' },
  { id: 'coraje_federal', nombre: 'Coraje Federal', desc: 'Si tenés menos de 10 puntos, todas tus cartas tienen +2 de poder.' },
  { id: 'astucia_pampeana', nombre: 'Astucia Pampeana', desc: 'Podés ver la carta más fuerte del rival una vez por ronda.' },
  { id: 'honor_rioplatense', nombre: 'Honor Rioplatense', desc: 'Si ganás un Envido, el próximo Truco vale doble puntos.' },
  { id: 'pasion_tanguera', nombre: 'Pasión Tanguera', desc: 'Si cantás Flor y ganás, podés cantar otra Flor inmediatamente.' },
  { id: 'fuerza_quebrada', nombre: 'Fuerza Quebrada', desc: 'Todas tus cartas de Espada tienen +1 de poder adicional.' },
  { id: 'espiritu_libertador', nombre: 'Espíritu Libertador', desc: 'Si estás perdiendo por 20+ puntos, todas tus cartas tienen +3 de poder.' },
  { id: 'garra_charrúa', nombre: 'Garra Charrúa', desc: 'Si perdés una mano, la próxima que ganes vale doble puntos.' },
  { id: 'misterio_andino', nombre: 'Misterio Andino', desc: 'Una vez por ronda, podés cambiar una carta de tu mano por una del rival.' },
  { id: 'legado_criollo', nombre: 'Legado Criollo', desc: 'Si ganás 2 manos seguidas, la próxima ronda empezás con 4 cartas.' },
  { id: 'alma_guarani', nombre: 'Alma Guaraní', desc: 'Todas tus cartas de Copa tienen +2 en Envido.' },
  { id: 'corazon_patagonico', nombre: 'Corazón Patagónico', desc: 'Si perdés 2 manos seguidas, la próxima que ganes te da un chico extra.' },
  { id: 'fuerza_pampeana', nombre: 'Fuerza Pampeana', desc: 'Todas tus cartas de Basto tienen +1 de poder en Truco.' },
  { id: 'sangre_indigena', nombre: 'Sangre Indígena', desc: 'Si tenés 3 cartas del mismo palo, todas tienen +2 de poder.' },
  { id: 'destino_sudamericano', nombre: 'Destino Sudamericano', desc: 'Al final de cada ronda, tenés 50% de chance de ganar un punto extra.' },
  { id: 'poder_continental', nombre: 'Poder Continental', desc: 'Si ganás la partida, la próxima empezás con un comodín extra.' },
  { id: 'legado_eterno', nombre: 'Legado Eterno', desc: 'Todos tus comodines se pueden usar una vez más por partida.' }
];

// Estado de slots y tienda
let playerComodines = [null, null];
let cpuComodines = [null, null];
let globalComodin = null;
let tiendaComodines = [];
let tiendaVisible = false;
let puedeContinuar = false;

// --- UTILIDADES ---
function getRandomComodines(cantidad, exclude=[]) {
  // Devuelve 'cantidad' comodines aleatorios que no estén en exclude
  const pool = COMODINES.filter(c => !exclude.includes(c.id));
  const res = [];
  while (res.length < cantidad && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    res.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return res;
}

function renderSlots() {
  // Renderiza los slots del jugador
  for (let i = 0; i < 2; i++) {
    const slot = document.getElementById('playerSlot'+(i+1));
    slot.innerHTML = '';
    slot.classList.remove('has-comodin');
    slot.onclick = () => selectSlot('player', i);
    if (playerComodines[i]) {
      slot.classList.add('has-comodin');
      slot.innerHTML = `<b>${playerComodines[i].nombre}</b><br><span style='font-size:0.9em;'>${playerComodines[i].desc}</span><button class='remove-btn' title='Quitar' onclick='removePlayerComodin(${i});event.stopPropagation();'>✖</button>`;
    }
  }
  // Renderiza los slots de la CPU
  for (let i = 0; i < 2; i++) {
    const slot = document.getElementById('cpuSlot'+(i+1));
    slot.innerHTML = '';
    slot.classList.remove('has-comodin');
    slot.onclick = () => selectSlot('cpu', i);
    if (cpuComodines[i]) {
      slot.classList.add('has-comodin');
      slot.innerHTML = `<b>${cpuComodines[i].nombre}</b>`;
    }
  }
  // Renderiza el slot global
  const gslot = document.getElementById('globalSlot');
  gslot.innerHTML = '';
  gslot.classList.remove('has-comodin');
  gslot.onclick = () => selectSlot('global', 0);
  if (globalComodin) {
    gslot.classList.add('has-comodin');
    gslot.innerHTML = `<b>${globalComodin.nombre}</b><br><span style='font-size:0.9em;'>${globalComodin.desc}</span><button class='remove-btn' title='Quitar' onclick='removeGlobalComodin();event.stopPropagation();'>✖</button>`;
  }
}
window.removePlayerComodin = function(idx) {
  playerComodines[idx] = null;
  renderSlots();
}
window.removeGlobalComodin = function() {
  globalComodin = null;
  renderSlots();
}

// --- Intercambio de comodines entre slots ---
let selectedSlot = null;
function selectSlot(tipo, idx) {
  if (selectedSlot) {
    // Si ya hay uno seleccionado, intercambiar
    swapComodines(selectedSlot, {tipo, idx});
    selectedSlot = null;
    renderSlots();
  } else {
    selectedSlot = {tipo, idx};
  }
}
function swapComodines(a, b) {
  if (a.tipo === 'player' && b.tipo === 'player') {
    [playerComodines[a.idx], playerComodines[b.idx]] = [playerComodines[b.idx], playerComodines[a.idx]];
  } else if (a.tipo === 'cpu' && b.tipo === 'cpu') {
    [cpuComodines[a.idx], cpuComodines[b.idx]] = [cpuComodines[b.idx], cpuComodines[a.idx]];
  } else if (a.tipo === 'global' && b.tipo === 'player') {
    [globalComodin, playerComodines[b.idx]] = [playerComodines[b.idx], globalComodin];
  } else if (a.tipo === 'player' && b.tipo === 'global') {
    [playerComodines[a.idx], globalComodin] = [globalComodin, playerComodines[a.idx]];
  } else if (a.tipo === 'global' && b.tipo === 'cpu') {
    [globalComodin, cpuComodines[b.idx]] = [cpuComodines[b.idx], globalComodin];
  } else if (a.tipo === 'cpu' && b.tipo === 'global') {
    [cpuComodines[a.idx], globalComodin] = [globalComodin, cpuComodines[a.idx]];
  } else if (a.tipo === 'player' && b.tipo === 'cpu') {
    [playerComodines[a.idx], cpuComodines[b.idx]] = [cpuComodines[b.idx], playerComodines[a.idx]];
  } else if (a.tipo === 'cpu' && b.tipo === 'player') {
    [cpuComodines[a.idx], playerComodines[b.idx]] = [playerComodines[b.idx], cpuComodines[a.idx]];
  }
}

function showShop() {
  tiendaVisible = true;
  puedeContinuar = false;
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('continueBtn').disabled = false; // Siempre habilitado
  rerollShop();
}

function hideShop() {
  tiendaVisible = false;
  document.getElementById('shopOverlay').style.display = 'none';
}

function rerollShop() {
  // Excluir comodines ya activos del jugador y global
  const exclude = playerComodines.filter(Boolean).map(c => c.id);
  if (globalComodin) exclude.push(globalComodin.id);
  tiendaComodines = getRandomComodines(3, exclude);
  renderShop();
}

function renderShop() {
  const shopDiv = document.getElementById('shopComodines');
  shopDiv.innerHTML = '';
  tiendaComodines.forEach((comodin, idx) => {
    const playerFull = playerComodines.filter(Boolean).length >= 2;
    const globalFull = !!globalComodin;
    const playerButtonText = playerFull ? 'Reemplazar slot' : 'A tu slot';
    shopDiv.innerHTML += `<div class='comodin-card'><h3>${comodin.nombre}</h3><p>${comodin.desc}</p>
      <button onclick='buyComodin(${idx},"player")'>${playerButtonText}</button>
      <button onclick='buyComodin(${idx},"global")' ${globalFull ? 'disabled' : ''}>Global</button>
    </div>`;
  });
  const playerShopDiv = document.getElementById('playerComodinesCards');
  playerShopDiv.innerHTML = '';
  playerComodines.forEach((c, i) => {
    if (!c) {
      playerShopDiv.innerHTML += `<div class='comodin-card-visual dorso'><span style='font-size:1.2em;'>?</span></div>`;
      return;
    }
    playerShopDiv.innerHTML += `<div class='comodin-card-visual' data-idx='${i}'>
      <div class='comodin-nombre'>${c.nombre}</div>
      <div class='comodin-desc'>${c.desc}</div>
      <button class='comodin-x' onclick='window.removePlayerComodin(${i});event.stopPropagation();'>Vender</button>
    </div>`;
  });
  const cpuShopDiv = document.getElementById('cpuComodinesCards');
  cpuShopDiv.innerHTML = '';
  if (cpuComodines.filter(Boolean).length < 2) {
    cpuCambiarComodinesCadaRonda();
  }
  cpuComodines.forEach((c, i) => {
    if (!c) {
      cpuShopDiv.innerHTML += `<div class='comodin-card-visual dorso'><span style='font-size:1.2em;'>?</span></div>`;
      return;
    }
    cpuShopDiv.innerHTML += `<div class='comodin-card-visual cpu dorso' title='Comodín CPU'>🤖</div>`;
  });
}
window.removePlayerComodin = function(idx) {
  playerComodines[idx] = null;
  renderSlots();
  renderShop();
  // El botón de continuar siempre está habilitado
}
window.buyComodin = function(idx, destino) {
  if (destino === 'player') {
    const slot = playerComodines.findIndex(c => !c);
    if (slot === -1) {
      // No hay slots libres, preguntar cuál reemplazar
      const comodinesActuales = playerComodines.map((c, i) => c ? `${i+1}: ${c.nombre}` : null).filter(Boolean);
      if (comodinesActuales.length === 0) return;
      
      const mensaje = `No tenés slots libres. ¿Cuál querés reemplazar?\n\n${comodinesActuales.join('\n')}\n\nEscribí el número (1 o 2):`;
      const respuesta = prompt(mensaje, '1');
      const slotIndex = parseInt(respuesta) - 1;
      
      if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= 2 || !playerComodines[slotIndex]) {
        alert('Opción inválida. No se compró el comodín.');
        return;
      }
      
      // Confirmar el reemplazo
      const comodinViejo = playerComodines[slotIndex];
      const comodinNuevo = tiendaComodines[idx];
      const confirmacion = confirm(`¿Querés reemplazar "${comodinViejo.nombre}" por "${comodinNuevo.nombre}"?`);
      
      if (confirmacion) {
        playerComodines[slotIndex] = tiendaComodines[idx];
        
        // Registrar comodín desbloqueado en estadísticas
        if (typeof window.playerStats !== 'undefined') {
          window.playerStats.unlockComodin(tiendaComodines[idx].id);
        }
      } else {
        return;
      }
    } else {
      playerComodines[slot] = tiendaComodines[idx];
      
      // Registrar comodín desbloqueado en estadísticas
      if (typeof window.playerStats !== 'undefined') {
        window.playerStats.unlockComodin(tiendaComodines[idx].id);
      }
    }
  } else if (destino === 'global') {
    if (globalComodin) {
      const respuesta = confirm(`Ya tenés un comodín global: "${globalComodin.nombre}". ¿Querés reemplazarlo por "${tiendaComodines[idx].nombre}"?`);
      if (!respuesta) return;
    }
    globalComodin = tiendaComodines[idx];
    
    // Registrar comodín desbloqueado en estadísticas
    if (typeof window.playerStats !== 'undefined') {
      window.playerStats.unlockComodin(tiendaComodines[idx].id);
    }
  }
  renderSlots();
  renderShop();
  // El botón de continuar siempre está habilitado
}
document.getElementById('rerollBtn').onclick = function() {
  rerollShop();
  renderShop();
}
document.getElementById('continueBtn').onclick = function() {
  // Siempre permite continuar, sin importar cuántos comodines tenga
  hideShop();
}
const showShopOriginal = showShop;
showShop = function() {
  showShopOriginal();
  renderShop();
}

// --- CPU: lógica base para comodines ---
function cpuObtenerComodin() {
  // La CPU compra aleatoriamente si tiene slot libre
  const exclude = cpuComodines.filter(Boolean).map(c => c.id);
  if (globalComodin) exclude.push(globalComodin.id);
  const opciones = getRandomComodines(3, exclude);
  const slot = cpuComodines.findIndex(c => !c);
  if (slot !== -1 && opciones.length > 0) {
    const elegido = opciones[Math.floor(Math.random() * opciones.length)];
    cpuComodines[slot] = elegido;
    renderSlots();
  } else if (!globalComodin && opciones.length > 0) {
    globalComodin = opciones[Math.floor(Math.random() * opciones.length)];
    renderSlots();
  }
}

// --- Dificultad procedural y lore ---
let dificultad = 1;
const dificultadNombres = ['Normal','Difícil','Épico','Leyenda','GOTY'];
function setDificultad(n) {
  dificultad = n;
  document.getElementById('difficultyLevel').textContent = dificultadNombres[n-1] || '???';
}
function mostrarLore(texto) {
  document.getElementById('loreBox').textContent = texto;
}

// --- Inicialización visual ---
renderSlots();
showShop(); // Mostrar tienda al iniciar para pruebas
// Para mostrar la tienda al terminar una mano, llama a showShop() y cpuObtenerComodin() en el flujo de la partida procedural. 

// === SISTEMA DE EFECTOS DE COMODINES ===

// Estado auxiliar para efectos temporales
let efectosTemporales = {
  paloUnico: null, // {palo: 'espada', owner: 'player'|'cpu'}
  dominioIlusorio: { rondas: 0, palo: null, owner: null },
  replicaHonor: { pending: false, owner: null },
  tripleMilagro: { usado: false, owner: null },
  florFalsa: { pending: false, owner: null },
  espuelasPlata: { pending: false, owner: null },
  tabaAire: { mod: 0, owner: null },
  yerbaMala: false,
  desempateCriollo: { usado: false, owner: null },
  mateCocido: { pending: false, owner: null },
  corazonTruquero: { streak: 0, owner: null },
  mufaSelectiva: { numero: null, owner: null },
  gauchoInvisible: { activo: false, owner: null },
  cambalache: { usado: false, owner: null },
  fintaCriolla: { usado: false, owner: null }
};

function getAllComodines(owner) {
  let arr = [];
  if (owner === 'player') arr = playerComodines.filter(Boolean);
  else if (owner === 'cpu') arr = cpuComodines.filter(Boolean);
  if (globalComodin) arr.push(globalComodin);
  return arr;
}

// Refactor: obtener efectos activos según slot
function getEfectosActivos(owner) {
  // owner: 'player' | 'cpu'
  let efectos = [];
  // Comodines propios
  (owner === 'player' ? playerComodines : cpuComodines).forEach(c => { if (c) efectos.push({ ...c, slot: owner }); });
  // Comodines globales
  if (globalComodin) efectos.push({ ...globalComodin, slot: 'global' });
  return efectos;
}

// Refactor: aplicar efectos temporales según slot
function aplicarComodinesInicioRonda() {
  // Reiniciar efectos temporales
  efectosTemporales = {
    paloUnico: null,
    dominioIlusorio: { rondas: 0, palo: null, owner: null },
    replicaHonor: { pending: false, owner: null },
    tripleMilagro: { usado: false, owner: null },
    florFalsa: { pending: false, owner: null },
    espuelasPlata: { pending: false, owner: null },
    tabaAire: { mod: 0, owner: null },
    yerbaMala: false,
    desempateCriollo: { usado: false, owner: null },
    mateCocido: { pending: false, owner: null },
    corazonTruquero: { streak: 0, owner: null },
    mufaSelectiva: { numero: null, owner: null },
    gauchoInvisible: { activo: false, owner: null },
    cambalache: { usado: false, owner: null },
    fintaCriolla: { usado: false, owner: null },
    // Nuevos efectos temporales
    venganzaGaucha: { activo: false, owner: null },
    poderCriollo: { activo: false, owner: null },
    estrategiaMilonga: { activo: false, owner: null },
    destinoArgentino: { usado: false, owner: null },
    suertePatria: { activo: false, owner: null },
    corajeFederal: { activo: false, owner: null },
    astuciaPampeana: { usado: false, owner: null },
    honorRioplatense: { activo: false, owner: null },
    pasionTanguera: { activo: false, owner: null },
    fuerzaQuebrada: { activo: false, owner: null },
    espirituLibertador: { activo: false, owner: null },
    garraCharrua: { activo: false, owner: null },
    misterioAndino: { usado: false, owner: null },
    legadoCriollo: { activo: false, owner: null },
    almaGuarani: { activo: false, owner: null },
    corazonPatagonico: { activo: false, owner: null },
    fuerzaPampeana: { activo: false, owner: null },
    sangreIndigena: { activo: false, owner: null },
    destinoSudamericano: { activo: false, owner: null },
    poderContinental: { activo: false, owner: null },
    legadoEterno: { activo: false, owner: null }
  };
  // Aplicar efectos para cada owner
  ['player','cpu','global'].forEach(owner => {
    getEfectosActivos(owner).forEach(c => {
      // Solo aplicar si el slot corresponde
      let target = c.slot === 'global' ? ['player','cpu'] : [c.slot];
      target.forEach(tgt => {
        if (c.id === 'palo_unico') {
          let mano = tgt === 'player' ? gameState.playerHand : gameState.cpuHand;
          let palos = mano.reduce((acc, card) => { acc[card.suit] = (acc[card.suit]||0)+1; return acc; }, {});
          let mejorPalo = Object.keys(palos).sort((a,b)=>palos[b]-palos[a])[0] || 'espada';
          efectosTemporales.paloUnico = { palo: mejorPalo, owner: tgt };
        }
        if (c.id === 'dominio_ilusorio') {
          let mano = tgt === 'player' ? gameState.playerHand : gameState.cpuHand;
          let palos = mano.reduce((acc, card) => { acc[card.suit] = (acc[card.suit]||0)+1; return acc; }, {});
          let mejorPalo = Object.keys(palos).sort((a,b)=>palos[b]-palos[a])[0] || 'espada';
          efectosTemporales.dominioIlusorio = { rondas: 5, palo: mejorPalo, owner: tgt };
          mano.forEach(card => card.suit = mejorPalo);
        }
        if (c.id === 'taba_aire') {
          let mod = Math.random() < 0.5 ? 1 : -1;
          efectosTemporales.tabaAire = { mod, owner: tgt };
        }
        if (c.id === 'yerba_mala') {
          efectosTemporales.yerbaMala = true;
        }
        if (c.id === 'mufa_selectiva') {
          let mano = tgt === 'player' ? gameState.playerHand : gameState.cpuHand;
          let nums = mano.map(card=>card.rank);
          let num = nums.find(n => nums.filter(x=>x===n).length===1) || nums[0] || 7;
          efectosTemporales.mufaSelectiva = { numero: num, owner: tgt };
        }
        if (c.id === 'gaucho_invisible') {
          efectosTemporales.gauchoInvisible = { activo: true, owner: tgt };
        }
        // Nuevos comodines
        if (c.id === 'venganza_gaucha') {
          efectosTemporales.venganzaGaucha = { activo: true, owner: tgt };
        }
        if (c.id === 'poder_criollo') {
          efectosTemporales.poderCriollo = { activo: true, owner: tgt };
        }
        if (c.id === 'estrategia_milonga') {
          efectosTemporales.estrategiaMilonga = { activo: true, owner: tgt };
        }
        if (c.id === 'suerte_patria') {
          if (Math.random() < 0.25) {
            efectosTemporales.suertePatria = { activo: true, owner: tgt };
            pushGameMessage(`${tgt === 'player' ? '¡Suerte Patria!' : 'CPU tiene Suerte Patria'} - Carta extra robada`);
          }
        }
        if (c.id === 'coraje_federal') {
          efectosTemporales.corajeFederal = { activo: true, owner: tgt };
        }
        if (c.id === 'honor_rioplatense') {
          efectosTemporales.honorRioplatense = { activo: true, owner: tgt };
        }
        if (c.id === 'pasion_tanguera') {
          efectosTemporales.pasionTanguera = { activo: true, owner: tgt };
        }
        if (c.id === 'fuerza_quebrada') {
          efectosTemporales.fuerzaQuebrada = { activo: true, owner: tgt };
        }
        if (c.id === 'espiritu_libertador') {
          efectosTemporales.espirituLibertador = { activo: true, owner: tgt };
        }
        if (c.id === 'garra_charrúa') {
          efectosTemporales.garraCharrua = { activo: true, owner: tgt };
        }
        if (c.id === 'legado_criollo') {
          efectosTemporales.legadoCriollo = { activo: true, owner: tgt };
        }
        if (c.id === 'alma_guarani') {
          efectosTemporales.almaGuarani = { activo: true, owner: tgt };
        }
        if (c.id === 'corazon_patagonico') {
          efectosTemporales.corazonPatagonico = { activo: true, owner: tgt };
        }
        if (c.id === 'fuerza_pampeana') {
          efectosTemporales.fuerzaPampeana = { activo: true, owner: tgt };
        }
        if (c.id === 'sangre_indigena') {
          efectosTemporales.sangreIndigena = { activo: true, owner: tgt };
        }
        if (c.id === 'destino_sudamericano') {
          efectosTemporales.destinoSudamericano = { activo: true, owner: tgt };
        }
        if (c.id === 'poder_continental') {
          efectosTemporales.poderContinental = { activo: true, owner: tgt };
        }
        if (c.id === 'legado_eterno') {
          efectosTemporales.legadoEterno = { activo: true, owner: tgt };
          // Legado Eterno permite usar todos los comodines una vez más por partida
          pushGameMessage(`${tgt === 'player' ? '¡Legado Eterno activado!' : 'CPU tiene Legado Eterno'} - Comodines reutilizables`);
        }
        if (c.id === 'poder_continental') {
          efectosTemporales.poderContinental = { activo: true, owner: tgt };
          // Poder Continental da un comodín extra al ganar la partida
          pushGameMessage(`${tgt === 'player' ? '¡Poder Continental activado!' : 'CPU tiene Poder Continental'} - Comodín extra al ganar`);
        }
      });
    });
  });
}

// Mejorar animación de Taba en el Aire
function mostrarTabaAireAnim(mod, callback) {
  // Elimina cualquier animación previa
  const prev = document.getElementById('taba-moneda-anim');
  if (prev) prev.parentNode.removeChild(prev);
  // Crea el overlay de la moneda
  const div = document.createElement('div');
  div.className = 'taba-moneda-anim';
  div.id = 'taba-moneda-anim';
  const signo = mod > 0 ? '+' : '-';
  const clase = mod > 0 ? 'mas' : 'menos';
  div.innerHTML = `<div class='moneda ${clase}' style='box-shadow:0 8px 32px #0006;'><span style='font-size:2.2em;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'>${signo}1</span><div style='position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);width:60px;height:18px;background:radial-gradient(ellipse at center,#0003 60%,transparent 100%);border-radius:50%;'></div></div>`;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = 0;
    setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 400);
    if (callback) callback();
  }, 1400);
}

// Hook: aplicar efectos de comodines al inicio de la ronda
const startNewGameOriginal2 = startNewGame;
function startNewGameConComodines() {
  aplicarComodinesInicioRonda();
  startNewGameOriginal2();
}
elements.btnStart.onclick = startNewGameConComodines;

// Hook: mostrar tienda y actualizar comodines tras cada ronda
const endRoundOriginal = endRound;
function endRoundConTienda() {
  endRoundOriginal();
  setTimeout(() => {
    showShop();
    cpuObtenerComodinInteligente();
  }, 2000);
}
endRound = endRoundConTienda;

// --- Efectos en jugadas y apuestas ---
// Modificar getTrucoPower para efectos de comodines
const getTrucoPowerOriginal = getTrucoPower;
function getTrucoPowerConComodines(card) {
  let power = getTrucoPowerOriginal(card);
  const owner = card.owner || 'player';
  
  // Taba en el Aire
  if (efectosTemporales.tabaAire && ((owner === 'player' && efectosTemporales.tabaAire.owner==='player') || (owner==='cpu' && efectosTemporales.tabaAire.owner==='cpu'))) {
    power += efectosTemporales.tabaAire.mod;
  }
  
  // Nuevos efectos de poder
  if (efectosTemporales.poderCriollo && efectosTemporales.poderCriollo.owner === owner) {
    if (card.rank >= 1 && card.rank <= 7) {
      power += 1;
    }
  }
  
  if (efectosTemporales.fuerzaQuebrada && efectosTemporales.fuerzaQuebrada.owner === owner) {
    if (card.suit === 'espada') {
      power += 1;
    }
  }
  
  if (efectosTemporales.fuerzaPampeana && efectosTemporales.fuerzaPampeana.owner === owner) {
    if (card.suit === 'basto') {
      power += 1;
    }
  }
  
  if (efectosTemporales.corajeFederal && efectosTemporales.corajeFederal.owner === owner) {
    const currentPoints = owner === 'player' ? gameState.playerPoints : gameState.cpuPoints;
    if (currentPoints < 10) {
      power += 2;
    }
  }
  
  if (efectosTemporales.espirituLibertador && efectosTemporales.espirituLibertador.owner === owner) {
    const currentPoints = owner === 'player' ? gameState.playerPoints : gameState.cpuPoints;
    const rivalPoints = owner === 'player' ? gameState.cpuPoints : gameState.playerPoints;
    if (rivalPoints - currentPoints >= 20) {
      power += 3;
    }
  }
  
  if (efectosTemporales.sangreIndigena && efectosTemporales.sangreIndigena.owner === owner) {
    const hand = owner === 'player' ? gameState.playerHand : gameState.cpuHand;
    const suits = hand.reduce((acc, c) => { acc[c.suit] = (acc[c.suit] || 0) + 1; return acc; }, {});
    if (suits[card.suit] >= 3) {
      power += 2;
    }
  }
  
  if (efectosTemporales.venganzaGaucha && efectosTemporales.venganzaGaucha.owner === owner) {
    // Se activa cuando pierde una mano (se maneja en evaluateTrick)
  }
  
  return power;
}
getTrucoPower = getTrucoPowerConComodines;

// Modificar calculateEnvido para efectos de comodines
const calculateEnvidoOriginal = calculateEnvido;
function calculateEnvidoConComodines(hand, owner) {
  let val = calculateEnvidoOriginal(hand);
  
  // Palo Único
  if (efectosTemporales.paloUnico && efectosTemporales.paloUnico.owner === owner) {
    val += 10;
  }
  
  // Yerba Mala
  if (efectosTemporales.yerbaMala && owner !== 'player') {
    // Si el rival tiene cartas de oro, -2 por cada una
    val -= hand.filter(c => c.suit === 'oro').length * 2;
  }
  
  // Mate Cocido
  if (getAllComodines(owner).some(c => c.id==='mate_cocido')) {
    let nums = hand.map(c=>c.rank);
    let rep = nums.filter((n,i,a)=>a.indexOf(n)!==i);
    if (rep.length>=2) val = 35;
  }
  
  // Nuevos efectos de envido
  if (efectosTemporales.almaGuarani && efectosTemporales.almaGuarani.owner === owner) {
    // Todas las cartas de Copa tienen +2 en Envido
    hand.forEach(card => {
      if (card.suit === 'copa') {
        val += 2;
      }
    });
  }
  
  return val;
}
calculateEnvido = calculateEnvidoConComodines;

// Hook para impedir jugadas por Mufa Selectiva
const playPlayerCardOriginal = playPlayerCard;
playPlayerCard = function(index, porTimeout) {
  if (efectosTemporales.mufaSelectiva && efectosTemporales.mufaSelectiva.owner==='cpu') {
    let card = gameState.playerHand[index];
    if (card && card.rank == efectosTemporales.mufaSelectiva.numero) {
      pushGameMessage('No podés jugar esa carta por Mufa Selectiva.');
      return;
    }
  }
  playPlayerCardOriginal(index, porTimeout);
};
const cpuPlayOriginal = cpuPlay;
cpuPlay = function() {
  if (efectosTemporales.mufaSelectiva && efectosTemporales.mufaSelectiva.owner==='player') {
    let idx = gameState.cpuHand.findIndex(card => card.rank == efectosTemporales.mufaSelectiva.numero);
    if (idx !== -1) {
      // CPU no puede jugar esa carta, la saltea
      let otras = gameState.cpuHand.filter((c,i)=>i!==idx);
      if (otras.length>0) {
        let cardToPlay = otras[0];
        let cardIndex = gameState.cpuHand.indexOf(cardToPlay);
        let card = gameState.cpuHand.splice(cardIndex, 1)[0];
        placeCard(card, 'cpu');
        renderHands();
        gameState.turn = 0;
        updateMessage();
        updateButtons();
        if (gameState.cardsPlayed.length === 2) {
          setTimeout(evaluateTrick, 1000);
        }
        return;
      }
    }
  }
  cpuPlayOriginal();
};

// --- CPU inteligente para comodines ---
function cpuObtenerComodinInteligente() {
  const exclude = cpuComodines.filter(Boolean).map(c => c.id);
  if (globalComodin) exclude.push(globalComodin.id);
  let opciones = getRandomComodines(8, exclude);
  let mano = gameState.cpuHand && gameState.cpuHand.length === 3 ? gameState.cpuHand : [
    {suit:'espada',rank:1},{suit:'basto',rank:7},{suit:'oro',rank:3}
  ];
  let palos = mano.reduce((acc, c) => { acc[c.suit] = (acc[c.suit]||0)+1; return acc; }, {});
  let mejorPalo = Object.keys(palos).sort((a,b)=>palos[b]-palos[a])[0] || 'espada';
  let prioridad = [];
  if (dificultadCPU >= 4 && gameState.cpuPoints < gameState.playerPoints) {
    prioridad = ['desempate_criollo','espuelas_plata','corazon_truquero','replica_honor'];
  } else if (dificultadCPU >= 3 && gameState.playerPoints - gameState.cpuPoints > 10) {
    prioridad = ['yerba_mala','mufa_selectiva','gaucho_invisible','taba_aire'];
  } else if (dificultadCPU >= 2 && gameState.playerPoints > 20) {
    prioridad = ['yerba_mala','mufa_selectiva','mate_cocido'];
  } else {
    prioridad = ['yerba_mala','mufa_selectiva','taba_aire','palo_unico','dominio_ilusorio','replica_honor','espuelas_plata','corazon_truquero','gaucho_invisible','cambalache','finta_criolla','mate_cocido','flor_falsa','triple_milagro','desempate_criollo'];
  }
  let validos = opciones.filter(c => {
    if (c.id === 'palo_unico') {
      return palos[mejorPalo] > 0;
    }
    if (c.id === 'mufa_selectiva') {
      let nums = mano.map(c=>c.rank);
      return nums.length > 1;
    }
    if (c.id === 'flor_falsa') {
      let paloMax = Object.values(palos).some(v=>v===3);
      return paloMax;
    }
    if (c.id === 'mate_cocido') {
      let rep = mano.map(c=>c.rank).filter((n,i,a)=>a.indexOf(n)!==i);
      return rep.length>=2;
    }
    return true;
  });
  let elegido = null;
  for (let p of prioridad) {
    elegido = validos.find(c => c.id === p);
    if (elegido) break;
  }
  if (!elegido && validos.length>0) elegido = validos[0];
  if (!elegido && opciones.length>0) elegido = opciones[0];
  const slot = cpuComodines.findIndex(c => !c);
  if (slot !== -1 && elegido) {
    cpuComodines[slot] = elegido;
    renderSlots();
  } else if (!globalComodin && elegido) {
    globalComodin = elegido;
    renderSlots();
  }
}
function cpuCambiarComodinesCadaRonda() {
  cpuComodines = [null, null];
  for (let i = 0; i < 2; i++) {
    cpuObtenerComodinInteligente();
  }
  renderSlots();
}

// --- RENDERIZADO VISUAL DE COMODINES COMO CARTAS ---
function renderComodinesVisual() {
  // Jugador
  const playerDiv = document.getElementById('playerComodinesCards');
  playerDiv.innerHTML = '';
  playerComodines.forEach((c, i) => {
    if (!c) {
      playerDiv.innerHTML += `<div class='comodin-card-visual dorso'><span style='font-size:1.2em;'>?</span></div>`;
      return;
    }
    const efectoClase = getComodinEfectoClase(c);
    let usarBtn = '';
    let extra = '';
    // Mostrar botón Usar SIEMPRE para todos los activables, incluyendo triple milagro
    if ([
      'cambalache','dominio_ilusorio','triple_milagro','finta_criolla','mate_cocido','flor_falsa','espuelas_plata','replica_honor','taba_aire'
    ].includes(c.id)) {
      usarBtn = `<button class='comodin-btn-usar' onclick='window.usarComodinAnimado("player", "${c.id}", ${i});event.stopPropagation();'>Usar</button>`;
    }
    if (c.id === 'dominio_ilusorio' && efectosTemporales.dominioIlusorio && efectosTemporales.dominioIlusorio.owner === 'player') {
      extra = `<div style='font-size:0.9em;color:#ffd600;font-weight:bold;' id='dominio-counter-player'>${efectosTemporales.dominioIlusorio.rondas} rondas</div>`;
    }
    playerDiv.innerHTML += `<div class='comodin-card-visual comodin-animado ${efectoClase}' id='comodin-player-${i}'>
      <div class='comodin-nombre'>${c.nombre}</div>
      <div class='comodin-desc'>${c.desc}</div>
      ${extra}
      ${usarBtn}
      <button class='comodin-x' onclick='window.removePlayerComodin(${i});event.stopPropagation();'>✖</button>
    </div>`;
  });
  // CPU
  const cpuDiv = document.getElementById('cpuComodinesCards');
  cpuDiv.innerHTML = '';
  cpuComodines.forEach((c, i) => {
    if (!c) {
      cpuDiv.innerHTML += `<div class='comodin-card-visual dorso'><span style='font-size:1.2em;'>?</span></div>`;
      return;
    }
    const efectoClase = getComodinEfectoClase(c);
    let extra = '';
    if (c.id === 'dominio_ilusorio' && efectosTemporales.dominioIlusorio && efectosTemporales.dominioIlusorio.owner === 'cpu') {
      extra = `<div style='font-size:0.9em;color:#ffd600;font-weight:bold;' id='dominio-counter-cpu'>${efectosTemporales.dominioIlusorio.rondas} rondas</div>`;
    }
    cpuDiv.innerHTML += `<div class='comodin-card-visual cpu dorso comodin-animado ${efectoClase}' id='comodin-cpu-${i}' title='Comodín CPU'>🤖${extra}</div>`;
  });
  // Global
  const globalDiv = document.getElementById('globalComodinCard');
  globalDiv.innerHTML = '';
  if (globalComodin) {
    const efectoClase = getComodinEfectoClase(globalComodin);
    let usarBtn = '';
    let extra = '';
    if ([
      'cambalache','dominio_ilusorio','triple_milagro','finta_criolla','mate_cocido','flor_falsa','espuelas_plata','replica_honor','taba_aire'
    ].includes(globalComodin.id)) {
      usarBtn = `<button class='comodin-btn-usar' onclick='window.usarComodinAnimado("global", "${globalComodin.id}", 0);event.stopPropagation();'>Usar</button>`;
    }
    if (globalComodin.id === 'dominio_ilusorio' && efectosTemporales.dominioIlusorio && efectosTemporales.dominioIlusorio.owner === 'global') {
      extra = `<div style='font-size:0.9em;color:#ffd600;font-weight:bold;' id='dominio-counter-global'>${efectosTemporales.dominioIlusorio.rondas} rondas</div>`;
    }
    globalDiv.innerHTML = `<div class='comodin-card-visual comodin-animado ${efectoClase}' id='comodin-global-0' style='background:linear-gradient(135deg,#fffbe6 60%,#ffe082 100%);border:2.5px solid #ffb300;'>
      <div class='comodin-nombre'>${globalComodin.nombre}</div>
      <div class='comodin-desc'>${globalComodin.desc}</div>
      ${extra}
      ${usarBtn}
      <button class='comodin-x' onclick='window.removeGlobalComodin();event.stopPropagation();'>✖</button>
    </div>`;
  }
}

// Animación GOTY para cada comodín activable
function animacionGOTYComodin(id, owner) {
  let overlay = document.createElement('div');
  let clase = '';
  let html = '';
  switch(id) {
    case 'cambalache':
      clase = 'anim-cambalache';
      html = '🔄🃏🃏';
      break;
    case 'dominio_ilusorio':
      clase = 'anim-dominio-ilusorio';
      html = '✨ Dominio Ilusorio ✨';
      break;
    case 'triple_milagro':
      clase = 'anim-triple-milagro';
      html = '🌟🌟🌟';
      break;
    case 'finta_criolla':
      clase = 'anim-finta-criolla';
      html = '🃏🔄';
      break;
    case 'mate_cocido':
      clase = 'anim-mate-cocido';
      html = '☕💨';
      break;
    case 'flor_falsa':
      clase = 'anim-flor-falsa';
      html = '🌸🌸🌸';
      break;
    case 'espuelas_plata':
      clase = 'anim-espuelas-plata';
      html = '✨🥾✨';
      break;
    case 'replica_honor':
      clase = 'anim-replica-honor';
      html = '🃏🃏';
      break;
    default:
      return;
  }
  overlay.className = clase;
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 1300);
}

// Hook para animación y activación de comodines activables
const usarComodinOriginal = usarComodin;
window.usarComodin = function(owner, id) {
  // Dominio Ilusorio: baja el contador y solo se quema cuando llega a 0
  if (id === 'dominio_ilusorio' && efectosTemporales.dominioIlusorio && efectosTemporales.dominioIlusorio.owner === owner) {
    let counterId = owner === 'player' ? 'dominio-counter-player' : owner === 'cpu' ? 'dominio-counter-cpu' : 'dominio-counter-global';
    let counterDiv = document.getElementById(counterId);
    if (efectosTemporales.dominioIlusorio.rondas > 1) {
      animacionGOTYComodin(id, owner);
      efectosTemporales.dominioIlusorio.rondas--;
      if (counterDiv) {
        counterDiv.textContent = efectosTemporales.dominioIlusorio.rondas + ' rondas';
        counterDiv.style.transition = 'color 0.3s, font-size 0.3s';
        counterDiv.style.color = '#fffde7';
        counterDiv.style.fontSize = '1.2em';
        setTimeout(() => {
          counterDiv.style.color = '#ffd600';
          counterDiv.style.fontSize = '0.9em';
        }, 600);
      }
      return;
    } else {
      animacionGOTYComodin(id, owner);
      usarComodinOriginal(owner, id);
      renderComodinesVisual();
      mostrarEfectoComodin(id, owner);
      renderHands();
      return;
    }
  }
  // Otros activables
  if ([
    'cambalache','triple_milagro','finta_criolla','mate_cocido','flor_falsa','espuelas_plata','replica_honor'
  ].includes(id)) {
    animacionGOTYComodin(id, owner);
    setTimeout(() => {
      usarComodinOriginal(owner, id);
      renderComodinesVisual();
      mostrarEfectoComodin(id, owner);
      renderHands();
    }, 1100);
    return;
  }
  // Taba en el Aire sigue igual
  if (id === 'taba_aire' && (owner === 'player' || owner === 'global')) {
    let mod = 1;
    if (efectosTemporales.tabaAire && efectosTemporales.tabaAire.owner === owner) {
      mod = efectosTemporales.tabaAire.mod;
    }
    mostrarTabaAireAnim(mod, () => {
      usarComodinOriginal(owner, id);
      renderComodinesVisual();
      mostrarEfectoComodin(id, owner);
      renderHands();
    });
    return;
  }
  usarComodinOriginal(owner, id);
  renderComodinesVisual();
  mostrarEfectoComodin(id, owner);
  renderHands();
};

function mostrarEfectoComodin(id, owner) {
  // Mensaje visual temático
  let nombre = '';
  let desc = '';
  let color = '#fff';
  switch (id) {
    case 'yerba_mala': nombre = '¡Yerba Mala!'; desc = 'El campo se tiñe de verde.'; color = '#4caf50'; break;
    case 'taba_aire': nombre = '¡Taba en el Aire!'; desc = 'El destino gira...'; color = '#2196f3'; break;
    case 'mufa_selectiva': nombre = '¡Mufa Selectiva!'; desc = 'Un número queda maldito.'; color = '#8e24aa'; break;
    case 'palo_unico': nombre = '¡Palo Único!'; desc = 'Solo un palo dominará.'; color = '#ffd600'; break;
    case 'dominio_ilusorio': nombre = '¡Dominio Ilusorio!'; desc = 'El palo se transforma.'; color = '#ffd600'; break;
    case 'cambalache': nombre = '¡Cambalache!'; desc = 'Intercambio misterioso.'; color = '#ff9800'; break;
    case 'finta_criolla': nombre = '¡Finta Criolla!'; desc = 'Jugada oculta.'; color = '#ff9800'; break;
    case 'desempate_criollo': nombre = '¡Desempate Criollo!'; desc = 'El empate se rompe.'; color = '#ff5722'; break;
    case 'triple_milagro': nombre = '¡Triple Milagro!'; desc = 'La suerte te sonríe.'; color = '#00bcd4'; break;
    case 'mate_cocido': nombre = '¡Mate Cocido!'; desc = 'El mate calienta la ronda.'; color = '#795548'; break;
    case 'flor_falsa': nombre = '¡Flor Falsa!'; desc = 'Una flor inesperada.'; color = '#e91e63'; break;
    case 'espuelas_plata': nombre = '¡Espuelas de Plata!'; desc = 'Aceleras la jugada.'; color = '#bdbdbd'; break;
    case 'replica_honor': nombre = '¡Réplica de Honor!'; desc = 'El honor se duplica.'; color = '#607d8b'; break;
    default: nombre = '¡Comodín!'; desc = 'Se activa un efecto especial.'; color = '#fff';
  }
  const msg = document.createElement('div');
  msg.textContent = `${nombre} ${desc}`;
  msg.style.position = 'fixed';
  msg.style.top = '30%';
  msg.style.left = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.background = color;
  msg.style.color = '#222';
  msg.style.fontSize = '2em';
  msg.style.fontWeight = 'bold';
  msg.style.padding = '18px 36px';
  msg.style.borderRadius = '18px';
  msg.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
  msg.style.zIndex = 99999;
  msg.style.opacity = 0.95;
  document.body.appendChild(msg);
  setTimeout(() => { msg.style.opacity = 0; }, 1200);
  setTimeout(() => { if (msg.parentNode) msg.parentNode.removeChild(msg); }, 1800);
}

// --- GESTIÓN DE SLOTS Y QUEMA DE COMODINES ---
function asegurarComodinesLlenos() {
  // Si el jugador tiene menos de 2, forzar tienda
  if (playerComodines.filter(Boolean).length < 2) {
    showShop();
    // El botón de continuar siempre está habilitado
  }
  // Si la CPU tiene menos de 2, reponer
  while (cpuComodines.filter(Boolean).length < 2) {
    cpuObtenerComodinInteligente();
  }
}

// Hook en la tienda - siempre permite continuar
const hideShopOriginal = hideShop;
hideShop = function() {
  // Siempre permite continuar, sin importar cuántos comodines tenga
  hideShopOriginal();
};

// --- QUEMA DE COMODINES DE USO ÚNICO ---
function quemarComodin(owner, id) {
  // Registrar uso de comodín en estadísticas
  if (typeof window.playerStats !== 'undefined') {
    window.playerStats.recordComodinUsed(id);
    window.playerStats.unlockComodin(id);
  }
  
  // Verificar si Legado Eterno está activo
  if (efectosTemporales.legadoEterno && efectosTemporales.legadoEterno.owner === owner) {
    // En lugar de quemar el comodín, marcarlo como usado pero mantenerlo
    pushGameMessage(`${owner === 'player' ? '¡Legado Eterno!' : 'CPU usó Legado Eterno'} - Comodín reutilizable`);
    return; // No quemar el comodín
  }
  
  if (owner === 'player') {
    const idx = playerComodines.findIndex(c => c && c.id === id);
    if (idx !== -1) playerComodines[idx] = null;
  } else if (owner === 'cpu') {
    const idx = cpuComodines.findIndex(c => c && c.id === id);
    if (idx !== -1) cpuComodines[idx] = null;
  }
  renderSlots();
}

// --- EFECTOS Y USO DE COMODINES DE USO ÚNICO ---
function usarComodin(owner, id) {
  // Ejemplo: Desempate Criollo
  if (id === 'desempate_criollo') {
    // Se activa automáticamente en empate, ver lógica de empate en envido/truco
    quemarComodin(owner, id);
  }
  if (id === 'finta_criolla') {
    // Permitir jugar una carta boca abajo (requiere lógica en playPlayerCard)
    // Aquí solo marcamos como usado
    if (owner === 'cpu') {
      // CPU juega la carta más baja boca abajo si es ventajoso
      let mano = gameState.cpuHand;
      if (mano && mano.length > 0) {
        let cartaMasBaja = mano.reduce((min, c) => getTrucoPower(c) < getTrucoPower(min) ? c : min, mano[0]);
        // Simular jugarla boca abajo (en este ejemplo, solo la juega y la quema)
        let idx = mano.indexOf(cartaMasBaja);
        if (idx !== -1) {
          mano.splice(idx, 1);
          // Aquí podrías marcarla como "boca abajo" si implementas esa lógica visual
        }
      }
    }
    quemarComodin(owner, id);
  }
  if (id === 'cambalache') {
    // Permitir cambiar una carta de la mano por una del mazo (requiere UI extra)
    if (owner === 'cpu') {
      let mano = gameState.cpuHand;
      if (mano && mano.length > 0 && gameState.deck && gameState.deck.length > 0) {
        let cartaMasBaja = mano.reduce((min, c) => getTrucoPower(c) < getTrucoPower(min) ? c : min, mano[0]);
        let idx = mano.indexOf(cartaMasBaja);
        if (idx !== -1) {
          // Cambia la carta más baja por la primera del mazo
          let nueva = gameState.deck.pop();
          mano[idx] = nueva;
        }
      }
    }
    quemarComodin(owner, id);
  }
  // ... otros comodines de uso único ...
}

// --- CPU: USO Y BLUFF DE COMODINES ---
function cpuJugarComodines() {
  // La CPU decide si blufear o usar un comodín real
  cpuComodines.forEach((c, i) => {
    if (!c) return;
    // Ejemplo: si tiene Finta Criolla, puede jugar una carta boca abajo
    if (c.id === 'finta_criolla' && Math.random() < 0.5) {
      // CPU juega una carta boca abajo (requiere lógica en cpuPlay)
      quemarComodin('cpu', c.id);
      pushGameMessage('La CPU parece estar ocultando una jugada...');
    }
    // Ejemplo: si tiene Cambalache, puede cambiar una carta
    if (c.id === 'cambalache' && Math.random() < 0.4) {
      // CPU cambia una carta (requiere lógica en cpuPlay)
      quemarComodin('cpu', c.id);
      pushGameMessage('La CPU intercambió una carta misteriosamente.');
    }
    // Ejemplo: si tiene Desempate Criollo, se activa en empate
    // (ver lógica de empate en evaluateTrick y envido)
  });
}

// --- INTEGRACIÓN EN EL FLUJO DE PARTIDA ---
// Hook en startNewGame para asegurar slots llenos y renderizar
const startNewGameOriginal3 = startNewGame;
startNewGame = function() {
  asegurarComodinesLlenos();
  startNewGameOriginal3();
  renderComodinesVisual();
};

// Hook en endRound para asegurar slots llenos y renderizar
const endRoundOriginal2 = endRound;
endRound = function() {
  endRoundOriginal2();
  asegurarComodinesLlenos();
  renderComodinesVisual();
};

// Hook en cpuPlay para que la CPU use/blufee comodines
const cpuPlayOriginal2 = cpuPlay;
cpuPlay = function() {
  cpuJugarComodines();
  cpuPlayOriginal2();
};

// Hook en playPlayerCard para renderizar comodines tras jugada
const playPlayerCardOriginal2 = playPlayerCard;
playPlayerCard = function(index, porTimeout) {
  playPlayerCardOriginal2(index, porTimeout);
  renderComodinesVisual();
};

// Inicialización visual
renderComodinesVisual();
// ... existing code ... 

// --- DIFICULTAD PROGRESIVA DE LA CPU ---
let dificultadCPU = 1;
function actualizarDificultadCPU() {
  // Aumenta cada 3 rondas o cada chico ganado por la CPU
  dificultadCPU = 1 + Math.floor((gameState.currentRound-1)/3) + gameState.cpuChicos;
  if (dificultadCPU > 5) dificultadCPU = 5;
}

// --- CPU SIEMPRE CON 2 COMODINES ---
function asegurarComodinesCPU() {
  while (cpuComodines.filter(Boolean).length < 2) {
    cpuObtenerComodinInteligente();
  }
}

// Hook en startNewGame para dificultad y comodines CPU
const startNewGameOriginal4 = startNewGame;
startNewGame = function() {
  actualizarDificultadCPU();
  asegurarComodinesCPU();
  startNewGameOriginal4();
  renderComodinesVisual();
};

// --- EFECTOS BASADOS EN COMODINES ACTIVOS, NO EN SLOTS ---
function getComodinesActivos(owner) {
  // Devuelve todos los comodines activos del jugador/cpu, sin importar el slot
  let arr = [];
  if (owner === 'player') arr = playerComodines.filter(Boolean);
  else if (owner === 'cpu') arr = cpuComodines.filter(Boolean);
  if (globalComodin) arr.push(globalComodin);
  return arr;
}

// Reemplazar getAllComodines por getComodinesActivos en todos los hooks de efectos
// (puedes buscar y reemplazar en el código si es necesario)

// --- MUFA SELECTIVA: DERROTA AUTOMÁTICA SI SOLO QUEDA LA CARTA BLOQUEADA ---
function checkMufaSelectivaDerrota() {
  // Jugador
  if (efectosTemporales.mufaSelectiva && efectosTemporales.mufaSelectiva.owner==='cpu') {
    if (gameState.playerHand.length === 1 && gameState.playerHand[0].rank == efectosTemporales.mufaSelectiva.numero) {
      pushGameMessage('¡Te quedaste solo con la carta bloqueada por Mufa Selectiva! Pierdes la ronda.');
      setTimeout(() => { endRound(); showShop(); }, 1200);
      return true;
    }
  }
  // CPU
  if (efectosTemporales.mufaSelectiva && efectosTemporales.mufaSelectiva.owner==='player') {
    if (gameState.cpuHand.length === 1 && gameState.cpuHand[0].rank == efectosTemporales.mufaSelectiva.numero) {
      pushGameMessage('¡La CPU quedó solo con la carta bloqueada por Mufa Selectiva! Ganas la ronda.');
      setTimeout(() => { endRound(); showShop(); }, 1200);
      return true;
    }
  }
  return false;
}

// Hook en playPlayerCard y cpuPlay para chequear Mufa Selectiva
const playPlayerCardOriginal3 = playPlayerCard;
playPlayerCard = function(index, porTimeout) {
  playPlayerCardOriginal3(index, porTimeout);
  renderComodinesVisual();
  checkMufaSelectivaDerrota();
};
const cpuPlayOriginal3 = cpuPlay;
cpuPlay = function() {
  cpuJugarComodines();
  cpuPlayOriginal3();
  renderComodinesVisual();
  checkMufaSelectivaDerrota();
};

// --- CPU: OBTENCIÓN INTELIGENTE DE COMODINES SEGÚN DIFICULTAD ---
function cpuObtenerComodinInteligente() {
  // La CPU prioriza comodines según dificultad y situación
  const exclude = cpuComodines.filter(Boolean).map(c => c.id);
  if (globalComodin) exclude.push(globalComodin.id);
  const opciones = getRandomComodines(5, exclude); // Más opciones a mayor dificultad
  // Prioridad dinámica
  let prioridad = [
    'yerba_mala','mufa_selectiva','taba_aire','palo_unico','dominio_ilusorio',
    'replica_honor','espuelas_plata','corazon_truquero','gaucho_invisible',
    'cambalache','finta_criolla','mate_cocido','flor_falsa','triple_milagro','desempate_criollo'
  ];
  // A mayor dificultad, prioriza los más molestos para el jugador
  if (dificultadCPU >= 3) {
    prioridad.unshift('mufa_selectiva','yerba_mala','gaucho_invisible','taba_aire');
  }
  if (dificultadCPU >= 4) {
    prioridad.unshift('desempate_criollo','replica_honor','espuelas_plata');
  }
  if (dificultadCPU >= 5) {
    prioridad.unshift('cambalache','finta_criolla','triple_milagro');
  }
  let elegido = null;
  for (let p of prioridad) {
    elegido = opciones.find(c => c.id === p);
    if (elegido) break;
  }
  if (!elegido && opciones.length>0) elegido = opciones[0];
  const slot = cpuComodines.findIndex(c => !c);
  if (slot !== -1 && elegido) {
    cpuComodines[slot] = elegido;
    renderSlots();
  } else if (!globalComodin && elegido) {
    globalComodin = elegido;
    renderSlots();
  }
}

// --- QUEMA DE COMODINES DE USO ÚNICO Y REPOSICIÓN ---
function quemarComodin(owner, id) {
  if (owner === 'player') {
    const idx = playerComodines.findIndex(c => c && c.id === id);
    if (idx !== -1) playerComodines[idx] = null;
  } else if (owner === 'cpu') {
    const idx = cpuComodines.findIndex(c => c && c.id === id);
    if (idx !== -1) cpuComodines[idx] = null;
    // Reponer si la CPU pierde uno
    setTimeout(asegurarComodinesCPU, 500);
  }
  renderSlots();
}
// ... existing code ... 

// --- CPU: CAMBIO DE COMODINES CADA RONDA ---
function cpuCambiarComodinesCadaRonda() {
  // Descarta ambos comodines
  cpuComodines = [null, null];
  // Excluir el global y los que ya tiene el jugador
  const exclude = [];
  if (globalComodin) exclude.push(globalComodin.id);
  playerComodines.forEach(c => { if (c) exclude.push(c.id); });
  // Obtener 2 nuevos comodines diferentes
  const nuevos = getRandomComodines(2, exclude);
  cpuComodines[0] = nuevos[0] || null;
  cpuComodines[1] = nuevos[1] || null;
  renderSlots();
}

// Hook en startNewGame para cambiar comodines de la CPU cada ronda
const startNewGameOriginal5 = startNewGame;
startNewGame = function() {
  cpuCambiarComodinesCadaRonda();
  startNewGameOriginal5();
  renderComodinesVisual();
};

// Refuerzo para que la CPU nunca se bloquee con comodines nuevos que requieran decisión
function decisionComodinCPU(comodin, mano) {
  // Si se agregan nuevos comodines que requieren decisión, la CPU elige siempre una opción válida
  if (comodin.id === 'palo_unico' || comodin.id === 'dominio_ilusorio') {
    let palos = mano.reduce((acc, c) => { acc[c.suit] = (acc[c.suit]||0)+1; return acc; }, {});
    let mejorPalo = Object.keys(palos).sort((a,b)=>palos[b]-palos[a])[0] || 'espada';
    return mejorPalo;
  }
  if (comodin.id === 'mufa_selectiva') {
    let nums = mano.map(c=>c.rank);
    let num = nums.find(n => nums.filter(x=>x===n).length===1) || nums[0] || 7;
    return num;
  }
  if (comodin.id === 'taba_aire') {
    return Math.random() < 0.5 ? 1 : -1;
  }
  // Por defecto, si el comodín requiere una opción, elige la primera válida
  return null;
}

function getComodinEfectoClase(comodin) {
  if (!comodin) return '';
  switch (comodin.id) {
    case 'yerba_mala': return 'efecto-yerba-mala';
    case 'taba_aire': return 'efecto-taba-aire';
    case 'mufa_selectiva': return 'efecto-mufa-selectiva';
    case 'palo_unico':
    case 'dominio_ilusorio': return 'efecto-palo-unico';
    default: return '';
  }
}

function esComodinSituacional(comodin) {
  if (!comodin) return false;
  return [
    'cambalache','finta_criolla','desempate_criollo','triple_milagro',
    'mate_cocido','flor_falsa','espuelas_plata','replica_honor'
  ].includes(comodin.id);
}

// --- Forzar tienda tras cada ronda ---
const endRoundOriginal3 = endRound;
endRound = function() {
  endRoundOriginal3();
  setTimeout(() => {
    if (!document.getElementById('shopOverlay').style.display || document.getElementById('shopOverlay').style.display === 'none') {
      showShop();
    }
  }, 800);
};

function cartaBloqueadaPorComodin(card, owner) {
  // Por ahora solo Mufa Selectiva, pero se puede extender para otros comodines
  if (efectosTemporales.mufaSelectiva && efectosTemporales.mufaSelectiva.owner !== owner) {
    if (card.rank == efectosTemporales.mufaSelectiva.numero) return true;
  }
  // Aquí puedes agregar más condiciones para otros comodines que bloqueen cartas
  return false;
}

function checkCartaUnicaBloqueada() {
  // Jugador
  if (gameState.playerHand.length === 1 && cartaBloqueadaPorComodin(gameState.playerHand[0], 'player')) {
    pushGameMessage('¡Te quedaste solo con la carta bloqueada! Pierdes la ronda.');
    setTimeout(() => { endRound(); showShop(); }, 1200);
    return true;
  }
  // CPU
  if (gameState.cpuHand.length === 1 && cartaBloqueadaPorComodin(gameState.cpuHand[0], 'cpu')) {
    pushGameMessage('¡La CPU quedó solo con la carta bloqueada! Ganas la ronda.');
    setTimeout(() => { endRound(); showShop(); }, 1200);
    return true;
  }
  return false;
}

// Llama a checkCartaUnicaBloqueada después de cada jugada
const playPlayerCardOriginal4 = playPlayerCard;
playPlayerCard = function(index, porTimeout) {
  playPlayerCardOriginal4(index, porTimeout);
  renderComodinesVisual();
  checkCartaUnicaBloqueada();
};
const cpuPlayOriginal4 = cpuPlay;
cpuPlay = function() {
  cpuJugarComodines();
  cpuPlayOriginal4();
  renderComodinesVisual();
  checkCartaUnicaBloqueada();
};

// --- Temporizador de turno solo después de la tienda ---
const hideShopOriginal2 = hideShop;
hideShop = function() {
  hideShopOriginal2();
  renderHands();
  renderPlayArea();
  updateMessage();
  updateButtons();
  if (document.getElementById('shopOverlay').style.display === 'none') {
    if (gameState.gamePhase === 'waiting') {
      startNewGame();
    } else {
      startTurnTimeout();
    }
  }
};

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
  // Prioriza tracks del mood, pero nunca repite la última
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

// Hook para iniciar soundtrack al empezar la primera ronda
let startNewGameOriginalSound = startNewGame;
startNewGame = function() {
  if (!soundtrackStarted) {
    soundtrackStarted = true;
    playSoundtrack(getGameMood());
  } else {
    // Cambia de track si el mood cambió
    playSoundtrack(getGameMood());
  }
  startNewGameOriginalSound();
};
// También hook para startNewGameConComodines si existe
if (typeof startNewGameConComodines === 'function') {
  const startNewGameConComodinesOriginal = startNewGameConComodines;
  startNewGameConComodines = function() {
    if (!soundtrackStarted) {
      soundtrackStarted = true;
      playSoundtrack(getGameMood());
    } else {
      playSoundtrack(getGameMood());
    }
    startNewGameConComodinesOriginal();
  };
}

// Detener soundtrack al terminar la partida
const endGameOriginal = endGame;
endGame = function() {
  stopAllSoundtrack();
  soundtrackStarted = false;
  endGameOriginal();
};

// Sincronizar volumen de todos los audios al cargar la página
function syncAllAudioVolume() {
  const vol = volumeSlider.value / 100;
  soundtrackTracks.forEach(t => {
    const audio = document.getElementById(t.id);
    if (audio) audio.volume = vol;
  });
}
document.addEventListener('DOMContentLoaded', syncAllAudioVolume);

// Cambiar soundtrack si cambia el volumen
volumeSlider.addEventListener('input', function() {
  syncAllAudioVolume();
});

// --- FIN SOUNDTRACK DINÁMICO ---

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

document.addEventListener('DOMContentLoaded', function() {
  syncAllAudioVolume();
  const btnStart = document.getElementById('btnStart');
  if (btnStart) {
    btnStart.addEventListener('click', function() {
      if (!soundtrackStarted) {
        soundtrackStarted = true;
        playSoundtrack(getGameMood());
      }
    }, { capture: true }); // capture para que se ejecute antes que otros listeners
  }
});

// Asegurar función global para el botón Usar de comodines
window.usarComodinAnimado = function(owner, id, idx) {
  // Llama al hook de animación y uso
  window.usarComodin(owner, id);
};

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
    
    console.log('🔄 Iniciando carga diferida de recursos no esenciales (Roguelike)...');
    
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

// Iniciar carga diferida después de un breve delay
setTimeout(lazyLoadResources, 2000);

