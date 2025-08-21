import { useState } from "react";

const STORAGE_KEY = "ff-ai-plans-v1";

export default function AIPlans() {
  const [plans, setPlans] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  const save = (next) => {
    setPlans(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addPlan = () => {
    const type = prompt("Plan type? (Workout / Diet)");
    const details = prompt("Enter plan details:");
    if (!type || !details) return;
    const plan = { type, details, premium: type.toLowerCase() === "diet" };
    save([...plans, plan]);
  };

  return (
    <div className="ai-plans">
      <h1>AI Plans</h1>
      <button onClick={addPlan} className="add-btn">+ Add AI Plan</button>
      <ul>
        {plans.map((p, i) => (
          <li key={i}>
            <strong>{p.type}</strong>: {p.details}{" "}
            {p.premium && <span className="premium-tag">Premium</span>}
          </li>
        ))}
      </ul>
      <p className="note">⚡ Some AI-generated plans may require Premium access.</p>
    </div>
  );
}
