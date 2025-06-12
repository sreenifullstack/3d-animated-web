import React, {
  forwardRef,
  memo,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Assuming these are defined elsewhere
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
// import { OPTS } from "../../data/opts";

export const hexToRgb = (hex) => {
  const color = new THREE.Color(hex);

  return new THREE.Vector3(color.r, color.g, color.b);
};

const OPTS = {
  ParticleSize: 5,
  Color1: 0x111111,
  Color2: 0x23f7dd,
  Color3: 0x222222,
  minAlpha: 0.04,
  maxAlpha: 0.8,
};

export const ParticlesMaterial = memo(
  forwardRef(
    (
      {
        positionTexture,
        velocityTexture,
        resolution,
        size = OPTS.ParticleSize,
        color1 = OPTS.Color1, // These are expected to be color strings or hex numbers
        color2 = OPTS.Color2,
        color3 = OPTS.Color3,
        minAlpha = OPTS.minAlpha,
        maxAlpha = OPTS.maxAlpha,
        ...props
      },
      ref
    ) => {
      const uniformsRef = useRef({
        uPositionTexture: { value: positionTexture || null },
        uVelocityTexture: { value: velocityTexture || null },
        uResolution: { value: resolution || new THREE.Vector2() },
        uParticleSize: { value: size },
        uColor1: { value: new THREE.Color(color1) }, // Initializing THREE.Color objects here
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
        uMinAlpha: { value: minAlpha },
        uMaxAlpha: { value: maxAlpha },
        uTime: { value: 0 },
      });

      const materialRef = useRef();

      useImperativeHandle(ref, () => materialRef.current);

      useEffect(() => {
        const uniforms = uniformsRef.current;
        if (!uniforms) return;

        if (positionTexture !== undefined)
          uniforms.uPositionTexture.value = positionTexture;
        if (velocityTexture !== undefined)
          uniforms.uVelocityTexture.value = velocityTexture;
        if (resolution !== undefined) uniforms.uResolution.value = resolution;
        if (size !== undefined) uniforms.uParticleSize.value = size;
      }, [positionTexture, velocityTexture, resolution, size]);

      // useGSAP for animating color and alpha uniforms
      useGSAP(
        () => {
          const uniforms = uniformsRef.current;
          if (!uniforms) return;

          const colorProxys = [
            {
              uniform: uniforms.uColor1.value,
              target: new THREE.Color(color1),
            }, // Get current hex for smooth start
            {
              uniform: uniforms.uColor2.value,
              target: new THREE.Color(color2),
            }, //new THREE.Color(uniforms.uColor2.value.getHex()),
            {
              uniform: uniforms.uColor3.value,
              target: new THREE.Color(color3),
            },
          ];

          const alphaProxy = {
            minAlpha: uniforms.uMinAlpha.value,
            maxAlpha: uniforms.uMaxAlpha.value,
          };

          colorProxys.forEach(({ uniform, target }) => {
            gsap.to(uniform, {
              r: target.r, // Target color (from props)
              g: target.g,
              b: target.b,
              duration: 1.0, // Adjust duration for desired smoothness
              ease: "power2.out", // Choose an appropriate ease
              onUpdate: () => {
                // console.log(uniforms.uColor1.value);
                // Apply the tweened values to the actual uniforms
                // uniforms.uColor1.value.copy(colorProxy.color1);
                // uniforms.uColor2.value.copy(colorProxy.color2);
                // uniforms.uColor3.value.copy(colorProxy.color3);
                // uniforms.uMinAlpha.value = colorProxy.minAlpha;
                // uniforms.uMaxAlpha.value = colorProxy.maxAlpha;
              },
            });
          });

          gsap.to(alphaProxy, {
            minAlpha: minAlpha,
            maxAlpha: maxAlpha,
            duration: 1.0, // Adjust duration for desired smoothness
            ease: "power2.out", // Choose an appropriate ease
            onUpdate: () => {
              uniforms.uMinAlpha.value = alphaProxy.minAlpha;
              uniforms.uMaxAlpha.value = alphaProxy.maxAlpha;
              // console.log(uniforms.uMaxAlpha.value, "alpha max");
            },
          });
        },
        {
          // Dependencies: Trigger a new tween when color strings or alpha values change
          dependencies: [
            color1,
            color2,
            color3,
            minAlpha,
            maxAlpha,
            uniformsRef.current,
          ],
          // scope: materialRef,
        }
      );

      // Use useFrame to update time uniform
      useFrame(({ clock }) => {
        if (uniformsRef.current) {
          uniformsRef.current.uTime.value = clock.getElapsedTime();
        }
      });

      return (
        <shaderMaterial
          key={0}
          ref={materialRef}
          uniforms={uniformsRef.current}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          {...props}
        />
      );
    }
  )
);
