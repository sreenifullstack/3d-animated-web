"use client";
import { useControls } from "leva";
import * as THREE from "three";
import { useRef, useMemo, useEffect, useCallback } from "react";

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
    value: 0.0, //77
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

export const useParticleUniforms = () => {
  const uniforms = useRef<Record<string, any>>({
    time: { value: 0 },
    positionTexture: { value: null },
    introMask: { value: mask },
    uMousePos: { value: new THREE.Vector3(0, 0, 0) },
    color1: {
      value: new THREE.Color("#54aba5"),
    },
    color2: {
      value: new THREE.Color("#ffffff"),
    },
    timeScale: {
      value: 0.02,
    },
    uMaskAlpha: {
      value: 1,
    },

    uIntroScale: {
      value: 0.1,
    },
    uIntroWidth: {
      value: 0.6,
    },
    uDisplacementScale: {
      value: 0.27,
    },
    particleSize: {
      value: 20,
    },
    uRatio: {
      value: Math.min(window.devicePixelRatio, 2),
    },
    uMouseActive: {
      value: !false,
    },
    uMouseArea: {
      value: 1,
    },
    uMouseColor: {
      value: new THREE.Color("#0096b8"),
    },
    uMouseLength: {
      value: 1,
    },
    uMouseScale: {
      value: 0.15,
    },
    uMouseFrequency: {
      value: 0,
    },
    border: {
      value: 0.85,
    },
    border2: {
      value: !0,
    },
    borderAmount: {
      value: 0.77,
    },
    borderNoiseFrequency: {
      value: 8.7,
    },
    borderNoiseScale: {
      value: 0,
    },
    CLOSEPLANE: {
      value: 0.1, //1.8
    },
    FARPLANE: {
      value: 6,
    },
    ROUNDPLANE: {
      value: 0.2,
    },
    uAlpha: {
      value: 1,
    },
  });

  const updateFloatUniforms = useCallback((key: string, value: number) => {
    // console.log("Updating FBO uniform's values", key, value, uniforms.current);
    uniforms.current[key].value = value;
  }, []);

  const updateColorUniforms = useCallback((key: string, value: string) => {
    console.log("Updating FBO uniform's color", key, value, uniforms.current);

    uniforms.current[key].value.setStyle(value);
  }, []);
  const updateTextureUniforms = useCallback(
    (key: string, value: THREE.Texture) => {
      uniforms.current[key].value = value;
    },
    []
  );
  const updateVec2Uniforms = useCallback(
    (key: string, value: THREE.Vector2) => {
      uniforms.current[key].value.copy(value);
    },
    []
  );
  const updateVec3Uniforms = useCallback(
    (key: string, value: THREE.Vector3) => {
      uniforms.current[key].value.copy(value);
    },
    []
  );

  const updateBooleanUniforms = useCallback((key: string, value: boolean) => {
    uniforms.current[key].value = value;
  }, []);

  /// vec3 vec2 cause type error
  const [opts, updateControls] = useControls("Particle", () => {
    return {
      color1: {
        value: "#ffffff",
        label: "color 1",
        onChange: (v) => updateColorUniforms("color1", v),
      },
      color2: {
        value: "#0096b8",
        label: "color 2",
        onChange: (v) => updateColorUniforms("color2", v),
      },
      timeScale: {
        value: 0.02,
        label: "timeScale",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("timeScale", v),
      },
      uMaskAlpha: {
        value: 1,
        label: "uMaskAlpha",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uMaskAlpha", v),
      },

      uIntroScale: {
        value: 0.0,
        label: "uIntroScale",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uIntroScale", v),
      },
      uIntroWidth: {
        value: 0.6,
        label: "uIntroWidth",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uIntroWidth", v),
      },
      uDisplacementScale: {
        value: 0.27,
        label: "uDisplacementScale",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uDisplacementScale", v),
      },
      particleSize: {
        value: 20,
        label: "particleSize",
        min: 0,
        max: 100,
        step: 1,
        onChange: (v) => updateFloatUniforms("particleSize", v),
      },
      uRatio: {
        value: Math.min(window.devicePixelRatio, 2),
        label: "uRatio",
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("uRatio", v),
      },
      uMouseActive: {
        value: !false,
        label: "uMouseActive",
        onChange: (v) => updateBooleanUniforms("uMouseActive", v),
      },
      uMouseArea: {
        value: 1,
        label: "uMouseArea",
        min: 0,
        max: 5,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uMouseArea", v),
      },
      uMouseColor: {
        value: "#0096b8",
        label: "uMouseColor",
        onChange: (v) => updateColorUniforms("uMouseColor", v),
      },
      uMouseLength: {
        value: 1,
        label: "uMouseLength",
        min: 1,
        max: 6,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("uMouseLength", v),
      },
      uMouseScale: {
        value: 0.15,
        label: "uMouseScale",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uMouseScale", v),
      },
      uMouseFrequency: {
        value: 0,
        label: "uMouseFrequency",
        min: 0,
        max: 5,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("uMouseFrequency", v),
      },
      border: {
        value: 0.85,
        label: "border",
        min: 0,
        onChange: (v) => updateFloatUniforms("border", v),
      },

      borderAmount: {
        value: 0.77,
        label: "borderAmount",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("borderAmount", v),
      },
      borderNoiseFrequency: {
        value: 8.7,
        label: "borderNoiseFrequency",
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("borderNoiseFrequency", v),
      },
      borderNoiseScale: {
        value: 0,
        label: "borderNoiseScale",
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("borderNoiseScale", v),
      },
      CLOSEPLANE: {
        value: 0.1, //1.8
        label: "CLOSEPLANE",
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("CLOSEPLANE", v),
      },
      FARPLANE: {
        value: 6,
        label: "FARPLANE",
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("FARPLANE", v),
      },
      ROUNDPLANE: {
        value: 0.2,
        label: "ROUNDPLANE",
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (v) => updateFloatUniforms("ROUNDPLANE", v),
      },
      uAlpha: {
        value: 1,
        label: "uAlpha",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => updateFloatUniforms("uAlpha", v),
      },
    };
  });

  console.log(opts, "opts");
  const updateUniforms = useCallback(
    (controls: Record<string, any>) => {
      console.log("Updating FBO uniform's values", controls);
      const updatedControls = {};
      const updatedUniforms = {};
      Object.entries(controls).forEach(([key, value]) => {
        // updatedControls[key] = value;
        updateControls({ [key]: value });
        if (key in opts) {
          //   console.log(`Updating FBO control ${key}:`, value);
          //   updateControls({ [key]: value });
        } else if (key in uniforms.current) {
          console.log(`Updating FBO uniform ${key}:`, value);
          uniforms.current[key].value = value;
        } else {
          console.warn(`FBO Uniform ${key} not found`, opts);
        }
      });
      //   if (Object.keys(updatedControls).length) updateControls(updatedControls);
      if (Object.keys(updatedUniforms).length) {
        // Object.assign(uniforms.current, updatedUniforms);
        // uniforms.current = { ...uniforms.current, ...updatedUniforms };
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

    return { uniforms: uniforms.current, updateUniforms };
  }, [uniforms, updateUniforms, updateControls]);
};
