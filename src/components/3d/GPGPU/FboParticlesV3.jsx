"use client";
import React, {
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  memo,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

import { Bvh, Html, shaderMaterial, useFBO, useGLTF } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import {
  fbo_fragment,
  particle_vertex,
  particle_fragment,
} from "../shaders/fboShader";

// import { useFboUniformControls } from "./fboUniformControl";

// import { useGcrUniforms } from "./useGcrUniforms";
// import { useParticleUniforms } from "./useParticleUniforms";
import { useControls } from "leva";
// import { frameProperty } from "../FrameProperty";

import gsap, { mapRange } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
// import { useSectionContext } from "./SectionProvider";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
// import { useGSAP } from "@/hooks/useGSAP";
import simFragment from "./shaders/simFragment.glsl";
import simFragmentVelocity from "./shaders/simFragmentVelocity.glsl";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { Button } from "@/components/ui/button";
import { sampleMesh, sampleMixedMeshes } from "./useSampler";
import { mapLinear } from "three/src/math/MathUtils";
import { PostProcessing } from "./PostProcessing";
import { ParticlesMaterial } from "./ParticlesMaterial";
import { sceneConfigurations } from "./sceneConfigurations";

// move to main thread
// gsap.registerPlugin(useGSAP);
// gsap.registerPlugin(ScrollTrigger);
// gsap.registerPlugin(ScrollSmoother);

const path = "/models/sigmaV5.glb";

export const hexToRgb = (hex) => {
  const color = new THREE.Color(hex);

  return new THREE.Vector3(color.r, color.g, color.b);
};

const OPTS = {
  ParticleSize: 2,
  Color1: 0x111111,
  Color2: 0x23f7dd,
  Color3: 0x222222,
  minAlpha: 0.4,
  maxAlpha: 0.8,
};

const v1 = `
void main(){
gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
gl_PointSize = 10.;
}`;

const f1 = `
uniform float uTime;
uniform vec3 uColor;
void main(){
gl_FragColor = vec4(uColor,1.);
}`;

const defaultModel = new THREE.Mesh(new THREE.PlaneGeometry());

const intro_props = {
  obj: {
    position: [0, 0.0, 0],
    rotation: [0, 0, -Math.PI / 12],
    scale: [1, 1, 1],
  },
  mouse: {
    mouseActive: false,
  },
  bg: {
    color1: "#54aba5",
    color2: "#274045",
    color3: "#375d54",
    particleSize: 0.7,
    minAlpha: 0.1,
    maxAlpha: 0.8,
  },
};

const FboParticles = memo(
  forwardRef(
    (
      {
        size = 128,
        color1 = OPTS.Color1,
        color2 = OPTS.Color2,
        color3 = OPTS.Color3,
        particleSize = OPTS.ParticleSize,
        minAlpha = OPTS.minAlpha,
        maxAlpha = OPTS.maxAlpha,
        originalPositionTex = null,
        originalGeometry = null,
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        scale = [1, 1, 1],
      },
      ref
    ) => {
      const particleMaterialRef = useRef();
      const particlesRef = useRef();
      const parentGroupRef = useRef();
      window.pa = particlesRef;
      const mouseRef = useRef({ coord: new THREE.Vector3(), force: 0 });
      console.log(originalPositionTex, "originalPositionTex");
      // Single consolidated compute state ref
      const computeState = useRef({
        gpgpu: null,
        uniforms: null,
        textures: {
          position: null,
          velocity: null,
        },
      });
      // State for computed textures
      const [computedTextures, setComputedTextures] = useState({
        position: null,
        velocity: null,
      });

      window.pm = { particleMaterialRef, computeState };

      const { gl } = useThree();
      const { geometry, initialTextures } = useMemo(() => {
        console.log("INITITAL TEX");

        const number = size * size;
        const positionData = new Float32Array(4 * number);
        const velocityData = new Float32Array(4 * number).fill(0);
        const positions = new Float32Array(3 * number);
        const uvs = new Float32Array(2 * number);
        const _position = new THREE.Vector3();

        // Create geometry data
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const index = i * size + j;
            const halfSize = size / 2;

            const x = mapLinear(i % halfSize, 0, halfSize, -5, 5);
            const y = mapLinear(j % halfSize, 0, halfSize, -5, 5);
            _position.set(x, y, 0).multiplyScalar(2);

            // Position data (RGBA)
            positionData[4 * index] = _position.x;
            positionData[4 * index + 1] = _position.y;
            positionData[4 * index + 2] = _position.z;
            positionData[4 * index + 3] = i > halfSize ? 2 : 1;

            // Geometry attributes
            positions[3 * index] = _position.x;
            positions[3 * index + 1] = _position.y;
            positions[3 * index + 2] = _position.z;

            uvs[2 * index] = j / (size - 1);
            uvs[2 * index + 1] = i / (size - 1);
          }
        }

        // Create textures
        const posTexture = new THREE.DataTexture(
          positionData,
          size,
          size,
          THREE.RGBAFormat,
          THREE.FloatType
        );
        posTexture.needsUpdate = true;

        const velTexture = new THREE.DataTexture(
          velocityData,
          size,
          size,
          THREE.RGBAFormat,
          THREE.FloatType
        );
        velTexture.needsUpdate = true;

        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

        return {
          geometry,
          initialTextures: {
            position: posTexture,
            velocity: velTexture,
            _position: posTexture.clone(),
          },
        };
      }, [size]);

      // GPGPU initialization
      useEffect(() => {
        if (!gl || !initialTextures) return;

        console.log("GPGPU");
        const _gcr = new GPUComputationRenderer(size, size, gl);

        const positionVar = _gcr.addVariable(
          "uCurrentPosition",
          simFragment,
          initialTextures.position
        );
        const velocityVar = _gcr.addVariable(
          "uCurrentVelocity",
          simFragmentVelocity,
          initialTextures.velocity
        );

        _gcr.setVariableDependencies(positionVar, [positionVar, velocityVar]);
        _gcr.setVariableDependencies(velocityVar, [positionVar, velocityVar]);

        const uniforms = {
          position: positionVar.material.uniforms,
          velocity: velocityVar.material.uniforms,
        };

        // Initialize uniforms
        uniforms.velocity.uMouse = { value: new THREE.Vector3() };
        uniforms.velocity.uMouseSpeed = { value: 0 };
        uniforms.velocity.uOriginalPosition = {
          value: initialTextures.position,
        };
        uniforms.velocity.uProgress = { value: 0 };
        uniforms.velocity.intro = { value: true };
        uniforms.velocity.uTime = { value: 0 };
        uniforms.velocity.uForce = { value: 0.7 };
        uniforms.position.uTime = { value: 0 };
        uniforms.position.intro = { value: true };

        _gcr.init();
        _gcr.compute();

        // Update textures state after initialization
        setComputedTextures({
          position: _gcr.getCurrentRenderTarget(positionVar).texture,
          velocity: _gcr.getCurrentRenderTarget(velocityVar).texture,
        });

        // Store state
        computeState.current = {
          gpgpu: _gcr,
          uniforms,
          textures: {
            position: _gcr.getCurrentRenderTarget(positionVar).texture,
            velocity: _gcr.getCurrentRenderTarget(velocityVar).texture,
          },
        };

        return () => {
          console.log("CLEANING UP GPGPU");
          _gcr.dispose();
          initialTextures.position.dispose();
          initialTextures.velocity.dispose();
          computeState.current = {
            gpgpu: null,
            uniforms: null,
            textures: {
              position: null,
              velocity: null,
            },
          };
        };
      }, [gl, size]);

      useGSAP(() => {
        const parentGroup = parentGroupRef.current;
        const mesh = particlesRef.current;
        if (!mesh || !parentGroup) return;

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 0.25 },
        });

        const proxys = [
          {
            value: parentGroup.position,
            target: new THREE.Vector3().fromArray(position),
          },
          {
            value: mesh.rotation,
            target: new THREE.Vector3(rotation[0], rotation[1], rotation[2]),
          },
          { value: mesh.scale, target: new THREE.Vector3().fromArray(scale) },
        ];

        proxys.forEach(({ target, value }) => {
          tl.to(value, {
            x: target.x,
            y: target.y,
            z: target.z,
            onUpdate: () => {
              console.log(target.x);
            },
          });
        });

        //  posiiont = [0,0,0]
        // rotation = [0,0,0]
        // scale = [0,0,0];
      }, [position, scale, rotation]);

      const _transformRef = useRef({
        position: null,
        rotation: null,
        scale: null,
      });
      useEffect(() => {
        _transformRef.current = {
          position: new THREE.Vector3().fromArray(position),
          rotation: new THREE.Euler(
            rotation[0],
            rotation[1],
            rotation[2],
            "XYZ"
          ),
          scale: new THREE.Vector3().fromArray(scale),
        };
      }, [position, rotation, scale]);

      // Store original rotation on mount
      const originalRotation = useRef(new THREE.Euler());
      //  to avoid collution
      const mouseRef2 = useRef({
        coord: new THREE.Vector3(),
        force: 0,
      });

      useEffect(() => {
        originalRotation.current.copy(particlesRef.current.rotation);
      }, [particlesRef.current]);

      // At the top of your component
      const prevPointer = useRef(new THREE.Vector2());
      const movementThreshold = 0.001; // Adjust based on sensitivity needs

      const returnSpeed = 0.01;
      const rotationSpeed = 0.025;
      const rotationIntensity = 0.35;

      useFrame(({ clock, viewport, pointer }) => {
        // console.log(pointer);

        const { gpgpu, uniforms } = computeState.current;
        if (
          !gpgpu ||
          !uniforms ||
          !particlesRef.current ||
          !parentGroupRef.current
        )
          return;

        gpgpu.compute();
        const time = clock.getElapsedTime();
        const delta = clock.getDelta();

        // 1. Mouse movement detection
        const currentPointer = new THREE.Vector2(pointer.x, pointer.y);
        const pointerMovement = prevPointer.current.distanceTo(currentPointer);
        const isMouseMoving = pointerMovement > 0.001; // Threshold for "active movement"

        // 2. Update mouse force (damped)
        mouseRef2.current.force = THREE.MathUtils.lerp(
          mouseRef2.current.force,
          isMouseMoving ? 1 : 0,
          returnSpeed // Damping factor (higher = slower decay)
        );
        // 3. Apply rotation effects
        const targetRotation = {
          x:
            rotation[0] +
            -pointer.y * rotationIntensity * mouseRef2.current.force,
          y:
            rotation[1] +
            pointer.x * rotationIntensity * mouseRef2.current.force,
        };

        particlesRef.current.rotation.x = THREE.MathUtils.lerp(
          particlesRef.current.rotation.x,
          targetRotation.x,
          rotationSpeed // Rotation return speed
        );

        particlesRef.current.rotation.y = THREE.MathUtils.lerp(
          particlesRef.current.rotation.y,
          targetRotation.y,
          rotationSpeed
        );

        mouseRef.current.force *= 0.85;
        uniforms.velocity.uMouseSpeed.value = mouseRef.current.force;
        uniforms.velocity.uTime.value = time;
        uniforms.position.uTime.value = time;
        prevPointer.current.copy(currentPointer);
      });

      useEffect(() => {
        console.log("originalPositionTex : initialted", !originalPositionTex);
        const { gpgpu, uniforms } = computeState.current;
        if (!gpgpu || !uniforms) return;
        uniforms.velocity.uOriginalPosition.value =
          originalPositionTex || initialTextures.position;

        uniforms.velocity.intro.value = !originalPositionTex;
        uniforms.position.intro.value = !originalPositionTex;
      }, [originalPositionTex, computeState]);

      useImperativeHandle(ref, () => ({
        computeState: () => computeState.current,
      }));

      const default_geo = useMemo(() => new THREE.PlaneGeometry(10, 10), []);

      return (
        <group ref={parentGroupRef}>
          <group ref={particlesRef}>
            <Bvh
              onPointerMove={(e) => {
                const { gpgpu, uniforms } = computeState.current;
                if (!gpgpu || !uniforms || !e.intersections.length) return;

                // Transform intersection point to particle system's local space
                const localMousePos = new THREE.Vector3();
                particlesRef.current.worldToLocal(
                  localMousePos.copy(e.intersections[0].point)
                );

                // Update mouse interaction
                mouseRef.current.force = 1;
                mouseRef.current.coord.copy(localMousePos);
                uniforms.velocity.uMouse.value.copy(localMousePos);
              }}
            >
              <mesh visible={false}>
                <primitive
                  object={originalGeometry || default_geo}
                  attach="geometry"
                />
                {/* <planeGeometry args={[10, 10, 10]} /> */}
                <meshBasicMaterial wireframe opacity={0.01} transparent />
              </mesh>

              {/* <mesh visible={false}>
              <planeGeometry args={[100, 100, 100]} />
              <meshBasicMaterial wireframe opacity={0.1} transparent />
            </mesh> */}
            </Bvh>

            <points geometry={geometry}>
              <ParticlesMaterial
                ref={particleMaterialRef}
                attach="material"
                positionTexture={computedTextures.position}
                velocityTexture={computedTextures.velocity}
                // resolution={new THREE.Vector2(size, size)}
                color1={color1}
                color2={color2}
                size={particleSize}
                minAlpha={minAlpha}
                maxAlpha={maxAlpha}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
                transparent
              />
            </points>
          </group>
        </group>
      );
    }
  )
);

FboParticles.displayName = "FboParticlesV2";

const data = [
  { id: "sphere", model: new THREE.TorusKnotGeometry() },
  { id: "plane", model: new THREE.PlaneGeometry(2, 2, 1) },
  { id: "cone", model: new THREE.ConeGeometry(0.5, 2, 32) },
  { id: "torus", model: new THREE.TorusGeometry() },
];

const FboParticlesV2 = memo(
  ({ width = 128, activeSceneId = null, ...props }) => {
    const { size: viewport } = useThree();
    const particlesRef = useRef();
    const [gpuCompute, setGpuCompute] = useState(null);
    const [particleSize, setParticleSize] = useState(0);

    useEffect(() => {
      if (particlesRef.current && !gpuCompute) {
        setGpuCompute(particlesRef.current.computeState());
      }
    }, [particlesRef, gpuCompute]);

    const mouseRef = useRef({
      coord: new THREE.Vector3(),
      force: 0,
      introForce: 0,
    });

    // const gpuCompute = useMemo(() => {
    //   return particlesRef?.current?.computeState?.();
    // }, [particlesRef.current]);
    console.log(gpuCompute, (window.xx = gpuCompute));
    const model = useGLTF(path);

    const [size, setSize] = useState(512);
    const [isIntro, setIntro] = useState(true);

    const textures = useMemo(() => {
      if (!model) return null;
      return [
        {
          id: 0,
          ...sampleMixedMeshes(
            model.meshes.sigma,
            model.meshes.sigma_iray,
            size,
            0.85
          ),
        },
        ...data.map((item, i) => {
          return { id: i + 1, ...sampleMesh(item.model, size) };
        }),
      ];
    }, [size, model]);

    const [config, setCongif] = useState(intro_props);
    const [activeTexture, setActiveTexture] = useState(null);

    useEffect(() => {
      if (isIntro) {
        setCongif(intro_props);
        setActiveTexture(null);
      }
    }, [isIntro]);

    useEffect(() => {
      if (isIntro) return;
      if (!sceneConfigurations[activeSceneId]) {
        // setIntro(true);
        // mouseRef.current.introForce = 0;
        // return;
      }
      if (activeSceneId !== null && textures?.[activeSceneId]) {
        setCongif({ ...sceneConfigurations[activeSceneId] });

        // console.log({ activeSceneId }, textures?.[activeSceneId].positionTexture);
        // console.log(textures?.[activeSceneId], activeSceneId);
        setActiveTexture(textures?.[activeSceneId] || null);
      }
      // console.log("");
      // const currentConfig = sceneConfigurations[activeSceneId];
    }, [activeSceneId, textures, isIntro]);

    window.texture = textures;

    // activeSceneId to swap orgianlposition if the sene is not into

    useFrame(({ gl, clock }) => {
      const { gpgpu, uniforms } = gpuCompute || {};
      if (!gpgpu || !uniforms) return;
    });

    window.z = {
      config,
      isIntro,
      setIntro,
      activeSceneId,
      activeTexture,
      textures,
      setActiveTexture,
    };
    // console.log(window.z);

    useEffect(() => {
      const minScreenSize = 300; // Smallest expected screen (e.g., mobile)
      const maxScreenSize = 2705; // Largest expected screen (e.g., desktop)

      const minPointSize = isIntro ? 1 : 0.5; // Size at `size = 0`
      const maxPointSize = isIntro ? 2 : 0.55; // Size at `size = 1`

      function mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
      }

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Use the minimum of screenWidth and screenHeight for scaling
      // This helps ensure the size scales appropriately for both portrait and landscape
      const effectiveScreenDimension = Math.min(screenWidth, screenHeight);

      let dynamicSize = mapRange(
        Math.min(effectiveScreenDimension, maxScreenSize), // Clamp to maxScreenSize
        minScreenSize,
        maxScreenSize,
        minPointSize,
        maxPointSize
      );
      if (screenWidth > 1700 && screenWidth < 1800) dynamicSize *= 1.85;
      if (screenWidth > 1800 && screenWidth < 2200) dynamicSize *= 1.75;
      if (screenWidth > 2200) dynamicSize *= 2;

      setParticleSize(dynamicSize * 0.85);
    }, [isIntro, viewport]);
    return (
      <>
        <group {...props}>
          <Bvh
            enabled={isIntro}
            onPointerMove={(e) => {
              if (!e.intersections.length) return;

              mouseRef.current.introForce += 0.45;
              if (mouseRef.current.introForce > 10) {
                setIntro(false);
              }
            }}
          >
            <mesh visible={false}>
              <primitive
                object={new THREE.PlaneGeometry(1000, 1000)}
                attach="geometry"
              />
              <meshBasicMaterial wireframe opacity={0.01} transparent />
            </mesh>
          </Bvh>

          <FboParticles
            ref={particlesRef}
            size={512}
            color1={config?.bg?.color1}
            color2={config?.bg?.color2}
            color3={config?.bg?.color3}
            particleSize={particleSize} //config?.bg?.particleSize
            minAlpha={config?.bg?.minAlpha}
            maxAlpha={config?.bg?.maxAlpha}
            originalPositionTex={activeTexture?.positionTexture}
            originalGeometry={activeTexture?.geometry}
            position={config?.obj?.position}
            rotation={config?.obj?.rotation}
            scale={config?.obj?.scale}
            // blending={config.texProp?.blending}
            // opacity={config.texProp?.opacity}
          ></FboParticles>
        </group>
        <PostProcessing
          // ref={pp_ref}
          direction={new THREE.Vector3(1.5, 1)}
          threshold={isIntro ? 0.15 : 0.058}
          strength={isIntro ? 0.535 : 1.2}
          radius={isIntro ? 0.535 : 1}
        />
      </>
    );
  }
);

useGLTF.preload(path);

export { FboParticlesV2 };
// ... existing code ...
