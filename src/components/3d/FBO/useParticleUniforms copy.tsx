"use client";
import { useControls } from "leva";
import * as THREE from "three";
import { useRef, useMemo, useEffect } from "react";

type UniformType =
  | "number"
  | "color"
  | "vec2"
  | "vec3"
  | "select"
  | "texture"
  | "boolean";
type UniformSchema = {
  [key: string]: {
    type: UniformType;
    value: any;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    disableGUI?: boolean;
    options?: Record<string, any>; // For select type
  };
};

let defaultUniform = {};

const additionalUniforms = {};

const mask = new THREE.TextureLoader().load("/webgl/mask.jpg");
mask.wrapS = THREE.MirroredRepeatWrapping;
mask.wrapT = THREE.MirroredRepeatWrapping;

const PARTICLE_SCHEMA: UniformSchema = {
  time: {
    value: 0,
    type: "number",
    min: 0,
    max: 100,
    step: 0.01,
    label: "time",
    disableGUI: true,
  },
  color1: {
    value: "#ffffff",
    type: "color",
    label: "color 1",
  },
  color2: {
    value: "#0096b8",
    type: "color",
    label: "color 2",
  },
  timeScale: {
    value: 0.02,
    type: "number",
    label: "timeScale",
    min: 0,
    max: 1,
    step: 0.01,
  },
  uMaskAlpha: {
    value: 1,
    type: "number",
    label: "uMaskAlpha",
    min: 0,
    max: 1,
    step: 0.01,
  },
  introMask: {
    value: mask,
    type: "texture",
    label: "introMask",
    disableGUI: true,
  },
  uIntroScale: {
    value: 0.77,
    type: "number",
    label: "uIntroScale",
    min: 0,
    max: 1,
    step: 0.01,
  },
  uIntroWidth: {
    value: 0.6,
    type: "number",
    label: "uIntroWidth",
    min: 0,
    max: 1,
    step: 0.01,
  },
  uDisplacementScale: {
    value: 0.27,
    type: "number",
    label: "uDisplacementScale",
    min: 0,
    max: 1,
    step: 0.01,
  },
  particleSize: {
    value: 20,
    type: "number",
    label: "particleSize",
    min: 0,
    max: 100,
    step: 1,
  },
  uRatio: {
    value: Math.min(window.devicePixelRatio, 2),
    type: "number",
    label: "uRatio",
    min: 0,
    max: 10,
    step: 0.1,
  },
  uMouseActive: {
    value: !false,
    type: "boolean",
    label: "uMouseActive",
    disableGUI: true,
  },
  uMousePos: {
    value: new THREE.Vector3(0, 0, 0),
    type: "vec3",
    label: "uMousePos",
  },
  uMouseArea: {
    value: 1,
    type: "number",
    label: "uMouseArea",
    min: 0,
    max: 5,
    step: 0.01,
  },
  uMouseColor: {
    value: "#0096b8",
    type: "color",
    label: "uMouseColor",
  },
  uMouseLength: {
    value: 1,
    type: "number",
    label: "uMouseLength",
    min: 1,
    max: 6,
    step: 0.1,
  },
  uMouseScale: {
    value: 0.15,
    type: "number",
    label: "uMouseScale",
    min: 0,
    max: 1,
    step: 0.01,
  },
  uMouseFrequency: {
    value: 0,
    type: "number",
    label: "uMouseFrequency",
    min: 0,
    max: 5,
    step: 0.1,
  },
  border: {
    value: 0.85,
    type: "number",
    label: "border",
    min: 0,
  },
  border2: {
    value: !0,
    type: "boolean",
    label: "border2",
  },
  borderAmount: {
    value: 0.77,
    type: "number",
    label: "borderAmount",
    min: 0,
    max: 1,
    step: 0.01,
  },
  borderNoiseFrequency: {
    value: 8.7,
    type: "number",
    label: "borderNoiseFrequency",
    min: 0,
    max: 1,
    step: 0.1,
  },
  borderNoiseScale: {
    value: 0,
    type: "number",
    label: "borderNoiseScale",
    min: 0,
    max: 1,
    step: 0.1,
  },
  CLOSEPLANE: {
    value: 0.1, //1.8
    type: "number",
    label: "CLOSEPLANE",
    min: 0,
    max: 10,
    step: 0.1,
  },
  FARPLANE: {
    value: 6,
    type: "number",
    label: "FARPLANE",
    min: 0,
    max: 10,
    step: 0.1,
  },
  ROUNDPLANE: {
    value: 0.2,
    type: "number",
    label: "ROUNDPLANE",
    min: 0,
    max: 10,
    step: 0.1,
  },
  uAlpha: {
    value: 1,
    type: "number",
    label: "uAlpha",
    min: 0,
    max: 1,
    step: 0.01,
  },
  positionTexture: {
    value: null,
    type: "texture",
    label: "positionTexture",
    disableGUI: true,
  },
};

export const useParticleUniforms = (
  initialUniforms: Record<string, any> = {}
) => {
  const uniforms = useRef<Record<string, { value: any }>>({});

  // useEffect(() => {
  //   Object.entries(initialUniforms).forEach(([key, value]) => {
  //     uniforms.current[key] = { value };
  //   });
  // }, [initialUniforms]);
  console.log(initialUniforms, "initial Particle Uniforms");
  useMemo(() => {
    uniforms.current = {};
    // Create a new object instead of mutating additionalUniforms
    const combinedSchema = Object.assign(
      {},
      additionalUniforms,
      PARTICLE_SCHEMA,
      initialUniforms
    );
    Object.entries(combinedSchema).forEach(([key, config]) => {
      console.log(key, config, "config");
      let value = {
        value:
          config.type === "color"
            ? new THREE.Color(config.value)
            : config.value,
      };
      uniforms.current[key] = value;
    });
  }, [initialUniforms]);

  const generateLevaOptions = () => {
    const levaControls: Record<string, any> = {};

    Object.entries(PARTICLE_SCHEMA).forEach(([key, config]) => {
      if (config.disableGUI) return;
      switch (config.type) {
        case "number":
          levaControls[key] = {
            value: config.value,
            min: config.min,
            max: config.max,
            step: config.step,
            label: config.label || key,
            onChange: (v) => {
              if (uniforms?.current?.[key]) {
                uniforms.current[key].value = v;
              }
            },
          };

          break;

        case "color":
          levaControls[key] = {
            value: config.value,
            label: config.label || key,
            onChange: (v) => {
              if (uniforms?.current?.[key]) {
                uniforms.current[key].value.setHex(v.replace("#", "0x"));
              }
            },
          };

          break;

        case "vec2":
          levaControls[key] = {
            value: config.value,
            min: config.min,
            max: config.max,
            step: config.step,
            label: config.label || key,
            onChange: (v) => {
              if (uniforms?.current?.[key]) {
                uniforms.current[key].value.copy(v);
              }
            },
          };
          break;

        case "vec3":
          levaControls[key] = {
            value: config.value,
            min: config.min,
            max: config.max,
            step: config.step,
            label: config.label || key,
            onChange: (v) => {
              if (uniforms?.current?.[key]) {
                uniforms.current[key].value.copy(v);
              }
            },
          };
          break;
      }
    });

    return levaControls;
  };

  const options = generateLevaOptions();
  const [opts, updateControls] = useControls("Particle", () => {
    return options;
  });

  console.log(opts, "opts");

  const updateUniforms = (controls: Record<string, any>) => {
    console.log("Updating particle uniforms:", controls);
    Object.entries(controls).forEach(([key, value]) => {
      if (options[key]) {
        console.log(`Updating control ${key}:`, value);
        updateControls({ [key]: value });
      } else if (uniforms.current[key]) {
        console.log(`Updating uniform ${key}:`, value);
        uniforms.current[key].value = value;
      } else {
        console.warn(`Uniform ${key} not found`);
      }
    });
    console.log("Current uniforms state:", uniforms.current);
  };

  return { uniforms, updateUniforms };
};
