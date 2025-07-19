import * as THREE from "three";
window.THREE = THREE;
import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";

import {
  UseCanvas,
  useTracker,
  useScrollbar,
  ScrollScene,
} from "@14islands/r3f-scroll-rig";
import { StickyScrollScene } from "@14islands/r3f-scroll-rig/powerups";

import { useTrackerContext } from "@/components/3d/GPGPU/TrackerSection";
import { generateUUID, lerp } from "three/src/math/MathUtils";
import {
  useRewardsModel,
  useSampledLogo,
  useTreasureLogo,
} from "../useSigmaLogo";
import { m, useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import options from "./SceneConfig";
import {
  Environment,
  shaderMaterial,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

let mixer;
export function Rewards({ id = "_Rewards" }) {
  const el = useRef(); // Sticky header ref

  const fboTextures = useTreasureLogo(options.chest.nodelName, 512);
  const config = useMemo(() => {
    return options.chest.config;
  }, []);
  const meshRef = useRef();
  const rootRef = useRef();

  //   const isInView = useInView(el, { once: false, amount: 0.35 });
  const logo_ref = useRef();
  const { activeSceneId, setActiveSceneId, activeSceneHandler, particleState } =
    useTrackerContext();

  // smaller threshold will make more unstable
  const isInView = useInView(rootRef, { once: false, amount: 0.55 });

  useEffect(() => {
    if (!isInView) {
      // logos.setView(false);
      if (activeSceneId === id) {
        activeSceneHandler("");
        setActiveSceneId("");
      }

      return;
    }

    // tmp prevent if smaller threshold
    activeSceneHandler("");
    setActiveSceneId("");
    activeSceneHandler({
      id,
      fboState: true,
      fboTextures,
      config,
    });
    setActiveSceneId(id);
  }, [activeSceneId, id, isInView, activeSceneHandler, fboTextures, logo_ref]);

  const { onScroll } = useScrollbar();
  const tracker = useTracker(el);

  const updateParticleState = useCallback(
    (position, scale) => {
      if (!particleState.current) return;
      const _state = particleState.current;
      if (_state.position && _state.scale) {
        _state.position.copy(position.xyz); // Lerp for smoothness
        const sValue = scale.xy.min();
        _state.scale.set(sValue, sValue, sValue);
      }
    },
    [particleState]
  );

  // Scroll handler with dynamic thresholds
  const handleScroll = useCallback(() => {
    if (isInView === false) return;
    if (!tracker) return;
    const { inViewport, scrollState, position, scale } = tracker;
    // console.log(tracker.scrollState);
    updateParticleState(position, scale);
  }, [tracker, updateParticleState]);

  useEffect(() => {
    const unsubscribe = onScroll(handleScroll);
    handleScroll();
    return unsubscribe;
  }, [tracker, handleScroll, onScroll, isInView]);

  return (
    <>
      <div
        ref={rootRef}
        className="pointer-events-none mt-5 box-border relative flex flex-col h-screen w-screen justify-center items-center"
      >
        <div className="pointer-events-none border-0 text-red-600 font-bold border-red-600 absolute w-full h-full items-center justify-center rounded-lg shadow-md md:w-1/2 md:h-full py-8">
          <p className="text-4xl text-center text-white">
            Customer management For Any Web3 Protocol
          </p>
        </div>
        <div
          id="test"
          ref={el}
          className="pointer-events-none border-0 border-green-600 w-full h-auto max-w-[500px] aspect-square"
        ></div>
      </div>
      <UseCanvas>
        <ScrollScene track={el}>
          {({ scale, ...props }) => {
            const { activeSceneId } = useTrackerContext();

            const model = useRewardsModel();

            const { actions, mixer } = useAnimations(
              model.animations,
              model.scene
            );

            const hasPlayed = useRef(false);

            // useEffect(() => {
            //   // Play all animations
            //   if (actions) {
            //     Object.values(actions).forEach((action) => {
            //       action.reset();
            //       action.setLoop(THREE.LoopOnce, 1);
            //       action.clampWhenFinished = true;
            //       action.fadeIn(0.5); // optional fade-in
            //       action.play();
            //       action.timeScale = action.getClip().duration / 2; // → 2 seconds playback
            //     });
            //   }
            // }, [actions]);

            // useFrame((_, delta) => {

            // });

            const uniforms = useRef({
              uOpacity: { value: 0 },
              uTime: { value: 0 },
              uAmplitude: { value: 1.0 },
              uFloatStrength: { value: 0.3 }, // How much it floats
              uFloatSpeed: { value: 1 }, // Speed of floating
            });
            const tweenRef = useRef();
            window.model = model;
            useEffect(() => {
              if (!model) return;

              model.scene.traverse((child) => {
                if (child.isMesh && child.material) {
                  child.material = new THREE.MeshPhysicalMaterial({
                    color: child.material.color,
                  });
                  console.log(shaderMaterial.vertexShader);
                  child.material.onBeforeCompile = (shader) => {
                    Object.assign(shader.uniforms, uniforms.current);
                    shader.uniforms.uFloatSpeed.value =
                      (Math.random() - 0.5) * 2;

                    shader.vertexShader =
                      `
                            uniform float uTime;
                            uniform float uAmplitude;
                            uniform float uFloatStrength;
                            uniform float uFloatSpeed;
                      ` + shader.vertexShader;

                    shader.vertexShader = shader.vertexShader.replace(
                      `#include <begin_vertex>`,
                      `
                        vec3 transformed = vec3( position );
                         transformed.y += sin(uTime ) * 2. * uFloatSpeed;
                         transformed.x += cos(uTime ) * 2. * uFloatSpeed;
                         transformed.z += sin(uTime ) * 2. * uFloatSpeed;
                        // Oscillating tilt (subtle rotation around X and Z axes)
                        float angleX = sin(uTime*uFloatSpeed) * 0.2; 
                        float angleZ = cos(uTime * uFloatSpeed) * 0.2;

mat3 rotX = mat3(
    1.0,         0.0,           0.0,
    0.0, cos(angleX), -sin(angleX),
    0.0, sin(angleX),  cos(angleX)
);

mat3 rotZ = mat3(
    cos(angleZ), -sin(angleZ), 0.0,
    sin(angleZ),  cos(angleZ), 0.0,
    0.0,          0.0,         1.0
);

// Apply tilt
transformed = rotZ * rotX * transformed;

                        //  gl_Position = projectionMatrix * mvPosition;
                          `
                    );

                    shader.fragmentShader = shader.fragmentShader.replace(
                      `void main() {`,
                      `
                      uniform float uOpacity;
                      void main() {
                      `
                    );
                    shader.fragmentShader = shader.fragmentShader.replace(
                      /vec4 diffuseColor.*;/,
                      `
                      vec3 rgb = vNormal*0.5+0.5;
                      vec4 diffuseColor = vec4(diffuse, uOpacity);      
                    `
                    );
                  };
                  // child.material.roughness = 0.25;
                  // child.material.metalness = 0.53;
                  child.material.side = THREE.DoubleSide;
                  child.material.transparent = true;
                  child.material.needsUpdate = true;
                }
              });
            }, [model]);

            useEffect(() => {
              const isInView = activeSceneId === "_Rewards";

              if (actions && isInView && !hasPlayed.current) {
                Object.values(actions).forEach((action) => {
                  action.reset();
                  action.setLoop(THREE.LoopOnce, 1);
                  action.clampWhenFinished = true;
                  action.fadeIn(0.5); // optional fade-in
                  action.play();
                  action.timeScale = action.getClip().duration / 8; // → 2 seconds playback
                });

                hasPlayed.current = true;

                tweenRef.current?.kill();
                tweenRef.current = gsap.to(uniforms.current.uOpacity, {
                  value: 1,
                  duration: 5,
                  delay: 0.5,
                });
              }

              if (!isInView) {
                hasPlayed.current = false;

                tweenRef.current?.kill();
                tweenRef.current = gsap.to(uniforms.current.uOpacity, {
                  value: 0,
                  duration: 0.5,
                });
              }

              return () => {
                tweenRef.current?.kill();
                tweenRef.current = null;
              };
            }, [actions, activeSceneId]);

            useFrame(({ pointer, clock }, delta) => {
              if (!model?.scene) return;
              if (mixer) mixer.update(delta);

              if (uniforms.current) {
                uniforms.current.uTime.value = clock.getElapsedTime();
              }

              model.scene.rotation.x = lerp(
                model.scene.rotation.x,
                -pointer.y * 0.1,
                0.01
              );
              model.scene.rotation.z = lerp(
                model.scene.rotation.z,
                -pointer.x * 0.1,
                0.01
              );
            });

            return (
              <group scale={[scale.x, scale.y, 200]} {...props}>
                <Environment preset="warehouse" resolution={256} />
                <primitive object={model.scene} />
                <mesh ref={meshRef}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshNormalMaterial wireframe visible={false} />
                </mesh>
              </group>
            );
          }}
        </ScrollScene>
      </UseCanvas>
    </>
  );
}
