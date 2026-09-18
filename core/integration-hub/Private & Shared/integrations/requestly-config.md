# Requestly HTTP Interception Rules Configuration

## Overview

Requestly can intercept, modify, and redirect HTTP requests to integrate with the character database hub.

## Predefined Rules

The integration hub provides predefined Requestly rules for API interception and modification.

### Rule 1: Redirect Character API Requests
**Type**: Redirect Request
**Condition**: URL matches `*/api/characters*`
**Action**: Redirect to `http://localhost:3000/api/characters`

**Use Case**: Redirect external character API calls to local hub for development

### Rule 2: Modify Character Search Response
**Type**: Modify Response
**Condition**: URL matches `*/api/characters/search*`
**Action**: Add custom fields to response

**Use Case**: Enrich search results with additional metadata

### Rule 3: Add Authentication Headers
**Type**: Modify Headers
**Condition**: URL matches `*/api/notion/*`
**Action**: Add `Authorization: Bearer YOUR_API_KEY`

**Use Case**: Add authentication for Notion integration

### Rule 4: Cache Character Data
**Type**: Cache Request
**Condition**: URL matches `*/api/characters/random`
**Action**: Cache response for 5 minutes

**Use Case**: Improve performance for random character requests

### Rule 5: Log API Calls
**Type**: Console Log
**Condition**: URL matches `*/api/*`
**Action**: Log request details to console

**Use Case**: Debug and monitor API usage

## Requestly Setup Instructions

### Method 1: Import from Hub API

**Endpoint**: `GET http://localhost:3000/api/requestly/rules`

**Response**:
```json
{
  "rules": [
    {
      "id": "rule_redirect_api",
      "name": "Redirect Character API to Local Hub",
      "type": "Redirect",
      "condition": {
        "resourceType": ["XHR", "Fetch"],
        "urlFilter": {
          "operator": "Contains",
          "value": "/api/characters"
        }
      },
      "action": {
        "type": "Redirect",
        "destination": "http://localhost:3000/api/characters"
      }
    },
    {
      "id": "rule_add_auth",
      "name": "Add Notion API Authentication",
      "type": "ModifyHeaders",
      "condition": {
        "resourceType": ["XHR", "Fetch"],
        "urlFilter": {
          "operator": "Contains",
          "value": "/api/notion"
        }
      },
      "action": {
        "type": "ModifyHeaders",
        "headers": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_NOTION_API_KEY"
          }
        ]
      }
    }
  ]
}
```

### Method 2: Manual Configuration in Requestly

1. **Install Requestly Browser Extension**
2. **Open Requestly Dashboard**
3. **Create New Rule**:

**Redirect Rule**:
- Rule Type: Redirect Request
- Name: "Redirect Character API"
- Condition: URL contains `/api/characters`
- Destination: `http://localhost:3000/api/characters`

**Modify Headers Rule**:
- Rule Type: Modify Headers
- Name: "Add Auth Headers"
- Condition: URL contains `/api/notion`
- Headers: Add `Authorization: Bearer YOUR_KEY`

**Modify Response Rule**:
- Rule Type: Modify Response
- Name: "Enrich Character Data"
- Condition: URL contains `/api/characters`
- Response Modification: Add custom fields

### Method 3: Export/Import Rules

Create a rules JSON file for import:

```json
{
  "rules": [
    {
      "id": "1",
      "name": "Redirect Character API",
      "enabled": true,
      "ruleType": "Redirect",
      "conditions": [
        {
          "conditionType": "UrlFilter",
          "operator": "Contains",
          "value": "/api/characters"
        }
      ],
      "actions": [
        {
          "actionType": "Redirect",
          "pair": {
            "key": "destination",
            "value": "http://localhost:3000/api/characters"
          }
        }
      ]
    },
    {
      "id": "2",
      "name": "Add CORS Headers",
      "enabled": true,
      "ruleType": "ModifyHeaders",
      "conditions": [
        {
          "conditionType": "UrlFilter",
          "operator": "Contains",
          "value": "/api"
        }
      ],
      "actions": [
        {
          "actionType": "ModifyHeaders",
          "pair": {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        }
      ]
    }
  ]
}
```

## Common Use Cases

### Development Workflow

**Redirect Production API to Local**:
- Rule: Redirect `https://api.example.com/characters` → `http://localhost:3000/api/characters`
- Benefit: Test local changes without modifying code

**Mock API Responses**:
- Rule: Modify response for specific endpoints
- Benefit: Test error handling and edge cases

**Add Debug Headers**:
- Rule: Add `X-Debug: true` to all API requests
- Benefit: Enable debug mode on server

### Testing Scenarios

**Simulate Slow Network**:
- Rule: Add delay to API responses
- Use Case: Test loading states and timeouts

**Inject Test Data**:
- Rule: Modify response to include test characters
- Use Case: Test UI with specific data

**Error Simulation**:
- Rule: Return 500 errors for specific endpoints
- Use Case: Test error handling

### Performance Optimization

**Cache Frequent Requests**:
- Rule: Cache `/api/characters/random` for 5 minutes
- Benefit: Reduce server load

**Batch Requests**:
- Rule: Combine multiple single requests into batch
- Benefit: Reduce network overhead

**Compress Responses**:
- Rule: Add compression headers
- Benefit: Reduce bandwidth usage

## Advanced Configuration

### Dynamic Headers

Use JavaScript to generate dynamic headers:

```javascript
// Add timestamp header
{
  "key": "X-Request-Time",
  "value": "{{timestamp}}"
}

// Add session ID
{
  "key": "X-Session-ID",
  "value": "{{sessionId}}"
}
```

### Conditional Rules

Create rules based on conditions:

```json
{
  "conditions": [
    {
      "conditionType": "UrlFilter",
      "operator": "Contains",
      "value": "/api/characters"
    },
    {
      "conditionType": "QueryParam",
      "operator": "Equals",
      "key": "rarity",
      "value": "Legendary"
    }
  ]
}
```

### Response Transformation

Modify response body using JavaScript:

```javascript
// Add calculated field
{
  "type": "ModifyResponseBody",
  "script": "response.data.power = response.data.budget / 1000;"
}
```

## Integration with Other Tools

### Browser DevTools
- Use Requestly with Chrome DevTools
- Monitor intercepted requests
- Debug rule execution

### Postman
- Export Requestly rules
- Import into Postman
- Use for API testing

### CI/CD
- Export rules as JSON
- Version control rules
- Automate rule deployment

## Troubleshooting

### Rules Not Applying
- Check rule is enabled
- Verify condition matches request
- Check rule priority/order
- Clear browser cache

### Response Modification Issues
- Verify response content type
- Check JavaScript syntax
- Test modification script separately
- Check for CORS issues

### Performance Impact
- Disable unnecessary rules
- Use specific conditions
- Cache frequently used rules
- Monitor rule execution time

## Security Considerations

- Never include API keys in shared rules
- Use environment variables for sensitive data
- Review rules before sharing
- Audit rule usage regularly
- Use HTTPS in production

## Best Practices

1. **Naming Conventions**: Use descriptive rule names
2. **Organization**: Group related rules
3. **Documentation**: Add comments to complex rules
4. **Testing**: Test rules in development first
5. **Version Control**: Export and version control rules
6. **Performance**: Monitor impact on browser performance
7. **Security**: Keep sensitive data out of rules

## Rule Templates

### API Debugging Template
```json
{
  "name": "API Debugging",
  "rules": [
    "Log all API requests",
    "Add timing headers",
    "Cache responses"
  ]
}
```

### Development Template
```json
{
  "name": "Development",
  "rules": [
    "Redirect to local API",
    "Mock error responses",
    "Add CORS headers"
  ]
}
```

### Performance Template
```json
{
  "name": "Performance",
  "rules": [
    "Cache frequent requests",
    "Compress responses",
    "Batch requests"
  ]
}
```
