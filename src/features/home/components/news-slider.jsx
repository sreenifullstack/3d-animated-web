"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"



// Sample news data
const newsArticles = [
    {
        id: 1,
        image: "/cloud.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "AI MegaWave Makers: Inside the MultiversX AI Hackathon Breakthrough",
        link: "#",
    },
    {
        id: 2,
        image: "/cloud.webp",
        category: "ECOSYSTEM",
        date: "Feb 26, 2025",
        title: "MultiversX And Animoca Brands To Co-Support Creators, People And Projects",
        link: "#",
    },
    {
        id: 3,
        image: "/cloud.webp",
        category: "COMMUNITY",
        date: "Feb 12, 2025",
        title: "The MultiversX /AI_MegaWave Hackathon",
        link: "#",
    },
    {
        id: 4,
        image: "/cloud.webp",
        category: "ECOSYSTEM",
        date: "Jan 22, 2025",
        title: "AI Wave On MultiversX: New Breed of AI Agents Ready to Redefine Web3",
        link: "#",
    },
    {
        id: 5,
        image: "/cloud.webp",
        category: "ECOSYSTEM",
        date: "Jan 15, 2025",
        title: "MultiversX Cloud Partners Ecosystem",
        link: "#",
    },
    {
        id: 6,
        image: "/cloud.webp",
        category: "TECHNOLOGY",
        date: "Jan 10, 2025",
        title: "MultiversX Launches New Developer Portal",
        link: "#",
    },
]

export default function NewsSlider() {
    const sliderRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollability = () => {
        if (!sliderRef.current) return

        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }

    const scroll = (direction) => {
        if (!sliderRef.current) return

        const scrollAmount = 400
        const newScrollLeft =
            direction === "left" ? sliderRef.current.scrollLeft - scrollAmount : sliderRef.current.scrollLeft + scrollAmount

        sliderRef.current.scrollTo({
            left: newScrollLeft,
            behavior: "smooth",
        })

        // Update scroll buttons state after scrolling
        setTimeout(checkScrollability, 300)
    }

    return (
        <div className="w-full h-screen py-12 px-4 relative overflow-hidden">
            <div className="max-w-7xl overflow-hidden mx-auto  sm:px-6">
                <div className="flex items-center justify-between overflow-hidden mb-8">
                    <h2 className="text-white text-4xl md:text-5xl font-bold">Latest News</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-md border-zinc-600 bg-zinc-900 ${!canScrollLeft ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"
                                }`}
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                        >
                            <ChevronLeft className="h-5 w-5 text-white" />
                            <span className="sr-only">Previous</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-md border-zinc-600 bg-zinc-900 ${!canScrollRight ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"
                                }`}
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                        >
                            <ChevronRight className="h-5 w-5 text-white" />
                            <span className="sr-only">Next</span>
                        </Button>

                    </div>
                </div>

                <div ref={sliderRef} className="flex overflow-x-hidden gap-4 pb-4 hide-scrollbar" onScroll={checkScrollability}>
                    {newsArticles.map((article) => (
                        <div
                            key={article.id}
                            className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[280px] hover:hover:bg-[#1f1e1e] rounded-xl overflow-hidden p-1 duration-200 transition-all bg-[#171717]"
                        >
                            <a href={article.link} className="block">
                                <div className="relative h-[180px] w-full rounded-2xl overflow-hidden">
                                    <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center text-sm mb-2">
                                        <span className="text-cyan-400 font-medium">{article.category}</span>
                                        <span className="text-zinc-500 mx-2">•</span>
                                        <span className="text-zinc-500">{article.date}</span>
                                    </div>
                                    <h3 className="text-white text-lg font-medium line-clamp-2">{article.title}</h3>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
