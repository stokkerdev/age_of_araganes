const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Player = require('../models/Player');

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 50, 
      page = 1, 
      sort = 'date', 
      order = 'desc',
      status,
      player 
    } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by player
    if (player) {
      query['players.playerId'] = player;
    }
    
    // Sort configuration
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sort] = sortOrder;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const matches = await Match.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v')
      .lean();
    
    const total = await Match.countDocuments(query);
    
    res.json({
      success: true,
      count: matches.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: matches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching matches',
      message: error.message
    });
  }
});

// GET /api/matches/:id - Get specific match
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findOne({ matchId: req.params.id })
      .select('-__v')
      .lean();
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching match',
      message: error.message
    });
  }
});

// POST /api/matches - Create new match and update player stats
router.post('/', async (req, res) => {
  try {
    const matchData = req.body;
    
    // Create the match
    const match = new Match(matchData);
    await match.save();
    
    // Update player statistics
    for (const playerData of match.players) {
      const player = await Player.findOne({ id: playerData.playerId });
      
      if (player) {
        // Update basic stats
        if (playerData.position === 1) {
          player.wins += 1;
        } else {
          player.losses += 1;
        }
        player.points += playerData.points;
        
        // Update category stats
        Object.keys(playerData.scores).forEach(category => {
          const score = playerData.scores[category];
          const categoryStats = player.categoryStats[category];
          
          categoryStats.total += score;
          categoryStats.matches += 1;
          categoryStats.average = categoryStats.total / categoryStats.matches;
          
          if (score > categoryStats.best) {
            categoryStats.best = score;
          }
        });
        
        // Add to match history
        const opponentNames = match.players
          .filter(p => p.playerId !== playerData.playerId)
          .map(p => p.playerName)
          .join(', ');
        
        player.matchHistory.push({
          matchId: match._id,
          opponent: opponentNames,
          result: playerData.position === 1 ? 'win' : 'loss',
          date: match.date,
          duration: match.duration,
          scores: playerData.scores,
          totalScore: playerData.totalScore
        });
        
        // Keep only last 20 matches in history
        if (player.matchHistory.length > 20) {
          player.matchHistory = player.matchHistory.slice(-20);
        }
        
        await player.save();
      }
    }
    
    res.status(201).json({
      success: true,
      data: match,
      message: 'Match created and player stats updated successfully'
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(400).json({
      success: false,
      error: 'Error creating match',
      message: error.message
    });
  }
});

// PUT /api/matches/:id - Update match
router.put('/:id', async (req, res) => {
  try {
    const match = await Match.findOneAndUpdate(
      { matchId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      data: match,
      message: 'Match updated successfully'
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(400).json({
      success: false,
      error: 'Error updating match',
      message: error.message
    });
  }
});

// DELETE /api/matches/:id - Delete match
router.delete('/:id', async (req, res) => {
  try {
    const match = await Match.findOneAndDelete({ matchId: req.params.id });
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting match',
      message: error.message
    });
  }
});

// GET /api/matches/stats/summary - Get match statistics summary
router.get('/stats/summary', async (req, res) => {
  try {
    const totalMatches = await Match.countDocuments({ status: 'completed' });
    
    const longestMatch = await Match.findOne({ status: 'completed' })
      .sort({ duration: -1 })
      .select('duration players.playerName winner')
      .lean();
    
    const shortestMatch = await Match.findOne({ status: 'completed' })
      .sort({ duration: 1 })
      .select('duration players.playerName winner')
      .lean();
    
    const recentMatches = await Match.find({ status: 'completed' })
      .sort({ date: -1 })
      .limit(5)
      .select('date players.playerName winner duration')
      .lean();
    
    res.json({
      success: true,
      data: {
        totalMatches,
        longestMatch,
        shortestMatch,
        recentMatches
      }
    });
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching match stats',
      message: error.message
    });
  }
});

module.exports = router;