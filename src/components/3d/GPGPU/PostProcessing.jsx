import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MotionBloomPass } from "./MotionBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} = require("react");

export const PostProcessing = forwardRef(
  (
    {
      threshold = 0.4,
      strength = 1.5,
      radius = 0.85,

      direction = new THREE.Vector2(1.5, 1),
      ...props
    },
    ref
  ) => {
    const { gl: renderer, scene, camera, size } = useThree();

    const [composer, setComposer] = useState(null);

    const bloomPass = useMemo(() => {
      return new MotionBloomPass(
        new THREE.Vector2(size.width, size.height),
        strength,
        threshold,
        radius
      );
    }, []);

    const outputPass = useMemo(() => {
      return new OutputPass();
    }, []);

    useEffect(() => {
      if (!scene || !camera || !renderer) return;

      const renderScene = new RenderPass(scene, camera);
      // const outputPass = new OutputPass();

      const newComposer = new EffectComposer(renderer);
      newComposer.addPass(renderScene);
      newComposer.addPass(bloomPass);
      newComposer.addPass(outputPass);
      setComposer(newComposer);

      return () => {
        newComposer.dispose();
      };
    }, [scene, camera, renderer, bloomPass]);

    useEffect(() => {
      if (!composer || !bloomPass || !outputPass) return;
      composer.setSize(size.width, size.height);
      composer.setPixelRatio(window.devicePixelRatio);
      // bloomPass.setSize(size.width, size.height);
      // bloomPass.setPixelRatio(window.devicePixelRatio);
      // outputPass.setSize(size.width, size.height);
      // bloomPass.setPixelRatio(window.devicePixelRatio);
      // bloomPass.resolution = new Vector2(size.width, size.height)
    }, [size, composer, bloomPass, outputPass]);

    // useEffect(() => {
    //   if (!bloomPass) return;
    //   bloomPass.threshold = threshold;
    //   bloomPass.strength = strength;
    //   bloomPass.radius = radius;
    //   bloomPass.BlurDirectionX.copy(direction);
    // }, [threshold, strength, radius, bloomPass, direction]);

    useGSAP(
      () => {
        if (!bloomPass) return;

        // Create a plain object to act as the tween target for GSAP
        // This allows GSAP to smoothly interpolate values, and we then apply
        // these interpolated values to bloomPass.
        const bloomProxy = {
          threshold: bloomPass.threshold,
          strength: bloomPass.strength,
          radius: bloomPass.radius,
          directionX: bloomPass.BlurDirectionX.x,
          directionY: bloomPass.BlurDirectionX.y,
        };

        gsap.to(bloomProxy, {
          threshold: threshold,
          strength: strength,
          radius: radius,
          directionX: direction.x,
          directionY: direction.y,
          duration: 1, // Adjust duration as needed
          ease: "power2.out", // Choose an ease function
          // repeat: -1, // Repeat indefinitely
          yoyo: true,
          onUpdate: () => {
            // Apply the smoothly interpolated values back to the bloomPass
            bloomPass.threshold = bloomProxy.threshold;
            bloomPass.strength = bloomProxy.strength;
            bloomPass.radius = bloomProxy.radius;
            bloomPass.BlurDirectionX.set(
              bloomProxy.directionX,
              bloomProxy.directionY
            );
          },
        });
      },
      {
        dependencies: [threshold, strength, radius, direction, bloomPass], // Dependencies are passed in the config object
        // scope: containerRef, // Optional: scope for any potential DOM element animations
      }
    );

    useImperativeHandle(ref, () => ({
      update: ({ threshold, strength, radius, direction }) => {
        threshold && (bloomPass.threshold = threshold);
        strength && (bloomPass.strength = strength);
        radius && (bloomPass.radius = radius);
        direction && bloomPass.BlurDirectionX.copy(direction);
      },
      bloomPass: bloomPass,
    }));

    useFrame((_, delta) => {
      if (composer) {
        composer.render(delta);
      }
    }); // Render priority 1 (after main scene)

    // return null;
    return (
      <group {...props}>
        {/* Your particle system/components here */}
        {props.children}
      </group>
    );
  }
);
