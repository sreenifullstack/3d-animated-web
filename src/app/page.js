"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import HeroSection from "@/features/home/components/hero-section";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
import { motion, useInView, useScroll } from "framer-motion";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { BlobBackground } from "@/components/3d/BlobBackground";

import { FboParticlesV2 } from "@/components/3d/GPGPU/FboParticlesV3";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

import { OrbitControls, Stats } from "@react-three/drei";

import {
  SectionProvider,
  useSectionContext,
} from "@/components/3d/FBO/SectionProvider";
import { useGSAP } from "@gsap/react";
import { PostProcessing } from "@/components/3d/GPGPU/PostProcessing";
import { Plane, Vector3 } from "three";

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

export default function Home() {
  const containerRef = useRef();
  const sectionRefs = useRef([]);
  const parentHtmlRef = useRef();
  const timelines = useRef([]);
  const [activeScene, setActiveScene] = useState(0);
  const [eventSource, setEventSource] = useState(null);

  const createTimeline = useCallback(() => {}, []);

  useEffect(() => {
    if (parentHtmlRef.current) {
      setEventSource(parentHtmlRef.current);
    }
  }, []);

  const [camera, setCamera] = useState({
    position: [0, 0, 1.5],
    fov: 50,
    near: 0.1,
    far: 10,
  });

  return (
    <>
      <div
        className="w-full min-h-screen text-white relative overflow-hidden"
        ref={parentHtmlRef}
      >
        {/* Canvas container - ensure it's behind interactive elements */}
        <div className="fixed inset-0 bg-black z-0">
          <Canvas
            eventSource={parentHtmlRef.current || document.body} // Use your content container as event source
            className="w-full h-full"
            camera={camera}
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
            <FboParticlesV2 width={512} activeSceneId={activeScene} />
          </Canvas>
        </div>

        <Leva />

        {/* Content container - make sure it doesn't block events unless necessary */}
        <div
          className="relative z-10 BG-POS"
          ref={containerRef}
          style={{ pointerEvents: "none" }} // Let events pass through to Canvas
        >
          <section
            ref={(el) => (sectionRefs.current[0] = el)}
            className="w-full h-screen overflow-hidden"
            style={{ pointerEvents: "auto" }} // Enable events for this specific element
          >
            <HeroSection />
          </section>

          {/* {frameOptions.map((frame, i) => (
            <section
              key={i}
              ref={(el) => (sectionRefs.current[i + 1] = el)}
              className="w-full h-screen flex items-center justify-center"
              style={{ pointerEvents: "auto" }} // Enable events for these elements
            >
              {frame.component}
            </section>
          ))} */}
        </div>
      </div>
    </>
  );
}
