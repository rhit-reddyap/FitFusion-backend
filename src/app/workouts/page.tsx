"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type SetEntry = { reps: number; weight: number; };
type Exercise = { name: string; sets: SetEntry[] };

export default function WorkoutsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "Bench Press", sets: [{ reps: 8, weight: 135 }] }]);

  function addExercise() {
    setExercises([...exercises, { name: "New Exercise", sets: [{ reps: 10, weight: 0 }] }]);
  }

  function addSet(i: number) {
    const next = [...exercises];
    next[i].sets.push({ reps: 10, weight: 0 });
    setExercises(next);
  }

  function removeExercise(i: number) {
    const next = [...exercises];
    next.splice(i,1);
    setExercises(next);
  }

  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Workouts</h1>
          <button className="btn" onClick={addExercise}><Plus size={18}/> Add exercise</button>
        </div>

        {exercises.map((ex, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <input className="input max-w-sm" value={ex.name} onChange={e => {
                const next = [...exercises]; next[i].name = e.target.value; setExercises(next);
              }} />
              <button className="btn-outline" onClick={() => removeExercise(i)}><Trash2 size={16}/> Remove</button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="font-medium">Set</div><div className="font-medium">Reps</div><div className="font-medium">Weight</div>
              {ex.sets.map((s, j) => (
                <>
                  <div className="py-2">#{j+1}</div>
                  <input className="input" type="number" value={s.reps} onChange={e=>{
                    const next=[...exercises]; next[i].sets[j].reps=Number(e.target.value); setExercises(next);
                  }}/>
                  <input className="input" type="number" value={s.weight} onChange={e=>{
                    const next=[...exercises]; next[i].sets[j].weight=Number(e.target.value); setExercises(next);
                  }}/>
                </>
              ))}
            </div>
            <button onClick={() => addSet(i)} className="btn mt-3">Add set</button>
          </div>
        ))}
      </section>
    </AuthGuard>
  );
}
