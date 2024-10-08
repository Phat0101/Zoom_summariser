import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

interface SpeakerTranscript {
  speaker: string;
  transcript: string;
  background: string;
  systemPrompt: string;
}

export async function POST(req: Request) {
  const { speakerTranscripts }: { speakerTranscripts: SpeakerTranscript[] } = await req.json();
  console.log('speakerTranscripts', speakerTranscripts);
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    const summaries = [];
    for (const { speaker, transcript, background, systemPrompt } of speakerTranscripts) {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        system: `You are an expert in summarising transcript. You will summarise zoom transcript in Australian English. Please use formal language.
        This is the extra information about the speaker: Speaker name: ${speaker}
        Background: ${background}
        Extra instructions: ${systemPrompt}`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Summarise the following transcript for: 
                ${transcript}`
              }
            ]
          }
        ]
      });
      summaries.push({ speaker, content: text });
      await delay(500); // Wait for 500ms before making the next request
    }

    console.log('summaries', summaries);
    return NextResponse.json({ summaries }, { status: 200 });
  } catch (error) {
    console.error('Error generating summaries:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}