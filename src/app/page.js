"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import HeroSection from "@/features/home/components/hero-section";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
import { motion, scale, useInView, useScroll } from "framer-motion";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { BlobBackground } from "@/components/3d/BlobBackground";

import { FboParticlesV2 } from "@/components/3d/GPGPU/FboParticlesV3";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

import { MeshDistortMaterial, GradientTexture } from "@react-three/drei";

import {
  SectionProvider,
  useSectionContext,
} from "@/components/3d/FBO/SectionProvider";
import { useGSAP } from "@gsap/react";
import { PostProcessing } from "@/components/3d/GPGPU/PostProcessing";
import { Plane, Vector3 } from "three";
import {
  GlobalCanvas,
  ScrollScene,
  SmoothScrollbar,
  UseCanvas,
  useScrollbar,
  useScrollRig,
  useTracker,
} from "@14islands/r3f-scroll-rig";
import { OrbitControls, Stats } from "@react-three/drei";
import {
  TrackerProvider,
  useTrackerContext,
} from "@/components/3d/FBO/TrackerSection";
import { useSigmaLogo } from "./useSigmaLogo";

const ParticleScene = forwardRef((props, ref) => {
  const { particleState } = useTrackerContext();
  console.log(particleState, "ps");
  const meshRef = useRef();

  useFrame(() => {
    let _state = particleState.current;
    if (!_state) return;
    if (!_state.position || !_state.scale || !_state.rotation) return;
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.copy(_state.position);
    mesh.scale.copy(_state.scale);
  });
  return (
    <group ref={ref} {...props}>
      <mesh ref={meshRef}>
        <boxGeometry />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  );
});

const ExampleSection = ({ title }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center text-white text-4xl font-bold">
      {title}
    </div>
  );
};

const frameOptions = [
  {
    bg: {
      color1: "#1c93b0",
      color2: "#22244e",
      color3: "#1d4e4e",
    },
    title: "FBO Particles",
    component: <ExampleSection title="0" />,
  },
  {
    bg: {
      color1: "#eaad8b",
      color2: "#4b1122",
      color3: "#000000",
    },
    title: "FBO Particles",
    component: <ExampleSection title="1" />,
  },
  {
    bg: {
      color1: "#caabaa",
      color2: "#945a24",
      color3: "#614933",
    },
    title: "FBO Particles",
    component: <ExampleSection title="2" />,
  },

  {
    bg: {
      color1: "#caabaa",
      color2: "#945a24",
      color3: "#614933",
    },
    title: "FBO Particles",
    component: <ExampleSection title="3" />,
  },
];

window.xss = {};

useSigmaLogo;

function SceneComponent({ id, type = "entry" }) {
  const { activeScene, setActiveScene, particleState } = useTrackerContext();
  const el = useRef();
  const [isInView, setIsInView] = useState(false);
  const [wasInView, setWasInView] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const { onScroll } = useScrollbar();
  // useScrollbar().onScroll()
  const tracker = useTracker(el, {
    // rootMargin: "0%",
    // threshold: [0, 0.5, 1], // Multiple thresholds for enter/fully visible/exit
  });
  useEffect(() => {
    if (!tracker) return;
    const handleScroll = () => {
      const { inViewport, scrollState, position, scale } = tracker;
      const { visibility, progress } = scrollState;

      if (scrollState.inViewport && inViewport) {
        // setIsInView(true);
        setWasInView(true);
        console.log("Entering", id, visibility, progress, scrollState.viewport);
      }

      if (inViewport && visibility > 0.55 && visibility <= 1.5) {
        // callbacks.onFullView?.()
        console.log("fully in view", id, visibility);
        setIsInView(true);
        setActiveScene(id);
        // setIsFullView(true);
      }

      if (inViewport && visibility > 0 && visibility <= 0.25) {
        // console.log("Entering", id, visibility);
        // setIsFullView(false);
        setActiveScene("");
        setIsInView(false);
      }
      if (inViewport && visibility > 1.75) {
        // console.log("leaving", id, visibility);
        //  setIsFullView(false);
        setActiveScene("");
        setIsInView(false);
      }

      if (!inViewport && wasInView) {
        setActiveScene("");
        setWasInView(false);
        console.log("leaved:", id);
      }

      if (inViewport) {
        let _state = particleState.current;
        // console.log(_state);
        if (!_state) return;
        if (!_state.position || !_state.scale || !_state.rotation) return;
        _state.position.copy(position.xyz);
        let sValue = scale.xy.min();
        console.log(sValue);
        _state.scale.set(sValue, sValue, sValue);
      }
    };

    const unsubscribe = onScroll(handleScroll);
    handleScroll();
    return () => {
      unsubscribe();
    };
  }, [tracker, wasInView, particleState, activeScene, setActiveScene]);

  return (
    // Main container: full screen, column on mobile, row on desktop.
    // gap-4 and p-2 for spacing.
    <div
      className="box-border relative flex flex-col h-screen w-screen overflow-hidden p-2 gap-4
                    justify-start items-center                  /* Mobile: stack vertically, align items to start (top) */
                    md:flex-row md:justify-around md:items-center /* Desktop: row, space around items, center vertically */
                    "
    >
      <div
        className="border border-red-600 w-full h-[25vh] flex items-center justify-center rounded-lg shadow-md
                      md:w-1/2 md:h-full md:max-h-full        /* Desktop: half width, full height of parent, max height */
                      "
      >
        {type === "entry" ? "Hero Scene" : "Exit Scene"}
      </div>
      <div
        ref={el}
        className="border border-green-600 w-full h-[75vh] flex items-center justify-center rounded-lg shadow-md
                    md:w-1/2 md:h-full md:aspect-square md:max-w-[500px] md:max-h-[500px] /* Desktop: half width, full height, aspect, max-sizes */
                    "
        style={{
          transition: "opacity 0.2s ease-out",
        }}
      >
        <p className="text-xl font-bold text-gray-700">
          ID: <span className="text-blue-600">{id}</span> <br />
          In Viewport:{" "}
          <span
            className={tracker.inViewport ? "text-green-500" : "text-red-500"}
          >
            {tracker.inViewport ? "True" : "False"}
          </span>
        </p>
      </div>
    </div>
  );
}

function EntryComponent({ id }) {
  return <SceneComponent id={id} />;
}

function ExitComponent({ id }) {
  return <SceneComponent id={id} />;
}

export default function Home() {
  const containerRef = useRef();
  const sectionRefs = useRef([]);
  const parentHtmlRef = useRef();
  const timelines = useRef([]);
  const [activeScene, setActiveScene] = useState(0);
  const [eventSource, setEventSource] = useState(null);

  // Replace the ref with state to trigger re-renders
  const [tracker, setTracker] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  });
  window.tracker = tracker;
  const createTimeline = useCallback(() => {}, []);

  useEffect(() => {
    if (parentHtmlRef.current) {
      setEventSource(parentHtmlRef.current);
    }
  }, []);

  const [camera] = useState({
    position: [0, 0, 1.5],
    fov: 50,
    near: 0.1,
    far: 10,
  });

  const ref = useRef();

  const proxy = useRef({
    position: new Vector3(),
    rotation: new Vector3(),
    scale: new Vector3(1, 1, 1),
  });

  return (
    <>
      <div
        className="w-full min-h-screen text-white relative overflow-hidden "
        ref={parentHtmlRef}
      >
        <TrackerProvider>
          <GlobalCanvas
            style={{ pointerEvents: "none" }}
            className="bg-black"
            gl={{
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: false,
              autoClear: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1,
            }}
          >
            <Stats />

            {/* Tracked mesh */}
            <mesh ref={ref}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color="red" />
            </mesh>

            {/* <OrbitControls
              enabled={false}
              enableZoom={false}
              domElement={parentHtmlRef.current}
            /> */}
            <FboParticlesV2 activeSceneId={0} />
          </GlobalCanvas>
          <SmoothScrollbar>
            {(bind) => (
              <article {...bind}>
                <header>
                  <a href="https://github.com/14islands/r3f-scroll-rig">
                    @14islands/r3f-scroll-rig
                  </a>
                </header>

                <EntryComponent id={1} type="entry" />
                <section className="h-screen">
                  <h1>Basic &lt;ScrollScene/&gt; example</h1>
                </section>
                {/* <ExitComponent id={2} /> */}
                <section className="h-screen">
                  Both these ScrollScenes are tracking DOM elements and scaling
                  their WebGL meshes to fit.
                </section>
                <section className="h-screen">
                  <h1>Basic &lt;ScrollScene/&gt; example</h1>
                </section>
                <ExitComponent id={2} type="exit" />
              </article>
            )}
          </SmoothScrollbar>
          <Leva />
        </TrackerProvider>
      </div>
    </>
  );
}
