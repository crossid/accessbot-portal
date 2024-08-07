# docker

## Build & run prod locally

This runs a production environment locally, useful in situations where a dev env works but prod not.

This assumes caddy has a rule such `reverse_proxy /portal* acme.local.accessbot.app:3002`

```bash
docker build -t crossid-accessbot-portal:dev .
# Determine the IP of the host
docker run --rm alpine sh -c 'ping -c 1 host.docker.internal | grep PING'
# > PING host.docker.internal (192.168.65.2): 56 data bytes
# Add to .env.local NODE_TLS_REJECT_UNAUTHORIZED=0
docker run --env-file .env.local -p 3002:3000 --add-host acme.local.accessbot.app:192.168.65.2 crossid-accessbot-portal:dev
```
