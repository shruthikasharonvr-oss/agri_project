import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const { name, role } = await request.json();

    // Validate input
    if (!name || !role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      );
    }

    if (!['farmer', 'customer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Log the login (in production, you would save to a database)
    console.log(`[LOGIN] User: ${name}, Role: ${role}, Timestamp: ${new Date().toISOString()}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `${name} logged in as ${role}`,
      user: {
        name: name.trim(),
        role: role,
        loginTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    );
  }
}
