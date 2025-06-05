"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useParallax } from "react-scroll-parallax"

export default function CTASection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)
    const { ref } = useParallax({ speed: -13 });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.3, rootMargin: "0px 0px -50px 0px" }
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


    const parentVariants = {
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


    const leftVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2,
            },
        },
    }


    const rightVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0.4,
            },
        },
    }

    return (
        <div ref={sectionRef} className="container mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
            <motion.div
                className="bg-[#041c19] rounded-3xl h-auto min-h-[250px] sm:min-h-[300px] shadow-[#041c19] shadow-lg p-6 sm:p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center"
                variants={parentVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                ref={ref}
            >
                <motion.div
                    className="max-w-xl sm:max-w-2xl mb-4 sm:mb-6 md:mb-0"
                    variants={leftVariants}
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                        Ready to Partner with Us?
                    </h2>
                    <p className="text-white text-sm sm:text-base md:text-lg">
                        Join the many clients who trust SUMEX 3D to protect their assets and secure their legacies.
                    </p>
                </motion.div>
                <motion.div
                    className="flex items-center justify-center md:justify-end w-full"
                    variants={rightVariants}
                >
                    <Link
                        href="#contact"
                        className="bg-teal-400 hover:bg-teal-500 text-black font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-300"
                    >
                        Get in Touch
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}