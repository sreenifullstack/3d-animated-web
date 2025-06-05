"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState } from "react"

function LoadingScreen() {
    const [isLoadingComplete, setIsLoadingComplete] = useState(false)
    const count = useMotionValue(0)
    const percentage = useTransform(count, [0, 100], [0, 100])
    const roundedPercentage = useTransform(percentage, Math.round)


    useEffect(() => {
        const animation = animate(count, 100, {
            duration: 5,
            ease: "easeInOut",
            onUpdate: (latest) => {
                if (latest >= 100) {
                    setTimeout(() => setIsLoadingComplete(true), 500)
                }
            },
        })

        return () => animation.stop()
    }, [count])


    const circumference = 2 * Math.PI * 90
    const strokeDasharray = circumference
    const strokeDashoffset = useTransform(percentage, [0, 100], [circumference, 0])


    return (
        <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center">
            <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <svg className="w-[200px] sm:w-[300px] h-[200px] sm:h-[300px]" viewBox="0 0 200 200">

                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#1F2A44"
                        strokeWidth="15"
                    />

                    <motion.circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="15"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        initial={{ rotate: -90 }}
                        animate={{ rotate: -90 }}
                        transition={{ duration: 0 }}
                    />
                </svg>
            </motion.div>

            <motion.div
                className="mt-6 sm:mt-8 text-white text-2xl sm:text-4xl font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <motion.span>{roundedPercentage}</motion.span>%
            </motion.div>
        </div>
    )
}


export default LoadingScreen