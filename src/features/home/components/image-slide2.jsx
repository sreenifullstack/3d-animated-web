"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";


import image2 from "@/assets/images/slide2.webp";

const images = [image2, image2, image2, image2, image2, image2, image2, image2];

const ImageSlider2 = () => {
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;
        if (slider) {
            slider.style.animation = "none";
            slider.offsetHeight;
            slider.style.animation = "slideLeftToRight 40s linear infinite";
        }
    }, []);

    return (
        <div className="relative w-full overflow-hidden pb-10">
            <div
                ref={sliderRef}
                className="flex gap-4"
                style={{
                    display: "flex",
                    width: "max-content",
                }}
            >
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="relative flex-shrink-0 w-[280px] h-[180px] sm:w-[360px] sm:h-[340px] rounded-2xl shadow-lg overflow-hidden"
                    >
                        <Image
                            src={img}
                            alt={`Slider image ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-2xl"
                        />
                    </div>
                ))}



            </div>

            <div className="mt-12 md:pl-24 pl-4 w-full">
                <h1 className="text-white md:text-6xl text-4xl text-center md:text-left font-semibold md:w-[950px]">Alone, we can do so little,
                    together, we can move mountains.</h1>
            </div>



            <style jsx>{`
                 @keyframes slideLeftToRight {
                    0% {
                        transform: translateX(-50%);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageSlider2;