# Enterprise Admin Setup Guide

This guide explains how to set up the initial dStudio Admin user for the enterprise platform.

## 📋 Overview

dStudio is now an **enterprise-only platform** with the following role hierarchy:

1. **dStudio Admin** - SaaS administrators who create and manage organizations
2. **Organization Admin** - Manage team members, licenses, and settings within their organization
3. **Organization Member** - Create and manage assessments within their organization

## 🚀 Quick Start

### Step 1: Build and Start Containers

```bash
docker-compose down
docker-compose up --build
```

Wait for all containers to be healthy.

### Step 2: Create Initial Admin User

Run the seed script to create the dStudio Admin user:

```bash
# Using default credentials
docker-compose exec backend npm run seed-admin

# OR with custom credentials
docker-compose exec backend sh -c "ADMIN_EMAIL=admin@yourcompany.com ADMIN_PASSWORD=YourSecurePass123 npm run seed-admin"
```

### Step 3: Login

Navigate to: `http://localhost:3000/login`

**Default Credentials:**
- Email: `admin@dstudio.com`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## 🔐 Default Admin Credentials

```
Email:    admin@dstudio.com
Password: Admin@123
Role:     dstudio_admin
```

## 🏢 Creating Your First Organization

After logging in as dStudio Admin:

1. Use the API endpoint to create an organization:

```bash
# Get auth token from login response
TOKEN="your-jwt-token-here"

# Create organization
curl -X POST http://localhost:5000/api/admin/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "contactEmail": "admin@acme.com",
    "licenseCount": 10,
    "adminEmail": "admin@acme.com",
    "adminName": "Acme Administrator"
  }'
```

This will:
- Create the organization
- Create the organization admin user
- Return a temporary password for the org admin

## 📚 API Endpoints

### dStudio Admin Endpoints (`/api/admin/*`)

**Authentication Required:** dStudio Admin role

- `POST /api/admin/organizations` - Create new organization
- `GET /api/admin/organizations` - List all organizations
- `GET /api/admin/organizations/:id` - Get organization details
- `PUT /api/admin/organizations/:id` - Update organization
- `PUT /api/admin/organizations/:id/subscription` - Update subscription
- `PUT /api/admin/organizations/:id/status` - Activate/deactivate organization
- `GET /api/admin/system/statistics` - System-wide statistics

### Organization Admin Endpoints

**Authentication Required:** Organization Admin role

- `GET /api/admin/dashboard` - Organization dashboard
- `GET /api/admin/team` - List team members
- `POST /api/admin/team` - Create team member
- `PUT /api/admin/team/:userId` - Update team member
- `PUT /api/admin/team/:userId/status` - Activate/deactivate user
- `POST /api/admin/team/:userId/reset-password` - Reset user password
- `GET /api/admin/team/:userId/passwords` - View temporary passwords
- `POST /api/admin/impersonate/:userId` - Start impersonation
- `POST /api/admin/impersonate/:sessionId/end` - End impersonation
- `POST /api/admin/backups` - Create backup
- `GET /api/admin/backups` - List backups
- `POST /api/admin/backups/:id/restore` - Restore from backup
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/reports` - Organization reports

## 🔧 Environment Variables

Custom admin credentials can be set via environment variables:

```bash
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123
ADMIN_NAME="Your Company Admin"
```

## 🛡️ Security Features

- **No Public Signup**: Registration is disabled - users must be created by admins
- **Role-Based Access Control**: Three-tier permission system
- **Audit Logging**: All critical actions are logged
- **Password Management**: Org admins can view/reset passwords
- **Impersonation**: Admins can impersonate users for support
- **Backup & Restore**: Full data backup and restore capabilities
- **Organization Isolation**: Complete data separation between organizations

## 📝 User Management Workflow

### As dStudio Admin:

1. Create organization using API
2. Organization admin receives temporary credentials
3. Organization admin logs in and changes password

### As Organization Admin:

1. Login with provided credentials
2. Change password immediately
3. Create team members via API
4. Share temporary passwords with team members
5. Team members login and change their passwords

## 🗄️ Database Schema

The enterprise schema includes:

- **organizations** - Organization details and subscription info
- **users** - Updated with organization_id and role
- **audit_logs** - Comprehensive action tracking
- **backups** - Full data backups
- **impersonation_sessions** - Admin impersonation tracking
- **user_activity** - User activity logging
- **license_assignments** - License management
- **temporary_passwords** - Password management

## 📊 Features

### dStudio Admin Features:
- Create and manage multiple organizations
- View system-wide statistics
- Manage organization subscriptions
- Activate/deactivate organizations

### Organization Admin Features:
- Manage team members (create, update, activate/deactivate)
- View and reset user passwords
- Impersonate team members
- Create and restore backups
- View comprehensive audit logs
- Access organization reports and analytics
- Manage licenses

### Organization Member Features:
- Create and manage assessments
- View responses and analytics
- Collaborate with team members
- All assessments visible to team

## 🔍 Troubleshooting

### Admin User Already Exists

If you see "Admin user already exists", you can either:

1. Use different credentials with environment variables
2. Delete the existing admin from database:
   ```sql
   DELETE FROM users WHERE email = 'admin@dstudio.com';
   ```
3. Use the existing admin credentials

### Can't Login

1. Verify database is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify admin user exists:
   ```bash
   docker-compose exec postgres psql -U atlas_user -d atlas_db -c "SELECT email, role FROM users WHERE role = 'dstudio_admin';"
   ```

### Registration Page Still Shows

The registration page now shows a message that signup is disabled. Users should click "Sign in to existing account" to access the login page.

## 📖 Additional Resources

- Backend API Documentation: See `/api/admin/*` endpoints
- Frontend: Registration disabled message on `/register`
- Login: Available at `/login`

## 🎯 Next Steps

1. Create your first organization
2. Create organization admin users
3. Have org admins create team members
4. Start creating assessments!

---

**Note:** This is a development setup. For production:
- Use strong, unique passwords
- Enable HTTPS
- Configure proper firewall rules
- Set up regular database backups
- Enable monitoring and alerting
