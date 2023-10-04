```sql
-- Create ENUM type for Role
CREATE TYPE "Role" AS ENUM ('system', 'user', 'assistant', 'function');

-- Users table
CREATE TABLE "Users" (
    "userId" VARCHAR(255) PRIMARY KEY
);

-- Messages table
CREATE TABLE "Messages" (
    "id" UUID PRIMARY KEY,
    "content" TEXT,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP,
    "functionCallName" TEXT,
    "functionCallArguments" JSONB,
    "threadId" UUID,
    FOREIGN KEY ("threadId") REFERENCES "ChatThreads"("id") ON DELETE CASCADE
);

-- MessageRelationships table
CREATE TABLE "MessageRelationships" (
    "parentMessageId" UUID,
    "childMessageId" UUID,
    PRIMARY KEY ("parentMessageId", "childMessageId"),
    FOREIGN KEY ("parentMessageId") REFERENCES "Messages"("id") ON DELETE CASCADE,
    FOREIGN KEY ("childMessageId") REFERENCES "Messages"("id") ON DELETE CASCADE
);

-- AgentConfigs table
CREATE TABLE "AgentConfigs" (
    "id" UUID PRIMARY KEY,
    "name" TEXT,
    "tools" VARCHAR[],
    "toolsEnabled" BOOLEAN,
    "model" JSONB,
    "systemMessage" TEXT,
    "userId" VARCHAR(255),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

-- ChatThreads table
CREATE TABLE "ChatThreads" (
    "id" UUID PRIMARY KEY,
    "created" TIMESTAMP NOT NULL,
    "lastModified" TIMESTAMP NOT NULL,
    "title" TEXT,
    "currentNode" UUID,
    "agentConfigId" UUID,
    "userId" VARCHAR(255),
    FOREIGN KEY ("currentNode") REFERENCES "ChildMessages"("id") ON DELETE CASCADE,
    FOREIGN KEY ("agentConfigId") REFERENCES "AgentConfigs"("id"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

-- SharedChatThreads table
CREATE TABLE "SharedChatThreads" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255),
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
    "id" VARCHAR(255) PRIMARY KEY,
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
