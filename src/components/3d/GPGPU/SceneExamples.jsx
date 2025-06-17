"use client";
import { useMemo } from "react";
import {
  useSceneConfig,
  SCENE_TYPES,
  createSceneConfig,
  PREDEFINED_SCENES,
  validateSceneConfig,
} from "./SceneConfigManager";

// Example 1: Basic scene configuration using predefined types
export const BasicSceneExample = () => {
  const introConfig = useSceneConfig(SCENE_TYPES.INTRO);
  const heroConfig = useSceneConfig(SCENE_TYPES.HERO);
  const sectionConfig = useSceneConfig(SCENE_TYPES.SECTION);
  const exitConfig = useSceneConfig(SCENE_TYPES.EXIT);

  return {
    intro: introConfig,
    hero: heroConfig,
    section: sectionConfig,
    exit: exitConfig,
  };
};

// Example 2: Custom scene configurations with overrides
export const CustomSceneExample = () => {
  const customHero = createSceneConfig(SCENE_TYPES.HERO, {
    obj: {
      position: [0.5, 0, 0],
      rotation: [0, Math.PI / 8, 0],
      scale: [1.2, 1.2, 1.2],
      opacity: 0.9,
    },
    bg: {
      color1: "#ff6b6b",
      color2: "#4ecdc4",
      color3: "#45b7d1",
      particleSize: 2.0,
      minAlpha: 0.1,
      maxAlpha: 0.9,
    },
    mouse: {
      mouseActive: true,
      rotationIntensity: 0.5,
      rotationSpeed: 0.03,
    },
    animation: {
      duration: 0.4,
      ease: "power3.out",
    },
  });

  const customSection = createSceneConfig(SCENE_TYPES.SECTION, {
    bg: {
      color1: "#a8e6cf",
      color2: "#dcedc1",
      color3: "#ffd3b6",
    },
    postProcessing: {
      direction: [1.2, 0.8],
      threshold: 0.1,
      strength: 1.5,
      radius: 0.8,
    },
  });

  return {
    customHero,
    customSection,
  };
};

// Example 3: Scene configuration for different page sections
export const PageSectionConfigs = () => {
  const heroSection = createSceneConfig(SCENE_TYPES.HERO, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 1,
    },
    bg: {
      color1: "#667eea",
      color2: "#764ba2",
      color3: "#f093fb",
      particleSize: 1.5,
      minAlpha: 0.05,
      maxAlpha: 0.7,
    },
    mouse: {
      mouseActive: true,
      rotationIntensity: 0.3,
      rotationSpeed: 0.025,
    },
    animation: {
      duration: 0.3,
      ease: "power2.out",
    },
  });

  const aboutSection = createSceneConfig(SCENE_TYPES.SECTION, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, Math.PI / 12, 0],
      scale: [0.9, 0.9, 0.9],
      opacity: 0.8,
    },
    bg: {
      color1: "#fa709a",
      color2: "#fee140",
      color3: "#ff9a9e",
      particleSize: 1.8,
      minAlpha: 0.03,
      maxAlpha: 0.6,
    },
    mouse: {
      mouseActive: true,
      rotationIntensity: 0.4,
      rotationSpeed: 0.02,
    },
    animation: {
      duration: 0.25,
      ease: "power1.out",
    },
  });

  const contactSection = createSceneConfig(SCENE_TYPES.EXIT, {
    obj: {
      position: [0, 0, 0],
      rotation: [0, -Math.PI / 16, 0],
      scale: [1.1, 1.1, 1.1],
      opacity: 0.9,
    },
    bg: {
      color1: "#a8edea",
      color2: "#fed6e3",
      color3: "#ffecd2",
      particleSize: 1.2,
      minAlpha: 0.04,
      maxAlpha: 0.8,
    },
    mouse: {
      mouseActive: true,
      rotationIntensity: 0.25,
      rotationSpeed: 0.015,
    },
    animation: {
      duration: 0.35,
      ease: "power3.inOut",
    },
  });

  return {
    hero: heroSection,
    about: aboutSection,
    contact: contactSection,
  };
};

// Example 4: Dynamic scene configuration based on props
export const DynamicSceneConfig = (props) => {
  const {
    sceneType = SCENE_TYPES.HERO,
    customColors = null,
    customPosition = null,
    customAnimation = null,
    customMouse = null,
  } = props;

  return useMemo(() => {
    const baseConfig = useSceneConfig(sceneType);

    const overrides = {};

    if (customColors) {
      overrides.bg = { ...baseConfig.bg, ...customColors };
    }

    if (customPosition) {
      overrides.obj = { ...baseConfig.obj, ...customPosition };
    }

    if (customAnimation) {
      overrides.animation = { ...baseConfig.animation, ...customAnimation };
    }

    if (customMouse) {
      overrides.mouse = { ...baseConfig.mouse, ...customMouse };
    }

    return createSceneConfig(sceneType, overrides);
  }, [sceneType, customColors, customPosition, customAnimation, customMouse]);
};

// Example 5: Scene configuration with validation
export const ValidatedSceneConfig = (config) => {
  return useMemo(() => {
    if (!validateSceneConfig(config)) {
      console.warn("Invalid scene configuration, using default");
      return useSceneConfig(SCENE_TYPES.DEFAULT);
    }
    return config;
  }, [config]);
};

// Example 6: Scene configuration for different themes
export const ThemeConfigs = () => {
  const darkTheme = createSceneConfig(SCENE_TYPES.HERO, {
    bg: {
      color1: "#1a1a1a",
      color2: "#2d2d2d",
      color3: "#404040",
      particleSize: 1.3,
      minAlpha: 0.02,
      maxAlpha: 0.5,
    },
    postProcessing: {
      direction: [1.8, 1.2],
      threshold: 0.08,
      strength: 1.8,
      radius: 1.2,
    },
  });

  const lightTheme = createSceneConfig(SCENE_TYPES.HERO, {
    bg: {
      color1: "#ffffff",
      color2: "#f0f0f0",
      color3: "#e0e0e0",
      particleSize: 1.7,
      minAlpha: 0.1,
      maxAlpha: 0.9,
    },
    postProcessing: {
      direction: [1.2, 0.8],
      threshold: 0.12,
      strength: 1.0,
      radius: 0.8,
    },
  });

  const neonTheme = createSceneConfig(SCENE_TYPES.HERO, {
    bg: {
      color1: "#00ff88",
      color2: "#0088ff",
      color3: "#ff0088",
      particleSize: 2.0,
      minAlpha: 0.15,
      maxAlpha: 1.0,
    },
    postProcessing: {
      direction: [2.0, 1.5],
      threshold: 0.05,
      strength: 2.0,
      radius: 1.5,
    },
  });

  return {
    dark: darkTheme,
    light: lightTheme,
    neon: neonTheme,
  };
};

// Example 7: Scene configuration for different screen sizes
export const ResponsiveSceneConfig = (screenSize = "desktop") => {
  const configs = {
    mobile: createSceneConfig(SCENE_TYPES.HERO, {
      obj: {
        scale: [0.8, 0.8, 0.8],
      },
      bg: {
        particleSize: 1.2,
        minAlpha: 0.06,
        maxAlpha: 0.7,
      },
      mouse: {
        mouseActive: false,
        rotationIntensity: 0.2,
        rotationSpeed: 0.015,
      },
      animation: {
        duration: 0.2,
        ease: "power1.out",
      },
    }),

    tablet: createSceneConfig(SCENE_TYPES.HERO, {
      obj: {
        scale: [0.9, 0.9, 0.9],
      },
      bg: {
        particleSize: 1.5,
        minAlpha: 0.05,
        maxAlpha: 0.75,
      },
      mouse: {
        mouseActive: true,
        rotationIntensity: 0.3,
        rotationSpeed: 0.02,
      },
      animation: {
        duration: 0.25,
        ease: "power2.out",
      },
    }),

    desktop: createSceneConfig(SCENE_TYPES.HERO, {
      obj: {
        scale: [1, 1, 1],
      },
      bg: {
        particleSize: 1.8,
        minAlpha: 0.04,
        maxAlpha: 0.8,
      },
      mouse: {
        mouseActive: true,
        rotationIntensity: 0.35,
        rotationSpeed: 0.025,
      },
      animation: {
        duration: 0.3,
        ease: "power3.out",
      },
    }),
  };

  return configs[screenSize] || configs.desktop;
};

// Example 8: Scene configuration with performance optimization
export const PerformanceOptimizedConfig = (performanceLevel = "high") => {
  const configs = {
    low: createSceneConfig(SCENE_TYPES.HERO, {
      bg: {
        particleSize: 0.8,
        minAlpha: 0.1,
        maxAlpha: 0.5,
      },
      mouse: {
        mouseActive: false,
        rotationIntensity: 0,
        rotationSpeed: 0,
      },
      animation: {
        duration: 0.1,
        ease: "none",
      },
    }),

    medium: createSceneConfig(SCENE_TYPES.HERO, {
      bg: {
        particleSize: 1.2,
        minAlpha: 0.06,
        maxAlpha: 0.6,
      },
      mouse: {
        mouseActive: true,
        rotationIntensity: 0.2,
        rotationSpeed: 0.015,
      },
      animation: {
        duration: 0.2,
        ease: "power1.out",
      },
    }),

    high: createSceneConfig(SCENE_TYPES.HERO, {
      bg: {
        particleSize: 1.8,
        minAlpha: 0.04,
        maxAlpha: 0.8,
      },
      mouse: {
        mouseActive: true,
        rotationIntensity: 0.35,
        rotationSpeed: 0.025,
      },
      animation: {
        duration: 0.3,
        ease: "power3.out",
      },
    }),
  };

  return configs[performanceLevel] || configs.high;
};
