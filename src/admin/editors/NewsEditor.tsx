import React, { useState, useEffect } from 'react';
import { getNews, setNews, generateId, type NewsItem } from '../utils/storage';
import { runFullDefenseScan } from '../utils/defense';
import { Plus, Pencil, Trash2, Save, X, ImageIcon, ShieldCheck, Loader2 } from 'lucide-react';

export const NewsEditor = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => { setItems(getNews()); }, []);

  const save = async () => {
    if (!editing) return;
    
    setIsScanning(true);
    const result = await runFullDefenseScan(editing, 'news');
    setIsScanning(false);

    if (!result.safe) {
      alert(`🛡️ AMD ALERT: ${result.reason}`);
      return;
    }

    let updated: NewsItem[];
    if (isNew) {
      updated = [editing, ...items];
    } else {
      updated = items.map(i => i.id === editing.id ? editing : i);
    }
    setNews(updated);
    setItems(updated);
    setEditing(null);
    setIsNew(false);
  };

  const remove = (id: string) => {
    if (!confirm('Delete this news article?')) return;
    const updated = items.filter(i => i.id !== id);
    setNews(updated);
    setItems(updated);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">News Management</h1>
        <button
          onClick={() => {
            setEditing({ id: generateId(), title: '', content: '', image: '', date: new Date().toISOString().split('T')[0] });
            setIsNew(true);
          }}
          className="flex items-center gap-2 bg-school-green text-white px-4 py-2 rounded-xl font-medium hover:bg-green-800 transition-colors"
        >
          <Plus size={18} /> Add Article
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{isNew ? 'New Article' : 'Edit Article'}</h2>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
                placeholder="Article title"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={editing.date}
                onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Content</label>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                rows={5}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
                placeholder="Article content..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Image</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-600">
                  <ImageIcon size={18} /> Upload Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {editing.image && <img src={editing.image} alt="preview" className="h-16 w-16 rounded-lg object-cover" />}
              </div>
            </div>
            <button 
              onClick={save} 
              disabled={isScanning}
              className="flex items-center gap-2 bg-school-green text-white px-6 py-2 rounded-xl font-medium hover:bg-green-800 disabled:opacity-50"
            >
              {isScanning ? (
                <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Save size={18} /> Save</>
              )}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
              <ShieldCheck size={12} className="text-green-500" /> Content Protected by Anti-Malicious Defense
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 && !editing ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No news articles yet.</p>
          <p className="text-sm">Click "Add Article" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
              {item.image && <img src={item.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />}
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-white truncate">{item.title}</h3>
                <p className="text-gray-400 text-sm truncate">{item.content}</p>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"><Pencil size={16} /></button>
                <button onClick={() => remove(item.id)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
