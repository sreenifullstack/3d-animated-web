"use client";
import { useControls } from "leva";
import * as THREE from "three";
import { useRef, useMemo, useEffect, memo, useCallback } from "react";

type UniformType = "number" | "color" | "vec2" | "vec3" | "select" | "texture";
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

let defaultUniforms = {
  // type: { value: 1 },
  // time: { value: 0 },
  // timeScale: { value: 4.12 },
  // texturePosition1: { value: null },
  // texturePosition2: { value: null },
  anim2: { value: 1 },
  waves: { value: 0 },
  frequency: { value: 1 },
  xWaveScale: { value: 0.01 },
  yWaveScale: { value: 0.01 },
  zWaveScale: { value: 0.01 },
  lines: { value: 0 },
  uHole: { value: 0 },
  uLineOP: { value: 0 },
};

const additionalUniforms = {
  texturePosition1: {
    type: "texture",
    value: null,
    label: "texture position 1",
    disableGUI: true,
  },
  texturePosition2: {
    type: "texture",
    value: null,
    label: "texture position 2",
    disableGUI: true,
  },
  // Transition Effects
  type: {
    type: "select",
    value: 1,
    options: { "Type 1": 1, "Type 2": 2 },
    label: "Transition Type",
  },
  time: {
    type: "number",
    value: 0,
    min: 0,
    max: 100,
    step: 0.01,
    label: "time",
    disableGUI: true,
  },
};

const PARTICLE_SCHEMA: UniformSchema = {
  anim2: {
    type: "number",
    value: 1,
    min: 0,
    max: 1,
    step: 0.01,
    label: "active wave",
  },
  timeScale: {
    type: "number",
    value: 0.02,
    min: 0,
    max: 1,
    step: 0.01,
  },
  waves: { type: "number", value: 1, min: 0, max: 100, step: 0.01 },
  frequency: { type: "number", value: 1, min: 0, max: 4, step: 0.001 },
  xWaveScale: { type: "number", value: 0.01, min: 0, max: 0.5, step: 0.001 },
  yWaveScale: { type: "number", value: 0.01, min: 0, max: 0.5, step: 0.001 },
  zWaveScale: { type: "number", value: 0.01, min: 0, max: 0.5, step: 0.001 },
  lines: { type: "number", value: 0, min: 0, max: 1, step: 0.01 },
  uHole: {
    type: "number",
    value: 0,
    min: 0,
    max: 1,
    step: 0.01,
    label: "gravity hole",
  },
  uLineOP: {
    type: "number",
    value: 0,
    min: 0,
    max: 1,
    step: 0.01,
    label: "line close %",
  },
};

export const useFboUniformControls = () => {
  const uniforms = useRef<Record<string, any>>({
    texturePosition1: null,
    texturePosition2: null,
    type: 1,
    time: 0,
  });

  //   const levaControls: Record<string, any> = {};

  //   Object.entries(PARTICLE_SCHEMA).forEach(([key, config]) => {
  //     if (config.disableGUI) return;
  //     switch (config.type) {
  //       case "number":
  //         levaControls[key] = {
  //           value: config.value,
  //           min: config.min,
  //           max: config.max,
  //           step: config.step,
  //           label: config.label || key,
  //           onChange: (v) => {
  //             if (uniforms?.current?.[key]) {
  //               uniforms.current[key].value = v;
  //             }
  //           },
  //         };

  //         break;

  //       case "color":
  //         levaControls[key] = {
  //           value: config.value,
  //           label: config.label || key,
  //           onChange: (v) => {
  //             if (uniforms?.current?.[key]) {
  //               uniforms.current[key].value.setHex(v.replace("#", "0x"));
  //             }
  //           },
  //         };

  //         break;

  //       case "vec2":
  //         levaControls[key] = {
  //           value: config.value,
  //           min: config.min,
  //           max: config.max,
  //           step: config.step,
  //           label: config.label || key,
  //           onChange: (v) => {
  //             if (uniforms?.current?.[key]) {
  //               uniforms.current[key].value.copy(v);
  //             }
  //           },
  //         };
  //         break;

  //       case "vec3":
  //         levaControls[key] = {
  //           value: config.value,
  //           min: config.min,
  //           max: config.max,
  //           step: config.step,
  //           label: config.label || key,
  //           onChange: (v) => {
  //             if (uniforms?.current?.[key]) {
  //               uniforms.current[key].value.copy(v);
  //             }
  //           },
  //         };
  //         break;
  //     }
  //   });

  //   return levaControls;
  // };

  // const options = generateLevaOptions();
  const [opts, updateControls] = useControls("FBO", () => {
    return {
      anim2: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.01,
        label: "active wave",
      },
      timeScale: {
        value: 0.02,
        min: 0,
        max: 1,
        step: 0.01,
      },
      waves: { value: 1, min: 0, max: 100, step: 0.01 },
      frequency: { value: 1, min: 0, max: 4, step: 0.001 },
      xWaveScale: {
        value: 0.01,
        min: 0,
        max: 0.5,
        step: 0.001,
      },
      yWaveScale: {
        value: 0.01,
        min: 0,
        max: 0.5,
        step: 0.001,
      },
      zWaveScale: {
        value: 0.01,
        min: 0,
        max: 0.5,
        step: 0.001,
      },
      lines: { value: 0, min: 0, max: 1, step: 0.01 },
      uHole: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.01,
        label: "gravity hole",
      },
      uLineOP: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.01,
        label: "line close %",
      },
    };
  });

  const updateUniforms = useCallback(
    (controls: Record<string, any>) => {
      console.log("Updating FBO uniform's values", controls);
      const updatedControls = {};
      const updatedUniforms = {};
      Object.entries(controls).forEach(([key, value]) => {
        if (key in opts) {
          console.log(`Updating FBO control ${key}:`, value);
          updatedControls[key] = value;
        } else if (key in uniforms.current) {
          console.log(`Updating FBO uniform ${key}:`, value);
          updatedUniforms[key] = value;
        } else {
          console.warn(`FBO Uniform ${key} not found`, opts);
        }
      });
      if (Object.keys(updatedControls).length) updateControls(updatedControls);
      if (Object.keys(updatedUniforms).length) {
        uniforms.current = { ...uniforms.current, ...updatedUniforms };
      }
    },
    [opts, updateControls]
  );

  return useMemo(() => {
    // threejs uniforms convetion eg time: { value: 0 }
    const combinedUniforms = {};
    Object.entries(opts).forEach(([key, value]) => {
      combinedUniforms[key] = { value: value };
    });
    Object.entries(uniforms.current).forEach(([key, value]) => {
      combinedUniforms[key] = { value: value };
    });

    return { uniforms: { ...opts, ...uniforms.current }, updateUniforms };
  }, [opts, uniforms.current, updateUniforms]);

  // console.log(opts, "opts");
  // const updateUniforms = (controls: Record<string, any>) => {
  //   console.log("Updating FBO uniforms:", controls);
  //   Object.entries(controls).forEach(([key, value]) => {
  //     if (opts[key]) {
  //       console.log(`Updating FBO control ${key}:`, value);
  //       updateControls({ [key]: value });
  //     } else if (uniforms.current[key]) {
  //       console.log(`Updating FBO uniform ${key}:`, value);
  //       uniforms.current[key] = value;
  //     } else {
  //       console.warn(`FBO Uniform ${key} not found`, opts);
  //     }
  //   });
  //   console.log("Current FBO uniforms state", uniforms.current);
  // };

  // // Force update of uniforms when they change
  // useEffect(() => {
  //   if (uniforms.current) {
  //     console.log("FBO uniforms changed, forcing update");
  //     const currentValues = {};
  //     Object.entries(uniforms.current).forEach(([key, uniform]) => {
  //       currentValues[key] = uniform.value;
  //     });
  //     updateUniforms(currentValues);
  //   }
  // }, [uniforms.current]);

  // return { uniforms: { ...opts, ...uniforms.current }, updateUniforms };
};
