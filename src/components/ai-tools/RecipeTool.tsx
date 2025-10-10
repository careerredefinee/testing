import React, { useState } from 'react';
import BASE_URL from '../../config';

interface Props { onClose?: () => void }

const RecipeTool: React.FC<Props> = ({ onClose }) => {
  const [ingredients, setIngredients] = useState('');
  const [diet, setDiet] = useState('any');
  const [cuisine, setCuisine] = useState('any');
  const [time, setTime] = useState('30');
  const [servings, setServings] = useState(2);
  const [extras, setExtras] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const generate = async () => {
    setError('');
    setResult('');
    if (!ingredients.trim()) {
      setError('Please enter at least a few ingredients.');
      return;
    }
    setLoading(true);
    try {
      const prompt = [
        'You are a professional chef and nutrition coach.',
        `Create a clear, step-by-step RECIPE based on these inputs:`,
        `Ingredients: ${ingredients}.`,
        `Diet preference: ${diet}. Cuisine style: ${cuisine}.`,
        `Max cooking time: ${time} minutes. Servings: ${servings}.`,
        extras ? `Notes/requests: ${extras}.` : null,
        '',
        'Return in this structure:',
        '1) Title',
        '2) Short description (1-2 lines)',
        '3) Ingredients (with quantities for given servings)',
        '4) Instructions (numbered steps, concise)',
        '5) Optional variations or substitutions',
        '6) Nutrition highlights (approximate)',
        'Keep it practical, Indian measurements where helpful. Avoid unavailable items if possible.'
      ].filter(Boolean).join('\n');

      const resp = await fetch(`${BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, tool: 'recipe-generator', context: 'Generate a complete cooking recipe.' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Failed to generate');
      const reply = data?.data?.reply || 'No content generated.';
      setResult(reply);
    } catch (e:any) {
      setError(e.message || 'Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
            <textarea className="w-full border rounded-md px-3 py-2 h-24" placeholder="e.g., tomato, onion, eggs, rice, chicken, green chilli" value={ingredients} onChange={(e)=> setIngredients(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diet</label>
              <select className="w-full border rounded-md px-3 py-2" value={diet} onChange={(e)=> setDiet(e.target.value)}>
                <option value="any">Any</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="gluten-free">Gluten-free</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <input className="w-full border rounded-md px-3 py-2" placeholder="e.g., Indian, Italian, Chinese" value={cuisine} onChange={(e)=> setCuisine(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Time (mins)</label>
              <input type="number" min={5} className="w-full border rounded-md px-3 py-2" value={time} onChange={(e)=> setTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" min={1} className="w-full border rounded-md px-3 py-2" value={servings} onChange={(e)=> setServings(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Allergies / Must-include</label>
            <input className="w-full border rounded-md px-3 py-2" placeholder="e.g., no nuts, must use curd, high-protein" value={extras} onChange={(e)=> setExtras(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={generate} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading? 'bg-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {loading ? 'Generating…' : 'Generate Recipe'}
            </button>
            {onClose && (
              <button onClick={onClose} className="px-4 py-2 rounded-md border">Close</button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="bg-white border rounded-md p-4 overflow-auto max-h-[520px] whitespace-pre-wrap">
          {!result ? (
            <div className="text-gray-500">Your AI-generated recipe will appear here.</div>
          ) : (
            <>{result}</>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeTool;
