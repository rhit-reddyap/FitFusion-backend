import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const STORAGE_KEY = "ff-recipes-v1";

export default function Recipes() {
  const [recipes, setRecipes] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  const save = (next) => {
    setRecipes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addRecipe = () => {
    const name = prompt("Recipe name?");
    const calories = Number(prompt("Calories?"));
    const protein = Number(prompt("Protein (g)?"));
    if (!name || !calories || !protein) return;
    const recipe = { name, calories, protein };
    save([...recipes, recipe]);
  };

  const removeRecipe = (i) => {
    const copy = [...recipes];
    copy.splice(i, 1);
    save(copy);
  };

  return (
    <div className="recipes">
      <h1>Recipes</h1>
      <button onClick={addRecipe} className="add-btn">
        <Plus size={16} /> Add Recipe
      </button>
      <ul>
        {recipes.map((r, i) => (
          <li key={i}>
            {r.name} - {r.calories} cal, {r.protein} g protein
            <button onClick={() => removeRecipe(i)}>
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
