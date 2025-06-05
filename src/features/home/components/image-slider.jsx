"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";


import image1 from "@/assets/images/slide1.webp";

const images = [image1, image1, image1, image1, image1, image1, image1, image1];

const ImageSlider = () => {
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;
        if (slider) {
            slider.style.animation = "none";
            slider.offsetHeight;
            slider.style.animation = "slide 40s linear infinite";
        }
    }, []);

    return (
        <div className="relative w-full overflow-hidden py-4 mt-32">
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



            <style jsx>{`
                @keyframes slide {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageSlider;