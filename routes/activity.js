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
    console.log('🔖 save headers:', req.headers);
    console.log('🔖 save request', req.body);
    res.status(200).json({ message: 'Save successful' });
  },
  
  validate(req, res) {
    console.log('🔖 validate headers:', req.headers);
    console.log('✅ validate request', req.body);
    res.status(200).json({ message: 'Validation successful' });
  },
  
  publish(req, res) {
    console.log('🔖 publish headers:', req.headers);
    console.log('🚀 publish request', req.body);
    res.status(200).json({ message: 'Publish successful' });
  },
  
  async execute(req, res) {

    console.log('test 10 inside execute function');
    console.log('▶️ execute payload', JSON.stringify(req.body, null, 2));
    //console.log('🔖 execute headers:', req.headers);
    //console.log('🚀 execute request', req.body);

    
    try {

      // 1) extract your inArguments
      
        const inArgs = req.body.arguments?.execute?.inArguments;
        if (!Array.isArray(inArgs)) {
            return res.status(400).json({ error: 'Invalid payload: no inArguments' });
          }

        const responseId = inArgs.find(a => a.responseId)?.responseId;
        const phone      = inArgs.find(a => a.phone)?.phone;
        const sessionId  = inArgs.find(a => a.sessionId)?.sessionId;
        const contactId  = inArgs.find(a => a.contactId)?.contactId;
        
        console.log('Parsed inArgs →', { responseId, phone, sessionId, contactId });
        
        // 3) Validate all four
        const missing = [];
        if (!responseId) missing.push('responseId');
        if (!phone)      missing.push('phone');
        if (!sessionId)  missing.push('sessionId');
        if (!contactId)  missing.push('contactId');
        if (missing.length) {
            return res
            .status(400)
            .json({ error: `Missing required inArguments: ${missing.join(', ')}` });
        }

        console.log('Parsed inArgs →', { responseId, phone, sessionId, contactId });

      
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
      console.log("Accesstoken in execution"+token);
     
      await request.post({
        url: GENESYS_FLOW_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flowId: FLOW_ID,
          inputData: {
            'Flow.responseId':    responseId,
            'Flow.customerPhone': phone,
            'Flow.integrationId':  INTEGRATION_ID,
            'Flow.sessionId':      sessionId,
            'Flow.ContactId':      contactId
          }
        })
      });
      
      console.log('✅ Genesys flow executed');
      return res.sendStatus(200);
      
    } catch (err) {
      console.error('❌ execute error', err);
      return res.status(500).json({ error: err.message || err });
    }
  }
  
};
