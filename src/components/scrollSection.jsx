"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect } from "react"

export default function ScrollSection({ children, className }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    const sectionVariants = {
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

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={sectionVariants}
        >
            {children}
        </motion.div>
    )
}