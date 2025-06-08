let tournamentData = { players: [] };

// Initialize API and load data
async function initializeDataFromAPI() {
  try {
    // Show loading state
    showLoadingState();
    
    // Check if API is available
    const apiAvailable = await window.tournamentAPI.waitForAPI(3, 1000);
    
    if (apiAvailable) {
      console.log('🌐 Loading data from API...');
      
      // Load players from API
      const playersResponse = await window.tournamentAPI.getPlayers({ sort: 'points', order: 'desc' });
      
      if (playersResponse.success) {
        tournamentData.players = playersResponse.data;
        console.log(`✅ Loaded ${tournamentData.players.length} players from API`);
      } else {
        throw new Error('Failed to load players from API');
      }
    } else {
      console.log('📁 Loading fallback data...');
      // Fallback to local data if API is unavailable
      await loadFallbackData();
    }
    
    // Update global data for other modules
    if (window.playersData) {
      window.playersData.players = tournamentData.players;
    }
    
    // Initialize app components
    if (window.initializeApp) window.initializeApp();
    if (window.initializeProfiles) window.initializeProfiles();
    
    hideLoadingState();
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    
    // Fallback to local data on error
    await loadFallbackData();
    
    // Show error message to user
    showErrorMessage('Unable to connect to server. Using offline data.');
    
    // Initialize app with fallback data
    if (window.initializeApp) window.initializeApp();
    if (window.initializeProfiles) window.initializeProfiles();
    
    hideLoadingState();
  }
}

// Fallback data loading
async function loadFallbackData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    tournamentData.players = data.players;
    
    if (window.playersData) {
      window.playersData.players = data.players;
    }
    
    console.log('📁 Loaded fallback data from data.json');
  } catch (error) {
    console.error('❌ Error loading fallback data:', error);
    // Use minimal default data
    tournamentData.players = [];
  }
}

// Loading state management
function showLoadingState() {
  const loadingHTML = `
    <div id="loading-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    ">
      <div style="text-align: center;">
        <div style="
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="color: #6b7280; font-size: 1.1rem;">Cargando datos del torneo...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hideLoadingState() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function showErrorMessage(message) {
  const errorHTML = `
    <div id="error-banner" style="
      position: fixed;
      top: 70px;
      left: 0;
      width: 100%;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      padding: 1rem;
      text-align: center;
      z-index: 1000;
      color: #dc2626;
      font-weight: 500;
    ">
      ⚠️ ${message}
      <button onclick="document.getElementById('error-banner').remove()" style="
        margin-left: 1rem;
        background: none;
        border: none;
        color: #dc2626;
        cursor: pointer;
        font-weight: bold;
      ">×</button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', errorHTML);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    const banner = document.getElementById('error-banner');
    if (banner) banner.remove();
  }, 10000);
}

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const searchInput = document.getElementById('search-player');
const sortSelect = document.getElementById('sort-by');
const tableBody = document.getElementById('table-body');
const totalPlayersEl = document.getElementById('total-players');
const totalMatchesEl = document.getElementById('total-matches');
const currentLeaderEl = document.getElementById('current-leader');

// Initialize the application
window.initializeApp = function() {
  cargarPartidas();
  initializeNavigation();
  initializeTable();
  updateStats();
  initializeScrollEffects();
  setupAPIRefresh();
};

// Setup API refresh functionality
function setupAPIRefresh() {
  // Add refresh button to the page
  const refreshButton = document.createElement('button');
  refreshButton.innerHTML = '🔄 Actualizar Datos';
  refreshButton.className = 'refresh-btn';
  refreshButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s ease;
    z-index: 1000;
  `;
  
  refreshButton.addEventListener('click', async () => {
    refreshButton.innerHTML = '⏳ Actualizando...';
    refreshButton.disabled = true;
    
    try {
      // Clear API cache
      window.tournamentAPI.clearAllCaches();
      
      // Reload data
      await initializeDataFromAPI();
      
      refreshButton.innerHTML = '✅ Actualizado';
      setTimeout(() => {
        refreshButton.innerHTML = '🔄 Actualizar Datos';
        refreshButton.disabled = false;
      }, 2000);
      
    } catch (error) {
      refreshButton.innerHTML = '❌ Error';
      setTimeout(() => {
        refreshButton.innerHTML = '🔄 Actualizar Datos';
        refreshButton.disabled = false;
      }, 2000);
    }
  });
  
  document.body.appendChild(refreshButton);
  
  // Auto-refresh every 5 minutes if API is available
  setInterval(async () => {
    const isHealthy = await window.tournamentAPI.checkHealth();
    if (isHealthy) {
      console.log('🔄 Auto-refreshing data...');
      window.tournamentAPI.clearAllCaches();
      await initializeDataFromAPI();
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Navigation functionality
function initializeNavigation() {
  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 70; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Update active navigation link on scroll
  window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// Table functionality
function initializeTable() {
  if (!tableBody) return;
  
  renderTable(tournamentData.players);
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      const searchTerm = this.value.toLowerCase();
      const filteredPlayers = tournamentData.players.filter(player =>
        player.name.toLowerCase().includes(searchTerm)
      );
      renderTable(filteredPlayers);
    }, 300));
  }

  // Sort functionality
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      const sortBy = this.value;
      const sortedPlayers = [...tournamentData.players].sort((a, b) => {
        switch (sortBy) {
          case 'points':
            return b.points - a.points;
          case 'wins':
            return b.wins - a.wins;
          case 'matches':
            return b.matches - a.matches;
          default:
            return b.points - a.points;
        }
      });
      renderTable(sortedPlayers);
    });
  }
}

function renderTable(players) {
  if (!tableBody) return;
  
  // Sort players by points for position calculation
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  
  tableBody.innerHTML = '';
  
  if (sortedPlayers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          No hay jugadores disponibles
        </td>
      </tr>
    `;
    return;
  }
  
  sortedPlayers.forEach((player, index) => {
    const position = index + 1;
    const ratio = player.matches > 0 ? (player.wins / player.matches * 100).toFixed(1) : '0.0';
    const ratioClass = getRatioClass(parseFloat(ratio));
    const positionClass = getPositionClass(position);
    
    const row = document.createElement('tr');
    row.className = positionClass;
    row.innerHTML = `
      <td><strong>${position}</strong></td>
      <td class="player-name">${player.name}</td>
      <td>${player.matches}</td>
      <td>${player.wins}</td>
      <td><strong>${player.points}</strong></td>
      <td class="${ratioClass}">${ratio}%</td>
      <td>
        <button class="view-profile-btn" onclick="openPlayerProfileFromTable('${player.id}')">
          Ver Perfil
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function getRatioClass(ratio) {
  if (ratio >= 70) return 'ratio-good';
  if (ratio >= 40) return 'ratio-average';
  return 'ratio-poor';
}

function getPositionClass(position) {
  switch (position) {
    case 1: return 'position-1';
    case 2: return 'position-2';
    case 3: return 'position-3';
    default: return '';
  }
}

// Function to open player profile from table
function openPlayerProfileFromTable(playerId) {
  // This will be called by the player profile manager
  if (window.playerProfileManager) {
    window.playerProfileManager.openPlayerProfile(playerId);
  }
}

// Statistics update
async function updateStats() {
  try {
    // Try to get fresh stats from API
    const statsResponse = await window.tournamentAPI.getTournamentStats();
    
    if (statsResponse.success) {
      const stats = statsResponse.data;
      
      if (totalPlayersEl) totalPlayersEl.textContent = stats.overview.totalPlayers;
      if (totalMatchesEl) totalMatchesEl.textContent = stats.overview.totalMatches;
      if (currentLeaderEl) currentLeaderEl.textContent = stats.overview.currentLeader?.name || 'N/A';
      
      // Update best performers
      const bestEconomyEl = document.getElementById('best-economy');
      const bestMilitaryEl = document.getElementById('best-military');
      
      if (bestEconomyEl && stats.bestPerformers.economy) {
        bestEconomyEl.textContent = stats.bestPerformers.economy.categoryStats?.economy?.average?.toFixed(1) || 'N/A';
      }
      
      if (bestMilitaryEl && stats.bestPerformers.military) {
        bestMilitaryEl.textContent = stats.bestPerformers.military.categoryStats?.military?.average?.toFixed(1) || 'N/A';
      }
      
    } else {
      // Fallback to local calculation
      updateStatsFromLocalData();
    }
  } catch (error) {
    console.warn('Could not fetch stats from API, using local data:', error);
    updateStatsFromLocalData();
  }
}

function updateStatsFromLocalData() {
  const totalPlayers = tournamentData.players.length;
  const totalMatches = Math.floor(tournamentData.players.reduce((sum, player) => sum + player.matches, 0) / 2);
  const leader = [...tournamentData.players].sort((a, b) => b.points - a.points)[0];
  
  if (totalPlayersEl) totalPlayersEl.textContent = totalPlayers;
  if (totalMatchesEl) totalMatchesEl.textContent = totalMatches;
  if (currentLeaderEl) currentLeaderEl.textContent = leader?.name || 'N/A';
}

// Scroll effects
function initializeScrollEffects() {
  // Navbar background on scroll
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
      }
    }
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.stats-card, .match-card, .table-container, .player-card').forEach(el => {
    observer.observe(el);
  });
}

// Utility functions
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

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
  // Initialize data loading
  initializeDataFromAPI();
  
  // Add click effects to cards
  document.querySelectorAll('.stats-card, .match-card, .player-card').forEach(card => {
    card.addEventListener('click', function() {
      this.style.transform = 'scale(0.98)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });

  // Add keyboard navigation support
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (navMenu) navMenu.classList.remove('active');
      if (navToggle) navToggle.classList.remove('active');
    }
  });
});

// Enhanced Tournament App API
window.TournamentApp = {
  // Update player data
  updatePlayerData: function(newData) {
    tournamentData.players = newData;
    renderTable(tournamentData.players);
    updateStats();
  },
  
  // Add match via API
  addMatch: async function(matchData) {
    try {
      const result = await window.tournamentAPI.createMatch(matchData);
      if (result.success) {
        console.log('✅ Match added successfully');
        // Refresh data
        await initializeDataFromAPI();
        return result;
      } else {
        throw new Error(result.error || 'Failed to add match');
      }
    } catch (error) {
      console.error('❌ Error adding match:', error);
      throw error;
    }
  },

  // Get player stats
  getPlayerStats: async function(playerId) {
    try {
      const result = await window.tournamentAPI.getPlayerStats(playerId);
      return result.success ? result.data : null;
    } catch (error) {
      console.error('❌ Error getting player stats:', error);
      return tournamentData.players.find(p => p.id === playerId);
    }
  },

  // Simulate match for testing
  simulateMatch: async function(playerIds, mapName = 'Random Map') {
    try {
      const result = await window.tournamentAPI.simulateMatch(playerIds, mapName);
      if (result.success) {
        console.log('✅ Match simulated successfully');
        // Refresh data
        await initializeDataFromAPI();
        return result;
      } else {
        throw new Error(result.error || 'Failed to simulate match');
      }
    } catch (error) {
      console.error('❌ Error simulating match:', error);
      throw error;
    }
  },

  // Refresh all data
  refreshData: async function() {
    window.tournamentAPI.clearAllCaches();
    await initializeDataFromAPI();
  },

  // Get API health status
  getAPIStatus: async function() {
    return await window.tournamentAPI.checkHealth();
  }
};

// Make functions globally available
window.openPlayerProfileFromTable = openPlayerProfileFromTable;