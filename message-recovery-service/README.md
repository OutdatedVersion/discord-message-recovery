# Kratos

As an exercise in pursuit of further familiarizing myself with some cool technology I took on reworking this project.

## Stack
- [Docker](https://docker.com)
- [Kubernetes](https://kubernetes.io)
- [Minio](https://minio.io)
- [Node.js](https://nodejs.org)
- [Postgres](https://www.postgresql.org)


## Components

At the moment the application itself (which is excluding dependencies; such as datastores) is broken into three distinct, though not neccessarily decoupled, components.

* gateway
* discord-bot
* message-recovery-service

Details on each of these may be viewed within their respective directory.


## Global Kubernetes Secrets

* `kratos-bugsnag`
  * `token`
    * The authorization token
    * Note: In a different environment it would be a great move to break error reporting into multiple projects. I throw it all at one to save on operating cost.
* `minio`
  * `access`
    * Minio access key (akin to a username)
  * `secret`
    * Minio secret key (akin to a password)