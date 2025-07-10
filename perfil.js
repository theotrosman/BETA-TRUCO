import { authManager } from './auth.js';

// Sistema de estadísticas del perfil
class PlayerStats {
    constructor() {
        this.userId = null;
        this.loadStats();
        this.setupAutoSave();
    }

    validateStats() {
        return typeof this.gamesPlayed === 'number';
    }

    // Cargar estadísticas desde Firestore
    async loadStats() {
        const user = authManager.getCurrentUser();
        if (!user) {
            console.warn('Usuario no autenticado');
            await this.initializeDefaultStats();
            return;
        }
        
        this.userId = user.uid;
        const profile = await authManager.getUserProfile(user.uid);
        
        if (profile && profile.stats) {
            Object.assign(this, profile.stats);
            // Asegurar que los objetos existen
            this.cardsPlayed = this.cardsPlayed || {};
            this.cardsWon = this.cardsWon || {};
            this.cardsEnvido = this.cardsEnvido || {};
            this.cardsTruco = this.cardsTruco || {};
            this.comodinesUnlocked = this.comodinesUnlocked || [];
            this.comodinesUsed = this.comodinesUsed || {};
            this.achievements = this.achievements || {};
            this.gameHistory = this.gameHistory || [];
            this.cpuStats = this.cpuStats || { wins: 0, losses: 0, avgTimePerTurn: 0, strategyChoices: {} };
            if (!this.validateStats()) {
                console.warn('⚠️ Estadísticas corruptas, reinicializando...');
                await this.initializeDefaultStats();
            }
        } else {
            await this.initializeDefaultStats();
        }
    }

    // Inicializar estadísticas por defecto
    async initializeDefaultStats() {
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.chicosWon = 0;
        this.envidosWon = 0;
        this.trucosWon = 0;
        this.floresCantadas = 0;
        this.avgTimePerTurn = 0;
        this.comodinesUsados = 0;
        this.totalTimePlayed = 0;
        this.turnsPlayed = 0;
        
        // Estadísticas de cartas
        this.cardsPlayed = {};
        this.cardsWon = {};
        this.cardsEnvido = {};
        this.cardsTruco = {};
        
        // Comodines desbloqueados
        this.comodinesUnlocked = [];
        this.comodinesUsed = {};
        
        // Logros
        this.achievements = {};
        
        // Historial de partidas
        this.gameHistory = [];
        
        // Estadísticas de la CPU
        this.cpuStats = {
            wins: 0,
            losses: 0,
            avgTimePerTurn: 0,
            strategyChoices: {}
        };
        
        await this.saveStats();
    }

    // Guardar estadísticas en Firestore
    async saveStats() {
        if (!this.userId) {
            console.warn('No hay usuario autenticado para guardar estadísticas');
            return;
        }
        
        const statsData = {
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            chicosWon: this.chicosWon,
            envidosWon: this.envidosWon,
            trucosWon: this.trucosWon,
            floresCantadas: this.floresCantadas,
            avgTimePerTurn: this.avgTimePerTurn,
            comodinesUsados: this.comodinesUsados,
            totalTimePlayed: this.totalTimePlayed,
            turnsPlayed: this.turnsPlayed,
            cardsPlayed: this.cardsPlayed,
            cardsWon: this.cardsWon,
            cardsEnvido: this.cardsEnvido,
            cardsTruco: this.cardsTruco,
            comodinesUnlocked: this.comodinesUnlocked,
            comodinesUsed: this.comodinesUsed,
            achievements: this.achievements,
            gameHistory: this.gameHistory,
            cpuStats: this.cpuStats
        };
        
        await authManager.updateUserProfile(this.userId, { stats: statsData });
    }
    
    // Configurar guardado automático
    setupAutoSave() {
        if (STATS_CONFIG.AUTO_SAVE_INTERVAL > 0) {
            setInterval(async () => {
                await this.saveStats();
            }, STATS_CONFIG.AUTO_SAVE_INTERVAL);
        }
    }

    // Actualizar estadísticas después de una partida
    async updateGameStats(gameResult) {
        this.gamesPlayed++;
        
        if (gameResult.won) {
            this.gamesWon++;
        }
        
        if (gameResult.chicosWon) {
            this.chicosWon += gameResult.chicosWon;
        }
        
        if (gameResult.envidosWon) {
            this.envidosWon += gameResult.envidosWon;
        }
        
        if (gameResult.trucosWon) {
            this.trucosWon += gameResult.trucosWon;
        }
        
        if (gameResult.floresCantadas) {
            this.floresCantadas += gameResult.floresCantadas;
        }
        
        if (gameResult.comodinesUsados) {
            this.comodinesUsados += gameResult.comodinesUsados;
        }
        
        if (gameResult.timePlayed) {
            this.totalTimePlayed += gameResult.timePlayed;
        }
        
        if (gameResult.turnsPlayed) {
            this.turnsPlayed += gameResult.turnsPlayed;
        }
        
        // Actualizar promedio de tiempo
        if (this.turnsPlayed > 0) {
            this.avgTimePerTurn = this.totalTimePlayed / this.turnsPlayed;
        }
        
        // Agregar a historial
        this.gameHistory.push({
            date: new Date().toISOString(),
            result: gameResult
        });
        
        // Limitar historial a 100 partidas
        if (this.gameHistory.length > 100) {
            this.gameHistory = this.gameHistory.slice(-100);
        }
        
        await this.saveStats();
        await this.checkAchievements();
    }

    // Registrar carta jugada
    async recordCardPlayed(cardCode, won = false, envido = false, truco = false) {
        if (!this.cardsPlayed[cardCode]) {
            this.cardsPlayed[cardCode] = 0;
        }
        this.cardsPlayed[cardCode]++;
        
        if (won) {
            if (!this.cardsWon[cardCode]) {
                this.cardsWon[cardCode] = 0;
            }
            this.cardsWon[cardCode]++;
        }
        
        if (envido) {
            if (!this.cardsEnvido[cardCode]) {
                this.cardsEnvido[cardCode] = 0;
            }
            this.cardsEnvido[cardCode]++;
        }
        
        if (truco) {
            if (!this.cardsTruco[cardCode]) {
                this.cardsTruco[cardCode] = 0;
            }
            this.cardsTruco[cardCode]++;
        }
        
        await this.saveStats();
    }

    // Desbloquear comodín
    async unlockComodin(comodinId) {
        if (!this.comodinesUnlocked.includes(comodinId)) {
            this.comodinesUnlocked.push(comodinId);
            await this.saveStats();
        }
    }

    // Registrar uso de comodín
    async recordComodinUsed(comodinId) {
        if (!this.comodinesUsed[comodinId]) {
            this.comodinesUsed[comodinId] = 0;
        }
        this.comodinesUsed[comodinId]++;
        await this.saveStats();
    }

    // Verificar logros
    async checkAchievements() {
        for (const [id, achievement] of Object.entries(STATS_CONFIG.ACHIEVEMENTS)) {
            if (!this.achievements[id] && achievement.condition(this)) {
                this.achievements[id] = {
                    unlocked: true,
                    date: new Date().toISOString(),
                    name: achievement.name,
                    desc: achievement.desc
                };
                this.showAchievementNotification(achievement.name);
            }
        }
        
        await this.saveStats();
    }

    // Métodos auxiliares para logros
    getCurrentWinStreak() {
        let streak = 0;
        for (let i = this.gameHistory.length - 1; i >= 0; i--) {
            if (this.gameHistory[i].result.won) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    hasPerfectGame() {
        // Buscar en el historial una partida perfecta
        return this.gameHistory.some(game => game.result.perfectGame);
    }

    hasComebackWin() {
        // Buscar en el historial una victoria por comeback
        return this.gameHistory.some(game => game.result.comebackWin);
    }

    hasPlayedAllCards() {
        const allCards = ['1espada', '1basto', '1oro', '1copa', '2espada', '2basto', '2oro', '2copa', 
                         '3espada', '3basto', '3oro', '3copa', '4espada', '4basto', '4oro', '4copa',
                         '5espada', '5basto', '5oro', '5copa', '6espada', '6basto', '6oro', '6copa',
                         '7espada', '7basto', '7oro', '7copa', '10espada', '10basto', '10oro', '10copa',
                         '11espada', '11basto', '11oro', '11copa', '12espada', '12basto', '12oro', '12copa'];
        return allCards.every(card => this.cardsPlayed[card] > 0);
    }

    hasHighEnvido() {
        // Buscar en el historial un envido alto
        return this.gameHistory.some(game => game.result.highEnvido);
    }

    hasWonValeCuatro() {
        // Buscar en el historial una victoria en vale cuatro
        return this.gameHistory.some(game => game.result.valeCuatroWin);
    }

    // Mostrar notificación de logro
    showAchievementNotification(achievementName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.5s ease-out;
        `;
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🏆 ¡Logro Desbloqueado!</div>
            <div>${achievementName}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Obtener nivel del jugador
    getPlayerLevel() {
        return StatsUtils.calculateLevel(this);
    }

    // Obtener cartas más jugadas
    getTopCards(limit = 5) {
        if (!this.cardsPlayed || typeof this.cardsPlayed !== 'object') return [];
        return Object.entries(this.cardsPlayed)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([card, count]) => ({ card, count }));
    }

    // Obtener cartas más efectivas (mayor ratio de victoria)
    getMostEffectiveCards(limit = 5) {
        if (!this.cardsWon || typeof this.cardsWon !== 'object') return [];
        return Object.entries(this.cardsWon)
            .map(([card, wins]) => ({
                card,
                wins,
                played: this.cardsPlayed && this.cardsPlayed[card] || 0,
                ratio: this.cardsPlayed && this.cardsPlayed[card] ? wins / this.cardsPlayed[card] : 0
            }))
            .filter(item => item.played >= 3) // Mínimo 3 usos para ser significativo
            .sort((a, b) => b.ratio - a.ratio)
            .slice(0, limit);
    }

    // Obtener cartas de envido más usadas
    getTopEnvidoCards(limit = 5) {
        if (!this.cardsEnvido || typeof this.cardsEnvido !== 'object') return [];
        return Object.entries(this.cardsEnvido)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([card, count]) => ({ card, count }));
    }
}

async function waitForAuthAndStats() {
    return new Promise((resolve) => {
        const check = async () => {
            const user = authManager.getCurrentUser();
            if (user) {
                if (!window.playerStats) {
                    window.playerStats = new PlayerStats();
                    await window.playerStats.loadStats();
                }
                resolve();
            } else {
                setTimeout(check, 200);
            }
        };
        check();
    });
}

function showTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Quitar activo de todos los botones
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Mostrar el contenido correcto
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    // Activar el botón correcto
    const btn = document.querySelector(`.tab[data-tab="${tabName}"]`);
    if (btn) {
        btn.classList.add('active');
    }
    // Renderizar datos
    switch(tabName) {
        case 'stats':
            window.playerStats && loadStatsTab();
            break;
        case 'cards':
            window.playerStats && loadCardsTab();
            break;
        case 'comodines':
            window.playerStats && loadComodinesTab();
            break;
        case 'achievements':
            window.playerStats && loadAchievementsTab();
            break;
    }
}
window.showTab = showTab;

document.addEventListener('DOMContentLoaded', async () => {
    await waitForAuthAndStats();
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            showTab(this.dataset.tab);
        });
    });
    showTab('stats');
});

function loadStatsTab() {
    const stats = window.playerStats || {};
    const level = (stats.getPlayerLevel ? stats.getPlayerLevel() : { name: 'Novato', level: 1 });
    document.getElementById('playerName').textContent = `Truquero ${level.name}`;
    document.getElementById('playerLevel').textContent = `Nivel ${level.level} - ${level.name}`;
    document.getElementById('gamesPlayed').textContent = stats.gamesPlayed || 0;
    document.getElementById('gamesWon').textContent = stats.gamesWon || 0;
    document.getElementById('chicosWon').textContent = stats.chicosWon || 0;
    document.getElementById('envidosWon').textContent = stats.envidosWon || 0;
    document.getElementById('trucosWon').textContent = stats.trucosWon || 0;
    document.getElementById('floresCantadas').textContent = stats.floresCantadas || 0;
    document.getElementById('avgTime').textContent = `${Math.round(stats.avgTimePerTurn || 0)}s`;
    document.getElementById('comodinesUsados').textContent = stats.comodinesUsados || 0;
    const winRate = (stats.gamesPlayed > 0) ? ((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    document.getElementById('winPercentage').textContent = `${Math.round(winRate)}%`;
    document.getElementById('gamesProgress').style.width = `${Math.min(((stats.gamesPlayed || 0) / 50) * 100, 100)}%`;
    document.getElementById('winRate').style.width = `${winRate}%`;
    document.getElementById('chicosProgress').style.width = `${Math.min(((stats.chicosWon || 0) / 10) * 100, 100)}%`;
    document.getElementById('envidosProgress').style.width = `${Math.min(((stats.envidosWon || 0) / 20) * 100, 100)}%`;
    document.getElementById('trucosProgress').style.width = `${Math.min(((stats.trucosWon || 0) / 30) * 100, 100)}%`;
    document.getElementById('floresProgress').style.width = `${Math.min(((stats.floresCantadas || 0) / 10) * 100, 100)}%`;
    document.getElementById('timeProgress').style.width = `${Math.min((15 - (stats.avgTimePerTurn || 0)) / 15 * 100, 100)}%`;
    document.getElementById('comodinesProgress').style.width = `${Math.min(((stats.comodinesUsados || 0) / 20) * 100, 100)}%`;
}

function loadCardsTab() {
    if (!window.playerStats) return;
    const topCards = window.playerStats.getTopCards ? window.playerStats.getTopCards(8) : [];
    const effectiveCards = window.playerStats.getMostEffectiveCards ? window.playerStats.getMostEffectiveCards(8) : [];
    const envidoCards = window.playerStats.getTopEnvidoCards ? window.playerStats.getTopEnvidoCards(8) : [];
    const topCardsDiv = document.getElementById('topCards');
    if (topCardsDiv) {
        topCardsDiv.innerHTML = topCards.length
            ? topCards.map(card => `<div class="card-stat"><div class="card-image" style="background-image: url('./resources/cartas/${card.card.replace(/([0-9]+)([a-z]+)/, '$1de$2')}.png')"></div><div class="card-info"><h4>${getCardDisplayName(card.card)}</h4><p>Jugada ${card.count} veces</p></div></div>`).join('')
            : '<div>No hay datos de cartas jugadas.</div>';
    }
    const effectiveCardsDiv = document.getElementById('effectiveCards');
    if (effectiveCardsDiv) {
        effectiveCardsDiv.innerHTML = effectiveCards.length
            ? effectiveCards.map(card => `<div class="card-stat"><div class="card-image" style="background-image: url('./resources/cartas/${card.card.replace(/([0-9]+)([a-z]+)/, '$1de$2')}.png')"></div><div class="card-info"><h4>${getCardDisplayName(card.card)}</h4><p>${card.wins}/${card.played} victorias (${Math.round(card.ratio * 100)}%)</p></div></div>`).join('')
            : '<div>No hay datos de cartas efectivas.</div>';
    }
    const envidoCardsDiv = document.getElementById('envidoCards');
    if (envidoCardsDiv) {
        envidoCardsDiv.innerHTML = envidoCards.length
            ? envidoCards.map(card => `<div class="card-stat"><div class="card-image" style="background-image: url('./resources/cartas/${card.card.replace(/([0-9]+)([a-z]+)/, '$1de$2')}.png')"></div><div class="card-info"><h4>${getCardDisplayName(card.card)}</h4><p>Usada ${card.count} veces en envido</p></div></div>`).join('')
            : '<div>No hay datos de cartas de envido.</div>';
    }
}

function loadComodinesTab() {
    if (!window.playerStats) return;
    const allComodines = getAllComodinesList();
    const comodinesGrid = document.getElementById('comodinesGrid');
    if (comodinesGrid) {
        comodinesGrid.innerHTML = allComodines.map(comodin => {
            const isUnlocked = window.playerStats.comodinesUnlocked.includes(comodin.id);
            const timesUsed = window.playerStats.comodinesUsed[comodin.id] || 0;
            return `<div class="comodin-card-profile ${isUnlocked ? 'unlocked' : 'locked'}"><div class="comodin-header"><div class="comodin-icon">${getComodinIcon(comodin.id)}</div><div class="comodin-title"><h4>${comodin.nombre}</h4><p>${isUnlocked ? 'Desbloqueado' : 'Bloqueado'}</p></div></div><div class="comodin-desc">${comodin.desc}</div><div class="comodin-stats"><span>Usado: ${timesUsed} veces</span><span>${isUnlocked ? '✅' : '🔒'}</span></div></div>`;
        }).join('');
    }
}

function loadAchievementsTab() {
    if (!window.playerStats) return;
    const achievementsList = document.getElementById('achievementsList');
    const allAchievements = getAllAchievementsList();
    if (achievementsList) {
        achievementsList.innerHTML = allAchievements.map(achievement => {
            const isUnlocked = window.playerStats.achievements[achievement.id]?.unlocked || false;
            return `<div class="achievement ${isUnlocked ? 'unlocked' : ''}"><div class="achievement-icon">${achievement.icon}</div><div class="achievement-info"><h4>${achievement.name}</h4><p>${achievement.desc}</p></div></div>`;
        }).join('');
    }
}

// Funciones auxiliares
function getCardDisplayName(cardCode) {
    const rank = cardCode.replace(/[a-z]/g, '');
    const suit = cardCode.replace(/[0-9]/g, '');
    const suitNames = { espada: 'Espada', basto: 'Basto', oro: 'Oro', copa: 'Copa' };
    return `${rank} de ${suitNames[suit]}`;
}

function getComodinIcon(comodinId) {
    const icons = {
        'palo_unico': '🎯', 'dominio_ilusorio': '👑', 'replica_honor': '⚔️', 'triple_milagro': '✨',
        'flor_falsa': '🌸', 'espuelas_plata': '🦿', 'taba_aire': '🪙', 'yerba_mala': '🌿',
        'desempate_criollo': '🤝', 'mate_cocido': '🍵', 'corazon_truquero': '❤️', 'mufa_selectiva': '👁️',
        'gaucho_invisible': '👻', 'cambalache': '🔄', 'finta_criolla': '🎭',
        // Nuevos comodines
        'venganza_gaucha': '⚡', 'poder_criollo': '💪', 'estrategia_milonga': '🎵', 'destino_argentino': '🌟',
        'suerte_patria': '🍀', 'coraje_federal': '🦁', 'astucia_pampeana': '🦊', 'honor_rioplatense': '⚜️',
        'pasion_tanguera': '💃', 'fuerza_quebrada': '🏔️', 'espiritu_libertador': '🗽',
        'garra_charrúa': '🐺', 'misterio_andino': '🏔️', 'legado_criollo': '📜', 'alma_guaraní': '🌺',
        'corazón_patagónico': '🐧', 'fuerza_pampeana': '🌾', 'sangre_indígena': '🏹',
        'destino_sudamericano': '🌎', 'poder_continental': '🌍', 'legado_eterno': '♾️'
    };
    return icons[comodinId] || '🎴';
}

function getAllComodinesList() {
    return [
        // Comodines originales
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
}

function getAllAchievementsList() {
    return [
        { id: 'first_win', name: 'Primera Victoria', desc: 'Gana tu primera partida', icon: '🏆' },
        { id: 'win_streak_3', name: 'Racha Ganadora', desc: 'Gana 3 partidas seguidas', icon: '🔥' },
        { id: 'win_streak_5', name: 'Invencible', desc: 'Gana 5 partidas seguidas', icon: '⚡' },
        { id: 'games_10', name: 'Truquero Novato', desc: 'Juega 10 partidas', icon: '🎯' },
        { id: 'games_50', name: 'Truquero Experto', desc: 'Juega 50 partidas', icon: '🎴' },
        { id: 'games_100', name: 'Truquero Legendario', desc: 'Juega 100 partidas', icon: '👑' },
        { id: 'chicos_5', name: 'Chico Maestro', desc: 'Gana 5 chicos', icon: '🎖️' },
        { id: 'chicos_10', name: 'Chico Legendario', desc: 'Gana 10 chicos', icon: '🏅' },
        { id: 'envidos_10', name: 'Envido Pro', desc: 'Gana 10 envidos', icon: '🎲' },
        { id: 'trucos_20', name: 'Truco Master', desc: 'Gana 20 trucos', icon: '⚔️' },
        { id: 'flores_5', name: 'Florista', desc: 'Canta 5 flores', icon: '🌸' },
        { id: 'comodines_10', name: 'Comodín Lover', desc: 'Usa 10 comodines', icon: '🎭' },
        { id: 'comodines_all', name: 'Coleccionista', desc: 'Desbloquea todos los comodines', icon: '📚' },
        { id: 'win_rate_70', name: 'Estratega', desc: 'Mantén 70% de victorias (mín. 10 partidas)', icon: '🧠' },
        { id: 'fast_player', name: 'Rápido como el Viento', desc: 'Promedio de tiempo por turno menor a 5 segundos', icon: '💨' },
        { id: 'perfect_game', name: 'Juego Perfecto', desc: 'Gana una partida sin perder ninguna mano', icon: '✨' },
        { id: 'comeback_king', name: 'Rey del Comeback', desc: 'Gana una partida después de estar 20 puntos abajo', icon: '🔄' },
        { id: 'card_master', name: 'Maestro de Cartas', desc: 'Juega todas las cartas del mazo al menos una vez', icon: '🃏' },
        { id: 'envido_master', name: 'Maestro del Envido', desc: 'Gana un envido con valor 33 o más', icon: '🎲' },
        { id: 'truco_master', name: 'Maestro del Truco', desc: 'Gana un vale cuatro', icon: '⚔️' }
    ];
}

// Agregar estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);

// Cargar estadísticas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    waitForAuthAndStats().then(() => {
        // Solo ahora playerStats está seguro de existir
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                showTab(this.dataset.tab);
            });
        });

        // Ahora sí se puede llamar a showTab
        showTab('stats');
    });
});



// Funciones globales para manejo de estadísticas
window.exportStats = function() {
    if (StatsUtils.exportStats()) {
        alert('✅ Estadísticas exportadas correctamente');
    } else {
        alert('❌ Error exportando estadísticas');
    }
};

window.importStats = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            StatsUtils.importStats(file)
                .then(() => {
                    alert('✅ Estadísticas importadas correctamente');
                    location.reload();
                })
                .catch(error => {
                    alert('❌ Error importando estadísticas: ' + error.message);
                });
        }
    };
    input.click();
};

window.clearStats = function() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las estadísticas? Esta acción no se puede deshacer.')) {
        if (StatsUtils.clearStats()) {
            alert('✅ Estadísticas eliminadas correctamente');
            location.reload();
        } else {
            alert('❌ Error eliminando estadísticas');
        }
    }
}; 
