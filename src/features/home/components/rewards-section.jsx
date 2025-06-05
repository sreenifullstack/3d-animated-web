"use client"

import { useRef, useState, useEffect } from "react"
import { Share2, BarChart3, Lock, Bitcoin, FileText, CheckCircle } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

import el1 from "@/assets/images/el1.png"
import el2 from "@/assets/images/el2.png"
import el3 from "@/assets/images/el3.png"
import el4 from "@/assets/images/el4.png"
import el5 from "@/assets/images/el5.png"
import { useParallax } from "react-scroll-parallax"

export default function RewardsSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)
    const { ref } = useParallax({ speed: 10 });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
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

    const rewardCards = [
        {
            icon: <Share2 className="w-8 sm:w-10 h-8 sm:h-10 text-teal-400" />,
            title: "Invite To Earn",
            description: "Invite Friends And Earn Rewards",
        },
        {
            icon: <BarChart3 className="w-8 sm:w-10 h-8 sm:h-10 text-teal-400" />,
            title: "Trade To Earn",
            description: "Trade Assets To Earn Rewards",
        },
        {
            icon: <Lock className="w-8 sm:w-10 h-8 sm:h-10 text-teal-400" />,
            title: "Stake To Earn",
            description: "Stake Your Assets To Earn",
        },
        {
            icon: <Bitcoin className="w-8 sm:w-10 h-8 sm:h-10 text-teal-400" />,
            title: "Lend To Earn",
            description: "Lend And Earn Interest",
        },
        {
            icon: <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-teal-400" />,
            title: "Learn To Earn",
            description: "Learn Crypto And Earn",
        },
        {
            icon: <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-teal-400" />,
            title: "Complete To Earn",
            description: "Complete Tasks To Earn",
        },
    ]


    const floatingVariants = {
        up: {
            y: [-10, 10],
            transition: {
                y: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            },
        },
        down: {
            y: [10, -10],
            transition: {
                y: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            },
        },
        upSlow: {
            y: [-15, 15],
            transition: {
                y: {
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            },
        },
        downSlow: {
            y: [15, -15],
            transition: {
                y: {
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            },
        },
    }

    // Animation variants for cards
    const cardContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    }

    const cardVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    }


    const waveAnimation = (index) => {
        return {
            opacity: [
                0.1 + (index * 0.08),
                1,
                0.5 + (index * 0.08),
            ],
            scale: [0.98, 1, 0.98],
            transition: {
                opacity: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: index * 0.5,
                },
                scale: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: index * 0.5,
                },
            },
        }
    }

    return (
        <>
            <div ref={ref}>
                <section ref={sectionRef} className="w-full py-24">
                    <motion.div
                        className="flex flex-col items-center gap-5 px-4 justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="pt-2 text-white md:text-[4rem] text-[3rem] leading-16 font-semibold md:w-[900px] text-center">
                            Customer management For Any Web3 Protocol
                        </h1>
                        <p className="text-gray-400 text-center pt-6 text-[18px] md:w-[900px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae nisi at orci dapibus eleifend. Cras
                            malesuada est ut quam bibendum, nec sodales est aliquet.
                        </p>
                    </motion.div>

                    <div className="relative w-full py-16 overflow-hidden mt-8">
                        <motion.div className="absolute top-0 left-0 w-32 h-32" animate="up" variants={floatingVariants}>
                            <Image src={el1 || "/placeholder.svg"} alt="el1" />
                        </motion.div>

                        <motion.div
                            className="absolute left-[50%] -translate-x-1/2 top-[35%] w-[400px] h-[400px]"
                            animate="downSlow"
                            variants={floatingVariants}
                        >
                            <Image src={el2 || "/placeholder.svg"} alt="el2" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-20 left-0 w-[250px] h-[250px]"
                            animate="upSlow"
                            variants={floatingVariants}
                        >
                            <Image src={el4 || "/placeholder.svg"} alt="el4" />
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-5 right-0 w-[250px] h-[250px]"
                            animate="down"
                            variants={floatingVariants}
                        >
                            <Image src={el5 || "/placeholder.svg"} alt="el5" />
                        </motion.div>

                        <motion.div className="absolute top-0 right-0 w-[350px] h-[350px]" animate="up" variants={floatingVariants}>
                            <Image src={el3 || "/placeholder.svg"} alt="el3" />
                        </motion.div>

                        <div className="container mx-auto px-4 relative z-10">
                            <motion.h2
                                className="text-3xl md:text-4xl lg:text-4xl font-semibold text-white text-center mb-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                Earn Rewards With Every Action
                            </motion.h2>

                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                                variants={cardContainerVariants}
                                initial="hidden"
                                animate={isVisible ? "visible" : "hidden"}
                            >
                                {rewardCards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-teal-900/80 backdrop-blur-sm border border-teal-700 rounded-lg p-6 flex flex-col items-center text-center hover:bg-teal-900 transition-colors duration-300"
                                        variants={cardVariants}
                                        animate={isVisible ? waveAnimation(index) : waveAnimation(index)}
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 0 15px rgba(20, 184, 166, 0.5)",
                                            transition: { duration: 0.3 },
                                        }}
                                    >
                                        <motion.div
                                            className="bg-black rounded-full p-4 mb-4"
                                            whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
                                        >
                                            {card.icon}
                                        </motion.div>
                                        <h3 className="text-white text-xl font-semibold mb-2">{card.title}</h3>
                                        <p className="text-teal-100 text-sm">{card.description}</p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div
                                className="text-center mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.8, delay: 1.5 }}
                            >
                                <p className="text-white text-xl font-medium">Unlock All Privileges With Sumex</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
