import SignInForm from "@/components/auth/SignInForm"

export const metadata = {
  title: "Sign In | Todo App",
  description: "Sign in to your account to manage your tasks.",
}

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(185,255,102,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(185,255,102,0.05),transparent_40%)]">
      <SignInForm />
    </main>
  )
}
