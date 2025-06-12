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

// this.params = {
//   threshold: 0.058,
//   strength: 1.2,
//   radius: 0,
//   directionX: 1.5,
//   directionY: 1,
// };

const MainScene = () => {
  const scene = useRef();
  const { camera } = useThree();
  // useFrame(({ gl }, delta) => {
  //   // gl.autoClear = false;
  //   // gl.clearDepth();
  //   gl.render(scene.current, camera);
  // }, 100);
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

  const { scrollYProgress } = useScroll(containerRef);
  console.log(scrollYProgress);

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

  useGSAP(
    () => {
      if (!containerRef.current || !sectionRefs.current.length) return;

      // Kill any existing timelines first
      timelines.current.forEach((tl) => tl.kill());
      timelines.current = [];

      sectionRefs.current.forEach((section, index) => {
        // if (index === sectionRefs.current.length - 1) return;

        let tl = gsap.fromTo(
          section,
          {},
          {
            // autoAlpha: 1,
            // y: 0,
            ease: "power2.out",
            duration: 1,
            scrollTrigger: {
              trigger: section,
              endTrigger: section, //sectionRefs.current[index + 1],
              scrub: true,
              start: "top top",
              end: "bottom top",
              invalidateOnRefresh: true,
              yoyo: true,
              markers: true,
              immediateRender: false,
              // onEnter: () => console.log(`Entering section ${index}`),
              // onLeave: () => console.log(`Leaving section ${index}`),
              // onEnterBack: () => console.log(`Entering back section ${index}`),
              // onLeaveBack: () => console.log(`Leaving back section ${index}`),
            },
            onStart: () => {
              console.log("completed:", index, index + 1);
              setActiveScene(index + 1);
            },
            onReverseComplete: () => {
              console.log("reverse completed:", index, index - 1);
              setActiveScene(index - 1 < 0 ? index : index - 1);
            },
          }
        );

        timelines.current.push(tl);
      });

      return () => {
        timelines.current.forEach((tl) => {
          if (tl.scrollTrigger) {
            tl.scrollTrigger.kill();
          }
          tl.kill();
        });
        timelines.current = [];
      };
    },
    {
      scope: containerRef,
      dependencies: [sectionRefs.current],
    }
  );

  //   if (!containerRef.current || !sectionRefs.current) return;
  //   if (timelines.current)
  //     // timelines.current.forEach((tl) => tl.kill(), (timelines.current = []));

  //     console.log(sectionRefs.current, containerRef.current, "");
  //   sectionRefs.current.forEach((section, i, arr) => {
  //     if (i === arr.length - 1) return;
  //     // let frame = frameProperty[i];
  //     const timeline = gsap.timeline({
  //       immediateRender: !1,
  //       scrollTrigger: {
  //         invalidateOnRefresh: !0,
  //         trigger: section,
  //         endTrigger: section,
  //         yoyo: !0,
  //         scrub: 1,
  //         start: "top top",
  //         end: "bottom top",
  //         markers: true,
  //       },
  //       onStart: function () {},
  //       onComplete: function (o) {
  //         console.log(i, "Complete");
  //         // n !== t.length - 2 && (n % 2 == 0 ? e.particlesMixin.filter.uniforms.texturePosition1.value = e.particlesMixin.objs[n + 2] : e.particlesMixin.filter.uniforms.texturePosition2.value = e.particlesMixin.objs[n + 2])
  //       },
  //       onReverseComplete: function () {
  //         console.log(i, "reverse Complete");
  //         // 0 !== n && (n % 2 == 0 ? e.particlesMixin.filter.uniforms.texturePosition2.value = e.particlesMixin.objs[n - 1] : e.particlesMixin.filter.uniforms.texturePosition1.value = e.particlesMixin.objs[n - 1])
  //       },
  //       // yoyo: true,
  //     });

  //     // let ps = particlesUniforms.current;
  //     // const directionKeyframes = i % 2 === 0 ? [0, 1] : [1, 0];

  //     // let tl = timeline.to(
  //     //   ps.anime2,
  //     //   {
  //     //     keyframes: {
  //     //       value: directionKeyframes,
  //     //       ease: "none",
  //     //       easeEach: "circ4.inOut",
  //     //     },
  //     //     duration: 1,
  //     //     onUpdate: (v) => {
  //     //       // console.log(v, directionKeyframes, ps.anime2);
  //     //     },
  //     //   },
  //     //   "<"
  //     // );

  //     // const objectState = frame; //frameProperty[i];
  //     // gsapCards(objectState, tl, "circ4.inOut", 1, i);
  //     timelines.current.push(timeline);
  //   });

  //   const ctx = gsap.context(() => {}, containerRef);

  //   return () => {
  //     timelines.current.forEach((tl) => tl.kill(), (timelines.current = []));
  //     ctx.revert();
  //   };
  // }, [containerRef, sectionRefs]);

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

          {frameOptions.map((frame, i) => (
            <section
              key={i}
              ref={(el) => (sectionRefs.current[i + 1] = el)}
              className="w-full h-screen flex items-center justify-center"
              style={{ pointerEvents: "auto" }} // Enable events for these elements
            >
              {frame.component}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
