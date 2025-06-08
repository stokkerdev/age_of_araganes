let playersData = { players: [] };

fetch('/src/data/data.json')
  .then(response => response.json())
  .then(data => {
    tournamentData.players = data.players;
    playersData.players = data.players;

    // Iniciar la lógica después de que se hayan cargado los datos
    if (window.initializeApp) initializeApp();
    if (window.initializeProfiles) initializeProfiles();
  });


window.initializeProfiles = function() {
  window.playerProfileManager = new PlayerProfileManager();
  updateMainStatsWithPlayerData();
};


// Player profile functionality
class PlayerProfileManager {
  constructor() {
    this.players = playersData.players;
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
    // Modal close events
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Search and filter
    this.searchPlayers.addEventListener('input', () => this.filterAndRenderPlayers());
    this.filterPlayers.addEventListener('change', () => this.filterAndRenderPlayers());

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  renderPlayersGrid() {
    this.playersGrid.innerHTML = '';
    
    this.players.forEach(player => {
      const playerCard = this.createPlayerCard(player);
      this.playersGrid.appendChild(playerCard);
    });
  }

  createPlayerCard(player) {
    const totalAverage = this.calculateTotalAverage(player);
    const winRate = player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0';
    
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <div class="player-card-header">
        <img src="${player.avatar}" alt="${player.name}" class="player-avatar">
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
          <span class="stat-value">${totalAverage.toFixed(1)}</span>
        </div>
      </div>

      <div class="player-card-categories">
        <div class="category-mini" title="Militar">
          <span class="category-icon">⚔️</span>
          <span class="category-value">${player.categoryStats.military.average.toFixed(1)}</span>
        </div>
        <div class="category-mini" title="Economía">
          <span class="category-icon">💰</span>
          <span class="category-value">${player.categoryStats.economy.average.toFixed(1)}</span>
        </div>
        <div class="category-mini" title="Tecnología">
          <span class="category-icon">🔬</span>
          <span class="category-value">${player.categoryStats.technology.average.toFixed(1)}</span>
        </div>
        <div class="category-mini" title="Sociedad">
          <span class="category-icon">👥</span>
          <span class="category-value">${player.categoryStats.society.average.toFixed(1)}</span>
        </div>
      </div>

      <button class="view-profile-btn" onclick="playerProfileManager.openPlayerProfile('${player.id}')">
        Ver Perfil Completo
      </button>
    `;
    
    return card;
  }

  openPlayerProfile(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    const modalBody = document.getElementById('modal-body');
    const modalPlayerName = document.getElementById('modal-player-name');
    
    modalPlayerName.textContent = `Perfil de ${player.name}`;
    modalBody.innerHTML = this.createPlayerProfileContent(player);
    
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  createPlayerProfileContent(player) {
    const totalAverage = this.calculateTotalAverage(player);
    const winRate = player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0';
    
    return `
      <div class="profile-header">
        <img src="${player.avatar}" alt="${player.name}" class="profile-avatar">
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
            <span class="summary-number">${totalAverage.toFixed(1)}</span>
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
              <span class="detail-value">${player.favoriteStrategy}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Civilización Favorita:</span>
              <span class="detail-value">${player.favoriteCivilization}</span>
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
            ${this.createCategoryStats(player.categoryStats)}
          </div>
        </div>

        <div class="detail-section">
          <h4>Historial de Partidas</h4>
          <div class="match-history">
            ${this.createMatchHistory(player.matchHistory)}
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
      const stats = categoryStats[category.key];
      const percentage = (stats.average / 100) * 100;
      
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

    return matchHistory.map(match => {
      const resultClass = match.result === 'win' ? 'match-win' : 'match-loss';
      const resultText = match.result === 'win' ? 'Victoria' : 'Derrota';
      const totalScore = match.scores.military + match.scores.economy + match.scores.technology + match.scores.society;
      
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
          <div class="match-scores">
            <div class="score-item">
              <span class="score-icon">⚔️</span>
              <span class="score-value">${match.scores.military}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">🏛️</span>
              <span class="score-value">${match.scores.economy}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">🔬</span>
              <span class="score-value">${match.scores.technology}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">👥</span>
              <span class="score-value">${match.scores.society}</span>
            </div>
            <div class="score-total">
              <span class="score-label">Total:</span>
              <span class="score-value">${totalScore}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  createPerformanceChart(player) {
    const categories = ['military', 'economy', 'technology', 'society'];
    const maxValue = 100;
    
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
              const value = player.categoryStats[category].average;
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
            const value = player.categoryStats[category].average;
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
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  filterAndRenderPlayers() {
    const searchTerm = this.searchPlayers.value.toLowerCase();
    const filterValue = this.filterPlayers.value;
    
    let filteredPlayers = this.players;
    
    // Apply search filter
    if (searchTerm) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.name.toLowerCase().includes(searchTerm) ||
        player.favoriteStrategy.toLowerCase().includes(searchTerm) ||
        player.favoriteCivilization.toLowerCase().includes(searchTerm)
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
            const totalAverage = this.calculateTotalAverage(player);
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
    const stats = player.categoryStats;
    return (stats.military.average + stats.economy.average + stats.technology.average + stats.society.average) / 4;
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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Public methods for external access
  getPlayerData(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  updatePlayerStats(playerId, newStats) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      Object.assign(player, newStats);
      this.renderPlayersGrid();
    }
  }

  getBestPlayerInCategory(category) {
    return this.players.reduce((best, player) => {
      const playerAvg = player.categoryStats[category].average;
      const bestAvg = best.categoryStats[category].average;
      return playerAvg > bestAvg ? player : best;
    });
  }
}

// Initialize player profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.playerProfileManager = new PlayerProfileManager();
  
  // Update main stats with player data
  updateMainStatsWithPlayerData();
});

function updateMainStatsWithPlayerData() {
  const bestEconomy = playerProfileManager.getBestPlayerInCategory('economy');
  const bestMilitary = playerProfileManager.getBestPlayerInCategory('military');
  
  const bestEconomyEl = document.getElementById('best-economy');
  const bestMilitaryEl = document.getElementById('best-military');
  
  if (bestEconomyEl) bestEconomyEl.textContent = bestEconomy.categoryStats.economy.average.toFixed(1);
  if (bestMilitaryEl) bestMilitaryEl.textContent = bestMilitary.categoryStats.military.average.toFixed(1);
}
