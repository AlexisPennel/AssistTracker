import { connectDB } from '@/lib/next-auth/mongodb'
import User from '@/mongo/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    await connectDB()

    const { firstName, lastName, email, password, newsletter } = await req.json()

    if (!firstName || !lastName || !email || !password) {
      return new Response(JSON.stringify({ message: 'Missing fields' }), { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      newsletter: Boolean(newsletter),
      cgvAccepted: true,
      cguAccepted: true,
    })

    return new Response(JSON.stringify({ success: true }), { status: 201 })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 })
  }
}
