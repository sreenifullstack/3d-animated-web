import { useScrollRig, useTracker } from "@14islands/r3f-scroll-rig";
import { useControls } from "leva";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Euler, Vector3 } from "three";
import {
  useSceneConfig,
  SCENE_TYPES,
  validateSceneConfig,
  createSceneConfig,
} from "../GPGPU/SceneConfigManager";
import { useSigmaLogo, useSplaterTexture } from "./useSigmaLogo";

const TrackerContext = createContext();

export const TrackerProvider = ({ children }) => {
  const defaultConfig = useMemo(
    () => createSceneConfig(SCENE_TYPES.SECTION),
    []
  );
  const introConfig = useMemo(() => createSceneConfig(SCENE_TYPES.INTRO), []);

  const [fboState, setFboState] = useState(false);
  const [activeConfig, setActiveConfig] = useState(defaultConfig);
  const [activeSceneId, setActiveSceneId] = useState("");
  const [bgConfig, setBgConfig] = useState(defaultConfig);
  const [count, setCount] = useState(512);
  const [config, setConfig] = useState(defaultConfig);
  const [activeTexture, setActiveTexture] = useState(null);
  const [isIntro, setIntro] = useState(!true);
  const [textures, setTextures] = useState(null);
  const [postProcessing, setPostProcessing] = useState(
    introConfig.postProcessing
  );
  // Refs
  const fboNdcCoord = useRef(new Vector3());
  const particleGroupRef = useRef();
  const particleState = useRef({
    position: new Vector3(),
    scale: new Vector3(),
    rotation: new Euler(0, 0, 0, "XYZ"),
    mouseRef: new Vector3(),
  });

  // Custom hooks
  const _sigma = useSigmaLogo(count);
  const _splater = useSplaterTexture(count);

  // Effects
  useEffect(() => {
    const currentConfig = isIntro ? introConfig : config;
    setPostProcessing(currentConfig.postProcessing);
  }, [isIntro, config, introConfig]);

  useEffect(() => {
    setConfig(isIntro ? introConfig : activeConfig);
    setBgConfig(isIntro ? introConfig : activeConfig);
    setActiveTexture(null);
  }, [isIntro, introConfig]);

  useEffect(() => {
    if (isIntro) return;
    if (!_splater || !_sigma) return;

    setBgConfig(activeConfig);
    if (!fboState && !isIntro && _splater) {
      setConfig(defaultConfig);
      setActiveTexture(_splater);
      fboState?.current?.scale?.set?.(1000, 1000, 1000);
      return;
    }

    if (fboState && textures?.positionTexture) {
      // setConfig(newConfig);
      const newConfig = activeConfig || defaultConfig;
      setConfig(newConfig);
      // console.log("ssss", textures, "textures");
      setActiveTexture(textures);

      return;
    }

    // setConfig(activeConfig);
  }, [isIntro, fboState, textures, activeConfig, introConfig]);

  // Handlers
  const activeSceneHandler = useCallback(
    (props) => {
      console.log(props, ":props");
      if (!props) {
        setFboState(false);
        // setActiveSceneId("");
        // setActiveConfig(defaultConfig);
        return;
      }

      const {
        fboState = false,
        config = defaultConfig,
        id = "",
        fboTextures = null,
      } = props;
      setFboState(!!fboTextures);
      setActiveConfig(config);
      setTextures(fboTextures);
      // setActiveSceneId(id);
    },
    [defaultConfig]
  );

  const setIntroWithConfig = useCallback(
    (introState) => {
      setIntro(introState);
      if (introState) {
        setConfig(introConfig);
      }
    },
    [introConfig]
  );

  return (
    <TrackerContext.Provider
      value={{
        count,
        particleGroupRef,
        fboNdcCoord,
        particleState,
        fboState,
        activeTexture,
        config,
        activeConfig,
        bgConfig,
        isIntro,
        setIntro: setIntroWithConfig,
        postProcessing,
        // sceneType,
        activeSceneHandler,
        createSceneConfig,
        validateSceneConfig,
        activeSceneId,
        setActiveSceneId,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTrackerContext = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTrackerContext must be used within a TrackerProvider");
  }
  return context;
};
