class APIClient {
  constructor() {
    this.baseURL = 'http://127.0.0.1:3000/api';
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Métodos para jugadores
  async getPlayers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/players${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getPlayer(playerId) {
    return this.request(`/players/${playerId}`);
  }

  async createPlayer(playerData) {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify(playerData)
    });
  }

  async updatePlayer(playerId, playerData) {
    return this.request(`/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(playerData)
    });
  }

  async deletePlayer(playerId) {
    return this.request(`/players/${playerId}`, {
      method: 'DELETE'
    });
  }

  async getPlayerStats(playerId) {
    return this.request(`/players/${playerId}/stats`);
  }

  async getLeaderboard(limit = 10) {
    return this.request(`/players/leaderboard/ranking?limit=${limit}`);
  }

  // Métodos para partidas
  async getMatches(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/matches${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getMatch(matchId) {
    return this.request(`/matches/${matchId}`);
  }

  async createMatch(matchData) {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(matchData)
    });
  }

  async updateMatch(matchId, matchData) {
    return this.request(`/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify(matchData)
    });
  }

  async deleteMatch(matchId) {
    return this.request(`/matches/${matchId}`, {
      method: 'DELETE'
    });
  }

  async getPlayerMatches(playerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/matches/player/${playerId}${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  // Métodos para estadísticas
  async getTournamentStats() {
    return this.request('/stats/tournament');
  }

  async getLeaderboardStats(limit = 50) {
    return this.request(`/stats/leaderboard?limit=${limit}`);
  }

  async getMapStats() {
    return this.request('/stats/maps');
  }

  async getRecentActivity(limit = 10) {
    return this.request(`/stats/recent-activity?limit=${limit}`);
  }

  // Método para verificar salud del servidor
  async checkHealth() {
    return this.request('/health');
  }
}

// Instancia global del cliente API
window.apiClient = new APIClient();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIClient;
}