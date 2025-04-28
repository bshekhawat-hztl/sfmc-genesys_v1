const path = require('path');

exports.index = (req, res) => {
  // Serve your activity UI
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
};

exports.login = (req, res) => {
  // Stubbed login endpoint (if you need SSO or JWT)
  // You can pull in req.body credentials here
  res.json({ success: true, message: 'Logged in (stub)' });
};

exports.logout = (req, res) => {
  // Stubbed logout endpoint
  res.json({ success: true, message: 'Logged out (stub)' });
};
