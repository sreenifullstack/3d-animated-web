"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null)

    const faqs = [
        {
            question: "What can I trade on SUMEX?",
            answer:
                "SUMEX offers a wide range of digital assets for trading, including cryptocurrencies, tokens, and digital collectibles. Our platform supports major cryptocurrencies like Bitcoin, Ethereum, and many more altcoins and tokens.",
        },
        {
            question: "How do I create an account with SUMEX?",
            answer:
                "Creating an account is simple. Click on the 'Sign Up' button, enter your email address, create a secure password, and follow the verification steps. Once verified, you can deposit funds and start trading immediately.",
        },
        {
            question: "How does SUMEX ensure the safety of my assets?",
            answer:
                "SUMEX employs industry-leading security measures including cold storage for the majority of assets, two-factor authentication, advanced encryption, and regular security audits to ensure your assets remain safe and secure at all times.",
        },
        {
            question: "What are the fees for trading on SUMEX?",
            answer:
                "SUMEX offers competitive fee structures with tiered pricing based on trading volume. Basic accounts start with a small percentage fee per trade, while high-volume traders can enjoy reduced rates. Please refer to our fee schedule for detailed information.",
        },
        {
            question: "How can I deposit or withdraw funds from SUMEX?",
            answer:
                "You can deposit funds via bank transfer, credit/debit card, or by transferring cryptocurrency from another wallet. Withdrawals can be made to your bank account or external cryptocurrency wallet, subject to verification and daily limits.",
        },
    ]

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="w-full py-8 sm:py-16 z-50 bg-black inset-10">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex-col lg:flex-row flex  mb-8 sm:mb-10">
                    <div className="col-span-1 z-50 inset-10">
                        <h1 className="text-white font-bold text-center lg:text-left pb-2 text-2xl sm:text-4xl">FAQ</h1>
                        <h2 className="text-gray-400 text-center lg:text-left text-sm sm:text-lg md:text-md mb-6 sm:mb-10">All Your Questions Answered.</h2>
                    </div>

                    <div className="w-full max-w-4xl mx-auto col-span-1 z-50 inset-10">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-t border-zinc-700/90">
                                <button
                                    className="w-full py-4 sm:py-6 flex justify-between items-center text-left focus:outline-none"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span className="text-base sm:text-lg text-white">{faq.question}</span>
                                    <ChevronDown
                                        className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? "transform rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-60 sm:max-h-96 py-4 sm:pb-6" : "max-h-0"
                                        }`}
                                >
                                    <p className="text-white text-sm sm:text-base">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                        <div className="border-t border-zinc-700/90"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
