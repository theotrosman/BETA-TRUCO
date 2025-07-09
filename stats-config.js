// Configuración del sistema de estadísticas
const STATS_CONFIG = {
    // Clave para localStorage
    STORAGE_KEY: 'trucoPlayerStats',
    
    // Configuración de persistencia
    AUTO_SAVE_INTERVAL: 30000, // 30 segundos
    
    // Configuración de respaldo
    BACKUP_ENABLED: true,
    BACKUP_KEY: 'trucoPlayerStatsBackup',
    
    // Configuración de sincronización (para futuras implementaciones)
    SYNC_ENABLED: false,
    SYNC_INTERVAL: 60000, // 1 minuto
    
    // Configuración de estadísticas de la CPU
    CPU_STATS_ENABLED: true,
    CPU_STATS_KEY: 'trucoCPUStats',
    
    // Configuración de logros
    ACHIEVEMENTS: {
        'first_win': { name: 'Primera Victoria', desc: 'Gana tu primera partida', condition: (stats) => stats.gamesWon >= 1 },
        'win_streak_3': { name: 'Racha Ganadora', desc: 'Gana 3 partidas seguidas', condition: (stats) => stats.getCurrentWinStreak() >= 3 },
        'win_streak_5': { name: 'Invencible', desc: 'Gana 5 partidas seguidas', condition: (stats) => stats.getCurrentWinStreak() >= 5 },
        'games_10': { name: 'Truquero Novato', desc: 'Juega 10 partidas', condition: (stats) => stats.gamesPlayed >= 10 },
        'games_50': { name: 'Truquero Experto', desc: 'Juega 50 partidas', condition: (stats) => stats.gamesPlayed >= 50 },
        'games_100': { name: 'Truquero Legendario', desc: 'Juega 100 partidas', condition: (stats) => stats.gamesPlayed >= 100 },
        'chicos_5': { name: 'Chico Maestro', desc: 'Gana 5 chicos', condition: (stats) => stats.chicosWon >= 5 },
        'chicos_10': { name: 'Chico Legendario', desc: 'Gana 10 chicos', condition: (stats) => stats.chicosWon >= 10 },
        'envidos_10': { name: 'Envido Pro', desc: 'Gana 10 envidos', condition: (stats) => stats.envidosWon >= 10 },
        'trucos_20': { name: 'Truco Master', desc: 'Gana 20 trucos', condition: (stats) => stats.trucosWon >= 20 },
        'flores_5': { name: 'Florista', desc: 'Canta 5 flores', condition: (stats) => stats.floresCantadas >= 5 },
        'comodines_10': { name: 'Comodín Lover', desc: 'Usa 10 comodines', condition: (stats) => stats.comodinesUsados >= 10 },
        'win_rate_70': { name: 'Estratega', desc: 'Mantén 70% de victorias (mín. 10 partidas)', condition: (stats) => stats.gamesPlayed >= 10 && (stats.gamesWon / stats.gamesPlayed) >= 0.7 },
        'fast_player': { name: 'Rápido como el Viento', desc: 'Promedio de tiempo por turno menor a 5 segundos', condition: (stats) => stats.avgTimePerTurn <= 5 && stats.turnsPlayed >= 20 },
        'perfect_game': { name: 'Juego Perfecto', desc: 'Gana una partida sin perder ninguna mano', condition: (stats) => stats.hasPerfectGame() },
        'comeback_king': { name: 'Rey del Comeback', desc: 'Gana una partida después de estar 20 puntos abajo', condition: (stats) => stats.hasComebackWin() },
        'card_master': { name: 'Maestro de Cartas', desc: 'Juega todas las cartas del mazo al menos una vez', condition: (stats) => stats.hasPlayedAllCards() },
        'envido_master': { name: 'Maestro del Envido', desc: 'Gana un envido con valor 33 o más', condition: (stats) => stats.hasHighEnvido() },
        'truco_master': { name: 'Maestro del Truco', desc: 'Gana un vale cuatro', condition: (stats) => stats.hasWonValeCuatro() }
    },
    
    // Configuración de niveles
    LEVELS: {
        'novato': { min: 0, max: 9, name: 'Novato' },
        'principiante': { min: 10, max: 24, name: 'Principiante' },
        'intermedio': { min: 25, max: 49, name: 'Intermedio' },
        'avanzado': { min: 50, max: 99, name: 'Avanzado' },
        'experto': { min: 100, max: 199, name: 'Experto' },
        'maestro': { min: 200, max: 499, name: 'Maestro' },
        'legendario': { min: 500, max: 999, name: 'Legendario' },
        'mitico': { min: 1000, max: Infinity, name: 'Mítico' }
    },
    
    // Configuración de estadísticas de la CPU
    CPU_STATS: {
        // Dificultad dinámica basada en el rendimiento del jugador
        DIFFICULTY_ADJUSTMENT: true,
        MIN_DIFFICULTY: 0.3,
        MAX_DIFFICULTY: 0.9,
        
        // Estadísticas que se guardan de la CPU
        TRACK_WINS: true,
        TRACK_LOSSES: true,
        TRACK_AVG_TIME: true,
        TRACK_STRATEGY_CHOICES: true
    }
};

// Utilidades para el manejo de estadísticas
const StatsUtils = {
    // Guardar estadísticas con respaldo
    saveStats: function(stats) {
        try {
            const statsString = JSON.stringify(stats);
            localStorage.setItem(STATS_CONFIG.STORAGE_KEY, statsString);
            
            // Crear respaldo
            if (STATS_CONFIG.BACKUP_ENABLED) {
                localStorage.setItem(STATS_CONFIG.BACKUP_KEY, statsString);
            }
            
            console.log('✅ Estadísticas guardadas correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error guardando estadísticas:', error);
            return false;
        }
    },
    
    // Cargar estadísticas con recuperación de respaldo
    loadStats: function() {
        try {
            let statsString = localStorage.getItem(STATS_CONFIG.STORAGE_KEY);
            
            // Si no hay datos principales, intentar con el respaldo
            if (!statsString && STATS_CONFIG.BACKUP_ENABLED) {
                statsString = localStorage.getItem(STATS_CONFIG.BACKUP_KEY);
                if (statsString) {
                    console.log('🔄 Recuperando estadísticas desde respaldo');
                }
            }
            
            if (statsString) {
                const stats = JSON.parse(statsString);
                console.log('✅ Estadísticas cargadas correctamente');
                return stats;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
            return null;
        }
    },
    
    // Limpiar estadísticas
    clearStats: function() {
        try {
            localStorage.removeItem(STATS_CONFIG.STORAGE_KEY);
            if (STATS_CONFIG.BACKUP_ENABLED) {
                localStorage.removeItem(STATS_CONFIG.BACKUP_KEY);
            }
            console.log('🗑️ Estadísticas eliminadas');
            return true;
        } catch (error) {
            console.error('❌ Error eliminando estadísticas:', error);
            return false;
        }
    },
    
    // Exportar estadísticas
    exportStats: function() {
        try {
            const stats = this.loadStats();
            if (stats) {
                const dataStr = JSON.stringify(stats, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `truco-stats-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                console.log('📤 Estadísticas exportadas');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error exportando estadísticas:', error);
            return false;
        }
    },
    
    // Importar estadísticas
    importStats: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const stats = JSON.parse(e.target.result);
                    if (StatsUtils.saveStats(stats)) {
                        console.log('📥 Estadísticas importadas correctamente');
                        resolve(true);
                    } else {
                        reject(new Error('Error guardando estadísticas importadas'));
                    }
                } catch (error) {
                    reject(new Error('Error parseando archivo de estadísticas'));
                }
            };
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    },
    
    // Verificar integridad de estadísticas
    validateStats: function(stats) {
        const requiredFields = [
            'gamesPlayed', 'gamesWon', 'chicosWon', 'envidosWon', 
            'trucosWon', 'floresCantadas', 'comodinesUsados'
        ];
        
        for (const field of requiredFields) {
            if (typeof stats[field] !== 'number' || stats[field] < 0) {
                console.warn(`⚠️ Campo inválido en estadísticas: ${field}`);
                return false;
            }
        }
        
        return true;
    },
    
    // Calcular nivel del jugador
    calculateLevel: function(stats) {
        const totalGames = stats.gamesPlayed || 0;
        
        for (const [level, config] of Object.entries(STATS_CONFIG.LEVELS)) {
            if (totalGames >= config.min && totalGames <= config.max) {
                return {
                    level: level,
                    name: config.name,
                    current: totalGames,
                    next: config.max === Infinity ? null : config.max + 1,
                    progress: config.max === Infinity ? 100 : ((totalGames - config.min) / (config.max - config.min)) * 100
                };
            }
        }
        
        return {
            level: 'mitico',
            name: 'Mítico',
            current: totalGames,
            next: null,
            progress: 100
        };
    }
};

// Exportar configuración y utilidades
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STATS_CONFIG, StatsUtils };
} else {
    window.STATS_CONFIG = STATS_CONFIG;
    window.StatsUtils = StatsUtils;
} 