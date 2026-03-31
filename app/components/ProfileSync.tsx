'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileSync() {
    useEffect(() => {
        const syncProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if profile exists
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const metaRole = user.user_metadata?.role;

            if (error || !profile) {
                // Create profile from auth data
                const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                const username = user.user_metadata?.username || (user.email ? user.email.split('@')[0] : 'user') + '_' + Math.floor(Math.random() * 1000);

                await supabase.from('profiles').upsert([
                    {
                        id: user.id,
                        full_name: fullName,
                        username: username.toLowerCase(),
                        email: user.email,
                        phone_number: user.phone,
                        role: metaRole || 'customer'
                    }
                ]);
            }

            // FORCE ROLE CHOICE: If metadata role is missing, we must redirect to choose role
            if (!metaRole && window.location.pathname !== '/auth/choose-role') {
                window.location.href = '/auth/choose-role';
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                syncProfile();
            }
        });

        syncProfile();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return null;
}
