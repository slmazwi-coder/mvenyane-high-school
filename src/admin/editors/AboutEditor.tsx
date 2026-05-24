import React, { useState } from 'react';
import { getAbout, setAbout, type AboutInfo } from '../utils/storage';
import { runFullDefenseScan } from '../utils/defense';
import { Save, Plus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

export const AboutEditor = () => {
  const [info, setInfo] = useState<AboutInfo>(getAbout());
  const [saved, setSaved] = useState(false);

  const [isScanning, setIsScanning] = useState(false);

  const save = async () => {
    setIsScanning(true);
    const result = await runFullDefenseScan(info, 'about');
    setIsScanning(false);

    if (!result.safe) {
      alert(`🛡️ AMD ALERT: ${result.reason}`);
      return;
    }

    setAbout(info);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...info.historyParagraphs];
    updated[index] = value;
    setInfo({ ...info, historyParagraphs: updated });
  };

  const addParagraph = () => {
    setInfo({ ...info, historyParagraphs: [...info.historyParagraphs, ''] });
  };

  const removeParagraph = (index: number) => {
    setInfo({ ...info, historyParagraphs: info.historyParagraphs.filter((_, i) => i !== index) });
  };

  const updateMessage = (index: number, value: string) => {
    const updated = [...info.principalMessage];
    updated[index] = value;
    setInfo({ ...info, principalMessage: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">About Page Editor</h1>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={save}
            disabled={isScanning}
            className="flex items-center gap-2 bg-school-green text-white px-6 py-2 rounded-xl font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <Save size={18} /> {saved ? 'Saved ✓' : 'Save Changes'}
              </>
            )}
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <ShieldCheck size={12} className="text-green-500" /> AMD Policy Protection Active
          </div>
        </div>
      </div>

      {/* History */}
      <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">School History</h2>
          <button onClick={addParagraph} className="flex items-center gap-1 text-sm text-school-green hover:underline">
            <Plus size={14} /> Add Paragraph
          </button>
        </div>
        <div className="space-y-4">
          {info.historyParagraphs.map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
                rows={3}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm"
              />
              <button onClick={() => removeParagraph(i)} className="text-gray-500 hover:text-red-400 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Principal */}
      <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Principal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              value={info.principalName}
              onChange={(e) => setInfo({ ...info, principalName: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              value={info.principalTitle}
              onChange={(e) => setInfo({ ...info, principalTitle: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Principal's Message</label>
          <div className="space-y-3">
            {info.principalMessage.map((msg, i) => (
              <textarea
                key={i}
                value={msg}
                onChange={(e) => updateMessage(i, e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
