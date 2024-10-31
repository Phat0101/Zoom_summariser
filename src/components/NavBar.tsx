import React from 'react'
import { Button } from "@/components/ui/button"
import { FaMoon, FaSun, FaFont } from "react-icons/fa"
import { motion } from "framer-motion"

interface NavBarProps {
  currentPage: "main" | "summary";
  setCurrentPage: (page: "main" | "summary") => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  changeFontSize: (increase: boolean) => void;
}

export default function NavBar({
  currentPage,
  setCurrentPage,
  darkMode,
  toggleDarkMode,
  changeFontSize,
}: NavBarProps) {
  return (
    <motion.nav
      className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex space-x-2">
        <Button
          onClick={() => setCurrentPage("main")}
          variant={currentPage === "main" ? "secondary" : "ghost"}
          className="dark:text-white hover:text-purple-400"
        >
          Main
        </Button>
        <Button
          onClick={() => setCurrentPage("summary")}
          variant={currentPage === "summary" ? "secondary" : "ghost"}
          className="dark:text-white hover:text-purple-400"
        >
          Summary
        </Button>
      </div>
      <h2 className="font-bold text-2xl">Zoom Summariser</h2>
      <div className="flex space-x-2">
        <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="text-white hover:text-purple-400">
          {darkMode ? <FaSun /> : <FaMoon />}
        </Button>
        <Button onClick={() => changeFontSize(true)} variant="ghost" size='icon' className="text-white hover:text-purple-400">
          <FaFont className="mr-1" /> +
        </Button>
        <Button onClick={() => changeFontSize(false)} variant="ghost"  size='icon' className="text-white hover:text-purple-400">
          <FaFont className="mr-1" /> -
        </Button>
      </div>
    </motion.nav>
  )
}