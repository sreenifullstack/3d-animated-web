"use client";
import React, {
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  memo,
  useCallback,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import { Bvh } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import simFragment from "./shaders/simFragment.glsl";
import simFragmentVelocity from "./shaders/simFragmentVelocity.glsl";
import { mapLinear } from "three/src/math/MathUtils";
import { PostProcessing } from "./PostProcessing";
import { ParticlesMaterial } from "./ParticlesMaterial";
import { useTrackerContext } from "./TrackerSection";
// import { useTrackerContext } from "../FBO/TrackerSection";

// Constants
const DEFAULT_OPTIONS = {
  particleSize: 2,
  color1: 0x111111,
  color2: 0x23f7dd,
  color3: 0x222222,
  color4: 0x111111,
  minAlpha: 0.4,
  maxAlpha: 0.8,
};

const MOUSE_CONFIG = {
  movementThreshold: 0.001,
  returnSpeed: 0.01,
  rotationSpeed: 0.025,
  rotationIntensity: 0.35,
  forceDecay: 0.75,
};

const SCREEN_SIZE_CONFIG = {
  minScreenSize: 300,
  maxScreenSize: 2705,
  minPointSize: { intro: 1, normal: 0.5 },
  maxPointSize: { intro: 2, normal: 0.55 },
  sizeMultipliers: {
    large: { min: 1700, max: 2200, multiplier: 1.55 },
    xlarge: { min: 2200, multiplier: 2 },
  },
  baseMultiplier: 0.85,
};

// Utility functions
const createGeometryData = (size) => {
  const number = size * size;
  const positionData = new Float32Array(4 * number);
  const velocityData = new Float32Array(4 * number);
  const positions = new Float32Array(3 * number);
  const uvs = new Float32Array(2 * number);
  const position = new THREE.Vector3();
  const halfSize = size / 2;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;

      const x = mapLinear(i % halfSize, 0, halfSize, -5, 5);
      const y = mapLinear(j % halfSize, 0, halfSize, -5, 5);

      position.set(x, y, 0).multiplyScalar(2);

      // Position data (RGBA)
      const dataIndex = 4 * index;
      positionData[dataIndex] = position.x;
      positionData[dataIndex + 1] = position.y;
      positionData[dataIndex + 2] = position.z;
      positionData[dataIndex + 3] = i > halfSize ? 2 : 1;

      // Geometry attributes
      const posIndex = 3 * index;
      positions[posIndex] = position.x;
      positions[posIndex + 1] = position.y;
      positions[posIndex + 2] = position.z;

      const uvIndex = 2 * index;
      uvs[uvIndex] = j / (size - 1);
      uvs[uvIndex + 1] = i / (size - 1);
    }
  }

  return { positionData, velocityData, positions, uvs };
};

const createTexture = (data, size) => {
  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.needsUpdate = true;
  return texture;
};

const calculateParticleSize = (isIntro, viewport) => {
  const { width: screenWidth, height: screenHeight } = viewport;
  const effectiveScreenDimension = Math.min(screenWidth, screenHeight);

  const minPointSize = isIntro
    ? SCREEN_SIZE_CONFIG.minPointSize.intro
    : SCREEN_SIZE_CONFIG.minPointSize.normal;
  const maxPointSize = isIntro
    ? SCREEN_SIZE_CONFIG.maxPointSize.intro
    : SCREEN_SIZE_CONFIG.maxPointSize.normal;

  let dynamicSize = mapLinear(
    Math.min(effectiveScreenDimension, SCREEN_SIZE_CONFIG.maxScreenSize),
    SCREEN_SIZE_CONFIG.minScreenSize,
    SCREEN_SIZE_CONFIG.maxScreenSize,
    minPointSize,
    maxPointSize
  );

  // Apply size multipliers based on screen width
  if (
    screenWidth > SCREEN_SIZE_CONFIG.sizeMultipliers.large.min &&
    screenWidth < SCREEN_SIZE_CONFIG.sizeMultipliers.large.max
  ) {
    dynamicSize *= SCREEN_SIZE_CONFIG.sizeMultipliers.large.multiplier;
  } else if (screenWidth >= SCREEN_SIZE_CONFIG.sizeMultipliers.xlarge.min) {
    dynamicSize *= SCREEN_SIZE_CONFIG.sizeMultipliers.xlarge.multiplier;
  }

  return dynamicSize * SCREEN_SIZE_CONFIG.baseMultiplier;
};

// Enhanced props validation and normalization
const normalizeParticleProps = (props) => {
  const {
    size = 128,
    color1 = DEFAULT_OPTIONS.color1,
    color2 = DEFAULT_OPTIONS.color2,
    color3 = DEFAULT_OPTIONS.color3,
    color4 = DEFAULT_OPTIONS.color4,
    particleSize = DEFAULT_OPTIONS.particleSize,
    minAlpha = DEFAULT_OPTIONS.minAlpha,
    maxAlpha = DEFAULT_OPTIONS.maxAlpha,
    originalPositionTex = null,
    originalGeometry = null,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    opacity = 1,
    mouseConfig = {},
    animationConfig = {},
  } = props;

  // Validate and normalize colors
  const normalizedColors = {
    color1:
      typeof color1 === "string" ? new THREE.Color(color1).getHex() : color1,
    color2:
      typeof color2 === "string" ? new THREE.Color(color2).getHex() : color2,
    color3:
      typeof color3 === "string" ? new THREE.Color(color3).getHex() : color3,
    color4:
      typeof color4 === "string" ? new THREE.Color(color4).getHex() : color4,
  };

  // Validate and normalize arrays
  const normalizedPosition = Array.isArray(position) ? position : [0, 0, 0];
  const normalizedRotation = Array.isArray(rotation) ? rotation : [0, 0, 0];
  const normalizedScale = Array.isArray(scale) ? scale : [1, 1, 1];

  // Merge mouse configuration
  const normalizedMouseConfig = { ...MOUSE_CONFIG, ...mouseConfig };

  // Merge animation configuration
  const normalizedAnimationConfig = {
    duration: 0.25,
    ease: "none",
    ...animationConfig,
  };

  return {
    size,
    ...normalizedColors,
    particleSize,
    minAlpha,
    maxAlpha,
    originalPositionTex,
    originalGeometry,
    position: normalizedPosition,
    rotation: normalizedRotation,
    scale: normalizedScale,
    opacity,
    mouseConfig: normalizedMouseConfig,
    animationConfig: normalizedAnimationConfig,
  };
};

const FboParticles = memo(
  forwardRef((props, ref) => {
    const normalizedProps = normalizeParticleProps(props);
    const {
      size,
      color1,
      color2,
      color3,
      color4,
      particleSize,
      minAlpha,
      maxAlpha,
      originalPositionTex,
      originalGeometry,
      position,
      rotation,
      scale,
      opacity,
      mouseConfig,
      animationConfig,
    } = normalizedProps;

    const particleMaterialRef = useRef();
    const particlesRef = useRef();
    const parentGroupRef = useRef();
    const mouseRef = useRef({ coord: new THREE.Vector3(), force: 0 });
    const prevPointer = useRef(new THREE.Vector2());
    const mouseRef2 = useRef({ coord: new THREE.Vector3(), force: 0 });

    const computeState = useRef({
      gpgpu: null,
      uniforms: null,
      textures: { position: null, velocity: null },
    });

    const [computedTextures, setComputedTextures] = useState({
      position: null,
      velocity: null,
    });

    const { gl } = useThree();

    // Memoized geometry and texture creation
    const { geometry, initialTextures } = useMemo(() => {
      const { positionData, velocityData, positions, uvs } =
        createGeometryData(size);

      const posTexture = createTexture(positionData, size);
      const velTexture = createTexture(velocityData, size);

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
        },
      };
    }, [size]);

    // GPGPU initialization
    useEffect(() => {
      if (!gl || !initialTextures) return;

      const gcr = new GPUComputationRenderer(size, size, gl);

      const positionVar = gcr.addVariable(
        "uCurrentPosition",
        simFragment,
        initialTextures.position
      );
      const velocityVar = gcr.addVariable(
        "uCurrentVelocity",
        simFragmentVelocity,
        initialTextures.velocity
      );

      gcr.setVariableDependencies(positionVar, [positionVar, velocityVar]);
      gcr.setVariableDependencies(velocityVar, [positionVar, velocityVar]);

      const uniforms = {
        position: positionVar.material.uniforms,
        velocity: velocityVar.material.uniforms,
      };

      // Initialize uniforms
      const velocityUniforms = uniforms.velocity;
      velocityUniforms.uMouse = { value: new THREE.Vector3() };
      velocityUniforms.uMouseSpeed = { value: 0 };
      velocityUniforms.uOriginalPosition = {
        value: initialTextures.position,
      };
      velocityUniforms.uProgress = { value: 0 };
      velocityUniforms.intro = { value: !originalPositionTex };
      velocityUniforms.uTime = { value: 0 };
      velocityUniforms.uForce = { value: 0.7 };

      uniforms.position.uTime = { value: 0 };
      uniforms.position.intro = { value: !originalPositionTex };

      gcr.init();
      gcr.compute();

      const positionTexture = gcr.getCurrentRenderTarget(positionVar).texture;
      const velocityTexture = gcr.getCurrentRenderTarget(velocityVar).texture;

      setComputedTextures({
        position: positionTexture,
        velocity: velocityTexture,
      });

      console.log("gcr");
      computeState.current = {
        gpgpu: gcr,
        uniforms,
        textures: { position: positionTexture, velocity: velocityTexture },
      };

      return () => {
        gcr.dispose();
        initialTextures.position.dispose();
        initialTextures.velocity.dispose();
        computeState.current = {
          gpgpu: null,
          uniforms: null,
          textures: { position: null, velocity: null },
        };
      };
    }, [gl, size, initialTextures]);

    // GSAP animations with enhanced configuration

    useGSAP(() => {
      const parentGroup = parentGroupRef.current;
      const mesh = particlesRef.current;
      if (!mesh || !parentGroup) return;

      const tl = gsap.timeline({
        defaults: {
          ease: animationConfig.ease,
          duration: animationConfig.duration,
        },
      });

      const targets = [
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

      targets.forEach(({ target, value }) => {
        tl.to(value, {
          x: target.x,
          y: target.y,
          z: target.z,
        });
      });
    }, [position, scale, rotation, animationConfig]);

    // Update original position texture
    useEffect(() => {
      const { gpgpu, uniforms } = computeState.current;
      if (!gpgpu || !uniforms) return;
      uniforms.velocity.uOriginalPosition.value =
        originalPositionTex || initialTextures.position;
      uniforms.velocity.intro.value = !originalPositionTex;
      uniforms.position.intro.value = !originalPositionTex;
    }, [originalPositionTex, initialTextures]);

    // Frame updates with enhanced mouse handling
    useFrame(({ clock, camera, pointer }) => {
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

      // Mouse movement detection
      const currentPointer = new THREE.Vector2(pointer.x, pointer.y);
      const pointerMovement = prevPointer.current.distanceTo(currentPointer);
      const isMouseMoving = pointerMovement > mouseConfig.movementThreshold;

      // Update mouse force with damping
      mouseRef2.current.force = THREE.MathUtils.lerp(
        mouseRef2.current.force,
        isMouseMoving ? 1 : 0,
        mouseConfig.returnSpeed
      );

      // Apply rotation effects
      if (originalPositionTex) {
        const targetRotation = {
          x:
            rotation[0] +
            -pointer.y *
              mouseConfig.rotationIntensity *
              mouseRef2.current.force,
          y:
            rotation[1] +
            pointer.x * mouseConfig.rotationIntensity * mouseRef2.current.force,
        };

        particlesRef.current.rotation.x = THREE.MathUtils.lerp(
          particlesRef.current.rotation.x,
          targetRotation.x,
          mouseConfig.rotationSpeed
        );

        particlesRef.current.rotation.y = THREE.MathUtils.lerp(
          particlesRef.current.rotation.y,
          targetRotation.y,
          mouseConfig.rotationSpeed
        );
      }

      // console.log(ndcPoint);
      // Update uniforms
      mouseRef.current.force *= mouseConfig.forceDecay;
      uniforms.velocity.uMouseSpeed.value = mouseRef.current.force;
      uniforms.velocity.uTime.value = time;
      uniforms.position.uTime.value = time;

      prevPointer.current.copy(currentPointer);
    });

    // Pointer move handler
    const handlePointerMove = useCallback((e) => {
      const { gpgpu, uniforms } = computeState.current;
      if (!gpgpu || !uniforms || !e.intersections.length) return;

      const localMousePos = new THREE.Vector3();
      particlesRef.current.worldToLocal(
        localMousePos.copy(e.intersections[0].point)
      );

      mouseRef.current.force = 1;
      mouseRef.current.coord.copy(localMousePos);
      uniforms.velocity.uMouse.value.copy(localMousePos);
    }, []);

    useImperativeHandle(ref, () => ({
      computeState: () => computeState.current,
    }));

    return (
      <group ref={parentGroupRef}>
        <group ref={particlesRef}>
          <Bvh onPointerMove={handlePointerMove} dispose={null}>
            <mesh visible={false}>
              {!originalGeometry && <planeGeometry args={[1, 1, 1, 1]} />}
              {originalGeometry && (
                <primitive object={originalGeometry} attach="geometry" />
              )}

              <meshBasicMaterial wireframe transparent color="red" />
            </mesh>
          </Bvh>

          <points geometry={geometry}>
            <ParticlesMaterial
              ref={particleMaterialRef}
              attach="material"
              positionTexture={computedTextures.position}
              velocityTexture={computedTextures.velocity}
              color1={color1}
              color2={color2}
              color3={color3}
              color4={color4}
              size={particleSize}
              minAlpha={minAlpha}
              maxAlpha={maxAlpha}
              depthWrite={false}
              depthTest={false}
              blending={THREE.AdditiveBlending}
              opacity={opacity}
              transparent
            />
          </points>
        </group>
      </group>
    );
  })
);

FboParticles.displayName = "FboParticles";

const FboParticlesWrapper = memo(({ width = 128, ...props }) => {
  const particleGroupRef = useRef();
  const {
    particleState,
    isIntro,
    setIntro,
    config,
    activeTexture,
    fboState,
    fboNdcCoord,
    sceneType,
    validateSceneConfig,
  } = useTrackerContext();

  const particlesRef = useRef();
  const [gpuCompute, setGpuCompute] = useState(null);
  const [particleSize, setParticleSize] = useState(0);
  const mouseRef = useRef({
    coord: new THREE.Vector3(),
    force: 0,
    introForce: 0,
  });
  const { size: viewport } = useThree();

  // Validate configuration
  // useEffect(() => {
  //   if (config && !validateSceneConfig(config)) {
  //     console.warn("Invalid configuration detected in FboParticlesV2");
  //   }
  // }, [config, validateSceneConfig]);

  // Initialize GPU compute
  useEffect(() => {
    if (particlesRef.current && !gpuCompute) {
      setGpuCompute(particlesRef.current.computeState());
    }
  }, [particlesRef, gpuCompute]);

  // Update particle group transforms
  useFrame(({ camera }) => {
    const _state = particleState.current;
    if (!_state?.position || !_state?.scale || !_state?.rotation) return;

    const mesh = particleGroupRef.current;
    if (!mesh) return;

    // console.log(_state.rotation);
    mesh.position.copy(_state.position);
    mesh.scale.copy(_state.scale);
    mesh.rotation.copy(_state.rotation);

    const worldPoint = new THREE.Vector3();
    mesh.getWorldPosition(worldPoint);
    const ndcPoint = worldPoint.project(camera);

    if (fboNdcCoord?.current) {
      fboNdcCoord.current.x = ndcPoint.x;
      fboNdcCoord.current.y = ndcPoint.y;
      // console.log(fboNdcCoord.current);
    }
  }, 100);

  // Calculate particle size based on screen size and intro state
  useEffect(() => {
    const newParticleSize = calculateParticleSize(isIntro, viewport);
    setParticleSize(newParticleSize);
  }, [isIntro, viewport]);

  // Pointer move handler for intro state
  const handlePointerMove = useCallback(
    (e) => {
      if (!e.intersections.length) return;

      mouseRef.current.introForce += 0.45;
      if (mouseRef.current.introForce > 10) {
        setIntro(false);
      }
    },
    [setIntro]
  );

  // Enhanced props extraction with fallbacks
  const getParticleProps = useMemo(() => {
    if (!config) return {};
    return {
      size: 512,
      color1: config.bg?.color1,
      color2: config.bg?.color2,
      color3: config.bg?.color3,
      color4: config.bg?.color4,
      particleSize: particleSize * (config.bg?.particleSize || 1),
      minAlpha: config.bg?.minAlpha,
      maxAlpha: config.bg?.maxAlpha,
      originalPositionTex: activeTexture?.positionTexture,
      originalGeometry: activeTexture?.geometry,
      position: config.obj?.position,
      rotation: config.obj?.rotation,
      scale: config.obj?.scale,
      opacity: fboState ? 1 : 0,
      mouseConfig: config.mouse,
      animationConfig: config.animation,
    };
  }, [config, particleSize, activeTexture, fboState]);

  return (
    <group ref={particleGroupRef} {...props}>
      <Bvh onPointerMove={handlePointerMove}>
        <mesh visible={false}>
          <primitive
            object={new THREE.PlaneGeometry(1000, 1000)}
            attach="geometry"
          />
          <meshBasicMaterial wireframe transparent />
        </mesh>
      </Bvh>

      <FboParticles ref={particlesRef} {...getParticleProps} />
    </group>
  );
});

FboParticlesWrapper.displayName = "FboParticlesWrapper";

const CombinedPostProcessing = memo(() => {
  const { postProcessing } = useTrackerContext();
  return (
    <PostProcessing
      direction={postProcessing?.direction}
      threshold={postProcessing?.threshold}
      strength={postProcessing?.strength}
      radius={postProcessing?.radius}
    />
  );
});

CombinedPostProcessing.displayName = "CombinedPostProcessing";

export { FboParticlesWrapper, CombinedPostProcessing };
