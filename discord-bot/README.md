# Discord Bot

This service runs the star of this application, the Discord bot. In doing so we consume micro-services to provide functionality; such as the message removal persistence system.  

Unlike other services this application is a 'singleton'. So only one replica will be running at any given time.

## Kubernetes Secrets

* `discord`
  * `token`
    * The Discord API authorization token