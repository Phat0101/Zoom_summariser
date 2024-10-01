// FILE: transcript-summarizer.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaPlus, FaUpload, FaTrash, FaDownload } from "react-icons/fa"
import { parseTranscript } from "@/lib/parse"

interface Speaker {
  name: string
  notes: string
}

interface Timeframe {
  start: string
  end: string
  speaker: string
}

interface Summary {
  speaker: string
  content: string
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
  const [transcript, setTranscript] = useState<string[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [timeframes, setTimeframes] = useState<Timeframe[]>([])
  const [newSpeaker, setNewSpeaker] = useState<Speaker>({ name: "", notes: "" })
  const [newTimeframe, setNewTimeframe] = useState<Timeframe>({ start: "", end: "", speaker: "" })
  const [summaries, setSummaries] = useState<Summary[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const rawTranscript = e.target?.result as string;
        const parsedTranscript = parseTranscript(rawTranscript);
        setTranscript(parsedTranscript);
      }
      reader.readAsText(file)
    }
  }

  const addSpeaker = () => {
    if (newSpeaker.name) {
      setSpeakers([...speakers, newSpeaker])
      setNewSpeaker({ name: "", notes: "" })
    }
  }

  const deleteSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index))
  }

  const addTimeframe = () => {
    if (newTimeframe.start && newTimeframe.end && newTimeframe.speaker) {
      setTimeframes([...timeframes, newTimeframe])
      setNewTimeframe({ start: "", end: "", speaker: "" })
    }
  }

  const deleteTimeframe = (index: number) => {
    setTimeframes(timeframes.filter((_, i) => i !== index))
  }

  const generateSummary = () => {
    // Placeholder for AI summary generation
    const generatedSummaries = speakers.map(speaker => ({
      speaker: speaker.name,
      content: `Summary for ${speaker.name}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
    }))
    setSummaries(generatedSummaries)
    setCurrentPage("summary")
  }

  const downloadSummaries = () => {
    const content = summaries.map(summary => `${summary.speaker}:\n${summary.content}\n\n`).join("")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "summaries.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

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
                {transcript.length > 0 ? (
                  transcript.map((line, index) => (
                    <p key={index} className="whitespace-pre-wrap">{line}</p>
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
              <ScrollArea className="flex-grow border border-neutral-200 rounded-md p-4 dark:border-neutral-800">
                {speakers.map((speaker, index) => (
                  <div key={index} className="mb-4 flex justify-between items-center border-b-[1px]">
                    <div className="flex-grow overflow-auto">
                      <h3 className="text-base font-medium">{speaker.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">{speaker.notes}</p>
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
              <ScrollArea className="flex-grow border border-neutral-200 rounded-md p-4 dark:border-neutral-800">
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
                <Button onClick={generateSummary} className="w-full">Generate Summary</Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Summaries</h2>
          {summaries.length > 0 ? (
            <div>
              {summaries.map((summary, index) => (
                <div key={index} className="mb-4 p-4 border border-neutral-200 rounded-md dark:border-neutral-800">
                  <h3 className="text-xl font-semibold mb-2">{summary.speaker}</h3>
                  <p>{summary.content}</p>
                </div>
              ))}
              <Button onClick={downloadSummaries} className="mt-4">
                <FaDownload className="mr-2" /> Download Summaries
              </Button>
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-gray-400">Summaries will appear here after generation.</p>
          )}
        </div>
      )}
    </div>
  )
}