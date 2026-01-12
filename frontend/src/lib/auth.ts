import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins: [
        jwtClient({
            issuer: "todo-app",
            expiresIn: "7d",
        })
    ],
    fetchOptions: {
        auth: {
            type: "Bearer"
        },
        credentials: "include"  // Important: Send cookies with requests
    }
})
