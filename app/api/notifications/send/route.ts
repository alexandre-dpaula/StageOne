import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, title, message, ticketId } = body

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's FCM token
    const { data: targetUser } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('id', userId)
      .single()

    if (!targetUser?.fcm_token) {
      return NextResponse.json(
        { error: 'User has no FCM token registered' },
        { status: 404 }
      )
    }

    // Send notification via Firebase Admin SDK
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: targetUser.fcm_token,
        notification: {
          title,
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'ticket-notification',
          requireInteraction: true,
        },
        data: {
          ticketId: ticketId || '',
          url: '/meus-ingressos',
        },
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('FCM Error:', result)
      return NextResponse.json(
        { error: 'Failed to send notification', details: result },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      result,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
