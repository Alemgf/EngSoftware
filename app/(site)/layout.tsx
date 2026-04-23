import type { ReactNode } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navigation />
      <main className="flex-grow overflow-x-hidden relative">{children}</main>
      <Footer />
    </div>
  )
}
