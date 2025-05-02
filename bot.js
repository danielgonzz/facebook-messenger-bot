// Import required modules
const express = require('express');
const botInit = require('fb-messenger-bot-api');

// Environment variables (replace with your actual tokens)
const PAGE_ACCESS_TOKEN = 'EAAJKNZCvB0f0BO4ucP5wjGZBg8Egm1K0ZBmWXKTQVPQdgWqenbGrZAZA1dSWhZBCgLZAlZBFeL9RZB4QV2oaM1KElJ95xR3Y6ZAdDaFDlgAZBVFXbkawSWyQFeoaZBoMVnt1qM5PDdA2A8GjbeilxJ2ExdFdHKJ6PqE0u1Lq4tEPrZBYrKh9zi92TQx5AAlgOAMBzZB1FV3aELg1p25fe7Qxqb';
const VERIFY_TOKEN = 'your_verify_token';
const PORT = process.env.PORT || 3000;

const WELCOME = 'Welcome to our chatbot!';
const PRIVACY_POLICY = 'Privacy Policy: We value your privacy and will not share your information. Do you agree?';
const ASK_NAME = 'What is your full name? (i.e. John Christopher De Jesus)';
const ASK_USERNAME = 'What is your username? (i.e. johnchristopherdejesus)';  
const ASK_MOBILE = 'What is your mobile number? (i.e. 09123456789)';
const ASK_BIRTHMONTH = 'What is your birth month in numbers? (i.e. 12)';
const ASK_BIRTHDAY = 'What is your birth day in numbers? (i.e. 31)';
const ASK_BIRTHYEAR = 'What is your birth year in numbers? (i.e. 2000)';
const ASK_PHOTO_RECEIPT = 'Please send a photo of your JTI Transaction Receipt.';
const ASK_PHOTO_RECEIPT_INVALID = 'Please only upload JPG, PNG, and WEBP formats.';
const ASK_PHOTO_GOVERNMENT_ID = 'Please send a photo of your Government ID.';
const ASK_PHOTO_GOVERNMENT_ID_INVALID = 'Please only upload JPG, PNG, and WEBP formats.';
const THANK_YOU = 'Thank you for your responses! We will process your information.';
const END = 'END';

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Messenger Bot
const bot = new botInit.FacebookMessagingAPIClient(PAGE_ACCESS_TOKEN);

// Add a simple state management object
const userStates = {}; // To track user states

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

// Modify the webhook to include PRIVACY_POLICY check after the 3-second wait
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const userMessage = event.message.text.toLowerCase();

        // Send the WELCOME message first
        if (!userStates[senderId]) {
          userStates[senderId] = 'awaiting_privacy_policy';
          await bot.sendTextMessage(senderId, WELCOME);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
          await bot.sendTextMessage(senderId, PRIVACY_POLICY);
        } else if (userStates[senderId] === 'awaiting_privacy_policy') {
          if (userMessage === 'yes') {
            userStates[senderId] = 'awaiting_name';
            await bot.sendTextMessage(senderId, ASK_NAME);
          } else if (userMessage === 'no') {
            userStates[senderId] = null; // End the conversation
            await bot.sendTextMessage(senderId, END);
          } else {
            await bot.sendTextMessage(senderId, 'Please respond with "yes" or "no".');
          }
        } else if (userStates[senderId] === 'awaiting_name') {
          userStates[senderId] = 'awaiting_username';
          await bot.sendTextMessage(senderId, ASK_USERNAME);
        } else if (userStates[senderId] === 'awaiting_username') {
          userStates[senderId] = 'awaiting_mobile';
          await bot.sendTextMessage(senderId, ASK_MOBILE);
        } else if (userStates[senderId] === 'awaiting_mobile') {
          userStates[senderId] = awaiting_birthmonth;
          await bot.sendTextMessage(senderId, ASK_BIRTHMONTH);
        } else if (userStates[senderId] === 'awaiting_birthmonth') {
          userStates[senderId] = awaiting_birthday;
          await bot.sendTextMessage(senderId, ASK_BIRTHDAY);
        } else if (userStates[senderId] === 'awaiting_birthday') {
          userStates[senderId] = awaiting_birthyear;
          await bot.sendTextMessage(senderId, ASK_BIRTHYEAR);
        } else if (userStates[senderId] === 'awaiting_birthyear') {
          userStates[senderId] = 'awaiting_photo_receipt';
          await bot.sendTextMessage(senderId, ASK_PHOTO_RECEIPT);
        } else if (userStates[senderId] === 'awaiting_photo_receipt') {
          const attachment = event.message.attachments && event.message.attachments[0];
          if (attachment && attachment.type === 'image') {
            const url = attachment.payload.url;
            if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp')) {
              userStates[senderId] = 'awaiting_photo_government_id';
              await bot.sendTextMessage(senderId, ASK_PHOTO_GOVERNMENT_ID);
            } else {
              await bot.sendTextMessage(senderId, ASK_PHOTO_RECEIPT_INVALID);
              await bot.sendTextMessage(senderId, ASK_PHOTO_RECEIPT);
            }
          } else {
            await bot.sendTextMessage(senderId, ASK_PHOTO_RECEIPT_INVALID);
            await bot.sendTextMessage(senderId, ASK_PHOTO_RECEIPT);
          }
        } else if (userStates[senderId] === 'awaiting_photo_government_id') {
          const attachment = event.message.attachments && event.message.attachments[0];
          if (attachment && attachment.type === 'image') {
            const url = attachment.payload.url;
            if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp')) {
              userStates[senderId] = null; // End the conversation
              await bot.sendTextMessage(senderId, THANK_YOU);
            } else {
              await bot.sendTextMessage(senderId, ASK_PHOTO_GOVERNMENT_ID_INVALID);
              await bot.sendTextMessage(senderId, ASK_PHOTO_GOVERNMENT_ID);
            }
          } else {
            await bot.sendTextMessage(senderId, ASK_PHOTO_GOVERNMENT_ID_INVALID);
            await bot.sendTextMessage(senderId, ASK_PHOTO_GOVERNMENT_ID);
          }
        } else {
          await bot.sendTextMessage(senderId, `You said: ${userMessage}`);
        }
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