import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

export function samplePointsInsideMesh(mesh, size = 128) {
  const total = size * size;
  const positions = new Float32Array(total * 3);
  const positionData = new Float32Array(total * 4); // extra channel for velocity/lifetime/etc
  const uvs = new Float32Array(total * 2);

  const _pos = new THREE.Vector3();

  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(1, 0, 0); // fixed direction

  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const min = boundingBox.min.clone();
  const max = boundingBox.max.clone();

  function isPointInsideMesh(point) {
    raycaster.set(point, direction);
    const intersections = raycaster.intersectObject(mesh, true);
    return intersections.length % 2 === 1;
  }

  function sampleInsideMesh(maxTries = 10) {
    for (let i = 0; i < maxTries; i++) {
      const x = THREE.MathUtils.lerp(min.x, max.x, Math.random());
      const y = THREE.MathUtils.lerp(min.y, max.y, Math.random());
      const z = THREE.MathUtils.lerp(min.z, max.z, Math.random());
      const point = new THREE.Vector3(x, y, z);
      if (isPointInsideMesh(point)) return point;
    }
    return null; // fallback to surface
  }

  // Optional fallback: surface sampler if provided
  const sampler =
    mesh.geometry && mesh.geometry.attributes.position
      ? new MeshSurfaceSampler(mesh).build()
      : null;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      const point = sampleInsideMesh(20);

      if (point) {
        _pos.copy(point);
      } else if (sampler) {
        sampler.sample(_pos);
      } else {
        _pos.set(0, 0, 0); // fallback to origin
      }

      // Store positions
      positions.set([_pos.x, _pos.y, _pos.z], index * 3);
      positionData.set([_pos.x, _pos.y, _pos.z, 1], index * 4);

      // UVs (for FBO)
      uvs.set([j / (size - 1), i / (size - 1)], index * 2);
    }
  }

  return {
    positions,
    positionData,
    uvs,
  };
}
