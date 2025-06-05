"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ExternalLink, Search } from "lucide-react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

import logo from "@/assets/images/logo.svg";

const Particle = ({ index }) => {
  const size = Math.random() * 3 + 1;
  const speed = Math.random() * 0.5 + 0.1;

  return (
    <motion.div
      className="absolute rounded-full bg-teal-200/30"
      style={{
        width: size,
        height: size,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0, 0.4, 0],
      }}
      transition={{
        duration: speed * 10,
        repeat: Number.POSITIVE_INFINITY,
        delay: index * 0.2,
      }}
    />
  );
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const headerRef = useRef(null);
  const { scrollY } = useScroll();
  const searchInputRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(
    useTransform(mouseY, [0, window?.innerHeight || 1000], [2, -2]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, window?.innerWidth || 1000], [-2, 2]),
    springConfig
  );

  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.98]);
  const headerScale = useTransform(scrollY, [0, 50], [1, 0.98]);
  const headerY = useTransform(scrollY, [0, 50], [0, -5]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10]);
  const headerBgOpacity = useTransform(scrollY, [0, 100], [0.1, 0.8]);

  const [docHeight, setDocHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setDocHeight(height > 0 ? height : 0);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const scrollProgress = useTransform(scrollY, [0, docHeight], [0, 1]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      headerRef.current?.getBoundingClientRect() || {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };

    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  // Generate particles
  const particles = Array.from({ length: 15 }).map((_, index) => (
    <Particle key={index} index={index} />
  ));

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
    hover: {
      y: -3,
      color: "#fff",
      transition: { duration: 0.2 },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 25,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      x: "100%",
      transition: { duration: 0.3 },
    },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, type: "spring", stiffness: 100 },
    },
  };

  const searchVariants = {
    hidden: { opacity: 0, width: 0 },
    visible: {
      opacity: 1,
      width: "100%",
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      width: 0,
      transition: { duration: 0.3 },
    },
  };

  const logoVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -5 },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  const navItems = [
    { name: "Ecosystem", href: "/#", dropdown: null },
    {
      name: "Academy",
      dropdown: [
        { name: "Courses", href: "#" },
        { name: "Tutorials", href: "#" },
      ],
    },
    {
      name: "Community",
      dropdown: [
        { name: "Forum", href: "#" },
        { name: "Events", href: "#" },
      ],
    },
    {
      name: "About",
      dropdown: [
        { name: "Team", href: "#" },
        { name: "Mission", href: "#" },
      ],
    },
  ];

  return (
    <motion.section
      className="w-full pb-20 px-6 sticky top-0 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-white to-teal-300 z-[10000]"
        style={{ scaleX: scrollProgress, transformOrigin: "0% 50%" }}
      />

      <motion.header
        ref={headerRef}
        className={`md:w-full border border-gray-800 rounded-lg px-4 lg:px-16 py-3 mx-auto my-2 max-w-7xl transition-all duration-300 relative`}
        style={{
          opacity: headerOpacity,
          scale: headerScale,
          y: headerY,
          rotateX,
          rotateY,
          perspective: "1000px",
          backgroundImage:
            "radial-gradient(circle at center, rgba(45, 212, 191, 0.05) 0%, transparent 70%)",
          backdropFilter: `blur(${headerBlur}px)`,
          backgroundColor: `rgba(0, 0, 0, ${headerBgOpacity})`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {particles}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center w-[100px] lg:w-[200px]"
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link href="/" className="flex items-center">
              <Image src={logo || "/placeholder.svg"} alt="logo" />
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6">
            <AnimatePresence>
              {searchActive ? (
                <motion.div
                  className="relative"
                  variants={searchVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-teal-500 outline-none text-white py-1 pl-2 pr-8"
                  />
                  <button
                    onClick={() => setSearchActive(false)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ) : (
                <>
                  {navItems.map((item, i) => (
                    <div key={item.name} className="relative">
                      {item.dropdown ? (
                        <>
                          <motion.button
                            className="flex items-center text-gray-300 hover:text-white text-sm"
                            custom={i}
                            variants={navItemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === item.name ? null : item.name
                              )
                            }
                          >
                            {item.name}
                            <motion.div
                              animate={{
                                rotate: activeDropdown === item.name ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </motion.div>
                          </motion.button>

                          <AnimatePresence>
                            {activeDropdown === item.name && (
                              <motion.div
                                className="absolute left-0 w-48 rounded-md shadow-lg bg-gray-900/90 backdrop-blur-sm border border-gray-800"
                                style={{
                                  top: "180%", // Position above the button
                                  transform: "translateY(-10px)", // Slight offset for better alignment
                                  zIndex: 10001, // Higher than header z-index
                                }}
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                              >
                                <div className="py-1">
                                  {item.dropdown.map((dropdownItem) => (
                                    <motion.div
                                      key={dropdownItem.name}
                                      variants={dropdownItemVariants}
                                    >
                                      <Link
                                        href={dropdownItem.href}
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-teal-900/50 hover:text-white transition-colors duration-200"
                                      >
                                        {dropdownItem.name}
                                      </Link>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <motion.div
                          custom={i}
                          variants={navItemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <Link
                            href={item.href}
                            className="text-gray-300 hover:text-white text-sm"
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  <motion.button
                    className="text-gray-300 hover:text-white"
                    onClick={() => setSearchActive(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Search size={18} />
                  </motion.button>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      href="/#"
                      className="bg-gradient-to-r from-teal-500 to-teal-400 text-black font-medium px-4 py-2 rounded-md text-sm flex items-center"
                    >
                      Launch App
                      <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden mt-4 space-y-2 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={mobileItemVariants}
                  className="py-2"
                >
                  {item.dropdown ? (
                    <motion.button
                      className="flex items-center text-gray-300 hover:text-white w-full justify-between"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.name ? null : item.name
                        )
                      }
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.name}
                      <motion.div
                        animate={{
                          rotate: activeDropdown === item.name ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  ) : (
                    <Link
                      href={item.href}
                      className="block text-gray-300 hover:text-white py-2"
                    >
                      {item.name}
                    </Link>
                  )}

                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        className="mt-2 pl-4 space-y-2 border-l border-gray-700"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.dropdown?.map((dropdownItem) => (
                          <motion.div
                            key={dropdownItem.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              href={dropdownItem.href}
                              className="block text-gray-400 hover:text-white py-1"
                            >
                              {dropdownItem.name}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              <motion.div variants={mobileItemVariants}>
                <Link
                  href="/app"
                  className="block bg-gradient-to-r from-teal-500 to-teal-400 text-black font-medium px-4 py-2 rounded-md text-center mt-4"
                >
                  Launch App
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </motion.section>
  );
}
