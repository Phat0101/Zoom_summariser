import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

interface SpeakerTranscript {
  speaker: string;
  transcript: string;
}

export async function POST(req: Request) {
  const { speakerTranscripts }: { speakerTranscripts: SpeakerTranscript[] } = await req.json();
  console.log('speakerTranscripts', speakerTranscripts);

  try {
    const summaries = await Promise.all(speakerTranscripts.map(async ({ speaker, transcript }) => {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Summarize the following transcript for ${speaker}: ${transcript}`
              }
            ]
          }
        ]
      });
      return { speaker, content: text };
    }));

    console.log('summaries', summaries);
    return NextResponse.json({ summaries }, { status: 200 });
  } catch (error) {
    console.error('Error generating summaries:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}