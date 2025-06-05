'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

const ScrollParticles = ({ footerRef }) => {
    const canvasRef = useRef();
    const footerVisible = useRef(false);
    const disperseFactor = useRef(0); // starts formed
    const disperseTarget = useRef(0); // animate toward this

    useEffect(() => {
        let factor = 1; // Start fully dispersed
        const animateIn = () => {
            if (factor > 0) {
                factor -= 0.01;
                disperseFactor.current = factor;
                requestAnimationFrame(animateIn);
            } else {
                disperseFactor.current = 0;
            }
        };
        animateIn();
    }, []);

    useEffect(() => {
        disperseFactor.current = 1;    
        disperseTarget.current = 0;    
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 0);
        camera.lookAt(0, 0, 0);
        camera.up.set(0, 0, -1);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        scene.add(new THREE.AmbientLight(0xffffff, 1));
        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, 20, 10);
        scene.add(light);

        const mouse = new THREE.Vector2();
        const handleMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        let particleSystem;
        const originalPositions = [];
        const dispersalVectors = [];
        const colors = [];
        const particleCount = 30000;
        const depthJitter = 0.2;

        const loader = new GLTFLoader();
        loader.load('/models/sigmalogo.gltf', (gltf) => {
            const model = gltf.scene;
            const positions = [];
            const temp = new THREE.Vector3();

            model.traverse((child) => {
                if (child.isMesh) {
                    const sampler = new MeshSurfaceSampler(child).build();

                    for (let i = 0; i < particleCount; i++) {
                        sampler.sample(temp);
                        temp.add(new THREE.Vector3(
                            (Math.random() - 0.5) * depthJitter,
                            (Math.random() - 0.5) * depthJitter,
                            (Math.random() - 0.5) * depthJitter
                        ));

                        const logoOffsetX = (80 / window.innerWidth) * 20;
                        const logoOffsetY = 0;
                        const origX = temp.x + logoOffsetX;
                        const origY = temp.y + logoOffsetY;
                        const origZ = temp.z;

                        const dir = new THREE.Vector3(
                            (Math.random() - 0.5),
                            (Math.random() - 0.5),
                            (Math.random() - 0.5)
                        ).normalize();

                        const spread = 10; // match what animate() uses

                        const dispersed = new THREE.Vector3().copy(temp).addScaledVector(dir, spread);
                        positions.push(dispersed.x, dispersed.y, dispersed.z);
                        originalPositions.push(new THREE.Vector3(origX, origY, origZ));
                        dispersalVectors.push(dir);

                        const r = 31 / 255;
                        const g = 149 / 255;
                        const b = 135 / 255;
                        colors.push(r, g, b);
                    }

                    child.visible = false;
                }
            });

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.025,
                vertexColors: true,
                transparent: true,
                opacity: 1.0,
                sizeAttenuation: true,
                depthWrite: false
            });

            particleSystem = new THREE.Points(geometry, material);
            scene.add(particleSystem);
        });


        const observer = new IntersectionObserver(
            ([entry]) => {
                footerVisible.current = entry.isIntersecting;
                disperseTarget.current = entry.isIntersecting ? 0 : null;
            },
            { threshold: 0.3 }
        );

        if (footerRef.current) observer.observe(footerRef.current);

        const handleScroll = () => {
            const scrollY = window.scrollY;

            if (footerVisible.current) {
                disperseTarget.current = 0; // Form when footer is in view
            } else if (scrollY > 100) {
                disperseTarget.current = 1; // Blast immediately after small scroll
            } else {
                disperseTarget.current = 0; // Back to form if at top
            }
        };


        window.addEventListener('scroll', handleScroll);

        let t = 0;

        const animate = () => {
            requestAnimationFrame(animate);
            t += 0.01;

            // Smooth transition
            if (disperseTarget.current !== null) {
                disperseFactor.current += (disperseTarget.current - disperseFactor.current) * 0.1;
            }



            if (particleSystem) {
                const posAttr = particleSystem.geometry.attributes.position;
                const array = posAttr.array;

                for (let i = 0; i < originalPositions.length; i++) {
                    const i3 = i * 3;
                    const x = array[i3];
                    const y = array[i3 + 1];
                    const z = array[i3 + 2];

                    const orig = originalPositions[i];
                    const disperse = dispersalVectors[i];
                    const spread = disperseFactor.current * 10;

                    const target = orig.clone().addScaledVector(disperse, spread);
                    const baseWave = Math.sin(x * 0.03 + t) + Math.cos(z * 0.04 + t);

                    const projected = new THREE.Vector3(x, y, z).project(camera);
                    const dx = projected.x - mouse.x;
                    const dy = projected.y - mouse.y;
                    const dist2 = dx * dx + dy * dy;
                    const repel = dist2 < 0.03 ? (1 - dist2 / 0.03) * 1.5 : 0;

                    array[i3] += (target.x - x) * 0.1;
                    array[i3 + 1] += ((target.y + baseWave * 0.2 + repel) - y) * 0.1;
                    array[i3 + 2] += (target.z - z) * 0.1;
                }

                posAttr.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            if (footerRef.current) observer.unobserve(footerRef.current);
        };
    }, [footerRef]);

    return (
        <div className="fixed top-100 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <canvas
                ref={canvasRef}
                className="w-[500px] h-[500px]"
            />
        </div>
    );
};

export default ScrollParticles;