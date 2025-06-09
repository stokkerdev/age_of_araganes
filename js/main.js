let tournamentData = { players: [] };

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Cargar datos usando el DataManager
    if (!window.dataManager.isLoaded) {
      const data = await window.dataManager.loadAllData();
      tournamentData.players = data.players;
    } else {
      tournamentData.players = window.dataManager.getPlayers();
    }
    
    console.log("Datos cargados correctamente:", tournamentData.players);
    
    // Inicializar componentes
    initializeNavigation();
    initializeTable();
    updateStats();
    initializeScrollEffects();
    cargarPartidas();
    
    // Escuchar actualizaciones de datos
    window.addEventListener('tournamentDataUpdated', (event) => {
      tournamentData.players = event.detail.players;
      renderTable(tournamentData.players);
      updateStats();
    });
    
  } catch (error) {
    console.error("Error al cargar el sistema:", error);
  }
});

async function cargarPartidas() {
  try {
    const resp = await fetch('data/matches.json');
    if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);

    const partidas = await resp.json();
    console.log('Partidas programadas cargadas:', partidas);
    const grid = document.querySelector('.matches-grid');
    
    // Limpiar contenido existente
    grid.innerHTML = '';

    if (partidas.length === 0) {
      grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-style: italic;">No hay partidas programadas</p>';
      return;
    }

    partidas.forEach(p => {
      const card = document.createElement('div');
      card.className = 'match-card';

      // Fecha
      const dateDiv = document.createElement('div');
      dateDiv.className = 'match-date';
      dateDiv.textContent = formatearFecha(p.date);

      // Jugadores
      const playersDiv = document.createElement('div');
      playersDiv.className = 'match-players';

      p.players.forEach((player, index) => {
        const span = document.createElement('span');
        span.className = 'player';
        span.textContent = player;
        playersDiv.appendChild(span);
        if (index < p.players.length - 1) {
          const vs = document.createElement('span');
          vs.className = 'vs';
          vs.textContent = 'VS';
          playersDiv.appendChild(vs);
        }
      });

      // Hora
      const timeDiv = document.createElement('div');
      timeDiv.className = 'match-time';
      timeDiv.textContent = formatearHora(p.time);

      // Ensamblar tarjeta
      card.appendChild(dateDiv);
      card.appendChild(playersDiv);
      card.appendChild(timeDiv);
      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Error cargando partidas programadas:', err);
    const grid = document.querySelector('.matches-grid');
    grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Error cargando partidas programadas</p>';
  }
}

function formatearFecha(fecha) {
  const [a, m, d] = fecha.split('-');
  return `${d}-${m}-${a}`;
}

function formatearHora(hora24) {
  const [h, m] = hora24.split(':');
  let h12 = +h % 12 || 12;
  let ampm = +h >= 12 ? 'PM' : 'AM';
  return `${h12}:${m} ${ampm}`;
}

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const searchInput = document.getElementById('search-player');
const sortSelect = document.getElementById('sort-by');
const tableBody = document.getElementById('table-body');

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
  if (!tournamentData.players.length) return;
  
  renderTable(tournamentData.players);
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const filteredPlayers = tournamentData.players.filter(player =>
        player.name.toLowerCase().includes(searchTerm)
      );
      renderTable(filteredPlayers);
    });
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
  if (window.playerProfileManager) {
    window.playerProfileManager.openPlayerProfile(playerId);
  }
}

// Statistics update
function updateStats() {
  if (!tournamentData.players.length) return;
  
  try {
    const stats = window.dataManager ? window.dataManager.getTournamentStats() : getBasicStats();
    
    // Actualizar elementos del DOM
    const elements = {
      'total-players': stats.totalPlayers,
      'total-matches': stats.totalMatches,
      'current-leader': stats.leader ? stats.leader.name : '--',
      'leader-points': stats.leader ? `${stats.leader.points} puntos` : '-- puntos'
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Actualizar ratio si hay datos
    if (stats.bestRatio && stats.bestRatio.matches > 0) {
      const ratio = ((stats.bestRatio.wins / stats.bestRatio.matches) * 100).toFixed(1);
      const bestRatioEl = document.getElementById('best-ratio');
      const bestRatioPlayerEl = document.getElementById('best-ratio-player');
      
      if (bestRatioEl) bestRatioEl.textContent = `${ratio}%`;
      if (bestRatioPlayerEl) bestRatioPlayerEl.textContent = stats.bestRatio.name;
    }

  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
  }
}

function getBasicStats() {
  const totalPlayers = tournamentData.players.length;
  const totalMatches = Math.floor(tournamentData.players.reduce((sum, player) => sum + player.matches, 0) / 2);
  const leader = [...tournamentData.players].sort((a, b) => b.points - a.points)[0];
  const bestRatio = tournamentData.players
    .filter(p => p.matches > 0)
    .reduce((best, player) => {
      const ratio = (player.wins / player.matches) * 100;
      const bestRatio = best.matches > 0 ? (best.wins / best.matches) * 100 : 0;
      return ratio > bestRatio ? player : best;
    }, { matches: 0 });

  return {
    totalPlayers,
    totalMatches,
    leader,
    bestRatio: bestRatio.matches > 0 ? bestRatio : null
  };
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

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
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

// Export functions for potential future use
window.TournamentApp = {
  updatePlayerData: function(newData) {
    tournamentData.players = newData;
    renderTable(tournamentData.players);
    updateStats();
  },
  
  getPlayerStats: function(playerId) {
    return tournamentData.players.find(p => p.id === playerId);
  },

  refreshData: async function() {
    try {
      const data = await window.dataManager.loadAllData();
      tournamentData.players = data.players;
      renderTable(tournamentData.players);
      updateStats();
      console.log('Datos actualizados desde el servidor');
    } catch (error) {
      console.error('Error actualizando datos:', error);
    }
  }
};