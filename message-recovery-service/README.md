# Message Recovery

This service is tasked with providing a solution to storing messages removed on any given Discord guild. That responsibility emcompasses both the initial ingestion of messages (including any media associated with them) and exposing a method to retrieve those entities.

## Approach

Exposing a HTTP based RESTful formed API to reliably accomplish our goal.  

We will be using two datastores to back the service:
* Postgres, for metadata
* Flat file, for media
  
xx


### Endpoints

`GET` `/messages/:guildID`  

#### Parameters:
* guildID
  * Type: `Number`
  * The Discord guild ID
* limit
  * Type: `Number`
  * The maximum amount of entities to fetch
* before?
  * Type: `UNIX Epoch Timestamp`
  * Determine the starting point at which messages are searched for

#### Response Body
```json
{
    success: boolean,
    result: Message[]
}
```

  
`POST` `/messages/:guildID`

#### Parameters:
* guildID
  * Type: `Number`
  * The Discord guild ID

#### Request Body Example

A message with media (either by direct attatchment or address within the content):
```json
{
    content: "",
    sent_by_discord_id: 0,
    discord_channel_id: 0,
    discord_message_id: 0,
    media: [
        {
            url: "https://cdn.discordapp.com/....."
        }
    ]
}
```
  
Plain message
```json
{
    content: "hey",
    sent_by_discord_id: 0,
    discord_channel_id: 0,
    discord_message_id: 0,
}
```


### Models

#### Message
```json
{
    id: Number,
    sent_by_id: Number,
    content: String - must be defined though it may be empty,
    discord_channel_id: Number,
    discord_message_id: Number,
    media?: MessageMedia[]
}
```

#### MessageMedia
```json
{
   id: UUID
}
```