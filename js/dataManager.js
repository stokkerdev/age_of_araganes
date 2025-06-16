class DataManager {
  constructor() {
    this.playersData = { players: [] };
    this.matchesHistory = [];
    this.isLoaded = false;
  }

  async loadAllData() {
    try {
      // Cargar datos de jugadores
      const playersResponse = await fetch('data/data.json');
      if (!playersResponse.ok) throw new Error('Error cargando jugadores');
      this.playersData = await playersResponse.json();

      // Cargar historial de partidas
      try {
        const matchesResponse = await fetch('data/matches-history.json');
        if (matchesResponse.ok) {
          this.matchesHistory = await matchesResponse.json();
        }
      } catch (error) {
        console.log('No hay historial de partidas previo, iniciando con array vacío');
        this.matchesHistory = [];
      }

      this.isLoaded = true;
      console.log('Datos cargados:', {
        jugadores: this.playersData.players.length,
        partidas: this.matchesHistory.length
      });

      return {
        players: this.playersData.players,
        matches: this.matchesHistory
      };
    } catch (error) {
      console.error('Error cargando datos:', error);
      throw error;
    }
  }

  async saveMatch(matchData) {
    try {
      // Agregar la partida al historial
      const matchWithId = {
        id: this.generateMatchId(),
        ...matchData,
        createdAt: new Date().toISOString()
      };

      this.matchesHistory.unshift(matchWithId);

      // Actualizar datos de jugadores
      this.updatePlayersFromMatch(matchData);

      // Simular guardado en servidor (en una implementación real sería una petición POST)
      await this.simulateSaveToServer(matchWithId);

      console.log('Partida guardada exitosamente:', matchWithId.id);
      return matchWithId;

    } catch (error) {
      console.error('Error guardando partida:', error);
      throw error;
    }
  }

  updatePlayersFromMatch(matchData) {
    const totalPlayers = matchData.players.length;
    
    matchData.players.forEach(playerData => {
      const player = this.playersData.players.find(p => p.id === playerData.id);
      if (!player) return;

      // Incrementar partidas jugadas
      player.matches++;

      // Actualizar estadísticas por categoría
      Object.keys(playerData.scores).forEach(category => {
        const score = playerData.scores[category];
        const categoryStats = player.categoryStats[category];
        
        // Actualizar peor, mejor y promedio
        if (categoryStats.worst === 0 || score < categoryStats.worst) {
          categoryStats.worst = score;
        }
        if (score > categoryStats.best) {
          categoryStats.best = score;
        }
        
        // Calcular nuevo promedio
        const currentTotal = categoryStats.average * (player.matches - 1);
        categoryStats.average = (currentTotal + score) / player.matches;
      });

      // Actualizar puntos según posición
      const playerRanking = matchData.finalRanking.find(r => r.playerId === playerData.id);
      if (playerRanking) {
        const points = totalPlayers - playerRanking.position;
        player.points += points;
        
        // Si ganó (posición 1), incrementar victorias
        if (playerRanking.position === 1) {
          player.wins++;
        }
      }

      // Agregar partida al historial del jugador
      if (!player.matchHistory) {
        player.matchHistory = [];
      }

      const matchHistoryEntry = {
        date: matchData.date,
        map: matchData.map,
        duration: `${matchData.duration} min`,
        position: matchData.finalRanking.find(r => r.playerId === playerData.id).position,
        totalPlayers: totalPlayers,
        scores: playerData.scores,
        totalScore: playerData.totalScore,
        opponents: matchData.players
          .filter(p => p.id !== playerData.id)
          .map(p => this.getPlayerName(p.id))
      };

      player.matchHistory.unshift(matchHistoryEntry);
    });
  }

  async simulateSaveToServer(matchData) {
    // Simular guardado en servidor
    // En una implementación real, esto sería una petición POST a tu API
    
    // Guardar en localStorage como backup
    const backupData = {
      players: this.playersData.players,
      matches: this.matchesHistory,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('tournamentBackup', JSON.stringify(backupData));
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // En una implementación real, aquí actualizarías los archivos JSON en el servidor
    console.log('Datos guardados en backup local');
  }

  generateMatchId() {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getPlayerName(playerId) {
    const player = this.playersData.players.find(p => p.id === playerId);
    return player ? player.name : 'Desconocido';
  }

  getPlayers() {
    return this.playersData.players;
  }

  getMatches() {
    return this.matchesHistory;
  }

  getMatchById(matchId) {
    return this.matchesHistory.find(m => m.id === matchId);
  }

  getPlayerStats(playerId) {
    return this.playersData.players.find(p => p.id === playerId);
  }

  getLeaderboard() {
    return [...this.playersData.players].sort((a, b) => b.points - a.points);
  }

  getTournamentStats() {
    const players = this.playersData.players;
    
    return {
      totalPlayers: players.length,
      totalMatches: Math.max(...players.map(p => p.matches)),

      totalGames: players.reduce((sum, p) => sum + p.matches, 0) / 2,
      leader: this.getLeaderboard()[0],
      bestRatio: this.getBestRatioPlayer(),
      longestMatch: this.getLongestMatch(),
      shortestMatch: this.getShortestMatch(),
      bestInCategories: {
        military: this.getBestInCategory('military'),
        economy: this.getBestInCategory('economy'),
        technology: this.getBestInCategory('technology'),
        society: this.getBestInCategory('society')
      }
    };
  }

  getBestRatioPlayer() {
    return this.playersData.players
      .filter(p => p.matches > 0)
      .reduce((best, player) => {
        const ratio = (player.wins / player.matches) * 100;
        const bestRatio = (best.wins / best.matches) * 100;
        return ratio > bestRatio ? player : best;
      });
  }

  getLongestMatch() {
    if (this.matchesHistory.length === 0) return null;
    return this.matchesHistory.reduce((longest, match) => 
      match.duration > longest.duration ? match : longest
    );
  }

  getShortestMatch() {
    if (this.matchesHistory.length === 0) return null;
    return this.matchesHistory.reduce((shortest, match) => 
      match.duration < shortest.duration ? match : shortest
    );
  }

  getBestInCategory(category) {
    return this.playersData.players.reduce((best, player) => {
      const playerAvg = player.categoryStats[category].average;
      const bestAvg = best.categoryStats[category].average;
      return playerAvg > bestAvg ? player : best;
    });
  }

  // Método para exportar datos (útil para backup manual)
  exportData() {
    return {
      players: this.playersData.players,
      matches: this.matchesHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Método para importar datos (útil para restaurar backup)
  importData(data) {
    if (data.players) {
      this.playersData.players = data.players;
    }
    if (data.matches) {
      this.matchesHistory = data.matches;
    }
    console.log('Datos importados exitosamente');
  }
}

// Instancia global del gestor de datos
window.dataManager = new DataManager();