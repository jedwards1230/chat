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
    lastModified timestamp without time zone NOT NULL,
    title text NOT NULL,
    agentConfig json NOT NULL,
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
    PRIMARY KEY (id),
    FOREIGN KEY (chat_thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE
);

```
