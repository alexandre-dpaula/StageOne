'use client'

import { useEffect, useState } from 'react'
import { getFCMToken, onMessageListener } from '@/lib/firebase/config'
import { createClient } from '@/lib/supabase/client'

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check initial permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Request permission and get token
  const requestPermission = async () => {
    try {
      const fcmToken = await getFCMToken()
      if (fcmToken) {
        setToken(fcmToken)
        setNotificationPermission('granted')

        // Save token to Supabase
        await saveFCMToken(fcmToken)

        return fcmToken
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return null
    }
  }

  // Save FCM token to Supabase
  const saveFCMToken = async (fcmToken: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Update or insert FCM token for user
      await supabase
        .from('users')
        .update({ fcm_token: fcmToken })
        .eq('id', user.id)

    } catch (error) {
      console.error('Error saving FCM token:', error)
    }
  }

  // Listen for foreground messages
  useEffect(() => {
    const setupListener = async () => {
      try {
        const payload = await onMessageListener()
        console.log('Received foreground message:', payload)

        // Show notification in foreground
        if (payload && typeof payload === 'object' && 'notification' in payload) {
          const notification = payload.notification as { title?: string; body?: string }
          if (notification.title) {
            new Notification(notification.title, {
              body: notification.body,
              icon: '/icon-192x192.png',
            })
          }
        }
      } catch (error) {
        console.error('Error setting up message listener:', error)
      }
    }

    if (notificationPermission === 'granted') {
      setupListener()
    }
  }, [notificationPermission])

  return {
    token,
    notificationPermission,
    requestPermission,
  }
}
