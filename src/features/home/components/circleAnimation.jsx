"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function CircleAnimation() {
    const mountRef = useRef(null);
    const silhouettePositions = useRef([]);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // Set a fixed height for the component (e.g., 800px to match other sections)
        const height = 800;
        const width = container.clientWidth || window.innerWidth;

        // Scene & Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            1,
            1000
        );
        camera.position.set(0, 100, 300);
        camera.lookAt(0, 0, 0);

        // Root group
        const root = new THREE.Group();
        scene.add(root);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x0a0f11, 1);
        container.appendChild(renderer.domElement);

        // Shaders
        const vs = `
      attribute float size;
      attribute float glow;
      attribute vec3 customColor;
      varying float vGlow;
      varying vec3 vColor;
      uniform float time;
      void main() {
        vGlow = glow + (sin(time + position.x * 0.05) * 0.5 + 0.5);
        vColor = customColor;
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = size * (200.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `;
        const fs = `
      varying float vGlow;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if(d > 0.5) discard;
        float i = 1.0 - d;
        float a = smoothstep(0.5,0.3,d) * vGlow * 1.5;
        vec3 c = vColor * i + vec3(0.5,0.8,1.0) * (1.0 - i);
        gl_FragColor = vec4(c,a);
      }
    `;

        // Stars
        const starCount = 6000;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        const starCol = new Float32Array(starCount * 3);
        const starSize = new Float32Array(starCount);
        const starGlow = new Float32Array(starCount);
        const starVel = new Float32Array(starCount);
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            starPos[i3] = (Math.random() - 0.5) * 2000;
            starPos[i3 + 1] = (Math.random() - 0.5) * 2000;
            starPos[i3 + 2] = (Math.random() - 0.5) * -1000;
            const b = Math.random() * 0.5 + 0.5;
            starCol[i3] = 0.4 * b;
            starCol[i3 + 1] = 0.7 * b;
            starCol[i3 + 2] = 1.0 * b;
            starSize[i] = Math.random() * 2 + 1;
            starGlow[i] = Math.random();
            starVel[i] = (Math.random() - 0.5) * 0.05;
        }
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute("customColor", new THREE.BufferAttribute(starCol, 3));
        starGeo.setAttribute("size", new THREE.BufferAttribute(starSize, 1));
        starGeo.setAttribute("glow", new THREE.BufferAttribute(starGlow, 1));
        const starMat = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: vs,
            fragmentShader: fs,
            transparent: true,
            depthWrite: false,
        });
        root.add(new THREE.Points(starGeo, starMat));

        // Wave particles
        const cols = 300,
            rows = 200,
            sep = 8;
        const count = cols * rows;
        const waveGeo = new THREE.BufferGeometry();
        const wp = new Float32Array(count * 3);
        const wc = new Float32Array(count * 3);
        const ws = new Float32Array(count);
        const wg = new Float32Array(count);
        const orig = new Float32Array(count * 3);
        let p = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * sep - (cols * sep) / 2;
                const z = j * sep - (rows * sep) / 2;
                const i3 = p * 3;
                wp[i3] = x;
                wp[i3 + 1] = 0;
                wp[i3 + 2] = z;
                orig[i3] = x;
                orig[i3 + 1] = 0;
                orig[i3 + 2] = z;
                const g = Math.random() * 0.5 + 0.5;
                wg[p] = g;
                ws[p] = 1.5 + Math.random();
                wc[i3] = 0;
                wc[i3 + 1] = 0.6 * g;
                wc[i3 + 2] = 1.0 * g;
                p++;
            }
        }
        waveGeo.setAttribute("position", new THREE.BufferAttribute(wp, 3));
        waveGeo.setAttribute("customColor", new THREE.BufferAttribute(wc, 3));
        waveGeo.setAttribute("size", new THREE.BufferAttribute(ws, 1));
        waveGeo.setAttribute("glow", new THREE.BufferAttribute(wg, 1));
        const waveMat = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: vs,
            fragmentShader: fs,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const wavePts = new THREE.Points(waveGeo, waveMat);
        root.add(wavePts);

        // Sample 3D head: Sphere
        const headGeo = new THREE.SphereGeometry(80, 64, 64);
        const hp = headGeo.attributes.position;
        const targets = [];
        for (let i = 0; i < count; i++) {
            const vi = i % hp.count;
            targets.push([hp.getX(vi), hp.getY(vi), hp.getZ(vi)]);
        }
        silhouettePositions.current = targets;

        // Hover displacement setup
        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        window.addEventListener("mousemove", (e) => {
            mouse.x = (e.clientX / width) * 2 - 1;
            mouse.y = -(e.clientY / height) * 2 + 1;
        });

        // Reusable vector for distance test
        const testPoint = new THREE.Vector3();
        const tempVec = new THREE.Vector3();

        let t = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            t += 0.01;
            starMat.uniforms.time.value = t;
            waveMat.uniforms.time.value = t;

            const frac = Math.min(window.scrollY / height, 1); // Adjusted for component height
            const posArr = waveGeo.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const baseY =
                    orig[i3 + 1] +
                    Math.sin((orig[i3] + t * 20) * 0.02) * 8 +
                    Math.cos((orig[i3 + 2] + t * 20) * 0.015) * 6;
                const tgt = silhouettePositions.current[i];
                posArr[i3] = THREE.MathUtils.lerp(orig[i3], tgt[0], frac);
                posArr[i3 + 1] = THREE.MathUtils.lerp(baseY, tgt[1], frac);
                posArr[i3 + 2] = THREE.MathUtils.lerp(orig[i3 + 2], tgt[2], frac);
            }

            // Hover repulsion in world space
            raycaster.setFromCamera(mouse, camera);
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                testPoint.set(posArr[i3], posArr[i3 + 1], posArr[i3 + 2]);
                const dist = raycaster.ray.distanceToPoint(testPoint);
                if (dist < 20) {
                    posArr[i3 + 1] += (20 - dist) * 0.4;
                }
            }
            waveGeo.attributes.position.needsUpdate = true;

            // Animate stars
            const sArr = starGeo.attributes.position.array;
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                sArr[i3 + 1] += starVel[i];
                if (sArr[i3 + 1] > 1500 || sArr[i3 + 1] < -1500) starVel[i] *= -1;
            }
            starGeo.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            container.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div>
            <div
                ref={mountRef}
                className="three-canvas"
                style={{ height: "800px", width: "100%" }} // Fixed height to match other sections
            />
        </div>
    );
}

export default CircleAnimation;