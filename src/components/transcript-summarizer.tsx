'use client'

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
import Result from "./Result";
import { motion } from "framer-motion";

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
    const letters = "CDEF";
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
      setSpeakers(prevSpeakers => [...(prevSpeakers || []), { ...newSpeaker, color: getRandomColor() }]);
      setNewSpeaker({ name: "", notes: "", color: "" });
    }
  };

  const deleteSpeaker = (index: number) => {
    setSpeakers(prevSpeakers => (prevSpeakers || []).filter((_, i) => i !== index));
  };

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const handleTimeChange = (value: string, field: 'start' | 'end') => {
    if (!value) {
      setNewTimeframe(prev => ({ ...prev, [field]: "" }));
      return;
    }

    const digits = value.replace(/\D/g, '');
    
    if (digits.length < 6) {
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
    
    const hours = digits.substring(0, 2);
    const minutes = digits.substring(2, 4);
    const seconds = digits.substring(4, 6);
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
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
      setTimeframes(prevTimeframes => [...(prevTimeframes || []), newTimeframe]);
      setNewTimeframe({ start: "", end: "", speaker: "" });
    } else {
      alert("Please enter valid time format (HH:MM:SS)");
    }
  };

  const deleteTimeframe = (index: number) => {
    setTimeframes(prevTimeframes => (prevTimeframes || []).filter((_, i) => i !== index));
  };

  const generateSummary = async () => {
    if (!speakers || speakers.length === 0 || !transcript || transcript.length === 0) return;

    setIsLoading(true);

    const speakerTranscripts = speakers.map(speaker => {
      const speakerTimeframes = (timeframes || []).filter(timeframe => timeframe.speaker === speaker.name);
      const speakerTranscriptSegments = speakerTimeframes.map(timeframe => {
        return transcript.filter(line => {
          const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
          if (timestampMatch) {
            const timestamp = timestampMatch[0];
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
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSummaries = () => {
    if (!summaries || summaries.length === 0) return;
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
    if (!transcript || transcript.length === 0) return [];
    const updatedTranscript = transcript.map((line) => {
      const timestampMatch = line.match(/\d{2}:\d{2}:\d{2}/);
      if (timestampMatch) {
        const timestamp = timestampMatch[0];
        const matchingTimeframe = (timeframes || []).find((timeframe) => {
          return timestamp >= timeframe.start && timestamp <= timeframe.end;
        });
        if (matchingTimeframe) {
          const speaker = (speakers || []).find((s) => s.name === matchingTimeframe.speaker);
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
      <div className={`bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-[calc(100vh-64px)] transition-colors duration-300`}>
        {currentPage === "main" ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50}>
              <motion.div
                className="h-full p-4 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex-none mb-4">
                  <Input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="transcript-upload"
                  />
                  <label htmlFor="transcript-upload">
                    <Button variant="outline" className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" asChild>
                      <span>
                        <FaUpload className="mr-2" />
                        Upload Transcript
                      </span>
                    </Button>
                  </label>
                  <Button onClick={saveTranscript} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200">
                    Save Transcript
                  </Button>
                </div>
                <ScrollArea 
                  className="flex-1 border border-gray-200 rounded-md p-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner" 
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div ref={scrollContainerRef}>
                    {coloredTranscript && coloredTranscript.length > 0 ? (
                      coloredTranscript.map((line, index) => (
                        <p
                          key={index}
                          ref={el => {
                            if (el) {
                              lineRefs.current[index] = el;
                            }
                          }}
                          className="whitespace-pre-wrap mb-2"
                          dangerouslySetInnerHTML={{ __html: line }}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        Transcript will appear here after upload.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <motion.div
                className="h-full p-4 flex flex-col"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex-none mb-4">
                  <Button onClick={() => setShowSystemPromptTextarea(!showSystemPromptTextarea)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200">
                    {showSystemPromptTextarea ? "Hide System Prompt" : 

 "Show System Prompt"}
                  </Button>
                  {showSystemPromptTextarea && (
                    <Textarea
                      placeholder="Enter system prompt here..."
                      value={systemPrompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
                      className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  )}
                </div>
                <h2 className="flex-none text-lg font-semibold mb-4">Speakers</h2>
                <div className="flex-none space-y-4 mb-4">
                  <Input
                    placeholder="Speaker Name"
                    value={newSpeaker.name}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <Textarea
                    placeholder="Speaker Notes"
                    value={newSpeaker.notes}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, notes: e.target.value })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <Button onClick={addSpeaker} className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
                    <FaPlus className="mr-2" /> Add Speaker
                  </Button>
                </div>
                <ScrollArea className="flex-1 border border-gray-200 rounded-md p-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner">
                  {speakers && speakers.map((speaker, index) => (
                    <motion.div
                      key={index}
                      className="mb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-4"
                          style={{ backgroundColor: speaker.color }}
                        ></div>
                        <div className="flex-grow overflow-auto">
                          <h3 className="text-base font-medium">{speaker.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{speaker.notes}</p>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => deleteSpeaker(index)} className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </Button>
                    </motion.div>
                  ))}
                </ScrollArea>
              </motion.div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <motion.div
                className="h-full p-4 flex flex-col"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="flex-none text-lg font-semibold mb-4">Timeframes</h2>
                <div className="flex-none space-y-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                      Start Time (HH:MM:SS)
                    </label>
                    <Input
                      placeholder="00:00:00"
                      value={newTimeframe.start}
                      onChange={(e) => handleTimeChange(e.target.value, 'start')}
                      maxLength={8}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                      End Time (HH:MM:SS)
                    </label>
                    <Input
                      placeholder="00:00:00"
                      value={newTimeframe.end}
                      onChange={(e) => handleTimeChange(e.target.value, 'end')}
                      maxLength={8}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select
                    value={newTimeframe.speaker}
                    onValueChange={(value) => setNewTimeframe({ ...newTimeframe, speaker: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select Speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {speakers && speakers.map((speaker, speakerIndex) => (
                        <SelectItem key={speakerIndex} value={speaker.name}>
                          {speaker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addTimeframe} className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
                    <FaPlus className="mr-2" /> Add Timeframe
                  </Button>
                </div>
                <ScrollArea className="flex-1 border border-gray-200 rounded-md p-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner">
                  {timeframes && timeframes.map((timeframe, index) => (
                    <motion.div 
                      key={index} 
                      className="mb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => scrollToTimeframe(timeframe.start)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex-grow overflow-auto">
                        <h3 className="text-base font-medium">Timeframe {index + 1}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Start: {timeframe.start}, End: {timeframe.end}, Speaker: {timeframe.speaker}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTimeframe(index);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </Button>
                    </motion.div>
                  ))}
                </ScrollArea>
                <div className="flex-none mt-4 space-y-4">
                  <Button
                    onClick={generateSummary}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                    {isLoading ? "Generating..." : "Generate Summary"}
                  </Button>
                </div>
              </motion.div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Result summaries={summaries || []} fontSize={fontSize} downloadSummaries={downloadSummaries} />
        )}
      </div>
  );
}