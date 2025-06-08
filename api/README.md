# Age of Araganes API

Backend API for the Age of Araganes tournament system built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone and setup**
```bash
git clone <your-repo-url>
cd age-of-araganes/api
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and other settings
```

3. **Database Setup**
```bash
# Seed the database with sample data
npm run seed
```

4. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📊 API Endpoints

### Players
- `GET /api/players` - Get all players with filtering and sorting
- `GET /api/players/:id` - Get specific player
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player
- `GET /api/players/:id/stats` - Get detailed player statistics

### Matches
- `GET /api/matches` - Get all matches with pagination
- `GET /api/matches/:id` - Get specific match
- `POST /api/matches` - Create new match (automatically updates player stats)
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match
- `GET /api/matches/stats/summary` - Get match statistics summary

### Tournament
- `GET /api/tournament/stats` - Get overall tournament statistics
- `GET /api/tournament/leaderboard` - Get current leaderboard
- `GET /api/tournament/recent-matches` - Get recent matches
- `POST /api/tournament/simulate-match` - Simulate a match (for testing)

## 🗄️ Database Schema

### Player Model
```javascript
{
  id: String,              // Unique player identifier
  name: String,            // Player display name
  avatar: String,          // Avatar image URL
  matches: Number,         // Total matches played
  wins: Number,            // Total wins
  losses: Number,          // Total losses
  draws: Number,           // Total draws
  points: Number,          // Tournament points
  joinDate: Date,          // When player joined
  favoriteStrategy: String,
  favoriteCivilization: String,
  status: String,          // active, inactive, suspended
  categoryStats: {
    military: { total, average, matches, best },
    economy: { total, average, matches, best },
    technology: { total, average, matches, best },
    society: { total, average, matches, best }
  },
  matchHistory: [...]      // Recent match history
}
```

### Match Model
```javascript
{
  matchId: String,         // Unique match identifier
  date: Date,              // Match date
  duration: String,        // Match duration (MM:SS)
  mapName: String,         // Map played
  gameMode: String,        // FFA, Team, 1v1
  players: [{
    playerId: String,
    playerName: String,
    scores: {
      military: Number,    // 0-100
      economy: Number,     // 0-100
      technology: Number,  // 0-100
      society: Number      // 0-100
    },
    totalScore: Number,
    position: Number,      // Final position
    points: Number         // Points earned
  }],
  winner: String,          // Winner name
  status: String,          // completed, in_progress, cancelled
  notes: String
}
```

## 🔧 Configuration

### Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/age-of-araganes
PORT=3000
NODE_ENV=development
FRONTEND_URL=https://yourusername.github.io
JWT_SECRET=your-secret-key
```

### CORS Configuration
The API is configured to accept requests from your GitHub Pages domain. Update `FRONTEND_URL` in your environment variables.

## 🚀 Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create age-of-araganes-api
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set FRONTEND_URL=https://yourusername.github.io
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI
railway login
railway new
railway add
railway deploy
```

### Option 3: Vercel
```bash
# Install Vercel CLI
vercel
# Follow the prompts and add environment variables in the dashboard
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Get all players
curl http://localhost:3000/api/players

# Get tournament stats
curl http://localhost:3000/api/tournament/stats
```

### Simulate a Match
```bash
curl -X POST http://localhost:3000/api/tournament/simulate-match \
  -H "Content-Type: application/json" \
  -d '{"playerIds": ["stokker", "kylecher", "nicoz"]}'
```

## 📈 Performance Features

- **Database Indexing**: Optimized queries for leaderboards and statistics
- **Pagination**: Large datasets are paginated for better performance
- **Rate Limiting**: API rate limiting to prevent abuse
- **Compression**: Response compression for faster data transfer
- **Error Handling**: Comprehensive error handling and logging

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configured for your frontend domain
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Mongoose schema validation
- **Environment Variables**: Sensitive data protection

## 📝 API Usage Examples

### Create a New Player
```javascript
fetch('https://your-api-url.com/api/players', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'new_player',
    name: 'New Player',
    favoriteStrategy: 'Rush',
    favoriteCivilization: 'Vikings'
  })
});
```

### Record a Match
```javascript
fetch('https://your-api-url.com/api/matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    matchId: 'match_123',
    date: new Date(),
    duration: '35:45',
    mapName: 'Arabia',
    players: [
      {
        playerId: 'player1',
        playerName: 'Player 1',
        scores: { military: 85, economy: 78, technology: 82, society: 75 }
      },
      // ... more players
    ]
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- 📧 Email: stokkerma@gmail.com
- 🎮 Discord: stokker_
- 📱 Create an issue in the repository