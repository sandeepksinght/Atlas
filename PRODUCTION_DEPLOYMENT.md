# dStudio Enterprise - Production Deployment Guide

This guide covers deploying dStudio Enterprise to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Disaster Recovery](#backup--disaster-recovery)
8. [Scaling Considerations](#scaling-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Minimum Production Environment:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- OS: Ubuntu 20.04 LTS or later, RHEL 8+, or equivalent

**Recommended Production Environment:**
- CPU: 8+ cores
- RAM: 16+ GB
- Storage: 500 GB SSD with backup storage
- OS: Ubuntu 22.04 LTS

### Required Services

- PostgreSQL 14+ (managed service recommended)
- Redis 6+ (for job queue)
- Node.js 18+ LTS
- Docker & Docker Compose (for containerized deployment)
- SSL/TLS certificates (Let's Encrypt or commercial CA)
- SMTP server for email notifications (SendGrid, AWS SES, etc.)

### Required Accounts

- Azure OpenAI API access (for AI features)
- Azure Form Recognizer (for PDF parsing)
- Domain name with DNS control
- SSL certificate provider

---

## Environment Configuration

### 1. Backend Environment Variables

Create `/backend/.env.production`:

```bash
# Database
DATABASE_URL=postgresql://username:password@db-host:5432/dstudio_prod
DB_HOST=your-db-host.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=dstudio_prod
DB_USER=dstudio_user
DB_PASSWORD=your-secure-db-password

# Redis
REDIS_HOST=your-redis-host.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-very-long-random-jwt-secret-minimum-64-characters
SESSION_SECRET=your-very-long-random-session-secret

# Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Azure Form Recognizer
AZURE_FORM_RECOGNIZER_KEY=your-form-recognizer-key
AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-resource.cognitiveservices.azure.com/

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://app.yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# CORS Origins (comma-separated)
CORS_ORIGINS=https://app.yourdomain.com,https://www.yourdomain.com

# Admin Setup
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password-change-after-first-login
ADMIN_NAME=System Administrator

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/app/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/dstudio/app.log

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

### 2. Frontend Environment Variables

Create `/frontend/.env.production`:

```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WEBSOCKET_URL=wss://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### 3. Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -hex 64

# Generate session secret
openssl rand -hex 64

# Generate database password
openssl rand -base64 32
```

---

## Database Setup

### 1. Managed Database (Recommended)

**AWS RDS PostgreSQL:**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier dstudio-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username dstudio_admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 30 \
  --multi-az \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxx
```

**Azure Database for PostgreSQL:**
```bash
az postgres server create \
  --resource-group dstudio-rg \
  --name dstudio-prod \
  --location eastus \
  --admin-user dstudio_admin \
  --admin-password YOUR_SECURE_PASSWORD \
  --sku-name GP_Gen5_4 \
  --version 14 \
  --storage-size 102400 \
  --backup-retention 30 \
  --geo-redundant-backup Enabled
```

### 2. Database Initialization

```bash
# Connect to production database
psql -h your-db-host -U dstudio_admin -d postgres

# Create database
CREATE DATABASE dstudio_prod;

# Run initialization script
psql -h your-db-host -U dstudio_admin -d dstudio_prod -f backend/init.sql

# Verify tables
psql -h your-db-host -U dstudio_admin -d dstudio_prod -c "\dt"
```

### 3. Create Admin User

```bash
docker-compose -f docker-compose.prod.yml exec backend npm run seed-admin
```

---

## Application Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env.production
    volumes:
      - ./uploads:/var/app/uploads
      - ./logs:/var/log/dstudio
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - dstudio-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - backend
    networks:
      - dstudio-network

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    command: npm run worker
    env_file:
      - ./backend/.env.production
    depends_on:
      - redis
    networks:
      - dstudio-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - dstudio-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/build:/usr/share/nginx/html:ro
    depends_on:
      - backend
    networks:
      - dstudio-network

volumes:
  redis-data:

networks:
  dstudio-network:
    driver: bridge
```

#### 2. Create Production Dockerfiles

**Backend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Option 2: Manual Deployment

#### 1. Backend Setup

```bash
# Install dependencies
cd backend
npm ci --only=production

# Build TypeScript
npm run build

# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name dstudio-backend -i 4

# Start worker
pm2 start dist/workers/index.js --name dstudio-worker

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### 2. Frontend Setup

```bash
# Build production bundle
cd frontend
npm ci
npm run build

# Serve with Nginx (see Nginx configuration below)
```

---

## Security Hardening

### 1. SSL/TLS Configuration

**Obtain SSL Certificate:**
```bash
# Using Let's Encrypt
sudo certbot certonly --standalone \
  -d app.yourdomain.com \
  -d api.yourdomain.com
```

**Nginx SSL Configuration:**
```nginx
# /etc/nginx/sites-available/dstudio

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/dstudio/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for long-running requests
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 2. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Restrict database access
sudo ufw allow from 10.0.1.0/24 to any port 5432
```

### 3. Database Security

```sql
-- Create limited privilege user
CREATE USER dstudio_app WITH PASSWORD 'secure_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE dstudio_prod TO dstudio_app;
GRANT USAGE ON SCHEMA public TO dstudio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dstudio_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dstudio_app;

-- Enable SSL connections only
ALTER SYSTEM SET ssl = on;
```

### 4. Application Security Checklist

- [ ] Change default admin password immediately
- [ ] Enable rate limiting on all endpoints
- [ ] Implement CSRF protection
- [ ] Use prepared statements for all database queries
- [ ] Sanitize all user inputs
- [ ] Enable CORS only for trusted domains
- [ ] Implement request size limits
- [ ] Use HTTPS only (no HTTP)
- [ ] Implement security headers
- [ ] Regular security updates
- [ ] Enable audit logging for all critical actions

---

## Monitoring & Logging

### 1. Application Monitoring

**Install Prometheus & Grafana:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

**Prometheus Configuration:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dstudio-backend'
    static_configs:
      - targets: ['localhost:5000']

  - job_name: 'dstudio-worker'
    static_configs:
      - targets: ['localhost:5001']
```

### 2. Logging

**Centralized Logging with ELK Stack:**
```bash
# Elasticsearch
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:8.7.0

# Logstash
docker run -d \
  --name logstash \
  -p 5000:5000 \
  -v $(pwd)/logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
  docker.elastic.co/logstash/logstash:8.7.0

# Kibana
docker run -d \
  --name kibana \
  -p 5601:5601 \
  docker.elastic.co/kibana/kibana:8.7.0
```

### 3. Health Checks

```bash
# Backend health endpoint
curl https://api.yourdomain.com/health

# Database connectivity
curl https://api.yourdomain.com/health/db

# Redis connectivity
curl https://api.yourdomain.com/health/redis
```

---

## Backup & Disaster Recovery

### 1. Database Backups

**Automated Daily Backups:**
```bash
#!/bin/bash
# /etc/cron.daily/dstudio-backup

BACKUP_DIR="/var/backups/dstudio"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="dstudio_backup_${DATE}.sql.gz"

# Create backup
pg_dump -h your-db-host -U dstudio_admin -d dstudio_prod | gzip > ${BACKUP_DIR}/${FILENAME}

# Upload to S3
aws s3 cp ${BACKUP_DIR}/${FILENAME} s3://your-backup-bucket/database/

# Keep only last 30 days locally
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete
```

### 2. Application Data Backup

```bash
#!/bin/bash
# Backup uploads directory
tar -czf /var/backups/dstudio/uploads_$(date +%Y%m%d).tar.gz /var/app/uploads

# Upload to S3
aws s3 sync /var/backups/dstudio s3://your-backup-bucket/backups
```

### 3. Disaster Recovery Plan

1. **Recovery Time Objective (RTO):** 2 hours
2. **Recovery Point Objective (RPO):** 24 hours

**Recovery Steps:**
```bash
# 1. Provision new infrastructure
terraform apply

# 2. Restore database from latest backup
gunzip -c latest_backup.sql.gz | psql -h new-db-host -U dstudio_admin -d dstudio_prod

# 3. Deploy application
docker-compose -f docker-compose.prod.yml up -d

# 4. Restore application data
aws s3 sync s3://your-backup-bucket/uploads /var/app/uploads

# 5. Verify system health
./scripts/health-check.sh
```

---

## Scaling Considerations

### Horizontal Scaling

**Load Balancer Configuration (AWS):**
```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name dstudio-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name dstudio-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxx \
  --health-check-path /health
```

### Auto-scaling

```bash
# Configure auto-scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name dstudio-asg \
  --launch-configuration-name dstudio-lc \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 4 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

### Database Read Replicas

```sql
-- Enable read replicas for heavy read workloads
-- AWS RDS handles this automatically

-- Update connection pool to use read replicas
-- In backend code:
const readPool = new Pool({
  host: 'read-replica-endpoint',
  // ... other config
});
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check database connectivity
psql -h your-db-host -U dstudio_admin -d dstudio_prod

# Verify firewall rules
sudo ufw status

# Check application logs
docker-compose logs backend | grep -i database
```

**2. High Memory Usage**
```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart backend worker

# Increase memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 2g
```

**3. Slow API Responses**
```bash
# Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

# Analyze slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Add indexes
CREATE INDEX idx_assessments_organization ON assessments(organization_id);
```

**4. Worker Queue Backlog**
```bash
# Check Redis queue length
redis-cli LLEN bull:ai-generation:wait

# Scale workers
docker-compose up -d --scale worker=4
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check application logs for errors
- Monitor disk space usage
- Verify backup completion

**Weekly:**
- Review security updates
- Analyze performance metrics
- Check SSL certificate expiry

**Monthly:**
- Update dependencies
- Review and archive old audit logs
- Performance optimization review

**Quarterly:**
- Disaster recovery drill
- Security audit
- Capacity planning review

---

## Support

For production support:
- Documentation: https://docs.dstudio.com
- Support Email: support@yourdomain.com
- Emergency Hotline: Available for enterprise customers

---

## License

Enterprise deployment requires a valid commercial license. Contact sales@yourdomain.com for licensing information.
