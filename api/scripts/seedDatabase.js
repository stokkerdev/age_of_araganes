const mongoose = require('mongoose');
const Player = require('../models/Player');
const Match = require('../models/Match');
require('dotenv').config();

// Sample data
const samplePlayers = [
  {
    id: "stokker",
    name: "Stokker",
    avatar: "src/pics/stokker.jpg",
    favoriteStrategy: "Rush económico",
    favoriteCivilization: "Francos",
    status: "active"
  },
  {
    id: "kylecher",
    name: "Kylecher",
    avatar: "",
    favoriteStrategy: "Defensa y contraataque",
    favoriteCivilization: "Bizantinos",
    status: "active"
  },
  {
    id: "nicoz",
    name: "NicoZ",
    avatar: "",
    favoriteStrategy: "Boom económico",
    favoriteCivilization: "Mayas",
    status: "active"
  },
  {
    id: "gato_alado",
    name: "Gato Alado",
    avatar: "",
    favoriteStrategy: "Rush militar",
    favoriteCivilization: "Mongoles",
    status: "active"
  },
  {
    id: "cairbus",
    name: "Cairbus",
    avatar: "",
    favoriteStrategy: "Estrategia mixta",
    favoriteCivilization: "Británicos",
    status: "active"
  },
  {
    id: "artibool",
    name: "Artibool",
    avatar: "",
    favoriteStrategy: "Tecnología avanzada",
    favoriteCivilization: "Coreanos",
    status: "active"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/age-of-araganes');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Player.deleteMany({});
    await Match.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create players
    const createdPlayers = await Player.insertMany(samplePlayers);
    console.log(`👥 Created ${createdPlayers.length} players`);

    // Create some sample matches
    const sampleMatches = [
      {
        matchId: "match_001",
        date: new Date('2025-01-01'),
        duration: "45:30",
        mapName: "Arabia",
        gameMode: "FFA",
        players: [
          {
            playerId: "stokker",
            playerName: "Stokker",
            scores: { military: 85, economy: 78, technology: 82, society: 75 },
            totalScore: 320,
            position: 1,
            points: 5
          },
          {
            playerId: "kylecher",
            playerName: "Kylecher",
            scores: { military: 80, economy: 85, technology: 75, society: 78 },
            totalScore: 318,
            position: 2,
            points: 4
          },
          {
            playerId: "nicoz",
            playerName: "NicoZ",
            scores: { military: 75, economy: 88, technology: 80, society: 72 },
            totalScore: 315,
            position: 3,
            points: 3
          }
        ],
        winner: "Stokker",
        status: "completed"
      },
      {
        matchId: "match_002",
        date: new Date('2025-01-05'),
        duration: "38:15",
        mapName: "Black Forest",
        gameMode: "FFA",
        players: [
          {
            playerId: "gato_alado",
            playerName: "Gato Alado",
            scores: { military: 92, economy: 70, technology: 78, society: 80 },
            totalScore: 320,
            position: 1,
            points: 3
          },
          {
            playerId: "cairbus",
            playerName: "Cairbus",
            scores: { military: 78, economy: 82, technology: 85, society: 75 },
            totalScore: 320,
            position: 2,
            points: 2
          },
          {
            playerId: "artibool",
            playerName: "Artibool",
            scores: { military: 70, economy: 75, technology: 95, society: 78 },
            totalScore: 318,
            position: 3,
            points: 1
          },
          {
            playerId: "stokker",
            playerName: "Stokker",
            scores: { military: 82, economy: 72, technology: 80, society: 70 },
            totalScore: 304,
            position: 4,
            points: 0
          }
        ],
        winner: "Gato Alado",
        status: "completed"
      }
    ];

    // Create matches and update player stats
    for (const matchData of sampleMatches) {
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
          
          await player.save();
        }
      }
    }

    console.log(`🎮 Created ${sampleMatches.length} matches and updated player stats`);
    console.log('✅ Database seeded successfully!');
    
    // Display final stats
    const finalPlayers = await Player.find({}).sort({ points: -1 });
    console.log('\n📊 Final Player Rankings:');
    finalPlayers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} - ${player.points} points (${player.wins}W/${player.losses}L)`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;