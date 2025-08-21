"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Food = { name: string; grams: number; calories: number; protein: number; carbs: number; fat: number; };

export default function FoodPage() {
  const [logs, setLogs] = useState<Food[]>([
    { name: "Chicken breast", grams: 150, calories: 248, protein: 46, carbs: 0, fat: 5 }
  ]);

  function addFood() {
    setLogs([...logs, { name: "New food", grams: 100, calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  }

  function removeFood(i: number) {
    const next = [...logs]; next.splice(i,1); setLogs(next);
  }

  const totals = logs.reduce((acc, f) => {
    acc.calories += f.calories;
    acc.protein += f.protein;
    acc.carbs += f.carbs;
    acc.fat += f.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Food</h1>
          <button className="btn" onClick={addFood}><Plus size={18}/> Add food</button>
        </div>

        <div className="card">
          <div className="grid grid-cols-6 gap-2 font-medium">
            <div>Food</div><div>g</div><div>kcal</div><div>P</div><div>C</div><div>F</div>
          </div>
          {logs.map((f, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-center mt-2">
              <input className="input" value={f.name} onChange={e=>{ const n=[...logs]; n[i].name=e.target.value; setLogs(n); }} />
              <input className="input" type="number" value={f.grams} onChange={e=>{ const n=[...logs]; n[i].grams=Number(e.target.value); setLogs(n); }} />
              <input className="input" type="number" value={f.calories} onChange={e=>{ const n=[...logs]; n[i].calories=Number(e.target.value); setLogs(n); }} />
              <input className="input" type="number" value={f.protein} onChange={e=>{ const n=[...logs]; n[i].protein=Number(e.target.value); setLogs(n); }} />
              <input className="input" type="number" value={f.carbs} onChange={e=>{ const n=[...logs]; n[i].carbs=Number(e.target.value); setLogs(n); }} />
              <div className="flex items-center gap-2">
                <input className="input" type="number" value={f.fat} onChange={e=>{ const n=[...logs]; n[i].fat=Number(e.target.value); setLogs(n); }} />
                <button className="btn-outline" onClick={()=>removeFood(i)}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          <div className="mt-3 grid grid-cols-6 gap-2 text-sm text-gray-600">
            <div>Totals</div><div></div>
            <div>{totals.calories}</div>
            <div>{totals.protein}</div>
            <div>{totals.carbs}</div>
            <div>{totals.fat}</div>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}
