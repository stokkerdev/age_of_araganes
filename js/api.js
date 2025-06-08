// API Configuration and Service Layer
class TournamentAPI {
  constructor() {
    // Configure API base URL - update this with your deployed API URL
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-api-url.herokuapp.com/api'  // Replace with your actual API URL
      : 'http://localhost:3000/api';
    
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generic fetch wrapper with error handling
  async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Return fallback data for development/offline mode
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('API unavailable, using fallback data');
        return this.getFallbackData(url);
      }
      
      throw error;
    }
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fallback data for offline/development mode
  getFallbackData(url) {
    if (url.includes('/players')) {
      return {
        success: true,
        data: [
          {
            id: "stokker",
            name: "Stokker",
            avatar: "src/pics/stokker.jpg",
            matches: 2,
            wins: 1,
            losses: 1,
            points: 5,
            winRate: "50.0",
            totalAverage: "78.8",
            categoryStats: {
              military: { total: 167, average: 83.5, matches: 2, best: 85 },
              economy: { total: 150, average: 75.0, matches: 2, best: 78 },
              technology: { total: 162, average: 81.0, matches: 2, best: 82 },
              society: { total: 145, average: 72.5, matches: 2, best: 75 }
            },
            status: "active"
          },
          {
            id: "kylecher",
            name: "Kylecher",
            avatar: "",
            matches: 1,
            wins: 0,
            losses: 1,
            points: 4,
            winRate: "0.0",
            totalAverage: "79.5",
            categoryStats: {
              military: { total: 80, average: 80.0, matches: 1, best: 80 },
              economy: { total: 85, average: 85.0, matches: 1, best: 85 },
              technology: { total: 75, average: 75.0, matches: 1, best: 75 },
              society: { total: 78, average: 78.0, matches: 1, best: 78 }
            },
            status: "active"
          }
        ]
      };
    }
    
    if (url.includes('/tournament/stats')) {
      return {
        success: true,
        data: {
          overview: {
            totalPlayers: 6,
            totalMatches: 2,
            currentLeader: { name: "Stokker", points: 5 },
            tournamentPhase: "Fase 1"
          },
          bestPerformers: {
            military: { name: "Gato Alado", categoryStats: { military: { average: 92 } } },
            economy: { name: "NicoZ", categoryStats: { economy: { average: 88 } } }
          }
        }
      };
    }

    return { success: false, error: 'API unavailable' };
  }

  // Player endpoints
  async getPlayers(params = {}) {
    const cacheKey = `players_${JSON.stringify(params)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/players${queryString ? '?' + queryString : ''}`;
    
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  async getPlayer(playerId) {
    const cacheKey = `player_${playerId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.baseURL}/players/${playerId}`;
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  async createPlayer(playerData) {
    const url = `${this.baseURL}/players`;
    const result = await this.fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify(playerData)
    });
    
    // Clear players cache
    this.clearPlayersCache();
    return result;
  }

  async updatePlayer(playerId, playerData) {
    const url = `${this.baseURL}/players/${playerId}`;
    const result = await this.fetchWithErrorHandling(url, {
      method: 'PUT',
      body: JSON.stringify(playerData)
    });
    
    // Clear related caches
    this.clearPlayersCache();
    this.cache.delete(`player_${playerId}`);
    return result;
  }

  async getPlayerStats(playerId) {
    const cacheKey = `player_stats_${playerId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.baseURL}/players/${playerId}/stats`;
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  // Match endpoints
  async getMatches(params = {}) {
    const cacheKey = `matches_${JSON.stringify(params)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/matches${queryString ? '?' + queryString : ''}`;
    
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  async createMatch(matchData) {
    const url = `${this.baseURL}/matches`;
    const result = await this.fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify(matchData)
    });
    
    // Clear all caches since match affects multiple endpoints
    this.clearAllCaches();
    return result;
  }

  async getMatchStats() {
    const cacheKey = 'match_stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.baseURL}/matches/stats/summary`;
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  // Tournament endpoints
  async getTournamentStats() {
    const cacheKey = 'tournament_stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.baseURL}/tournament/stats`;
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  async getLeaderboard(limit = 10) {
    const cacheKey = `leaderboard_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.baseURL}/tournament/leaderboard?limit=${limit}`;
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  async getRecentMatches(limit = 5) {
    const cacheKey = `recent_matches_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.baseURL}/tournament/recent-matches?limit=${limit}`;
    const result = await this.fetchWithErrorHandling(url);
    this.setCachedData(cacheKey, result);
    return result;
  }

  async simulateMatch(playerIds, mapName = 'Random Map') {
    const url = `${this.baseURL}/tournament/simulate-match`;
    const result = await this.fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify({ playerIds, mapName })
    });
    
    // Clear all caches since simulation affects multiple endpoints
    this.clearAllCaches();
    return result;
  }

  // Health check
  async checkHealth() {
    try {
      const url = `${this.baseURL}/health`;
      const result = await this.fetchWithErrorHandling(url);
      return result.status === 'OK';
    } catch (error) {
      return false;
    }
  }

  // Cache management methods
  clearPlayersCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('players_') || key.startsWith('player_')) {
        this.cache.delete(key);
      }
    }
  }

  clearAllCaches() {
    this.cache.clear();
  }

  // Utility methods
  async waitForAPI(maxAttempts = 5, delay = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      const isHealthy = await this.checkHealth();
      if (isHealthy) {
        console.log('✅ API is available');
        return true;
      }
      
      console.log(`⏳ Waiting for API... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.warn('⚠️ API unavailable, using fallback mode');
    return false;
  }

  // Batch operations
  async batchUpdatePlayers(updates) {
    const results = [];
    for (const { playerId, data } of updates) {
      try {
        const result = await this.updatePlayer(playerId, data);
        results.push({ playerId, success: true, data: result });
      } catch (error) {
        results.push({ playerId, success: false, error: error.message });
      }
    }
    return results;
  }
}

// Create global API instance
window.tournamentAPI = new TournamentAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TournamentAPI;
}