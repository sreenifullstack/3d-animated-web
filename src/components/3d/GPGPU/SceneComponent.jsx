import * as THREE from "three";
import { useScrollbar, useTracker } from "@14islands/r3f-scroll-rig";
import React, { useRef, useEffect, useCallback } from "react";
import { useTrackerContext } from "./TrackerSection";

import { useInView } from "framer-motion";

export function SceneComponent({
  id = 0,
  config = null,
  type = "section",
  fboTextures = null,
  children,
}) {
  const { activeSceneId, setActiveSceneId, activeSceneHandler, particleState } =
    useTrackerContext();
  const el = useRef();
  const isInView = useInView(el, { once: false, amount: 0.95 });
  useEffect(() => {
    if (!isInView) {
      // console.log(activeSceneId, id, "20");
      // If the scene is not in view and it's the active scene, reset the state

      if (activeSceneId === id) {
        activeSceneHandler("");
        setActiveSceneId("");
      }
      return;
    }
    // console.log(id);
    activeSceneHandler({
      id,
      fboTextures, // fbotexture will act as fboState
      config,
      type,
    });
    setActiveSceneId(id);
  }, [activeSceneId, id, isInView, activeSceneHandler]);
  const stateRef = useRef({
    wasInView: false,
    lastVisibility: 0,
    activeState: null,
    lastScrollTime: 0,
  });

  const { onScroll } = useScrollbar();
  const tracker = useTracker(el);

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

  // Scroll handler with dynamic thresholds
  const handleScroll = useCallback(() => {
    if (isInView === false) return;
    if (!tracker) return;
    const { inViewport, scrollState, position, scale } = tracker;
    updateParticleState(position, scale);
  }, [tracker, updateParticleState]);

  useEffect(() => {
    const unsubscribe = onScroll(handleScroll);
    handleScroll(); // Initial check
    return unsubscribe;
  }, [tracker, handleScroll, onScroll, isInView]);

  // Clone children with ref
  const clonedChild = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { ref: el });
    }
    return child;
  });

  return clonedChild;
}
