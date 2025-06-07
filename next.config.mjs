// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config...

  // THIS IS THE CRUCIAL PART FOR TURBOPACK-SPECIFIC CONFIGURATION
  turbopack: {
    // This 'turbo' property is where Turbopack's specific options go.
    rules: {
      // Define a rule for GLSL files
      "*.{glsl,vs,fs,vert,frag}": {
        loaders: ["raw-loader", "glslify", "glslify-loader"],
        as: "*.js", // Important: tells Turbopack to treat it as a JS module
      },
    },
    // Turbopack will typically pick up 'paths' from tsconfig.json automatically.
    // resolveAlias is generally not needed unless you have very complex monorepo setups
    // or aliases that tsconfig.json can't handle.
    // If you explicitly need it for Turbopack, you would define it here:
    // resolveAlias: {
    //   '@/components/3d/shaders': require('path').join(__dirname, 'src/components/3d/shaders'),
    // },
  },

  // Keep your webpack config for production builds (next build)
  // or if you ever run 'next dev' without the --turbo flag.
  //   webpack: (config, { isDev, isWebpack }) => {
  //     // This part ensures it works for Webpack builds (e.g., 'next build' or 'next dev' without --turbo)
  //     if (isWebpack) {
  //       // Only apply if Webpack is the active bundler
  //       config.module.rules.push({
  //         test: /\.(glsl|vs|fs|vert|frag)$/,
  //         use: ["raw-loader", "glslify", "glslify-loader"],
  //       });
  //       return config;
  //     }
  //   },
};

export default nextConfig;
