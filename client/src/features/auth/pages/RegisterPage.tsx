import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useRegister } from "../hooks/useRegister"
import { registerSchema, type RegisterFormData } from "../schemas/registerSchema"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { mutate: registerUser, isPending, error } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data, {
      onSuccess: () => {
        toast.success("Successfully registered account!")
        navigate("/dashboard")
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Registration failed")
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm border border-border shadow-md">
        <CardHeader className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              T
            </div>
            <span className="font-bold text-lg tracking-tight">TeamHub</span>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Create a new profile to get started with TeamHub</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Server side error display */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error instanceof Error ? error.message : "Registration failed"}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                disabled={isPending}
                {...register("name")}
                className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isPending}
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("password")}
                className={errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.password && (
                <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
