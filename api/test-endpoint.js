// Simple test endpoint to verify API structure
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API structure test',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url
  });
}
