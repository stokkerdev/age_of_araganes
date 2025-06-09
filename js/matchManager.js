class MatchManager {
  constructor() {
    this.players = [];
    this.matches = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
  }

  async loadData() {
    try {
      const response = await fetch('data/data.json');
      const data = await response.json();
      this.players = data.players;
      console.log('Datos de jugadores cargados:', this.players);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  setupEventListeners() {
    // Event listener para el botón de agregar partida
    const addMatchBtn = document.getElementById('add-match-btn');
    if (addMatchBtn) {
      addMatchBtn.addEventListener('click', () => this.showAddMatchModal());
    }
  }

  showAddMatchModal() {
    const modal = this.createAddMatchModal();
    document.body.appendChild(modal);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  createAddMatchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'add-match-modal';
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h2>Agregar Nueva Partida</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';">&times;</button>
        </div>
        <div class="modal-body">
          <form id="add-match-form">
            <div class="form-section">
              <h3>Información de la Partida</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="match-date">Fecha:</label>
                  <input type="date" id="match-date" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                  <label for="match-duration">Duración (minutos):</label>
                  <input type="number" id="match-duration" min="10" max="300" required placeholder="45">
                </div>
              </div>
              <div class="form-group">
                <label for="match-map">Mapa:</label>
                <select id="match-map" required>
                  <option value="">Seleccionar mapa</option>
                  <option value="Arabia">Arabia</option>
                  <option value="Arena">Arena</option>
                  <option value="Black Forest">Black Forest</option>
                  <option value="Islands">Islands</option>
                  <option value="Nomad">Nomad</option>
                  <option value="Team Islands">Team Islands</option>
                  <option value="Continental">Continental</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Baltic">Baltic</option>
                  <option value="Fortress">Fortress</option>
                </select>
              </div>
            </div>

            <div class="form-section">
              <h3>Jugadores Participantes</h3>
              <p class="form-note">Selecciona mínimo 4 jugadores para la partida</p>
              <div id="players-selection" class="players-selection">
                ${this.players.map(player => `
                  <div class="player-checkbox">
                    <input type="checkbox" id="player-${player.id}" value="${player.id}" class="player-select">
                    <label for="player-${player.id}">${player.name}</label>
                  </div>
                `).join('')}
              </div>
              <div id="selection-error" class="error-message" style="display: none;">
                Debes seleccionar al menos 4 jugadores
              </div>
            </div>

            <div class="form-section" id="scores-section" style="display: none;">
              <h3>Puntuaciones por Jugador</h3>
              <div id="player-scores">
                <!-- Se generará dinámicamente -->
              </div>
            </div>

            <div class="form-section" id="ranking-section" style="display: none;">
              <h3>Posiciones Finales</h3>
              <p class="form-note">Arrastra para ordenar del 1º al último puesto</p>
              <div id="final-ranking" class="ranking-list">
                <!-- Se generará dinámicamente -->
              </div>
            </div>

            <div class="form-actions">
              <button type="button" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                Guardar Partida
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Event listeners para el modal
    this.setupModalEventListeners(modal);
    
    return modal;
  }

  setupModalEventListeners(modal) {
    const form = modal.querySelector('#add-match-form');
    const playerCheckboxes = modal.querySelectorAll('.player-select');
    const scoresSection = modal.querySelector('#scores-section');
    const rankingSection = modal.querySelector('#ranking-section');
    const playerScores = modal.querySelector('#player-scores');
    const finalRanking = modal.querySelector('#final-ranking');
    const selectionError = modal.querySelector('#selection-error');

    // Listener para cambios en selección de jugadores
    playerCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selectedPlayers = Array.from(playerCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);

        if (selectedPlayers.length >= 4) {
          selectionError.style.display = 'none';
          this.generateScoreInputs(selectedPlayers, playerScores);
          this.generateRankingList(selectedPlayers, finalRanking);
          scoresSection.style.display = 'block';
          rankingSection.style.display = 'block';
        } else {
          scoresSection.style.display = 'none';
          rankingSection.style.display = 'none';
          if (selectedPlayers.length > 0) {
            selectionError.style.display = 'block';
          } else {
            selectionError.style.display = 'none';
          }
        }
      });
    });

    // Listener para envío del formulario
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleMatchSubmission(modal);
    });
  }

  generateScoreInputs(selectedPlayerIds, container) {
    container.innerHTML = selectedPlayerIds.map(playerId => {
      const player = this.players.find(p => p.id === playerId);
      return `
        <div class="player-score-card">
          <h4>${player.name}</h4>
          <div class="score-inputs">
            <div class="score-input-group">
              <label>⚔️ Militar:</label>
              <input type="number" id="military-${playerId}" min="0" max="50000" required placeholder="0">
            </div>
            <div class="score-input-group">
              <label>💰 Economía:</label>
              <input type="number" id="economy-${playerId}" min="0" max="50000" required placeholder="0">
            </div>
            <div class="score-input-group">
              <label>🔬 Tecnología:</label>
              <input type="number" id="technology-${playerId}" min="0" max="50000" required placeholder="0">
            </div>
            <div class="score-input-group">
              <label>👥 Sociedad:</label>
              <input type="number" id="society-${playerId}" min="0" max="50000" required placeholder="0">
            </div>
          </div>
          <div class="total-score">
            Total: <span id="total-${playerId}">0</span>
          </div>
        </div>
      `;
    }).join('');

    // Agregar listeners para calcular totales automáticamente
    selectedPlayerIds.forEach(playerId => {
      ['military', 'economy', 'technology', 'society'].forEach(category => {
        const input = container.querySelector(`#${category}-${playerId}`);
        input.addEventListener('input', () => {
          this.updatePlayerTotal(playerId, container);
        });
      });
    });
  }

  updatePlayerTotal(playerId, container) {
    const categories = ['military', 'economy', 'technology', 'society'];
    let total = 0;
    
    categories.forEach(category => {
      const input = container.querySelector(`#${category}-${playerId}`);
      const value = parseInt(input.value) || 0;
      total += value;
    });

    const totalSpan = container.querySelector(`#total-${playerId}`);
    totalSpan.textContent = total.toLocaleString();
  }

  generateRankingList(selectedPlayerIds, container) {
    container.innerHTML = selectedPlayerIds.map((playerId, index) => {
      const player = this.players.find(p => p.id === playerId);
      return `
        <div class="ranking-item" data-player-id="${playerId}">
          <span class="position">${index + 1}º</span>
          <span class="player-name">${player.name}</span>
          <span class="drag-handle">⋮⋮</span>
        </div>
      `;
    }).join('');

    // Hacer la lista sorteable
    this.makeSortable(container);
  }

  makeSortable(container) {
    let draggedElement = null;

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
      }
    });

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        e.target.style.opacity = '';
        draggedElement = null;
        this.updateRankingPositions(container);
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedElement && e.target.classList.contains('ranking-item')) {
        const rect = e.target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (e.clientY < midpoint) {
          container.insertBefore(draggedElement, e.target);
        } else {
          container.insertBefore(draggedElement, e.target.nextSibling);
        }
      }
    });

    // Hacer elementos draggables
    container.querySelectorAll('.ranking-item').forEach(item => {
      item.draggable = true;
    });
  }

  updateRankingPositions(container) {
    const items = container.querySelectorAll('.ranking-item');
    items.forEach((item, index) => {
      const positionSpan = item.querySelector('.position');
      positionSpan.textContent = `${index + 1}º`;
    });
  }

  async handleMatchSubmission(modal) {
    try {
      const formData = this.collectFormData(modal);
      
      if (!this.validateMatchData(formData)) {
        return;
      }

      // Actualizar datos de jugadores
      this.updatePlayersData(formData);
      
      // Simular guardado (en una implementación real, aquí harías la petición al servidor)
      await this.saveMatchData(formData);
      
      // Actualizar la interfaz
      this.refreshInterface();
      
      // Cerrar modal
      modal.remove();
      document.body.style.overflow = '';
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage('Partida agregada exitosamente');
      
    } catch (error) {
      console.error('Error guardando partida:', error);
      this.showErrorMessage('Error al guardar la partida');
    }
  }

  collectFormData(modal) {
    const selectedPlayers = Array.from(modal.querySelectorAll('.player-select:checked'))
      .map(cb => cb.value);
    
    const matchData = {
      date: modal.querySelector('#match-date').value,
      duration: parseInt(modal.querySelector('#match-duration').value),
      map: modal.querySelector('#match-map').value,
      players: []
    };

    // Recoger puntuaciones
    selectedPlayers.forEach(playerId => {
      const playerData = {
        id: playerId,
        scores: {
          military: parseInt(modal.querySelector(`#military-${playerId}`).value) || 0,
          economy: parseInt(modal.querySelector(`#economy-${playerId}`).value) || 0,
          technology: parseInt(modal.querySelector(`#technology-${playerId}`).value) || 0,
          society: parseInt(modal.querySelector(`#society-${playerId}`).value) || 0
        }
      };
      playerData.totalScore = Object.values(playerData.scores).reduce((a, b) => a + b, 0);
      matchData.players.push(playerData);
    });

    // Recoger ranking final
    const rankingItems = modal.querySelectorAll('#final-ranking .ranking-item');
    matchData.finalRanking = Array.from(rankingItems).map((item, index) => ({
      playerId: item.dataset.playerId,
      position: index + 1
    }));

    return matchData;
  }

  validateMatchData(formData) {
    if (formData.players.length < 4) {
      this.showErrorMessage('Debe haber al menos 4 jugadores');
      return false;
    }

    if (!formData.date || !formData.duration || !formData.map) {
      this.showErrorMessage('Todos los campos son obligatorios');
      return false;
    }

    // Validar que todos los jugadores tengan puntuaciones
    for (let player of formData.players) {
      const total = Object.values(player.scores).reduce((a, b) => a + b, 0);
      if (total === 0) {
        this.showErrorMessage(`${this.getPlayerName(player.id)} debe tener al menos una puntuación`);
        return false;
      }
    }

    return true;
  }

  updatePlayersData(matchData) {
    const totalPlayers = matchData.players.length;
    
    matchData.players.forEach(playerData => {
      const player = this.players.find(p => p.id === playerData.id);
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

      // Agregar partida al historial
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

      player.matchHistory.unshift(matchHistoryEntry); // Agregar al inicio
    });
  }

  async saveMatchData(matchData) {
    // En una implementación real, aquí harías una petición POST al servidor
    // Por ahora, simulamos el guardado actualizando el localStorage
    
    const currentData = {
      players: this.players,
      lastMatch: matchData,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('tournamentData', JSON.stringify(currentData));
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  refreshInterface() {
    // Actualizar tabla principal
    if (window.TournamentApp && window.TournamentApp.updatePlayerData) {
      window.TournamentApp.updatePlayerData(this.players);
    }

    // Actualizar perfiles de jugadores
    if (window.playerProfileManager) {
      window.playerProfileManager.players = this.players;
      window.playerProfileManager.renderPlayersGrid();
    }

    // Actualizar estadísticas
    if (window.updateMainStatsWithPlayerData) {
      window.updateMainStatsWithPlayerData();
    }
  }

  getPlayerName(playerId) {
    const player = this.players.find(p => p.id === playerId);
    return player ? player.name : 'Desconocido';
  }

  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `toast-message toast-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }
}

// Inicializar el gestor de partidas
document.addEventListener('DOMContentLoaded', function() {
  window.matchManager = new MatchManager();
});

// Exportar para uso global
window.MatchManager = MatchManager;