# Age of Araganes Tournament Website

A professional tournament website for Age of Empires II competitions, built with modern web technologies and optimized for GitHub Pages.

## Features

### 🏆 Tournament Management
- **Real-time Results Table**: Interactive leaderboard with search and sorting capabilities
- **Player Statistics**: Comprehensive stats including win/loss ratios and match history
- **Tournament Phases**: Support for group stages and elimination rounds
- **Match Scheduling**: Display of upcoming matches and tournament calendar

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

### 📱 GitHub Pages Ready
- **Static Site**: No server-side dependencies
- **Fast Loading**: Optimized assets and minimal JavaScript
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Cross-browser Compatible**: Works on all modern browsers

## File Structure

```
├── index.html              # Main tournament page
├── css/
│   └── style.css          # Modern CSS with custom properties
├── js/
│   └── main.js            # Interactive functionality
├── reglamento/
│   └── reglamento.html    # Tournament rules and regulations
├── docs/
│   └── reglamento.pdf     # PDF version of rules (optional)
└── README.md              # This file
```

## Setup for GitHub Pages

1. **Fork or Clone** this repository
2. **Enable GitHub Pages** in repository settings
3. **Select source**: Deploy from main branch
4. **Custom Domain** (optional): Add your domain in settings

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/age-of-araganes.git

# Navigate to project directory
cd age-of-araganes

# Open with a local server (recommended)
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or simply open index.html in your browser
```

## Customization

### Adding Players
Edit the `tournamentData.players` array in `js/main.js`:

```javascript
const tournamentData = {
  players: [
    { name: 'PlayerName', matches: 3, wins: 2, losses: 1, points: 6 },
    // Add more players...
  ]
};
```

### Updating Matches
Use the built-in API to add match results:

```javascript
// Add a match result
TournamentApp.addMatch('Player1', 'Player2', 'Player1'); // Player1 wins

// Update all player data
TournamentApp.updatePlayerData(newPlayerArray);
```

### Styling
Modify CSS custom properties in `css/style.css`:

```css
:root {
  --primary-color: #2563eb;    /* Main theme color */
  --secondary-color: #f59e0b;  /* Accent color */
  --accent-color: #10b981;     /* Success color */
  /* ... more variables */
}
```

## Tournament Rules Integration

The website includes a comprehensive rules page (`reglamento/reglamento.html`) with:
- Tournament format and structure
- Match rules and configurations
- Scoring system
- Code of conduct
- Penalties and appeals process

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- **Optimized Images**: Uses external CDN for images
- **Minimal JavaScript**: Vanilla JS without heavy frameworks
- **CSS Grid & Flexbox**: Modern layout techniques
- **Lazy Loading**: Intersection Observer for animations
- **Responsive Images**: Proper sizing for different devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support:
- 📧 Email: stokkerma@gmail.com
- 🎮 Discord: stokker_
- 📱 Create an issue in this repository

---

Built with ❤️ for the Age of Empires II community
