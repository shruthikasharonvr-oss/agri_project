import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const requestUrl = new URL(request.url)
        const isLocalEnv = process.env.NODE_ENV === 'development'

        // Construct the redirect URL safely
        const redirectUrl = isLocalEnv
            ? `${origin}${next}`
            : `https://${forwardedHost ?? requestUrl.host}${next}`

        const response = NextResponse.redirect(redirectUrl)

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        // Read cookie from the incoming request header
                        const cookieHeader = request.headers.get('cookie')
                        if (!cookieHeader) return undefined
                        const match = cookieHeader.match(new RegExp(`(^|;) ?${name}=([^;]*)(;|$)`))
                        return match ? match[2] : undefined
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Attach cookie to the response object that we will return
                        response.cookies.set({ ...options, name, value, httpOnly: false }) // ensure accessible to client?
                    },
                    remove(name: string, options: CookieOptions) {
                        // Remove cookie from the response object
                        response.cookies.set({ ...options, name, value: '' })
                    },
                },
            }
        )

        // Automatically exchanges code for session and SETS cookies onto `response` via the set() method above
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return response
        } else {
            console.error("Supabase OAuth Code Exchange Error:", error.message)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
