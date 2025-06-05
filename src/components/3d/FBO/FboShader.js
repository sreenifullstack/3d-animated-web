import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import {
  fbo_fragment,
  particle_fragment,
  particle_vertex,
} from "@/components/3d/shaders/fboShader";
// import gui from "./gui";

class GPGPUHandler {
  constructor(renderer, width) {
    this.WIDTH = width; // Represents the width (and height) of the GPGPU textures, determining the number of particles (WIDTH * WIDTH)
    this.renderer = renderer; // The Three.js WebGLRenderer instance
    this.gpuCompute = null; // Will hold the GPUComputationRenderer instance
    this.filter = null; // Will hold the ShaderMaterial used for GPGPU computation
    this.outputRenderTarget = null; // Will hold the WebGLRenderTarget where GPGPU results are stored
  }

  /**
   * Initializes the Three.js BufferGeometry and Points object for rendering.
   * @param {THREE.Material} material - The material to apply to the points.
   * @returns {THREE.Points} The initialized Three.js Points object.
   */
  initPoints(material) {
    // Create a new BufferGeometry
    const geometry = new THREE.BufferGeometry();

    // Create Float32Arrays for position and reference (UV) attributes
    // 'positions' will store random 3D coordinates for each point
    const positions = new Float32Array(this.WIDTH * this.WIDTH * 3);
    // 'references' will store 2D UV-like coordinates, mapping each point to its
    // corresponding pixel in the GPGPU textures.
    const references = new Float32Array(this.WIDTH * this.WIDTH * 2);

    // Populate the position and reference arrays
    for (let i = 0; i < this.WIDTH * this.WIDTH; i++) {
      // Generate random x, y, z coordinates for initial point positions
      const randomX = Math.random();
      const randomY = Math.random();
      const randomZ = Math.random();

      // Calculate normalized UV coordinates based on the point's index
      // These UVs will be used in shaders to sample the GPGPU textures
      const uvX = (i % this.WIDTH) / this.WIDTH;
      const uvY = Math.floor(i / this.WIDTH) / this.WIDTH;

      // Set the position data (3 components per point)
      positions.set([randomX, randomY, randomZ], 3 * i);
      // Set the reference (UV) data (2 components per point)
      references.set([uvX, uvY], 2 * i);
    }

    // Set the 'position' attribute for the geometry
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3, false)
    ); // Likely new THREE.BufferAttribute(positions, 3, false)
    // Set the 'reference' attribute for the geometry
    geometry.setAttribute(
      "reference",
      new THREE.BufferAttribute(references, 2, false)
    ); // Likely new THREE.BufferAttribute(references, 2, false)

    // Create a Three.js Points object
    const points = new THREE.Points(geometry, material); // Likely new THREE.Points(geometry, material)

    // Disable frustum culling for the points, ensuring they are always rendered
    // regardless of whether they are within the camera's view frustum.
    points.frustumCulled = false;

    return points;
  }

  /**
   * Initializes the GPGPU computation environment.
   * @param {string} vertexShader - The vertex shader code for the GPGPU filter.
   * @param {string} fragmentShader - The fragment shader code for the GPGPU filter.
   * @returns {{filter: THREE.ShaderMaterial, output: THREE.Texture}} An object containing the filter material and its output texture.
   */
  initGPGPU(shader, uniform) {
    // Initialize the GPUComputationRenderer
    this.gpuCompute = new GPUComputationRenderer(
      this.WIDTH,
      this.WIDTH,
      this.renderer
    ); // Likely new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer)

    // Create the ShaderMaterial that will perform the GPGPU computation
    this.filter = this.gpuCompute.createShaderMaterial(shader, uniform);

    // Create a WebGLRenderTarget to store the results of the GPGPU computation
    this.outputRenderTarget = this.gpuCompute.createRenderTarget();

    return {
      filter: this.filter,
      output: this.outputRenderTarget.texture, // Return the texture from the render target
    };
  }

  /**
   * Returns the current WebGLRenderTarget used for GPGPU output.
   * @returns {THREE.WebGLRenderTarget} The current output render target.
   */
  getCurrentRenderTarget() {
    return this.outputRenderTarget;
  }

  /**
   * Updates the GPGPU computation.
   * @param {number} time - A time value, typically used as a uniform in the GPGPU shader.
   */
  update(time) {
    // Update the 'time' uniform in the GPGPU filter shader
    this.filter.uniforms.time = {
      value: time,
    };
    // Perform the GPGPU computation, rendering the filter to the output render target
    this.gpuCompute.doRenderTarget(this.filter, this.outputRenderTarget);
  }

  /**
   * Creates a DataTexture from a Float32Array, suitable for GPGPU input.
   * @param {Float32Array} dataArray - The raw data array for the texture.
   * @returns {THREE.DataTexture} The created DataTexture.
   */
  setPositionFromDataArray(dataArray) {
    // Create a new texture (likely a DataTexture)
    const texture = this.gpuCompute.createTexture();
    // Assign the provided data array to the texture's image data
    texture.image.data = dataArray;
    return texture;
  }

  /**
   * Creates a DataTexture by calling a function to populate its data, suitable for GPGPU input.
   * @param {function(Float32Array): void} populateFunction - A function that takes a Float32Array and populates it with data.
   * @returns {THREE.DataTexture} The created DataTexture.
   */
  setPosition(populateFunction) {
    // Create a new texture (likely a DataTexture)
    const texture = this.gpuCompute.createTexture();
    // Call the provided function to populate the texture's image data
    populateFunction(texture.image.data);
    return texture;
  }
}

export class ParticleSystem {
  constructor(renderer) {
    this.particlesMixin = {
      materialUniforms: null,
      filterUniforms: null,
      material: null,
      fbo: null,
      filter: null,
      points: null,
      pointsGroup: null,
      objs: [],
      obj404: null,
      mask: null,
    };
    this.raycasterPlane = null;
    this.particlesTextureWidth = 128;

    this.particlesMixin.mask = new THREE.TextureLoader().load(
      "/webgl/mask.jpg"
    );
    this.renderer = renderer;
  }

  initParticles() {
    var maskTexture = this.particlesMixin.mask;
    (maskTexture.wrapS = maskTexture.wrapT = THREE.MirroredRepeatWrapping),
      (this.particlesMixin.materialUniforms = {
        time: {
          value: 0,
        },
        color1: {
          value: new THREE.Color(1, 1, 1),
        },
        color2: {
          value: new THREE.Color("#0096b8"),
        },
        uMaskAlpha: {
          value: 0,
        },
        introMask: {
          value: this.particlesMixin.mask,
        },
        uIntroScale: {
          value: 0.77,
        },
        uIntroWidth: {
          value: 0.6,
        },
        uDisplacementScale: {
          value: 0,
        },
        particleSize: {
          value: 20,
        },
        uRatio: {
          value: Math.min(window.devicePixelRatio, 2),
        },
        uMouseActive: {
          value: !1,
        },
        uMousePos: {
          value: new THREE.Vector2(0, 0),
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
          value: 0.1,
        },
        FARPLANE: {
          value: 2.38,
        },
        ROUNDPLANE: {
          value: 2.38,
        },
        uAlpha: {
          value: 1,
        },
        positionTexture: {
          value: null,
        },
      }),
      (this.particlesMixin.material = new THREE.ShaderMaterial({
        uniforms: this.particlesMixin.materialUniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexShader: particle_vertex,
        fragmentShader: particle_fragment,
      })),
      (this.particlesMixin.pointsGroup = new THREE.Group());

    this.raycasterPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial({
        wireframe: true,
        color: "#00ff00",
        opacity: 0,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      })
    );
    this.raycasterPlane.frustumCulled = false;
    this.particlesMixin.filterUniforms = {
      type: {
        value: 1,
      },
      time: {
        value: 0,
      },
      timeScale: {
        value: 4.12,
      },
      texturePosition1: {
        value: null,
      },
      texturePosition2: {
        value: null,
      },
      anim2: {
        value: 0,
      },
      waves: {
        value: 0,
      },
      frequency: {
        value: 1,
      },
      xWaveScale: {
        value: 0.01,
      },
      yWaveScale: {
        value: 0.01,
      },
      zWaveScale: {
        value: 0.01,
      },
      lines: {
        value: 0,
      },
      uHole: {
        value: 0,
      },
      uLineOP: {
        value: 0,
      },
    };
    this.initFbo();
    // this.scene.add(this.particlesMixin.pointsGroup);
  }

  cleanFbo() {
    this.particlesMixin.fbo.getCurrentRenderTarget().dispose(),
      this.particlesMixin.pointsGroup.remove(this.particlesMixin.points),
      this.particlesMixin.points.geometry.dispose(),
      this.particlesMixin.points.material.dispose(),
      (this.particlesMixin.points = null),
      this.particlesMixin.objs.forEach(function (e) {
        e.dispose();
      }),
      this.particlesMixin.obj404.dispose();
  }
  initFbo() {
    // this.renderer = renderer;
    // if (!renderer) throw new Error("Required Renderer");
    var e = this;

    const fbo = new GPGPUHandler(e.renderer, this.particlesTextureWidth);
    this.particlesMixin.fbo = fbo;

    this.particlesMixin.points = this.particlesMixin.fbo.initPoints(
      this.particlesMixin.material
    );
    this.particlesMixin.pointsGroup.add(this.particlesMixin.points);
    const t = this.particlesMixin.fbo.initGPGPU(
        fbo_fragment,
        this.particlesMixin.filterUniforms
      ),
      filter = t.filter;
    let output = t.output;
    this.particlesMixin.material.uniforms.positionTexture.value = output;
    this.particlesMixin.filter = filter;
    (this.particlesMixin.obj404 = this.particlesMixin.fbo.setPosition(function (
      e
    ) {
      !(function (e) {
        for (var t = [], n = Math.sqrt(e.length / 4), o = 0, i = 0; i <= n; i++)
          for (var r = 0; r < n; r++) {
            var u = (2 * i * Math.PI) / n,
              c = (2 * r * Math.PI) / n,
              v = (1.2 + Math.sin(u)) * Math.cos(c),
              d = (1.2 + Math.sin(u)) * Math.sin(c),
              m = Math.cos(u);
            m < 0 &&
              ((v = Math.cos(c) / 5), (d = Math.sin(c) / 5), (m = m * u * 0.5)),
              Math.sqrt(Math.pow(v - 0, 2) + Math.pow(d - 0, 2) > 1.2) &&
                (m = 1),
              t.push(new THREE.Vector3(v, d, m)),
              (e[o] = v),
              (e[o + 1] = d),
              (e[o + 2] = m),
              (e[o + 3] = 1),
              (o += 4);
          }
      })(e);
    })),
      (this.particlesMixin.objs[0] = this.particlesMixin.fbo.setPosition(
        function (e) {
          !(function (e) {
            for (
              var t = Math.sqrt(e.length / 4),
                n = 0.01,
                o = t / 2,
                r = -o,
                c = -t / 2,
                i = 0;
              i < e.length;
              i += 4
            ) {
              var v = new THREE.Vector3(0, 0, 0);
              r < o
                ? (0 === Math.abs(c % 2)
                    ? (v.x = r * n + 0.005)
                    : (v.x = r * n),
                  r++)
                : ((r = -o), (v.x = r * n), c++),
                (v.y = c * n),
                (e[i] = v.x),
                (e[i + 1] = v.y),
                (e[i + 2] = v.z),
                (e[i + 3] = 1);
            }
          })(e);
        }
      )),
      (filter.uniforms.texturePosition1.value = this.particlesMixin.objs[0]);
    var n = this.particlesMixin.fbo.setPosition(function (e) {
      !(function (e) {
        for (var i = 0; i < e.length; i += 4) {
          var t = new THREE.Vector3(0, 0, 0),
            n = 0.01 * Math.random() - 0.005;
          (t.x = 4 * Math.random() - 2),
            (t.y = Math.random()),
            (t.y = (Math.round(10 * Math.random()) / 10) * 1 + n),
            Math.random() > 0.5 && (t.y = -t.y),
            (e[i] = t.x),
            (e[i + 1] = t.y),
            (e[i + 2] = t.z),
            (e[i + 3] = 1);
        }
      })(e);
    });
    (this.particlesMixin.objs[6] = n),
      (this.particlesMixin.objs[7] = n),
      (this.particlesMixin.objs[10] = this.particlesMixin.objs[0]);
    this.initGUI();
  }

  animateParticles(time) {
    // var time = this.time.getElapsedTime();
    this.particlesMixin.fbo && this.particlesMixin.fbo.update(0.02 * time),
      this.particlesMixin.material &&
        (this.particlesMixin.material.uniforms.time.value = time);
  }
}
