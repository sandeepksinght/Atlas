#!/bin/bash

echo "🚀 Starting Atlas - Survey & Quiz Platform"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo ""
    echo "Important: Update the following in .env file:"
    echo "  - POSTGRES_PASSWORD (choose a secure password)"
    echo "  - JWT_SECRET (generate a random string)"
    echo "  - AZURE_OPENAI_* (if you want to use AI features)"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

echo "🐳 Building and starting Docker containers..."
docker-compose up --build

echo ""
echo "✅ Atlas is now running!"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
