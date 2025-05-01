const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const path = require('path');
const routes = require('./routes');
const activity = require('./routes/activity');

const app = express();
const PORT = process.env.PORT || 3000;

// To check every request coming to this app

app.use((req, res, next) => {
    console.log(`→ ${req.method} ${req.path}`);
    next();
  });

// Serve static UI and assets
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'public')));

// Apply security headers for framing in Journey Builder
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.exacttarget.com https://*.marketingcloudapps.com"
  );
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://*.exacttarget.com');
  next();
});
// Right after you create your Express app
app.use(bodyParser.json());

// Expose config.json for Journey Builder discovery
app.get('/config.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'config.json'));
});

// Serve the activity UI

/*
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
}); */

app.get('/', routes.index );
app.post('/login', routes.login);
app.post('/logout', routes.logout);
console.log("Execution flow app 1:"); 

// Lifecycle endpoints required by SFMC

app.post('/save',     activity.save);
app.post('/validate', activity.validate);
app.post('/publish',  activity.publish);

// Execute activity: called at runtime by SFMC Journey
// instead of inlining here, just delegate:
app.post('/execute', activity.execute);

/*
app.post('/execute', async (req, res) => {
    try {

        console.log('❗️ /execute payload:'+ JSON.stringify(req.body));
      // pull your four inArguments
      const inArgs    = req.body.arguments.execute.inArguments;
      const responseId = inArgs.find(a => a.responseId)?.responseId;
      const phone      = inArgs.find(a => a.phone)?.phone;
      const sessionId  = inArgs.find(a => a.sessionId)?.sessionId;
      const contactId  = inArgs.find(a => a.contactId)?.contactId;
  
      // 1. get Genesys token
      const auth = await request.post({
        url: 'https://login.mec1.pure.cloud/oauth/token',
        form: {
          grant_type:    'client_credentials',
          client_id:     'a36298ab-fed3-428c-9d1f-86e99c982b63',
          client_secret: 'tJL4zU-PQpV6BHI-owOChKzE5v8M9U0WkDRfbWcU0wY'
        },
        json: true
      });
      const accessToken = auth.access_token;
      console.log("Execution function access token: "+accessToken);
  
      // 2. fire the flow
      await request.post({
        url: 'https://api.mec1.pure.cloud/api/v2/flows/executions',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flowId: '770ea816-7ce7-4e44-ac49-b935fba7f268',
          inputData: {
            'Flow.responseId':    responseId,
            'Flow.customerPhone': phone,
            'Flow.integrationId': '65cd9bec-8fd5-45d3-a5cf-8432777b757f',
            'Flow.sessionId':     sessionId,
            'Flow.ContactId':     contactId
          }
        })
      });
  
      return res.sendStatus(200);
    } catch (err) {
      console.error('Error in /execute:', err);
      return res.sendStatus(500);
    }
  });
*/


// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

