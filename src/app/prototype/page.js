"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";
// import FboScene from "@/components/3d/FBO/FboScene";
// import Canvas from "@/components/3d/Canvas";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Leva } from "leva";
import PresistSmoothGradientBackground from "@/components/3d/PresistSmoothGradientBackground";
import { Effects, OrbitControls } from "@react-three/drei";
import { FboParticlesV2 } from "@/components/3d/GPGPU/FboParticlesV3";
import { BlurPass, Resizer, KernelSize, Resolution } from "postprocessing";

import { BlobBackground } from "@/components/3d/BlobBackground";

import {
  FilmPass,
  WaterPass,
  UnrealBloomPass,
  LUTPass,
  LUTCubeLoader,
  BloomPass,
  OutlinePass,
} from "three-stdlib";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
  MeshBVHVisualizer,
} from "three-mesh-bvh";

import * as THREE from "three";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

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
import { FboParticles } from "@/components/3d/FBO/FboParticles";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { MotionBloomPass } from "@/components/3d/GPGPU/MotionBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

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
      {/* <BlobBackground frameOptions={frameOptions} /> */}
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

// "threshold": 0.058,
//     "strength": 1.2,
//     "radius": 0,
//     "directionX": 1.5,
//     "directionY": 1
const PostProcessing = ({
  threshold = 0.4,
  strength = 1.5,
  radius = 0.85,
  direction = new THREE.Vector2(1.5, 1),
  ...props
}) => {
  const { gl: renderer, scene, camera, size } = useThree();

  const [composer, setComposer] = useState(null);

  const bloomPass = useMemo(() => {
    return new MotionBloomPass(
      new THREE.Vector2(size.width, size.height),
      strength,
      threshold,
      radius
    );
  }, []);

  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    const renderScene = new RenderPass(scene, camera);
    const outputPass = new OutputPass();

    const newComposer = new EffectComposer(renderer);
    newComposer.addPass(renderScene);
    newComposer.addPass(bloomPass);
    newComposer.addPass(outputPass);
    setComposer(newComposer);

    return () => {
      newComposer.dispose();
    };
  }, [scene, camera, renderer, bloomPass]);

  useEffect(() => {
    if (!composer) return;
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(window.devicePixelRatio);

    // bloomPass.resolution = new Vector2(size.width, size.height)
  }, [size, composer, bloomPass]);

  useEffect(() => {
    if (!bloomPass) return;
    bloomPass.threshold = threshold;
    bloomPass.strength = strength;
    bloomPass.radius = radius;
    bloomPass.BlurDirectionX.copy(direction);
  }, [threshold, strength, radius, bloomPass, direction]);

  useFrame((_, delta) => {
    if (composer) {
      composer.render(delta);
    }
  }, 1); // Render priority 1 (after main scene)

  // return null;
  return (
    <group {...props}>
      {/* Your particle system/components here */}
      {props.children}
    </group>
  );
};
export default function Prototype() {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const timelines = useRef([]);

  const eR = useRef();
  window.x = eR;

  return (
    <SectionProvider>
      <div className="w-full min-h-screen bg-black  text-white relative overflow-hidden">
        <div className="fixed inset-0">
          <Canvas
            className="w-full h-full"
            camera={{ position: [0, 0, 1.5], fov: 50, near: 0.1, far: 1000 }}
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
            <OrbitControls />
            <PostProcessing>
              <MainScene />
            </PostProcessing>
            {/* <mesh>
              <boxGeometry />
            </mesh> */}
            {/* <AnimatedBlobScene /> */}
            {/* <EffectComposer>
              <renderPass />
              <outputPass />
            </EffectComposer> */}
            {/* <OrbitControls /> */}
            {/* <Effects> */}
            {/* <motionBloomPass args={[undefined, 0.058, 1.2, 0]} /> */}
            {/* <outlinePass /> */}
            {/* </Effects> */}
          </Canvas>
        </div>
        <Leva />
        {/* <HTMLContend /> */}
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
