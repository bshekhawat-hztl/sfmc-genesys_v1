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
    console.log(`request in app.js→ ${req.method} ${req.path}`);
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
// Execute activity: called at runtime by SFMC Journey
// instead of inlining here, just delegate to activity.js:

app.post('/save',     activity.save);
app.post('/validate', activity.validate);
app.post('/publish',  activity.publish);
app.post('/execute', activity.execute);


// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

