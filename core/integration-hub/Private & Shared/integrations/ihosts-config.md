# iHosts Configuration Guide

## Local Host Entries for Development

The integration hub provides host entries for local development and testing.

## Host Entries Configuration

### Integration Hub Host Entry
```
# Character Database Integration Hub
127.0.0.1       character-hub.local
127.0.0.1       api.character-hub.local
127.0.0.1       docs.character-hub.local
```

### Development Environment Hosts
```
# Development Environment
127.0.0.1       localhost.character-hub.local
127.0.0.1       dev.character-hub.local
127.0.0.1       staging.character-hub.local
```

## iHosts Setup Instructions

### Method 1: Manual Hosts File Edit

**macOS/Linux**:
```bash
sudo nano /etc/hosts
```

**Windows**:
```
Open Notepad as Administrator
File → Open → C:\Windows\System32\drivers\etc\hosts
```

Add the entries above to your hosts file.

### Method 2: Using iHosts API

The hub provides a GET endpoint to retrieve host entries:

**Endpoint**: `GET http://localhost:3000/api/ihosts/entries`

**Response**:
```json
{
  "entries": [
    {
      "ip": "127.0.0.1",
      "hostname": "character-hub.local",
      "description": "Character Database Integration Hub"
    },
    {
      "ip": "127.0.0.1",
      "hostname": "api.character-hub.local",
      "description": "API endpoint for character data"
    }
  ]
}
```

### Method 3: Automated Script

Create a script to update hosts file automatically:

```bash
#!/bin/bash
# update-hosts.sh

# Fetch host entries from hub
curl -s http://localhost:3000/api/ihosts/entries > /tmp/hosts-entries.json

# Parse and add to hosts file
echo "# Character Database Integration Hub" | sudo tee -a /etc/hosts
cat /tmp/hosts-entries.json | jq -r '.entries[] | "\(.ip)       \(.hostname) # \(.description)"' | sudo tee -a /etc/hosts
```

## Usage Examples

### Access via Custom Hostnames

Instead of `http://localhost:3000`, use:

- **Main Hub**: `http://character-hub.local:3000`
- **API Endpoints**: `http://api.character-hub.local:3000/api/characters`
- **Documentation**: `http://docs.character-hub.local:3000/api/docs`

### SSL/HTTPS Setup (Optional)

For HTTPS with custom hostnames, use a reverse proxy:

**nginx.conf**:
```nginx
server {
    listen 443 ssl;
    server_name character-hub.local;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Testing Host Configuration

### Verify DNS Resolution
```bash
# Test host resolution
ping character-hub.local
dig character-hub.local
nslookup character-hub.local
```

### Test Web Access
```bash
# Test HTTP access
curl http://character-hub.local:3000/health
curl http://api.character-hub.local:3000/api/characters
```

## Troubleshooting

### Hosts File Not Updating
- Run with administrator/sudo privileges
- Check file permissions
- Verify hosts file path for your OS

### Hostname Not Resolving
- Flush DNS cache:
  - macOS: `sudo dscacheutil -flushcache`
  - Linux: `sudo systemd-resolve --flush-caches`
  - Windows: `ipconfig /flushdns`
- Check for conflicting entries in hosts file
- Verify no firewall blocking localhost

### Port Conflicts
- Ensure port 3000 is available
- Check for other services using the port
- Modify `INTEGRATION_PORT` environment variable if needed

## Security Considerations

- Custom hostnames only work locally (127.0.0.1)
- Do not expose hosts file changes to production
- Use environment-specific configurations
- Review hosts file periodically for security

## Integration with Other Tools

### Docker Networks
```bash
# Add Docker container hostname
# In docker-compose.yml
extra_hosts:
  - "character-hub.local:host-gateway"
```

### Browser Extensions
Configure browser extensions to allow custom hostnames:
- CORS proxies
- Local development tools
- API testing tools

## Removal

To remove custom host entries:
1. Edit hosts file
2. Remove lines starting with `127.0.0.1` and the custom hostnames
3. Save file
4. Flush DNS cache
