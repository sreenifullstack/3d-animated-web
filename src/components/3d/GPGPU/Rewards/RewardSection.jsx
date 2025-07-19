import * as THREE from "three";

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
import { Environment, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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
            const uniforms = useRef({
              uOpacity: { value: 0 },
            });
            const tweenRef = useRef();

            useEffect(() => {
              if (!model) return;

              model.scene.traverse((child) => {
                if (child.isMesh && child.material) {
                  child.material = new THREE.MeshPhysicalMaterial({
                    color: child.material.color,
                  });
                  child.material.onBeforeCompile = (shader) => {
                    Object.assign(shader.uniforms, uniforms.current);
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
                  child.material.transparent = true;
                  child.material.needsUpdate = true;
                }
              });
            }, [model]);

            useGSAP(() => {
              const isInView = activeSceneId === "_Rewards";
              tweenRef.current?.kill();

              tweenRef.current = gsap.to(uniforms.current.uOpacity, {
                value: isInView ? 1 : 0,
                duration: isInView ? 1.5 : 0,
                delay: isInView ? 1.5 : 0,
              });

              return () => {
                tweenRef.current?.kill();
                tweenRef.current = null;
              };
            }, [activeSceneId]);

            useFrame(({ pointer }) => {
              if (!model?.scene) return;
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
