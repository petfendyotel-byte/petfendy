import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// One-time admin setup endpoint
// POST /api/dev/setup-admin
// Body: { setupKey: "...", email: "...", password: "..." }
export async function POST(request: Request) {
  try {
    // Only allow in development or with a setup key
    const body = await request.json()
    const { setupKey, email, password } = body

    // Require a setup key for security
    const expectedKey = process.env.ADMIN_SETUP_KEY || 'petfendy-setup-2024'
    if (setupKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, role: true, name: true }
    })

    if (existingUser) {
      // Update existing user to ADMIN
      const updated = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { role: 'ADMIN', active: true, emailVerified: true },
        select: { id: true, email: true, role: true, name: true }
      })
      return NextResponse.json({
        success: true,
        message: 'User updated to ADMIN',
        user: updated
      })
    }

    // Create new admin user
    if (!password) {
      return NextResponse.json({ error: 'Password required for new user' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN',
        active: true,
        emailVerified: true
      },
      select: { id: true, email: true, role: true, name: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created',
      user: newUser
    })

  } catch (error: any) {
    console.error('Setup admin error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET to check admin status
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, active: true, name: true },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
