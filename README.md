# Zoom AI Summariser

A Next.js application that helps summarize Zoom transcripts using Google's Generative AI (Gemini).

## Use Case
This tool is designed to solve a common problem with Zoom transcripts where multiple speakers share the same device, resulting in the transcript attributing all speech to a single user. The application allows you to:

- Segment the transcript by different speakers and time periods
- Add speaker profiles and background information
- Customize the AI system prompt for better summarization
- Generate individual summaries for each speaker's contribution
- Export the formatted summaries for further use

## Prerequisites

Before you begin, you'll need:
- Node.js installed on your system
- A Google Cloud account with access to Gemini API
- A Gemini API key (Get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Setup

1. Clone this repository
2. Create a `.env` file in the root directory and add your Gemini API key:
GOOGLE_GENERATIVE_AI_API_KEY=

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install required packages:

```bash
npm run i
```

Second, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
