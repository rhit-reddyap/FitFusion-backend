import PaywallGate from "../components/PaywallGate";
// ... your existing imports

export default function Analytics() {
  return (
    <PaywallGate title="Analytics is Premium">
      {/* your existing Analytics JSX here */}
    </PaywallGate>
  );
}
