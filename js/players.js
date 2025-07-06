let playersData = { players: [] };

fetch('data/data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    playersData.players = data.players;
    console.log("Datos cargados correctamente:", playersData.players);
    initializeProfiles();
  })
  .catch(error => {
    console.error("Error al cargar el JSON:", error);
  });

window.initializeProfiles = function () {
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
        <img src="${player.avatar}" alt="${player.name} Avatar" class="player-avatar">      
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
          <span class="stat-value">${totalAverage.toFixed(0)}</span>
        </div>
      </div>

      <div class="player-card-categories">
        <div class="category-mini" title="Militar">
          <span class="category-icon">⚔️</span>
          <span class="category-value">${Math.round(player.categoryStats.military.average)}</span>
        </div>
        <div class="category-mini" title="Economía">
          <span class="category-icon">💰</span>
          <span class="category-value">${Math.round(player.categoryStats.economy.average)}</span>
        </div>
        <div class="category-mini" title="Tecnología">
          <span class="category-icon">🔬</span>
          <span class="category-value">${Math.round(player.categoryStats.technology.average)}</span>
        </div>
        <div class="category-mini" title="Sociedad">
          <span class="category-icon">👥</span>
          <span class="category-value">${Math.round(player.categoryStats.society.average)}</span>
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
        <img src="${player.avatar} " alt="${player.name} Avatar" class="profile-avatar">
        
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
            <span class="summary-number">${Math.round(totalAverage)}</span>
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
          <h4>Gráfico de Rendimiento</h4>
          <div class="performance-chart">
            ${this.createPerformanceChart(player)}
          </div>
        </div>

        <div class="detail-section">
          <h4>Historial de Partidas</h4>
          <div class="match-history">
            ${this.createMatchHistory(player.matchHistory)}
          </div>
        </div>
      </div>
    `;
  }

  createCategoryStats(categoryStats) {
    const categories = [
      { key: 'military', name: 'Militar', icon: '⚔️', color: '#ef4444' },
      { key: 'economy', name: 'Economía', icon: '💰', color: '#f59e0b' },
      { key: 'technology', name: 'Tecnología', icon: '🔬', color: '#3b82f6' },
      { key: 'society', name: 'Sociedad', icon: '👥', color: '#10b981' }
    ];

    return categories.map(category => {
      const stats = categoryStats[category.key];
      const maxPossible = 20000; // Valor máximo estimado para calcular porcentaje
      const percentage = Math.min((stats.average / maxPossible) * 100, 100);

      return `
        <div class="category-stat">
          <div class="category-header">
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
            <span class="category-average">${Math.round(stats.average)}</span>
          </div>
          <div class="category-bar">
            <div class="category-fill" style="width: ${percentage}%; background-color: ${category.color}"></div>
          </div>
          <div class="category-details">
            <span>Peor: ${stats.worst}</span>
            <span>Mejor: ${stats.best}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  createMatchHistory(matchHistory) {
    if (!matchHistory || matchHistory.length === 0) {
      return '<p class="no-matches">No hay partidas registradas</p>';
    }

    return matchHistory.slice(0, 10).map(match => { // Mostrar solo las últimas 10 partidas
      const isWin = match.position === 1;
      const resultClass = isWin ? 'match-win' : 'match-loss';
      const resultText = isWin ? 'Victoria' : `${match.position}º lugar`;

      return `
        <div class="match-item ${resultClass}">
          <div class="match-main">
            <div class="match-opponent">
              <span class="match-vs">Partida ${match.totalPlayers} jugadores</span>
              <span class="match-result">${resultText}</span>
            </div>
            <div class="match-meta">
              <span class="match-date">${this.formatDate(match.date)}</span>
              <span class="match-duration">${match.duration}</span>
              <span class="match-map">📍 ${match.map}</span>
            </div>
          </div>
          <div class="match-scores">
            <div class="score-item">
              <span class="score-icon">⚔️</span>
              <span class="score-value">${match.scores.military.toLocaleString()}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">💰</span>
              <span class="score-value">${match.scores.economy.toLocaleString()}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">🔬</span>
              <span class="score-value">${match.scores.technology.toLocaleString()}</span>
            </div>
            <div class="score-item">
              <span class="score-icon">👥</span>
              <span class="score-value">${match.scores.society.toLocaleString()}</span>
            </div>
            <div class="score-total">
              <span class="score-label">Total:</span>
              <span class="score-value">${match.totalScore.toLocaleString()}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  createPerformanceChart(player) {
    const categories = ['military', 'economy', 'technology', 'society'];
    const categoryLabels = ['Militar', 'Economía', 'Tecnología', 'Sociedad'];

    // Normalizar valores para el gráfico (0-100)
    const maxValues = {
      military: 20000,
      economy: 20000,
      technology: 10000,
      society: 2000
    };

    const normalizedValues = categories.map(category => {
      const value = player.categoryStats[category].average;
      const maxValue = maxValues[category];
      return Math.min((value / maxValue) * 100, 100);
    });

    // Crear puntos del polígono
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    const points = normalizedValues.map((value, index) => {
      const angle = (index * 90 - 90) * Math.PI / 180; // 90 grados entre cada punto
      const r = (value / 100) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    // Crear líneas de la grilla
    const gridLines = [20, 40, 60, 80, 100].map(percentage => {
      const r = (percentage / 100) * radius;
      const gridPoints = categories.map((_, index) => {
        const angle = (index * 90 - 90) * Math.PI / 180;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
      return `<polygon points="${gridPoints}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
    }).join('');

    // Crear líneas de los ejes
    const axisLines = categories.map((_, index) => {
      const angle = (index * 90 - 90) * Math.PI / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
    }).join('');

    // Crear etiquetas
    const labels = categoryLabels.map((label, index) => {
      const angle = (index * 90 - 90) * Math.PI / 180;
      const x = centerX + (radius + 20) * Math.cos(angle);
      const y = centerY + (radius + 20) * Math.sin(angle);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="radar-label" style="font-size: 12px; fill: #6b7280; font-weight: 600;">${label}</text>`;
    }).join('');

    return `
      <div class="radar-chart" style="display: flex; justify-content: center;">
        <svg viewBox="0 0 300 300" style="width: 300px; height: 300px;">
          <!-- Grid -->
          ${gridLines}
          ${axisLines}
          
          <!-- Data polygon -->
          <polygon
            points="${points}"
            fill="rgba(37, 99, 235, 0.2)"
            stroke="#2563eb"
            stroke-width="2"
          />
          
          <!-- Data points -->
          ${normalizedValues.map((value, index) => {
      const angle = (index * 90 - 90) * Math.PI / 180;
      const r = (value / 100) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `<circle cx="${x}" cy="${y}" r="4" fill="#2563eb"/>`;
    }).join('')}
          
          <!-- Labels -->
          ${labels}
        </svg>
      </div>
      
      <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: #6b7280;">
        Promedio de puntuaciones por categoría
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

    if (searchTerm) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filterValue !== 'all') {
      if (filterValue === 'top') {
        filteredPlayers = filteredPlayers.filter(player => player.points > 0);
      } else {
        filteredPlayers = filteredPlayers.filter(player => player.status === filterValue);
      }
    }

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
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getBestPlayerInCategory(category, mode = 'average') {
    if (mode === 'best') {
      return this.players.reduce((best, player) => {
        const playerBest = player.categoryStats[category].best;
        const bestBest = best.categoryStats[category].best;
        return playerBest > bestBest ? player : best;
      });
    } else {
      return this.players.reduce((best, player) => {
        const playerAvg = player.categoryStats[category].average;
        const bestAvg = best.categoryStats[category].average;
        return playerAvg > bestAvg ? player : best;
      });
    }
  }
}

// Initialize player profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  if (playersData.players.length > 0) {
    window.playerProfileManager = new PlayerProfileManager();
    updateMainStatsWithPlayerData();
  }
});

function updateMainStatsWithPlayerData() {
  if (!window.playerProfileManager || !window.playerProfileManager.players.length) return;

  try {
    const bestEconomy = playerProfileManager.getBestPlayerInCategory('economy', 'best');
    const bestMilitary = playerProfileManager.getBestPlayerInCategory('military', 'best');
    const bestTechnology = playerProfileManager.getBestPlayerInCategory('technology', 'best');
    const bestSociety = playerProfileManager.getBestPlayerInCategory('society', 'best');

    const bestEconomyEl = document.getElementById('best-economy');
    const bestMilitaryEl = document.getElementById('best-military');
    const bestTechnologyEl = document.getElementById('best-tecno');
    const bestSocietyEl = document.getElementById('best-soc');

    if (bestSocietyEl) bestSocietyEl.textContent = `${Math.round(bestSociety.categoryStats.society.best)} - ${bestSociety.name}`;
    if (bestTechnologyEl) bestTechnologyEl.textContent = `${Math.round(bestTechnology.categoryStats.technology.best)} - ${bestTechnology.name}`;
    if (bestEconomyEl) bestEconomyEl.textContent = `${Math.round(bestEconomy.categoryStats.economy.best)} - ${bestEconomy.name}`;
    if (bestMilitaryEl) bestMilitaryEl.textContent = `${Math.round(bestMilitary.categoryStats.military.best)} - ${bestMilitary.name}`;
  } catch (error) {
    console.error('Error actualizando estadísticas principales:', error);
  }
}