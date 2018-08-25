host requirements:
- Docker (https://docker.com)
- Kubernetes (https://kubernetes.io)
- Minio (https://minio.io)

global kubernetes secrets:

`bugsnag`: `kratos=683568b765e8a637fa38e04ec681ce6a` (in a real env this should be broken down per-service, but i'm gonna throw it all at one bugsnag app for our purposes)
`minio`: `access=...` `secret=...`
