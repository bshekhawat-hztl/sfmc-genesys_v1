// routes/activity.js
const request = require('request-promise-native');

const GENESYS_AUTH_URL = 'https://login.mec1.pure.cloud/oauth/token';
const GENESYS_FLOW_URL = 'https://api.mec1.pure.cloud/api/v2/flows/executions';
const CLIENT_ID     = 'a36298ab-fed3-428c-9d1f-86e99c982b63';
const CLIENT_SECRET = 'tJL4zU-PQpV6BHI-owOChKzE5v8M9U0WkDRfbWcU0wY';
const FLOW_ID       = '770ea816-7ce7-4e44-ac49-b935fba7f268';
const INTEGRATION_ID      = '65cd9bec-8fd5-45d3-a5cf-8432777b757f';

module.exports = {
  
  save(req, res) {
    console.log('🔖 save request', req.body);
    res.status(200).json({ message: 'Save successful' });
  },
  
  validate(req, res) {
    console.log('✅ validate request', req.body);
    res.status(200).json({ message: 'Validation successful' });
  },
  
  publish(req, res) {
    console.log('🚀 publish request', req.body);
    res.status(200).json({ message: 'Publish successful' });
  },
  
  async execute(req, res) {
    console.log('▶️ execute payload', JSON.stringify(req.body, null, 2));
    try {
      // 1) extract your inArguments
      const inArgs = (req.body.arguments?.execute?.inArguments || [])
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});

        const {
        responseId,
        phone,
        sessionId,
        contactId
        } = inArgs;
      
        if (!responseId || !phone || !sessionId || !contactId) {
        return res.status(400).json({ error: 'Missing phoneNumber or body' });
      }
      
      // 2) get a Genesys bearer token
      const auth = await request.post({
        url: GENESYS_AUTH_URL,
        form: {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        },
        json: true
      });
      const token = auth.access_token;
      
      // 3) fire the flow
      const flowPayload = {
        flowId: FLOW_ID,
        inputData: {
            'Flow.responseId':    responseId,
            'Flow.customerPhone': phone,
            'Flow.integrationId': INTEGRATION_ID,
            'Flow.sessionId':     sessionId,
            'Flow.ContactId':     contactId
          // …any other Flow.* fields you need
        }
      };
      
      await request.post({
        url: GENESYS_FLOW_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flowPayload)
      });
      
      console.log('✅ Genesys flow executed');
      return res.sendStatus(200);
      
    } catch (err) {
      console.error('❌ execute error', err);
      return res.status(500).json({ error: err.message || err });
    }
  }
  
};
