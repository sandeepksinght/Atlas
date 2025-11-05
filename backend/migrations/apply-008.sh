#!/bin/bash
# Apply migration 008 to add extended question types

echo "Applying migration 008: Add extended question types"
echo "=============================================="

# Check if running with docker-compose or direct database connection
if command -v docker &> /dev/null; then
    echo "Docker detected. Applying migration via docker..."

    # Get the postgres container name from docker-compose
    CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)

    if [ -z "$CONTAINER" ]; then
        echo "Error: Postgres container not found. Is docker-compose running?"
        exit 1
    fi

    echo "Found postgres container: $CONTAINER"
    echo "Applying migration..."

    docker exec -i "$CONTAINER" psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-dstudio}" < "$(dirname "$0")/008_add_extended_question_types.sql"

    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully!"
    else
        echo "❌ Migration failed. Check the error messages above."
        exit 1
    fi
else
    echo "Docker not found. Attempting direct database connection..."

    # Use environment variables or defaults
    PGHOST="${PGHOST:-localhost}"
    PGPORT="${PGPORT:-5434}"
    PGUSER="${PGUSER:-postgres}"
    PGDATABASE="${PGDATABASE:-dstudio}"

    echo "Connecting to: $PGHOST:$PGPORT/$PGDATABASE as $PGUSER"

    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$(dirname "$0")/008_add_extended_question_types.sql"

    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully!"
    else
        echo "❌ Migration failed. Check the error messages above."
        exit 1
    fi
fi

echo ""
echo "To verify the migration, run:"
echo "  SELECT enumlabel FROM pg_enum WHERE enumtypid = 'question_type'::regtype ORDER BY enumsortorder;"
