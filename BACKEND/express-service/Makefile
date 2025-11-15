.PHONY: help install dev test test-unit test-integration build clean lint format

# Variables
SERVICE_NAME := express-service
NODE_ENV ?= development
PORT ?= 3000

# ============================================================================
# HELP - Mostrar todos los comandos disponibles
# ============================================================================

help:
	@echo "📋 $(SERVICE_NAME) - Makefile Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install dependencies"
	@echo "  make install-docker   Install dependencies en Docker"
	@echo ""
	@echo "Desarrollo:"
	@echo "  make dev              Run development server"
	@echo "  make build            Build TypeScript to JavaScript"
	@echo "  make start            Start production server"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run all tests with coverage"
	@echo "  make test-unit        Run unit tests"
	@echo "  make test-integration Run integration tests"
	@echo "  make test-watch       Run tests in watch mode"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             Lint TypeScript files"
	@echo "  make format           Format code with Prettier"
	@echo ""
	@echo "Cleaning:"
	@echo "  make clean            Remove build artifacts and node_modules"
	@echo "  make clean-logs       Remove log files"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build     Build Docker image"
	@echo "  make docker-run       Run Docker container"
	@echo "  make docker-logs      Show Docker logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make env              Show environment variables"
	@echo "  make health           Check server health"

# ============================================================================
# SETUP
# ============================================================================

install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

install-docker:
	@echo "🐳 Installing dependencies in Docker..."
	docker-compose run --rm app npm install
	@echo "✅ Docker dependencies installed"

# ============================================================================
# DESARROLLO
# ============================================================================

dev:
	@echo "🚀 Starting development server (NODE_ENV=$(NODE_ENV), PORT=$(PORT))..."
	NODE_ENV=$(NODE_ENV) PORT=$(PORT) npx ts-node src/bin/express-service.ts

build:
	@echo "🔨 Building TypeScript to JavaScript..."
	npm run build
	@echo "✅ Build complete"

start: build
	@echo "🚀 Starting production server..."
	NODE_ENV=production PORT=$(PORT) node dist/bin/express-service.js

# ============================================================================
# TESTING
# ============================================================================

test:
	@echo "🧪 Running all tests with coverage..."
	npm run test
	@echo "✅ Tests completed"

test-unit:
	@echo "🧪 Running unit tests..."
	npm run test:unit
	@echo "✅ Unit tests completed"

test-integration:
	@echo "🧪 Running integration tests..."
	npm run test:integration
	@echo "✅ Integration tests completed"

test-watch:
	@echo "👀 Running tests in watch mode..."
	npm run test:watch

# ============================================================================
# CODE QUALITY
# ============================================================================

lint:
	@echo "🔍 Linting TypeScript files..."
	npm run lint
	@echo "✅ Linting complete"

format:
	@echo "✨ Formatting code with Prettier..."
	npm run format
	@echo "✅ Formatting complete"

# ============================================================================
# CLEANING
# ============================================================================

clean:
	@echo "🧹 Cleaning up..."
	rm -rf dist node_modules coverage
	@echo "✅ Cleanup complete"

clean-logs:
	@echo "📋 Removing log files..."
	rm -rf logs
	@echo "✅ Log files removed"

clean-all: clean clean-logs
	@echo "🧹 Full cleanup complete"

# ============================================================================
# DOCKER
# ============================================================================

docker-build:
	@echo "🐳 Building Docker image..."
	docker-compose build
	@echo "✅ Docker image built"

docker-run:
	@echo "🐳 Running Docker container..."
	docker-compose up -d
	@echo "✅ Docker container running"
	@echo "   Server available at: http://localhost:$(PORT)"
	@echo "   Health check: http://localhost:$(PORT)/health"

docker-stop:
	@echo "🛑 Stopping Docker container..."
	docker-compose down
	@echo "✅ Docker container stopped"

docker-logs:
	@echo "📋 Docker logs:"
	docker-compose logs -f app

docker-clean:
	@echo "🧹 Removing Docker containers and volumes..."
	docker-compose down -v
	@echo "✅ Docker cleanup complete"

# ============================================================================
# UTILITIES
# ============================================================================

env:
	@echo "Environment Variables:"
	@echo "  SERVICE_NAME=$(SERVICE_NAME)"
	@echo "  NODE_ENV=$(NODE_ENV)"
	@echo "  PORT=$(PORT)"
	@env | grep -E "COGNITO|JWT|DB|LOG" || true

health:
	@echo "🏥 Checking server health..."
	@curl -s http://localhost:$(PORT)/health | jq . || echo "Server not responding"

info:
	@echo "📖 Fetching server info..."
	@curl -s http://localhost:$(PORT)/info | jq . || echo "Server not responding"

# ============================================================================
# DEFAULT
# ============================================================================

.DEFAULT_GOAL := help

