const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Match = require('../models/Match');

// GET /api/tournament/stats - Get tournament statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments({ status: 'active' });
    const totalMatches = await Match.countDocuments({ status: 'completed' });
    
    // Get current leader
    const leader = await Player.findOne({ status: 'active' })
      .sort({ points: -1 })
      .select('name points')
      .lean();
    
    // Get best performers by category
    const bestMilitary = await Player.findOne({ status: 'active' })
      .sort({ 'categoryStats.military.average': -1 })
      .select('name categoryStats.military.average')
      .lean();
    
    const bestEconomy = await Player.findOne({ status: 'active' })
      .sort({ 'categoryStats.economy.average': -1 })
      .select('name categoryStats.economy.average')
      .lean();
    
    const bestTechnology = await Player.findOne({ status: 'active' })
      .sort({ 'categoryStats.technology.average': -1 })
      .select('name categoryStats.technology.average')
      .lean();
    
    const bestSociety = await Player.findOne({ status: 'active' })
      .sort({ 'categoryStats.society.average': -1 })
      .select('name categoryStats.society.average')
      .lean();
    
    // Get best win rate
    const playersWithWinRate = await Player.aggregate([
      { $match: { status: 'active', matches: { $gte: 3 } } },
      {
        $addFields: {
          winRate: {
            $cond: {
              if: { $eq: ['$matches', 0] },
              then: 0,
              else: { $multiply: [{ $divide: ['$wins', '$matches'] }, 100] }
            }
          }
        }
      },
      { $sort: { winRate: -1 } },
      { $limit: 1 },
      { $project: { name: 1, winRate: 1 } }
    ]);
    
    const bestWinRate = playersWithWinRate[0] || null;
    
    // Get match statistics
    const matchStats = await Match.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          longestDuration: { $max: '$duration' },
          shortestDuration: { $min: '$duration' },
          avgPlayersPerMatch: { $avg: { $size: '$players' } }
        }
      }
    ]);
    
    const longestMatch = await Match.findOne({ status: 'completed' })
      .sort({ duration: -1 })
      .select('duration winner players.playerName')
      .lean();
    
    const shortestMatch = await Match.findOne({ status: 'completed' })
      .sort({ duration: 1 })
      .select('duration winner players.playerName')
      .lean();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalPlayers,
          totalMatches,
          currentLeader: leader,
          tournamentPhase: 'Fase 1'
        },
        bestPerformers: {
          military: bestMilitary,
          economy: bestEconomy,
          technology: bestTechnology,
          society: bestSociety,
          winRate: bestWinRate
        },
        matchStats: {
          longest: longestMatch,
          shortest: shortestMatch,
          statistics: matchStats[0] || {}
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tournament stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tournament stats',
      message: error.message
    });
  }
});

// GET /api/tournament/leaderboard - Get tournament leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await Player.find({ status: 'active' })
      .sort({ points: -1, wins: -1, matches: 1 })
      .limit(parseInt(limit))
      .select('id name points wins losses matches categoryStats')
      .lean();
    
    // Add calculated fields and rankings
    const leaderboardWithRankings = leaderboard.map((player, index) => ({
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
      count: leaderboardWithRankings.length,
      data: leaderboardWithRankings
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching leaderboard',
      message: error.message
    });
  }
});

// GET /api/tournament/recent-matches - Get recent matches
router.get('/recent-matches', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentMatches = await Match.find({ status: 'completed' })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .select('matchId date duration winner players mapName')
      .lean();
    
    res.json({
      success: true,
      count: recentMatches.length,
      data: recentMatches
    });
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching recent matches',
      message: error.message
    });
  }
});

// POST /api/tournament/simulate-match - Simulate a match (for testing)
router.post('/simulate-match', async (req, res) => {
  try {
    const { playerIds, mapName = 'Random Map' } = req.body;
    
    if (!playerIds || playerIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 players required for a match'
      });
    }
    
    // Get players
    const players = await Player.find({ id: { $in: playerIds } });
    
    if (players.length !== playerIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more players not found'
      });
    }
    
    // Generate random scores for simulation
    const matchPlayers = players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      scores: {
        military: Math.floor(Math.random() * 40) + 60, // 60-100
        economy: Math.floor(Math.random() * 40) + 60,  // 60-100
        technology: Math.floor(Math.random() * 40) + 60, // 60-100
        society: Math.floor(Math.random() * 40) + 60    // 60-100
      }
    }));
    
    // Calculate total scores and determine winner
    matchPlayers.forEach(player => {
      const scores = player.scores;
      player.totalScore = scores.military + scores.economy + scores.technology + scores.society;
    });
    
    // Sort by total score to determine positions
    matchPlayers.sort((a, b) => b.totalScore - a.totalScore);
    
    const winner = matchPlayers[0].playerName;
    
    // Create match
    const match = new Match({
      matchId: `match_${Date.now()}`,
      date: new Date(),
      duration: `${Math.floor(Math.random() * 60) + 20}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      mapName,
      gameMode: 'FFA',
      players: matchPlayers,
      winner,
      status: 'completed',
      notes: 'Simulated match for testing'
    });
    
    await match.save();
    
    // Update player stats (this is handled by the pre-save middleware and the match creation route)
    // But we need to manually update here since we're simulating
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
        
        await player.save();
      }
    }
    
    res.status(201).json({
      success: true,
      data: match,
      message: 'Match simulated successfully'
    });
  } catch (error) {
    console.error('Error simulating match:', error);
    res.status(500).json({
      success: false,
      error: 'Error simulating match',
      message: error.message
    });
  }
});

module.exports = router;