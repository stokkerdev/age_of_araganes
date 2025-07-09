class MatchManager {
  constructor() {
    this.players = [];
    this.matches = [];
    this.dataManager = window.dataManager;
    this.init();
  }

  async init() {
    try {
      // Esperar a que el dataManager esté listo
      if (!this.dataManager.isLoaded) {
        const data = await this.dataManager.loadAllData();
        this.players = data.players;
        this.matches = data.matches;
      } else {
        this.players = this.dataManager.getPlayers();
        this.matches = this.dataManager.getMatches();
      }
      
      this.setupEventListeners();
      console.log('MatchManager inicializado con', this.players.length, 'jugadores y', this.matches.length, 'partidas');
    } catch (error) {
      console.error('Error inicializando MatchManager:', error);
    }
  }

  setupEventListeners() {
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
              <div class="form-group">
                <label for="match-phase">Fase del Torneo:</label>
                <select id="match-phase" required>
                  <option value="fase2" selected>Fase 2 - Liga Avanzada</option>
                  <option value="fase1">Fase 1 - Liga Regular</option>
                </select>
              </div>
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
                  <option value="Hideout">Hideout</option>
                  <option value="Gold Rush">Gold Rush</option>
                </select>
              </div>
              <div class="form-group">
                <label for="admin-notes">Notas del Administrador:</label>
                <textarea id="admin-notes" placeholder="Notas adicionales sobre la partida..." style="
                  width: 100%;
                  padding: 0.75rem;
                  border: 1px solid var(--border-color);
                  border-radius: 6px;
                  font-size: 0.9rem;
                  resize: vertical;
                  min-height: 80px;
                "></textarea>
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
              <p class="form-note">Ingresa las puntuaciones finales de cada categoría</p>
              <div id="player-scores">
                <!-- Se generará dinámicamente -->
              </div>
            </div>

            <div class="form-section" id="ranking-section" style="display: none;">
              <h3>Posiciones Finales</h3>
              <p class="form-note">Arrastra para ordenar del 1º al último puesto (o se ordenará automáticamente por puntuación total)</p>
              <div class="form-group">
                <label>
                  <input type="checkbox" id="auto-rank" checked> Ordenar automáticamente por puntuación total
                </label>
              </div>
              <div id="final-ranking" class="ranking-list">
                <!-- Se generará dinámicamente -->
              </div>
            </div>

            <div class="form-actions">
              <button type="button" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" id="save-match-btn">
                <span class="btn-text">Guardar Partida</span>
                <span class="btn-loading" style="display: none;">Guardando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

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
    const autoRankCheckbox = modal.querySelector('#auto-rank');

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

    // Listener para auto-ranking
    autoRankCheckbox.addEventListener('change', () => {
      if (autoRankCheckbox.checked) {
        this.updateRankingByScores(playerScores, finalRanking);
      }
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
              <input type="number" id="military-${playerId}" min="0" max="50000" required placeholder="0" class="score-input">
            </div>
            <div class="score-input-group">
              <label>💰 Economía:</label>
              <input type="number" id="economy-${playerId}" min="0" max="50000" required placeholder="0" class="score-input">
            </div>
            <div class="score-input-group">
              <label>🔬 Tecnología:</label>
              <input type="number" id="technology-${playerId}" min="0" max="50000" required placeholder="0" class="score-input">
            </div>
            <div class="score-input-group">
              <label>👥 Sociedad:</label>
              <input type="number" id="society-${playerId}" min="0" max="50000" required placeholder="0" class="score-input">
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
          
          // Si auto-rank está activado, actualizar ranking
          const autoRankCheckbox = document.querySelector('#auto-rank');
          if (autoRankCheckbox && autoRankCheckbox.checked) {
            const finalRanking = document.querySelector('#final-ranking');
            this.updateRankingByScores(container, finalRanking);
          }
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

  updateRankingByScores(scoresContainer, rankingContainer) {
    const playerTotals = [];
    
    // Recoger totales de todos los jugadores
    const playerCards = scoresContainer.querySelectorAll('.player-score-card');
    playerCards.forEach(card => {
      const playerName = card.querySelector('h4').textContent;
      const totalSpan = card.querySelector('[id^="total-"]');
      const total = parseInt(totalSpan.textContent.replace(/,/g, '')) || 0;
      const playerId = totalSpan.id.replace('total-', '');
      
      playerTotals.push({ playerId, playerName, total });
    });

    // Ordenar por total descendente
    playerTotals.sort((a, b) => b.total - a.total);

    // Actualizar el ranking
    rankingContainer.innerHTML = playerTotals.map((player, index) => `
      <div class="ranking-item" data-player-id="${player.playerId}">
        <span class="position">${index + 1}º</span>
        <span class="player-name">${player.playerName}</span>
        <span class="player-total">${player.total.toLocaleString()}</span>
        <span class="drag-handle">⋮⋮</span>
      </div>
    `).join('');

    // Reactivar sorteable si no es auto-rank
    const autoRankCheckbox = document.querySelector('#auto-rank');
    if (!autoRankCheckbox || !autoRankCheckbox.checked) {
      this.makeSortable(rankingContainer);
    }
  }

  generateRankingList(selectedPlayerIds, container) {
    container.innerHTML = selectedPlayerIds.map((playerId, index) => {
      const player = this.players.find(p => p.id === playerId);
      return `
        <div class="ranking-item" data-player-id="${playerId}">
          <span class="position">${index + 1}º</span>
          <span class="player-name">${player.name}</span>
          <span class="player-total">0</span>
          <span class="drag-handle">⋮⋮</span>
        </div>
      `;
    }).join('');

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
    const saveBtn = modal.querySelector('#save-match-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');
    
    try {
      // Mostrar estado de carga
      saveBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';

      const formData = this.collectFormData(modal);
      
      if (!this.validateMatchData(formData)) {
        return;
      }

      // Guardar partida usando el DataManager
      const savedMatch = await this.dataManager.saveMatch(formData);
      
      // Actualizar datos locales
      this.players = this.dataManager.getPlayers();
      this.matches = this.dataManager.getMatches();
      
      // Actualizar la interfaz
      this.refreshInterface();
      
      // Cerrar modal
      modal.remove();
      document.body.style.overflow = '';
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage(`Partida guardada exitosamente (ID: ${savedMatch.id.slice(-8)})`);
      
    } catch (error) {
      console.error('Error guardando partida:', error);
      this.showErrorMessage('Error al guardar la partida. Inténtalo de nuevo.');
    } finally {
      // Restaurar botón
      saveBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  collectFormData(modal) {
    const selectedPlayers = Array.from(modal.querySelectorAll('.player-select:checked'))
      .map(cb => cb.value);
    
    const matchData = {
      phaseId: modal.querySelector('#match-phase').value,
      date: modal.querySelector('#match-date').value,
      duration: parseInt(modal.querySelector('#match-duration').value),
      map: modal.querySelector('#match-map').value,
      adminNotes: modal.querySelector('#admin-notes').value,
      createdBy: 'admin',
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

    // Actualizar estadísticas principales
    this.updateMainStats();

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('tournamentDataUpdated', {
      detail: { players: this.players, matches: this.matches }
    }));
  }

  updateMainStats() {
    const stats = this.dataManager.getTournamentStats();
    
    // Actualizar contadores principales
    const totalPlayersEl = document.getElementById('total-players');
    const totalMatchesEl = document.getElementById('total-matches');
    const currentLeaderEl = document.getElementById('current-leader');
    const leaderPointsEl = document.getElementById('leader-points');
    const bestRatioEl = document.getElementById('best-ratio');
    const bestRatioPlayerEl = document.getElementById('best-ratio-player');
    const besttecnoEl = document.getElementById('best-tecno');
    
    const bestsocEl = document.getElementById('best-soc');
    
    

  

   
 
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
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }, 4000);
  }

  // Método para exportar datos de partidas
  exportMatchesData() {
    const data = this.dataManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torneo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Inicializar el gestor de partidas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Asegurar que el dataManager esté inicializado
    if (!window.dataManager.isLoaded) {
      await window.dataManager.loadAllData();
    }
    
    window.matchManager = new MatchManager();
    console.log('MatchManager inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando MatchManager:', error);
  }
});

// Exportar para uso global
window.MatchManager = MatchManager;