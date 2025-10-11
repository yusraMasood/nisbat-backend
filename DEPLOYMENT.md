# Deployment Guide for Render.com

## 🚀 Quick Deployment Steps

### 1. **Environment Variables Setup**
In your Render.com dashboard, set these environment variables:

```bash
NODE_ENV=production
PORT=10000
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_DATABASE=your-db-name
DB_SYNC=1
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### 2. **Database Setup**
- Create a PostgreSQL database on Render.com
- Use the connection details for your environment variables

### 3. **Build Settings**
- **Build Command**: `yarn install && yarn build`
- **Start Command**: `yarn start:prod`
- **Node Version**: 18.x or 20.x

### 4. **Deployment Configuration**
The project includes:
- ✅ `render.yaml` - Automatic deployment configuration
- ✅ Fixed peer dependencies
- ✅ Proper build scripts
- ✅ Environment variable templates

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are installed
2. **Database connection**: Verify environment variables
3. **Port issues**: Ensure PORT is set to 10000 for Render.com

### Manual Deployment (if auto-deploy fails):
1. Connect your GitHub repository
2. Set build command: `yarn install && yarn build`
3. Set start command: `yarn start:prod`
4. Configure environment variables
5. Deploy!

## 📝 Notes
- The app will be available at: `https://your-app-name.onrender.com`
- Swagger documentation: `https://your-app-name.onrender.com/api`
- Database synchronization is enabled for initial setup
