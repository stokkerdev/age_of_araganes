class PhaseManager {
  constructor() {
    this.apiClient = window.apiClient;
    this.currentPhase = 'fase2'; // Fase actual por defecto
    this.phases = [];
    this.init();
  }

  async init() {
    try {
      await this.loadPhases();
      this.setupPhaseSelector();
      this.createInitialPhases();
    } catch (error) {
      console.error('Error inicializando PhaseManager:', error);
    }
  }

  async loadPhases() {
    try {
      const response = await this.apiClient.request('/phases');
      this.phases = response.data;
      
      if (this.phases.length === 0) {
        await this.createInitialPhases();
      }
    } catch (error) {
      console.log('Error cargando fases, creando fases iniciales');
      await this.createInitialPhases();
    }
  }

  async createInitialPhases() {
    const initialPhases = [
      {
        phaseId: 'fase1',
        name: 'Fase 1 - Liga Regular',
        description: 'Primera fase del torneo con formato de liga',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        status: 'completed',
        format: 'league',
        pointsMultiplier: 1
      },
      {
        phaseId: 'fase2',
        name: 'Fase 2 - Liga Avanzada',
        description: 'Segunda fase del torneo con nuevas reglas',
        startDate: new Date('2025-02-01'),
        endDate: null,
        status: 'active',
        format: 'league',
        pointsMultiplier: 1.2
      }
    ];

    try {
      for (const phase of initialPhases) {
        await this.apiClient.request('/phases', {
          method: 'POST',
          body: JSON.stringify(phase)
        });
      }
      await this.loadPhases();
    } catch (error) {
      console.log('Error creando fases iniciales:', error);
    }
  }

  setupPhaseSelector() {
    // Crear selector de fases en la interfaz
    const container = document.querySelector('.container');
    const resultsSection = document.getElementById('resultados');
    
    if (resultsSection && container) {
      const phaseSelector = this.createPhaseSelectorHTML();
      
      // Insertar antes de la sección de resultados
      resultsSection.insertAdjacentHTML('afterbegin', phaseSelector);
      
      // Configurar event listeners
      this.setupPhaseSelectorEvents();
    }
  }

  createPhaseSelectorHTML() {
    const phaseOptions = this.phases.map(phase => 
      `<option value="${phase.phaseId}" ${phase.phaseId === this.currentPhase ? 'selected' : ''}>
        ${phase.name} ${phase.status === 'active' ? '(Activa)' : ''}
      </option>`
    ).join('');

    return `
      <div class="phase-selector-container" style="
        background: var(--bg-primary);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Seleccionar Fase del Torneo</h3>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
              Visualiza los resultados y estadísticas por fase
            </p>
          </div>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <select id="phase-selector" style="
              padding: 0.75rem 1rem;
              border: 1px solid var(--border-color);
              border-radius: 8px;
              background: var(--bg-primary);
              color: var(--text-primary);
              font-size: 0.9rem;
              min-width: 200px;
            ">
              ${phaseOptions}
            </select>
            <button id="phase-info-btn" style="
              background: var(--primary-color);
              color: white;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 8px;
              cursor: pointer;
              font-size: 0.9rem;
            ">
              ℹ️ Info
            </button>
          </div>
        </div>
        <div id="phase-info" style="
          margin-top: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          display: none;
        ">
          <!-- Info de la fase se cargará aquí -->
        </div>
      </div>
    `;
  }

  setupPhaseSelectorEvents() {
    const phaseSelector = document.getElementById('phase-selector');
    const phaseInfoBtn = document.getElementById('phase-info-btn');
    const phaseInfo = document.getElementById('phase-info');

    if (phaseSelector) {
      phaseSelector.addEventListener('change', (e) => {
        this.currentPhase = e.target.value;
        this.onPhaseChange();
      });
    }

    if (phaseInfoBtn) {
      phaseInfoBtn.addEventListener('click', () => {
        if (phaseInfo.style.display === 'none') {
          this.showPhaseInfo();
          phaseInfo.style.display = 'block';
        } else {
          phaseInfo.style.display = 'none';
        }
      });
    }
  }

  async showPhaseInfo() {
    const phaseInfo = document.getElementById('phase-info');
    const currentPhaseData = this.phases.find(p => p.phaseId === this.currentPhase);
    
    if (!currentPhaseData || !phaseInfo) return;

    try {
      const response = await this.apiClient.request(`/phases/${this.currentPhase}`);
      const phaseData = response.data;

      phaseInfo.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${phaseData.name}</h4>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${phaseData.description}</p>
          </div>
          <div>
            <p style="margin: 0 0 0.25rem 0;"><strong>Estado:</strong> 
              <span style="color: ${this.getStatusColor(phaseData.status)}">${this.getStatusText(phaseData.status)}</span>
            </p>
            <p style="margin: 0 0 0.25rem 0;"><strong>Formato:</strong> ${this.getFormatText(phaseData.format)}</p>
            <p style="margin: 0;"><strong>Multiplicador:</strong> ${phaseData.pointsMultiplier}x puntos</p>
          </div>
          <div>
            <p style="margin: 0 0 0.25rem 0;"><strong>Partidas:</strong> ${phaseData.stats.totalMatches}</p>
            <p style="margin: 0 0 0.25rem 0;"><strong>Jugadores:</strong> ${phaseData.stats.totalPlayers}</p>
            <p style="margin: 0;"><strong>Inicio:</strong> ${new Date(phaseData.startDate).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      `;
    } catch (error) {
      phaseInfo.innerHTML = '<p style="color: var(--text-secondary);">Error cargando información de la fase</p>';
    }
  }

  getStatusColor(status) {
    const colors = {
      'upcoming': '#f59e0b',
      'active': '#10b981',
      'completed': '#6b7280',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status) {
    const texts = {
      'upcoming': 'Próxima',
      'active': 'Activa',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return texts[status] || status;
  }

  getFormatText(format) {
    const texts = {
      'league': 'Liga',
      'elimination': 'Eliminación',
      'group_stage': 'Fase de Grupos',
      'finals': 'Finales'
    };
    return texts[format] || format;
  }

  async onPhaseChange() {
    try {
      // Actualizar tabla de resultados para la fase seleccionada
      await this.updateResultsTable();
      
      // Actualizar estadísticas
      await this.updatePhaseStats();
      
      // Notificar a otros componentes
      window.dispatchEvent(new CustomEvent('phaseChanged', {
        detail: { phaseId: this.currentPhase }
      }));
      
      console.log(`Cambiado a fase: ${this.currentPhase}`);
    } catch (error) {
      console.error('Error cambiando fase:', error);
    }
  }

  async updateResultsTable() {
    try {
      const response = await this.apiClient.request(`/phases/${this.currentPhase}/leaderboard`);
      const leaderboard = response.data;
      
      // Actualizar tabla
      const tableBody = document.getElementById('table-body');
      if (tableBody) {
        tableBody.innerHTML = '';
        
        leaderboard.forEach((player, index) => {
          const position = index + 1;
          const ratioClass = this.getRatioClass(parseFloat(player.winRatio));
          const positionClass = this.getPositionClass(position);

          const row = document.createElement('tr');
          row.className = positionClass;
          row.innerHTML = `
            <td><strong>${position}</strong></td>
            <td class="player-name">${player.playerName}</td>
            <td>${player.matches}</td>
            <td>${player.wins}</td>
            <td><strong>${player.points}</strong></td>
            <td class="${ratioClass}">${player.winRatio}%</td>
            <td>
              <button class="view-profile-btn" onclick="openPlayerProfileFromTable('${player.playerId}')">
                Ver Perfil
              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error actualizando tabla de resultados:', error);
    }
  }

  async updatePhaseStats() {
    try {
      const response = await this.apiClient.request(`/phases/${this.currentPhase}/leaderboard`);
      const leaderboard = response.data;
      
      if (leaderboard.length > 0) {
        const leader = leaderboard[0];
        const totalMatches = Math.max(...leaderboard.map(p => p.matches));
        
        // Actualizar elementos de estadísticas
        const currentLeaderEl = document.getElementById('current-leader');
        const leaderPointsEl = document.getElementById('leader-points');
        const totalMatchesEl = document.getElementById('total-matches');
        
        if (currentLeaderEl) currentLeaderEl.textContent = leader.playerName;
        if (leaderPointsEl) leaderPointsEl.textContent = `${leader.points} puntos`;
        if (totalMatchesEl) totalMatchesEl.textContent = totalMatches;
      }
    } catch (error) {
      console.error('Error actualizando estadísticas de fase:', error);
    }
  }

  getRatioClass(ratio) {
    if (ratio >= 70) return 'ratio-good';
    if (ratio >= 40) return 'ratio-average';
    return 'ratio-poor';
  }

  getPositionClass(position) {
    switch (position) {
      case 1: return 'position-1';
      case 2: return 'position-2';
      case 3: return 'position-3';
      default: return '';
    }
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  async createNewPhase(phaseData) {
    try {
      const response = await this.apiClient.request('/phases', {
        method: 'POST',
        body: JSON.stringify(phaseData)
      });
      
      await this.loadPhases();
      this.setupPhaseSelector();
      
      return response.data;
    } catch (error) {
      console.error('Error creando nueva fase:', error);
      throw error;
    }
  }
}

// Inicializar el gestor de fases
document.addEventListener('DOMContentLoaded', async function() {
  try {
    window.phaseManager = new PhaseManager();
    console.log('PhaseManager inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando PhaseManager:', error);
  }
});

window.PhaseManager = PhaseManager;