CREATE TYPE player AS (
    userID      text,
    username    text,
    "role"      text,
    connected   boolean
);

CREATE TABLE sessions (
    session_id  text primary key,
    user_id     text,
    game_id     text,
    connected   boolean not null
);

CREATE TABLE games (
    game_id         text primary key,
    game_code       text,
    players         JSON,
    createdAt       BIGINT,
    startedAt       BIGINT,
    endedAt         BIGINT,
    phase           text NOT NULL,
    prompt          TEXT,
    submissions     JSON,
    results         JSON,
    turn            INT
);

-- change timestamps from bigint to TIMESTAMPTZ?
-- change players to player type
-- validation?

DROP TYPE IF EXISTS player;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS games;