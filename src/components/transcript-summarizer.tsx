import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaPlus, FaUpload, FaTrash, FaSpinner } from "react-icons/fa";
import { parseTranscript } from "@/lib/parse";
import Result from "./Result"; // Import the new Result component

interface Speaker {
  name: string;
  notes: string;
  color: string;
}

interface Timeframe {
  start: string;
  end: string;
  speaker: string;
}

interface Summary {
  speaker: string;
  content: string;
}

interface TranscriptSummarizerComponentProps {
  currentPage: "main" | "summary";
  setCurrentPage: (page: "main" | "summary") => void;
  darkMode: boolean;
  fontSize: number;
}

export default function TranscriptSummarizerComponent({
  currentPage,
  setCurrentPage,
  darkMode,
  fontSize,
}: TranscriptSummarizerComponentProps) {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [newSpeaker, setNewSpeaker] = useState<Speaker>({ name: "", notes: "", color: "" });
  const [newTimeframe, setNewTimeframe] = useState<Timeframe>({ start: "", end: "", speaker: "" });
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showSystemPromptTextarea, setShowSystemPromptTextarea] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const getRandomColor = () => {
    const letters = "CDEF"; // Use only the higher range of hex values to ensure light colors
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawTranscript = e.target?.result as string;
        const parsedTranscript = parseTranscript(rawTranscript);
        setTranscript(parsedTranscript);
      };
      reader.readAsText(file);
    }
  };

  const addSpeaker = () => {
    if (newSpeaker.name) {
      setSpeakers([...speakers, { ...newSpeaker, color: getRandomColor() }]);
      setNewSpeaker({ name: "", notes: "", color: "" });
    }
  };

  const deleteSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const addTimeframe = () => {
    if (newTimeframe.start && newTimeframe.end && newTimeframe.speaker) {
      setTimeframes([...timeframes, newTimeframe]);
      setNewTimeframe({ start: "", end: "", speaker: "" });
    }
  };

  const deleteTimeframe = (index: number) => {
    setTimeframes(timeframes.filter((_, i) => i !== index));
  };

  const generateSummary = async () => {
    if (speakers.length === 0 || transcript.length === 0) return;

    setIsLoading(true);

    const speakerTranscripts = speakers.map(speaker => {
      const speakerTimeframes = timeframes.filter(timeframe => timeframe.speaker === speaker.name);
      const speakerTranscriptSegments = speakerTimeframes.map(timeframe => {
        const start = `${timeframe.start}:00`;
        const end = `${timeframe.end}:59`;
        return transcript.filter(line => {
          const timestampMatch = line.match(/\d{2}:\d{2}:\d{2}/);
          if (timestampMatch) {
            const timestamp = timestampMatch[0];
            return timestamp >= start && timestamp <= end;
          }
          return false;
        }).join("\n");
      });
      const speakerTranscript = speakerTranscriptSegments.join("\n");
      return { speaker: speaker.name, transcript: speakerTranscript, background: speaker.notes, systemPrompt: systemPrompt };
    });

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ speakerTranscripts }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      const generatedSummaries = data.summaries;
      setSummaries(generatedSummaries);
      setCurrentPage("summary");
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSummaries = () => {
    const content = summaries.map((summary) => `${summary.speaker}:\n${summary.content}\n\n`).join("");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summaries.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const applyTimeframeColors = () => {
    const updatedTranscript = transcript.map((line) => {
      const timestampMatch = line.match(/\d{2}:\d{2}:\d{2}/);
      if (timestampMatch) {
        const timestamp = timestampMatch[0];
        const matchingTimeframe = timeframes.find((timeframe) => {
          const start = `${timeframe.start}:00`;
          const end = `${timeframe.end}:59`;
          return timestamp >= start && timestamp <= end;
        });
        if (matchingTimeframe) {
          const speaker = speakers.find((s) => s.name === matchingTimeframe.speaker);
          if (speaker) {
            return `<span style="background-color: ${hexToRgba(speaker.color, 0.7)}">${line}</span>`;
          }
        }
      }
      return line;
    });
    return updatedTranscript;
  };

  const coloredTranscript = applyTimeframeColors();

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white">
      {currentPage === "main" ? (
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-64px)]">
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4 flex flex-col">
              <div className="mb-4">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="transcript-upload"
                />
                <label htmlFor="transcript-upload">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <FaUpload className="mr-2" />
                      Upload Transcript
                    </span>
                  </Button>
                </label>
              </div>
              <ScrollArea className="flex-grow max-h-[830px] border border-neutral-200 rounded-md p-4 dark:border-neutral-800" style={{ fontSize: `${fontSize}px` }}>
                {coloredTranscript.length > 0 ? (
                  coloredTranscript.map((line, index) => (
                    <p key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line }}></p>
                  ))
                ) : (
                  <p className="text-neutral-500 dark:text-gray-400">Transcript will appear here after upload.</p>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            <div className="h-full p-4 flex flex-col">
              <div className="mb-4">
                <Button onClick={() => setShowSystemPromptTextarea(!showSystemPromptTextarea)} className="w-full">
                  {showSystemPromptTextarea ? "Hide System Prompt" : "Show System Prompt"}
                </Button>
                {showSystemPromptTextarea && (
                  <Textarea
                    placeholder="Enter system prompt here..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
              <h2 className="text-lg font-semibold mb-4">Speakers</h2>
              <div className="space-y-4 mb-4">
                <Input
                  placeholder="Speaker Name"
                  value={newSpeaker.name}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                />
                <Textarea
                  placeholder="Speaker Notes"
                  value={newSpeaker.notes}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, notes: e.target.value })}
                />
                <Button onClick={addSpeaker} className="w-full">
                  <FaPlus className="mr-2" /> Add Speaker
                </Button>
              </div>
              <ScrollArea className="flex-grow max-h-[700px] border border-neutral-200 rounded-md p-4 dark:border-neutral-800">
                {speakers.map((speaker, index) => (
                  <div key={index} className="mb-4 flex justify-between items-center border-b-[1px]">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-4"
                        style={{ backgroundColor: speaker.color }}
                      ></div>
                      <div className="flex-grow overflow-auto">
                        <h3 className="text-base font-medium">{speaker.name}</h3>
                        <p className="text-sm text-neutral-500 dark:text-gray-400">{speaker.notes}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => deleteSpeaker(index)}>
                      <FaTrash />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            <div className="h-full p-4 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Timeframes</h2>
              <div className="space-y-4 mb-4">
                <Input
                  type="time"
                  placeholder="Start Time"
                  value={newTimeframe.start}
                  onChange={(e) => setNewTimeframe({ ...newTimeframe, start: e.target.value })}
                />
                <Input
                  type="time"
                  placeholder="End Time"
                  value={newTimeframe.end}
                  onChange={(e) => setNewTimeframe({ ...newTimeframe, end: e.target.value })}
                />
                <Select
                  value={newTimeframe.speaker}
                  onValueChange={(value) => setNewTimeframe({ ...newTimeframe, speaker: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {speakers.map((speaker, speakerIndex) => (
                      <SelectItem key={speakerIndex} value={speaker.name}>
                        {speaker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addTimeframe} className="w-full">
                  <FaPlus className="mr-2" /> Add Timeframe
                </Button>
              </div>
              <ScrollArea className="flex-grow border max-h-[600px] border-neutral-200 rounded-md p-4 dark:border-neutral-800">
                {timeframes.map((timeframe, index) => (
                  <div key={index} className="mb-4 flex justify-between items-center border-b-[1px]">
                    <div className="flex-grow overflow-auto">
                      <h3 className="text-base font-medium">Timeframe {index + 1}</h3>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">
                        Start: {timeframe.start}, End: {timeframe.end}, Speaker: {timeframe.speaker}
                      </p>
                    </div>
                    <Button variant="ghost" onClick={() => deleteTimeframe(index)}>
                      <FaTrash />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="mt-4 space-y-4">
                <Button onClick={generateSummary} className="w-full" disabled={isLoading}>
                  {isLoading ? <FaSpinner className="animate-spin" /> : "Generate Summary"}
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <Result summaries={summaries} fontSize={fontSize} downloadSummaries={downloadSummaries} />
      )}
    </div>
  );
}