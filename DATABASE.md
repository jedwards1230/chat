```sql
-- Users Table
CREATE TABLE Users (
    userId VARCHAR(255) PRIMARY KEY
);

-- Create chat thread table
CREATE TABLE public.chat_threads (
    id character varying(255) NOT NULL,
    user_id character varying(255),
    created timestamp without time zone NOT NULL,
    "lastModified" timestamp without time zone NOT NULL,
    title text NOT NULL,
    "agentConfig" json NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE
);

-- Create message table
CREATE TABLE public.messages (
    id character varying(255) NOT NULL,
    chat_thread_id character varying(255) NOT NULL,
    content text NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp without time zone,
    name character varying(255),
    function_call json,
    message_order serial,
    PRIMARY KEY (id),
    FOREIGN KEY (chat_thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE
);

-- Create shared chat thread table
CREATE TABLE public.shared_chat_threads (
    id character varying(255) NOT NULL,
    user_id character varying(255),
    original_thread_id character varying(255) NOT NULL,
    created timestamp without time zone NOT NULL,
    "lastModified" timestamp without time zone NOT NULL,
    title text NOT NULL,
    "agentConfig" json NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE,
    FOREIGN KEY (original_thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE
);

-- Create shared message table
CREATE TABLE public.shared_messages (
    id character varying(255) NOT NULL,
    shared_thread_id character varying(255) NOT NULL,
    content text NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp without time zone,
    name character varying(255),
    function_call json,
    message_order serial,
    PRIMARY KEY (id),
    FOREIGN KEY (shared_thread_id) REFERENCES public.shared_chat_threads(id) ON DELETE CASCADE
);

-- Create agent_config table
CREATE TABLE public.agent_config (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id character varying(255),
    name character varying(255) NOT NULL,
    tools json NOT NULL,
    "toolsEnabled" boolean NOT NULL,
    model character varying(50) NOT NULL,
    temperature numeric NOT NULL,
    "systemMessage" text NOT NULL,
    "topP" numeric NOT NULL,
    "N" integer NOT NULL,
    "maxTokens" integer NOT NULL,
    "frequencyPenalty" numeric NOT NULL,
    "presencePenalty" numeric NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE
);

CREATE INDEX idx_agent_config_user_id
ON public.agent_config (user_id);

```
