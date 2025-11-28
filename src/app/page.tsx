export default function RootPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Fit Fusion AI Backend</h1>
      <p>API is running successfully!</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li>GET /api/health - Health check</li>
        <li>POST /api/stripe/webhook - Stripe webhook</li>
        <li>POST /api/stripe/create-checkout-session - Create checkout session</li>
        <li>POST /api/create-subscription - Create subscription</li>
        <li>POST /api/create-portal-session - Create portal session</li>
        <li>POST /api/cancel-subscription-simple - Cancel subscription</li>
      </ul>
    </div>
  );
}