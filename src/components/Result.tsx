import React from "react";
import { Button } from "@/components/ui/button";
import { FaDownload } from "react-icons/fa";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Summary {
  speaker: string;
  content: string;
}

interface ResultProps {
  summaries: Summary[];
  fontSize: number;
  downloadSummaries: () => void;
}

const Result: React.FC<ResultProps> = ({ summaries, fontSize, downloadSummaries }) => {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4">
      <div className="flex-none mb-4">
        <h2 className="text-2xl font-bold">Summaries</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {summaries.length > 0 ? (
          <div className="space-y-4">
            {summaries.map((summary, index) => (
              <div key={index} className="p-4 border border-neutral-200 rounded-md dark:border-neutral-800">
                <h3 className="text-xl font-semibold mb-2">{summary.speaker}</h3>
                <div style={{ fontSize: `${fontSize}px` }}>
                  <Markdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <SyntaxHighlighter
                            style={ materialDark }
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {summary.content}
                  </Markdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 dark:text-gray-400">
            Summaries will appear here after generation.
          </p>
        )}
      </div>
      <div className="flex-none mt-4">
        <Button onClick={downloadSummaries}>
          <FaDownload className="mr-2" /> Download Summaries
        </Button>
      </div>
    </div>
  );
};

export default Result;