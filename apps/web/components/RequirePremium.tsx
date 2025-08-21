export function hasPremium(): boolean {
  // Lifetime
  if (localStorage.getItem("premium") === "lifetime") return true;

  // Trial
  const expiry = localStorage.getItem("premiumTrial");
  if (expiry && new Date(expiry) > new Date()) {
    return true;
  }

  return false;
}
