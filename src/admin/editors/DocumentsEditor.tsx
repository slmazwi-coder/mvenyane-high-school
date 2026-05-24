import { getDocuments, setDocuments, generateId, type DocumentItem } from '../utils/storage';
import { runFullDefenseScan } from '../utils/defense';
import { Plus, Trash2, Download, FileText, X, Upload, ShieldCheck, Loader2 } from 'lucide-react';

const grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const subjects = ['Mathematics', 'English', 'IsiXhosa', 'Physical Sciences', 'Life Sciences', 'Accounting', 'Business Studies', 'Economics', 'Geography', 'History', 'Agriculture', 'Other'];

export const DocumentsEditor = () => {
  const [items, setItems] = useState<DocumentItem[]>(getDocuments());
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [newDoc, setNewDoc] = useState({ grade: grades[0], subject: subjects[0], fileName: '', fileData: '' });

  const [isScanning, setIsScanning] = useState(false);

  const filtered = items.filter(i =>
    (!filterGrade || i.grade === filterGrade) &&
    (!filterSubject || i.subject === filterSubject)
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewDoc({ ...newDoc, fileName: file.name, fileData: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addDocument = async () => {
    if (!newDoc.fileData || !newDoc.fileName) return;

    setIsScanning(true);
    // Scan both name and content (name is used for context check)
    const result = await runFullDefenseScan({ ...newDoc, name: newDoc.fileName }, 'documents');
    setIsScanning(false);

    if (!result.safe) {
      alert(`🛡️ AMD ALERT: ${result.reason}`);
      return;
    }

    const doc: DocumentItem = {
      id: generateId(),
      name: newDoc.fileName.replace(/\.[^/.]+$/, ''),
      grade: newDoc.grade,
      subject: newDoc.subject,
      fileData: newDoc.fileData,
      fileName: newDoc.fileName,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    const updated = [doc, ...items];
    setDocuments(updated);
    setItems(updated);
    setShowUpload(false);
    setNewDoc({ grade: grades[0], subject: subjects[0], fileName: '', fileData: '' });
  };

  const remove = (id: string) => {
    if (!confirm('Delete this document?')) return;
    const updated = items.filter(i => i.id !== id);
    setDocuments(updated);
    setItems(updated);
  };

  const download = (doc: DocumentItem) => {
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2 bg-school-green text-white px-4 py-2 rounded-xl font-medium hover:bg-green-800">
          <Plus size={18} /> Upload Document
        </button>
      </div>

      {showUpload && (
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Upload New Document</h2>
            <button onClick={() => setShowUpload(false)}><X size={20} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Grade</label>
              <select value={newDoc.grade} onChange={(e) => setNewDoc({ ...newDoc, grade: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white">
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subject</label>
              <select value={newDoc.subject} onChange={(e) => setNewDoc({ ...newDoc, subject: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white">
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">File</label>
              <label className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-600 text-white">
                <Upload size={16} /> {newDoc.fileName || 'Choose file...'}
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={addDocument} 
              disabled={!newDoc.fileData || isScanning} 
              className="bg-school-green text-white px-6 py-2 rounded-xl font-medium hover:bg-green-800 disabled:opacity-50"
            >
              {isScanning ? (
                <><Loader2 size={18} className="animate-spin" /> Scanning...</>
              ) : (
                'Upload'
              )}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <ShieldCheck size={12} className="text-green-500" /> Active Document Shield
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Grades</option>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>No documents found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
              <FileText size={24} className="text-blue-400 shrink-0" />
              <div className="flex-grow min-w-0">
                <p className="font-bold text-white text-sm truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.grade} • {doc.subject} • {doc.uploadDate}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => download(doc)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-400"><Download size={16} /></button>
                <button onClick={() => remove(doc.id)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
