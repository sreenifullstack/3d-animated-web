"use client";
import { memo, useEffect, useRef, useState } from "react";

// components
import CTASection from "@/features/home/components/cta-section";
import EchosystemSection from "@/features/home/components/echosystem-section";
import FAQSection from "@/features/home/components/faq-section";
import FeaturesSection from "@/features/home/components/features-section";
import FooterNewsletter from "@/features/home/components/footer";
import HeroSection from "@/features/home/components/hero-section";
import NewsSlider from "@/features/home/components/news-slider";
import PartnersSection from "@/features/home/components/partner-section";
import PlanetSection from "@/features/home/components/planet-section";
import RewardsSection from "@/features/home/components/rewards-section";
import ScrollSection from "@/components/scrollSection";
import AnimatedBackground from "@/components/animatedBackground";
import ScrollParticles from "@/features/home/components/ScrollParticles";
import {
  GlobalCanvas,
  ScrollScene,
  UseCanvas,
  SmoothScrollbar,
  useCanvas,
  useScrollRig,
} from "@14islands/r3f-scroll-rig";
import * as THREE from "three";

import {
  MeshDistortMaterial,
  Scroll,
  ScrollControls,
  GradientTexture,
} from "@react-three/drei";
import { ThreeDScene } from "./ThreeDScene";
import { fragmentShader, vertexShader } from "@/components/3d/shaders/bgShader";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
// import { gradientBlobUniforms } from "./gradientBlobUniforms";
import { motion, useInView } from "framer-motion";
// const AnimatedBackground = () => {};

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
// import { frameProperty } from "./FrameProperty";
import { gradientBlobUniforms } from "@/components/3d/gradientBlobUniforms";
import { frameProperty } from "@/components/3d/FrameProperty";

gsap.registerPlugin(ScrollTrigger);

const SectionContent = ({ title }) => {
  return (
    <div className="relative  w-full min-h-screen bg-red-500">{title}</div>
  );
};

const Box = (props) => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} scale={[0.1, 0.1, 0.1]} {...props} />
    <meshBasicMaterial
      side={1}
      blending={THREE.AdditiveBlending}
      opacity={0.5}
    />
  </mesh>
);

const sections = [
  { component: <SectionContent title="1111" />, color: "#4A6B8A" },
  { component: <SectionContent title="2222" />, color: "#7EC8E3" },
  { component: <SectionContent title="3222" />, color: "#5A7F8C" },
  { component: <SectionContent title="4444" />, color: "#8B9B9B" },
  { component: <SectionContent title="5555" />, color: "#8B9B9B" },
];

// This is a simple Box component for demonstration
const BackgroundBox = () => {
  const meshRef = useRef();
  // We explicitly send this to the global canvas
  useCanvas(meshRef);
  return (
    <mesh ref={meshRef} position={[0, 0, -1]} scale={[10, 10, 0.1]}>
      {/* Push it back */}
      <boxGeometry />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
};

const BlobBackground = memo(() => {
  const ref = useRef();
  const { uniforms, set } = gradientBlobUniforms();

  // useFrame()
  // let { requestRender } = useScrollRig();
  // console.log(a);
  // requestRender([(a) => console.log(a)]);
  useFrame(({ clock }, delta) => {
    // console.log(uniforms.current.);
    if (!uniforms.current) return;
    // console.log(state);
    uniforms.current.uTime.value = clock.getElapsedTime();
  });
  return (
    <scene name="bg-blob">
      <mesh ref={ref}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          uniforms={uniforms.current}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </scene>
  );
});

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
      {/* <BlobBackground /> */}
      {/* <BackgroundBox /> */}
      <gridHelper />
      <Box />
    </scene>
  );
};

const SectionTracker = (props) => {
  // console.log(props);
  const ref = useRef();
  const isInView = useInView(ref, { amount: 0.3 });

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      // y: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <motion.div
        ref={ref}
        // className={className}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="w-full h-screen text-red-500 border-2 border-red-500 ">
          {props?.id || ""}
        </div>
      </motion.div>
    </>
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const timelines = useRef([]);
  const objectStates = useRef([]);
  const particlesUniforms = useRef({ anime2: { value: 0 } });
  const { uniforms: _uniforms, set } = gradientBlobUniforms();

  useEffect(() => {
    if (timelines.current)
      timelines.current.forEach((tl) => tl.kill(), (timelines.current = []));

    const createTimelineAnimation = (
      state,
      tl,
      // ease = "power1.inOut",
      factor = 1
    ) => {
      tl.to(
        state.target,
        {
          keyframes: state.keyframes,
          onUpdate: state.onUpdate,
          duration: factor,
          onStart: (v) => console.log(v),
          // ease: ease,
        },
        "<"
      );
    };

    const gsapCards = (objectState, tl, ease, duration, id = "NaaN") => {
      console.log(objectState);

      let uniforms = _uniforms.current;
      window.u = uniforms;
      const initialColors = {
        color1: {
          r: uniforms.uColor1?.value?.r || 0,
          g: uniforms.uColor1?.value?.g || 0,
          b: uniforms.uColor1?.value?.b || 0,
        },
        color2: {
          r: uniforms.uColor2?.value?.r || 0,
          g: uniforms.uColor2?.value?.g || 0,
          b: uniforms.uColor2?.value?.b || 0,
        },
        color3: {
          r: uniforms.uColor3?.value?.r || 0,
          g: uniforms.uColor3?.value?.g || 0,
          b: uniforms.uColor3?.value?.b || 0,
        },
      };

      // Convert target hex colors from objectState to THREE.Color objects first
      const targetColor1 = new THREE.Color(objectState.bg.color1);
      const targetColor2 = new THREE.Color(objectState.bg.color2);
      const targetColor3 = new THREE.Color(objectState.bg.color3);

      /// keyframes: {
      //   // Tween the r, g, b components directly
      // },
      tl.to(initialColors.color1, {
        r: targetColor1.r,
        g: targetColor1.g,
        b: targetColor1.b,
        duration: 1,
        ease: ease, // Use a specific ease, or pass it as a parameter if dynamic
        onUpdate: function (v) {
          let { r, g, b } = initialColors.color1;
          set({ uColor1: "#" + new THREE.Color(r, g, b).getHexString() });
          // uniforms.uColor1.value.copy(initialColors.color1);
          // uniforms.uColor1.value.r = s.value[0];
          // uniforms.uColor1.value.g = s.value[1];
          // uniforms.uColor1.value.b = s.value[2];
          // console.log(s, id, );
        },
        ease,
      });

      tl.to(initialColors.color2, {
        r: targetColor2.r,
        g: targetColor2.g,
        b: targetColor2.b,
        duration: 1,
        ease: ease, // Use a specific ease, or pass it as a parameter if dynamic
        onUpdate: function (v) {
          let { r, g, b } = initialColors.color2;
          set({ uColor2: "#" + new THREE.Color(r, g, b).getHexString() });
          // uniforms.uColor1.value.copy(initialColors.color1);
          // uniforms.uColor1.value.r = s.value[0];
          // uniforms.uColor1.value.g = s.value[1];
          // uniforms.uColor1.value.b = s.value[2];
          // console.log(s, id, );
        },
        ease,
      });

      tl.to(initialColors.color3, {
        r: targetColor3.r,
        g: targetColor3.g,
        b: targetColor3.b,
        duration: 1,
        ease: ease, // Use a specific ease, or pass it as a parameter if dynamic
        onUpdate: function (v) {
          let { r, g, b } = initialColors.color3;
          set({ uColor3: "#" + new THREE.Color(r, g, b).getHexString() });
          // uniforms.uColor1.value.copy(initialColors.color1);
          // uniforms.uColor1.value.r = s.value[0];
          // uniforms.uColor1.value.g = s.value[1];
          // uniforms.uColor1.value.b = s.value[2];
          // console.log(s, id, );
        },
        ease,
      });

      // createTimelineAnimation({ target:  }, tl);
    };

    sectionRefs.current.forEach((section, i, arr) => {
      if (i === arr.length - 1) return;
      let frame = frameProperty[i];
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          endTrigger: section,
          scrub: true,
          start: "top top",
          end: "bottom top",
          invalidateOnRefresh: true,
          yoyo: true,
          onComplete: () => console.log("a"),
        },
        onComplete: () => {
          console.log("completed:", i);
        },
        onReverseComplete: () => {
          console.log("reverse completed:", i);
        },
        yoyo: true,
      });

      let ps = particlesUniforms.current;
      const directionKeyframes = i % 2 === 0 ? [0, 1] : [1, 0];

      let tl = timeline.to(
        ps.anime2,
        {
          keyframes: {
            value: directionKeyframes,
            ease: "none",
            easeEach: "circ4.inOut",
          },
          duration: 1,
          onUpdate: (v) => {
            // console.log(v, directionKeyframes, ps.anime2);
          },
        },
        "<"
      );

      const objectState = frame; //frameProperty[i];
      gsapCards(objectState, tl, "circ4.inOut", 1, i);
      timelines.current.push(timeline);
    });
    const ctx = gsap.context(() => {}, containerRef);

    return () => ctx.revert();
  }, [containerRef, _uniforms]);

  return (
    <>
      <div className="w-full h-screen relative">
        <div className="fixed w-screen h-screen -z-10">
          <Canvas
            className="w-full h-full fixed"
            // camera={{ position: [0, 0, 1.5] }}
            camera={{ position: [0, 0, 1.5], fov: 40, near: 0.1, far: 10 }}
            gl={{
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: false,
              autoClear: false,
            }}
          >
            <ambientLight />
            <AnimatedBlobScene />
            <MainScene />
          </Canvas>
        </div>
        <Leva />
        <div className="z-10" ref={containerRef}>
          {/* <SectionTracker id="1" />
          <SectionTracker id="2" />
          <SectionTracker id="3" /> */}

          {frameProperty.map((_, i) => (
            <section
              key={i}
              className="w-full h-screen border-2 border-red-600 text-5xl"
              ref={(el) => (sectionRefs.current[i] = el)}
            >
              {i}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
