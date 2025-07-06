import * as THREE from "three";

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

import { UseCanvas, useTracker, useScrollbar } from "@14islands/r3f-scroll-rig";
import { StickyScrollScene } from "@14islands/r3f-scroll-rig/powerups";

import { useTrackerContext } from "@/components/3d/GPGPU/TrackerSection";
import { generateUUID } from "three/src/math/MathUtils";
import { useSampledLogo } from "../useSigmaLogo";
import { useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import options from "./SceneConfig";
import { Logo2D } from "./Logo2D";

const ScrollElements = ({ options, id, activeSceneId }) => {
  const cells = [
    "col-start-5 row-start-6",
    "col-start-5 row-start-2",
    "col-start-5 row-start-4",
    "col-start-3 row-start-6",
    "col-start-1 row-start-4",
    "col-start-1 row-start-2",
    "col-start-3 row-start-2",
    "col-start-1 row-start-6",
  ];
  return (
    <div
      className={cn(
        "absolute grid grid-cols-5  grid-rows-7 w-full  h-full  top-0 overflow-hidden gap-0 opacity-0  transition-opacity duration-500 ease-in-out delay-700 ",
        id === activeSceneId && "opacity-100"
      )}
    >
      {cells.map((cell, index) => (
        <div key={index} className={cell}>
          <Logo2D src={"/ecosystem/" + options.logos[index].path} />
        </div>
      ))}
    </div>
  );
};

const ScrollSection = forwardRef(
  (
    {
      options = {},
      index = 0,
      container = null,
      handleActiveScene = () => {},
      registerScene = () => {},
      registerHtml = () => {},
    },
    ref
  ) => {
    const el = useRef();

    const uuid = useMemo(() => generateUUID(), []);
    const fboTextures = useSampledLogo(options.nodelName, 512);

    const inView = useInView(el, {
      root: container,
      amount: 0.8,
    });

    const config = useMemo(() => options.config, [options]);

    useEffect(() => {
      if (!inView) return;
      handleActiveScene({
        fboTextures,
        config,
        id: uuid,
        index,
      });
    }, [inView, handleActiveScene]);

    useEffect(() => {
      registerScene(index, { fboTextures, config });
    }, [fboTextures, config]);

    return (
      <>
        {/* for simple first slide will have 1/2 size  */}
        <div ref={el} className={index == 0 ? "h-[50vh]" : "h-[100vh]"}>
          <div className=" flex h-full w-full items-center justify-center text-4xl text-amber-300">
            {index}
          </div>
        </div>
      </>
    );
  }
);

export function Ecosystem({ id = "_Ecosystem" }) {
  const el = useRef(); // Sticky header ref

  const meshRef = useRef();
  const rootRef = useRef(); // This ref will still exist but won't be used by the observer
  const isInView = useInView(el, { once: false, amount: 0.35 });

  const { activeSceneId, setActiveSceneId, activeSceneHandler, particleState } =
    useTrackerContext();

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeSceneMap, setActiveSceneMap] = useState(null);

  const scrollElements = useRef([]);

  const sceneDataMaps = useRef([]);

  const registerScene = useCallback(
    (id, data = { fboTextures: null, config: null }) => {
      sceneDataMaps.current[id] = { ...data, id };
    },
    []
  );

  const registerHtml = useCallback((index, el) => {
    if (!el) return;
    scrollElements.current[index] = el;
  }, []);

  const handleActiveScene = useCallback(
    ({ fboTextures, config, id, index = 0 }) => {
      // console.log("Active scene changed:", id, index, fboTextures, config);
      setActiveSceneIndex(index);
      const map = sceneDataMaps?.current?.[index];
      // setActiveSceneIndex(index);
      setActiveSceneMap(map);
      console.log(index, "active");
    },
    [setActiveSceneIndex, setActiveSceneId]
  );

  useEffect(() => {
    if (!isInView) return;
    // console.log({ activeSceneIndex, b: sceneDataMaps.current.length });
    // if (activeSceneIndex !== undefined) return;
    // if (sceneDataMaps.current.length === 0) return;
    // setActiveSceneIndex(0);
    // handleActiveScene({ index: 0 });
  }, [sceneDataMaps.current, isInView, activeSceneIndex]);

  useEffect(() => {
    if (!isInView) return;
    let maps = activeSceneMap;
    if (!maps) return;
    const { fboTextures, config } = maps;
    if (!fboTextures && 1) {
    }
    activeSceneHandler({
      id,
      fboState: true,
      fboTextures,
      config,
    });
  }, [activeSceneId, activeSceneId, isInView, activeSceneMap]);

  const { onScroll, scroll } = useScrollbar();
  const tracker = useTracker(el);

  const updateParticleState = useCallback(
    (position, scale) => {
      if (!particleState.current) return;
      const _state = particleState.current;
      if (_state.position && _state.scale) {
        _state.position.set(position.x, position.y, position.z);
        const sValue = scale.x * 0.5;
        _state.scale.set(sValue, sValue, sValue);
      }
    },
    [particleState]
  );

  useEffect(() => {
    if (!isInView) {
      if (activeSceneId === id) {
        setActiveSceneId("");
        activeSceneHandler("");
      }
      return;
    }

    setActiveSceneId(id);

    if (activeSceneIndex == 0) {
      handleActiveScene({ index: 0 });
    }
  }, [activeSceneId, , id, isInView, activeSceneHandler]);

  // Scroll handler with dynamic thresholds
  const handleScroll = useCallback(() => {
    if (isInView === false) return;
    if (!tracker) return;
    if (!meshRef.current) return;

    const _position = new THREE.Vector3();
    const _scale = new THREE.Vector3();

    const { inViewport, scrollState, position, scale } = tracker;

    _position.setFromMatrixPosition(meshRef.current.matrixWorld);
    _scale.setFromMatrixScale(meshRef.current.matrixWorld);

    if (isInView) {
      updateParticleState(_position, _scale);
    }
  }, [
    activeSceneIndex,
    sceneDataMaps,
    activeSceneId,
    particleState,
    tracker,
    updateParticleState,
  ]);

  useEffect(() => {
    const unsubscribe = onScroll(handleScroll);
    handleScroll();
    return unsubscribe;
  }, [tracker, handleScroll, onScroll, isInView]);

  const scrollTrackerComponent = useMemo(() => {
    return Object.keys(options).map((key, index) => {
      let option = options[key];

      return (
        <ScrollSection
          options={option}
          container={rootRef.current}
          index={index}
          key={`scroll-scene-${index}`}
          handleActiveScene={handleActiveScene}
          registerScene={registerScene}
          registerHtml={registerHtml}
          ref={(el) => {
            if (!el) return;
            scrollElements.current[index] = el;
            return el;
          }}
        />
      );
    });
  }, [rootRef]);

  console.log(scrollTrackerComponent);
  return (
    <>
      <div ref={rootRef} className="relative border-2 border-red-500">
        <div
          ref={el}
          className="sticky flex-col top-0  left-0 z-10 flex w-[98%] h-[95vh] items-center justify-center text-4xl text-amber-300"
        >
          {
            <ScrollElements
              options={options.chains}
              id={0}
              activeSceneId={activeSceneIndex}
            />
          }
          <ScrollElements
            options={options.tradings}
            id={1}
            activeSceneId={activeSceneIndex}
          />
          <ScrollElements
            options={options.wallets}
            id={2}
            activeSceneId={activeSceneIndex}
          />
          <ScrollElements
            options={options.investments}
            id={3}
            activeSceneId={activeSceneIndex}
          />

          <div
            // rootRef remains here as per your constraint
            className="sticky left-0 z-11 flex w-[98%] h-[25vh] items-center justify-center  text-4xl text-amber-300"
          >
            <div className="bg-blue-600 text-5xl opacity-0">1Trading</div>
          </div>
        </div>

        {scrollTrackerComponent}
        <div className="h-[50vh]">
          <div className="opacity-0 flex h- w-full items-center justify-center text-4xl text-amber-300">
            Extened Scroll
          </div>
        </div>

        <UseCanvas>
          <StickyScrollScene track={el}>
            {(props) => {
              let v = new THREE.Mesh();
              let positionRef = useRef(new THREE.Vector3());
              const scaleRef = useRef(new THREE.Vector3()).current;
              const planeRefs = useRef([]);
              const oRef = useRef([]);

              return (
                <group {...props}>
                  <mesh ref={meshRef}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshNormalMaterial wireframe visible={false} />
                  </mesh>
                </group>
              );
            }}
          </StickyScrollScene>
        </UseCanvas>
      </div>
    </>
  );
}
