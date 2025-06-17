import * as THREE from "three";
import { useTrackerContext } from "@/components/3d/FBO/TrackerSection";
import { useScrollbar, useTracker } from "@14islands/r3f-scroll-rig";
import React, { useRef, useEffect, useCallback } from "react";

export function SceneComponent({
  id = 0,
  config = null,
  type = "section",
  children,
}) {
  const { activeSceneHandler, particleState } = useTrackerContext();
  const el = useRef();
  const stateRef = useRef({
    wasInView: false,
    lastVisibility: 0,
    activeState: null, // 'entry' | 'full' | 'exit' | null
    lastScrollTime: 0,
  });

  const { onScroll } = useScrollbar();
  const tracker = useTracker(el);

  // Smoothly interpolate particle state to avoid jumps
  const updateParticleState = useCallback(
    (position, scale) => {
      if (!particleState.current) return;
      const _state = particleState.current;
      if (_state.position && _state.scale) {
        _state.position.copy(position.xyz); // Lerp for smoothness
        const sValue = scale.xy.min();
        _state.scale.set(sValue, sValue, sValue);
      }
    },
    [particleState]
  );

  // State machine logic (debounced to avoid rapid switches)
  const handleStateChange = useCallback(
    (newState, visibility) => {
      if (newState === stateRef.current.activeState) return;

      stateRef.current.activeState = newState;
      switch (newState) {
        case "entry":
          activeSceneHandler("");
          console.log("🔵 ENTERING:", id);
          break;
        case "full":
          activeSceneHandler({ fboState: type === "sigma", config, type });
          console.log("🟢 FULL VIEW:", id);
          break;
        case "exit":
          activeSceneHandler("");
          console.log("🟠 EXITING:", id);
          break;
        default:
          break;
      }
    },
    [activeSceneHandler, config, type, id]
  );

  // Scroll handler with dynamic thresholds
  const handleScroll = useCallback(() => {
    if (!tracker) return;
    const { inViewport, scrollState, position, scale } = tracker;
    const { visibility } = scrollState;

    // Always update particle state if in viewport
    if (inViewport) updateParticleState(position, scale);

    // Exit logic
    if (!inViewport) {
      if (stateRef.current.wasInView) {
        handleStateChange("exit", visibility);
        stateRef.current.wasInView = false;
      }
      return;
    }

    stateRef.current.wasInView = true;
    let newState = null;

    if (visibility > 1.75) {
      newState = "exit";
    } else if (visibility > 0.55 && visibility <= 1.5) {
      newState = "full";
    } else if (visibility > 0 && visibility <= 0.25) {
      newState = "entry";
    }

    handleStateChange(newState, visibility);
  }, [tracker, updateParticleState, handleStateChange]);

  useEffect(() => {
    const unsubscribe = onScroll(handleScroll);
    handleScroll(); // Initial check
    return unsubscribe;
  }, [tracker, handleScroll, onScroll]);

  // Clone children with ref
  const clonedChild = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { ref: el });
    }
    return child;
  });

  return clonedChild;
}
