import React, { useMemo, useState } from 'react';
import { getApplications, setApplications, calculateAverageMark, type Application } from '../utils/storage';
import { generateApplicationPDF } from '../utils/generatePDF';
import { Download, ChevronDown, Search, User, FileDown, ArrowUpDown, FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-600',
  Reviewed: 'bg-blue-600',
  Accepted: 'bg-green-600',
  Rejected: 'bg-red-600',
};

function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function toCSVRow(values: (string | number)[]) {
  return values
    .map((v) => {
      const s = String(v ?? '');
      const escaped = s.replace(/"/g, '""');
      return `"${escaped}"`;
    })
    .join(',');
}

export const ApplicationsEditor = () => {
  const [apps, setApps] = useState<Application[]>(getApplications());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<'date' | 'averageMark' | 'name'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const list = apps.filter(
      (a) =>
        (!statusFilter || a.status === statusFilter) &&
        (!typeFilter || a.applicationType === typeFilter) &&
        (!search || `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()))
    );

    const dir = sortDir === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
      if (sortKey === 'date') return dir * a.submittedDate.localeCompare(b.submittedDate);
      if (sortKey === 'name') return dir * `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      return dir * ((a.averageMark || 0) - (b.averageMark || 0));
    });
  }, [apps, statusFilter, typeFilter, search, sortKey, sortDir]);

  const updateStatus = (id: string, status: Application['status']) => {
    const updated = apps.map((a) => (a.id === id ? { ...a, status } : a));
    setApplications(updated);
    setApps(updated);
  };

  const updateMarks = (id: string, marksText: string) => {
    // Input format: Subject:Mark per line. Example: English:65
    const parsed = marksText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [subjectRaw, markRaw] = l.split(':');
        const subject = (subjectRaw || '').trim();
        const mark = Number((markRaw || '').trim());
        if (!subject || !Number.isFinite(mark)) return null;
        return { subject, mark: Math.max(0, Math.min(100, mark)) };
      })
      .filter(Boolean) as { subject: string; mark: number }[];

    const avg = calculateAverageMark(parsed);

    const updated = apps.map((a) => (a.id === id ? { ...a, subjectMarks: parsed, averageMark: avg } : a));
    setApplications(updated);
    setApps(updated);
  };

  const exportCSV = () => {
    const rows: string[] = [];
    rows.push(
      toCSVRow([
        'StudentNumber',
        'FirstName',
        'LastName',
        'DOB',
        'Grade',
        'Year',
        'ApplicationType',
        'BoardingType',
        'Locality',
        'Address',
        'PreviousSchool',
        'AverageMark',
        'Status',
        'SubmittedDate',
      ])
    );

    apps.forEach((a) => {
      rows.push(
        toCSVRow([
          a.studentNumber,
          a.firstName,
          a.lastName,
          a.dob,
          a.grade,
          a.year,
          a.applicationType,
          a.boardingType || '',
          a.locality || '',
          a.address,
          a.previousSchool || '',
          a.averageMark || 0,
          a.status,
          a.submittedDate,
        ])
      );
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Student Applications</h1>
          <span className="text-gray-400 text-sm">{apps.length} total</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <FileDown size={16} /> Export CSV
          </button>

          <button
            onClick={() => {
              const nextKey = sortKey === 'date' ? 'averageMark' : sortKey === 'averageMark' ? 'name' : 'date';
              setSortKey(nextKey);
              setSortDir('desc');
            }}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <ArrowUpDown size={16} /> Sort: {sortKey === 'date' ? 'Date' : sortKey === 'averageMark' ? 'Marks' : 'Name'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-grow max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">All Types</option>
          <option value="General">General</option>
          <option value="Boarding">Boarding</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          Sort {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <User size={48} className="mx-auto mb-4 opacity-30" />
          <p>{apps.length === 0 ? 'No applications received yet.' : 'No applications match your filters.'}</p>
          {apps.length === 0 && (
            <p className="text-xs mt-2">Applications submitted via the website will appear here.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-700/50"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-white">
                    {app.firstName} {app.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {app.applicationType} • {app.grade} • {app.year} • Student No: {app.studentNumber} • Avg: {app.averageMark || 0}
                  </p>
                </div>
                <span className={`${statusColors[app.status]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {app.status}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`}
                />
              </div>

              {expanded === app.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-gray-400">Date of Birth:</span>{' '}
                      <span className="text-white ml-2">{app.dob}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Previous School:</span>{' '}
                      <span className="text-white ml-2">{app.previousSchool || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Locality:</span>{' '}
                      <span className="text-white ml-2">{app.locality || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Guardian:</span>{' '}
                      <span className="text-white ml-2">{app.guardianName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span>{' '}
                      <span className="text-white ml-2">{app.guardianPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>{' '}
                      <span className="text-white ml-2">{app.guardianEmail}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-400">Address:</span>{' '}
                      <span className="text-white ml-2">{app.address}</span>
                    </div>
                    {app.applicationType === 'Boarding' ? (
                      <div>
                        <span className="text-gray-400">Boarding Type:</span>{' '}
                        <span className="text-white ml-2">{app.boardingType || '-'}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Academic report marks (manual)
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Paste one subject per line in the format: Subject:Mark. Example: English:65
                      </p>
                      <textarea
                        defaultValue={(app.subjectMarks || [])
                          .map((m) => `${m.subject}:${m.mark}`)
                          .join('\n')}
                        onBlur={(e) => updateMarks(app.id, e.target.value)}
                        rows={8}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                      />
                      <div className="text-xs text-gray-400 mt-2">Average: {app.averageMark || 0}</div>
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Uploads</div>
                      {(!app.uploads || app.uploads.length === 0) ? (
                        <div className="text-xs text-gray-500">No uploaded files.</div>
                      ) : (
                        <div className="space-y-2">
                          {app.uploads.map((u) => (
                            <div
                              key={u.key}
                              className="flex items-center justify-between gap-3 bg-gray-900/40 border border-gray-700 rounded-xl px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-white font-semibold truncate">{u.label}</div>
                                <div className="text-xs text-gray-400 truncate">{u.fileName}</div>
                              </div>
                              <button
                                onClick={() => downloadDataUrl(u.dataUrl, u.fileName)}
                                className="shrink-0 inline-flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
                              >
                                <Download size={14} /> Download
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => generateApplicationPDF(app)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      <Download size={14} /> Download PDF
                    </button>

                    {app.uploads && app.uploads.length > 0 ? (
                      <button
                        onClick={() => {
                          // Download a combined report (JSON) for archiving.
                          const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${app.studentNumber}_${app.lastName}_${app.firstName}.json`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2 bg-gray-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600"
                      >
                        <FileText size={14} /> Download record
                      </button>
                    ) : null}
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    Sorting by marks works once marks are entered. Automatic transcription (OCR) of report cards requires a
                    backend service, which is not configured in this project yet.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
