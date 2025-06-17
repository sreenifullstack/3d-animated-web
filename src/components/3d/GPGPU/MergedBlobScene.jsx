"use client";

import * as THREE from "three";
import { gradientBlobUniforms } from "@/components/3d/gradientBlobUniforms";
import { vertexShader, fragmentShader } from "@/components/3d/shaders/bgShader";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTrackerContext } from "../FBO/TrackerSection";

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

export const MergedBlobScene = memo(({ config = null, type = "default" }) => {
  const {
    bgConfig: contextConfig,
    sceneType,
    activeScene,
    particleState,
    fboNdcCoord,
  } = useTrackerContext();
  const ref = useRef();
  const materialRef = useRef();
  window.materialRef = materialRef;
  // Use provided config or fall back to context config
  const activeConfig = config || contextConfig;

  // Extract background properties from config
  const bgConfig = activeConfig?.bg || {};

  const {
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
    uAlpha = alpha,
    uBlackAlpha = blackAlpha,
  } = bgConfig;

  const uniformsRef = useRef({
    uTime: { value: 1 },
    uBlackPosition: {
      value: new THREE.Vector2(0.5, 0.5),
    },
    uBlackRadius: { value: blackRadius },
    uBlackBorderFade: { value: blackBorderFade },
    uBlackTimeScale: { value: blackTimeScale },
    uBlackAlpha: { value: uBlackAlpha },
    uColor1: { value: new THREE.Color(color1) },
    uColor2: { value: new THREE.Color(color2) },
    uTimeScale: { value: timeScale },
    uScale: { value: scale },
    uColor3: { value: new THREE.Color(color3) },
    uScale3: { value: scale3 },
    uScaleVignette: { value: scaleVignette },
    uVignetteBorderFade: { value: vignetteBorderFade },
    uAlpha: { value: uAlpha },
  });

  console.log(uAlpha, uBlackAlpha, "a");
  // GSAP animation system for prop changes
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
      //   gsap.to(uniforms.uBlackPosition.value, {
      //     x: blackPosition[0],
      //     y: blackPosition[1],
      //     duration: 1.0,
      //     ease: "power2.out",
      //   });

      gsap.to(uniforms.uBlackRadius, {
        value: blackRadius,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uBlackBorderFade, {
        value: blackBorderFade,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uBlackTimeScale, {
        value: blackTimeScale,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uBlackAlpha, {
        value: uBlackAlpha,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uTimeScale, {
        value: timeScale,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uScale, {
        value: scale,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uScale3, {
        value: scale3,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uScaleVignette, {
        value: scaleVignette,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uVignetteBorderFade, {
        value: vignetteBorderFade,
        duration: 1.0,
        ease: "power2.out",
      });

      gsap.to(uniforms.uAlpha, {
        value: uAlpha,
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
        uBlackAlpha,
        timeScale,
        scale,
        scale3,
        scaleVignette,
        vignetteBorderFade,
        uAlpha,
      ],
    }
  );

  useFrame(({ clock, camera, gl }, delta) => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uTime.value = clock.getElapsedTime();

    const ndc = fboNdcCoord?.current;
    if (!ndc) return;
    uniformsRef.current.uBlackPosition.value.x = ndc.x;
    uniformsRef.current.uBlackPosition.value.y = ndc.y;
    // console.log(ndc);
  });

  // Log scene type changes for debugging
  useEffect(() => {
    const currentType = type || sceneType || activeScene?.type;
    console.log(`MergedBlobScene: Scene type changed to ${currentType}`);
    console.log("Active config:", activeConfig);
    console.log("Background config:", bgConfig);
    console.log("Colors:", { color1, color2, color3 });
  }, [
    type,
    sceneType,
    activeScene?.type,
    activeConfig,
    bgConfig,
    color1,
    color2,
    color3,
  ]);

  return (
    <scene name="merged-blob-scene">
      <mesh ref={ref}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniformsRef.current}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          depthWrite={false}
          depthTest={false}
          transparent={true}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </scene>
  );
});

// Export the original BlobBackground for backward compatibility
export const BlobBackground = MergedBlobScene;
