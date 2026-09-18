# Network Toolbox Diagnostics Configuration

## Overview

Network Toolbox can monitor and diagnose the integration hub's network performance, connectivity, and health status.

## Diagnostics Endpoints

The integration hub provides dedicated endpoints for network diagnostics and monitoring.

### 1. Network Diagnostics
**Endpoint**: `GET http://localhost:3000/api/network/diagnostics`

**Response**:
```json
{
  "server": {
    "status": "running",
    "port": 3000,
    "uptime": 3600
  },
  "network": {
    "interface": "lo0",
    "ipAddress": "127.0.0.1",
    "hostname": "localhost"
  },
  "performance": {
    "memoryUsage": "45MB",
    "cpuUsage": "2.5%",
    "responseTime": "12ms"
  },
  "connections": {
    "active": 5,
    "total": 150
  }
}
```

### 2. Health Check
**Endpoint**: `GET http://localhost:3000/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-17T20:30:10.216Z",
  "uptime": 3600,
  "charactersLoaded": 45
}
```

### 3. Performance Metrics
**Endpoint**: `GET http://localhost:3000/api/network/performance`

**Response**:
```json
{
  "requestCount": 150,
  "averageResponseTime": "15ms",
  "errorRate": "0.5%",
  "throughput": "12 req/s"
}
```

## Network Toolbox Setup Instructions

### Method 1: Manual Configuration

1. **Open Network Toolbox**
2. **Add New Monitor**:
   - Name: "Character Hub Monitor"
   - Type: HTTP Endpoint
   - URL: `http://localhost:3000/health`
   - Interval: 30 seconds

3. **Configure Alerts**:
   - Alert on response time > 500ms
   - Alert on status code != 200
   - Alert on uptime < 99%

4. **Add Diagnostics**:
   - Network connectivity test
   - DNS resolution check
   - Port availability test

### Method 2: Import Configuration

Create a Network Toolbox configuration file:

```json
{
  "monitors": [
    {
      "id": "health_monitor",
      "name": "Hub Health Check",
      "type": "HTTP",
      "url": "http://localhost:3000/health",
      "interval": 30,
      "timeout": 5000,
      "expectedStatus": 200,
      "alerts": {
        "responseTime": {
          "threshold": 500,
          "action": "notify"
        },
        "status": {
          "allowed": [200],
          "action": "critical"
        }
      }
    },
    {
      "id": "api_monitor",
      "name": "API Performance",
      "type": "HTTP",
      "url": "http://localhost:3000/api/characters",
      "interval": 60,
      "timeout": 10000,
      "expectedStatus": 200,
      "alerts": {
        "responseTime": {
          "threshold": 1000,
          "action": "warn"
        }
      }
    }
  ],
  "diagnostics": [
    {
      "id": "connectivity",
      "name": "Network Connectivity",
      "type": "ping",
      "target": "localhost",
      "interval": 60
    },
    {
      "id": "port_check",
      "name": "Port Availability",
      "type": "port",
      "target": "localhost:3000",
      "interval": 60
    }
  ]
}
```

### Method 3: Automated Monitoring Script

Create a monitoring script that integrates with Network Toolbox:

```bash
#!/bin/bash
# network-monitor.sh

HUB_URL="http://localhost:3000"
ALERT_WEBHOOK="YOUR_WEBHOOK_URL"

check_health() {
    response=$(curl -s -w "\n%{http_code}" "$HUB_URL/health")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" -ne 200 ]; then
        send_alert "Health check failed: $status_code"
    fi
    
    echo "$body" | jq -r '.status'
}

check_performance() {
    start_time=$(date +%s%N)
    curl -s "$HUB_URL/api/characters" > /dev/null
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$duration" -gt 1000 ]; then
        send_alert "Slow response: ${duration}ms"
    fi
    
    echo "Response time: ${duration}ms"
}

send_alert() {
    message="$1"
    curl -X POST "$ALERT_WEBHOOK" -d "{\"message\": \"$message\"}"
}

# Run checks
check_health
check_performance
```

## Monitoring Scenarios

### Health Monitoring

**Continuous Health Checks**:
- Monitor `/health` endpoint every 30 seconds
- Alert on non-200 status codes
- Track uptime percentage
- Monitor character data loading

**Alert Configuration**:
- Critical: Hub down for > 1 minute
- Warning: Response time > 500ms
- Info: Character count changes

### Performance Monitoring

**Response Time Tracking**:
- Monitor API response times
- Track average response time
- Identify slow endpoints
- Alert on performance degradation

**Resource Usage**:
- Monitor memory usage
- Track CPU utilization
- Monitor connection count
- Alert on resource exhaustion

### Network Diagnostics

**Connectivity Tests**:
- Ping server availability
- Test DNS resolution
- Check port accessibility
- Verify network latency

**Bandwidth Monitoring**:
- Track data transfer
- Monitor request size
- Calculate throughput
- Alert on unusual patterns

## Integration with Network Toolbox Features

### Dashboard Integration

Create a custom dashboard:

```json
{
  "dashboard": {
    "title": "Character Hub Network Status",
    "widgets": [
      {
        "type": "status",
        "title": "Hub Status",
        "endpoint": "/health"
      },
      {
        "type": "chart",
        "title": "Response Time",
        "endpoint": "/api/network/performance",
        "metric": "responseTime"
      },
      {
        "type": "counter",
        "title": "Total Requests",
        "endpoint": "/api/network/performance",
        "metric": "requestCount"
      }
    ]
  }
}
```

### Alert Integration

Configure alerts to multiple channels:

```json
{
  "alerts": {
    "channels": [
      {
        "type": "email",
        "address": "admin@example.com"
      },
      {
        "type": "slack",
        "webhook": "https://hooks.slack.com/..."
      },
      {
        "type": "webhook",
        "url": "https://your-alert-system.com/api/alerts"
      }
    ],
    "rules": [
      {
        "condition": "status != healthy",
        "severity": "critical"
      },
      {
        "condition": "responseTime > 1000",
        "severity": "warning"
      }
    ]
  }
}
```

### Log Aggregation

Integrate with logging systems:

```json
{
  "logging": {
    "enabled": true,
    "endpoint": "/api/network/logs",
    "format": "json",
    "retention": "7days",
    "export": {
      "s3": {
        "bucket": "your-logs-bucket",
        "prefix": "character-hub/"
      }
    }
  }
}
```

## Troubleshooting

### Connectivity Issues

**Hub Not Reachable**:
- Check if hub is running: `http://localhost:3000/health`
- Verify port 3000 is not blocked
- Check firewall settings
- Test with curl: `curl http://localhost:3000/health`

**Slow Response Times**:
- Check server resource usage
- Verify network latency
- Check for network congestion
- Review request complexity

### Monitoring Issues

**Incorrect Metrics**:
- Verify endpoint is accessible
- Check response format
- Validate JSON structure
- Test with curl first

**Alert Not Triggering**:
- Check alert configuration
- Verify alert thresholds
- Test alert conditions
- Check notification channels

### Performance Issues

**High Memory Usage**:
- Monitor character data size
- Check for memory leaks
- Review caching strategy
- Optimize data loading

**High CPU Usage**:
- Check request frequency
- Optimize query performance
- Review algorithm efficiency
- Add request rate limiting

## Advanced Features

### Predictive Monitoring

Use historical data to predict issues:

```javascript
// Predict response time trends
function predictResponseTime(history) {
    const trend = calculateTrend(history);
    const prediction = extrapolate(trend);
    
    if (prediction > threshold) {
        triggerAlert("Predicted performance degradation");
    }
}
```

### Automated Recovery

Implement automated recovery actions:

```javascript
// Auto-restart on failure
if (healthCheck.status !== 'healthy') {
    restartHub();
    notifyAdmin("Hub restarted automatically");
}
```

### Custom Metrics

Add custom metrics to track:

```json
{
  "customMetrics": [
    {
      "name": "character_search_success_rate",
      "endpoint": "/api/network/metrics",
      "calculation": "successful_searches / total_searches"
    },
    {
      "name": "unique_users",
      "endpoint": "/api/network/metrics",
      "calculation": "count(distinct user_id)"
    }
  ]
}
```

## Security Considerations

- Secure diagnostic endpoints in production
- Use authentication for monitoring
- Limit diagnostic information exposure
- Encrypt monitoring data in transit
- Regularly audit monitoring access

## Best Practices

1. **Baseline Metrics**: Establish performance baselines
2. **Alert Thresholds**: Set realistic alert thresholds
3. **Regular Reviews**: Review monitoring configuration regularly
4. **Testing**: Test alert system periodically
5. **Documentation**: Document monitoring setup
6. **Redundancy**: Use multiple monitoring tools
7. **Performance**: Minimize monitoring overhead

## Quick Start Commands

```bash
# Quick health check
curl http://localhost:3000/health

# Network diagnostics
curl http://localhost:3000/api/network/diagnostics

# Performance metrics
curl http://localhost:3000/api/network/performance

# Continuous monitoring
watch -n 30 'curl -s http://localhost:3000/health | jq'

# Response time test
time curl http://localhost:3000/api/characters/random
```
