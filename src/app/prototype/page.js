"use client";
import { memo, useEffect, useRef, useState } from "react";
// import FboScene from "@/components/3d/FBO/FboScene";
// import Canvas from "@/components/3d/Canvas";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
import PresistSmoothGradientBackground from "@/components/3d/PresistSmoothGradientBackground";
import { OrbitControls } from "@react-three/drei";
import { FboParticlesV2 } from "@/components/3d/FBO/FboParticlesV2";
import { BlobBackground } from "@/components/3d/BlobBackground";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

const ExampleSection = ({ title }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center text-white text-4xl font-bold">
      {title}
    </div>
  );
};

import { Stats } from "@react-three/drei";
import { useGcrUniforms } from "@/components/3d/FBO/useGcrUniforms";
import {
  SectionProvider,
  useSectionContext,
} from "@/components/3d/FBO/SectionProvider";

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

  return (
    <div className="relative z-10 BG-POS" ref={containerRef}>
      {frameOptions.map((frame, i) => (
        <section
          key={i}
          ref={(el) => (sectionsRef.current[i] = el)}
          className="w-full h-screen flex items-center justify-center"
        >
          {frame.component}
        </section>
      ))}
    </div>
  );
};

export default function Prototype() {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const timelines = useRef([]);

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
            <OrbitControls />
            {/* <OrbitControls /> */}
          </Canvas>
        </div>
        <Leva />
        <HTMLContend />
      </div>
    </SectionProvider>
  );
}

// export default function Prototype() {

//   const containerRef = useRef(null);
//   const sectionRefs = useRef([]);
//   const timelineRef = useRef([]);

//   const sectionRef = useRef();
//   return (
//     <div className="w-full min-h-screen relative">
//       {/* Fixed canvas background */}
//       <div className="fixed inset-0">
//         <Canvas
//           className="w-full h-full"
//           camera={{ position: [0, 0, 1.5], fov: 40, near: 0.1, far: 10 }}
//           gl={{
//             powerPreference: "high-performance",
//             antialias: false,
//             stencil: false,
//             depth: false,
//             autoClear: false,
//           }}
//         >
//           <Stats />
//           <AnimatedBlobScene />
//           <MainScene />
//           <OrbitControls />
//           {/* <OrbitControls /> */}
//           {/* <PresistSmoothGradientBackground frameOptions={frameOptions} /> */}
//         </Canvas>
//       </div>
//       <Leva />

//       <div className="relative z-10" ref={containerRef}>
//         {frameOptions.map((frame, i) => (
//           <section
//             key={i}
//             ref={(el) => (sectionRefs.current[i] = el)}
//             className="w-full h-screen flex items-center justify-center"
//           >
//             {frame.component}
//           </section>
//         ))}
//       </div>
//     </div>
//   );
// }
