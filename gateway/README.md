# Gateway

This service exposes the ingresses/service that serve the public facing web side.

## Kubernetes Secrets

* `traefik-dashboard-auth`
  * The `htpasswd` file responsible for providing authentication to the `/traefik` route
