"use client"

import React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"



export default function AnimatedBackground() {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {

        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        })


        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div className={`relative overflow-hidden w-full h-screen`}>

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 filter blur-[80px] opacity-120">
                    <motion.div
                        className="absolute bg-black rounded-full"
                        style={{
                            width: dimensions.width * 0.6,
                            height: dimensions.width * 0.6,
                            top: -dimensions.width * 0.2,
                            left: -dimensions.width * 0.2,
                        }}
                        animate={{
                            x: [
                                -dimensions.width * 0.2, // Start at left
                                dimensions.width * 0.4,  // Move to right
                                dimensions.width * 0.2,  // Back toward center
                                -dimensions.width * 0.4, // Move to left
                                0,                      // Center
                            ],
                            y: [
                                -dimensions.height * 0.2, // Start at top
                                -dimensions.height * 0.1, // Move down slightly
                                dimensions.height * 0.4,  // Move to bottom
                                dimensions.height * 0.2,  // Back up
                                0,                      // Center
                            ],
                            scale: [1, 1.6, 0.9, 1.05, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />

                    <motion.div
                        className="absolute bg-black rounded-full"
                        style={{
                            width: dimensions.width * 0.45,
                            height: dimensions.width * 0.4,
                            bottom: -dimensions.width * 0.1,
                            right: -dimensions.width * 0.1,
                        }}
                        animate={{
                            x: [
                                dimensions.width * 0.45,  // Start at right
                                -dimensions.width * 0.3, // Move to left
                                -dimensions.width * 0.1, // Back toward center
                                dimensions.width * 0.3,  // Move to right
                                0,                      // Center
                            ],
                            y: [
                                dimensions.height * 0.4, // Start at bottom
                                dimensions.height * 0.2, // Move up
                                -dimensions.height * 0.3, // Move to top
                                -dimensions.height * 0.1, // Back down
                                0,                      // Center
                            ],
                            scale: [1, 0.9, 1.1, 0.95, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />


                    <motion.div
                        className="absolute bg-black rounded-full"
                        style={{
                            width: dimensions.width * 0.5,
                            height: dimensions.width * 0.5,
                            top: dimensions.height * 0.3,
                            right: -dimensions.width * 0.1,
                        }}
                        animate={{
                            x: [
                                dimensions.width * 0.5,  // Start at right
                                -dimensions.width * 0.2, // Move to left
                                0,                      // Center
                                dimensions.width * 0.3,  // Move to right
                                -dimensions.width * 0.1, // Move to left
                            ],
                            y: [
                                dimensions.height * 0.4, // Start at middle
                                -dimensions.height * 0.2, // Move to top
                                dimensions.height * 0.5, // Move to bottom
                                0,                     // Center
                                dimensions.height * 0.1, // Move down
                            ],
                            scale: [1, 1.05, 0.95, 1.1, 1],
                        }}
                        transition={{
                            duration: 16,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />


                    <motion.div
                        className="absolute bg-gray-300 rounded-full"
                        style={{
                            width: dimensions.width * 0.45,
                            height: dimensions.width * 0.45,
                            top: dimensions.height * 0.5,
                            left: -dimensions.width * 0.15,
                        }}
                        animate={{
                            x: [
                                -dimensions.width * 0.15, // Start at left
                                dimensions.width * 0.3,   // Move to right
                                -dimensions.width * 0.2,  // Move to left
                                0,                       // Center
                                dimensions.width * 0.1,   // Move to right
                            ],
                            y: [
                                dimensions.height * 0.5, // Start at middle
                                dimensions.height * 0.3, // Move up
                                -dimensions.height * 0.1, // Move to top
                                dimensions.height * 0.4, // Move down
                                0,                      // Center
                            ],
                            scale: [1, 0.9, 1.05, 0.95, 1],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />
                </div>

                {/* Noise overlay for texture */}
                {/* <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                /> */}
            </div>



        </div>
    )
}
