"use client";
import React, { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import FboParticles from "./FboParticles";
import { Leva } from "leva";
import { useControls, button } from "leva";

const FboScene = ({ width = 128, className }) => {
  const particlesRef = useRef(null);

  const generateSpherePositions = useCallback(
    (radius = 1) => {
      const positions = new Float32Array(width * width * 4);
      const totalParticles = width * width;

      for (let i = 0; i < totalParticles; i++) {
        const i4 = i * 4;

        // Generate points on a sphere using spherical coordinates
        const theta = Math.random() * Math.PI * 2; // Azimuthal angle
        const phi = Math.acos(2 * Math.random() - 1); // Polar angle

        positions[i4] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i4 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i4 + 2] = radius * Math.cos(phi);
        positions[i4 + 3] = 1;
      }

      return positions;
    },
    [width]
  );

  const generateGridPositions = useCallback(() => {
    const positions = new Float32Array(width * width * 4);
    const gridSize = Math.sqrt(width * width);
    const spacing = 2 / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = (i * gridSize + j) * 4;
        positions[index] = j * spacing - 1;
        positions[index + 1] = i * spacing - 1;
        positions[index + 2] = 0;
        positions[index + 3] = 1;
      }
    }

    return positions;
  }, [width]);

  useControls("Particle Formations", {
    "Sphere Formation": button(() => {
      if (particlesRef.current) {
        particlesRef.current.updateTexturePosition(
          2,
          generateSpherePositions(1)
        );
      }
    }),
    "Grid Formation": button(() => {
      if (particlesRef.current) {
        particlesRef.current.updateTexturePosition(2, generateGridPositions());
      }
    }),
    "Random Formation": button(() => {
      const positions = new Float32Array(width * width * 4);
      for (let i = 0; i < positions.length; i += 4) {
        positions[i] = (Math.random() - 0.5) * 2;
        positions[i + 1] = (Math.random() - 0.5) * 2;
        positions[i + 2] = (Math.random() - 0.5) * 2;
        positions[i + 3] = 1;
      }
      if (particlesRef.current) {
        particlesRef.current.updateTexturePosition(2, positions);
      }
    }),
  });

  return (
    <>
      <Leva oneLineLabels collapsed />
      <div className={className} style={{ width: "100%", height: "100vh" }}>
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 75,
            near: 0.1,
            far: 1000,
          }}
        >
          <color attach="background" args={["#000000"]} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          {/* <FboParticles ref={particlesRef} width={width} /> */}
        </Canvas>
      </div>
    </>
  );
};

export default FboScene;
