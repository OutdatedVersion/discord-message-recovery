-- Discord IDs are a specialized version of a Snowflake (64-bit unsigned value)


-- -----------------
-- TABLES
-- -----------------

-- A representation of a message removed on Discord; the leading entity behind this service
CREATE TABLE IF NOT EXISTS message (
    id                  SERIAL,
    discord_guild_id    BIGINT    NOT NULL,
    discord_channel_id  BIGINT    NOT NULL,
    discord_message_id  BIGINT    NOT NULL,
    content             TEXT,
    sent_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    removed_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT unique_messages UNIQUE (discord_guild_id, discord_channel_id, discord_message_id) 
);

-- Meta on media (pictures/videos) linked to a message
CREATE TABLE IF NOT EXISTS message_media (
    id          SERIAL,
    message_id  INT,
    -- The file's name
    name        TEXT    NOT NULL,
    -- The extension of the file
    type        TEXT    NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (message_id) REFERENCES message (id)
);