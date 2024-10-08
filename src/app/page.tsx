'use client';

import { useState } from "react";
import NavBar from '@/components/NavBar';
import TranscriptSummarizerComponent from '@/components/transcript-summarizer';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"main" | "summary">("main");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeFontSize = (increase: boolean) => {
    setFontSize(prevSize => increase ? prevSize + 1 : prevSize - 1);
  };

  return (
    <>
      <NavBar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        changeFontSize={changeFontSize}
      />
      <TranscriptSummarizerComponent
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        fontSize={fontSize}
      />
    </>
  );
}