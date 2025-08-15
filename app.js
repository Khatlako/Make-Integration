const express = require('express');
const fetch = require('node-fetch'); // if using Node >=18, you can use global fetch
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

// Multi-page settings mapping
const pageSettings = {
  "<page_id_1>": {
    agentNumber: "+26657145220",
    phoneNumberId: "786260934562398",
    whatsappToken: "EAATfeGmXsIsBPP9vvaeyzctd78FsSGW4OVHsSZALjtYBV8Ht37piCZC1KC2AR1K6iCp0YZChnVW4pgus8MXZCZCJX9DFFesbBAJClGNZCo90QZCy68800K9onBsln253T0XMQpG75deHTcfGFPooKZAmpdnwcXpeUZAXW4kiCzRhdx5veGWS0ofYFU3KZCBXqisy8q0aNWH4RDEHiWPAHsZA04igA3YADp33QWMFAvaEB3c5MUe4QZDZD" // Replace with your WhatsApp token for page 1
  },
  "<page_id_2>": {
    agentNumber: "+26662223565",
    phoneNumberId: "786260934562398",
    whatsappToken: "EAATfeGmXsIsBPP9vvaeyzctd78FsSGW4OVHsSZALjtYBV8Ht37piCZC1KC2AR1K6iCp0YZChnVW4pgus8MXZCZCJX9DFFesbBAJClGNZCo90QZCy68800K9onBsln253T0XMQpG75deHTcfGFPooKZAmpdnwcXpeUZAXW4kiCzRhdx5veGWS0ofYFU3KZCBXqisy8q0aNWH4RDEHiWPAHsZA04igA3YADp33QWMFAvaEB3c5MUe4QZDZD" // Replace with your WhatsApp token for page 2
  }
};

// Route for receiving POST from Make.com
app.post('/', async (req, res) => {
  try {
    const { pageId, customerMessage, linkToComment, productInfo } = req.body;

    if (!pageId || !customerMessage) {
      return res.status(400).send("Missing pageId or customerMessage");
    }

    const settings = pageSettings[pageId];
    if (!settings) {
      return res.status(400).send("Page not configured in Render service");
    }

    const { agentNumber, phoneNumberId, whatsappToken } = settings;

    const messageBody = `
New customer inquiry:
"${customerMessage}"

${productInfo ? 'Product: ' + productInfo : ''}
${linkToComment ? 'Link: ' + linkToComment : ''}
    `;

    // Send WhatsApp message via Meta WhatsApp Cloud API
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: agentNumber,
        type: "text",
        text: { body: messageBody }
      })
    });

    const data = await response.json();
    console.log('WhatsApp API response:', data);

    res.status(200).send({ success: true, data });

  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Optional health check
app.get('/', (req, res) => {
  res.send('Render WhatsApp notifier is running.');
});

// Start server
app.listen(port, () => {
  console.log(`Render WhatsApp notifier running on port ${port}`);
});
