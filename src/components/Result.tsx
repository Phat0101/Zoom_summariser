import React from "react";
import { Button } from "@/components/ui/button";
import { FaDownload } from "react-icons/fa";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

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
    <motion.div
      className="h-[calc(100vh-64px)] flex flex-col p-4 bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-none mb-4">
        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Summaries</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {summaries.length > 0 ? (
          <div className="space-y-4">
            {summaries.map((summary, index) => (
              <motion.div
                key={index}
                className="p-6 border border-gray-200 rounded-lg shadow-md dark:border-gray-700 bg-white dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">{summary.speaker}</h3>
                <div style={{ fontSize: `${fontSize}px` }} className="prose dark:prose-invert max-w-none">
                  <Markdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <SyntaxHighlighter
                            style={materialDark}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={`${className} bg-gray-100 dark:bg-gray-700 rounded-md px-1`} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {summary.content}
                  </Markdown>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Summaries will appear here after generation.
          </p>
        )}
      </div>
      <div className="flex-none mt-4">
        <Button onClick={downloadSummaries} className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
          <FaDownload className="mr-2" /> Download Summaries
        </Button>
      </div>
    </motion.div>
  );
};

export default Result;