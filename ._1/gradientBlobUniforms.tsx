"use client";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Type definitions for our uniform schema
type UniformType = "number" | "color" | "vec2" | "vec3";
type UniformSchema = {
  [key: string]: {
    type: UniformType;
    value: any;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    disableGUI?: boolean;
  };
};

// Default uniform values with schema information
const UNIFORM_SCHEMA: UniformSchema = {
  uTime: { type: "number", value: 1, min: 0, max: 10, disableGUI: true },
  uRest: { type: "vec3", value: new THREE.Vector3() },
  uBlackPosition: {
    type: "vec2",
    value: new THREE.Vector2(0.5, 0.5),
    min: 0,
    max: 1,
    step: 0.01,
  },
  uBlackRadius: { type: "number", value: 0.141, min: 0, max: 1, step: 0.001 },
  uBlackBorderFade: {
    type: "number",
    value: 0.12,
    min: 0,
    max: 1,
    step: 0.001,
  },
  uBlackTimeScale: { type: "number", value: 0.19, min: 0, max: 1, step: 0.001 },
  uBlackAlpha: { type: "number", value: 1, min: 0, max: 1, step: 0.01 },
  uColor1: { type: "color", value: "#54aba5", label: "Primary Color" },
  uColor2: { type: "color", value: "#274045", label: "Secondary Color" },
  uTimeScale: { type: "number", value: 0.19, min: 0, max: 1, step: 0.001 },
  uScale: { type: "number", value: 1.08, min: 0.5, max: 2, step: 0.01 },
  uColor3: { type: "color", value: "#375d54", label: "Tertiary Color" },
  uScale3: { type: "number", value: 1.08, min: 0.5, max: 2, step: 0.01 },
  uScaleVignette: { type: "number", value: 0.523, min: 0, max: 1, step: 0.001 },
  uVignetteBorderFade: {
    type: "number",
    value: 0.216,
    min: 0,
    max: 1,
    step: 0.001,
  },
  uAlpha: { type: "number", value: 0.36, min: 0, max: 1, step: 0.01 },
};

export const gradientBlobUniforms = () => {
  const uniforms = useRef<Record<string, { value: any }>>({});
  useMemo(() => {
    Object.entries(UNIFORM_SCHEMA).forEach(([key, config]) => {
      let value = {
        value:
          config.type === "color"
            ? new THREE.Color(config.value)
            : config.value,
      };
      uniforms.current[key] = value;
    });
    // return () => null;
  }, []);

  const generateLevaOptions = () => {
    const levaControls: Record<string, any> = {};

    Object.entries(UNIFORM_SCHEMA).forEach(([key, config]) => {
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
  const [opts, set] = useControls(() => {
    return options;
  });

  const onChange = (name, value) => {
    // getType
    // update accordingly like vec3 , vec2 , num , col etc
    // update uniform
  };
  const getType = () => {};
  // console.log(controls);
  return { uniforms, set };
};
