const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route for privacy policy
app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// Route for Whoop callback
app.get('/whoop-callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'whoop-callback.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Privacy Policy Server running on http://localhost:${PORT}`);
    console.log(`Privacy Policy: http://localhost:${PORT}/privacy-policy`);
    console.log(`Whoop Callback: http://localhost:${PORT}/whoop-callback`);
});





