let playersData = { players: [] };

// Initialize profiles with API data
window.initializeProfiles = function() {
  window.playerProfileManager = new PlayerProfileManager();
  updateMainStatsWithPlayerData();
};

// Enhanced Player profile functionality with API integration
class PlayerProfileManager {
  constructor() {
    this.players = playersData.players || [];
    this.modal = document.getElementById('player-modal');
    this.modalClose = document.getElementById('modal-close');
    this.playersGrid = document.getElementById('players-grid');
    this.searchPlayers = document.getElementById('search-players');
    this.filterPlayers = document.getElementById('filter-players');
    
    this.init();
  }

  init() {
    this.renderPlayersGrid();
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.modal || !this.modalClose) return;
    
    // Modal close events
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Search and filter
    if (this.searchPlayers) {
      this.searchPlayers.addEventListener('input', debounce(() => this.filterAndRenderPlayers(), 300));
    }
    
    if (this.filterPlayers) {
      this.filterPlayers.addEventListener('change', () => this.filterAndRenderPlayers());
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  // Update players data from API
  updatePlayersData(newPlayers) {
    this.players = newPlayers;
    playersData.players = newPlayers;
    this.renderPlayersGrid();
  }

  renderPlayersGrid() {
    if (!this.playersGrid) return;
    
    this.playersGrid.innerHTML = '';
    
    if (this.players.length === 0) {
      this.playersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
          <h3>No hay jugadores disponibles</h3>
          <p>Los datos se están cargando...</p>
        </div>
      `;
      return;
    }
    
    this.players.forEach(player => {
      const playerCard = this.createPlayerCard(player);
      this.playersGrid.appendChild(playerCard);
    });
  }

  createPlayerCard(player) {
    const totalAverage = this.calculateTotalAverage(player);
    const winRate = player.winRate || (player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0');
    
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <div class="player-card-header">
        <img src="${player.avatar || 'https://via.placeholder.com/60x60?text=' + player.name.charAt(0)}" 
             alt="${player.name}" 
             class="player-avatar"
             onerror="this.src='https://via.placeholder.com/60x60?text=${player.name.charAt(0)}'">
        <div class="player-basic-info">
          <h3 class="player-name">${player.name}</h3>
          <p class="player-status">${this.getStatusText(player.status)}</p>
        </div>
        <div class="player-rank">
          <span class="rank-number">#${this.getPlayerRank(player)}</span>
        </div>
      </div>
      
      <div class="player-card-stats">
        <div class="stat-row">
          <span class="stat-label">Partidas:</span>
          <span class="stat-value">${player.matches}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Victorias:</span>
          <span class="stat-value">${player.wins}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Ratio V/D:</span>
          <span class="stat-value ${this.getRatioClass(parseFloat(winRate))}">${winRate}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Promedio:</span>
          <span class="stat-value">${totalAverage}</span>
        </div>
      </div>

      <div class="player-card-categories">
        <div class="category-mini" title="Militar">
          <span class="category-icon">⚔️</span>
          <span class="category-value">${this.getCategoryAverage(player, 'military')}</span>
        </div>
        <div class="category-mini" title="Economía">
          <span class="category-icon">💰</span>
          <span class="category-value">${this.getCategoryAverage(player, 'economy')}</span>
        </div>
        <div class="category-mini" title="Tecnología">
          <span class="category-icon">🔬</span>
          <span class="category-value">${this.getCategoryAverage(player, 'technology')}</span>
        </div>
        <div class="category-mini" title="Sociedad">
          <span class="category-icon">👥</span>
          <span class="category-value">${this.getCategoryAverage(player, 'society')}</span>
        </div>
      </div>

      <button class="view-profile-btn" onclick="playerProfileManager.openPlayerProfile('${player.id}')">
        Ver Perfil Completo
      </button>
    `;
    
    return card;
  }

  async openPlayerProfile(playerId) {
    try {
      // Show loading state in modal
      this.showModalLoading();
      
      // Try to get fresh player data from API
      let player = null;
      
      try {
        const playerResponse = await window.tournamentAPI.getPlayer(playerId);
        if (playerResponse.success) {
          player = playerResponse.data;
        }
      } catch (error) {
        console.warn('Could not fetch player from API, using local data:', error);
      }
      
      // Fallback to local data
      if (!player) {
        player = this.players.find(p => p.id === playerId);
      }
      
      if (!player) {
        this.showModalError('Jugador no encontrado');
        return;
      }

      const modalBody = document.getElementById('modal-body');
      const modalPlayerName = document.getElementById('modal-player-name');
      
      if (modalPlayerName) modalPlayerName.textContent = `Perfil de ${player.name}`;
      if (modalBody) modalBody.innerHTML = this.createPlayerProfileContent(player);
      
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
    } catch (error) {
      console.error('Error opening player profile:', error);
      this.showModalError('Error al cargar el perfil del jugador');
    }
  }

  showModalLoading() {
    const modalBody = document.getElementById('modal-body');
    const modalPlayerName = document.getElementById('modal-player-name');
    
    if (modalPlayerName) modalPlayerName.textContent = 'Cargando perfil...';
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          "></div>
          <p style="color: var(--text-secondary);">Cargando datos del jugador...</p>
        </div>
      `;
    }
    
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  showModalError(message) {
    const modalBody = document.getElementById('modal-body');
    const modalPlayerName = document.getElementById('modal-player-name');
    
    if (modalPlayerName) modalPlayerName.textContent = 'Error';
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">${message}</p>
          <button onclick="playerProfileManager.closeModal()" style="
            margin-top: 1rem;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
          ">Cerrar</button>
        </div>
      `;
    }
  }

  createPlayerProfileContent(player) {
    const totalAverage = this.calculateTotalAverage(player);
    const winRate = player.winRate || (player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0');
    
    return `
      <div class="profile-header">
        <img src="${player.avatar || 'https://via.placeholder.com/100x100?text=' + player.name.charAt(0)}" 
             alt="${player.name}" 
             class="profile-avatar"
             onerror="this.src='https://via.placeholder.com/100x100?text=${player.name.charAt(0)}'">
        <div class="profile-info">
          <h3>${player.name}</h3>
          <p class="profile-rank">Posición #${this.getPlayerRank(player)} en el torneo</p>
          <p class="profile-join-date">Miembro desde: ${this.formatDate(player.joinDate)}</p>
        </div>
        <div class="profile-summary">
          <div class="summary-stat">
            <span class="summary-number">${player.points}</span>
            <span class="summary-label">Puntos</span>
          </div>
          <div class="summary-stat">
            <span class="summary-number">${winRate}%</span>
            <span class="summary-label">Ratio V/D</span>
          </div>
          <div class="summary-stat">
            <span class="summary-number">${totalAverage}</span>
            <span class="summary-label">Promedio</span>
          </div>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-section">
          <h4>Información del Jugador</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Estrategia Favorita:</span>
              <span class="detail-value">${player.favoriteStrategy || 'No especificada'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Civilización Favorita:</span>
              <span class="detail-value">${player.favoriteCivilization || 'No especificada'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Estado:</span>
              <span class="detail-value status-${player.status}">${this.getStatusText(player.status)}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Estadísticas por Categoría</h4>
          <div class="categories-detailed">
            ${this.createCategoryStats(player.categoryStats || {})}
          </div>
        </div>

        <div class="detail-section">
          <h4>Historial de Partidas</h4>
          <div class="match-history">
            ${this.createMatchHistory(player.matchHistory || [])}
          </div>
        </div>

        <div class="detail-section">
          <h4>Gráfico de Rendimiento</h4>
          <div class="performance-chart">
            ${this.createPerformanceChart(player)}
          </div>
        </div>
      </div>
    `;
  }

  createCategoryStats(categoryStats) {
    const categories = [
      { key: 'military', name: 'Militar', icon: '⚔️', color: '#ef4444' },
      { key: 'economy', name: 'Economía', icon: '🏛️', color: '#f59e0b' },
      { key: 'technology', name: 'Tecnología', icon: '🔬', color: '#3b82f6' },
      { key: 'society', name: 'Sociedad', icon: '👥', color: '#10b981' }
    ];

    return categories.map(category => {
      const stats = categoryStats[category.key] || { total: 0, average: 0, matches: 0, best: 0 };
      const percentage = Math.min((stats.average / 100) * 100, 100);
      
      return `
        <div class="category-stat">
          <div class="category-header">
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
            <span class="category-average">${stats.average.toFixed(1)}</span>
          </div>
          <div class="category-bar">
            <div class="category-fill" style="width: ${percentage}%; background-color: ${category.color}"></div>
          </div>
          <div class="category-details">
            <span>Total: ${stats.total}</span>
            <span>Mejor: ${stats.best}</span>
            <span>Partidas: ${stats.matches}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  createMatchHistory(matchHistory) {
    if (!matchHistory || matchHistory.length === 0) {
      return '<p class="no-matches">No hay partidas registradas</p>';
    }

    return matchHistory.slice(-10).reverse().map(match => {
      const resultClass = match.result === 'win' ? 'match-win' : 'match-loss';
      const resultText = match.result === 'win' ? 'Victoria' : 'Derrota';
      const totalScore = match.totalScore || 0;
      
      return `
        <div class="match-item ${resultClass}">
          <div class="match-main">
            <div class="match-opponent">
              <span class="match-vs">vs ${match.opponent}</span>
              <span class="match-result">${resultText}</span>
            </div>
            <div class="match-meta">
              <span class="match-date">${this.formatDate(match.date)}</span>
              <span class="match-duration">${match.duration}</span>
            </div>
          </div>
          ${match.scores ? `
          <div class="match-scores">
            <div class="score-item">
              <span class="score-icon">⚔️</span>
              <span class="score-value">${match.scores.military || 0}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">🏛️</span>
              <span class="score-value">${match.scores.economy || 0}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">🔬</span>
              <span class="score-value">${match.scores.technology || 0}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">👥</span>
              <span class="score-value">${match.scores.society || 0}</span>
            </div>
            <div class="score-total">
              <span class="score-label">Total:</span>
              <span class="score-value">${totalScore}</span>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  createPerformanceChart(player) {
    const categories = ['military', 'economy', 'technology', 'society'];
    
    return `
      <div class="radar-chart">
        <svg viewBox="0 0 200 200" class="radar-svg">
          <!-- Grid lines -->
          <g class="radar-grid">
            ${[20, 40, 60, 80, 100].map(value => {
              const radius = (value / 100) * 80;
              return `<circle cx="100" cy="100" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
            }).join('')}
            
            <!-- Axis lines -->
            ${categories.map((_, index) => {
              const angle = (index * 90 - 90) * Math.PI / 180;
              const x = 100 + 80 * Math.cos(angle);
              const y = 100 + 80 * Math.sin(angle);
              return `<line x1="100" y1="100" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
            }).join('')}
          </g>
          
          <!-- Data polygon -->
          <polygon
            points="${categories.map((category, index) => {
              const value = this.getCategoryAverageValue(player, category);
              const angle = (index * 90 - 90) * Math.PI / 180;
              const radius = (value / 100) * 80;
              const x = 100 + radius * Math.cos(angle);
              const y = 100 + radius * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}"
            fill="rgba(37, 99, 235, 0.2)"
            stroke="#2563eb"
            stroke-width="2"
          />
          
          <!-- Data points -->
          ${categories.map((category, index) => {
            const value = this.getCategoryAverageValue(player, category);
            const angle = (index * 90 - 90) * Math.PI / 180;
            const radius = (value / 100) * 80;
            const x = 100 + radius * Math.cos(angle);
            const y = 100 + radius * Math.sin(angle);
            return `<circle cx="${x}" cy="${y}" r="3" fill="#2563eb"/>`;
          }).join('')}
          
          <!-- Labels -->
          ${categories.map((category, index) => {
            const angle = (index * 90 - 90) * Math.PI / 180;
            const x = 100 + 95 * Math.cos(angle);
            const y = 100 + 95 * Math.sin(angle);
            const labels = { military: 'Mil', economy: 'Eco', technology: 'Tec', society: 'Soc' };
            return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="radar-label">${labels[category]}</text>`;
          }).join('')}
        </svg>
        
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color: #2563eb;"></span>
            <span class="legend-text">Promedio del jugador</span>
          </div>
        </div>
      </div>
    `;
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  filterAndRenderPlayers() {
    if (!this.searchPlayers || !this.filterPlayers) return;
    
    const searchTerm = this.searchPlayers.value.toLowerCase();
    const filterValue = this.filterPlayers.value;
    
    let filteredPlayers = this.players;
    
    // Apply search filter
    if (searchTerm) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.name.toLowerCase().includes(searchTerm) ||
        (player.favoriteStrategy && player.favoriteStrategy.toLowerCase().includes(searchTerm)) ||
        (player.favoriteCivilization && player.favoriteCivilization.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply category filter
    if (filterValue !== 'all') {
      switch (filterValue) {
        case 'active':
          filteredPlayers = filteredPlayers.filter(player => player.status === 'active');
          break;
        case 'top':
          filteredPlayers = filteredPlayers.filter(player => {
            const totalAverage = parseFloat(this.calculateTotalAverage(player));
            return totalAverage >= 70;
          });
          break;
      }
    }
    
    // Re-render grid with filtered players
    this.playersGrid.innerHTML = '';
    filteredPlayers.forEach(player => {
      const playerCard = this.createPlayerCard(player);
      this.playersGrid.appendChild(playerCard);
    });
  }

  // Utility methods
  calculateTotalAverage(player) {
    if (!player.categoryStats) return '0.0';
    
    const stats = player.categoryStats;
    const total = (stats.military?.average || 0) + (stats.economy?.average || 0) + 
                  (stats.technology?.average || 0) + (stats.society?.average || 0);
    return (total / 4).toFixed(1);
  }

  getCategoryAverage(player, category) {
    if (!player.categoryStats || !player.categoryStats[category]) return '0.0';
    return player.categoryStats[category].average.toFixed(1);
  }

  getCategoryAverageValue(player, category) {
    if (!player.categoryStats || !player.categoryStats[category]) return 0;
    return player.categoryStats[category].average;
  }

  getPlayerRank(player) {
    const sortedPlayers = [...this.players].sort((a, b) => b.points - a.points);
    return sortedPlayers.findIndex(p => p.id === player.id) + 1;
  }

  getRatioClass(ratio) {
    if (ratio >= 70) return 'ratio-good';
    if (ratio >= 40) return 'ratio-average';
    return 'ratio-poor';
  }

  getStatusText(status) {
    const statusMap = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString) {
    if (!dateString) return 'No especificada';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Public methods for external access
  getPlayerData(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  async updatePlayerStats(playerId, newStats) {
    try {
      const result = await window.tournamentAPI.updatePlayer(playerId, newStats);
      if (result.success) {
        // Update local data
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          this.players[playerIndex] = { ...this.players[playerIndex], ...newStats };
          this.renderPlayersGrid();
        }
        return result;
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw error;
    }
  }

  getBestPlayerInCategory(category) {
    return this.players.reduce((best, player) => {
      const playerAvg = this.getCategoryAverageValue(player, category);
      const bestAvg = this.getCategoryAverageValue(best, category);
      return playerAvg > bestAvg ? player : best;
    }, this.players[0] || {});
  }
}

// Initialize player profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // This will be called after API data is loaded
});

function updateMainStatsWithPlayerData() {
  if (!window.playerProfileManager || !window.playerProfileManager.players.length) {
    return;
  }
  
  try {
    const bestEconomy = window.playerProfileManager.getBestPlayerInCategory('economy');
    const bestMilitary = window.playerProfileManager.getBestPlayerInCategory('military');
    
    const bestEconomyEl = document.getElementById('best-economy');
    const bestMilitaryEl = document.getElementById('best-military');
    
    if (bestEconomyEl && bestEconomy) {
      const economyAvg = window.playerProfileManager.getCategoryAverageValue(bestEconomy, 'economy');
      bestEconomyEl.textContent = economyAvg.toFixed(1);
    }
    
    if (bestMilitaryEl && bestMilitary) {
      const militaryAvg = window.playerProfileManager.getCategoryAverageValue(bestMilitary, 'military');
      bestMilitaryEl.textContent = militaryAvg.toFixed(1);
    }
  } catch (error) {
    console.warn('Could not update main stats:', error);
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}