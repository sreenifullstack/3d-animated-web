"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"



// assets
import slider from "@/assets/images/slidder1.webp"
import obj1 from "@/assets/images/obj1.webp"
import obj2 from "@/assets/images/obj2.webp"
import obj3 from "@/assets/images/obj3.webp"
import obj4 from "@/assets/images/obj4.webp"




const newsArticles = [
    {
        id: 1,
        image: "/slidder1.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "Composable",
        des: "Powering the future of...",
        link: "#",
    },
    {
        id: 2,
        image: "/slidder1.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "Composable",
        des: "Powering the future of...",
        link: "#",
    },
    {
        id: 3,
        image: "/slidder1.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "Composable",
        des: "Powering the future of...",
        link: "#",
    },
    {
        id: 4,
        image: "/slidder1.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "Composable",
        des: "Powering the future of...",
        link: "#",
    },
    {
        id: 5,
        image: "/slidder1.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "Composable",
        des: "Powering the future of...",
        link: "#",
    },
    {
        id: 6,
        image: "/slidder1.webp",
        category: "ECOSYSTEM",
        date: "Mar 20, 2025",
        title: "Composable",
        des: "Powering the future of...",
        link: "#",
    },
]

export default function FeaturedSlider() {
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


        setTimeout(checkScrollability, 300)
    }

    return (
        <div className="w-full h-screen py-12 md:pl-28 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 justify-between w-full md:px-24">
                        <h2 className="text-white text-4xl md:text-3xl font-semibold">Featured Partners</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`rounded-full border-zinc-700 bg-zinc-900 ${!canScrollLeft ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"
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
                                className={`rounded-full border-zinc-700 bg-zinc-900 ${!canScrollRight ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"
                                    }`}
                                onClick={() => scroll("right")}
                                disabled={!canScrollRight}
                            >
                                <ChevronRight className="h-5 w-5 text-white" />
                                <span className="sr-only">Next</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="ml-2 rounded-lg border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                            >
                                View All
                            </Button>
                        </div>
                    </div>
                </div>

                <div ref={sliderRef} className="flex overflow-hidden gap-4" onScroll={checkScrollability}>
                    {newsArticles.map((article) => (
                        <div
                            key={article.id}
                            className="flex-shrink-0  w-[280px] sm:w-[320px] md:w-[250px] border-[#dadada28] hover:bg-[#171717] transition-all duration-300 border-[1px] rounded-xl overflow-hidden p-0"
                        >
                            <a href={article.link} className="block">
                                <div className="relative h-[140px] w-full overflow-hidden flex items-center justify-center">
                                    <Image src={article.image || slider} alt={article.title} className="object-cover" width={100} height={100} />
                                </div>
                                <div className="p-2">

                                    <div className="bg-[#171717] p-4 rounded-2xl">
                                        <h3 className="text-white font-semibold text-lg line-clamp-2">{article.title}</h3>
                                        <p className="text-gray-400 text-sm">{article.des}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>


            <div className="w-full relative ">
                <Image src={obj1} alt="obj 1" className="absolute md:w-[250px] w-[120px] right-[40%] -top-4" />


                <Image src={obj2} alt="obj 1" className="absolute md:w-[250px] w-[160px] md:-right-[5%] -right-24 -top-24" />


                <Image src={obj3} alt="obj 1" className="absolute md:w-[300px] w-[140px] md:-left-[20%] -left-[10%] md:-top-3 -top-4" />


                <Image src={obj4} alt="obj 1" width={100} height={100} className="absolute left-[20%] top-10" />
            </div>
        </div>
    )
}
