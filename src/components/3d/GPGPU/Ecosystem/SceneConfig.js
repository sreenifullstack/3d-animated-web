// useSampledLogo("WALLETS001", size);
import * as THREE from "three";
const { createSceneConfig, SCENE_TYPES } = require("../SceneConfigManager");

let colorsPallets = [
  // intro
  { color1: "#54aba5", color2: "#274045", color3: "#375d54" },

  // A
  { color1: "#1c93b0", color2: "#22244e", color3: "#1d4e4e" },

  // B
  { color1: "#eaad8b", color2: "#4b1122", color3: "#000000" },

  // C
  { color1: "#caabaa", color2: "#945a24", color3: "#614933" },

  // D
  { color1: "#4f335b", color2: "#187c7c", color3: "#623409" },

  // E
  { color1: "#447274", color2: "#1b3729", color3: "#000000" },
];

const _CHAINS = "CHAINS002";
const _TRADING = "TRADING002";
const _INVESTMENT = "INVESTMENT002";
const _WALLETS = "WALLETS003";
const _PIGGY = "PIGGY";

const _CHAIN_Logos = [
  { path: "chains/tron-trx-logo.svg", title: "Tron" },
  { path: "chains/arbitrum-arb-logo.svg", title: "Arbitrum" },
  { path: "chains/avalanche-avax-logo.svg", title: "avalanche" },
  { path: "chains/ethereum-eth-logo.svg", title: "ethereum" },
  { path: "chains/polkadot-new-dot-logo.svg", title: "polkadot" },
  { path: "chains/solana-sol-logo.svg", title: "solana" },
  { path: "chains/stellar-xlm-logo.svg", title: "stellar" },
  { path: "chains/sui-sui-logo.svg", title: "sui" },
  { path: "chains/toncoin-ton-logo.svg", title: "toncoin" },
];

const _Trading_Logos = [
  { path: "/trading/logo lifi (horizontal light theme).svg", title: "lifi" },
  { path: "/trading/mexc-logo.svg", title: "mexc" },
  { path: "/trading/okx-1.svg", title: "okx" },
  { path: "/trading/raydium-ray-logo.svg", title: "raydium" },
  { path: "/trading/unizen_Main Logo 2.png", title: "unizen" },
  { path: "/trading/HL logotype_dark green.svg", title: "hyperlend" },
  { path: "/trading/binance.svg", title: "binance" },
  { path: "/trading/bitget-logo.svg", title: "bitget" },
  //   {path: "/trading/bybit-3.svg",title: "bybit"},
  //   {path: "/trading/full-bitget-logo.svg",title: "bitget"},
  { path: "/trading/full-mexc-logo.svg", title: "mexc" },
  { path: "/trading/HL symbol_dark green.svg", title: "hyperlend" },
];

const _INVESTMENT_Logos = [
  { path: "/investment/aave-aave-logo.svg", title: "aave" },
  { path: "/investment/balancer-bal-logo.svg", title: "balancer" },
  { path: "/investment/compound-comp-logo.svg", title: "compound" },
  {
    path: "/investment/curve-dao-token-crv-logo.svg",
    title: "curve dao token",
  },
  { path: "/investment/hyperlend.svg", title: "hyperlend" },
  { path: "/investment/pendle-pendle-logo.svg", title: "pendle" },
  { path: "/investment/tulip.svg", title: "tulip" },
  { path: "/investment/venus_logo_black.svg", title: "venus" },
];

const _WALLETS_Logos = [
  {
    path: "/wallets/metamask.svg",
    title: "metamask",
  },
  {
    path: "/wallets/Phantom_SVG_Icon.svg",
    title: "phantom",
  },
  {
    path: "/wallets/slush.svg",
    title: "slush",
  },
  {
    path: "/wallets/solflare.svg",
    title: "solflare",
  },
  {
    path: "/wallets/tonkeeper.png",
    title: "tonkeeper",
  },
  {
    path: "/wallets/tronlink.png",
    title: "tronlink",
  },
  {
    path: "/wallets/Trust Wallet Core Logo_Blue.svg",
    title: "trust wallet",
  },
  {
    path: "/wallets/wallet-connect-logo.svg",
    title: "wallet connect",
  },
];

const options = {};

options.chains = {
  config: createSceneConfig(SCENE_TYPES.DEFAULT, {
    obj: {
      position: [0, 0, 0],
      rotation: [Math.PI / 12, Math.PI / 12, Math.PI / 4],
      scale: [1, 1, 1],
      opacity: 0,
    },
    bg: {
      ...colorsPallets[2],
      uBlackAlpha: 0, // enable gradient on whole scene
      particleSize: 1,
      minAlpha: 0.04,
      maxAlpha: 0.1,
    },
    postProcessing: {
      direction: new THREE.Vector3(1, 0),
      threshold: 0.74,
      strength: 0.65,
      radius: 1,
    },
  }),
  nodelName: _CHAINS,
  logos: _CHAIN_Logos,
  order: 1,
};

options.tradings = {
  config: createSceneConfig(SCENE_TYPES.DEFAULT, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 0,
    },
    bg: {
      ...colorsPallets[2],
      uBlackAlpha: 0, // enable gradient on whole scene
      particleSize: 0.5,
      minAlpha: 0.04,
      maxAlpha: 0.1,
    },
    postProcessing: {
      direction: new THREE.Vector3(1, 0),
      threshold: 0.74,
      strength: 0.65,
      radius: 1,
    },
  }),
  nodelName: _TRADING,
  logos: _Trading_Logos,
  order: 2,
};

options.investments = {
  config: createSceneConfig(SCENE_TYPES.DEFAULT, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 0,
    },

    bg: {
      ...colorsPallets[0],
      uBlackAlpha: 0, // enable gradient on whole scene
      particleSize: 1,
      minAlpha: 0.04,
      maxAlpha: 0.5,
    },
    postProcessing: {
      direction: new THREE.Vector3(1, 0),
      threshold: 0.44,
      strength: 0.65,
      radius: 1,
    },
  }),
  nodelName: _INVESTMENT,
  logos: _INVESTMENT_Logos,
  order: 3,
};

options.PIGGY = {
  config: createSceneConfig(SCENE_TYPES.DEFAULT, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, Math.PI, 0],
      scale: [1, 1, 1],
      opacity: 0,
    },

    bg: {
      ...colorsPallets[2],
      uBlackAlpha: 0, // enable gradient on whole scene
      particleSize: 0.5,
      minAlpha: 0.04,
      maxAlpha: 0.1,
    },
    postProcessing: {
      direction: new THREE.Vector3(1, 0),
      threshold: 0.74,
      strength: 0.65,
      radius: 1,
    },
  }),
  nodelName: _PIGGY,
  logos: _INVESTMENT_Logos,
  order: 4,
};

options.wallets = {
  config: createSceneConfig(SCENE_TYPES.DEFAULT, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, Math.PI / 16, Math.PI / 16],
      scale: [1, 1, 1],
      opacity: 0,
    },
    bg: {
      ...colorsPallets[2],
      uBlackAlpha: 0, // enable gradient on whole scene
      particleSize: 1.2,
      minAlpha: 0.04,
      maxAlpha: 0.5,
    },
    postProcessing: {
      direction: new THREE.Vector3(1, 0),
      threshold: 0.74,
      strength: 0.65,
      radius: 1,
    },
  }),
  nodelName: _WALLETS,
  logos: _WALLETS_Logos,
  order: 5,
};

export default options;
