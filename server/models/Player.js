const mongoose = require('mongoose');

const categoryStatsSchema = new mongoose.Schema({
  worst: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  best: { type: Number, default: 0 }
}, { _id: false });

const matchHistorySchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  date: { type: Date, required: true },
  map: { type: String, required: true },
  duration: { type: String, required: true },
  position: { type: Number, required: true },
  totalPlayers: { type: Number, required: true },
  scores: {
    military: { type: Number, required: true },
    economy: { type: Number, required: true },
    technology: { type: Number, required: true },
    society: { type: Number, required: true }
  },
  totalScore: { type: Number, required: true },
  opponents: [{ type: String }]
}, { _id: false });

const playerSchema = new mongoose.Schema({
  playerId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  matches: { 
    type: Number, 
    default: 0,
    min: 0
  },
  wins: { 
    type: Number, 
    default: 0,
    min: 0
  },
  points: { 
    type: Number, 
    default: 0,
    min: 0
  },
  joinDate: { 
    type: Date, 
    default: Date.now 
  },
  favoriteStrategy: { 
    type: String, 
    default: 'none',
    maxlength: 100
  },
  favoriteCivilization: { 
    type: String, 
    default: 'none',
    maxlength: 50
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  categoryStats: {
    military: { type: categoryStatsSchema, default: () => ({}) },
    economy: { type: categoryStatsSchema, default: () => ({}) },
    technology: { type: categoryStatsSchema, default: () => ({}) },
    society: { type: categoryStatsSchema, default: () => ({}) }
  },
  matchHistory: [matchHistorySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular ratio de victorias
playerSchema.virtual('winRatio').get(function() {
  return this.matches > 0 ? (this.wins / this.matches * 100).toFixed(1) : '0.0';
});

// Virtual para calcular promedio total
playerSchema.virtual('totalAverage').get(function() {
  const stats = this.categoryStats;
  return (stats.military.average + stats.economy.average + 
          stats.technology.average + stats.society.average) / 4;
});

// Índices para optimizar consultas
playerSchema.index({ points: -1 });
playerSchema.index({ playerId: 1 });
playerSchema.index({ status: 1 });

// Middleware pre-save para validaciones
playerSchema.pre('save', function(next) {
  // Asegurar que wins no sea mayor que matches
  if (this.wins > this.matches) {
    this.wins = this.matches;
  }
  next();
});

// Método para actualizar estadísticas después de una partida
playerSchema.methods.updateStatsFromMatch = function(matchData) {
  this.matches += 1;
  
  // Actualizar estadísticas por categoría
  Object.keys(matchData.scores).forEach(category => {
    const score = matchData.scores[category];
    const categoryStats = this.categoryStats[category];
    
    // Actualizar peor, mejor y promedio
    if (categoryStats.worst === 0 || score < categoryStats.worst) {
      categoryStats.worst = score;
    }
    if (score > categoryStats.best) {
      categoryStats.best = score;
    }
    
    // Calcular nuevo promedio
    const currentTotal = categoryStats.average * (this.matches - 1);
    categoryStats.average = (currentTotal + score) / this.matches;
  });
  
  // Actualizar puntos según posición
  const totalPlayers = matchData.totalPlayers;
  const points = totalPlayers - matchData.position;
  this.points += points;
  
  // Si ganó (posición 1), incrementar victorias
  if (matchData.position === 1) {
    this.wins += 1;
  }
};

module.exports = mongoose.model('Player', playerSchema);