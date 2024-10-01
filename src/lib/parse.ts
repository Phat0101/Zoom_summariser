// FILE: parse.ts

export function parseTranscript(rawTranscript: string): string[] {
  const lines = rawTranscript.split('\n\n');
  const parsedLines: string[] = [];
  let currentLine = '';

  lines.forEach(line => {
    const match = line.match(/\[(.*?)\]\s+(\d{2}:\d{2}:\d{2})\s+(.*)/);
    if (match) {
      const [, , time, text] = match;
      if (currentLine) {
        parsedLines.push(currentLine);
      }
      currentLine = `${time} ${text}`;
    } else if (currentLine) {
      currentLine += ` ${line.trim()}`;
    }
  });

  if (currentLine) {
    parsedLines.push(currentLine);
  }

  return parsedLines;
}