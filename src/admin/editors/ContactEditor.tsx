import React, { useState } from 'react';
import { getContact, setContact, type ContactInfo } from '../utils/storage';
import { runFullDefenseScan } from '../utils/defense';
import { Save, ShieldCheck, Loader2 } from 'lucide-react';

export const ContactEditor = () => {
  const [info, setInfo] = useState<ContactInfo>(getContact());
  const [saved, setSaved] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const save = async () => {
    setIsScanning(true);
    const result = await runFullDefenseScan(info, 'contact');
    setIsScanning(false);

    if (!result.safe) {
      alert(`🛡️ AMD ALERT: ${result.reason}`);
      return;
    }

    setContact(info);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Contact Information Editor</h1>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={save}
            disabled={isScanning}
            className="flex items-center gap-2 bg-school-green text-white px-6 py-2 rounded-xl font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {isScanning ? (
              <><Loader2 size={18} className="animate-spin" /> Scanning...</>
            ) : (
              <><Save size={18} /> {saved ? 'Saved ✓' : 'Save Changes'}</>
            )}
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <ShieldCheck size={12} className="text-green-500" /> AMD Contact Shield Active
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Address</label>
          <input
            value={info.address}
            onChange={(e) => setInfo({ ...info, address: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
          <input
            value={info.phone}
            onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
          />
        </div>

        <h3 className="text-lg font-bold text-white pt-2 border-t border-gray-700">Email Addresses</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Principal</label>
            <input
              value={info.emailPrincipal}
              onChange={(e) => setInfo({ ...info, emailPrincipal: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="principal@..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Admin / Office</label>
            <input
              value={info.emailAdmin}
              onChange={(e) => setInfo({ ...info, emailAdmin: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="admin@..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hostel Admin</label>
            <input
              value={info.emailHostelAdmin}
              onChange={(e) => setInfo({ ...info, emailHostelAdmin: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="hosteladmin@..."
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white pt-4 border-t border-gray-700">School Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mon – Thu</label>
            <input
              value={info.monThu}
              onChange={(e) => setInfo({ ...info, monThu: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Friday</label>
            <input
              value={info.friday}
              onChange={(e) => setInfo({ ...info, friday: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sat – Sun</label>
            <input
              value={info.weekend}
              onChange={(e) => setInfo({ ...info, weekend: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
