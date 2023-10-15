type AppSettingsSection = 'General' | 'Credentials' | 'Data';

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
