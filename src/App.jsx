// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import AIPlans from "./pages/AIPlans";
import FoodTracker from "./pages/FoodTracker";
import Recipes from "./pages/Recipes";
import WorkoutTracker from "./pages/WorkoutTracker";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      {/* If your Layout renders a Navbar + <main>{children}</main>, keep this structure */}
      <Layout>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Top-level routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-plans" element={<AIPlans />} />
          <Route path="/food-tracker" element={<FoodTracker />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/workout-tracker" element={<WorkoutTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />

          {/* Fallback */}
          <Route path="*" element={<div className="p-8">Not Found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
