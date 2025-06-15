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

const ParticleScene = forwardRef((props, ref) => {
  const { particleState } = useTrackerContext();
  console.log(particleState, "ps");
  const meshRef = useRef();

  useFrame(() => {
    let _state = particleState.current;
    // console.log(_state);
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
    <div className="box-border relative flex flex-wrap w-screen h-screen overflow-hidden justify-around items-center gap-4 p-2">
      <div className="border border-red-600 max-h-full flex items-center justify-center">
        {type === "entry" ? "heroScene" : "ExitScene"}
      </div>
      <div
        ref={el}
        className="aspect-square border border-green-600 w-1/2   max-w-[500px] max-h-[500px] flex items-center justify-center"
        style={{
          // opacity: localVisibility,
          transition: "opacity 0.2s ease-out",
        }}
      >
        {id} {tracker.inViewport ? "true" : "fakse"}
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

            <OrbitControls
              enableZoom={false}
              domElement={parentHtmlRef.current}
            />
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
