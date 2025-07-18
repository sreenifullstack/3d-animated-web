"use client";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  GlobalCanvas,
  ScrollScene,
  UseCanvas,
  SmoothScrollbar,
  // StickyScrollScene,
  useTracker,
  useScrollbar,
} from "@14islands/r3f-scroll-rig";
import { StickyScrollScene } from "@14islands/r3f-scroll-rig/powerups";

import {
  CombinedPostProcessing,
  FboParticlesWrapper,
} from "@/components/3d/GPGPU/FboParticles";
import {
  SCENE_TYPES,
  createSceneConfig,
} from "@/components/3d/GPGPU/SceneConfigManager";
import { BlobBackground } from "@/components/3d/GPGPU/BlobBackground";

import Header from "@/components/header";
import { Html, Stats } from "@react-three/drei";
import { SceneComponent } from "@/components/3d/GPGPU/SceneComponent";
import {
  TrackerProvider,
  useTrackerContext,
} from "@/components/3d/GPGPU/TrackerSection";
import { generateUUID } from "three/src/math/MathUtils";
import {
  useChainLogo,
  useSigmaLogo,
  useTextGeometry,
  useWalletLogo,
} from "@/components/3d/GPGPU/useSigmaLogo";
import {
  progress,
  useInView,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Ecosystem } from "@/components/3d/GPGPU/Ecosystem/Ecosystem";
import { Rewards } from "@/components/3d/GPGPU/Rewards/RewardSection";
// import { SceneComponent } from "@/components/3d/GPGPU/SceneComponent";

export default function App() {
  const eventSource = useRef();

  return (
    <div ref={eventSource} className="">
      <TrackerProvider>
        <div className="fixed w-full h-screen   overflow-hidden pointer-events-none inset-0">
          <Canvas
            camera={{ fov: 45, position: [0, 0, 1.5] }}
            gl={{
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: false,
              alpha: true,
            }}
          >
            <BlobBackground />
          </Canvas>
        </div>

        <GlobalCanvas
          eventSource={eventSource}
          eventPrefix="client"
          scaleMultiplier={1}
          camera={{ fov: 50 }}
          className="mix-blend-screen"
          style={{ pointerEvents: "none" }}
          gl={{
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: false,
            autoClear: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
            alpha: true,
          }}
        >
          {/* <group scale={[100, 100, 100]} rotation={[Math.PI / 4, 0, 0]}>
            <Html transform>
              <div className=" bg-red-500">Hello dev</div>
            </Html>
            <gridHelper />
          </group> */}
          <FboParticlesWrapper />
          <CombinedPostProcessing />
          <Stats />
        </GlobalCanvas>
        <SmoothScrollbar>
          {(bind) => (
            <div {...bind}>
              <HeroComponent />
              <section className="h-screen">
                <h1>Secound Section</h1>
              </section>
              <Ecosystem />

              <section className="h-screen">
                <h1>Basic &lt;fourth Section &gt; example</h1>
              </section>
              <Rewards />

              <section className="h-screen">
                <h1>Basic &lt;ScrollScene/&gt; example</h1>
              </section>

              <GradientSectionSwap />
              <section className="h-screen">
                <h1>Basic &lt;ScrollScene/&gt; example</h1>
              </section>

              <section className="h-screen">
                <h1>Basic &lt;ScrollScene/&gt; example</h1>
              </section>
              <GradientSectionSwap />
              <section className="h-screen">
                <h1>Basic &lt;ScrollScene/&gt; example</h1>
              </section>
              <GradientSectionSwap />

              <section className="h-screen">
                <h1>Basic &lt;ScrollScene/&gt; example</h1>
              </section>

              <section className="h-screen">
                <h1>Basic &lt;ScrollScene/&gt; example</h1>
              </section>

              <FooterComponent />
            </div>
          )}
        </SmoothScrollbar>
      </TrackerProvider>
    </div>
  );
}

const HeroContent = forwardRef(({ activeState, type }, ref) => {
  return (
    <>
      <Header />
      <div
        className="pointer-events-none box-border relative flex flex-col h-screen w-screen overflow-hidden p-2 gap-4
      justify-start items-center md:flex-row md:justify-around md:items-center"
      >
        <div
          className="pointer-events-none border text-red-600 font-bold border-red-600 w-full h-[25vh] flex items-center justify-center rounded-lg shadow-md
        md:w-1/2 md:h-full"
        >
          <p> LEFT SECTION </p>
        </div>
        <div
          ref={ref}
          className="pointer-events-none border border-green-600 w-full h-[75vh] flex items-center justify-center rounded-lg shadow-md
           md:w-1/2 md:h-full md:aspect-square md:max-w-[500px] md:max-h-[500px] sigma"
        ></div>
      </div>
    </>
  );
});

function HeroComponent() {
  // Use the new scene configuration system
  const config = useMemo(() => {
    return createSceneConfig(SCENE_TYPES.DEFAULT, {
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
        particleSize: 1,
        minAlpha: 0.04,
        maxAlpha: 0.8,
        opacity: 1,
      },
      mouse: {
        mouseActive: false,
        rotationIntensity: 0.25,
        rotationSpeed: 0.02,
      },
      animation: {
        duration: 0.3,
        ease: "power2.out",
      },
    });
  }, []);
  const uuid = useMemo(() => generateUUID(), []);
  let { count } = useTrackerContext();
  const fboTextures = useSigmaLogo(count);
  return (
    <SceneComponent config={config} fboTextures={fboTextures} id={uuid}>
      <HeroContent />
    </SceneComponent>
  );
}

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

function FooterComponent() {
  // Use the new scene configuration system
  const config = useMemo(() => {
    return createSceneConfig(SCENE_TYPES.DEFAULT, {
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
        particleSize: 1,
        minAlpha: 0.04,
        maxAlpha: 0.8,
        opacity: 1,
      },
      mouse: {
        mouseActive: false,
        rotationIntensity: 0.25,
        rotationSpeed: 0.02,
      },
      animation: {
        duration: 0.3,
        ease: "power2.out",
      },
    });
  }, []);
  const uuid = useMemo(() => generateUUID(), []);
  const { count } = useTrackerContext();
  const fboTextures = useSigmaLogo(count);

  return (
    <SceneComponent config={config} fboTextures={fboTextures} id={uuid}>
      <HeroContent />
    </SceneComponent>
  );
}

const SectionContent = forwardRef(({ config = {}, type = "" }, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-screen h-screen flex items-center justify-center text-white border border-red-500"
    >
      Gradient Wrapper
      <span
        style={{
          backgroundColor: config?.bg?.color1,
        }}
        className={`w-12 h-12`}
      />
      <span
        style={{
          backgroundColor: config?.bg?.color2,
        }}
        className={`w-12 h-12`}
      />
      <span
        style={{
          backgroundColor: config?.bg?.color3,
        }}
        className={`w-12 h-12`}
      />
    </div>
  );
});

function GradientSectionSwap() {
  const uuid = useMemo(() => generateUUID(), []);
  const config = useMemo(() => {
    let _config = createSceneConfig(SCENE_TYPES.SECTION, {
      bg: {
        ...colorsPallets[Math.floor(Math.random() * 5)],
        uBlackAlpha: 0, // enable gradient on whole scene
      },
    });
    // _config.bg.uBlackAlpha = 0;
    return _config;
  }, []);
  return (
    <SceneComponent config={config} id={uuid} type="section">
      <SectionContent config={config} />
    </SceneComponent>
  );
}
