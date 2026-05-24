import React, { useState, useEffect } from 'react';
import { getHallOfFame, setHallOfFame, generateId, type HallOfFameEntry } from '../utils/storage';
import { runFullDefenseScan } from '../utils/defense';
import { Plus, Trash2, Save, Trophy, X, ImageIcon, Pencil, ShieldCheck, Loader2 } from 'lucide-react';

export const AchievementsEditor = () => {
  const [hall, setHall] = useState<HallOfFameEntry[]>(getHallOfFame());
  const [editing, setEditing] = useState<HallOfFameEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const [isScanning, setIsScanning] = useState(false);

  const saveHall = async () => {
    if (!editing) return;

    setIsScanning(true);
    const result = await runFullDefenseScan(editing, 'achievements');
    setIsScanning(false);

    if (!result.safe) {
      alert(`🛡️ AMD ALERT: ${result.reason}`);
      return;
    }

    let updated: HallOfFameEntry[];
    if (isNew) {
      updated = [...hall, editing];
    } else {
      updated = hall.map(h => h.id === editing.id ? editing : h);
    }
    setHallOfFame(updated);
    setHall(updated);
    setEditing(null);
    setIsNew(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removeHall = (id: string) => {
    if (!confirm('Remove this Hall of Fame entry?')) return;
    const updated = hall.filter(h => h.id !== id);
    setHallOfFame(updated);
    setHall(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditing({ ...editing, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Achievements Editor</h1>

      {/* Hall of Fame */}
      <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Trophy size={20} className="text-yellow-500" /> Hall of Fame</h2>
          <button
            onClick={() => {
              setEditing({ id: generateId(), name: '', title: '', year: '', desc: '', image: '' });
              setIsNew(true);
            }}
            className="flex items-center gap-2 bg-school-green text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-800"
          >
            <Plus size={16} /> Add Entry
          </button>
        </div>

        {editing && (
          <div className="bg-gray-700 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between"><h3 className="font-bold text-sm">{isNew ? 'New Entry' : 'Edit Entry'}</h3><button onClick={() => { setEditing(null); setIsNew(false); }}><X size={16} /></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Student Name" className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Achievement Title" className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })} placeholder="Year" className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} placeholder="Description" className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 cursor-pointer text-sm">
                <ImageIcon size={14} /> Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {editing.image && <img src={editing.image} className="h-10 w-10 rounded object-cover" />}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-600">
              <button 
                onClick={saveHall} 
                disabled={isScanning}
                className="flex items-center gap-2 bg-school-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50"
              >
                {isScanning ? (
                  <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Save size={14} /> Save</>
                )}
              </button>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                <ShieldCheck size={10} className="text-green-500" /> Anti-Malicious Defense Active
              </div>
            </div>
          </div>
        )}

        {hall.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No Hall of Fame entries yet. Click "Add Entry" to create one.</p>
        ) : (
          <div className="space-y-3">
            {hall.map(h => (
              <div key={h.id} className="flex items-center gap-4 bg-gray-700/50 rounded-xl p-3">
                {h.image ? <img src={h.image} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-gray-600 rounded-lg" />}
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm text-white truncate">{h.name}</p>
                  <p className="text-xs text-gray-400 truncate">{h.title} • {h.year}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(h); setIsNew(false); }} className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white"><Pencil size={14} /></button>
                  <button onClick={() => removeHall(h.id)} className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <p className="text-gray-400 text-sm">💡 To edit yearly results data and subject pass rates, update the code in <code className="text-school-green">Achievements.tsx</code> directly until Supabase is connected.</p>
      </div>
    </div>
  );
};

