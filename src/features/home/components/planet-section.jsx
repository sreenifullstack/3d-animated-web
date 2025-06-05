"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useParallax } from 'react-scroll-parallax';

// assets
import planet from "@/assets/images/Planet.webp"
import outline from "@/assets/images/Outline.svg"
import obj5 from "@/assets/images/obj6.webp"
import obj7 from "@/assets/images/obj7.webp"

// ui component
import { Button } from "@/components/ui/button"

function PlanetSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)
    const { ref } = useParallax({ speed: 15 });
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.3 },
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => {
            if (sectionRef.current) {
                observer.disconnect()
            }
        }
    }, [])


    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    }

    const buttonVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 0.3,
            },
        },
    }


    const floatingVariants = {
        up: {
            y: [-15, 15],
            transition: {
                y: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            },
        },
        down: {
            y: [15, -15],
            transition: {
                y: {
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            },
        },
    }

    return (
        <div ref={ref}>
            <section ref={sectionRef} >
                <motion.div
                    className="w-full flex items-center justify-center flex-col pb-10"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.2,
                            },
                        },
                    }}
                >
                    <motion.div variants={textVariants}>
                        <Button className="cursor-pointer text-gray-400 bg-[#0A201D] rounded-full">The EGLD Token</Button>
                    </motion.div>

                    <motion.h1
                        className="pt-2 text-white md:text-[4rem] text-[3rem] leading-16 font-semibold md:w-[650px] text-center"
                        variants={textVariants}
                    >
                        Secured by EGLD
                    </motion.h1>

                    <motion.p className="text-gray-400 text-center pt-6 text-[18px] w-[400px]" variants={textVariants}>
                        The native eGold token enables access and usage, provides security, reinforces growth, and ensures economic
                        alignment for all stakeholders.
                    </motion.p>

                    <motion.div className="flex items-center gap-3 mt-4 flex-row-reverse" variants={buttonVariants}>
                        <Button
                            variant="outline"
                            className="bg-zinc-900/80 text-white border-zinc-700 hover:bg-zinc-800 hover:text-white px-8 py-2 cursor-pointer font-bold rounded-md"
                        >
                            <span className="mr-2">What is EGLD?</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-layout-grid"
                            >
                                <rect width="7" height="7" x="3" y="3" rx="1" />
                                <rect width="7" height="7" x="14" y="3" rx="1" />
                                <rect width="7" height="7" x="14" y="14" rx="1" />
                                <rect width="7" height="7" x="3" y="14" rx="1" />
                            </svg>
                        </Button>
                        <Button className="bg-white hover:bg-white text-black px-8 py-2 cursor-pointer hover:shadow-md hover:shadow-[#dadada] rounded-md font-bold">
                            <span className="mr-2">Stack EGLD</span>
                        </Button>
                    </motion.div>
                </motion.div>

                <div className="w-full pb-10 md:px-12 overflow-hidden">
                    <div className="w-full relative h-screen z-50 rounded-2xl mt-[10rem]">

                        <motion.div
                            className="md:w-[500px] w-[250px] h-[250px] md:h-[500px] absolute md:left-[30%] left-[20%] md:top-[5%] top-[15%] rounded-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={
                                isVisible
                                    ? {
                                        opacity: 1,
                                        scale: 1,
                                        rotate: -360,
                                        filter: [
                                            "drop-shadow(0 0 10px #00BA5F)",
                                            "drop-shadow(0 0 20px #00FFFF)",
                                            "drop-shadow(0 0 30px #1DD1A1)",
                                            "drop-shadow(0 0 20px #00FFFF)",
                                            "drop-shadow(0 0 10px #00BA5F)",
                                        ],
                                        transition: {
                                            opacity: { duration: 1 },
                                            scale: { duration: 1.5 },
                                            rotate: {
                                                duration: 40,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                            },
                                            filter: {
                                                duration: 3,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "easeInOut",
                                            },
                                        },
                                    }
                                    : {}
                            }
                        >
                            <Image src={planet || "/placeholder.svg"} alt="Rotating planet with animated glow effect" className="w-full h-full object-contain" />
                        </motion.div>

                        <motion.div
                            className="w-full absolute md:left-[25%] left-0 top-[25%] z-[40]"
                            initial="hidden"
                            animate={isVisible ? "visible" : "hidden"}
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.2,
                                        delayChildren: 0.5,
                                    },
                                },
                            }}
                        >
                            <motion.h1
                                className="text-white md:text-[4rem] text-[2rem] md:leading-16 leading-10 font-semibold md:w-[650px] text-center"
                                variants={textVariants}
                            >
                                Future-Proof <br />
                                in Every Way
                            </motion.h1>

                            <motion.p
                                className="text-white text-center pt-6 text-[15px] md:ml-[67px] md:w-[500px]"
                                variants={textVariants}
                            >
                                MultiversX is leading the way towards a more responsible and sustainable infrastructure for all digital
                                things.
                            </motion.p>

                            <motion.div variants={buttonVariants}>
                                <Button className="md:ml-[220px] ml-[100px] mt-8 bg-[#4ADE80] hover:bg-[#4ADE80] text-black font-semibold cursor-pointer py-3 px-6 text-[15px]">
                                    Learn about Sustainability
                                </Button>
                            </motion.div>
                        </motion.div>


                        <motion.div
                            className="md:w-[700px] w-[350px] h-[350px] md:h-[700px] absolute md:left-[22%] left-[10%] md:-top-[10%] top-[7%]"
                            initial={{ opacity: 0, rotate: "2rad" }}
                            animate={
                                isVisible
                                    ? {
                                        opacity: 1,
                                        rotate: [
                                            "2rad",
                                            "2.2rad",
                                            "2rad",
                                            "1.8rad",
                                            "2rad",
                                        ],
                                        transition: {
                                            opacity: { duration: 1.5 },
                                            rotate: {
                                                duration: 30,
                                                repeat: Number.POSITIVE_INFINITY,
                                                repeatType: "reverse",
                                                ease: "easeInOut",
                                            },
                                        },
                                    }
                                    : {}
                            }
                        >
                            <Image src={outline || "/placeholder.svg"} alt="outline" className="w-full h-full object-contain" />
                        </motion.div>


                        <motion.div className="absolute -top-[15%] w-[130px] h-[130px] -z-0" animate="up" variants={floatingVariants}>
                            <Image src={obj5 || "/placeholder.svg"} alt="obj 5" className="w-full h-full" />
                        </motion.div>


                        <motion.div
                            className="absolute -top-[15%] w-[130px] h-[130px] -z-0 right-0"
                            animate="down"
                            variants={floatingVariants}
                        >
                            <Image src={obj7 || "/placeholder.svg"} alt="obj 7" className="w-full h-full" />
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>

    )
}

export default PlanetSection
