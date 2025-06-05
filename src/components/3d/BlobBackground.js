"use client";

import * as THREE from "three";
import { gradientBlobUniforms } from "@/components/3d/gradientBlobUniforms";
import { vertexShader, fragmentShader } from "@/components/3d/shaders/bgShader";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const BlobBackground = memo(({ frameOptions = [] }) => {
  const ref = useRef();
  const { uniforms, set } = gradientBlobUniforms();

  const materialRef = useRef();

  const colors = useMemo(() => {
    return frameOptions.map((frame) => ({
      color1: new THREE.Color(frame.bg.color1),
      color2: new THREE.Color(frame.bg.color2),
      color3: new THREE.Color(frame.bg.color3),
    }));
  }, [frameOptions]);

  useGSAP(() => {
    if (!materialRef?.current?.uniforms || !colors.length) return;
    // Set initial colors
    console.log(materialRef.current.uniforms, colors[0], frameOptions);
    const uniforms = materialRef.current?.uniforms;
    if (materialRef.current) {
      materialRef.current.uniforms?.uColor1?.value?.copy(colors[0].color1);
      materialRef.current.uniforms?.uColor2?.value?.copy(colors[0].color2);
      materialRef.current.uniforms?.uColor3?.value?.copy(colors[0].color3);
    }

    // Create a timeline for smooth color transitions
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7, // Smooth scrubbing
        markers: false,
        invalidateOnRefresh: true,
      },
      yoyo: true,
    });

    // Calculate total scroll distance
    const totalSections = frameOptions.length;
    const increment = 1 / (totalSections - 1);

    // Create color transitions
    frameOptions.forEach((_, index) => {
      if (index < totalSections - 1) {
        const progress = index * increment;
        console.log("PRO");
        const nextColors = colors[index + 1];

        tl.to(
          materialRef.current.uniforms.uColor1.value,
          {
            r: nextColors.color1.r,
            g: nextColors.color1.g,
            b: nextColors.color1.b,
            duration: increment,
            ease: "none",
          },
          progress
        );

        tl.to(
          materialRef.current.uniforms.uColor2.value,
          {
            r: nextColors.color2.r,
            g: nextColors.color2.g,
            b: nextColors.color2.b,
            duration: increment,
            ease: "none",
          },
          progress
        );

        tl.to(
          materialRef.current.uniforms.uColor3.value,
          {
            r: nextColors.color3.r,
            g: nextColors.color3.g,
            b: nextColors.color3.b,
            duration: increment,
            ease: "none",
          },
          progress
        );
      }
    });

    return () => {
      // Cleanup
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [colors, frameOptions, materialRef]);

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
          ref={materialRef}
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
