import { Link } from "react-router-dom"
import { useAuthStatus } from "../../auth/hooks/useAuthStatus"
import { Button } from "@/shared/components/ui/button"
import { FileText, LayoutGrid, MessageSquare, Sparkles } from "lucide-react"

export default function LandingPage() {
  const { data: authStatus } = useAuthStatus()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">


      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="size-3.5 text-primary" />
            <span>Introducing Real-Time Engineering Workspaces</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl leading-tight">
            The collaborative workspace built for engineering velocity
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Bring your team's documents, project structures, and real-time collaboration together.
            Stop switching between chat apps, wiki pages, and trackers.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {authStatus?.isAuthenticated ? (
              <Button asChild size="lg" className="cursor-pointer">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="cursor-pointer">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="cursor-pointer">
                  <Link to="/login">Watch Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 sm:py-24 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for team collaboration
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Everything your team needs to stay aligned, write specifications, and collaborate productively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col p-6 border border-border rounded-xl bg-card transition-colors hover:border-border/80">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FileText className="size-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaborative Documents</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Write technical specifications, API guides, and sprint plans together in real time. Features markdown syntax and clean document versioning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col p-6 border border-border rounded-xl bg-card transition-colors hover:border-border/80">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <LayoutGrid className="size-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Persistent Workspaces</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Organize discussions, drafts, and resources into persistent workspaces structured around your real team repositories and channels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col p-6 border border-border rounded-xl bg-card transition-colors hover:border-border/80">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Communication</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chat right alongside your workspace documents. Context-aware messaging ensures your engineering discussions stay near your source code and documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 sm:py-28 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Ready to accelerate your team's output?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Create an account to start building collaborative documents and persistent channels.
          </p>
          <div className="mt-8 flex justify-center">
            {authStatus?.isAuthenticated ? (
              <Button asChild size="lg" className="cursor-pointer">
                <Link to="/dashboard">Open Workspace</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="cursor-pointer">
                <Link to="/register">Get Started Free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-border bg-card py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              T
            </div>
            <span className="font-semibold text-sm tracking-tight">TeamHub</span>
          </div>

          <p className="text-xs text-muted-foreground order-last sm:order-none">
            &copy; {new Date().getFullYear()} TeamHub Inc. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
