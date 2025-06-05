"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useParallax } from "react-scroll-parallax"

export default function PartnersSection() {
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

    const partners = [
        { name: "jump", logo: "/logo1.png" },
        { name: "TOKERO", logo: "/logo2.png" },
        { name: "BINANCE", logo: "/logo3.png" },
        { name: "CoinDesk", logo: "/logo4.png" },
        { name: "bitcoin", logo: "/logo1.png" },
        { name: "crypto.com", logo: "/logo1.png" },
        { name: "theTradeDesk", logo: "/logo1.png" },
    ]


    const duplicatedPartners = [...partners, ...partners]

    return (
        <section ref={sectionRef} className="w-full ">
            <motion.div
                className="flex items-center justify-center pb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="pt-2 text-white md:text-[4rem] z-50 inset-10 text-[3rem] leading-16 font-semibold md:w-[650px] text-center">
                    Our Partner
                </h1>
            </motion.div>

            <div className="w-full bg-zinc-800/90 py-8 px-4 overflow-hidden" ref={ref}>
                <div className="container mx-auto relative">
                    <motion.div
                        className="flex items-center gap-16 md:gap-20"
                        initial={{ x: "100%" }}
                        animate={{ x: "-100%" }}
                        transition={{
                            x: {
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "loop",
                                duration: 20,
                                ease: "linear",
                            },
                        }}
                    >
                        {duplicatedPartners.map((partner, index) => (
                            <motion.div
                                key={index}
                                className="h-8 flex items-center flex-shrink-0"
                                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                            >
                                <div className="text-white font-bold">
                                    {partner.name === "jump" && (
                                        <span className="text-2xl">
                                            jump<span className="text-3xl">—</span>
                                        </span>
                                    )}
                                    {partner.name === "TOKERO" && (
                                        <span className="text-2xl">
                                            TOKERO<sup>+</sup>
                                        </span>
                                    )}
                                    {partner.name === "BINANCE" && (
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-1">◆</span>
                                            <span className="text-2xl">BINANCE</span>
                                        </div>
                                    )}
                                    {partner.name === "CoinDesk" && <span className="text-2xl">CoinDesk</span>}
                                    {partner.name === "bitcoin" && (
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-1">₿</span>
                                            <span className="text-2xl italic">bitcoin</span>
                                        </div>
                                    )}
                                    {partner.name === "crypto.com" && (
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-1">⚪</span>
                                            <span className="text-2xl">crypto.com</span>
                                        </div>
                                    )}
                                    {partner.name === "theTradeDesk" && (
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-1">⊙</span>
                                            <span className="text-2xl">theTradeDesk</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="w-full py-12 px-4 z-50 inset-10"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <div className="container mx-auto z-50 inset-10 flex justify-center ">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="z-50 inset-10">
                        <Link
                            href="#"
                            className="bg-teal-400 hover:bg-teal-500  text-black font-semibold py-3 px-12 rounded-md transition-colors duration-300 text-center min-w-[200px]"
                        >
                            VIEW ALL
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
