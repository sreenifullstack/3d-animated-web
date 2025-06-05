"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useParallax } from 'react-scroll-parallax';

export default function CounterSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)
    const { ref } = useParallax({ speed: 15 });

    const [projectCount, setProjectCount] = useState(0)
    const [teamCount, setTeamCount] = useState(0)
    const [yearCount, setYearCount] = useState(0)

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.4,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    }

    const numberVariants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    }

    const dividerVariants = {
        hidden: { width: 0, opacity: 0 },
        visible: {
            width: "100%",
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0.3,
            },
        },
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.5,
                rootMargin: "0px 0px -50px 0px",
            }
        )

        const currentRef = sectionRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [])

    useEffect(() => {
        if (isVisible) {
            const projectInterval = setInterval(() => {
                setProjectCount((prev) => {
                    if (prev < 200) return prev + 4
                    clearInterval(projectInterval)
                    return 200
                })
            }, 30)

            const teamInterval = setInterval(() => {
                setTeamCount((prev) => {
                    if (prev < 20) return prev + 1
                    clearInterval(teamInterval)
                    return 20
                })
            }, 100)

            const yearInterval = setInterval(() => {
                setYearCount((prev) => {
                    if (prev < 15) return prev + 1
                    clearInterval(yearInterval)
                    return 15
                })
            }, 150)

            return () => {
                clearInterval(projectInterval)
                clearInterval(teamInterval)
                clearInterval(yearInterval)
            }
        }
    }, [isVisible])

    return (
        <section
            ref={sectionRef}
            className="w-full lg:absolute lg:-bottom-[15rem] py-[10rem] z-50 lg:py-20 bg-gradient-to-t from-black via-black to-transparent"
        >
            <div className="container mx-auto px-4" ref={ref}>
                <motion.div
                    className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 lg:gap-24"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >

                    <motion.div
                        className="flex flex-col items-center text-center w-full md:w-1/3 mb-10 md:mb-0"
                        variants={itemVariants}
                    >
                        <motion.h2 className="text-5xl md:text-6xl font-bold text-white mb-4" variants={numberVariants}>
                            +{projectCount}
                        </motion.h2>
                        <motion.p
                            className="text-gray-200 text-lg"
                            initial={{ opacity: 0 }}
                            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <span className="font-semibold">Projects</span> Developed and Launched
                        </motion.p>
                        <motion.div
                            className="w-64 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-6 rounded-full"
                            variants={dividerVariants}
                        ></motion.div>
                    </motion.div>


                    <motion.div
                        className="flex flex-col items-center text-center w-full md:w-1/3 mb-10 md:mb-0"
                        variants={itemVariants}
                    >
                        <motion.h2 className="text-5xl md:text-6xl font-bold text-white mb-4" variants={numberVariants}>
                            +{teamCount}
                        </motion.h2>
                        <motion.p
                            className="text-gray-200 text-lg"
                            initial={{ opacity: 0 }}
                            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            dedicated <span className="font-semibold">team members</span>
                        </motion.p>
                        <motion.div
                            className="w-64 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-6 rounded-full"
                            variants={dividerVariants}
                        ></motion.div>
                    </motion.div>


                    <motion.div className="flex flex-col items-center text-center w-full md:w-1/3" variants={itemVariants}>
                        <motion.h2 className="text-5xl md:text-6xl font-bold text-white mb-4" variants={numberVariants}>
                            +{yearCount}
                        </motion.h2>
                        <motion.p
                            className="text-gray-200 text-lg"
                            initial={{ opacity: 0 }}
                            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            years of <span className="font-semibold">quality service.</span>
                        </motion.p>
                        <motion.div
                            className="w-64 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-6 rounded-full"
                            variants={dividerVariants}
                        ></motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
