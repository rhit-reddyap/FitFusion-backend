// Vercel serverless function: /api/foods?q=apple  or  /api/foods?barcode=737628064502
// Optional: /api/foods?q=apple&grams=85 (adds computed totals_for_grams)
export default async function handler(req, res) {
  try {
    const { q, barcode, grams } = req.query;
    const gramsNum = grams ? Math.max(0, Number(grams)) : null;

    if (!q && !barcode) {
      return res.status(400).json({ error: "Provide ?q=search or ?barcode=code" });
    }

    // Basic caching to reduce OFF load (OK to tweak/remove)
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    if (q) {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        q
      )}&search_simple=1&action=process&json=1&page_size=25`;
      const r = await fetch(url);
      const data = await r.json();

      const items = (data?.products || []).map((p) =>
        finalizeProduct(normalizeOFFProduct(p), gramsNum)
      );
      return res.status(200).json({ items });
    }

    if (barcode) {
      const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
      const r = await fetch(url);
      const data = await r.json();
      const base = data?.product ? normalizeOFFProduct(data.product) : null;
      const item = base ? finalizeProduct(base, gramsNum) : null;
      return res.status(200).json({ item });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}

/** ---------- Helpers ---------- **/

function normalizeOFFProduct(p) {
  const n = p?.nutriments || {};

  // OFF energy sometimes in kJ. Prefer kcal if present.
  const kcal100 =
    n["energy-kcal_100g"] ??
    (n["energy_100g"] ? Math.round(n["energy_100g"] / 4.184) : 0);

  return {
    id: p.id || p._id || p.code || cryptoSafeId(p),
    name: p.product_name || p.generic_name || firstTruthy(p.brands_tags) || "Unnamed product",
    brand: p.brands || "",
    category: stripLang(firstTruthy(p.categories_tags)) || "",
    barcode: p.code || "",
    image: p.image_front_url || p.image_url || "",
    serving_size_g: parseServingSizeToGrams(p.serving_size),
    nutriments_per_100g: {
      calories: num(n.proteins_100g) || kcal100 || 0, // set below; placeholder to keep keys consistent
      protein: num(n.proteins_100g) || 0,
      carbs: num(n.carbohydrates_100g) || 0,
      fat: num(n.fat_100g) || 0,
      fiber: num(n.fiber_100g) || 0,
      sugar: num(n.sugars_100g) || 0,
      sodium_mg: n.sodium_100g ? Math.round(n.sodium_100g * 1000) : 0, // g -> mg
    },
  };
}

function finalizeProduct(prod, grams) {
  // Fix calories field (we set it after to avoid shadowing)
  const n = prod.nutriments_per_100g;
  // If calories still zero but OFF had kcal100 inferred in normalize, keep it
  // In our normalize we placed kcal into calories (if available)
  // Ensure integer rounding for neat UI
  n.calories = Math.round(n.calories);

  if (grams && grams > 0) {
    const scale = grams / 100;
    prod.totals_for_grams = {
      grams,
      calories: round(n.calories * scale),
      protein: round(n.protein * scale, 2),
      carbs: round(n.carbs * scale, 2),
      fat: round(n.fat * scale, 2),
      fiber: round(n.fiber * scale, 2),
      sugar: round(n.sugar * scale, 2),
      sodium_mg: Math.round(n.sodium_mg * scale),
    };
  }

  return prod;
}

function parseServingSizeToGrams(serving) {
  if (!serving || typeof serving !== "string") return null;
  // Common patterns: "30 g", "2 tbsp (30 g)", "1 cup (240 ml)", "1 bar (45 g)"
  // We try to find a number + "g" anywhere in the string.
  const gMatch = serving.match(/([\d.]+)\s*g\b/i);
  if (gMatch) return Number(gMatch[1]);

  // If it's ml and density unknown, return null (avoid bad assumptions)
  // const mlMatch = serving.match(/([\d.]+)\s*ml\b/i);

  return null;
}

function stripLang(tag) {
  // OFF categories_tags like "en:breakfasts"
  if (!tag) return "";
  return String(tag).replace(/^..:/, "");
}

function firstTruthy(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.find(Boolean) || "";
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round(v, digits = 0) {
  const f = Math.pow(10, digits);
  return Math.round(v * f) / f;
}

function cryptoSafeId(p) {
  // last-resort ID; very rare path
  try {
    return (p?.product_name || "prod") + "-" + Math.random().toString(36).slice(2, 10);
  } catch {
    return "prod-" + Math.random().toString(36).slice(2, 10);
  }
}
