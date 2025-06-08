const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// GET /api/players - Get all players
router.get('/', async (req, res) => {
  try {
    const { sort = 'points', order = 'desc', status, search } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { favoriteStrategy: { $regex: search, $options: 'i' } },
        { favoriteCivilization: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort configuration
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sort] = sortOrder;
    
    const players = await Player.find(query)
      .sort(sortObj)
      .select('-__v')
      .lean();
    
    // Add calculated fields
    const playersWithCalculations = players.map((player, index) => ({
      ...player,
      rank: index + 1,
      winRate: player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0',
      totalAverage: ((
        player.categoryStats.military.average +
        player.categoryStats.economy.average +
        player.categoryStats.technology.average +
        player.categoryStats.society.average
      ) / 4).toFixed(1)
    }));
    
    res.json({
      success: true,
      count: playersWithCalculations.length,
      data: playersWithCalculations
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching players',
      message: error.message
    });
  }
});

// GET /api/players/:id - Get specific player
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findOne({ id: req.params.id })
      .select('-__v')
      .lean();
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    // Add calculated fields
    const playerWithCalculations = {
      ...player,
      winRate: player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0',
      totalAverage: ((
        player.categoryStats.military.average +
        player.categoryStats.economy.average +
        player.categoryStats.technology.average +
        player.categoryStats.society.average
      ) / 4).toFixed(1)
    };
    
    res.json({
      success: true,
      data: playerWithCalculations
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching player',
      message: error.message
    });
  }
});

// POST /api/players - Create new player
router.post('/', async (req, res) => {
  try {
    const playerData = req.body;
    
    // Check if player already exists
    const existingPlayer = await Player.findOne({ 
      $or: [
        { id: playerData.id },
        { name: playerData.name }
      ]
    });
    
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: 'Player already exists'
      });
    }
    
    const player = new Player(playerData);
    await player.save();
    
    res.status(201).json({
      success: true,
      data: player,
      message: 'Player created successfully'
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(400).json({
      success: false,
      error: 'Error creating player',
      message: error.message
    });
  }
});

// PUT /api/players/:id - Update player
router.put('/:id', async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    res.json({
      success: true,
      data: player,
      message: 'Player updated successfully'
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(400).json({
      success: false,
      error: 'Error updating player',
      message: error.message
    });
  }
});

// DELETE /api/players/:id - Delete player
router.delete('/:id', async (req, res) => {
  try {
    const player = await Player.findOneAndDelete({ id: req.params.id });
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting player',
      message: error.message
    });
  }
});

// GET /api/players/:id/stats - Get player statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const player = await Player.findOne({ id: req.params.id });
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    const stats = {
      basic: {
        matches: player.matches,
        wins: player.wins,
        losses: player.losses,
        draws: player.draws,
        points: player.points,
        winRate: player.winRate,
        totalAverage: player.totalAverage
      },
      categories: player.categoryStats,
      recentMatches: player.matchHistory.slice(-5),
      performance: {
        bestCategory: Object.entries(player.categoryStats)
          .reduce((best, [key, value]) => 
            value.average > best.average ? { name: key, ...value } : best
          ),
        worstCategory: Object.entries(player.categoryStats)
          .reduce((worst, [key, value]) => 
            value.average < worst.average ? { name: key, ...value } : worst
          )
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching player stats',
      message: error.message
    });
  }
});

module.exports = router;