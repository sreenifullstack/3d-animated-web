import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { useEffect, useMemo } from "react";

import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
const cacheMap = new WeakMap();

const mergeMeshGeometries = (geo1, geo2) => {
  return mergeGeometries([geo1, geo2]);
};

export function sampleMesh(mesh: THREE.Mesh, size: number, spread = false) {
  const count = size * size;
  const positions = new Float32Array(3 * count);
  const uvs = new Float32Array(2 * count);
  const positionData = new Float32Array(4 * count);
  const velocityData = new Float32Array(4 * count).fill(0);

  const sampler = new MeshSurfaceSampler(
    mesh.isMesh ? mesh : new THREE.Mesh(mesh as any)
  ).build();
  const _pos = new THREE.Vector3();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      if (spread && Math.random() < 0.05) {
        _pos.x = (Math.random() - 0.5) * 100; //(Math.random() - 0.5) * 50;
        _pos.y = (Math.random() - 0.5) * 100; //(Math.random() - 0.5) * 50;
        _pos.z = (Math.random() - 0.5) * 100; //(Math.random() - 0.5) * 50;
      } else {
        sampler.sample(_pos);
      }
      positionData.set([_pos.x, _pos.y, _pos.z, 11], index * 4);
      positions.set([_pos.x, _pos.y, _pos.z], index * 3);
      uvs.set([j / (size - 1), i / (size - 1)], index * 2);
    }
  }

  const createDataTexture = (data: Float32Array) => {
    const tex = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    tex.needsUpdate = true;
    return tex;
  };

  return {
    positions,
    uvs,
    positionTexture: createDataTexture(positionData),
    velocityTexture: createDataTexture(velocityData),
    geometry: mesh.isMesh ? mesh.geometry : mesh,
  };
}

export function sampleMixedMeshes(
  mesh1: THREE.Mesh,
  mesh2: THREE.Mesh,
  size: number,
  ratio: number = 0.5
) {
  const count = size * size;
  const positions = new Float32Array(3 * count);
  const uvs = new Float32Array(2 * count);
  const positionData = new Float32Array(4 * count);
  // const velocityData = new Float32Array(4 * count).fill(0);

  // Create samplers for both meshes
  const sampler1 = new MeshSurfaceSampler(
    mesh1.isMesh ? mesh1 : new THREE.Mesh(mesh1 as any)
  ).build();

  const sampler2 = new MeshSurfaceSampler(
    mesh2.isMesh ? mesh2 : new THREE.Mesh(mesh2 as any)
  ).build();

  const _pos = new THREE.Vector3();
  const countFromMesh1 = Math.floor(count * ratio);
  const countFromMesh2 = count - countFromMesh1;

  // Sample from first mesh
  for (let i = 0; i < countFromMesh1; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const index = row * size + col;

    sampler1.sample(_pos);
    positionData.set([_pos.x, _pos.y, _pos.z, 11], index * 4);
    positions.set([_pos.x, _pos.y, _pos.z], index * 3);
    uvs.set([col / (size - 1), row / (size - 1)], index * 2);
  }

  // Sample from second mesh
  for (let i = countFromMesh1; i < count; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const index = row * size + col;

    sampler2.sample(_pos);
    positionData.set([_pos.x, _pos.y, _pos.z, 12], index * 4);
    positions.set([_pos.x, _pos.y, _pos.z], index * 3);
    uvs.set([col / (size - 1), row / (size - 1)], index * 2);
  }

  const createDataTexture = (data: Float32Array) => {
    const tex = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    tex.needsUpdate = true;
    return tex;
  };

  return {
    positions,
    uvs,
    positionTexture: createDataTexture(positionData),
    // velocityTexture: createDataTexture(velocityData),
    geometry: mergeMeshGeometries(mesh1.geometry, mesh2.geometry),
  };
}

export function useSampledMesh(mesh: THREE.Mesh, size: number) {
  // useEffect(()=>{},[])

  return useMemo(() => sampleMesh(mesh, size), [mesh, size]);
}
