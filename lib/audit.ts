import { sql } from '@vercel/postgres';

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failure' | 'blocked';
  created_at: Date;
}

export async function initAuditDB() {
  // Create audit_logs table
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(50) NOT NULL,
      resource_id VARCHAR(255),
      details TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'success',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create indices for better query performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON audit_logs(user_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_status
    ON audit_logs(status)
  `;
}

export async function logAudit(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: 'success' | 'failure' | 'blocked';
}): Promise<void> {
  const {
    userId,
    action,
    resourceType,
    resourceId = null,
    details = null,
    ipAddress = null,
    userAgent = null,
    status = 'success',
  } = params;

  await sql`
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent, status)
    VALUES (${userId}, ${action}, ${resourceType}, ${resourceId}, ${details}, ${ipAddress}, ${userAgent}, ${status})
  `;
}

export async function getRecentAuditLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const { rows } = await sql<AuditLog>`
    SELECT * FROM audit_logs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function getBlockedActions(
  userId: string,
  timeWindowMinutes: number = 60
): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE user_id = ${userId}
    AND status = 'blocked'
    AND created_at > NOW() - INTERVAL '${timeWindowMinutes} minutes'
  `;
  return parseInt(rows[0].count, 10);
}

export async function getActionCount(
  userId: string,
  action: string,
  timeWindowMinutes: number = 60
): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE user_id = ${userId}
    AND action = ${action}
    AND created_at > NOW() - INTERVAL '${timeWindowMinutes} minutes'
  `;
  return parseInt(rows[0].count, 10);
}
