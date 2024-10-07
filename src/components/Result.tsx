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
    <div className="p-4 h-screen">
      <h2 className="text-2xl font-bold mb-4">Summaries</h2>
      {summaries.length > 0 ? (
        <div>
          {summaries.map((summary, index) => (
            <div key={index} className="mb-4 p-4 border border-neutral-200 rounded-md dark:border-neutral-800">
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
          <Button onClick={downloadSummaries} className="mt-4">
            <FaDownload className="mr-2" /> Download Summaries
          </Button>
        </div>
      ) : (
        <p className="text-neutral-500 dark:text-gray-400">Summaries will appear here after generation.</p>
      )}
    </div>
  );
};

export default Result;