"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Youtube, ArrowUp, Sparkles } from "lucide-react"
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import logo from "@/assets/images/logo.svg"
import spily from "@/assets/images/spily.png"


const Particle = ({ index }) => {
    const size = Math.random() * 4 + 1
    const initialX = Math.random() * 100
    const initialY = Math.random() * 100
    const duration = Math.random() * 20 + 10

    return (
        <motion.div
            className="absolute rounded-full bg-teal-500/20"
            style={{
                width: size,
                height: size,
                left: `${initialX}%`,
                top: `${initialY}%`,
            }}
            animate={{
                y: [0, -100, 0],
                opacity: [0, 0.5, 0],
            }}
            transition={{
                duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
            }}
        />
    )
}

export default function FooterNewsletter() {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const footerRef = useRef(null)
    const controls = useAnimation()


    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);


    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-100, 100], [5, -5])
    const rotateY = useTransform(x, [-100, 100], [-5, 5])


    const handleMouseMove = (e) => {
        const rect = footerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        x.set(e.clientX - centerX)
        y.set(e.clientY - centerY)


        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    controls.start("visible")
                    observer.disconnect()
                }
            },
            { threshold: 0.3, rootMargin: "0px 0px -50px 0px" },
        )

        if (footerRef.current) {
            observer.observe(footerRef.current)
        }

        return () => {
            if (footerRef.current) {
                observer.disconnect()
            }
        }
    }, [controls])

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        setTimeout(() => {
            setIsSubmitting(false)
            setShowSuccess(true)
            setEmail("")

            setTimeout(() => {
                setShowSuccess(false)
            }, 3000)
        }, 1500)
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }


    const particles = Array.from({ length: 20 }).map((_, index) => <Particle key={index} index={index} />)


    const buttonGradient = useTransform(
        mouseX,
        [0, 1],
        ["linear-gradient(90deg, #2dd4bf 0%, #14b8a6 100%)", "linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)"],
    )


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.3,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    }

    const linkVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
        hover: {
            scale: 1.05,
            x: 10,
            color: "#2dd4bf",
            transition: { duration: 0.2 },
        },
    }

    const socialIconVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 10,
            },
        },
        hover: {
            scale: 1.2,
            rotate: [0, -10, 10, -5, 5, 0],
            transition: {
                rotate: {
                    duration: 0.5,
                    ease: "easeInOut",
                },
            },
        },
    }

    const formVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    }

    const successVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.3 },
        },
    }



    return (
        <section ref={footerRef} className="relative mt-[50rem] lg:mt-0 md:mt-0" onMouseMove={handleMouseMove}>
            <footer className="w-full rounded-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8 }}
                >
                    <Image src={spily || "/placeholder.svg"} alt="" />
                </motion.div>
            </footer>

            <footer className="bg-gradient-to-t from-black via-black to-transparent text-white absolute overflow-hidden w-full bottom-0">

                <div className="absolute inset-0 overflow-hidden opacity-70">{isVisible && particles}</div>


                <motion.div
                    className="container mx-auto px-6 pt-16 pb-8 relative z-10"
                    style={{
                        rotateX,
                        rotateY,
                        perspective: 2000,
                    }}
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                >
                    <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row mb-10 sm:mb-16 justify-between gap-8 sm:gap-10">

                        <motion.div className="col-span-1 lg:col-span-1" variants={itemVariants}>
                            <motion.div>
                                <Image src={logo || "/placeholder.svg"} alt="logo" />
                            </motion.div>

                            <motion.p
                                className="text-gray-300 mb-6 mt-4"
                                variants={itemVariants}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                Subscribe to our newsletter for the latest updates on features and services.
                            </motion.p>

                            <motion.form className="space-y-4" variants={formVariants} onSubmit={handleSubmit}>
                                <div className="flex flex-col sm:flex-row gap-3 relative">
                                    <motion.input
                                        type="email"
                                        placeholder="Your email here"
                                        className="bg-transparent border border-gray-700 rounded px-4 py-2 flex-grow focus:outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        whileFocus={{
                                            borderColor: "#2dd4bf",
                                            boxShadow: "0 0 0 2px rgba(45, 212, 191, 0.2)",
                                            transition: { duration: 0.2 },
                                        }}
                                    />

                                    <motion.button
                                        className="text-black px-6 py-2 rounded font-medium"
                                        style={{
                                            background: buttonGradient,
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 0 15px rgba(45, 212, 191, 0.5)",
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={
                                            isSubmitting
                                                ? { scale: [1, 1.03, 1], transition: { repeat: Number.POSITIVE_INFINITY, duration: 0.8 } }
                                                : {}
                                        }
                                    >
                                        {isSubmitting ? "Joining..." : "Join"}
                                    </motion.button>

                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div
                                                className="absolute -top-12 left-0 right-0 bg-teal-500 text-white py-2 px-4 rounded-md flex items-center justify-center"
                                                variants={successVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Successfully subscribed!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <motion.p className="text-gray-500 text-xs" variants={itemVariants}>
                                    By subscribing, you consent to our Privacy Policy and agree to receive updates.
                                </motion.p>
                            </motion.form>
                        </motion.div>


                        <motion.div className="col-span-1" variants={itemVariants}>
                            <motion.h3
                                className="text-white font-medium mb-6"
                                variants={itemVariants}
                                whileHover={{ color: "#2dd4bf" }}
                            >
                                Resources
                            </motion.h3>
                            <motion.ul className="space-y-4">
                                {["Ecosystem", "Academy", "Community", "About"].map((item, index) => (
                                    <motion.li
                                        key={item}
                                        custom={index}
                                        variants={linkVariants}
                                        whileHover="hover"
                                        initial="hidden"
                                        animate={isVisible ? "visible" : "hidden"}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <Link href="#" className="text-gray-400 transition-colors duration-300 flex items-center">
                                            <motion.span
                                                className="w-0 h-[1px] bg-teal-400 mr-2 inline-block"
                                                animate={{ width: isVisible ? "10px" : "0px" }}
                                                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                                            />
                                            {item}
                                        </Link>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>


                        <motion.div className="col-span-1" variants={itemVariants}>
                            <motion.h3
                                className="text-white font-medium mb-6"
                                variants={itemVariants}
                                whileHover={{ color: "#2dd4bf" }}
                            >
                                Connect
                            </motion.h3>
                            <motion.ul className="space-y-4">
                                {["Testimonials", "Contact Us", "FAQs"].map((item, index) => (
                                    <motion.li
                                        key={item}
                                        custom={index}
                                        variants={linkVariants}
                                        whileHover="hover"
                                        initial="hidden"
                                        animate={isVisible ? "visible" : "hidden"}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        <Link href="#" className="text-gray-400 transition-colors duration-300 flex items-center">
                                            <motion.span
                                                className="w-0 h-[1px] bg-teal-400 mr-2 inline-block"
                                                animate={{ width: isVisible ? "10px" : "0px" }}
                                                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                                            />
                                            {item}
                                        </Link>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>


                        <motion.div className="col-span-1" variants={itemVariants}>
                            <motion.h3
                                className="text-white font-medium mb-6"
                                variants={itemVariants}
                                whileHover={{ color: "#2dd4bf" }}
                            >
                                Stay Connected
                            </motion.h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: <Facebook className="w-5 h-5" />, name: "Facebook" },
                                    { icon: <Instagram className="w-5 h-5" />, name: "Instagram" },
                                    { icon: <Twitter className="w-5 h-5" />, name: "X" },
                                    { icon: <Linkedin className="w-5 h-5" />, name: "LinkedIn" },
                                    { icon: <Youtube className="w-5 h-5" />, name: "YouTube" },
                                ].map((social, index) => (
                                    <motion.div
                                        key={social.name}
                                        className="flex flex-col items-center"
                                        variants={socialIconVariants}
                                        custom={index}
                                        whileHover="hover"
                                        initial="hidden"
                                        animate={isVisible ? "visible" : "hidden"}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <Link
                                            href="#"
                                            className="bg-gray-800 hover:bg-teal-900 p-3 rounded-full flex items-center justify-center transition-colors duration-300"
                                            aria-label={social.name}
                                        >
                                            {social.icon}
                                        </Link>
                                        <span className="text-xs text-gray-400 mt-2">{social.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="border-t border-gray-800 pt-8 mt-8"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={isVisible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <motion.p
                                className="text-gray-500 text-sm mb-4 md:mb-0"
                                initial={{ opacity: 0 }}
                                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                            >
                                © 2025 Dfend. All rights reserved.
                            </motion.p>

                            <div className="flex items-center space-x-6">
                                {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((item, index) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                        transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                                        whileHover={{ y: -2, color: "#2dd4bf" }}
                                    >
                                        <Link href="#" className="text-gray-500 text-sm transition-colors duration-300">
                                            {item}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>


                    <motion.button
                        className="absolute bottom-8 right-8 bg-teal-500 hover:bg-teal-600 text-black p-3 rounded-full shadow-lg"
                        onClick={scrollToTop}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 1.5,
                        }}
                        whileHover={{
                            scale: 1.1,
                            boxShadow: "0 0 15px rgba(45, 212, 191, 0.7)",
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowUp className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </footer>
        </section>
    )
}