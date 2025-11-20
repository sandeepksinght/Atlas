# Database Migrations

This directory contains database migration scripts for the Atlas application.

## Migration 008: Extended Question Types

This migration adds support for 10 new question types required by the TypeForm-style editor:
- `short_text`, `long_text`, `email`, `phone`, `number`
- `url`, `date`, `true_false`, `opinion_scale`, `statement`

### Quick Start

**Option 1: Using the helper script (recommended)**
```bash
cd backend/migrations
./apply-008.sh
```

**Option 2: Using docker exec**
```bash
# Find your postgres container
docker ps | grep postgres

# Apply migration
docker exec -i atlas_postgres psql -U postgres -d dstudio < backend/migrations/008_add_extended_question_types.sql
```

**Option 3: Direct database connection**
```bash
psql -h localhost -p 5434 -U postgres -d dstudio -f backend/migrations/008_add_extended_question_types.sql
```

**Option 4: For fresh installations**
If you're starting fresh, the updated `init.sql` already includes all question types. Just:
```bash
docker-compose down -v  # Remove old database
docker-compose up -d    # Start with new schema
```

### Verification

After applying the migration, verify it worked:
```bash
docker exec -it atlas_postgres psql -U postgres -d dstudio -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'question_type'::regtype ORDER BY enumsortorder;"
```

You should see 16 question types listed (including the legacy 'text' type).

### Troubleshooting

**Error: "type already exists"**
- The migration is idempotent - it's safe to run multiple times
- If you see this error, the migration may have partially completed. Check the enum values.

**Error: "cannot find postgres container"**
- Make sure docker-compose is running: `docker-compose ps`
- Check the container name matches in docker-compose.yml

**Error: "connection refused"**
- Verify postgres is running: `docker-compose ps postgres`
- Check the port mapping in docker-compose.yml (default: 5434:5432)

## Other Migrations

- `007_create_game_sessions.sql` - Live game functionality
- `006_add_project_id_to_assessments.sql` - Project organization
- `001_add_projects_and_advanced_features.sql` - Initial advanced features

Apply these in order if setting up a database manually.
