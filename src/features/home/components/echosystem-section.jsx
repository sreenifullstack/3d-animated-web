"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useParallax } from 'react-scroll-parallax';


import ecosystem from "@/assets/images/ecosystem.webp"


function EcosystemSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)
    const { ref } = useParallax({ speed: -30 });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 },
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


    const headerVariants = {
        hidden: { opacity: 0, y: -30 },
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
                duration: 1,
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
                duration: 1,
                ease: "easeOut",
                delay: 0.2,
            },
        },
    }

    return (
        <div className="">
            <div ref={sectionRef} className="z-50 inset-10">
                <motion.div
                    className="w-full mb-[10rem] lg:mb-0 px-4 flex flex-col items-center justify-center"
                    variants={headerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <h1 className="pt-2 text-white z-50 inset-10 md:text-[4rem] text-[3rem] leading-16 font-semibold md:w-[650px] text-center">
                        Explore the ecosystem
                    </h1>

                    <p className="text-gray-400 z-50 inset-10 text-center pt-6 text-[18px]">
                        MultiversX provides the infrastructure you need to tackle any use case.
                    </p>
                </motion.div>

                <section className="relative px-4 lg:px-0 items-center gap-6 lg:gap-8 -mt-24 lg:mt-16" ref={ref}>

                    <motion.div
                        className="w-full lg:w-auto"
                        variants={fromLeftVariants}
                        initial="hidden"
                        animate={isVisible ? "visible" : "hidden"}
                    >
                        <Image
                            src={ecosystem || "/placeholder.svg"}
                            width={700}
                            height={700}
                            alt="ecosystem"
                            className="w-full h-auto max-w-[600px] lg:max-w-[900px] mx-auto"
                        />
                    </motion.div>


                    <motion.div
                        className="w-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]  lg:w-auto flex flex-col items-center text-center lg:text-center"
                        variants={fromRightVariants}
                        initial="hidden"
                        animate={isVisible ? "visible" : "hidden"}
                    >
                        <h2 className="text-white text-2xl lg:text-5xl  font-semibold lg:text-center">
                            Animation of <br className="block lg:hidden" />
                            various layer
                        </h2>
                        <p className="text-gray-400 text-base lg:text-lg mt-3 lg:mt-4 w-full max-w-[300px] lg:w-[300px]">
                            Decentralized worlds and tokenized economies at internet scale.
                        </p>
                    </motion.div>
                </section>
            </div>
        </div>
    )
}

export default EcosystemSection
