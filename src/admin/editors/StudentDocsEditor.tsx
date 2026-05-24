import React, { useMemo, useState } from 'react';
import { Upload, FileText, Trash2, ShieldCheck } from 'lucide-react';

type UploadRow = {
  studentNumber: string;
  title: string;
  category: string;
  year: string;
  term: string;
  fileName: string;
  fileDataUrl: string;
};

// NOTE:
// This is a UI stub that matches your current "demo storage" style (DataURLs in browser storage).
// For real security, this must upload to private storage with server-side auth.

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStoreKey(studentNumber: string) {
  return `mh_student_docs_${studentNumber}`;
}

function getDocs(studentNumber: string) {
  try {
    const raw = localStorage.getItem(getStoreKey(studentNumber));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setDocs(studentNumber: string, docs: any[]) {
  localStorage.setItem(getStoreKey(studentNumber), JSON.stringify(docs));
}

export const StudentDocsEditor = () => {
  const [row, setRow] = useState<UploadRow>({
    studentNumber: '',
    title: '',
    category: 'Report',
    year: new Date().getFullYear().toString(),
    term: '',
    fileName: '',
    fileDataUrl: '',
  });

  const [previewDocs, setPreviewDocs] = useState<any[]>([]);

  const canUpload = row.studentNumber && row.title && row.fileDataUrl;

  const loadPreview = () => {
    setPreviewDocs(getDocs(row.studentNumber.trim()));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRow((p) => ({ ...p, fileName: file.name, fileDataUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const upload = () => {
    const studentNumber = row.studentNumber.trim();
    const docs = getDocs(studentNumber);

    const doc = {
      id: generateId(),
      title: row.title.trim(),
      category: row.category,
      year: row.year,
      term: row.term,
      fileName: row.fileName,
      fileUrl: row.fileDataUrl,
      createdAt: new Date().toISOString(),
    };

    const updated = [doc, ...docs];
    setDocs(studentNumber, updated);
    setPreviewDocs(updated);

    setRow((p) => ({ ...p, title: '', term: '', fileName: '', fileDataUrl: '' }));
  };

  const remove = (id: string) => {
    const studentNumber = row.studentNumber.trim();
    const docs = getDocs(studentNumber);
    const updated = docs.filter((d: any) => d.id !== id);
    setDocs(studentNumber, updated);
    setPreviewDocs(updated);
  };

  const docsForStudent = useMemo(() => previewDocs, [previewDocs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Student documents</h1>
          <p className="text-gray-400 text-sm">Upload reports and assessments per student number.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <ShieldCheck size={12} className="text-green-500" /> Demo mode (local browser storage)
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Student number</label>
            <input
              value={row.studentNumber}
              onChange={(e) => setRow({ ...row, studentNumber: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="e.g. 2027-000123"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              value={row.title}
              onChange={(e) => setRow({ ...row, title: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="e.g. Term 1 Report"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={row.category}
              onChange={(e) => setRow({ ...row, category: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
            >
              <option>Report</option>
              <option>Assessment</option>
              <option>Homework</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Year</label>
            <input
              value={row.year}
              onChange={(e) => setRow({ ...row, year: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="2026"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Term</label>
            <input
              value={row.term}
              onChange={(e) => setRow({ ...row, term: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
              placeholder="Term 1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">File</label>
            <label className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-600 text-white">
              <Upload size={16} /> {row.fileName || 'Choose file...'}
              <input type="file" accept="application/pdf,image/*" onChange={onFile} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={upload}
            disabled={!canUpload}
            className="bg-school-green text-white px-6 py-2 rounded-xl font-medium hover:bg-green-800 disabled:opacity-50"
          >
            Upload
          </button>
          <button
            onClick={loadPreview}
            disabled={!row.studentNumber.trim()}
            className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
          >
            Load student documents
          </button>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText size={18} className="text-blue-400" /> Documents
        </h2>

        {docsForStudent.length === 0 ? (
          <div className="text-gray-500 text-sm">No documents loaded.</div>
        ) : (
          <div className="space-y-2">
            {docsForStudent.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between gap-3 bg-gray-900/40 border border-gray-700 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm text-white font-semibold truncate">{d.title}</div>
                  <div className="text-xs text-gray-400 truncate">{d.category} • {d.year}{d.term ? ` • ${d.term}` : ''} • {d.fileName}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
                  >
                    View
                  </a>
                  <button
                    onClick={() => remove(d.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
