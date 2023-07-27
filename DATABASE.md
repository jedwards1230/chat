```sql
-- Users Table
CREATE TABLE Users (
    userId VARCHAR(255) PRIMARY KEY
);

-- Create chat thread table
CREATE TABLE public.chat_threads (
    id character varying(255) NOT NULL,
    created timestamp without time zone NOT NULL,
    lastModified timestamp without time zone NOT NULL,
    title text NOT NULL,
    agentConfig json NOT NULL,
    PRIMARY KEY (id)
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
    PRIMARY KEY (id),
    FOREIGN KEY (chat_thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE
);

-- Create config table
CREATE TABLE public.configs (
    user_id character varying(255) NOT NULL,
    model character varying(255) NOT NULL,
    temperature numeric NOT NULL,
    systemMessage text NOT NULL,
    topP numeric NOT NULL,
    N integer NOT NULL,
    maxTokens integer NOT NULL,
    frequencyPenalty numeric NOT NULL,
    presencePenalty numeric NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES public.users(userid)
);

-- Create save data table
CREATE TABLE public.save_data (
    user_id character varying(255) NOT NULL,
    chat_history_id character varying(255) NOT NULL,
    config_id character varying(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users(userid),
    FOREIGN KEY (chat_history_id) REFERENCES public.chat_threads(id),
    FOREIGN KEY (config_id) REFERENCES public.configs(user_id)
);
```
