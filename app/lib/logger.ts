import { supabase } from './supabase';

export type AuditAction = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILURE' 
  | 'REGISTER_SUCCESS' 
  | 'LOGOUT'
  | 'CREATE_PRODUCT'
  | 'CREATE_ORDER'
  | 'PAYMENT_VERIFIED'
  | 'ADOPTION_SUCCESS'
  | 'PROFILE_UPDATE';

interface LogOptions {
  userId?: string;
  details?: any;
  metadata?: any;
}

/**
 * Log an action to the audit_logs table.
 * Ensure the table exists in Supabase with columns:
 * id: uuid (primary key)
 * user_id: uuid (references auth.users, nullable)
 * action: text
 * details: jsonb
 * metadata: jsonb
 * created_at: timestamptz
 */
export async function logAction(action: AuditAction, options: LogOptions = {}) {
  try {
    const { userId, details, metadata } = options;
    
    // Fallback to current session if userId not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      finalUserId = user?.id;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: finalUserId,
          action,
          details: details || {},
          metadata: {
            ...metadata,
            url: typeof window !== 'undefined' ? window.location.href : 'server-side',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
          }
        }
      ]);

    if (error) {
      console.error('Audit Log Error:', error.message);
    }
  } catch (err) {
    console.error('Failed to log action:', err);
  }
}
