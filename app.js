const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static UI and assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Apply security headers for framing in Journey Builder
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.exacttarget.com https://*.marketingcloudapps.com"
  );
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://*.exacttarget.com');
  next();
});

// Expose config.json for Journey Builder discovery
app.get('/config.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'config.json'));
});

// Serve the activity UI
app.get('/activity', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lifecycle endpoints required by SFMC
app.post('/save',     (req, res) => res.status(200).json({ message: 'Save successful' }));
app.post('/publish',  (req, res) => res.status(200).json({ message: 'Publish successful' }));
app.post('/validate', (req, res) => res.status(200).json({ message: 'Validation successful' }));

// Execute activity: called at runtime by SFMC Journey
app.post('/execute', async (req, res) => {
  try {
    // Extract inArguments (phoneNumber, messageBody, etc.)
    const inArgs = req.body.arguments.execute.inArguments;
    const phoneNumber = inArgs.find(arg => arg.phoneNumber)?.phoneNumber;
    const messageBody = inArgs.find(arg => arg.body)?.body;

    if (!phoneNumber || !messageBody) {
      return res.status(400).send('Missing phone number or message body');
    }

    // 1. Authenticate with Genesys
    const authResponse = await request.post({
      url: 'https://login.mec1.pure.cloud/oauth/token',
      form: {
        grant_type:    'client_credentials',
        client_id:     'a36298ab-fed3-428c-9d1f-86e99c982b63',
        client_secret: 'tJL4zU-PQpV6BHI-owOChKzE5v8M9U0WkDRfbWcU0wY'
      },
      json: true
    });

    const accessToken = authResponse.access_token;

    // 2. Build payload for Genesys flow
    const flowPayload = {
      flowId: '770ea816-7ce7-4e44-ac49-b935fba7f268',
      inputData: {
        'Flow.customerPhone': phoneNumber,
        'Flow.messageBody':   messageBody,
        // add other Flow.* fields as needed
      }
    };

    // 3. Trigger Genesys flow execution
    await request.post({
      url: 'https://api.mec1.pure.cloud/api/v2/flows/executions',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flowPayload)
    });

    // 4. Respond with success
    res.sendStatus(200);
  } catch (err) {
    console.error('Error executing activity:', err.message || err);
    res.sendStatus(500);
  }
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

