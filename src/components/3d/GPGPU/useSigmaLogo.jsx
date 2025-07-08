"use client";
const path = "/models/sigmaV5.glb";
const logosPath = "/models/logos.glb";
const textedPath = "/models/WALLETS.glb";
import {
  sampleMesh,
  sampleMixedMeshes,
} from "@/components/3d/GPGPU/useSampler";
import { useFont, useGLTF } from "@react-three/drei"; // Assuming this import path
import { useState, useEffect } from "react";

import { useMemo } from "react";
import * as THREE from "three";
import { mapLinear } from "three/src/math/MathUtils";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
// import font from "three/examples/fonts/helvetiker_regular.typeface.json";

import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

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

const useLogoModels = () => {
  const model = useGLTF(logosPath);
  console.log({ model });
  return useMemo(() => model, [model]);
};

export const useSampledLogo = (nodeName, size = 128) => {
  const model = useLogoModels();

  const sampled = useMemo(() => {
    if (!model?.nodes?.[nodeName]) return null;
    return sampleMesh(model.nodes[nodeName], size, true);
  }, [model, nodeName, size]);

  return useMemo(() => ({ model, ...sampled }), [model, sampled]);
};

export const useWalletLogo = (size) => useSampledLogo("WALLETS001", size);
export const useChainLogo = (size) => useSampledLogo("CHAINS001", size);
export const useTradingLogo = (size) => useSampledLogo("TRADING001", size);
export const useInvestmentLogo = (size) =>
  useSampledLogo("INVESTMENT001", size);

export const useTextGeometry = (text = "Test Text", size = 128) => {
  const model = useGLTF(textedPath);
  const [sampled, setSampled] = useState(null);

  useEffect(() => {
    if (model && model.nodes && model.nodes.WALLETS001) {
      let m = new THREE.Matrix4();
      // m.makeRotationY(Math.PI);
      // model.nodes.CHAINS.geometry.applyMatrix4(m);
      // model.nodes.CHAINS.rotation.set(1, 1, 1);
      // model.scene.updateMatrixWorld(true);
      setSampled(sampleMesh(model.nodes.WALLETS001, size, true));
    }
  }, [model, size]);

  return useMemo(() => {
    return { model, ...sampled };
  }, [sampled]);
};

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
useGLTF.preload(logosPath);
useGLTF.preload(textedPath);

useFont.preload("/fonts/helvetiker_regular.typeface.json");
