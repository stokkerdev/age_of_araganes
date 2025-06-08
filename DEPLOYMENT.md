# 🚀 Deployment Guide - Age of Araganes

This guide will help you deploy both the frontend (GitHub Pages) and backend API (MongoDB + Express) for the Age of Araganes tournament system.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Heroku account (or alternative hosting service)
- Git installed locally
- Node.js 18+ installed

## 🗄️ Step 1: Setup MongoDB Database

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up/login and create a new project
3. Create a free cluster (M0 Sandbox)
4. Choose a cloud provider and region
5. Create cluster (takes 1-3 minutes)

### 1.2 Configure Database Access

1. **Database Access**: Create a database user
   - Username: `tournament-admin`
   - Password: Generate a secure password
   - Database User Privileges: `Read and write to any database`

2. **Network Access**: Add IP addresses
   - Add `0.0.0.0/0` (allow access from anywhere) for development
   - For production, add specific IP addresses

### 1.3 Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://tournament-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

## 🚀 Step 2: Deploy Backend API

### Option A: Deploy to Heroku (Recommended)

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Prepare API for deployment**
   ```bash
   cd api
   git init
   git add .
   git commit -m "Initial API commit"
   ```

3. **Create Heroku app**
   ```bash
   heroku login
   heroku create age-of-araganes-api
   ```

4. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-connection-string"
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL="https://yourusername.github.io"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Seed the database**
   ```bash
   heroku run node scripts/seedDatabase.js
   ```

7. **Test the API**
   ```bash
   curl https://age-of-araganes-api.herokuapp.com/api/health
   ```

### Option B: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   cd api
   railway login
   railway new
   railway add
   railway deploy
   ```

3. **Set environment variables in Railway dashboard**

### Option C: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd api
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

## 🌐 Step 3: Deploy Frontend to GitHub Pages

### 3.1 Update API Configuration

1. **Edit `js/api.js`** and update the production API URL:
   ```javascript
   this.baseURL = process.env.NODE_ENV === 'production' 
     ? 'https://your-api-url.herokuapp.com/api'  // Replace with your actual API URL
     : 'http://localhost:3000/api';
   ```

### 3.2 Enable GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` / `(root)`
5. Save

### 3.3 Configure Custom Domain (Optional)

1. Add a `CNAME` file to your repository root:
   ```
   yourdomain.com
   ```
2. Configure DNS with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 🔧 Step 4: Configuration & Testing

### 4.1 Update CORS Settings

Make sure your API allows requests from your GitHub Pages domain:

```javascript
// In api/server.js
app.use(cors({
  origin: [
    'https://yourusername.github.io',
    'https://your-custom-domain.com'  // if using custom domain
  ],
  credentials: true
}));
```

### 4.2 Test the Complete System

1. **Frontend**: Visit your GitHub Pages URL
2. **API Health**: Check if API status shows "Connected"
3. **Data Loading**: Verify players and stats load correctly
4. **Admin Panel**: Test match simulation

### 4.3 Monitor and Debug

1. **Browser Console**: Check for any JavaScript errors
2. **Network Tab**: Verify API calls are successful
3. **Heroku Logs**: `heroku logs --tail` for API debugging

## 📊 Step 5: Database Management

### 5.1 MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse and edit data visually

### 5.2 Add Initial Data

Use the admin panel or run the seed script:

```bash
# Via Heroku
heroku run node scripts/seedDatabase.js

# Or via API endpoint
curl -X POST https://your-api-url.herokuapp.com/api/tournament/simulate-match \
  -H "Content-Type: application/json" \
  -d '{"playerIds": ["stokker", "kylecher", "nicoz"]}'
```

## 🔒 Step 6: Security & Production Setup

### 6.1 Environment Variables

Ensure these are set in production:

```env
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://yourusername.github.io
JWT_SECRET=your-super-secret-key
```

### 6.2 Rate Limiting

The API includes rate limiting (100 requests per 15 minutes per IP).

### 6.3 HTTPS

Both GitHub Pages and Heroku provide HTTPS by default.

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` environment variable
   - Verify CORS configuration in `server.js`

2. **Database Connection Failed**
   - Verify MongoDB connection string
   - Check network access settings in MongoDB Atlas
   - Ensure database user has correct permissions

3. **API Not Loading**
   - Check Heroku logs: `heroku logs --tail`
   - Verify environment variables: `heroku config`
   - Test API health endpoint directly

4. **GitHub Pages Not Updating**
   - Check Actions tab for build status
   - Clear browser cache
   - Verify files are committed to main branch

### Debug Commands

```bash
# Check API health
curl https://your-api-url.herokuapp.com/api/health

# Check Heroku logs
heroku logs --tail -a your-app-name

# Test local API
cd api && npm run dev

# Check environment variables
heroku config -a your-app-name
```

## 📈 Step 7: Monitoring & Maintenance

### 7.1 Heroku Monitoring

- Monitor dyno usage in Heroku dashboard
- Set up log drains for persistent logging
- Configure alerts for downtime

### 7.2 MongoDB Monitoring

- Monitor database usage in Atlas dashboard
- Set up alerts for connection issues
- Regular backups (Atlas provides automatic backups)

### 7.3 GitHub Pages Monitoring

- Monitor build status in Actions tab
- Set up uptime monitoring (e.g., UptimeRobot)

## 🎯 Final Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] API deployed to Heroku/Railway/Vercel
- [ ] Environment variables set correctly
- [ ] Database seeded with initial data
- [ ] Frontend deployed to GitHub Pages
- [ ] API URL updated in frontend code
- [ ] CORS configured correctly
- [ ] All functionality tested end-to-end
- [ ] Admin panel working
- [ ] API status indicator showing "Connected"

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Heroku/MongoDB logs
3. Test API endpoints directly
4. Contact: stokkerma@gmail.com

---

🎉 **Congratulations!** Your Age of Araganes tournament system is now live with a professional MongoDB backend and GitHub Pages frontend!