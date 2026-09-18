# ChiefPilot TZI - Development & Deployment Makefile

.PHONY: help install dev build start stop restart test lint docker-build docker-run docker-stop docker-clean deploy clean

# Color codes for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
RED := \033[0;31m
NC := \033[0m

# Default port
PORT ?= 3000

help: ## Show this help message
	@echo "ChiefPilot TZI - Development & Deployment Commands"
	@echo ""
	@echo "$(BLUE)Development$(NC):"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development server (Vite + Express)"
	@echo "  make build      - Build production bundle"
	@echo "  make start      - Start production server"
	@echo "  make stop       - Stop running server"
	@echo "  make restart    - Restart server"
	@echo "  make lint       - Run TypeScript lint"
	@echo "  make test       - Run tests"
	@echo ""
	@echo "$(BLUE)Docker$(NC):"
	@echo "  make docker-build    - Build Docker image"
	@echo "  make docker-run      - Run with Docker Compose"
	@echo "  make docker-stop     - Stop Docker containers"
	@echo "  make docker-clean    - Remove Docker containers and images"
	@echo "  make docker-dev      - Run dev mode with Docker"
	@echo ""
	@echo "$(BLUE)Deployment$(NC):"
	@echo "  make deploy         - Deploy to production (uses Docker)"
	@echo "  make clean          - Clean all build artifacts"
	@echo ""

# Install dependencies
install:
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

# Development mode (Vite dev server + Express)
dev:
	@echo "$(YELLOW)Starting development server on port $(PORT)...$(NC)"
	npm run dev

# Production build
build:
	@echo "$(YELLOW)Building production bundle...$(NC)"
	npm run build
	@echo "$(GREEN)Build complete!$(NC)"

# Start production server
start:
	@echo "$(YELLOW)Starting production server on port $(PORT)...$(NC)"
	node dist/server.cjs

# Stop server (find and kill process)
stop:
	@echo "$(YELLOW)Stopping server...$(NC)"
	@pkill -f "node.*server" || true
	@echo "$(GREEN)Server stopped!$(NC)"

# Restart server
restart: stop start

# Lint
test:
	@echo "$(YELLOW)Running tests...$(NC)"
	@echo "$(BLUE)Note: Add test scripts to package.json$(NC)"

# Lint
lint:
	@echo "$(YELLOW)Running linter...$(NC)"
	npm run lint

# Docker: Build image
docker-build:
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker build -t chiefpilot-tzi:latest -f Dockerfile .
	@echo "$(GREEN)Docker image built!$(NC)"

# Docker: Run with compose
docker-run:
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	docker compose -f docker-compose.yml up -d
	@echo "$(GREEN)Containers running!$(NC)"

# Docker: Run dev mode
docker-dev:
	@echo "$(YELLOW)Starting Docker dev mode...$(NC)"
	docker compose -f docker-compose.yml --profile dev up

# Docker: Stop containers
docker-stop:
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker compose -f docker-compose.yml down
	@echo "$(GREEN)Containers stopped!$(NC)"

# Docker: Clean (remove containers, images, volumes)
docker-clean:
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	docker compose -f docker-compose.yml down --rmi local --volumes
	docker system prune -f
	@echo "$(GREEN)Docker resources cleaned!$(NC)"

# Deploy (build and push)
deploy:
	@echo "$(YELLOW)Deploying to production...$(NC)"
	@echo "$(BLUE)Note: Configure your deployment platform first$(NC)"
	make build
	docker build -t chiefpilot-tzi:production .
	@echo "$(GREEN)Ready to deploy! Push to your registry.$(NC)"

# Clean all build artifacts
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	npm run clean
	rm -rf dist node_modules
	@echo "$(GREEN)Clean complete!$(NC)"
