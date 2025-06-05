import { useControls } from "leva";
import React, { createContext, useContext, useRef, useState } from "react";

const SectionContext = createContext();

export const SectionProvider = ({ children }) => {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const [currentScene, setCurrentScene] = useState("into"); // "into" | "hero" | "end"

  const timelines = useRef([]);

  return (
    <SectionContext.Provider
      value={{
        containerRef,
        sectionRefs,
        timelines,
        currentScene,
        setCurrentScene,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
};

// Custom hook to use the section context
export const useSectionContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSectionContext must be used within a SectionProvider");
  }
  return context;
};
