import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins: [
        jwtClient()  // No options here—server-side only
    ],
    fetchOptions: {
        credentials: "include"  // Keep this for cookie-based sessions
    }
})