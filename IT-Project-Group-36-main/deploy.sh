#!/bin/bash

# IT Project Docker Deployment Script
# This script helps you deploy the application with Docker

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_info "Please edit .env file and set your configuration."
            print_info "Press Enter when ready to continue..."
            read
        else
            print_error ".env.example not found!"
            exit 1
        fi
    fi
}

# Check Firebase credentials
check_firebase_credentials() {
    if [ ! -f flask-server/it-project-auth.json ]; then
        print_error "Firebase credentials file not found at flask-server/it-project-auth.json"
        print_info "Please place your Firebase service account JSON file in flask-server/"
        exit 1
    fi
    print_success "Firebase credentials found!"
}

# Choose MongoDB option
choose_mongodb_option() {
    print_info "Choose MongoDB configuration:"
    echo "1) Use MongoDB Atlas (cloud) - DEFAULT"
    echo "2) Use Local MongoDB in Docker"
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        2)
            export COMPOSE_FILE="docker-compose.local-mongo.yml"
            print_info "Using local MongoDB configuration"
            ;;
        *)
            export COMPOSE_FILE="docker-compose.yml"
            print_info "Using MongoDB Atlas configuration"
            ;;
    esac
}

# Build containers
build_containers() {
    print_info "Building Docker containers..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    print_success "Containers built successfully!"
}

# Start containers
start_containers() {
    print_info "Starting Docker containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Containers started successfully!"
}

# Wait for services to be healthy
wait_for_services() {
    print_info "Waiting for services to be ready..."
    sleep 5
    
    # Check backend health
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:5000/health >/dev/null 2>&1; then
            print_success "Backend is healthy!"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "Backend health check timeout. Check logs with: docker-compose logs backend"
    fi
    
    # Check frontend
    if curl -f http://localhost/ >/dev/null 2>&1; then
        print_success "Frontend is accessible!"
    else
        print_warning "Frontend may not be ready yet. Check logs with: docker-compose logs frontend"
    fi
}

# Show service information
show_service_info() {
    echo ""
    print_success "=== Deployment Complete! ==="
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend:        http://localhost"
    echo "   Backend API:     http://localhost:5000/api"
    echo "   API Docs:        http://localhost:5000/api/docs/"
    echo "   Health Check:    http://localhost:5000/health"
    
    if [ "$COMPOSE_FILE" = "docker-compose.local-mongo.yml" ]; then
        echo "   Mongo Express:   http://localhost:8081"
        echo "                    (username: admin, password: admin)"
    fi
    
    echo ""
    echo "🔧 Useful Commands:"
    echo "   View logs:       docker-compose -f $COMPOSE_FILE logs -f"
    echo "   Stop services:   docker-compose -f $COMPOSE_FILE stop"
    echo "   Restart:         docker-compose -f $COMPOSE_FILE restart"
    echo "   Remove all:      docker-compose -f $COMPOSE_FILE down"
    echo ""
    
    print_info "To view service status: docker-compose -f $COMPOSE_FILE ps"
}

# Show logs
show_logs() {
    print_info "Showing service logs (Ctrl+C to exit)..."
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Main deployment function
deploy() {
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   IT Project - Docker Deployment Script              ║"
    echo "║   Mentor-Mentee Booking System                        ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    check_env_file
    check_firebase_credentials
    choose_mongodb_option
    
    print_info "Starting deployment process..."
    build_containers
    start_containers
    wait_for_services
    show_service_info
    
    echo ""
    read -p "Do you want to view the logs? (y/n): " view_logs
    if [ "$view_logs" = "y" ] || [ "$view_logs" = "Y" ]; then
        show_logs
    fi
}

# Handle script arguments
case "${1:-}" in
    "build")
        print_info "Building containers only..."
        choose_mongodb_option
        build_containers
        ;;
    "start")
        print_info "Starting containers..."
        choose_mongodb_option
        start_containers
        wait_for_services
        show_service_info
        ;;
    "stop")
        print_info "Stopping containers..."
        choose_mongodb_option
        docker-compose -f "$COMPOSE_FILE" stop
        print_success "Containers stopped!"
        ;;
    "down")
        print_info "Stopping and removing containers..."
        choose_mongodb_option
        docker-compose -f "$COMPOSE_FILE" down
        print_success "Containers removed!"
        ;;
    "logs")
        choose_mongodb_option
        show_logs
        ;;
    "status")
        choose_mongodb_option
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    *)
        deploy
        ;;
esac
