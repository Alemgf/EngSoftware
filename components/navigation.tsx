"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [{ name: "Início", path: "/" }]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 min-h-[4rem] flex flex-col justify-center ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl py-4 shadow-lg border-b border-accent/10"
          : "bg-background/70 backdrop-blur-md py-4 sm:py-6"
      }`}
    >
      <div className="container mx-auto w-full px-5 sm:px-6 max-w-7xl">
        <div className="flex justify-between items-center gap-4 min-h-[2.5rem]">
          <Link
            href="/"
            className="text-lg sm:text-xl font-syne font-bold text-foreground shrink-0 min-w-0 truncate"
            title="LANDING.Studio"
          >
            LANDING<span className="text-accent">.</span>Studio
          </Link>

          <nav className="hidden md:flex items-center flex-shrink-0 space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link whitespace-nowrap ${pathname === item.path ? "active text-accent" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 shrink-0 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-lg -mr-1"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 top-0 z-[9999] flex"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col w-[min(85%,20rem)] bg-background pt-24 pb-8 px-6 overflow-y-auto"
                >
                  <div className="flex flex-col space-y-6">
                    {navItems.map((item, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={item.path}
                      >
                        <Link
                          href={item.path}
                          className={`block text-2xl font-syne font-bold ${
                            pathname === item.path ? "text-accent" : "text-foreground"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-black/50 min-w-0"
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  )
}
