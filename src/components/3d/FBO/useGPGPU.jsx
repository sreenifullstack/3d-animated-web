import { useRef, useEffect, useMemo, useState } from "react";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import { useThree } from "@react-three/fiber";
import { fbo_fragment } from "../shaders/fboShader";

const defaultUniforms = {
  type: { value: 1 },
  time: { value: 0 },
  timeScale: { value: 4.12 },
  texturePosition1: { value: null },
  texturePosition2: { value: null },
  anim2: { value: 1 },
  waves: { value: 0 },
  frequency: { value: 1 },
  xWaveScale: { value: 0.01 },
  yWaveScale: { value: 0.01 },
  zWaveScale: { value: 0.01 },
  lines: { value: 0 },
  uHole: { value: 0 },
  uLineOP: { value: 0 },
};

export function useGPGPU({ width = 64, uniforms = {} }) {
  const { gl: renderer } = useThree();
  const gpuComputeRef = useRef(null);
  const filterRef = useRef(null);
  const outputRenderTargetRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const computedUniforms = useMemo(
    () => ({ ...defaultUniforms, ...uniforms }),
    [uniforms]
  );

  useEffect(() => {
    if (!renderer) return;

    setIsReady(false);

    const gpu = new GPUComputationRenderer(width, width, renderer);
    const filter = gpu.createShaderMaterial(fbo_fragment, computedUniforms);
    const output = gpu.createRenderTarget();

    gpuComputeRef.current = gpu;
    filterRef.current = filter;
    outputRenderTargetRef.current = output;
    setIsReady(true);
    console.log(gpuComputeRef, "gpuComputeRef.current");
    return () => {
      gpu.dispose();
      filter.dispose?.();
      output.dispose?.();
    };
  }, [renderer, width, computedUniforms]);

  const update = useMemo(
    () => (time) => {
      const filter = filterRef.current;
      const gpuCompute = gpuComputeRef.current;
      const outputRenderTarget = outputRenderTargetRef.current;

      if (!filter || !gpuCompute || !outputRenderTarget) return;

      filter.uniforms.time.value = time;
      gpuCompute.doRenderTarget(filter, outputRenderTarget);
    },
    []
  );

  const setPositionFromDataArrays = useMemo(
    () => (dataArray) => {
      const gpuCompute = gpuComputeRef.current;
      if (!gpuCompute) return null;

      const texture = gpuCompute.createTexture();
      texture.image.data = dataArray;
      return texture;
    },
    []
  );

  const setPosition = useMemo(
    () => (populateFunction) => {
      const gpuCompute = gpuComputeRef.current;
      if (!gpuCompute) return null;

      const texture = gpuCompute.createTexture();
      populateFunction(texture.image.data);
      return texture;
    },
    []
  );

  return {
    setPositionFromDataArrays,
    setPosition,
    isReady,
    filter: filterRef.current,
    output: outputRenderTargetRef.current?.texture,
    update,
    gpuCompute: gpuComputeRef.current,
    getCurrentTexture: () => gpuComputeRef.current?.getCurrentRenderTarget(),
  };
}
