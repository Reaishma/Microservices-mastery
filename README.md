# Microservices-mastery Application 
A deep dive into microservices 

# Live Demo 🚀
 **click for live demo** - https://reaishma.github.io/Microservices-mastery/

## Interactive Real-time Features:
- Real-time service monitoring with status indicators
- Architecture visualization showing the complete system flow
- Deployment timeline with progress tracking
- Interactive controls for Blue-Green and Canary deployments
- Live metrics simulation (response times, request counts, error rates)
- Health check functionality with visual feedback

![Overview](https://github.com/Reaishma/Microservices-mastery/blob/main/chrome_screenshot_Sep%206%2C%202025%2011_17_04%20AM%20GMT%2B05_30.png)


## 🏗️ Complete Microservices Architecture:

### User Services:
- **API Gateway (Port 3000)** - Request routing, authentication, rate limiting
- **Product Service (Port 3001)** - User management with PostgreSQL
- **Product Service (Port 3002)** - Product catalog with MongoDB
- **Order Service (Port 3003)** - Order processing with PostgreSQL

## Infrastructure Components:
- Docker containers for each service with health checks
- Docker Compose orchestration with networking
- PostgreSQL & MongoDB databases
- Redis caching layer
- Nginx load balancer
- Prometheus monitoring
- Grafana dashboards

## 🚀 Key Features Implemented:

- JWT authentication & authorization
- Input validation & error handling
- Database connection pooling
- Health check endpoints
- Metrics collection for monitoring
- Proper logging and security headers

## DevOps Best Practices:

![Deployment](https://github.com/Reaishma/Microservices-mastery/blob/main/chrome_screenshot_Sep%206%2C%202025%2011_17_31%20AM%20GMT%2B05_30.png)

- Multi-stage Docker builds
- Non-root container users
- Health checks in containers
- Environment-based configuration
- Proper service discovery

**This is fully interactive - you can click on services to see details, trigger deployments, run health checks, and watch real-time metrics updates. All the backend services are properly structured with REST APIs, database integration, and monitoring endpoints**

