"use client";
import { useMemo } from "react";
import { Vector3 } from "three";

// Scene Types
export const SCENE_TYPES = {
  INTRO: "intro",
  HERO: "hero",
  FOOTER: "footer",
  SECTION: "section",
  DEFAULT: "default",
};

// Default configurations for different scene types
const DEFAULT_CONFIGS = {
  [SCENE_TYPES.INTRO]: {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 1,
    },
    bg: {
      color1: "#54aba5",
      color2: "#274045",
      color3: "#375d54",
      color4: "#54aba5",
      particleSize: 1.7,
      minAlpha: 0.04,
      maxAlpha: 0.8,
      opacity: 1,
      uAlpha: 0,
      uBlackAlpha: 1,
      blackPosition: [0.5, 0.5],
      blackRadius: 0.141,
      blackBorderFade: 0.12,
      blackTimeScale: 0.19,
      timeScale: 0.19,
      scale: 1.08,
      scale3: 1.08,
      scaleVignette: 0.523,
      vignetteBorderFade: 0.216,
    },
    postProcessing: {
      direction: new Vector3(1.5, 1),
      threshold: 0.15,
      strength: 0.58,
      radius: 0.535,
    },
    mouse: {
      mouseActive: false,
      rotationIntensity: 0.35,
      rotationSpeed: 0.025,
    },
    animation: {
      duration: 0.25,
      ease: "none",
    },
  },

  [SCENE_TYPES.SECTION]: {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 1,
    },
    bg: {
      color1: "#1c93b0",
      color2: "#22244e",
      color3: "#1d4e4e",
      color4: "#1c93b0",
      particleSize: 1.7,
      minAlpha: 0.04,
      maxAlpha: 0.8,
      opacity: 1,
      uAlpha: 1,
      uBlackAlpha: 0,
      blackPosition: [0.5, 0.5],
      blackRadius: 0.141,
      blackBorderFade: 0.12,
      blackTimeScale: 0.19,
      timeScale: 0.19,
      scale: 1.08,
      scale3: 1.08,
      scaleVignette: 0.523,
      vignetteBorderFade: 0.216,
    },
    postProcessing: {
      direction: new Vector3(1.5, 1),
      threshold: 0.058,
      strength: 1.2,
      radius: 1,
    },
    mouse: {
      mouseActive: true,
      rotationIntensity: 0.35,
      rotationSpeed: 0.025,
    },
    animation: {
      duration: 0.25,
      ease: "none",
    },
  },

  [SCENE_TYPES.DEFAULT]: {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 0,
    },
    bg: {
      color1: "#54aba5",
      color2: "#274045",
      color3: "#375d54",
      color4: "#54aba5",
      particleSize: 1.5,
      minAlpha: 0.1,
      maxAlpha: 0.8,
      opacity: 0,
      uAlpha: 1,
      uBlackAlpha: 1,
      blackPosition: [0.5, 0.5],
      blackRadius: 0.141,
      blackBorderFade: 0.12,
      blackTimeScale: 0.19,
      timeScale: 0.19,
      scale: 1.08,
      scale3: 1.08,
      scaleVignette: 0.523,
      vignetteBorderFade: 0.216,
    },
    postProcessing: {
      direction: new Vector3(1.5, 1),
      threshold: 0,
      strength: 0,
      radius: 1,
    },
    mouse: {
      mouseActive: false,
      rotationIntensity: 0.35,
      rotationSpeed: 0.025,
    },
    animation: {
      duration: 0.25,
      ease: "none",
    },
  },
};

// Deep merge utility function
const deepMerge = (target, source) => {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
};

// Scene configuration manager hook
export const useSceneConfig = (
  sceneType = SCENE_TYPES.DEFAULT,
  customConfig = {}
) => {
  return useMemo(() => {
    const baseConfig =
      DEFAULT_CONFIGS[sceneType] || DEFAULT_CONFIGS[SCENE_TYPES.DEFAULT];
    return baseConfig; //deepMerge(baseConfig, customConfig);
  }, [sceneType, customConfig]);
};

// Scene configuration builder for easy customization
export const createSceneConfig = (
  baseType = SCENE_TYPES.DEFAULT,
  overrides = {}
) => {
  const baseConfig =
    DEFAULT_CONFIGS[baseType] || DEFAULT_CONFIGS[SCENE_TYPES.DEFAULT];
  return deepMerge(baseConfig, overrides);
};

// Utility function to validate scene configuration
export const validateSceneConfig = (config) => {
  const required = ["obj", "bg", "postProcessing", "mouse", "animation"];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    console.warn(
      `Missing required configuration sections: ${missing.join(", ")}`
    );
    return false;
  }

  return true;
};

// Scene transition configuration
export const TRANSITION_CONFIGS = {
  smooth: {
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.1,
  },
  fast: {
    duration: 0.25,
    ease: "power1.out",
    stagger: 0.05,
  },
  slow: {
    duration: 1.0,
    ease: "power3.out",
    stagger: 0.2,
  },
};
