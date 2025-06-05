"use client";
import { useEffect, useRef, useState } from "react";

// // components
// import CTASection from "@/features/home/components/cta-section";
// import EchosystemSection from "@/features/home/components/echosystem-section";
// import FAQSection from "@/features/home/components/faq-section";
// import FeaturesSection from "@/features/home/components/features-section";
// import FooterNewsletter from "@/features/home/components/footer";
import HeroSection from "@/features/home/components/hero-section";
// import NewsSlider from "@/features/home/components/news-slider";
// import PartnersSection from "@/features/home/components/partner-section";
// import PlanetSection from "@/features/home/components/planet-section";
// import RewardsSection from "@/features/home/components/rewards-section";
// import ScrollSection from "@/components/scrollSection";
// import AnimatedBackground from "@/components/animatedBackground";
// import ScrollParticles from "@/features/home/components/ScrollParticles";
// import {
//   GlobalCanvas,
//   ScrollScene,
//   UseCanvas,
//   SmoothScrollbar,
//   useCanvas,
//   useScrollRig,
// } from "@14islands/r3f-scroll-rig";
// import * as THREE from "three";

// import {
//   MeshDistortMaterial,
//   Scroll,
//   ScrollControls,
//   GradientTexture,
// } from "@react-three/drei";
// import { ThreeDScene } from "./ThreeDScene";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
// import { gradientBlobUniforms } from "./gradientBlobUniforms";
import { motion, useInView } from "framer-motion";
// const AnimatedBackground = () => {};

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
// import { gradientBlobUniforms } from "@/components/3d/gradientBlobUniforms";
// import { frameProperty } from "@/components/3d/FrameProperty";
import { BlobBackground } from "@/components/3d/BlobBackground";

import { FboParticlesV2 } from "@/components/3d/FBO/FboParticlesV2";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

import { Stats } from "@react-three/drei";

import {
  SectionProvider,
  useSectionContext,
} from "@/components/3d/FBO/SectionProvider";
import { useGSAP } from "@gsap/react";

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

const AnimatedBlobScene = () => {
  const scene = useRef();
  const { camera } = useThree();
  useFrame(({ gl }, delta) => {
    gl.clear(true, true);
    // gl.autoClear = false;
    // gl.clearDepth();
    gl.render(scene.current, camera);
  }, 10);
  return (
    <scene ref={scene}>
      <BlobBackground />
    </scene>
  );
};

const MainScene = () => {
  const scene = useRef();
  const { camera } = useThree();
  useFrame(({ gl }, delta) => {
    // gl.autoClear = false;
    // gl.clearDepth();
    gl.render(scene.current, camera);
  }, 100);
  return (
    <scene ref={scene}>
      <BlobBackground frameOptions={frameOptions} />
      {/* <BackgroundBox /> */}
      <FboParticlesV2 width={256} />

      {/* <PresistSmoothGradientBackground frameOptions={frameOptions} /> */}

      {/* <gridHelper /> */}

      {/* <Box /> */}
    </scene>
  );
};

const HTMLContend = () => {
  const { containerRef, sectionRefs, timelines } = useSectionContext();

  const sectionsRef = useRef([]);

  useEffect(() => {
    sectionRefs.current = sectionsRef.current;
  }, [sectionsRef]);

  // const html_section = [
  //   <ScrollSection>
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <FeaturesSection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <PlanetSection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <EchosystemSection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <RewardsSection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <PartnersSection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <NewsSlider />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <CTASection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <FAQSection />
  //   </ScrollSection>,
  //   <ScrollSection>
  //     <FooterNewsletter />
  //   </ScrollSection>,
  // ];

  return (
    <div className="relative z-10 BG-POS" ref={containerRef}>
      <div ref={(el) => (sectionsRef.current[0] = el)}>
        <HeroSection />
      </div>
      {frameOptions.map((frame, i) => (
        <section
          key={i}
          ref={(el) => (sectionsRef.current[i + 1] = el)}
          className="w-full h-screen flex items-center justify-center"
        >
          {frame.component}
        </section>
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <SectionProvider>
      <div className="w-full min-h-screen  text-white relative overflow-hidden">
        <div className="fixed inset-0">
          <Canvas
            className="w-full h-full"
            camera={{ position: [0, 0, 1.5], fov: 40, near: 0.1, far: 10 }}
            gl={{
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: false,
              autoClear: false,
            }}
          >
            <Stats />
            <AnimatedBlobScene />
            <MainScene />
            {/* <OrbitControls /> */}
            {/* <OrbitControls /> */}
          </Canvas>
        </div>
        <Leva />
        <HTMLContend />
      </div>
    </SectionProvider>
  );
}
