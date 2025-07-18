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

const RewardLogos = forwardRef((props, ref) => {
  const model = useRewardsModel();
  const groupRef = useRef();
  window.z = groupRef;
  const [isInView, setInView] = useState(false);
  console.log({ isInView });

  useImperativeHandle(
    ref,
    () => ({
      setView: (value) => setInView(value),
      model: () => groupRef.current,
    }),
    []
  );

  useFrame(({ pointer }) => {
    let g = groupRef.current;
    if (!g) return;
    g.rotation.x = lerp(g.rotation.x, -pointer.y * 0.1, 0.1);
    g.rotation.z = lerp(g.rotation.z, -pointer.x * 0.1, 0.1);
  });

  const animi = useRef({ opacity: 0 });

  return (
    <group ref={groupRef} position={[0, -0.15, -5]}>
      {/* <ambientLight /> */}
      <Environment preset="city" />
      {/* <directionalLight rotation={[0, 0, -1]} /> */}
      <primitive object={model.scene} />
    </group>
  );
});

export function Rewards({ id = "_Rewards" }) {
  const el = useRef(); // Sticky header ref

  const fboTextures = useTreasureLogo("Chest__1", 512);
  const config = useMemo(() => {
    return options.rewards.config;
  }, []);
  const meshRef = useRef();
  const rootRef = useRef(); // This ref will still exist but won't be used by the observer
  //   const isInView = useInView(el, { once: false, amount: 0.35 });
  const logo_ref = useRef();
  console.log(logo_ref);
  const { activeSceneId, setActiveSceneId, activeSceneHandler, particleState } =
    useTrackerContext();

  const isInView = useInView(el, { once: false, amount: 0.25 });
  useEffect(() => {
    let logos = logo_ref?.current;
    if (!logos) return;
    if (!isInView) {
      console.log(activeSceneId, id, "20");
      // If the scene is not in view and it's the active scene, reset the state
      if (activeSceneId === id) {
        activeSceneHandler("");
        setActiveSceneId("");
      }
      // logo_ref?.current?.model().scale.set(0, 0, 0);

      logos.setView(false);
      return;
    }

    logos.setView(!false);

    activeSceneHandler({
      id,
      fboState: true,
      fboTextures,
      config,
    });
    setActiveSceneId(id);
  }, [activeSceneId, id, isInView, activeSceneHandler, fboTextures, logo_ref]);
  const stateRef = useRef({
    wasInView: false,
    lastVisibility: 0,
    activeState: null,
    lastScrollTime: 0,
  });

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
    updateParticleState(position, scale);
  }, [tracker, updateParticleState]);

  useEffect(() => {
    const unsubscribe = onScroll(handleScroll);
    handleScroll(); // Initial check
    return unsubscribe;
  }, [tracker, handleScroll, onScroll, isInView]);

  return (
    <>
      <div className="pointer-events-none box-border relative flex flex-col h-screen w-screen justify-center items-center">
        <div
          className="pointer-events-none border text-red-600 font-bold border-red-600 absolute w-full h-full  items-center justify-center rounded-lg shadow-md
        md:w-1/2 md:h-full py-8"
        >
          <p className="text-4xl text-center text-white">
            Customer management For Any Web3 Protocol{" "}
          </p>
        </div>
        <div
          id="test"
          ref={el}
          className="pointer-events-none border-0 border-green-600 w-screen h-auto min-w-[500px]  max-w-[500px] aspect-square"
        ></div>
      </div>
      <UseCanvas>
        <ScrollScene track={el}>
          {(props) => {
            let v = new THREE.Mesh();
            let positionRef = useRef(new THREE.Vector3());
            const scaleRef = useRef(new THREE.Vector3()).current;
            const planeRefs = useRef([]);
            const oRef = useRef([]);
            return (
              <group {...props}>
                <RewardLogos ref={logo_ref} />
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
