# Chat: Conversational AI Application

![Default Page](./screenshots/screenshot-0.png)

![Chat Page](./screenshots/screenshot-1.png)

## Description

Chat is an open-source alternative to ChatGPT, leveraging LLMs to offer a dynamic chat experience. It serves as a platform where users can interact with an AI, customize its personality, and engage in meaningful conversation. Ideal for those seeking a virtual assistant, language practice, or simply an engaging conversation.

## Key Features

Chat comes with a range of features designed to enhance user experience:

-   **Chat Personalization**: Customize the AI's personality with a leading system message.
-   **Share Chat**: Share your conversations with a generated link.
-   **Data Storage**: Securely stores data in a Supabase database or local browser storage.
-   **Forked Chat**: Fork a chat to create a new branch with the same chat history.
-   **OAuth Access**: Provides GitHub OAuth access via Auth.js.
-   **Responsive Design**: Offers a responsive design with dark mode and PWA.
-   **Interactivity**: The AI can hold a conversation and use functions to perform tasks.
-   **Fast Streaming**: Leverages Edge Functions for quick and seamless exchanges.

## Installation

To install and run the application locally, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `pnpm i` to install the necessary packages.
4. Use the `example.env` file to create a `.env.local` file.
5. Run `npm run dev` to start the application.

## Technologies Used

-   Next.js (React)
-   Edge Functions
-   TypeScript
-   Shadcn/ui & Tailwind CSS
-   OpenAI API
-   OAuth with Auth.js
-   Supabase (PostgreSQL)

## Contribution

All contributions are welcome. Feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. For more details, please see the [LICENSE.md](LICENSE.md) file.
