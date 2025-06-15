"use client";
import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";

const path = "/models/sigmaV5.glb";

export const useSigmaLogo = () => {
  let model = useGLTF();

  const [sampled, set] = useState();

  useEffect(() => {
    if (!model) return;

    set(
      sampleMixedMeshes(model.meshes.sigma, model.meshes.sigma_iray, size, 0.85)
    );
  }, [model]);

  return model;
};

useGLTF.preload(path);
