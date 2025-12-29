import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { initAuditDB } from '@/lib/audit';
import { initSecurityDB } from '@/lib/security';

export async function GET() {
  try {
    await initDB();
    await initAuditDB();
    await initSecurityDB();
    return NextResponse.json({
      message: 'Database initialized successfully',
      tables: ['food_entries', 'audit_logs', 'user_status']
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
