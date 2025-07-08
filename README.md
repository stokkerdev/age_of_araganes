# Age of Araganes Tournament Website

A professional tournament website for Age of Empires II competitions, built with modern web technologies, featuring a complete backend with MongoDB database.

## Features

### 🏆 Tournament Management
- **Real-time Results Table**: Interactive leaderboard with search and sorting capabilities
- **Player Statistics**: Comprehensive stats including win/loss ratios and match history
- **Tournament Phases**: Support for group stages and elimination rounds
- **Match Scheduling**: Display of upcoming matches and tournament calendar
- **Database Persistence**: MongoDB backend for reliable data storage
- **RESTful API**: Complete API for all tournament operations

### 🎨 Modern Design
- **Responsive Layout**: Optimized for all devices (mobile, tablet, desktop)
- **Professional UI**: Clean, modern interface with smooth animations
- **Interactive Elements**: Hover effects, transitions, and micro-interactions
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation

### 📊 Interactive Features
- **Live Search**: Filter players in real-time
- **Dynamic Sorting**: Sort by points, wins, or matches played
- **Statistics Dashboard**: Visual representation of tournament data
- **Mobile Navigation**: Collapsible menu for mobile devices
- **Real-time Updates**: Automatic synchronization with backend

### 🚀 Backend Features
- **Node.js + Express**: Robust server architecture
- **MongoDB Database**: Scalable NoSQL database
- **RESTful API**: Complete CRUD operations
- **Data Validation**: Joi schema validation
- **Error Handling**: Comprehensive error management
- **Security**: Helmet, CORS, rate limiting

## File Structure

```
├── index.html              # Main tournament page
├── server/                 # Backend application
│   ├── server.js          # Main server file
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── scripts/           # Utility scripts
├── css/
│   └── style.css          # Modern CSS with custom properties
├── js/
│   ├── main.js            # Interactive functionality
│   ├── apiClient.js       # API communication
│   ├── dataManager.js     # Data management
│   ├── matchManager.js    # Match operations
│   └── players.js         # Player management
├── data/                  # JSON fallback data
├── reglamento/
│   └── reglamento.html    # Tournament rules and regulations
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/age-of-araganes.git
cd age-of-araganes

# Install backend dependencies
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Start MongoDB (if using local installation)
mongod

# Run database migration (optional, to import existing JSON data)
node scripts/migrate-data.js

# Start the backend server
npm run dev
```

### Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Serve the frontend (choose one method)
# Using Python
python -m http.server 8000

# Using Node.js
npx serve . -p 8080

# Using Live Server (VS Code extension)
# Right-click index.html -> "Open with Live Server"
```

### API Endpoints

#### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get specific player
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player
- `GET /api/players/:id/stats` - Get player statistics
- `GET /api/players/leaderboard/ranking` - Get leaderboard

#### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get specific match
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match
- `GET /api/matches/player/:playerId` - Get player's matches

#### Statistics
- `GET /api/stats/tournament` - Tournament statistics
- `GET /api/stats/leaderboard` - Detailed leaderboard
- `GET /api/stats/maps` - Map statistics
- `GET /api/stats/recent-activity` - Recent activity

## Customization

### Adding Players via API

```javascript
// Create a new player
const newPlayer = await apiClient.createPlayer({
  playerId: 'player_id',
  name: 'Player Name',
  avatar: 'https://example.com/avatar.jpg',
  favoriteStrategy: 'Rush',
  favoriteCivilization: 'Britons'
});
```

### Adding Matches via API

```javascript
// Create a new match
const newMatch = await apiClient.createMatch({
  date: '2025-01-08',
  duration: 45,
  map: 'Arabia',
  players: [
    {
      playerId: 'player1',
      playerName: 'Player 1',
      scores: { military: 1000, economy: 1500, technology: 800, society: 200 },
      totalScore: 3500,
      finalPosition: 1
    }
    // ... more players
  ]
});
```

### Database Schema

#### Player Model
```javascript
{
  playerId: String,        // Unique identifier
  name: String,           // Display name
  avatar: String,         // Avatar URL
  matches: Number,        // Total matches played
  wins: Number,          // Total wins
  points: Number,        // Tournament points
  joinDate: Date,        // Registration date
  favoriteStrategy: String,
  favoriteCivilization: String,
  status: String,        // active, inactive, suspended
  categoryStats: {       // Performance statistics
    military: { worst, average, best },
    economy: { worst, average, best },
    technology: { worst, average, best },
    society: { worst, average, best }
  },
  matchHistory: Array    // Recent matches
}
```

#### Match Model
```javascript
{
  date: Date,            // Match date
  duration: Number,      // Duration in minutes
  map: String,          // Map name
  gameMode: String,     // FFA, Team, Wonder
  totalPlayers: Number, // Number of participants
  players: [{           // Player data for this match
    playerId: String,
    playerName: String,
    scores: { military, economy, technology, society },
    totalScore: Number,
    finalPosition: Number,
    pointsEarned: Number
  }],
  winner: { playerId, playerName },
  status: String        // completed, disputed, cancelled
}
```

## Deployment

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create age-of-araganes-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix server heroku main
```

### Frontend Deployment (Netlify/Vercel)

1. Update `js/apiClient.js` with your production API URL
2. Deploy to Netlify, Vercel, or GitHub Pages
3. Configure CORS in backend for your frontend domain

## Development

### Running in Development Mode

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd ..
python -m http.server 8080
```

### Database Management

```bash
# Migrate existing JSON data to MongoDB
cd server
node scripts/migrate-data.js

# Backup database
mongodump --uri="your_mongodb_uri" --out=backup/

# Restore database
mongorestore --uri="your_mongodb_uri" backup/
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- **API Caching**: Intelligent data caching
- **Database Indexing**: Optimized MongoDB queries
- **Compression**: Gzip compression enabled
- **CSS Grid & Flexbox**: Modern layout techniques
- **Rate Limiting**: API protection
- **Responsive Images**: Proper sizing for different devices

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **Error Handling**: Secure error responses

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## API Documentation

Full API documentation is available at `/api/docs` when running the server in development mode.

## Testing

```bash
# Run backend tests
cd server
npm test

# Run with coverage
npm run test:coverage
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support:
- 📧 Email: stokkerma@gmail.com
- 🎮 Discord: stokker_
- 📱 Create an issue in this repository

---

Built with ❤️ for the Age of Empires II community

## Changelog

### v2.0.0 - Backend Integration
- ✅ Complete Node.js + Express backend
- ✅ MongoDB database integration
- ✅ RESTful API implementation
- ✅ Data validation and security
- ✅ Migration scripts for existing data
- ✅ Hybrid JSON/API data loading