type AppSettingsSection = 'General' | 'Credentials' | 'Data';

interface SearchResult {
    /** Query used with Search Engine API */
    query: string;
    url: string;
    snippet: string;
    title: string;
    /** AI-generated summary */
    content?: string;
    error?: string;
    /** Finished analysis for primary chat */
    reviewed?: boolean;
    /** Fime taken to store text embeddings  */
    timeToComplete?: number;
}

type User =
    | {
          name?: string | null;
          email?: string | null;
          image?: string | null;
      }
    | undefined;

type PlausibleHook = (
    eventName: string,
    {
        props: { threadId, usedCloudKey },
    }: {
        props: { threadId: string; usedCloudKey: boolean };
    },
) => any;
