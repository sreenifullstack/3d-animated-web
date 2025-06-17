"use client";
const path = "/models/sigmaV5.glb";

import { sampleMixedMeshes } from "@/components/3d/GPGPU/useSampler";
import { useGLTF } from "@react-three/drei"; // Assuming this import path
import { useState, useEffect } from "react";

import { useMemo } from "react";
import * as THREE from "three";
import { mapLinear } from "three/src/math/MathUtils";

export const useSigmaLogo = (size) => {
  const model = useGLTF(path);
  const [sampled, setSampled] = useState(null);
  useEffect(() => {
    if (model && model.nodes && model.nodes.sigma && model.nodes.sigma_iray) {
      setSampled(
        sampleMixedMeshes(model.nodes.sigma, model.nodes.sigma_iray, size, 0.85)
      );
    }
  }, [model, size]);

  return useMemo(() => {
    return { model, ...sampled };
  }, [sampled]);
};

//  const { geometry, initialTextures } = useMemo(() => {
//       console.log("INITITAL TEX");

//       const number = size * size;
//       const positionData = new Float32Array(4 * number);
//       const velocityData = new Float32Array(4 * number).fill(0);
//       const positions = new Float32Array(3 * number);
//       const uvs = new Float32Array(2 * number);
//       const _position = new THREE.Vector3();

//       // Create geometry data
//       for (let i = 0; i < size; i++) {
//         for (let j = 0; j < size; j++) {
//           const index = i * size + j;
//           const halfSize = size / 2;

//           // const x = mapLinear(i % halfSize, 0, halfSize, -5, 5);
//           // const y = mapLinear(j % halfSize, 0, halfSize, -5, 5);

//           const x = mapLinear(Math.random(), 0, 1, -5, 5);
//           const y = mapLinear(Math.random(), 0, 1, -5, 5);
//           const z = mapLinear(Math.random(), 0, 1, -5, 5);

//           _position.set(x, y, z).multiplyScalar(2);

//           // Position data (RGBA)
//           positionData[4 * index] = _position.x;
//           positionData[4 * index + 1] = _position.y;
//           positionData[4 * index + 2] = _position.z;
//           positionData[4 * index + 3] = 20; //i > halfSize ? 2 : 1;

//           // Geometry attributes
//           positions[3 * index] = _position.x;
//           positions[3 * index + 1] = _position.y;
//           positions[3 * index + 2] = _position.z;

//           uvs[2 * index] = j / (size - 1);
//           uvs[2 * index + 1] = i / (size - 1);
//         }
//       }

//       // Create textures
//       const posTexture = new THREE.DataTexture(
//         positionData,
//         size,
//         size,
//         THREE.RGBAFormat,
//         THREE.FloatType
//       );
//       posTexture.needsUpdate = true;

//       const velTexture = new THREE.DataTexture(
//         velocityData,
//         size,
//         size,
//         THREE.RGBAFormat,
//         THREE.FloatType
//       );
//       velTexture.needsUpdate = true;

//       // Create geometry
//       const geometry = new THREE.BufferGeometry();
//       geometry.setAttribute(
//         "position",
//         new THREE.BufferAttribute(positions, 3)
//       );
//       geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

//       return {
//         geometry,
//         initialTextures: {
//           position: posTexture,
//           velocity: velTexture,
//           _position: posTexture.clone(),
//         },
//       };
//     }, [size]);

const useGridTexture = (size) => {
  const { geometry, positionTexture } = useMemo(() => {
    const number = size * size;
    // const positionData = new Float32Array(4 * number);
    // const velocityData = new Float32Array(4 * number).fill(0);
    // const positions = new Float32Array(3 * number);
    // const uvs = new Float32Array(2 * number);
    const _position = new THREE.Vector3();

    // For grid version
    const gridPositionData = new Float32Array(4 * number);
    // const gridVelocityData = new Float32Array(4 * number).fill(0);
    const gridPositions = new Float32Array(3 * number);
    const gridUvs = new Float32Array(2 * number);
    const gridHalfSize = size / 2;

    // Create geometry data
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;

        // Grid positions
        // const x = mapLinear(i % gridHalfSize, 0, gridHalfSize, -5, 5);
        // const y = mapLinear(j % gridHalfSize, 0, gridHalfSize, -5, 5);
        // const z = 0; // You can adjust this if you want 3D grid

        const x = mapLinear(Math.random(), 0, 1, -5, 5);
        const y = mapLinear(Math.random(), 0, 1, -5, 5);
        const z = mapLinear(Math.random(), 0, 1, -5, 5);

        _position.set(x, y, z).multiplyScalar(2);

        gridPositionData[4 * index] = _position.x;
        gridPositionData[4 * index + 1] = _position.y;
        gridPositionData[4 * index + 2] = _position.z;
        gridPositionData[4 * index + 3] = i > gridHalfSize ? 2 : 1;

        gridPositions[3 * index] = _position.x;
        gridPositions[3 * index + 1] = _position.y;
        gridPositions[3 * index + 2] = _position.z;

        gridUvs[2 * index] = j / (size - 1);
        gridUvs[2 * index + 1] = i / (size - 1);
      }
    }

    const gridPosTexture = new THREE.DataTexture(
      gridPositionData,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    gridPosTexture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(5, 5, 10, 10);

    // Create geometries
    // const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // const gridGeometry = new THREE.BufferGeometry();
    // gridGeometry.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));
    // gridGeometry.setAttribute("uv", new THREE.BufferAttribute(gridUvs, 2));

    return {
      geometry,
      positionTexture: gridPosTexture,
    };
  }, [size]);

  return { geometry, positionTexture };
};

const useSplaterTexture = (size) => {
  const { geometry, positionTexture } = useMemo(() => {
    const number = size * size;
    // const positionData = new Float32Array(4 * number);
    // const velocityData = new Float32Array(4 * number).fill(0);
    // const positions = new Float32Array(3 * number);
    // const uvs = new Float32Array(2 * number);
    const _position = new THREE.Vector3();

    // For grid version
    const gridPositionData = new Float32Array(4 * number);
    // const gridVelocityData = new Float32Array(4 * number).fill(0);
    const gridPositions = new Float32Array(3 * number);
    const gridUvs = new Float32Array(2 * number);
    const gridHalfSize = size / 2;

    // Create geometry data
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;

        // Grid positions
        // const x = mapLinear(i % gridHalfSize, 0, gridHalfSize, -5, 5);
        // const y = mapLinear(j % gridHalfSize, 0, gridHalfSize, -5, 5);
        // const z = 0; // You can adjust this if you want 3D grid

        const x = mapLinear(Math.random(), 0, 1, -5, 5);
        const y = mapLinear(Math.random(), 0, 1, -5, 5);
        const z = mapLinear(Math.random(), 0, 1, -5, 5);

        _position.set(x, y, z).multiplyScalar(2);

        gridPositionData[4 * index] = _position.x;
        gridPositionData[4 * index + 1] = _position.y;
        gridPositionData[4 * index + 2] = _position.z;
        gridPositionData[4 * index + 3] = i > gridHalfSize ? 2 : 1;

        gridPositions[3 * index] = _position.x;
        gridPositions[3 * index + 1] = _position.y;
        gridPositions[3 * index + 2] = _position.z;

        gridUvs[2 * index] = j / (size - 1);
        gridUvs[2 * index + 1] = i / (size - 1);
      }
    }

    const gridPosTexture = new THREE.DataTexture(
      gridPositionData,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    gridPosTexture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(5, 5, 10, 10);

    // Create geometries
    // const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // const gridGeometry = new THREE.BufferGeometry();
    // gridGeometry.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));
    // gridGeometry.setAttribute("uv", new THREE.BufferAttribute(gridUvs, 2));

    return {
      geometry,
      positionTexture: gridPosTexture,
    };
  }, [size]);

  return { geometry, positionTexture };
};

export { useGridTexture, useSplaterTexture };

useGLTF.preload(path);
