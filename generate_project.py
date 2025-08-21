import os

def write_file(path, content):
    # Only create directories if there is a directory in the path
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

# ---------- package.json ----------
write_file("package.json", """
{
  "name": "fit-fusion-ai",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "lucide-react": "^0.286.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.9"
  }
}
""")

# ---------- vite.config.js ----------
write_file("vite.config.js", """
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
""")

# ---------- index.html ----------
write_file("index.html", """
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fit Fusion AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""")

# ---------- src/main.jsx ----------
write_file("src/main.jsx", """
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
""")

# ---------- src/App.jsx ----------
write_file("src/App.jsx", """
import { Routes, Route, Navigate } from "react-router-dom";
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
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-plans" element={<AIPlans />} />
        <Route path="/food" element={<FoodTracker />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/workouts" element={<WorkoutTracker />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}
""")

# ---------- src/index.css ----------
write_file("src/index.css", """
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #fafafa;
  color: #111;
}
""")

print("✅ Project scaffold for Fit Fusion AI generated successfully.")
