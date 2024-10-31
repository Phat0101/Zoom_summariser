import React, { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
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
  start: string;  // Format: "HH:MM:SS"
  end: string;    // Format: "HH:MM:SS"
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
  const [mounted, setMounted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [speakers, setSpeakers] = useLocalStorage<Speaker[]>('speakers', []);
  const [timeframes, setTimeframes] = useLocalStorage<Timeframe[]>('timeframes', []);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string>('systemPrompt', '');
  const [summaries, setSummaries] = useLocalStorage<Summary[]>('summaries', []);
  const [newSpeaker, setNewSpeaker] = useState<Speaker>({ name: "", notes: "", color: "" });
  const [newTimeframe, setNewTimeframe] = useState<Timeframe>({ start: "", end: "", speaker: "" });
  const [showSystemPromptTextarea, setShowSystemPromptTextarea] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<{ [key: string]: HTMLParagraphElement }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const savedTranscript = localStorage.getItem('transcript');
    if (savedTranscript) {
      setTranscript(JSON.parse(savedTranscript));
    }
  }, [mounted]);

  if (!mounted) {
    return null;
  }

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

  const saveTranscript = () => {
    localStorage.setItem('transcript', JSON.stringify(transcript));
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

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const handleTimeChange = (value: string, field: 'start' | 'end') => {
    // Allow empty value for deletion
    if (!value) {
      setNewTimeframe(prev => ({ ...prev, [field]: "" }));
      return;
    }

    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Don't pad with zeros if user is still typing or deleting
    if (digits.length < 6) {
      // Format partially typed time
      let formattedTime = digits;
      if (digits.length > 2) {
        formattedTime = digits.substring(0, 2) + ':' + digits.substring(2);
      }
      if (digits.length > 4) {
        formattedTime = formattedTime.substring(0, 5) + ':' + formattedTime.substring(5);
      }
      setNewTimeframe(prev => ({ ...prev, [field]: formattedTime }));
      return;
    }
    
    // Format complete time
    const hours = digits.substring(0, 2);
    const minutes = digits.substring(2, 4);
    const seconds = digits.substring(4, 6);
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    // Only update if it's a valid time
    if (validateTimeFormat(formattedTime)) {
      setNewTimeframe(prev => ({ ...prev, [field]: formattedTime }));
    }
  };

  const addTimeframe = () => {
    if (newTimeframe.start && 
        newTimeframe.end && 
        newTimeframe.speaker && 
        validateTimeFormat(newTimeframe.start) && 
        validateTimeFormat(newTimeframe.end) &&
        newTimeframe.start <= newTimeframe.end) {
      setTimeframes([...timeframes, newTimeframe]);
      setNewTimeframe({ start: "", end: "", speaker: "" });
    } else {
      // You might want to add error handling here
      alert("Please enter valid time format (HH:MM:SS)");
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
        return transcript.filter(line => {
          const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
          if (timestampMatch) {
            const timestamp = timestampMatch[0];
            // Include exact start and end times
            return timestamp >= timeframe.start && timestamp <= timeframe.end;
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
          // Use exact timestamps from timeframe
          return timestamp >= timeframe.start && timestamp <= timeframe.end;
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

  const scrollToTimeframe = (start: string) => {
    const lines = transcript;
    for (let i = 0; i < lines.length; i++) {
      const timestampMatch = lines[i].match(/(\d{2}:\d{2}:\d{2})/);
      if (timestampMatch && timestampMatch[0] >= start) {
        const ref = lineRefs.current[i];
        if (ref && scrollContainerRef.current) {
          ref.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    }
  };

  const coloredTranscript = applyTimeframeColors();

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white h-[calc(100vh-64px)]">
      {currentPage === "main" ? (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4 flex flex-col">
              <div className="flex-none mb-4">
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
                <Button onClick={saveTranscript} className="w-full mt-2">
                  Save Transcript
                </Button>
              </div>
              <ScrollArea 
                className="flex-1 border border-neutral-200 rounded-md p-4 dark:border-neutral-800" 
                style={{ fontSize: `${fontSize}px` }}
              >
                <div ref={scrollContainerRef}>
                  {coloredTranscript.length > 0 ? (
                    coloredTranscript.map((line, index) => (
                      <p
                        key={index}
                        ref={el => {
                          if (el) {
                            lineRefs.current[index] = el;
                          }
                        }}
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: line }}
                      />
                    ))
                  ) : (
                    <p className="text-neutral-500 dark:text-gray-400">
                      Transcript will appear here after upload.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            <div className="h-full p-4 flex flex-col">
              <div className="flex-none mb-4">
                <Button onClick={() => setShowSystemPromptTextarea(!showSystemPromptTextarea)} className="w-full">
                  {showSystemPromptTextarea ? "Hide System Prompt" : "Show System Prompt"}
                </Button>
                {showSystemPromptTextarea && (
                  <Textarea
                  placeholder="Enter system prompt here..."
                  value={systemPrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
                  className="mt-2"
                  />
                )}
              </div>
              <h2 className="flex-none text-lg font-semibold mb-4">Speakers</h2>
              <div className="flex-none space-y-4 mb-4">
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
              <ScrollArea className="flex-1 border border-neutral-200 rounded-md p-4 dark:border-neutral-800">
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
              <h2 className="flex-none text-lg font-semibold mb-4">Timeframes</h2>
              <div className="flex-none space-y-4 mb-4">
                <div>
                  <label className="text-sm text-neutral-500 dark:text-gray-400 mb-1 block">
                    Start Time (HH:MM:SS)
                  </label>
                  <Input
                    placeholder="00:00:00"
                    value={newTimeframe.start}
                    onChange={(e) => handleTimeChange(e.target.value, 'start')}
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-500 dark:text-gray-400 mb-1 block">
                    End Time (HH:MM:SS)
                  </label>
                  <Input
                    placeholder="00:00:00"
                    value={newTimeframe.end}
                    onChange={(e) => handleTimeChange(e.target.value, 'end')}
                    maxLength={8}
                  />
                </div>
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
              <ScrollArea className="flex-1 border border-neutral-200 rounded-md p-4 dark:border-neutral-800">
                {timeframes.map((timeframe, index) => (
                  <div 
                    key={index} 
                    className="mb-4 flex justify-between items-center border-b-[1px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => scrollToTimeframe(timeframe.start)}
                  >
                    <div className="flex-grow overflow-auto">
                      <h3 className="text-base font-medium">Timeframe {index + 1}</h3>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">
                        Start: {timeframe.start}, End: {timeframe.end}, Speaker: {timeframe.speaker}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering scroll when deleting
                        deleteTimeframe(index);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex-none mt-4 space-y-4">
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