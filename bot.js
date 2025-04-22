// Import required modules
const express = require('express');
const { MessengerBot } = require('fb-messenger-bot-api');

// Environment variables (replace with your actual tokens)
const PAGE_ACCESS_TOKEN = 'your_page_access_token';
const VERIFY_TOKEN = 'your_verify_token';
const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Messenger Bot
const bot = new MessengerBot(PAGE_ACCESS_TOKEN);

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook to handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const userMessage = event.message.text;

        // Respond to the user
        await bot.sendTextMessage(senderId, `You said: ${userMessage}`);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});