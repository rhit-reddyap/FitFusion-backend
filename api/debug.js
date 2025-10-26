// Simple test endpoint to debug API issues
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers
  });
}
