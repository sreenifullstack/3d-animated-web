import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

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

const GradientShaderMaterial = shaderMaterial(
  {
    color1: new THREE.Color(0.0, 0.0, 0.0),
    color2: new THREE.Color(0.0, 0.0, 0.0),
    color3: new THREE.Color(0.0, 0.0, 0.0),
    mixRatio: 0.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float mixRatio;
    varying vec2 vUv;

    void main() {
      vec3 color = mix(
        mix(color1, color2, vUv.y),
        color3,
        vUv.y * vUv.y
      );
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ GradientShaderMaterial });

export default function PresistSmoothGradientBackground({ frameOptions }) {
  const materialRef = useRef();

  const colors = useMemo(() => {
    return frameOptions.map((frame) => ({
      color1: new THREE.Color(frame.bg.color1),
      color2: new THREE.Color(frame.bg.color2),
      color3: new THREE.Color(frame.bg.color3),
    }));
  }, [frameOptions]);

  useGSAP(() => {
    // Set initial colors
    if (materialRef.current) {
      materialRef.current.color1.copy(colors[0].color1);
      materialRef.current.color2.copy(colors[0].color2);
      materialRef.current.color3.copy(colors[0].color3);
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
        const nextColors = colors[index + 1];

        tl.to(
          materialRef.current.color1,
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
          materialRef.current.color2,
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
          materialRef.current.color3,
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
  }, [colors, frameOptions]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <gradientShaderMaterial ref={materialRef} transparent={true} />
    </mesh>
  );
}
