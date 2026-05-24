import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, LogOut, Search } from 'lucide-react';

type StudentDoc = {
  id: string;
  title: string;
  category: string;
  year?: string;
  term?: string;
  fileUrl: string;
  createdAt?: string;
};

// NOTE: This is a UI scaffold.
// A secure version must query a backend that enforces per-student access.
const demoDocs: StudentDoc[] = [];

export const StudentPortal = () => {
  const navigate = useNavigate();

  const studentNumber = useMemo(() => {
    return sessionStorage.getItem('mh_student_portal_student_number') || '';
  }, []);

  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<StudentDoc[]>(demoDocs);

  useEffect(() => {
    if (!studentNumber) navigate('/student/login');
  }, [studentNumber, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => `${d.title} ${d.category} ${d.year || ''} ${d.term || ''}`.toLowerCase().includes(q));
  }, [docs, search]);

  const logout = () => {
    sessionStorage.removeItem('mh_student_portal_student_number');
    navigate('/student/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-school-green text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-white/80">Student Portal</div>
            <div className="text-2xl font-bold">Student No: {studentNumber}</div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-xl font-semibold"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">My documents</h1>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/20"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <div className="font-bold text-gray-800">No documents available</div>
            <div className="text-sm text-gray-500 mt-1">When the school uploads your reports or assessments, they will appear here.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <a
                key={d.id}
                href={d.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="font-bold text-gray-900">{d.title}</div>
                <div className="text-xs text-gray-500 mt-1">{d.category}{d.year ? ` • ${d.year}` : ''}{d.term ? ` • ${d.term}` : ''}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
