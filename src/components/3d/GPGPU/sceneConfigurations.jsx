"use client";

export const sceneConfigurations = [
  // 1
  {
    obj: {
      position: [0, -0, 0],
      rotation: [0, Math.PI / 16, 0],
      scale: [1, 1, 1],
    },
    mouse: {
      mouseActive: undefined,
    },
    bg: {
      color1: "#54aba5",
      color2: "#274045",
      color3: "#375d54",
      color4: "#54aba5",
      particleSize: 0.025,
      minAlpha: 0.04,
      maxAlpha: 0.8,
    },

    // need to add postprocessing
  },

  // 2
  {
    obj: {
      position: [0, 0, 0],
      rotation: [0, Math.PI / 16, 0],
      scale: [1, 1, 1],
    },
    mouse: {
      mouseActive: undefined,
    },
    bg: {
      color1: "#1c93b0",
      color2: "#22244e",
      color3: "#1d4e4e",
      color4: "#1c93b0",
      particleSize: 1.7,
      minAlpha: 0.04,
      maxAlpha: 0.8,
    },
  },
  // 3
  {
    obj: {
      position: [0, 0, 0],
      rotation: [0, Math.PI / 16, 0],
      scale: [1, 1, 1],
    },
    mouse: {
      mouseActive: undefined,
    },
    bg: {
      color1: "#eaad8b",
      color2: "#4b1122",
      color3: "#000000",
      color4: "#eaad8b",
      particleSize: 1.7,
      minAlpha: 0.04,
      maxAlpha: 0.8,
    },
  },

  // 4
  {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    mouse: {
      mouseActive: undefined,
    },
    bg: {
      color1: "#caabaa",
      color2: "#945a24",
      color3: "#614933",
      color4: "#caabaa",
      particleSize: 1.7,
      minAlpha: 0.04,
      maxAlpha: 0.8,
    },
  },
];
