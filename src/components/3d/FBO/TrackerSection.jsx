import { useScrollRig, useTracker } from "@14islands/r3f-scroll-rig";
import { useControls } from "leva";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Euler, Vector3 } from "three";

const TrackerContext = createContext();

export const TrackerProvider = ({ children }) => {
  const [activeScene, setActiveScene] = useState("");
  const particleGroupRef = useRef();

  const particleState = useRef({
    position: new Vector3(),
    scale: new Vector3(),
    rotation: new Euler(0, 0, 0, "XYZ"),
  });

  useEffect(() => {
    console.log(activeScene, "sif");
  }, [activeScene]);

  // const setActiveScene = (scene) => {
  //   activeScene.current = scene;
  // };

  //   window.a = setActiveScene;
  useEffect(() => {
    console.log("active Scene", activeScene);
  }, [activeScene]);

  return (
    <TrackerContext.Provider
      value={{
        activeScene,
        setActiveScene,
        particleGroupRef,
        particleState,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

// Custom hook to use the section context
export const useTrackerContext = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTrackerContext must be used within a TrackerProvider");
  }
  return context;
};
