// Quick script to get your Telegram Chat ID
// Run: node get-chat-id.js
// Make sure to set your BOT_TOKEN in .env.local or replace it here temporarily

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE'

async function getChatId() {
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('\n❌ Please set TELEGRAM_BOT_TOKEN in .env.local or replace BOT_TOKEN in this file\n')
    return
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`
    )
    const data = await response.json()

    if (data.ok && data.result.length > 0) {
      console.log('\n📱 Your Telegram Chat IDs:\n')
      data.result.forEach((update, index) => {
        if (update.message) {
          const chat = update.message.chat
          console.log(
            `Chat ${index + 1}: ID = ${chat.id} (${chat.first_name || ''} ${
              chat.last_name || ''
            } @${chat.username || 'no-username'})`
          )
        }
      })
      console.log(
        '\n✅ Use the ID from the chat where you sent the message to your bot\n'
      )
    } else {
      console.log(
        '\n⚠️  No messages found. Please send a message to @myhome_solar_tracker_bot first, then run this script again.\n'
      )
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

getChatId()
