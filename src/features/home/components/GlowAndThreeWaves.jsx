'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GlowAndThreeWaves = ({ dissolve }) => {
    const containerRef = useRef(null);
    const glowCanvasRef = useRef(null);

    const geometryRef = useRef(null);
    const sizesRef = useRef(null);
    const particleCount = 4000;

    const morphRef = useRef(0);         // 0 = normal, 1 = morphed
    const morphTarget = useRef(0);      // updated based on dissolve prop

    useEffect(() => {
        const glowCanvas = glowCanvasRef.current;
        const ctx = glowCanvas.getContext('2d');

        let width = glowCanvas.width = window.innerWidth;
        let height = glowCanvas.height = window.innerHeight;

        const resizeCanvas = () => {
            width = glowCanvas.width = window.innerWidth;
            height = glowCanvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class GlowWave {
            constructor(offsetY) {
                this.offsetY = offsetY;
                this.phase = Math.random() * Math.PI * 2;
                this.speed = 0.5 + Math.random() * 1.5;
                this.amplitude = 40 + Math.random() * 80;
                this.wavelength = 100 + Math.random() * 100;
                const alpha = 0.02 + Math.random() * 0.02;
                this.color = `rgba(0, 255, 255, ${alpha})`;
            }

            update(dt) {
                this.phase += this.speed * dt;
            }

            draw(ctx) {
                ctx.beginPath();
                const step = 5;
                ctx.moveTo(0, this.offsetY);
                for (let x = 0; x <= width; x += step) {
                    const y = this.offsetY + Math.sin((x / this.wavelength) + this.phase) * this.amplitude;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const waves = Array.from({ length: 6 }, () => new GlowWave(height * (0.3 + Math.random() * 0.4)));

        let last = 0;
        const animateWaves = (ts) => {
            const dt = (ts - last) / 1000;
            last = ts;
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';
            waves.forEach(w => {
                w.update(dt);
                w.draw(ctx);
            });
            requestAnimationFrame(animateWaves);
        };

        requestAnimationFrame(animateWaves);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
        camera.position.set(0, 80, 380);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const originalY = [];
        let mouse = { x: 0, y: 0 };
        let rotationY = 0;
        let t = 0;

        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const px = (Math.random() - 0.5) * 500;
            const pz = (Math.random() - 0.5) * 500;
            const dist = Math.sqrt(px * px + pz * pz);
            let py = Math.sin(dist * 0.03) * 55;
            py += Math.sin(px * 0.1) * 6 + Math.sin(pz * 0.15 + px * 0.05) * 5;
            py += (Math.random() - 0.5) * 6;

            positions[i3] = px;
            positions[i3 + 1] = py;
            positions[i3 + 2] = pz;
            originalY[i] = py;

            const t = Math.random();
            colors[i3] = 0;
            colors[i3 + 1] = 0.6 + 0.4 * t;
            colors[i3 + 2] = 0.9 - 0.3 * t;
            sizes[i] = 1.0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        geometryRef.current = geometry;
        sizesRef.current = sizes;

        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const onResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        const animate = () => {
            requestAnimationFrame(animate);
            t += 0.008;

            // Morphing transition easing
            morphRef.current += (morphTarget.current - morphRef.current) * 0.05;
            const morphAmount = morphRef.current;

            const targetRotationY = mouse.x * 0.25;
            rotationY += (targetRotationY - rotationY) * 0.03;
            scene.rotation.set(0.2, rotationY, 0);

            const pos = geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const x = pos[i3];
                const z = pos[i3 + 2];

                const wave = Math.sin(x * 0.03 + t) + Math.cos(z * 0.04 + t);
                const repel = (() => {
                    const v = new THREE.Vector3(x, 0, z).project(camera);
                    const dx = v.x - mouse.x;
                    const dy = v.y - mouse.y;
                    const d2 = dx * dx + dy * dy;
                    return d2 < 0.03 ? (1 - d2 / 0.03) * 22 : 0;
                })();

                const morphOffset = Math.sin(x * 0.1 + t * 5) * 15 * morphAmount;
                const base = originalY[i] + wave * 3 + repel + morphOffset;

                pos[i3 + 1] += (base - pos[i3 + 1]) * 0.1;

                const depth = (camera.position.z - z) / 500;
                sizes[i] = 0.7 + depth * 1.5;
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;
            renderer.render(scene, camera);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    useEffect(() => {
        morphTarget.current = dissolve ? 1 : 0;
    }, [dissolve]);

    return (
        <>
            <div
                ref={containerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />
            <canvas
                ref={glowCanvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(40px)',
                }}
            />
        </>
    );
};

export default GlowAndThreeWaves;