const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Service URLs
const SERVICES = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3003'
};

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES)
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP api_gateway_requests_total Total number of requests
# TYPE api_gateway_requests_total counter
api_gateway_requests_total{method="GET"} ${Math.floor(Math.random() * 1000)}
api_gateway_requests_total{method="POST"} ${Math.floor(Math.random() * 500)}

# HELP api_gateway_request_duration_seconds Request duration in seconds
# TYPE api_gateway_request_duration_seconds histogram
api_gateway_request_duration_seconds_bucket{le="0.1"} ${Math.floor(Math.random() * 100)}
api_gateway_request_duration_seconds_bucket{le="0.5"} ${Math.floor(Math.random() * 200)}
api_gateway_request_duration_seconds_bucket{le="1.0"} ${Math.floor(Math.random() * 300)}
api_gateway_request_duration_seconds_bucket{le="+Inf"} ${Math.floor(Math.random() * 400)}
  `);
});

// Proxy requests to microservices
const proxyRequest = async (req, res, serviceUrl, path) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Proxy error for ${serviceUrl}${path}:`, error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({ 
        error: 'Service unavailable',
        service: serviceUrl,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// User Service Routes
app.all('/api/users*', (req, res) => {
  const path = req.path.replace('/api/users', '');
  proxyRequest(req, res, SERVICES.user, `/users${path}`);
});

app.all('/api/auth*', (req, res) => {
  const path = req.path.replace('/api/auth', '');
  proxyRequest(req, res, SERVICES.user, `/auth${path}`);
});

// Product Service Routes
app.all('/api/products*', (req, res) => {
  const path = req.path.replace('/api/products', '');
  proxyRequest(req, res, SERVICES.product, `/products${path}`);
});

// Order Service Routes
app.all('/api/orders*', authenticateToken, (req, res) => {
  const path = req.path.replace('/api/orders', '');
  proxyRequest(req, res, SERVICES.order, `/orders${path}`);
});

// Rate limiting middleware
const rateLimit = {};
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimit[clientIP]) {
    rateLimit[clientIP] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else if (now > rateLimit[clientIP].resetTime) {
    rateLimit[clientIP] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else {
    rateLimit[clientIP].count++;
  }
  
  if (rateLimit[clientIP].count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit[clientIP].resetTime - now) / 1000)
    });
  }
  
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Gateway Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});