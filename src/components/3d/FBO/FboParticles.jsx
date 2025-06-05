"use client";
import React, {
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import {
  fbo_fragment,
  particle_fragment,
  particle_vertex,
} from "@/components/3d/shaders/fboShader";
import { useParticleUniforms } from "./useParticleUniforms";

const FboParticles = forwardRef(({ width = 128 }, ref) => {
  const pointsRef = useRef();
  const gpuCompute = useRef();
  const outputRenderTarget = useRef();
  const filter = useRef();
  const { gl } = useThree();
  const {
    getComputeShaderUniforms,
    getParticleShaderUniforms,
    updateTexturePosition,
  } = useParticleUniforms();

  // Expose the updateTexturePosition method to parent components
  useImperativeHandle(
    ref,
    () => ({
      updateTexturePosition: (textureId, positions) => {
        updateTexturePosition(textureId, positions);

        // Update the compute shader uniforms with the new texture
        if (filter.current) {
          const uniforms = filter.current.uniforms;
          if (textureId === 1) {
            uniforms.texturePosition1.value = positions;
          } else {
            uniforms.texturePosition2.value = positions;
          }
        }
      },
    }),
    [updateTexturePosition]
  );

  // Initialize GPGPU computation
  useEffect(() => {
    if (!gl) return;

    // Initialize GPUComputationRenderer
    gpuCompute.current = new GPUComputationRenderer(width, width, gl);

    // Create initial position texture
    const positionTexture = gpuCompute.current.createTexture();
    const posData = positionTexture.image.data;

    for (let i = 0; i < posData.length; i += 4) {
      posData[i] = Math.random() - 0.5;
      posData[i + 1] = Math.random() - 0.5;
      posData[i + 2] = Math.random() - 0.5;
      posData[i + 3] = 1;
    }

    // Create computation shader
    const computeShader = gpuCompute.current.createShaderMaterial(
      fbo_fragment,
      getComputeShaderUniforms()
    );

    filter.current = computeShader;
    outputRenderTarget.current = gpuCompute.current.createRenderTarget();

    // Set initial texture positions
    updateTexturePosition(1, posData);
    updateTexturePosition(2, posData);

    // Cleanup
    return () => {
      if (gpuCompute.current) {
        gpuCompute.current.dispose();
      }
      if (outputRenderTarget.current) {
        outputRenderTarget.current.dispose();
      }
      if (filter.current) {
        filter.current.dispose();
      }
    };
  }, [gl, width, getComputeShaderUniforms, updateTexturePosition]);

  // Create geometry and material for particles
  const [geometry, material] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(width * width * 3);
    const references = new Float32Array(width * width * 2);

    for (let i = 0; i < width * width; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      // Random initial positions
      positions[i3] = Math.random();
      positions[i3 + 1] = Math.random();
      positions[i3 + 2] = Math.random();

      // UV coordinates for GPGPU texture lookup
      references[i2] = (i % width) / width;
      references[i2 + 1] = Math.floor(i / width) / width;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "reference",
      new THREE.BufferAttribute(references, 2)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: getParticleShaderUniforms(),
      vertexShader: particle_vertex,
      fragmentShader: particle_fragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    return [geometry, material];
  }, [width, getParticleShaderUniforms]);

  // Memoize material uniforms update function
  const updateMaterialUniforms = useCallback(
    (time, pointer) => {
      if (!material) return;

      material.uniforms.time.value = time;
      material.uniforms.uMousePos.value.set(pointer.x, pointer.y);
    },
    [material]
  );

  // Update GPGPU computation and render particles
  useFrame(({ clock, pointer }) => {
    if (
      !gpuCompute.current ||
      !filter.current ||
      !outputRenderTarget.current ||
      !material
    )
      return;

    // Update time uniform
    const time = clock.getElapsedTime();
    filter.current.uniforms.time.value = time * 0.02;

    // Update material uniforms
    updateMaterialUniforms(time, pointer);

    // Perform GPGPU computation
    gpuCompute.current.doRenderTarget(
      filter.current,
      outputRenderTarget.current
    );
    material.uniforms.positionTexture.value =
      outputRenderTarget.current.texture;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  );
});

FboParticles.displayName = "FboParticles";

export default FboParticles;
