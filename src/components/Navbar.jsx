import { Link, useLocation } from "react-router-dom";
import { Dumbbell, Home, BarChart2, Utensils, BookOpen, User } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/food", label: "Food", icon: Utensils },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      {links.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className={location.pathname === to ? "active" : ""}>
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
