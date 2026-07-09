import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuthStatus } from "../../auth/hooks/useAuthStatus"
import { Button } from "@/shared/components/ui/button"
import { FileText, LayoutGrid, MessageSquare, Sparkles, ArrowRight } from "lucide-react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"

// Reusable Premium 3D Card with spring physics, spotlight, mask border & float-in stagger
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  delay: number
  animationsPlayed: boolean
}

function FeatureCard({ title, description, icon, delay, animationsPlayed }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Motion values for spring 3D tilt tracking
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const mouseX = useMotionValue(-500)
  const mouseY = useMotionValue(-500)
  const spotlightOpacity = useSpring(0, { stiffness: 200, damping: 25 })

  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 150, damping: 22 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 150, damping: 22 })
  const cardTranslateY = useSpring(0, { stiffness: 150, damping: 22 })
  const cardScale = useSpring(1, { stiffness: 150, damping: 22 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    // Mouse coords relative to card
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    
    // Normalized ratios [0, 1]
    x.set(localX / width)
    y.set(localY / height)
    
    // Exact px coords for spotlight center
    mouseX.set(localX)
    mouseY.set(localY)
  }

  const handleMouseEnter = () => {
    spotlightOpacity.set(1)
    cardTranslateY.set(-6)
    cardScale.set(1.015)
  }

  const handleMouseLeave = () => {
    spotlightOpacity.set(0)
    cardTranslateY.set(0)
    cardScale.set(1)
    
    // Spring back tilt to center
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        y: cardTranslateY,
        scale: cardScale,
        transformStyle: "preserve-3d",
      }}
      variants={animationsPlayed ? {
        hidden: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
        visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }
      } : {
        hidden: { opacity: 0, y: 50, scale: 0.8, rotateX: 12, filter: "blur(8px)" },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          rotateX: 0, 
          filter: "blur(0px)",
          transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay
          }
        }
      }}
      className="flex flex-col p-8 border border-border/60 rounded-2xl bg-card/95 backdrop-blur-md cursor-pointer select-none relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.02),0_2px_6px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] hover:border-primary/30 transition-all duration-300"
    >
      {/* 3D Border Glow Reflection Layer */}
      <motion.div
        style={{
          opacity: spotlightOpacity,
          background: useTransform(
            [mouseX, mouseY],
            ([mx, my]) => `radial-gradient(150px circle at ${mx}px ${my}px, rgba(139, 92, 246, 0.35), rgba(59, 130, 246, 0.15) 50%, transparent)`
          ),
          pointerEvents: "none",
          position: "absolute",
          inset: "-1px",
          borderRadius: "inherit",
          padding: "1px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          zIndex: 3,
        }}
      />

      {/* 3D Surface Spotlight Shadow Glow Layer */}
      <motion.div
        style={{
          opacity: spotlightOpacity,
          background: useTransform(
            [mouseX, mouseY],
            ([mx, my]) => `radial-gradient(280px circle at ${mx}px ${my}px, rgba(139, 92, 246, 0.06), rgba(59, 130, 246, 0.02) 60%, transparent)`
          ),
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />

      {/* Card Contents with 3D Z-index separation */}
      <div 
        style={{ transform: "translateZ(30px)" }} 
        className="flex flex-col h-full relative z-10 pointer-events-none"
      >
        {/* Dynamic Glowing Icon Container */}
        <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 border border-primary/5 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.25)]">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-1 text-foreground transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground/80 leading-relaxed mt-1">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { data: authStatus } = useAuthStatus()

  // Mouse coordinates relative to hero section for background responsive lights
  const heroRef = useRef<HTMLDivElement>(null)
  const heroMouseX = useMotionValue(0)
  const heroMouseY = useMotionValue(0)
  
  const springMouseX = useSpring(heroMouseX, { stiffness: 60, damping: 20 })
  const springMouseY = useSpring(heroMouseY, { stiffness: 60, damping: 20 })

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    heroMouseX.set(e.clientX - rect.left - 250) // center offset
    heroMouseY.set(e.clientY - rect.top - 250)
  }

  // Check sessionStorage on initial load
  const [animationsPlayed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("landingAnimationsPlayed") === "true"
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== "undefined" && !animationsPlayed) {
      sessionStorage.setItem("landingAnimationsPlayed", "true")
    }
  }, [animationsPlayed])

  // CTA viewport observer states
  const [ctaVisible, setCtaVisible] = useState(animationsPlayed)
  const [typedHeading, setTypedHeading] = useState(animationsPlayed ? "Ready to accelerate your team's output?" : "")
  const [typedParagraph, setTypedParagraph] = useState(animationsPlayed ? "Create an account to start building collaborative documents and persistent channels." : "")
  const [showCtaButton, setShowCtaButton] = useState(animationsPlayed)
  const ctaSectionRef = useRef<HTMLDivElement>(null)

  const ctaHeadingText = "Ready to accelerate your team's output?"
  const ctaParagraphText = "Create an account to start building collaborative documents and persistent channels."

  useEffect(() => {
    if (animationsPlayed) return

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setCtaVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCtaVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05 }
    )

    if (ctaSectionRef.current) {
      observer.observe(ctaSectionRef.current)
    }

    return () => observer.disconnect()
  }, [animationsPlayed])

  // Typing effect for CTA
  useEffect(() => {
    if (animationsPlayed || !ctaVisible) return

    let currentHeading = ""
    let headingIndex = 0

    const typeHeading = () => {
      if (headingIndex < ctaHeadingText.length) {
        currentHeading += ctaHeadingText[headingIndex]
        setTypedHeading(currentHeading)
        headingIndex++
        const delay = Math.random() * (40 - 20) + 20
        setTimeout(typeHeading, delay)
      } else {
        setTimeout(startParagraph, 400)
      }
    }

    let currentParagraph = ""
    let paragraphIndex = 0

    const typeParagraph = () => {
      if (paragraphIndex < ctaParagraphText.length) {
        currentParagraph += ctaParagraphText[paragraphIndex]
        setTypedParagraph(currentParagraph)
        paragraphIndex++
        const delay = Math.random() * (40 - 20) + 20
        setTimeout(typeParagraph, delay)
      } else {
        setTimeout(() => {
          setShowCtaButton(true)
        }, 250)
      }
    }

    const startParagraph = () => {
      typeParagraph()
    }

    typeHeading()
  }, [ctaVisible, animationsPlayed])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <style>{`
        /* Moving gradients for ambient backdrop blobs */
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -70px) scale(1.06); }
        }
        @keyframes blob-drift-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, 50px) scale(0.94); }
        }
        .bg-drift-slow {
          animation: blob-drift 24s ease-in-out infinite;
        }
        .bg-drift-reverse {
          animation: blob-drift-reverse 28s ease-in-out infinite;
        }

        /* Sparkles badge pulse animation */
        @keyframes sparkles-pulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.08);
            border-color: rgba(139, 92, 246, 0.15);
            background-color: rgba(139, 92, 246, 0.03);
          }
          50% {
            box-shadow: 0 0 25px rgba(139, 92, 246, 0.35);
            border-color: rgba(139, 92, 246, 0.45);
            background-color: rgba(139, 92, 246, 0.08);
          }
        }
        @keyframes sparkles-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .badge-sparkles-animated {
          animation: sparkles-float 4s ease-in-out infinite, sparkles-pulse 3s ease-in-out infinite;
        }

        /* Hero Text Shimmer */
        .text-shimmer-shining {
          background: linear-gradient(
            to right,
            hsl(var(--foreground)) 0%,
            rgba(139, 92, 246, 0.85) 35%,
            rgba(59, 130, 246, 0.85) 65%,
            hsl(var(--foreground)) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer-text-flow 10s linear infinite;
        }
        @keyframes shimmer-text-flow {
          to { background-position: 200% center; }
        }

        /* Glossy Highlight Shimmer effect for Premium Buttons */
        .shimmer-btn-glass {
          position: relative;
          overflow: hidden;
        }
        .shimmer-btn-glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent
          );
          transform: skewX(-25deg);
        }
        .shimmer-btn-glass:hover::before {
          left: 180%;
          transition: left 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* Grid lines layout wrapper for tech SaaS appearance */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size[16px_28px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative overflow-hidden py-22 sm:py-24 flex flex-col items-center justify-center"
      >
        {/* Background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            style={{
              width: 700,
              height: 700,
              background:
                "radial-gradient(circle, var(--hero-glow-1) 0%, transparent 65%)",
              borderRadius: "50%",
              transform: "translateY(-80px)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0"
        >
          <div
            style={{
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle, var(--hero-glow-2) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Cursor-responsive spring light overlay */}
        <motion.div
          style={{
            x: springMouseX,
            y: springMouseY,
            background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, rgba(59,130,246,0.01) 50%, transparent 80%)",
          }}
          className="absolute w-125 h-125 rounded-full blur-[80px] pointer-events-none -z-10"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Sparkle Badge */}
          <motion.div
            initial={animationsPlayed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsPlayed ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs font-semibold text-muted-foreground mb-3 badge-sparkles-animated select-none cursor-default"
          >
            <Sparkles className="size-3.5 text-primary animate-sparkles-icon" />
            <span>Introducing Real-Time Engineering Workspaces</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={animationsPlayed ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsPlayed ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="text-4xl font-extrabold tracking-tight sm:text-7xl max-w-4xl leading-[1.08] mb-3 text-foreground"
          >
            <span className="block">The collaborative workspace </span>
            <span className="block pb-1 bg-linear-to-r from-[#A78BFA] via-[#8B5CF6] to-[#6366F1] bg-clip-text drop-shadow-[0_0_16px_rgba(139,92,246,0.25)] text-transparent">
              built for engineering teams
            </span>
            {/* <p className="text-primary/80">built for engineering velocity</p> */}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={animationsPlayed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animationsPlayed ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="text-lg sm:text-xl font-medium text-muted-foreground max-w-xl leading-relaxed"
          >
            One workspace for documents, discussions, and projects—built for fast-moving engineering teams.
          </motion.p>

          {/* CTA Actions */}
          <motion.div
            initial={animationsPlayed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={animationsPlayed ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
            className="mt-9 flex flex-wrap gap-4 justify-center"
          >
            {authStatus?.isAuthenticated ? (
              <motion.div
                whileHover={{ y: -3, scale: 1.025 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button asChild size="lg" className="cursor-pointer shimmer-btn-glass shadow-lg">
                  <Link to="/dashboard" className="flex items-center gap-1.5 font-bold">
                    Go to Dashboard <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ y: -3, scale: 1.025 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Button asChild size="lg" className="cursor-pointer shimmer-btn-glass shadow-lg">
                    <Link to="/register" className="font-bold">Get Started</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ y: -3, scale: 1.025 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Button asChild size="lg" variant="outline" className="cursor-pointer shimmer-btn-glass">
                    <Link to="/login" className="font-semibold text-muted-foreground hover:text-foreground">Watch Demo</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 sm:py-20 border-t border-b border-border/30 bg-linear-to-b from-background via-muted/10 to-muted/25 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header section with scroll reveal */}
          <motion.div
            initial={animationsPlayed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={animationsPlayed ? { duration: 0 } : { duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20 flex flex-col items-center"
          >
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-center">
              Engineered for team collaboration
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl text-center leading-relaxed">
              Everything your team needs to stay aligned, write specifications, and collaborate productively.
            </p>
          </motion.div>

          {/* Cards Grid wrapper with stagger animation triggers */}
          <motion.div
            initial={animationsPlayed ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="perspective-container grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard
              title="Collaborative Documents"
              description="Write technical specifications, API guides, and sprint plans together in real time. Features markdown syntax and clean document versioning."
              icon={<FileText className="size-5" />}
              delay={0}
              animationsPlayed={animationsPlayed}
            />

            <FeatureCard
              title="Persistent Workspaces"
              description="Organize discussions, drafts, and resources into persistent workspaces structured around your real team repositories and channels."
              icon={<LayoutGrid className="size-5" />}
              delay={0.12}
              animationsPlayed={animationsPlayed}
            />

            <FeatureCard
              title="Team Communication"
              description="Chat right alongside your workspace documents. Context-aware messaging ensures your engineering discussions stay near your source code and documentation."
              icon={<MessageSquare className="size-5" />}
              delay={0.24}
              animationsPlayed={animationsPlayed}
            />
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section ref={ctaSectionRef} className="py-24 sm:py-36 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 bg-primary/3 rounded-full blur-[140px] pointer-events-none -z-10" />

        <motion.div
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={ctaVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.97, y: 30 }}
          transition={animationsPlayed ? { duration: 0 } : { duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            <span>{typedHeading}</span>
            {ctaVisible && typedHeading.length < ctaHeadingText.length && (
              <span className="inline-block w-[2.5px] h-[0.9em] bg-primary ml-1 align-middle animate-pulse" />
            )}
            <span className="opacity-0 select-none">{ctaHeadingText.slice(typedHeading.length)}</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed sm:text-xl">
            <span className="text-muted-foreground">{typedParagraph}</span>
            {ctaVisible && typedHeading.length === ctaHeadingText.length && typedParagraph.length < ctaParagraphText.length && (
              <span className="inline-block w-[2.5px] h-[0.9em] bg-primary ml-1 align-middle animate-pulse" />
            )}
            <span className="text-muted-foreground opacity-0 select-none">{ctaParagraphText.slice(typedParagraph.length)}</span>
          </p>
          
          <motion.div
            animate={showCtaButton ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.95 }}
            transition={animationsPlayed ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex justify-center"
          >
            {authStatus?.isAuthenticated ? (
              <motion.div
                whileHover={{ y: -3, scale: 1.025 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button asChild size="lg" className="cursor-pointer shimmer-btn-glass shadow-lg">
                  <Link to="/dashboard" className="font-bold flex items-center gap-1.5">
                    Open Workspace <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ y: -3, scale: 1.025 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button asChild size="lg" className="cursor-pointer shimmer-btn-glass shadow-lg">
                  <Link to="/register" className="font-bold">Get Started Free</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-border bg-card/60 backdrop-blur-md py-10 select-none relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-xs">
              T
            </div>
            <span className="font-bold text-sm tracking-tight">TeamHub</span>
          </div>

          <p className="text-xs text-muted-foreground order-last sm:order-0">
            &copy; {new Date().getFullYear()} TeamHub Inc. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors duration-200">
              Login
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors duration-200">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}