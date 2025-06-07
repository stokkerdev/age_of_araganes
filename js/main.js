let tournamentData = { players: [] };

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    tournamentData.players = data.players;
    playersData.players = data.players;

    // Iniciar la lógica después de que se hayan cargado los datos
    if (window.initializeApp) initializeApp();
    if (window.initializeProfiles) initializeProfiles();
  });


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
/* document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeTable();
  updateStats();
  initializeScrollEffects();
}); */


window.initializeApp = function() {
  initializeNavigation();
  initializeTable();
  updateStats();
  initializeScrollEffects();
};


// Navigation functionality
function initializeNavigation() {
  // Mobile menu toggle
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
  renderTable(tournamentData.players);
  
  // Search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredPlayers = tournamentData.players.filter(player =>
      player.name.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredPlayers);
  });

  // Sort functionality
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
        case 'average':
          const avgA = calculateTotalAverage(a);
          const avgB = calculateTotalAverage(b);
          return avgB - avgA;
        default:
          return b.points - a.points;
      }
    });
    renderTable(sortedPlayers);
  });
}

function renderTable(players) {
  // Sort players by points for position calculation
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  
  tableBody.innerHTML = '';
  
  sortedPlayers.forEach((player, index) => {
    const position = index + 1;
    const ratio = player.matches > 0 ? (player.wins / player.matches * 100).toFixed(1) : '0.0';
    const ratioClass = getRatioClass(parseFloat(ratio));
    const positionClass = getPositionClass(position);
    const totalAverage = calculateTotalAverage(player);
    
    const row = document.createElement('tr');
    row.className = positionClass;
    row.innerHTML = `
      <td><strong>${position}</strong></td>
      <td class="player-name">${player.name}</td>
      <td>${player.matches}</td>
      <td>${player.wins}</td>
      <td><strong>${player.points}</strong></td>
      <td><strong>${totalAverage.toFixed(1)}</strong></td>
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

function calculateTotalAverage(player) {
  const stats = player.categoryStats;
  return (stats.military.average + stats.economy.average + stats.technology.average + stats.society.average) / 4;
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
function updateStats() {
  const totalPlayers = tournamentData.players.length;
  const totalMatches = tournamentData.players.reduce((sum, player) => sum + player.matches, 0) / 2;
  const leader = [...tournamentData.players].sort((a, b) => b.points - a.points)[0];
  
  totalPlayersEl.textContent = totalPlayers;
  totalMatchesEl.textContent = Math.floor(totalMatches);
  currentLeaderEl.textContent = leader.name;
}

// Scroll effects
function initializeScrollEffects() {
  // Navbar background on scroll
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
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
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
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
  
  addMatch: function(player1, player2, winner, scores) {
    // Find players and update their stats
    const p1 = tournamentData.players.find(p => p.name === player1);
    const p2 = tournamentData.players.find(p => p.name === player2);
    
    if (p1 && p2 && scores) {
      p1.matches++;
      p2.matches++;
      
      // Update category stats for both players
      Object.keys(scores.player1).forEach(category => {
        p1.categoryStats[category].total += scores.player1[category];
        p1.categoryStats[category].matches++;
        p1.categoryStats[category].average = p1.categoryStats[category].total / p1.categoryStats[category].matches;
      });
      
      Object.keys(scores.player2).forEach(category => {
        p2.categoryStats[category].total += scores.player2[category];
        p2.categoryStats[category].matches++;
        p2.categoryStats[category].average = p2.categoryStats[category].total / p2.categoryStats[category].matches;
      });
      
      if (winner === player1) {
        p1.wins++;
        p1.points += 3;
        p2.losses++;
      } else if (winner === player2) {
        p2.wins++;
        p2.points += 3;
        p1.losses++;
      }
      
      renderTable(tournamentData.players);
      updateStats();
    }
  },

  getPlayerStats: function(playerId) {
    return tournamentData.players.find(p => p.id === playerId);
  }
};