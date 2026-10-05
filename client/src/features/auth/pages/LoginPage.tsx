import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useLogin } from "../hooks/useLogin"
import { loginSchema, type LoginFormData } from "../schemas/loginSchema"
import { getErrorMessage } from "@/shared/lib/getErrorMessage"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import { Loader2, User } from "lucide-react"

const DEMO_ACCOUNTS = [
  {
    label: "Admin User (Owner) – admin@teamhub.dev",
    email: "admin@teamhub.dev",
    password: "admin@123",
  },
  {
    label: "Alice Johnson (Admin) – alice@teamhub.dev",
    email: "alice@teamhub.dev",
    password: "admin@123",
  },
  {
    label: "Bob Smith (Member) – bob@teamhub.dev",
    email: "bob@teamhub.dev",
    password: "admin@123",
  },
  {
    label: "Charlie Davis (Member) – charlie@teamhub.dev",
    email: "charlie@teamhub.dev",
    password: "admin@123",
  },
  {
    label: "David Wilson (Member) – david@teamhub.dev",
    email: "david@teamhub.dev",
    password: "admin@123",
  },
] as const

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const emailValue = watch("email")
  const selectedDemoAccount = DEMO_ACCOUNTS.some((acc) => acc.email === emailValue)
    ? emailValue
    : ""

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        toast.success("Successfully logged in!")
        navigate("/dashboard")
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    })
  }

  const handleSelectDemoAccount = (selectedEmail: string) => {
    const account = DEMO_ACCOUNTS.find((acc) => acc.email === selectedEmail)
    if (!account) return

    setValue("email", account.email, { shouldValidate: true, shouldDirty: true })
    setValue("password", account.password, { shouldValidate: true, shouldDirty: true })
    handleSubmit(onSubmit)()
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
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your details below to sign in to your account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Demo Account Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="demo-account">Demo account</Label>
              <SelectDropdown
                id="demo-account"
                value={selectedDemoAccount}
                onChange={handleSelectDemoAccount}
                options={DEMO_ACCOUNTS.map((acc) => ({
                  value: acc.email,
                  label: acc.label,
                }))}
                placeholder="Select a demo account..."
                icon={<User className="size-3.5" />}
                className="w-full"
                disabled={isPending}
              />
            </div>
            {/* Server side error display */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error instanceof Error ? error.message : "Invalid email or password"}
              </div>
            )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
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
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
              {isPending ? "Signing In..." : "Sign In"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}