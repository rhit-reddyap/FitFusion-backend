import { useState } from "react";

export default function Profile() {
  const [premium, setPremium] = useState(
    localStorage.getItem("ff-premium") === "true"
  );

  const togglePremium = () => {
    const newStatus = !premium;
    setPremium(newStatus);
    localStorage.setItem("ff-premium", newStatus);
  };

  return (
    <div className="profile">
      <h1>Profile</h1>

      <div className="user-info">
        <p><strong>User:</strong> Fitness Enthusiast</p>
        <p><strong>Status:</strong> {premium ? "Premium Member" : "Free Member"}</p>
      </div>

      <button onClick={togglePremium} className="premium-btn">
        {premium ? "Cancel Premium" : "Upgrade to Premium"}
      </button>

      {premium ? (
        <div className="premium-content">
          <h3>Premium Features</h3>
          <ul>
            <li>Offline Packs</li>
            <li>AI Diet Plans</li>
            <li>Advanced Analytics</li>
          </ul>
        </div>
      ) : (
        <p className="upgrade-note">Upgrade to unlock Offline Packs, AI Diet Plans, and more!</p>
      )}
    </div>
  );
}
