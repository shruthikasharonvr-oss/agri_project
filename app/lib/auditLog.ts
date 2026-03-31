/**
 * Audit Logging System
 * Stores user actions with timestamps
 */

export interface AuditLog {
  id: string;
  username: string;
  role: string;
  action: 'Login' | 'Logout' | 'Add Product' | 'Place Order';
  timestamp: string;
  date: string;
  time: string;
}

const AUDIT_LOG_KEY = 'audit_logs';

/**
 * Log an action to localStorage
 */
export function logAction(
  username: string,
  role: string,
  action: 'Login' | 'Logout' | 'Add Product' | 'Place Order'
): void {
  try {
    const now = new Date();
    
    const date = now.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const time = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const timestamp = `${date} ${time}`;

    const newLog: AuditLog = {
      id: `${Date.now()}_${Math.random()}`,
      username: username.trim(),
      role: role.trim(),
      action,
      timestamp,
      date,
      time,
    };

    // Get existing logs
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    const logs: AuditLog[] = stored ? JSON.parse(stored) : [];

    // Add new log
    logs.push(newLog);

    // Keep only last 1000 logs to avoid storage overflow
    if (logs.length > 1000) {
      logs.shift();
    }

    // Save back to localStorage
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));

    console.log(`[AUDIT] ${action}: ${username} (${role}) at ${timestamp}`);
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

/**
 * Get all audit logs from localStorage
 */
export function getAllLogs(): AuditLog[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return [];
  }
}

/**
 * Clear all audit logs
 */
export function clearAllLogs(): void {
  try {
    localStorage.removeItem(AUDIT_LOG_KEY);
    console.log('[AUDIT] All logs cleared');
  } catch (error) {
    console.error('Error clearing logs:', error);
  }
}

/**
 * Get logs filtered by action
 */
export function getLogsByAction(action: string): AuditLog[] {
  const logs = getAllLogs();
  return logs.filter((log) => log.action === action);
}

/**
 * Get logs filtered by username
 */
export function getLogsByUsername(username: string): AuditLog[] {
  const logs = getAllLogs();
  return logs.filter((log) => log.username.toLowerCase() === username.toLowerCase());
}

/**
 * Get logs filtered by role
 */
export function getLogsByRole(role: string): AuditLog[] {
  const logs = getAllLogs();
  return logs.filter((log) => log.role === role);
}
