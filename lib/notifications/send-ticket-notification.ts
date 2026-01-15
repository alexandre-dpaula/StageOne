export async function sendTicketPurchaseNotification(
  userId: string,
  eventTitle: string,
  ticketId: string
) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title: '🎉 Ingresso Confirmado!',
        message: `Seu ingresso para "${eventTitle}" foi confirmado com sucesso!`,
        ticketId,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Failed to send notification:', result)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending ticket notification:', error)
    return false
  }
}
