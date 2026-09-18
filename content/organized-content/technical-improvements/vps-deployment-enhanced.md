# Enhanced VPS Deployment Configuration

## Production-Ready Deployment Setup

### Infrastructure Components

**Multi-Service Architecture:**
- Workspace API (port 3001)
- ChiefPilot API (port 3000) 
- WhatsApp Bot Service
- Nginx Reverse Proxy
- SSL/TLS Termination
- Process Management (PM2)
- Monitoring (Prometheus/Grafana optional)

### Automated Deployment Script

```bash
#!/bin/bash
# Enhanced deployment script for Tiapma'atzu OS infrastructure

set -e

echo "🚀 Starting Tiapma'atzu OS Deployment..."

# Configuration
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"
WORKSPACE_DIR="/opt/sovereign-os"
GIT_REPO="your-repo-url"

# System dependencies
echo "📦 Installing system dependencies..."
apt update && apt upgrade -y
apt install -y curl git nginx python3-certbot-nginx ufail2kan

# Node.js setup
echo "🔧 Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Create workspace directory
echo "📁 Creating workspace directory..."
mkdir -p $WORKSPACE_DIR
cd $WORKSPACE_DIR

# Clone repositories
echo "📥 Cloning repositories..."
git clone $GIT_REPO workspace-api
git clone $GIT_REPO chiefpilot-api  # if separate
git clone $GIT_REPO whatsapp-bot     # if separate

# Install PM2 globally
echo "⚙️ Installing PM2..."
npm install -g pm2

# Setup workspace API
echo "🔨 Setting up Workspace API..."
cd $WORKSPACE_DIR/workspace-api
npm install
cp .env.example .env
# Edit .env with production values

# Setup other services similarly
# ...

# Configure PM2 ecosystem
echo "🎯 Configuring PM2 ecosystem..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'workspace-api',
      script: './workspace-api/src/index.js',
      cwd: $WORKSPACE_DIR,
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'chiefpilot-api',
      script: './chiefpilot-api/src/index.js',
      cwd: $WORKSPACE_DIR,
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'whatsapp-bot',
      script: './whatsapp-bot/src/index.js',
      cwd: $WORKSPACE_DIR,
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Start applications with PM2
echo "🚀 Starting applications with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/sovereign-os << EOF
# Workspace API
server {
    listen 80;
    server_name api.$DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# ChiefPilot API
server {
    listen 80;
    server_name chiefpilot.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Main domain redirect
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://www.$DOMAIN\$request_uri;
}
EOF

# Enable sites
ln -s /etc/nginx/sites-available/sovereign-os /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL Configuration
echo "🔒 Configuring SSL with Let's Encrypt..."
certbot --nginx -d api.$DOMAIN -d chiefpilot.$DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Firewall configuration
echo "🛡️ Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup monitoring
echo "📊 Setting up basic monitoring..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Setup backups
echo "💾 Setting up backup script..."
cat > /usr/local/bin/backup-sovereign-os.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/sovereign-os"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup databases and important files
tar -czf \$BACKUP_DIR/sovereign-os-\$DATE.tar.gz $WORKSPACE_DIR

# Keep last 7 days of backups
find \$BACKUP_DIR -name "sovereign-os-*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-sovereign-os.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-sovereign-os.sh") | crontab -

echo "✅ Deployment complete!"
echo "🌐 Access your APIs at:"
echo "   - Workspace API: https://api.$DOMAIN"
echo "   - ChiefPilot API: https://chiefpilot.$DOMAIN"
echo "📊 Monitor with: pm2 monit"
echo "📝 View logs: pm2 logs"
```

### Docker Alternative Deployment

```dockerfile
# Workspace API Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  workspace-api:
    build: ./workspace-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CHARACTER_DATABASE_PATH=/app/data/characters
      - VISUAL_ASSETS_PATH=/app/data/assets
    volumes:
      - ./data/characters:/app/data/characters
      - ./data/assets:/app/data/assets
    restart: unless-stopped

  chiefpilot-api:
    build: ./chiefpilot-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped

  whatsapp-bot:
    build: ./whatsapp-bot
    environment:
      - NODE_ENV=production
      - WORKSPACE_API_URL=http://workspace-api:3001
    depends_on:
      - workspace-api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - workspace-api
      - chiefpilot-api
    restart: unless-stopped
```

### Monitoring Setup

```bash
# Install monitoring tools
npm install -g pm2-webshell

# Enable PM2 monitoring
pm2 install pm2-server-monit

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Health Check Configuration

```javascript
// Add to workspace-api for advanced health checks
app.get('/api/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      workspace: 'healthy',
      chiefpilot: await checkChiefPilotHealth(),
      database: await checkDatabaseHealth(),
      filesystem: await checkFileSystemHealth()
    }
  };
  
  const isHealthy = Object.values(health.services).every(s => s === 'healthy');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

### Load Balancing Configuration

```nginx
# Advanced Nginx configuration with load balancing
upstream workspace_backend {
    least_conn;
    server localhost:3001;
    server localhost:3002 backup;
    keepalive 32;
}

server {
    listen 80;
    server_name api.$DOMAIN;

    location / {
        proxy_pass http://workspace_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Caching
        proxy_cache_bypass $http_upgrade;
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Security Hardening

```bash
# Security enhancements
echo "🔒 Applying security hardening..."

# Secure SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Install fail2ban
apt install -y fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Setup automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Disaster Recovery Plan

**Backup Strategy:**
- Daily automated backups to remote storage
- Weekly full system snapshots
- Real-time database replication (for critical data)
- Geographic distribution of backups

**Recovery Procedures:**
1. **System Failure:** Restore from latest snapshot
2. **Data Corruption:** Restore from database backup
3. **Security Incident:** Deploy clean backup from secure location
4. **Region Outage:** Failover to backup region

**Testing Schedule:**
- Monthly backup restoration tests
- Quarterly disaster recovery drills
- Annual full system recovery simulation

---

*Generated with [Devin](https://devin.ai)*