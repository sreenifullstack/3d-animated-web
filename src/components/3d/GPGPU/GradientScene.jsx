"use client";

import * as THREE from "three";
import { gradientBlobUniforms } from "@/components/3d/gradientBlobUniforms";
import { vertexShader, fragmentShader } from "@/components/3d/shaders/bgShader";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef, useEffect } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const DEFAULTS = {
  color1: "#54aba5",
  color2: "#274045",
  color3: "#375d54",
  blackPosition: [0.5, 0.5],
  blackRadius: 0.141,
  blackBorderFade: 0.12,
  blackTimeScale: 0.19,
  blackAlpha: 1,
  timeScale: 0.19,
  scale: 1.08,
  scale3: 1.08,
  scaleVignette: 0.523,
  vignetteBorderFade: 0.216,
  alpha: 1,
};

export const BlobBackground = memo(
  ({
    color1 = DEFAULTS.color1,
    color2 = DEFAULTS.color2,
    color3 = DEFAULTS.color3,
    blackPosition = DEFAULTS.blackPosition,
    blackRadius = DEFAULTS.blackRadius,
    blackBorderFade = DEFAULTS.blackBorderFade,
    blackTimeScale = DEFAULTS.blackTimeScale,
    blackAlpha = DEFAULTS.blackAlpha,
    timeScale = DEFAULTS.timeScale,
    scale = DEFAULTS.scale,
    scale3 = DEFAULTS.scale3,
    scaleVignette = DEFAULTS.scaleVignette,
    vignetteBorderFade = DEFAULTS.vignetteBorderFade,
    alpha = DEFAULTS.alpha,
    ...props
  }) => {
    const ref = useRef();
    const uniformsRef = useRef({
      uTime: { value: 1 },
      uBlackPosition: {
        value: new THREE.Vector2(blackPosition[0], blackPosition[1]),
      },
      uBlackRadius: { value: blackRadius },
      uBlackBorderFade: { value: blackBorderFade },
      uBlackTimeScale: { value: blackTimeScale },
      uBlackAlpha: { value: blackAlpha },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uTimeScale: { value: timeScale },
      uScale: { value: scale },
      uColor3: { value: new THREE.Color(color3) },
      uScale3: { value: scale3 },
      uScaleVignette: { value: scaleVignette },
      uVignetteBorderFade: { value: vignetteBorderFade },
      uAlpha: { value: alpha },
    });

    const materialRef = useRef();

    // GSAP animation system for prop changes - similar to ParticlesMaterial.jsx
    useGSAP(
      () => {
        const uniforms = uniformsRef.current;
        if (!uniforms) return;

        // Create color proxies for smooth transitions
        const colorProxys = [
          {
            uniform: uniforms.uColor1.value,
            target: new THREE.Color(color1),
          },
          {
            uniform: uniforms.uColor2.value,
            target: new THREE.Color(color2),
          },
          {
            uniform: uniforms.uColor3.value,
            target: new THREE.Color(color3),
          },
        ];

        // Animate to new colors when props change
        colorProxys.forEach(({ uniform, target }) => {
          gsap.to(uniform, {
            r: target.r,
            g: target.g,
            b: target.b,
            duration: 1.0,
            ease: "power2.out",
          });
        });

        // Animate other uniform values
        gsap.to(uniforms.uBlackPosition.value, {
          x: blackPosition[0],
          y: blackPosition[1],
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uBlackRadius.value, {
          value: blackRadius,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uBlackBorderFade.value, {
          value: blackBorderFade,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uBlackTimeScale.value, {
          value: blackTimeScale,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uBlackAlpha.value, {
          value: blackAlpha,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uTimeScale.value, {
          value: timeScale,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uScale.value, {
          value: scale,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uScale3.value, {
          value: scale3,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uScaleVignette.value, {
          value: scaleVignette,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uVignetteBorderFade.value, {
          value: vignetteBorderFade,
          duration: 1.0,
          ease: "power2.out",
        });

        gsap.to(uniforms.uAlpha.value, {
          value: alpha,
          duration: 1.0,
          ease: "power2.out",
        });
      },
      {
        dependencies: [
          color1,
          color2,
          color3,
          blackPosition,
          blackRadius,
          blackBorderFade,
          blackTimeScale,
          blackAlpha,
          timeScale,
          scale,
          scale3,
          scaleVignette,
          vignetteBorderFade,
          alpha,
        ],
      }
    );

    useFrame(({ clock }, delta) => {
      if (!uniformsRef.current) return;
      uniformsRef.current.uTime.value = clock.getElapsedTime();
    });

    return (
      <scene name="bg-blob">
        <mesh ref={ref}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniformsRef.current}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            depthWrite={false}
            depthTest={false}
            {...props}
            transparent={true}
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </scene>
    );
  }
);
