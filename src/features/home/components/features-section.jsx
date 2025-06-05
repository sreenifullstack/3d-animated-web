"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useParallax } from 'react-scroll-parallax';
import { Tilt } from "react-tilt";

// assets
import grid1 from "@/assets/images/grid1.webp"
import grid2 from "@/assets/images/grid2.webp"
import grid3 from "@/assets/images/grid3.webp"
import grid4 from "@/assets/images/grid4.webp"
import grid5 from "@/assets/images/grid5.webp"
import grid6 from "@/assets/images/grid6.webp"
import grid7 from "@/assets/images/grid7.webp"
import grid8 from "@/assets/images/grid8.webp"

// ui components
import { Button } from "@/components/ui/button"

function FeaturesSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)
    const { ref } = useParallax({ speed: -20 });
    const [glowPositions, setGlowPositions] = useState(Array(10).fill({ x: -1000, y: -1000 })); // Initialize for 10 cards

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.3,
                rootMargin: "0px 0px -100px 0px"
            }
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

    // Animation variants
    const headerVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    }

    const fromLeftVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    }

    const fromRightVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    }

    const fromBottomVariants = {
        hidden: { opacity: 0, y: 100 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    // Image hover animations
    const imageHoverVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.1,
            rotate: 5,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    }

    // Glow effect handler
    const handleMouseMove = (e, index) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setGlowPositions(prev => {
            const newPositions = [...prev];
            newPositions[index] = { x, y };
            return newPositions;
        });
    };

    const handleMouseLeave = (index) => {
        setGlowPositions(prev => {
            const newPositions = [...prev];
            newPositions[index] = { x: -1000, y: -1000 };
            return newPositions;
        });
    };

    return (
        <div ref={ref}>
            <section ref={sectionRef} className="lg:py-20 pb-20 lg:pb-0 lg:mt-36">
                <motion.div
                    className="w-full px-4 flex flex-col items-center justify-center"
                    variants={headerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <Button className="cursor-pointer text-gray-400 bg-[#0A201D] rounded-full">Builders</Button>
                    <h1 className="pt-2 text-white md:text-[4rem] text-[3rem] leading-16 font-semibold md:w-[650px] text-center">
                        Why Sumex?
                    </h1>
                    <p className="text-gray-400 text-center pt-6 text-[18px]">
                        MultiversX provides the infrastructure you need to tackle any use case.
                    </p>
                </motion.div>

                <div>
                    <div className="min-h-screen p-4 md:p-6 lg:p-8 lg:px-6 px-4">
                        <motion.div
                            className="max-w-7xl mx-auto"
                            variants={containerVariants}
                            initial="hidden"
                            animate={isVisible ? "visible" : "hidden"}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[
                                    { image: grid1, title: "Native<br />Assets", variants: fromLeftVariants, imageClass: "absolute -top-20 left-[10px]", width: 200, height: 200 },
                                    { image: grid2, title: "Safest User<br />Experience", variants: fromRightVariants, imageClass: "absolute -bottom-0 left-[10px]", width: 240, height: 240, reverse: true },
                                    { image: null, title: "30%<br />Developer<br />Royalties", variants: fromBottomVariants, description: "Developers get 30% of the gas fee every time someone calls their smart contract", colSpan: "lg:col-span-2", custom: true },
                                    { image: grid3, title: "Adaptive State<br />Sharding", variants: fromLeftVariants, imageClass: "absolute -top-30 -right-24", width: 270, height: 270, description: "The first to present a viable solution where all three aspects of sharding are live" },
                                    { image: grid3, title: "Adaptive State<br />Sharding", variants: fromRightVariants, imageClass: "absolute -top-28 -left-32", width: 270, height: 270, description: "The first to present a viable solution where all three aspects of sharding are live" },
                                    { image: grid4, title: "Adaptive State<br />Sharding", variants: fromBottomVariants, imageClass: "absolute bottom-[-50%] transform translate-[-50%] left-[30%]", width: 270, height: 270, description: "The first to present a viable solution where all three aspects of sharding are live" },
                                    { image: grid5, title: "Resilient and<br />Battle-Tested", variants: fromLeftVariants, imageClass: "absolute -bottom-0 right-0", width: 270, height: 270, reverse: true },
                                    { image: grid6, title: "Resilient and<br />Battle-Tested", variants: fromRightVariants, imageClass: "absolute bottom-10 right-10", width: 350, height: 350, reverse: true },
                                    { image: grid7, title: "Sovereign Chains", variants: fromBottomVariants, imageClass: "absolute -top-[20%] right-10", width: 700, height: 700, colSpan: "lg:col-span-2", custom: true },
                                    { image: grid8, title: "Decentralized", variants: fromLeftVariants, imageClass: "absolute top-0 -left-20", width: 300, height: 300, description: "3,200+ validator nodes", centered: true },
                                ].map((card, index) => (
                                    <Tilt
                                        key={index}
                                        options={{
                                            max: 45,
                                            scale: 1,
                                            speed: 450,
                                        }}
                                        className={`${card.colSpan || " rounded-3xl flex flex-col justify-between  bg-zinc-800/90 overflow-hidden transition-all duration-300 relative"} ${card.custom ? " rounded-3xl flex flex-col justify-between h-[340px] bg-zinc-800/90 overflow-hidden transition-all duration-300 relative" : ""}`}
                                    >
                                        <motion.div
                                            className={`bg-[#171717] rounded-3xl p-6 flex flex-col justify-between h-[340px] hover:bg-zinc-800/90 overflow-hidden transition-all duration-300 relative ${card.colSpan || ""}`}
                                            variants={card.variants}
                                            whileHover={{ y: -5 }}
                                            onMouseMove={(e) => handleMouseMove(e, index)}
                                            onMouseLeave={() => handleMouseLeave(index)}
                                            style={{
                                                background: `radial-gradient(circle 100px at ${glowPositions[index].x}px ${glowPositions[index].y}px, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)`,
                                            }}
                                        >
                                            {card.custom ? (
                                                card.title === "30% Developer Royalties" ? (
                                                    <div className="flex gap-2 items-center w-full relative h-full">
                                                        <h3 className="text-white text-[24px] font-medium mt-4 absolute bottom-0" dangerouslySetInnerHTML={{ __html: card.title }} />
                                                        <p className="text-gray-400 w-[200px] absolute lg:bottom-0 lg:right-20">{card.description}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="text-white top-[35%] left-[30%] absolute text-[35px] font-medium mt-4" dangerouslySetInnerHTML={{ __html: card.title }} />
                                                        <motion.div className="w-32 h-32 mb-auto" variants={imageHoverVariants} initial="initial" whileHover="hover">
                                                            <div className="relative w-[700px] h-[700px]">
                                                                <motion.div>
                                                                    <Image
                                                                        src={card.image || grid1}
                                                                        alt={`grid${index + 1}`}
                                                                        width={card.width}
                                                                        height={card.height}
                                                                        className={card.imageClass}
                                                                    />
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    {card.reverse ? (
                                                        <>
                                                            <h3 className={`${card.centered ? "text-center" : ""} text-white text-[24px] font-medium mt-4`} dangerouslySetInnerHTML={{ __html: card.title }} />
                                                            <motion.div className="w-32 h-32 mb-auto" variants={imageHoverVariants} initial="initial" whileHover="hover">
                                                                <div className={`relative ${card.width > 300 ? "w-[350px] h-[350px]" : "w-[300px] h-[300px]"}`}>
                                                                    <motion.div>
                                                                        <Image
                                                                            src={card.image || grid2}
                                                                            alt={`grid${index + 1}`}
                                                                            width={card.width}
                                                                            height={card.height}
                                                                            className={card.imageClass}
                                                                        />
                                                                    </motion.div>
                                                                </div>
                                                            </motion.div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <motion.div className="w-32 h-32 mb-auto" variants={imageHoverVariants} initial="initial" whileHover="hover">
                                                                <div className={`relative ${card.width > 300 ? "w-[700px] h-[700px]" : "w-[300px] h-[300px]"}`}>
                                                                    <motion.div>
                                                                        <Image
                                                                            src={card.image || grid3}
                                                                            alt={`grid${index + 1}`}
                                                                            width={card.width}
                                                                            height={card.height}
                                                                            className={card.imageClass}
                                                                        />
                                                                    </motion.div>
                                                                </div>
                                                            </motion.div>
                                                            <h3 className={`${card.centered ? "text-center" : ""} text-white text-[24px] font-medium mt-4`} dangerouslySetInnerHTML={{ __html: card.title }} />
                                                        </>
                                                    )}
                                                    {card.description && <p className={`${card.centered ? "text-center" : ""} text-gray-400 pt-2`}>{card.description}</p>}
                                                </>
                                            )}
                                        </motion.div>
                                    </Tilt>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default FeaturesSection