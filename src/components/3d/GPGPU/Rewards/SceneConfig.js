// useSampledLogo("WALLETS001", size);
import * as THREE from "three";
const { createSceneConfig, SCENE_TYPES } = require("../SceneConfigManager");

let colorsPallets = [
  // intro
  {
    color1: "#1c93b0",
    color2: "#274045",
    color3: "#375d54",
    color4: "#54aba5",
  },

  // A
  {
    color1: "#1c93b0",
    color2: "#22244e",
    color3: "#1d4e4e",
    color4: "#1c93b0",
  },

  // B
  {
    color1: "#eaad8b",
    color2: "#4b1122",
    color3: "#000000",
    color4: "#eaad8b",
  },

  // C
  {
    color1: "#caabaa",
    color2: "#945a24",
    color3: "#614933",
    color4: "#caabaa",
  },

  // D
  {
    color1: "#4f335b",
    color2: "#187c7c",
    color3: "#623409",
    color4: "#4f335b",
  },

  // E
  {
    color1: "#447274",
    color2: "#1b3729",
    color3: "#000000",
    color4: "#447274",
  },
  // F
  {
    color1: "#eaad8b",
    color2: "#4b1122",
    color3: "#000000",
    color4: "#54aba5", // unique particle color
  },
];

const options = {};

const _CHEST = "Chest__1";

options.chest = {
  config: createSceneConfig(SCENE_TYPES.DEFAULT, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, Math.PI / 8, 0],
      scale: [1, 1, 1],
      opacity: 0,
    },
    bg: {
      ...colorsPallets[0],
      uBlackAlpha: 1, // enable gradient on whole scene
      particleSize: 1.3,
      minAlpha: 0.04,
      maxAlpha: 0.7,
    },
    postProcessing: {
      direction: new THREE.Vector3(1, 0),
      threshold: 0.74,
      strength: 0.65,
      radius: 1,
    },
  }),
  nodelName: _CHEST,
  logos: [],
  order: 0,
};

export default options;
