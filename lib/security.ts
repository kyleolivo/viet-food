import { sql } from '@vercel/postgres';
import { getBlockedActions, logAudit } from './audit';

export interface UserStatus {
  user_id: string;
  is_locked: boolean;
  lock_reason: string | null;
  locked_at: Date | null;
  blocked_count: number;
  created_at: Date;
  updated_at: Date;
}

export async function initSecurityDB() {
  // Create user_status table
  await sql`
    CREATE TABLE IF NOT EXISTS user_status (
      user_id VARCHAR(255) PRIMARY KEY,
      is_locked BOOLEAN DEFAULT FALSE,
      lock_reason TEXT,
      locked_at TIMESTAMP,
      blocked_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index for locked users
  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_status_locked
    ON user_status(is_locked)
  `;
}

export async function getUserStatus(userId: string): Promise<UserStatus | null> {
  const { rows } = await sql<UserStatus>`
    SELECT * FROM user_status
    WHERE user_id = ${userId}
  `;
  return rows[0] || null;
}

export async function ensureUserStatus(userId: string): Promise<UserStatus> {
  let status = await getUserStatus(userId);

  if (!status) {
    await sql`
      INSERT INTO user_status (user_id)
      VALUES (${userId})
      ON CONFLICT (user_id) DO NOTHING
    `;
    status = await getUserStatus(userId);
  }

  return status!;
}

export async function isUserLocked(userId: string): Promise<boolean> {
  const status = await getUserStatus(userId);
  return status?.is_locked || false;
}

export async function lockUser(
  userId: string,
  reason: string,
  adminId?: string
): Promise<void> {
  await ensureUserStatus(userId);

  await sql`
    UPDATE user_status
    SET is_locked = TRUE,
        lock_reason = ${reason},
        locked_at = NOW(),
        updated_at = NOW()
    WHERE user_id = ${userId}
  `;

  await logAudit({
    userId: adminId || 'system',
    action: 'lock_account',
    resourceType: 'user',
    resourceId: userId,
    details: reason,
    status: 'success',
  });
}

export async function unlockUser(userId: string, adminId?: string): Promise<void> {
  await sql`
    UPDATE user_status
    SET is_locked = FALSE,
        lock_reason = NULL,
        locked_at = NULL,
        updated_at = NOW()
    WHERE user_id = ${userId}
  `;

  await logAudit({
    userId: adminId || 'system',
    action: 'unlock_account',
    resourceType: 'user',
    resourceId: userId,
    status: 'success',
  });
}

export async function incrementBlockedCount(userId: string): Promise<number> {
  await ensureUserStatus(userId);

  const { rows } = await sql<{ blocked_count: number }>`
    UPDATE user_status
    SET blocked_count = blocked_count + 1,
        updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING blocked_count
  `;

  return rows[0].blocked_count;
}

// Rate limiting
export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  identify: { maxRequests: 20, windowMinutes: 60 }, // 20 identifications per hour
  save_food: { maxRequests: 30, windowMinutes: 60 }, // 30 saves per hour
  api_call: { maxRequests: 100, windowMinutes: 60 }, // 100 API calls per hour
};

export async function checkRateLimit(
  userId: string,
  action: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = RATE_LIMITS[action] || RATE_LIMITS.api_call;

  // Get count of actions in the time window
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE user_id = ${userId}
    AND action = ${action}
    AND status != 'blocked'
    AND created_at > NOW() - INTERVAL '${config.windowMinutes} minutes'
  `;

  const count = parseInt(rows[0].count, 10);
  const allowed = count < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - count);
  const resetAt = new Date(Date.now() + config.windowMinutes * 60 * 1000);

  return { allowed, remaining, resetAt };
}

// Abuse detection
export async function detectAbuse(userId: string): Promise<{
  shouldLock: boolean;
  reason?: string;
}> {
  const status = await ensureUserStatus(userId);

  // Check if already locked
  if (status.is_locked) {
    return { shouldLock: true, reason: status.lock_reason || 'Account locked' };
  }

  // Check for excessive blocked actions
  const recentBlocked = await getBlockedActions(userId, 60);
  if (recentBlocked >= 10) {
    return {
      shouldLock: true,
      reason: `Excessive blocked actions: ${recentBlocked} in the last hour`,
    };
  }

  // Check total blocked count
  if (status.blocked_count >= 50) {
    return {
      shouldLock: true,
      reason: `High total blocked count: ${status.blocked_count}`,
    };
  }

  return { shouldLock: false };
}

// Alert notification
export async function sendAbuseAlert(userId: string, reason: string): Promise<void> {
  // Log the abuse alert
  await logAudit({
    userId: 'system',
    action: 'abuse_alert',
    resourceType: 'user',
    resourceId: userId,
    details: reason,
    status: 'success',
  });

  // In a production app, you would send an email or notification here
  // For now, we'll just log it
  console.error(`🚨 ABUSE ALERT: User ${userId} - ${reason}`);

  // You could integrate with services like:
  // - SendGrid for email
  // - Slack webhooks
  // - Discord webhooks
  // - Twilio for SMS
  // Example:
  // await fetch(process.env.SLACK_WEBHOOK_URL, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     text: `🚨 Abuse Alert: User ${userId}\nReason: ${reason}`,
  //   }),
  // });
}
