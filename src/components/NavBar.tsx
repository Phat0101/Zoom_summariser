import { Button } from "@/components/ui/button"
import { FaMoon, FaSun, FaFont } from "react-icons/fa"

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
    <nav className="flex justify-between items-center p-4 bg-gray-100 dark:bg-black text-black dark:text-white border-b-[1px]">
      <div>
        <Button onClick={() => setCurrentPage("main")} variant={currentPage === "main" ? "default" : "outline"} className="mr-2">
          Main
        </Button>
        <Button onClick={() => setCurrentPage("summary")} variant={currentPage === "summary" ? "default" : "outline"}>
          Summary
        </Button>
      </div>
      <h2 className="font-bold text-xl">
        Zoom AI Summariser
      </h2>
      <div>
        <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="mr-1">
          {darkMode ? <FaSun /> : <FaMoon />}
        </Button>
        <Button onClick={() => changeFontSize(true)} variant="ghost" className="px-2 mr-1">
          <FaFont /> +
        </Button>
        <Button onClick={() => changeFontSize(false)} variant="ghost" className="px-2">
          <FaFont /> -
        </Button>
      </div>
    </nav>
  )
}