import SignUpForm from "@/components/auth/SignUpForm"

export const metadata = {
  title: "Sign Up | Todo App",
  description: "Create your account to start managing your tasks securely.",
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(185,255,102,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(185,255,102,0.05),transparent_40%)]">
      <SignUpForm />
    </main>
  )
}
