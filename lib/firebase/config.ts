import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Get FCM token
export async function getFCMToken(): Promise<string | null> {
  try {
    const messagingSupported = await isSupported()
    if (!messagingSupported) {
      console.log('Firebase Messaging is not supported in this browser')
      return null
    }

    const messaging = getMessaging(app)
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })
      return token
    }

    return null
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Listen for foreground messages
export async function onMessageListener() {
  try {
    const messagingSupported = await isSupported()
    if (!messagingSupported) return

    const messaging = getMessaging(app)
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload)
      })
    })
  } catch (error) {
    console.error('Error setting up message listener:', error)
  }
}

export { app }
