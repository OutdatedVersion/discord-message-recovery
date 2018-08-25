# Message Recovery

This service is tasked with providing a solution to storing messages removed on any given Discord guild. That responsibility emcompasses both the initial ingestion of messages (including any media associated with them) and exposing a method to retrieve those entities.


## Approach

Exposing a HTTP based RESTful formed API to reliably accomplish our goal.  

We will be using two datastores to back the service:
* Postgres, for metadata
* Minio object store, for media


## Kubernetes Secrets

* `message-recovery-service-postgres`
  * `password`
    * The password the Postgres instance will use


### Endpoints

`GET` `/messages/:guildID`  

#### Parameters:
* guildID
  * Type: `Snowflake`
  * The Discord guild ID
* limit
  * Type: `Number`
  * The maximum amount of entities to fetch
* before?
  * Type: `UNIX Epoch Timestamp`
  * Determine the starting point at which messages are searched for


#### Response Body
```js
{
    success: boolean,
    result: Message[]
}
```

  
`POST` `/messages/:guildID`

#### Parameters:
* guildID
  * Type: `Snowflake`
  * The Discord guild ID

#### Request Body Example

A message with media (either by direct attatchment or address within the content):
```js
{
    content: "hey",
	discordChannelID: "161283779376316417",
	discordMessageID: "161283779376316417",
	sentByDiscordID: "161283779376316417",
	discordGuildID: "161283779376316417",
	sentAt: 1534912035,
	removedAt: 1534912035,
    media: [
        "https://media.discordapp.net/..."
    ]
}
```
  
Plain message
```js
{
    content: "hey",
	discordChannelID: "161283779376316417",
	discordMessageID: "161283779376316417",
	sentByDiscordID: "161283779376316417",
	discordGuildID: "161283779376316417",
	sentAt: 1534912035,
	removedAt: 1534912035
}
```

We wrap Snowflakes in a string as a number is likely to be truncated.


### Models

#### Message
```js
{
    id: 134,
    discord_guild_id: Snowflake,
    discord_channel_id: Snowflake,
    discord_message_id: Snowflake,
    sent_by_discord_id: Snowflake
    content: String,
    sent_at: Timestamp,
    removed_at: Timestamp,
    media?: MessageMedia[]
}
```

#### MessageMedia
```js
{
   name: String,
   type: String
}
```
