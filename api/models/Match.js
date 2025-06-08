const mongoose = require('mongoose');

const playerScoreSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  playerName: { type: String, required: true },
  scores: {
    military: { type: Number, required: true, min: 0, max: 100 },
    economy: { type: Number, required: true, min: 0, max: 100 },
    technology: { type: Number, required: true, min: 0, max: 100 },
    society: { type: Number, required: true, min: 0, max: 100 }
  },
  totalScore: { type: Number, required: true },
  position: { type: Number, required: true, min: 1 },
  points: { type: Number, required: true, min: 0 }
}, { _id: false });

const matchSchema = new mongoose.Schema({
  matchId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  duration: { 
    type: String, 
    required: true 
  },
  mapName: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  gameMode: { 
    type: String, 
    enum: ['FFA', 'Team', '1v1'], 
    default: 'FFA' 
  },
  players: [playerScoreSchema],
  winner: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['completed', 'in_progress', 'cancelled'], 
    default: 'completed' 
  },
  notes: { 
    type: String, 
    maxlength: 500 
  },
  tournamentPhase: { 
    type: String, 
    default: 'regular_season' 
  }
}, {
  timestamps: true
});

// Index for better query performance
matchSchema.index({ date: -1 });
matchSchema.index({ winner: 1 });
matchSchema.index({ 'players.playerId': 1 });
matchSchema.index({ status: 1 });

// Pre-save middleware to calculate total scores
matchSchema.pre('save', function(next) {
  this.players.forEach(player => {
    const scores = player.scores;
    player.totalScore = scores.military + scores.economy + scores.technology + scores.society;
  });
  
  // Sort players by total score (descending) and assign positions
  this.players.sort((a, b) => b.totalScore - a.totalScore);
  this.players.forEach((player, index) => {
    player.position = index + 1;
    // Assign points based on position (N-1 for winner, N-2 for second, etc.)
    player.points = Math.max(0, this.players.length - player.position);
  });
  
  next();
});

module.exports = mongoose.model('Match', matchSchema);