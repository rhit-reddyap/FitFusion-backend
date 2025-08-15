// src/pages/Recipes.jsx
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChefHat,
  Wand2,
  Plus,
  UtensilsCrossed,
  Lock,
  CookingPot,
  CheckCircle2,
} from "lucide-react";

/* ---------- Storage helpers ---------- */
const FOOD_KEY = "ff-food-logs-v1"; // { 'YYYY-MM-DD': [ {name, grams, calories, protein, carbs, fat, source?}, ... ] }
const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };
const todayKey = () => new Date().toISOString().slice(0, 10);
const readFood = () => safeJSON(localStorage.getItem(FOOD_KEY), {});
const writeFood = (obj) => localStorage.setItem(FOOD_KEY, JSON.stringify(obj));

/* ---------- Starter Recipes (per-serving macros) ---------- */
const STARTER_RECIPES = [
  {
    id: "power-bowl",
    name: "Chicken Power Bowl",
    brand: "Fusion Kitchen",
    serving_label: "1 bowl",
    grams_per_serving: 400,
    macros_per_serving: { calories: 520, protein: 45, carbs: 55, fat: 15 },
    tags: ["high-protein", "balanced"],
  },
  {
    id: "oats-berry",
    name: "Protein Oats & Berries",
    brand: "Fusion Kitchen",
    serving_label: "1 bowl",
    grams_per_serving: 320,
    macros_per_serving: { calories: 410, protein: 32, carbs: 58, fat: 10 },
    tags: ["breakfast", "fiber"],
  },
  {
    id: "stirfry",
    name: "Lean Beef Veggie Stir-Fry",
    brand: "Fusion Kitchen",
    serving_label: "1 plate",
    grams_per_serving: 380,
    macros_per_serving: { calories: 540, protein: 42, carbs: 48, fat: 18 },
    tags: ["dinner", "recovery"],
  },
];

/* ---------- One-click logger ---------- */
function logRecipeToFoodTracker(recipe, servings = 1) {
  const food = readFood();
  const key = todayKey();

  const grams = Math.round((recipe.grams_per_serving || 0) * servings);
  const calories = Math.round((recipe.macros_per_serving.calories || 0) * servings);
  const protein = +(recipe.macros_per_serving.protein * servings).toFixed(1);
  const carbs   = +(recipe.macros_per_serving.carbs * servings).toFixed(1);
  const fat     = +(recipe.macros_per_serving.fat * servings).toFixed(1);

  const entry = {
    name: recipe.name,
    brand: `Recipe • ${recipe.brand || "Fusion"}`,
    grams,
    calories,
    protein,
    carbs,
    fat,
    // <-- Source tag so Food Tracker can show "from recipe"
    source: { type: "recipe", id: recipe.id, servings: Number(servings) || 1 },
  };

  const day = Array.isArray(food[key]) ? food[key] : [];
  const next = { ...food, [key]: [...day, entry] };
  writeFood(next);

  return entry;
}

/* ---------- Page ---------- */
export default function Recipes() {
  const [justLogged, setJustLogged] = useState(null); // {name, servings}

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-emerald-100 grid place-items-center">
          <BookOpen className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recipes & Cookbooks</h1>
          <p className="text-slate-600">Manage your recipes and discover new ones</p>
        </div>
      </div>

      {/* Hero / Coming Soon */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-6 md:p-8 shadow-lg">
        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
          <Lock className="h-3.5 w-3.5" /> Coming Soon!
        </div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            AD&apos;s Power Fuel Cookbook
          </h2>
          <p className="mt-3 text-slate-300 leading-relaxed">
            Unlock a premium collection of macro-friendly recipes designed for performance and taste.
            Each recipe is crafted for easy logging and tight integration with your diet plan.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <FeaturePill icon={<Wand2 className="h-4 w-4" />} text="AI-Powered Suggestions" />
            <FeaturePill icon={<Plus className="h-4 w-4" />} text="One-Click Logging" />
          </div>
        </div>

        <ChefHat className="absolute -right-10 -bottom-8 h-48 w-48 text-white/10" aria-hidden="true" />
      </section>

      {/* Personal Recipes (empty state) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">Your Personal Recipes</h3>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 opacity-70"
            title="Adding custom recipes is coming soon"
          >
            <Plus className="h-4 w-4" /> Add New Recipe
          </button>
        </div>

        <div className="grid place-items-center rounded-2xl border border-slate-200 py-16 mb-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100">
              <UtensilsCrossed className="h-6 w-6 text-slate-500" />
            </div>
            <div className="text-lg font-semibold text-slate-800">Your cookbook is empty</div>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              The feature to add your own recipes is coming soon!
            </p>
          </div>
        </div>

        {/* Starter Recipes – functional logging */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CookingPot className="h-4 w-4" /> Starter Recipes
          </h4>

          <div className="grid gap-4 md:grid-cols-2">
            {STARTER_RECIPES.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onLogged={(s) => {
                  setJustLogged({ name: r.name, servings: s });
                  setTimeout(() => setJustLogged(null), 2500);
                }}
              />
            ))}
          </div>

          {justLogged && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Logged <b className="mx-1">{justLogged.name}</b> × {justLogged.servings} to today.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- UI bits ---------- */
function FeaturePill({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-emerald-200 ring-1 ring-white/10">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function RecipeCard({ recipe, onLogged }) {
  const [servings, setServings] = useState(1);

  const totals = useMemo(() => {
    const s = Math.max(0, Number(servings) || 0);
    const m = recipe.macros_per_serving;
    return {
      calories: Math.round(m.calories * s),
      protein: +(m.protein * s).toFixed(1),
      carbs:   +(m.carbs * s).toFixed(1),
      fat:     +(m.fat * s).toFixed(1),
      grams:   Math.round((recipe.grams_per_serving || 0) * s),
    };
  }, [servings, recipe]);

  const log = () => {
    const s = Number(servings) || 1;
    logRecipeToFoodTracker(recipe, s);
    onLogged?.(s);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{recipe.name}</div>
          <div className="text-xs text-slate-500">{recipe.brand} • {recipe.serving_label}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {recipe.tags?.map((t) => (
              <span
                key={t}
                className="text-[11px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 ring-1 ring-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-500">Per Serving</div>
          <div className="text-slate-900 text-sm">
            {recipe.macros_per_serving.calories} kcal • P {recipe.macros_per_serving.protein}g • C {recipe.macros_per_serving.carbs}g • F {recipe.macros_per_serving.fat}g
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600">Servings</label>
        <input
          type="number"
          min={1}
          step={1}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="w-20 rounded-lg border border-slate-300 px-2 py-1"
        />
        <div className="ml-auto text-sm text-slate-600">
          <span className="font-medium text-slate-900">{totals.calories}</span> kcal •
          {" "}P {totals.protein} • C {totals.carbs} • F {totals.fat} • {totals.grams} g
        </div>
        <button
          onClick={log}
          className="ml-auto rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100 font-medium"
        >
          Log to Food
        </button>
      </div>
    </div>
  );
}
