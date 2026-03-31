import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { userId, role, username, fullName, email, phone } = await request.json();

        if (!userId || !role) {
            return new Response(JSON.stringify({ error: 'Missing userId or role' }), { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Update auth.users metadata for the user
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: role } }
        );

        if (authError) throw authError;

        let profileError = null;

        // If profile details are provided, do an upsert so registration can recover from RLS on client writes.
        if (username || fullName || email || phone) {
            const profilePayload = {
                id: userId,
                role,
                ...(username ? { username: String(username).toLowerCase() } : {}),
                ...(fullName ? { full_name: fullName } : {}),
                ...(email ? { email } : {}),
                ...(phone ? { phone_number: phone } : {}),
            };

            const profileWrite = await supabaseAdmin
                .from('profiles')
                .upsert([profilePayload], { onConflict: 'id' });

            profileError = profileWrite.error;
        } else {
            // Backward-compatible path for role selection flow.
            const profileUpdate = await supabaseAdmin
                .from('profiles')
                .update({ role: role })
                .eq('id', userId);
            profileError = profileUpdate.error;
        }

        if (profileError) throw profileError;

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error('Error updating account role:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
