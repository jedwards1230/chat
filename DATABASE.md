```sql
-- Create ENUM type for Role
CREATE TYPE "Role" AS ENUM ('system', 'user', 'assistant', 'function');

-- Users table
CREATE TABLE "Users" (
    "userId" VARCHAR(255) PRIMARY KEY NOT NULL
);

-- AgentConfigs table
CREATE TABLE "AgentConfigs" (
    "id" UUID PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "tools" VARCHAR[] NOT NULL,
    "toolsEnabled" BOOLEAN NOT NULL,
    "model" JSONB NOT NULL,
    "systemMessage" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

-- ChatThreads table
CREATE TABLE "ChatThreads" (
    "id" UUID PRIMARY KEY NOT NULL,
    "created" TIMESTAMP NOT NULL,
    "lastModified" TIMESTAMP NOT NULL,
    "title" TEXT NOT NULL,
    "agentConfigId" UUID NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    FOREIGN KEY ("agentConfigId") REFERENCES "AgentConfigs"("id"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

-- Messages table
CREATE TABLE "Messages" (
    "id" UUID PRIMARY KEY NOT NULL,
    "content" TEXT,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP,
    "functionCallName" TEXT,
    "functionCallArguments" JSONB,
    "threadId" UUID NOT NULL,
    "active" BOOLEAN DEFAULT FALSE,
    FOREIGN KEY ("threadId") REFERENCES "ChatThreads"("id") ON DELETE CASCADE
);

-- MessageRelationships table
CREATE TABLE "MessageRelationships" (
    "parentMessageId" UUID NOT NULL,
    "childMessageId" UUID NOT NULL,
    PRIMARY KEY ("parentMessageId", "childMessageId"),
    FOREIGN KEY ("parentMessageId") REFERENCES "Messages"("id") ON DELETE CASCADE,
    FOREIGN KEY ("childMessageId") REFERENCES "Messages"("id") ON DELETE CASCADE
);

-- SharedChatThreads table
CREATE TABLE "SharedChatThreads" (
    "id" VARCHAR(255) PRIMARY KEY NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "originalThreadId" UUID NOT NULL,
    "created" TIMESTAMP NOT NULL,
    "lastModified" TIMESTAMP NOT NULL,
    "title" TEXT NOT NULL,
    "agentConfig" JSON NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE,
    FOREIGN KEY ("originalThreadId") REFERENCES "ChatThreads"("id") ON DELETE CASCADE
);

-- SharedMessages table
CREATE TABLE "SharedMessages" (
    "id" VARCHAR(255) PRIMARY KEY NOT NULL,
    "sharedThreadId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP,
    "name" VARCHAR(255),
    "functionCall" JSON,
    FOREIGN KEY ("sharedThreadId") REFERENCES "SharedChatThreads"("id") ON DELETE CASCADE
);

-- Create index
CREATE INDEX "idxAgentConfigUserId"
ON "AgentConfigs" ("userId");
```
