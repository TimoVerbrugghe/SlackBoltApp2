const { App } = require('@slack/bolt');
const openai = require('openai'); // Import the OpenAI library

const openaiApiKey = process.env.OPENAI_API_KEY;

// Initializes your app with your bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000
});

// Function to generate random customer information
function getRandomCustomerInfo() {
  return {
    ordersPlaced: Math.floor(Math.random() * 50) + 1,
    amountOverTime: `$${(Math.random() * 5000).toFixed(2)}`,
    lastVisitCompleted: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toDateString(),
    tasksOutstanding: Math.floor(Math.random() * 10),
  };
}

// Function to get response back from OpenAI
async function openaiRequest(prompt) {
  const openaiClient = new openai({ key: openaiApiKey });

  try {
    const response = await openaiClient.Completion.create({
      prompt,
      max_tokens: 50,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Error generating summary';
  }
}

// Function to summarize customer information using OpenAI
async function summarizeCustomerInfo(customerInfo) {
  const prompt = `Summarize the following customer information into a text no longer than 50 words:\nOrders Placed: ${customerInfo.ordersPlaced}\nAmount Over Time: ${customerInfo.amountOverTime}\nLast Visit Completed: ${customerInfo.lastVisitCompleted}\nTasks Outstanding: ${customerInfo.tasksOutstanding}`;
  return await openaiRequest(prompt);
}

// Function to generate random BEES order information
function getRandomBeesOrderInfo() {
  const order1 = {
    timePlaced: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toLocaleString(),
    orderAmount: `$${(Math.random() * 500).toFixed(2)}`,
    mainProduct: 'Product 1',
  };

  const order2 = {
    timePlaced: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toLocaleString(),
    orderAmount: `$${(Math.random() * 500).toFixed(2)}`,
    mainProduct: 'Product 2',
  };

  const order3 = {
    timePlaced: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toLocaleString(),
    orderAmount: `$${(Math.random() * 500).toFixed(2)}`,
    mainProduct: 'Product 3',
  };

  return {
    order1,
    order2,
    order3,
  };
}

// Listen for the shortcut invocation
app.shortcut('customer_info', async ({ shortcut, ack, context, client }) => {
  console.log('customer info received');

  // Acknowledge the shortcut request
  await ack();

  // Send the initial "loading" message
  const loadingMessage = await client.chat.postMessage({
    channel: shortcut.channel.id,
    text: 'Getting and summarizing information from data cloud... :hourglass_flowing_sand:',
  });

  // Generate random customer information
  const customerInfo = getRandomCustomerInfo();

  // Generate a summary of the customer information
  const summary = await summarizeCustomerInfo(customerInfo);

  // Delay for 3 seconds
  setTimeout(async () => {
    // Update the message with customer information and summary
    await client.chat.update({
      channel: loadingMessage.channel,
      ts: loadingMessage.ts,
      text: 'Customer Information',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Summary:*\n${summary}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Customer Information',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Orders Placed:*\n${customerInfo.ordersPlaced}`,
            },
            {
              type: 'mrkdwn',
              text: `*Amount Over Time:*\n${customerInfo.amountOverTime}`,
            },
            {
              type: 'mrkdwn',
              text: `*Last Visit Completed:*\n${customerInfo.lastVisitCompleted}`,
            },
            {
              type: 'mrkdwn',
              text: `*Tasks Outstanding:*\n${customerInfo.tasksOutstanding}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Check Bees Orders',
              },
              action_id: 'check_bees_orders',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Next Best Actions',
              },
              action_id: 'next_best_actions',
            },
          ],
        },
      ],
    });
  }, 3000); // 3 seconds delay
});

// Get BEES Orders check
app.action('check_bees_orders', async ({ body, ack, context, client }) => {
  console.log('check_bees_orders received');
  // Acknowledge the action
  await ack();

  // Generate random BEES order information (replace with your logic)
  const beesOrderInfo = getRandomBeesOrderInfo();

  // Generate a summary of BEES orders using OpenAI (replace with your logic)
  const beesOrderSummary = await openaiRequest(`Summarize the following BEES orders into a text no longer than 50 words:\nOrder 1: ${beesOrderInfo.order1}\nOrder 2: ${beesOrderInfo.order2}\nOrder 3: ${beesOrderInfo.order3}`);

  // Construct the modal view for BEES orders
  const modalView = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'BEES Orders',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
      emoji: true,
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*OpenAI Summary:*\n${beesOrderSummary}`,
        },
        accessory: {
          type: 'overflow',
          options: [
            {
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Option One',
              },
              value: 'value-0',
            },
            // Add more options if needed
          ],
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*BEES Order 1:*\nTime Placed: ${order1.timePlaced}\nOrder Amount: ${order1.orderAmount}\nMain Product Ordered: ${order1.mainProduct}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*BEES Order 2:*\nTime Placed: ${order2.timePlaced}\nOrder Amount: ${order2.orderAmount}\nMain Product Ordered: ${order2.mainProduct}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*BEES Order 3:*\nTime Placed: ${order3.timePlaced}\nOrder Amount: ${order3.orderAmount}\nMain Product Ordered: ${order3.mainProduct}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: 'Next 2 Results',
            },
            action_id: 'next_bees_orders',
          },
        ],
      },
    ],
  };

  // Open the modal view
  await client.views.open({
    trigger_id: body.trigger_id,
    view: modalView,
  });
});

// App Home
app.event('app_home_opened', async ({ event, client, logger }) => {
  console.log('app_home_opened received');
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome home, <@" + event.user + "> :house:*"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
            }
          }
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});


/////// TESTING /////////
// Respond to hello
// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  console.log('hello received');
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});


// The echo command simply echoes on command
app.command('/echo', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});

(async () => {
  // Start your app
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();