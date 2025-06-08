const mongoose = require('mongoose');

const categoryStatsSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  best: { type: Number, default: 0 }
}, { _id: false });

const matchHistorySchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  opponent: { type: String, required: true },
  result: { type: String, enum: ['win', 'loss', 'draw'], required: true },
  date: { type: Date, required: true },
  duration: { type: String, required: true },
  scores: {
    military: { type: Number, required: true },
    economy: { type: Number, required: true },
    technology: { type: Number, required: true },
    society: { type: Number, required: true }
  },
  totalScore: { type: Number, required: true }
}, { _id: false });

const playerSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
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
  losses: { 
    type: Number, 
    default: 0,
    min: 0
  },
  draws: { 
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
  matchHistory: [matchHistorySchema],
  lastActive: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for win rate
playerSchema.virtual('winRate').get(function() {
  if (this.matches === 0) return 0;
  return ((this.wins / this.matches) * 100).toFixed(1);
});

// Virtual for total average score
playerSchema.virtual('totalAverage').get(function() {
  const stats = this.categoryStats;
  const total = stats.military.average + stats.economy.average + 
                stats.technology.average + stats.society.average;
  return (total / 4).toFixed(1);
});

// Index for better query performance
playerSchema.index({ points: -1 });
playerSchema.index({ wins: -1 });
playerSchema.index({ status: 1 });
playerSchema.index({ 'categoryStats.military.average': -1 });
playerSchema.index({ 'categoryStats.economy.average': -1 });

// Pre-save middleware to update calculated fields
playerSchema.pre('save', function(next) {
  // Update total matches
  this.matches = this.wins + this.losses + this.draws;
  
  // Update category averages
  Object.keys(this.categoryStats).forEach(category => {
    const stat = this.categoryStats[category];
    if (stat.matches > 0) {
      stat.average = stat.total / stat.matches;
    }
  });
  
  this.lastActive = new Date();
  next();
});

module.exports = mongoose.model('Player', playerSchema);