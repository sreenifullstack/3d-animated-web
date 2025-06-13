import { useTracker } from "@14islands/r3f-scroll-rig";
import { useControls } from "leva";
import React, { createContext, useContext, useRef, useState } from "react";

const TrackerContext = createContext();

export const TrackerProvider = ({ children }) => {
  const containerRef = useRef(null);

  const [sectionEl, setSectionEl] = useState(null);
  const [currentScene, setCurrentScene] = useState();

  const tracker = useTracker(containerRef);

  const timelines = useRef([]);

  return (
    <TrackerContext.Provider
      value={{
        containerRef,
        sectionEl,
        tracker,
        currentScene,
        setCurrentScene,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

// Custom hook to use the section context
export const useTrackerContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useTrackerContext must be used within a TrackerProvider");
  }
  return context;
};
