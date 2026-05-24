import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, Upload, X, ChevronLeft, ChevronRight,
  AlertCircle, Download, FileText, BedDouble, Info,
  Clock, AlertTriangle,
} from 'lucide-react';
import {
  generateId,
  generateStudentNumber,
  getApplications,
  setApplications,
  type Application,
  type UploadedFile,
} from '../admin/utils/storage';

// ─── Application Number Generator ────────────────────────────────────────────

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MV-${year}-${ts}-${rand}`;
}

// ─── Age / Grade rules ────────────────────────────────────────────────────────
// Grade 8 → max age 16, Grade 9 → 17, Grade 10 → 18
// Grade 11 → 19, Grade 12 → NOT ACCEPTED
const GRADE_MAX_AGE: Record<string, number> = {
  '8': 16,
  '9': 17,
  '10': 18,
  '11': 19,
};

const ALLOWED_GRADES = ['8', '9', '10', '11']; // Grade 12 not allowed

function getAgeFromDob(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

// ─── 24-hour cache helpers (declaration form) ─────────────────────────────────

const DECL_CACHE_KEY = 'mv_boarding_decl_deadline';
const BOARDING_FORM_CACHE_KEY = 'mv_boarding_form_cache';

function getDeclarationDeadline(): number | null {
  const v = localStorage.getItem(DECL_CACHE_KEY);
  if (!v) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function setDeclarationDeadline() {
  const deadline = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(DECL_CACHE_KEY, String(deadline));
  return deadline;
}

function clearDeclarationDeadline() {
  localStorage.removeItem(DECL_CACHE_KEY);
}

function useDeclCountdown(deadline: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!deadline) { setRemaining(0); return; }
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return remaining;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() { return new Date().toISOString().slice(0, 10); }

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(String(r.result));
    r.onerror = () => rej(new Error('Failed to read file'));
    r.readAsDataURL(file);
  });
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────

const inp = 'border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-school-green/40 focus:border-school-green transition w-full bg-white min-w-0';
const sel = inp + ' cursor-pointer';

const Field = ({ label, required, children, className = '', error }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string; error?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide leading-tight">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
  </div>
);

const SectionHeading = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 pb-2 border-b-2 border-school-green/20 mb-5">
    <FileText size={15} className="text-school-green shrink-0" />
    <h3 className="text-sm font-black uppercase tracking-widest text-gray-700">{title}</h3>
  </div>
);

const StepBadge = ({ num, label, active, done }: {
  num: number; label: string; active: boolean; done: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all
      ${done ? 'bg-school-green border-school-green text-white'
      : active ? 'bg-white border-white text-school-green'
      : 'bg-white/20 border-white/30 text-white/60'}`}>
      {done ? <CheckCircle size={14} /> : num}
    </div>
    <span className={`text-xs font-bold uppercase tracking-widest transition-all
      ${active ? 'text-white' : done ? 'text-green-200' : 'text-white/50'}`}>
      {label}
    </span>
  </div>
);

// ─── File Upload Row ──────────────────────────────────────────────────────────

const FileUploadRow = ({ label, required, fileKey, files, onChange, highlight, countdown }: {
  label: string; required?: boolean; fileKey: string;
  files: Record<string, File | null>;
  onChange: (key: string, file: File | null) => void;
  highlight?: boolean;
  countdown?: number | null;
}) => {
  const file = files[fileKey];
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border-2 transition
      ${file ? 'border-school-green bg-green-50'
      : highlight ? 'border-amber-400 bg-amber-50 animate-pulse-slow'
      : required ? 'border-dashed border-red-300 bg-red-50/30'
      : 'border-dashed border-gray-300 bg-gray-50'}`}>
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
        ${file ? 'bg-school-green text-white' : 'bg-gray-200 text-gray-400'}`}>
        {file ? <CheckCircle size={16} /> : <Upload size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-700 leading-tight break-words">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className={`text-xs mt-0.5 truncate ${file ? 'text-school-green' : 'text-gray-400'}`}>
          {file ? file.name : 'No file chosen'}
        </div>
        {highlight && !file && countdown != null && countdown > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={11} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-600">
              Upload required within: {formatCountdown(countdown)}
            </span>
          </div>
        )}
        {highlight && !file && countdown != null && countdown <= 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <AlertTriangle size={11} className="text-red-600" />
            <span className="text-xs font-bold text-red-600">
              Deadline expired — application auto-rejected
            </span>
          </div>
        )}
      </div>
      <label className="shrink-0 text-xs font-bold text-school-green cursor-pointer hover:underline whitespace-nowrap">
        {file ? 'Change' : 'Upload'}
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={e => onChange(fileKey, e.target.files?.[0] ?? null)} />
      </label>
      {file && (
        <button type="button" onClick={() => onChange(fileKey, null)}
          className="shrink-0 text-gray-400 hover:text-red-500">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ─── Declaration PDF generator ────────────────────────────────────────────────

function downloadDeclarationForm(parentName: string, year: string, appNumber: string) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>HTL 03 – Boarding Bursary Declaration</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12pt; margin: 40px; line-height: 1.6; color: #111; }
  h2 { text-align:center; text-decoration:underline; }
  .label { font-weight:bold; }
  .line { border-bottom: 1px solid #000; display:inline-block; min-width:200px; }
  .sig-block { margin-top:40px; display:flex; gap:80px; }
  .sig-col { flex:1; }
  .sig-col .line { width:100%; display:block; margin-top:30px; }
  .stamp-box { border:1px solid #000; width:200px; height:100px; margin:20px 0; display:flex; align-items:center; justify-content:center; color:#aaa; font-size:10pt; }
  p { margin: 8px 0; }
  .section { margin: 24px 0; }
  .app-ref { background: #f0f4ff; border: 1px solid #c0ccee; border-radius: 6px; padding: 10px 16px; margin-bottom: 20px; font-size: 11pt; }
  @media print { body { margin: 20mm; } }
</style>
</head>
<body>
  <p style="text-align:right"><strong>HTL 03</strong></p>
  <p><strong>Province of the Eastern Cape – DEPARTMENT OF EDUCATION</strong><br/>
  Steve Vukile Tshwete Education Complex * Zone 6* Zwelitsha * Private Bag X0032 * Bhisho * 5605<br/>
  Tel: +27 (0)40 608 4342/4042 &nbsp; Fax: 040-6084485</p>
  <hr/>

  <div class="app-ref">
    <strong>Application Reference Number:</strong> ${appNumber}<br/>
    <strong>Year:</strong> ${year}<br/>
    <strong>Parent/Guardian:</strong> ${parentName || '___________________________'}
  </div>

  <h2>APPLICATION FOR A BOARDING BURSARY FOR THE YEAR: ${year}</h2>

  <div class="section">
    <p><strong>7. DECLARATION BY PARENT / GUARDIAN</strong></p>
    <p>I (Surname and full name(s)): <span class="line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
    <p>hereby solemnly declare that I, without the assistance for which I am applying, will not be in a position to provide for the education of the child(ren) mentioned in paragraph 4 and that I have not withheld any information regarding my circumstances and that all information given on this application form is correct. I accept that if at any stage it is established that the information given by me is incorrect, all financial assistance will be withdrawn and the amount of such assistance already paid to me, shall be recovered from me.</p>

    <div class="sig-block">
      <div class="sig-col">
        <p class="label">SURNAME &amp; NAME</p>
        <div class="line"></div>
      </div>
      <div class="sig-col">
        <p class="label">SIGNATURE</p>
        <div class="line"></div>
      </div>
      <div class="sig-col">
        <p class="label">DATE</p>
        <div class="line"></div>
      </div>
    </div>

    <p style="margin-top:20px">The declarer hereby pledges that he/she is fully conversant with the contents of this declaration and understands it.</p>
    <p>SWORN BEFORE ME AT _________________________ ON THE ______ DAY OF _____________ YEAR _______</p>

    <div class="stamp-box">OFFICIAL STAMP</div>

    <div class="sig-block">
      <div class="sig-col">
        <p class="label">COMMISSIONER OF OATHS</p>
        <div class="line"></div>
      </div>
      <div class="sig-col">
        <p class="label">DATE</p>
        <div class="line"></div>
      </div>
    </div>
  </div>

  <hr/>
  <p style="font-size:10pt;color:#555;margin-top:30px">
    <strong>Instructions:</strong> Print this form. Take it to your nearest Police Station or Commissioner of Oaths. 
    Sign in their presence. Have it stamped with the official stamp. Scan or photograph the completed form and 
    upload it back on the online application portal within <strong>24 hours</strong> using Application Reference: <strong>${appNumber}</strong>.
  </p>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `HTL03_Declaration_${appNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function required(val: string, name: string): string | null {
  return val.trim() ? null : `${name} is required`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Boarding = () => {
  const [phase, setPhase] = useState<'boarding' | 'boardingComplete' | 'bursary' | 'allDone'>('boarding');
  const [bursaryStep, setBursaryStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [undertaking, setUndertaking] = useState(false);
  const [appNumber] = useState(generateApplicationNumber);

  // Declaration 24h countdown
  const [declDeadline, setDeclDeadline] = useState<number | null>(getDeclarationDeadline);
  const declCountdown = useDeclCountdown(declDeadline);
  const declExpired = declDeadline != null && declCountdown <= 0;
  const declRef = useRef<HTMLDivElement>(null);

  // ── HTL 02 – Learner details ─────────────────────────────────────────────

  const [learner, setL] = useState({
    surnameAndName: '',
    homeAddress: '',
    schoolNameAndAddress: 'Mvenyane SSS, Mvenyane A/A, Cedarville 4720 (Girls Hostel)',
    currentGrade: '',
    gender: '',
    healthStatus: 'good' as 'good' | 'fair' | 'bad',
    healthProblems: '',
    idNumber: '',
    dob: '',
    distanceHomeToSchool: '',
    year: new Date().getFullYear().toString(),
    admissionNo: appNumber, // auto-generated
    medicalAidName: '',
    medicalAidNumber: '',
    allergiesAndDietaryInfo: '',
  });

  const learnerAge = useMemo(() => getAgeFromDob(learner.dob), [learner.dob]);
  const gradeMaxAge = learner.currentGrade ? GRADE_MAX_AGE[learner.currentGrade] : null;

  // ── Parent/Guardian ──────────────────────────────────────────────────────

  const [father, setFather] = useState({
    surname: '', name: '', relationship: 'Father/Guardian', homeAddress: '',
    telHome: '', telWork: '', cellphone: '',
    nameOfEmployer: '', addressOfEmployer: '', occupation: '', salaryIncome: '',
  });

  const [mother, setMother] = useState({
    surname: '', name: '', relationship: 'Mother/Relative', homeAddress: '',
    telHome: '', telWork: '', cellphone: '',
    nameOfEmployer: '', addressOfEmployer: '', occupation: '', salaryIncome: '',
  });

  const [doctor, setDoctor] = useState({
    name: '', telephone: '', address: '',
  });

  // ── Bursary / HTL 03 ─────────────────────────────────────────────────────

  const [guardian, setGuardian] = useState({
    surname: '', fullNames: '',
    postalAddress: '', postalCode: '',
    homeAddress: '', homeCode: '',
    telHome: '', telHomeCode: '',
    telWork: '', telWorkCode: '',
    gender: '', maritalStatus: '',
    surnameDiffersReason: '',
  });

  const [children, setChildren] = useState([
    { surname: '', firstName: '', dob: '', grade: '', school: '' },
    { surname: '', firstName: '', dob: '', grade: '', school: '' },
  ]);

  const [otherChildren, setOtherChildren] = useState([
    { surname: '', firstName: '', dob: '', reason: '' },
    { surname: '', firstName: '', dob: '', reason: '' },
  ]);

  const [income, setIncome] = useState({
    motherEmployer: '', motherEmployerTel: '', motherIncomeType: '', motherGrossIncome: '',
    fatherEmployer: '', fatherEmployerTel: '', fatherIncomeType: '', fatherGrossIncome: '',
    guardianEmployer: '', guardianEmployerTel: '', guardianIncomeType: '', guardianGrossIncome: '',
  });

  const [distances, setDistances] = useState({
    distanceToAppliedSchool: '',
    nearestSchoolName: '',
    nearestSchoolDistance: '',
    nearestHostelSchoolName: '',
    nearestHostelSchoolDistance: '',
    reasonNotAttendingNearest: '',
    bursaryRequiredFrom: '',
  });

  // ── Patch helpers ─────────────────────────────────────────────────────────

  const patchL   = (k: string, v: string) => { setL(p => ({ ...p, [k]: v })); setFieldErrors(e => ({ ...e, [k]: '' })); };
  const patchF   = (k: string, v: string) => { setFather(p => ({ ...p, [k]: v })); setFieldErrors(e => ({ ...e, [`father_${k}`]: '' })); };
  const patchM   = (k: string, v: string) => setMother(p => ({ ...p, [k]: v }));
  const patchD   = (k: string, v: string) => setDoctor(p => ({ ...p, [k]: v }));
  const patchG   = (k: string, v: string) => { setGuardian(p => ({ ...p, [k]: v })); setFieldErrors(e => ({ ...e, [`g_${k}`]: '' })); };
  const patchInc = (k: string, v: string) => setIncome(p => ({ ...p, [k]: v }));
  const patchDis = (k: string, v: string) => setDistances(p => ({ ...p, [k]: v }));

  const patchChild = (i: number, k: string, v: string) =>
    setChildren(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const patchOtherChild = (i: number, k: string, v: string) =>
    setOtherChildren(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));

  const handleFileChange = (key: string, file: File | null) => {
    setFiles(p => ({ ...p, [key]: file }));
    // If they upload the declaration, clear expired state
    if (key === 'declarationSigned' && file) {
      clearDeclarationDeadline();
      setDeclDeadline(null);
    }
  };

  // ── HTL 02 uploads ────────────────────────────────────────────────────────

  const htl02Uploads = [
    { key: 'learnerBirthCert', label: 'Learner Birth Certificate', required: true },
    { key: 'parentIdCopy',     label: "Parent's / Guardian's ID Copy", required: true },
  ];

  // ── HTL 03 uploads ────────────────────────────────────────────────────────

  const htl03Uploads = [
    { key: 'bursary_learnerBirthCert', label: 'Learner Birth Certificate', required: true },
    { key: 'bursary_parentId',         label: "Parent's ID Copy", required: true },
    { key: 'sassaConfirmation',        label: 'SASSA Confirmation Letter', required: true },
    { key: 'indigentChief',            label: 'Indigent Letter from the Chief', required: true },
    { key: 'indigentCounselor',        label: 'Indigent Letter from the Counsellor', required: true },
    { key: 'declarationSigned',        label: 'Signed & Stamped Declaration (HTL 03 Section 7 – Commissioner of Oaths)', required: false },
  ];

  const missingHTL02 = htl02Uploads.filter(f => f.required && !files[f.key]);
  const missingHTL03Required = htl03Uploads.filter(f => f.required && !files[f.key]);

  // ── Grade / age validation ────────────────────────────────────────────────

  const gradeAgeError = useMemo(() => {
    if (!learner.currentGrade || learner.currentGrade === '') return null;
    if (!ALLOWED_GRADES.includes(learner.currentGrade)) return 'Grade 12 applications are not accepted.';
    if (learnerAge === null) return null;
    const max = GRADE_MAX_AGE[learner.currentGrade];
    if (max && learnerAge > max) {
      return `Learner is ${learnerAge} years old — maximum age for Grade ${learner.currentGrade} is ${max}.`;
    }
    return null;
  }, [learner.currentGrade, learnerAge]);

  // ── Validate boarding ─────────────────────────────────────────────────────

  const validateBoarding = (): boolean => {
    const errs: Record<string, string> = {};

    if (!learner.surnameAndName.trim()) errs['surnameAndName'] = 'Learner name is required';
    if (!learner.currentGrade) errs['currentGrade'] = 'Grade is required';
    if (!learner.gender) errs['gender'] = 'Gender is required';
    if (!learner.dob) errs['dob'] = 'Date of birth is required';
    if (!learner.homeAddress.trim()) errs['homeAddress'] = 'Home address is required';
    if (!learner.distanceHomeToSchool) errs['distanceHomeToSchool'] = 'Distance is required';
    if (!learner.healthStatus) errs['healthStatus'] = 'Health status is required';

    if (gradeAgeError) errs['gradeAge'] = gradeAgeError;

    if (!father.surname.trim()) errs['father_surname'] = 'Surname required';
    if (!father.name.trim()) errs['father_name'] = 'Name required';
    if (!father.cellphone.trim()) errs['father_cellphone'] = 'Cell number required';
    if (!father.homeAddress.trim()) errs['father_homeAddress'] = 'Address required';
    if (!father.occupation.trim()) errs['father_occupation'] = 'Occupation required';
    if (!father.salaryIncome.trim()) errs['father_salaryIncome'] = 'Salary/Income required';

    if (missingHTL02.length > 0) errs['uploads'] = `Please upload: ${missingHTL02.map(f => f.label).join(', ')}`;
    if (!undertaking) errs['undertaking'] = 'Please accept the undertaking to continue';

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Please complete all required fields before submitting.');
      return false;
    }
    setError('');
    return true;
  };

  // ── Validate bursary step ─────────────────────────────────────────────────

  const validateBursaryStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (bursaryStep === 1) {
      if (!guardian.surname.trim()) errs['g_surname'] = 'Surname required';
      if (!guardian.fullNames.trim()) errs['g_fullNames'] = 'Full names required';
      if (!guardian.homeAddress.trim()) errs['g_homeAddress'] = 'Home address required';
      if (!guardian.gender) errs['g_gender'] = 'Gender required';
      if (!guardian.maritalStatus) errs['g_maritalStatus'] = 'Marital status required';
      if (!children[0].surname.trim()) errs['child0_surname'] = 'Child surname required';
      if (!children[0].firstName.trim()) errs['child0_firstName'] = 'Child first name required';
      if (!children[0].grade.trim()) errs['child0_grade'] = 'Child grade required';
      if (!children[0].school.trim()) errs['child0_school'] = 'Child school required';
      if (!distances.distanceToAppliedSchool) errs['distanceToAppliedSchool'] = 'Distance required';
      if (!distances.reasonNotAttendingNearest.trim()) errs['reasonNotAttendingNearest'] = 'Reason required';
    }
    if (bursaryStep === 2) {
      if (missingHTL03Required.length > 0) {
        errs['bursary_uploads'] = `Please upload all required documents: ${missingHTL03Required.map(f => f.label).join(', ')}`;
      }
      // Declaration: submit is allowed if not uploaded (pending) OR if uploaded
      // If deadline expired and no file, warn
      if (declExpired && !files['declarationSigned']) {
        errs['decl_expired'] = 'Declaration deadline has expired — this application will be auto-rejected unless you upload now.';
      }
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Please complete all required fields before continuing.');
      return false;
    }
    setError('');
    return true;
  };

  const goBursaryNext = () => { if (validateBursaryStep()) setBursaryStep(s => (s < 2 ? (s + 1) as 1|2 : s)); };
  const goBursaryBack = () => { setError(''); setFieldErrors({}); setBursaryStep(s => (s > 1 ? (s - 1) as 1|2 : s)); };

  const saveApplication = async (includeBursary: boolean) => {
    setSubmitting(true);
    try {
      const uploads: UploadedFile[] = [];
      const allUploadFields = includeBursary ? [...htl02Uploads, ...htl03Uploads] : htl02Uploads;
      for (const field of allUploadFields) {
        const file = files[field.key];
        if (!file) continue;
        const dataUrl = await fileToDataUrl(file);
        uploads.push({ key: field.key, label: field.label, fileName: file.name, mimeType: file.type || 'application/octet-stream', dataUrl });
      }
      const nameParts = learner.surnameAndName.split(' ');
      const app: Application = {
        id: generateId(),
        firstName:          nameParts.slice(1).join(' ') || learner.surnameAndName,
        lastName:           nameParts[0] || '',
        dob:                learner.dob,
        gender:             learner.gender,
        grade:              `Grade ${learner.currentGrade}`,
        year:               learner.year,
        studentNumber:      generateStudentNumber(learner.year),
        guardianName:       `${father.name} ${father.surname}`.trim(),
        guardianRelationship: father.relationship || 'Father/Guardian',
        guardianPhone:      father.cellphone || father.telHome || '',
        guardianEmail:      '',
        address:            learner.homeAddress,
        locality:           '',
        previousSchool:     '',
        lastGradeCompleted: '',
        medicalInfo:        learner.healthProblems || learner.allergiesAndDietaryInfo,
        applicationType:    includeBursary ? 'Boarding + Bursary' : 'Boarding',
        uploads,
        subjectMarks: [],
        averageMark:  0,
        status:       (includeBursary && declExpired && !files['declarationSigned']) ? 'Rejected' : 'Pending',
        submittedDate: todayISO(),
      };
      setApplications([app, ...getApplications()]);
      return true;
    } catch {
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleBoardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBoarding()) return;
    const ok = await saveApplication(false);
    if (ok) setPhase('boardingComplete');
  };

  const handleBursarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBursaryStep()) return;
    const ok = await saveApplication(true);
    if (ok) {
      clearDeclarationDeadline();
      setPhase('allDone');
    }
  };

  // ─── Success screens ───────────────────────────────────────────────────────

  if (phase === 'boardingComplete') {
    return (
      <div className="py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center p-10 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-lg"
        >
          <div className="w-20 h-20 bg-green-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Boarding Application Submitted!</h2>
          <p className="text-xs font-mono text-gray-400 mb-4">Ref: {appNumber}</p>
          <p className="text-gray-600 mb-8">
            Your HTL 02 hostel admission application has been received. The school will be in contact shortly.
          </p>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <BedDouble size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-lg mb-2">Do you qualify for a bursary?</h3>
                <p className="text-sm text-amber-800 mb-4 leading-relaxed">
                  If you meet the requirements for a boarding bursary (HTL 03), you can apply now.
                  Bursaries are subject to eligibility criteria set by the Eastern Cape Department of Education.
                </p>
                <button
                  type="button"
                  onClick={() => { setPhase('bursary'); setError(''); setFieldErrors({}); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition shadow"
                >
                  <FileText size={16} /> Apply for a Bursary
                </button>
              </div>
            </div>
          </div>

          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  if (phase === 'allDone') {
    const wasRejected = declExpired && !files['declarationSigned'];
    return (
      <div className="py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center p-10 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-md"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${wasRejected ? 'bg-red-100 text-red-600' : 'bg-green-100 text-school-green'}`}>
            {wasRejected ? <AlertTriangle size={48} /> : <CheckCircle size={48} />}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {wasRejected ? 'Bursary Application Rejected' : 'Boarding & Bursary Submitted!'}
          </h2>
          <p className="text-xs font-mono text-gray-400 mb-4">Ref: {appNumber}</p>
          <p className="text-gray-600 mb-8">
            {wasRejected
              ? 'Your bursary application was auto-rejected because the signed declaration form was not uploaded within 24 hours. Please contact the school.'
              : 'Your HTL 02 hostel admission and HTL 03 bursary applications have been received. The school will be in contact shortly.'}
          </p>
          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  // ─── Main form render ─────────────────────────────────────────────────────

  return (
    <div className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Boarding Application</h1>

        {/* App number badge */}
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold uppercase tracking-wide">Application Ref:</span>
          <span className="font-mono bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-700">{appNumber}</span>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            {phase === 'boarding' ? (
              <><strong>HTL 02</strong> – Application for Admission to a Hostel. Fields marked <span className="text-red-500">*</span> are required.</>
            ) : (
              <><strong>HTL 03</strong> – Application for a Boarding Bursary. All required documents must be uploaded.</>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-school-green px-6 sm:px-8 py-7 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {phase === 'boarding' ? 'Hostel Admission (HTL 02)' : 'Bursary Application (HTL 03)'}
                </h2>
                <p className="text-white/70 text-sm mt-1">Province of the Eastern Cape – Dept. of Education</p>
              </div>
              <div className="text-right text-xs text-white/60 leading-relaxed shrink-0">
                <div>Year: {learner.year}</div>
                {phase === 'bursary' && <div>Step {bursaryStep} of 2</div>}
              </div>
            </div>

            {phase === 'bursary' && (
              <>
                <div className="relative h-1.5 bg-white/20 rounded-full mb-5 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    animate={{ width: `${bursaryStep === 1 ? 50 : 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="flex flex-wrap gap-5">
                  <StepBadge num={1} label="Bursary Details"        active={bursaryStep === 1} done={bursaryStep > 1} />
                  <StepBadge num={2} label="Declaration & Documents" active={bursaryStep === 2} done={false} />
                </div>
              </>
            )}
          </div>

          {/* Form body */}
          <form onSubmit={phase === 'boarding' ? handleBoardingSubmit : handleBursarySubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={phase === 'boarding' ? 'boarding' : `bursary-${bursaryStep}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="p-5 sm:p-8 space-y-10"
              >

                {/* ═══════════ BOARDING – HTL 02 ═══════════ */}
                {phase === 'boarding' && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium">
                      HTL 02 · All fields marked <span className="text-red-500">*</span> are compulsory. The form cannot be submitted without complete information.
                    </div>

                    {/* Grade / Age errors banner */}
                    {gradeAgeError && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{gradeAgeError}</span>
                      </div>
                    )}

                    {/* Section 1: Learner */}
                    <section>
                      <SectionHeading title="1. Learner Details" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <Field label="Application / Admission No">
                          <input className={inp + ' bg-gray-50 text-gray-500 font-mono text-xs'} value={appNumber} readOnly />
                          <span className="text-xs text-gray-400">Auto-generated</span>
                        </Field>

                        <Field label="Year" required>
                          <select className={sel} value={learner.year} onChange={e => patchL('year', e.target.value)}>
                            {['2025','2026','2027','2028'].map(y => <option key={y}>{y}</option>)}
                          </select>
                        </Field>

                        <div /> {/* spacer */}

                        <Field label="Surname & Full Names of Applicant" required className="sm:col-span-2" error={fieldErrors['surnameAndName']}>
                          <input className={inp} value={learner.surnameAndName} onChange={e => patchL('surnameAndName', e.target.value)} placeholder="Surname, First Names" />
                        </Field>

                        <Field label="ID Number">
                          <input className={inp} value={learner.idNumber} onChange={e => patchL('idNumber', e.target.value)} />
                        </Field>

                        <Field label="Date of Birth" required error={fieldErrors['dob']}>
                          <input type="date" className={inp} value={learner.dob} onChange={e => patchL('dob', e.target.value)} />
                          {learnerAge !== null && <span className="text-xs text-gray-500">Age: {learnerAge}</span>}
                        </Field>

                        <Field label="Grade Applied For" required error={fieldErrors['currentGrade'] || fieldErrors['gradeAge']}>
                          <select className={sel} value={learner.currentGrade} onChange={e => patchL('currentGrade', e.target.value)}>
                            <option value="">Select grade</option>
                            {ALLOWED_GRADES.map(g => (
                              <option key={g} value={g}>Grade {g}</option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Gender" required error={fieldErrors['gender']}>
                          <select className={sel} value={learner.gender} onChange={e => patchL('gender', e.target.value)}>
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </Field>

                        <Field label="Health Status" required error={fieldErrors['healthStatus']}>
                          <select className={sel} value={learner.healthStatus} onChange={e => patchL('healthStatus', e.target.value as any)}>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="bad">Bad</option>
                          </select>
                        </Field>

                        <Field label="Home Address" required className="sm:col-span-2" error={fieldErrors['homeAddress']}>
                          <input className={inp} value={learner.homeAddress} onChange={e => patchL('homeAddress', e.target.value)} />
                        </Field>

                        <Field label="Distance from Home to School (km)" required error={fieldErrors['distanceHomeToSchool']}>
                          <input className={inp} type="number" min={0} value={learner.distanceHomeToSchool} onChange={e => patchL('distanceHomeToSchool', e.target.value)} />
                        </Field>

                        <Field label="School Name & Address" className="sm:col-span-2">
                          <input className={inp} value={learner.schoolNameAndAddress} onChange={e => patchL('schoolNameAndAddress', e.target.value)} />
                        </Field>

                        <Field label="Any Health Problems (describe below)" className="sm:col-span-3">
                          <textarea className={inp + ' resize-none'} rows={2} value={learner.healthProblems} onChange={e => patchL('healthProblems', e.target.value)} placeholder="List any known medical conditions, allergies, or health problems" />
                        </Field>
                      </div>
                    </section>

                    {/* Section 8: Parent/Guardian table */}
                    <section>
                      <SectionHeading title="8. Parent / Guardian Details" />

                      {/* Field errors for father */}
                      {(fieldErrors['father_surname'] || fieldErrors['father_name'] || fieldErrors['father_cellphone'] || fieldErrors['father_homeAddress'] || fieldErrors['father_occupation'] || fieldErrors['father_salaryIncome']) && (
                        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                          Please complete all required fields for Father / Guardian (marked below).
                        </div>
                      )}

                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm" style={{ minWidth: '600px' }}>
                          <thead>
                            <tr>
                              <th className="text-left px-3 py-2 bg-gray-100 text-xs font-bold text-gray-600 uppercase w-44 whitespace-nowrap">Field</th>
                              <th className="text-left px-3 py-2 bg-school-green/10 text-xs font-bold text-school-green uppercase">
                                Father / Guardian <span className="text-red-500">*</span>
                              </th>
                              <th className="text-left px-3 py-2 bg-blue-50 text-xs font-bold text-blue-600 uppercase">Mother / Relative</th>
                            </tr>
                          </thead>
                          <tbody>
                            {([
                              ['surname',      'Surname', true],
                              ['name',         'Name', true],
                              ['relationship', 'Relationship', false],
                            ] as [keyof typeof father, string, boolean][]).map(([k, lbl, req]) => (
                              <tr key={k} className="border-t border-gray-100">
                                <td className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 whitespace-nowrap">{lbl}{req && <span className="text-red-500">*</span>}</td>
                                <td className="px-2 py-1.5">
                                  <input className={`${inp} ${fieldErrors[`father_${k}`] ? 'border-red-400 bg-red-50' : ''}`} value={father[k]} onChange={e => patchF(k, e.target.value)} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input className={inp} value={mother[k as keyof typeof mother]} onChange={e => patchM(k, e.target.value)} />
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-100">
                              <td className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 whitespace-nowrap">Home Address<span className="text-red-500">*</span></td>
                              <td className="px-2 py-1.5">
                                <textarea className={`${inp + ' resize-none'} ${fieldErrors['father_homeAddress'] ? 'border-red-400 bg-red-50' : ''}`} rows={2} value={father.homeAddress} onChange={e => patchF('homeAddress', e.target.value)} />
                              </td>
                              <td className="px-2 py-1.5">
                                <textarea className={inp + ' resize-none'} rows={2} value={mother.homeAddress} onChange={e => patchM('homeAddress', e.target.value)} />
                              </td>
                            </tr>
                            {([
                              ['telHome',    'Telephone (H)',        false],
                              ['telWork',    'Telephone (W)',        false],
                              ['cellphone',  'Cellphone Number',     true],
                              ['nameOfEmployer',    'Name of Employer',    false],
                              ['addressOfEmployer', 'Address of Employer', false],
                              ['occupation',  'Occupation',          true],
                              ['salaryIncome','Salary / Income',     true],
                            ] as [keyof typeof father, string, boolean][]).map(([k, lbl, req]) => (
                              <tr key={k} className="border-t border-gray-100">
                                <td className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 whitespace-nowrap">
                                  {lbl}{req && <span className="text-red-500">*</span>}
                                  {k === 'salaryIncome' && <span className="block text-gray-400 font-normal">(Attach salary advice)</span>}
                                </td>
                                <td className="px-2 py-1.5">
                                  <input className={`${inp} ${fieldErrors[`father_${k}`] ? 'border-red-400 bg-red-50' : ''}`} value={father[k]} onChange={e => patchF(k, e.target.value)} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input className={inp} value={mother[k as keyof typeof mother]} onChange={e => patchM(k, e.target.value)} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 9-11: Doctor */}
                    <section>
                      <SectionHeading title="9–11. Doctor Details" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Name of Doctor">
                          <input className={inp} value={doctor.name} onChange={e => patchD('name', e.target.value)} />
                        </Field>
                        <Field label="Telephone">
                          <input className={inp} type="tel" value={doctor.telephone} onChange={e => patchD('telephone', e.target.value)} />
                        </Field>
                        <Field label="Address">
                          <input className={inp} value={doctor.address} onChange={e => patchD('address', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Section 12: Medical & Dietary */}
                    <section>
                      <SectionHeading title="12. Medical Aid & Dietary Information" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Medical Aid Name">
                          <input className={inp} value={learner.medicalAidName} onChange={e => patchL('medicalAidName', e.target.value)} />
                        </Field>
                        <Field label="Medical Aid Number">
                          <input className={inp} value={learner.medicalAidNumber} onChange={e => patchL('medicalAidNumber', e.target.value)} />
                        </Field>
                        <Field label="Allergies / Dietary Requirements / Medical Conditions" className="sm:col-span-2">
                          <textarea className={inp + ' resize-none'} rows={3} value={learner.allergiesAndDietaryInfo} onChange={e => patchL('allergiesAndDietaryInfo', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Document Uploads – HTL 02 */}
                    <section>
                      <SectionHeading title="Required Documents – HTL 02" />
                      {fieldErrors['uploads'] && (
                        <p className="text-xs text-red-500 mb-2">{fieldErrors['uploads']}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {htl02Uploads.map(f => (
                          <FileUploadRow key={f.key} label={f.label} required={f.required} fileKey={f.key} files={files} onChange={handleFileChange} />
                        ))}
                      </div>
                    </section>

                    {/* Undertaking */}
                    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-3">
                        Undertaking by Parent / Guardian / Responsible Person <span className="text-red-500">*</span>
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">I, the undersigned, hereby undertake to:</p>
                      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1.5 mb-5 ml-2">
                        <li>Pay the prescribed boarding fee every term in advance.</li>
                        <li>Give a term's notice before terminating my child's residence at the hostel.</li>
                        <li>Pay all damages to hostel property incurred by my child.</li>
                        <li>Abide by all hostel rules and regulations, set out to and for me and my child.</li>
                      </ol>
                      <label className={`flex items-start gap-3 cursor-pointer group ${fieldErrors['undertaking'] ? 'text-red-600' : ''}`}>
                        <input type="checkbox" checked={undertaking}
                          onChange={e => { setUndertaking(e.target.checked); setFieldErrors(er => ({ ...er, undertaking: '' })); }}
                          className="mt-0.5 w-4 h-4 accent-school-green cursor-pointer" />
                        <span className="text-sm group-hover:text-gray-900">
                          I accept and agree to the above undertaking as the parent/guardian of the applicant.
                        </span>
                      </label>
                      {fieldErrors['undertaking'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['undertaking']}</p>}
                    </section>
                  </>
                )}

                {/* ═══════════ BURSARY STEP 1 – Details ═══════════ */}
                {phase === 'bursary' && bursaryStep === 1 && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium">
                      HTL 03 · All children from one family at the same school must be on one form. Fields marked <span className="text-red-500">*</span> are required.
                    </div>

                    {/* Section 3: Guardian Particulars */}
                    <section>
                      <SectionHeading title="Section 3 – Particulars of Parent / Guardian" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Surname" required error={fieldErrors['g_surname']}>
                          <input className={`${inp} ${fieldErrors['g_surname'] ? 'border-red-400' : ''}`} value={guardian.surname} onChange={e => patchG('surname', e.target.value)} />
                        </Field>
                        <Field label="Full Names" required error={fieldErrors['g_fullNames']}>
                          <input className={`${inp} ${fieldErrors['g_fullNames'] ? 'border-red-400' : ''}`} value={guardian.fullNames} onChange={e => patchG('fullNames', e.target.value)} />
                        </Field>
                        <div />
                        <Field label="Postal Address" className="sm:col-span-2" error={fieldErrors['g_postalAddress']}>
                          <input className={inp} value={guardian.postalAddress} onChange={e => patchG('postalAddress', e.target.value)} />
                        </Field>
                        <Field label="Postal Code">
                          <input className={inp} value={guardian.postalCode} onChange={e => patchG('postalCode', e.target.value)} maxLength={6} />
                        </Field>
                        <Field label="Home Address" required className="sm:col-span-2" error={fieldErrors['g_homeAddress']}>
                          <input className={`${inp} ${fieldErrors['g_homeAddress'] ? 'border-red-400' : ''}`} value={guardian.homeAddress} onChange={e => patchG('homeAddress', e.target.value)} />
                        </Field>
                        <Field label="Home Code">
                          <input className={inp} value={guardian.homeCode} onChange={e => patchG('homeCode', e.target.value)} maxLength={6} />
                        </Field>
                        <Field label="Tel (Home) Code">
                          <input className={inp} value={guardian.telHomeCode} onChange={e => patchG('telHomeCode', e.target.value)} />
                        </Field>
                        <Field label="Tel (Home)">
                          <input className={inp} type="tel" value={guardian.telHome} onChange={e => patchG('telHome', e.target.value)} />
                        </Field>
                        <Field label="Tel (Work) Code">
                          <input className={inp} value={guardian.telWorkCode} onChange={e => patchG('telWorkCode', e.target.value)} />
                        </Field>
                        <Field label="Tel (Work)">
                          <input className={inp} type="tel" value={guardian.telWork} onChange={e => patchG('telWork', e.target.value)} />
                        </Field>
                        <div />
                        <Field label="Gender" required error={fieldErrors['g_gender']}>
                          <select className={`${sel} ${fieldErrors['g_gender'] ? 'border-red-400' : ''}`} value={guardian.gender} onChange={e => patchG('gender', e.target.value)}>
                            <option value="">Select</option><option>Male</option><option>Female</option>
                          </select>
                        </Field>
                        <Field label="Marital Status" required error={fieldErrors['g_maritalStatus']}>
                          <select className={`${sel} ${fieldErrors['g_maritalStatus'] ? 'border-red-400' : ''}`} value={guardian.maritalStatus} onChange={e => patchG('maritalStatus', e.target.value)}>
                            <option value="">Select</option>
                            <option>Married</option><option>Single</option><option>Divorced</option><option>Widow(er)</option>
                          </select>
                        </Field>
                        <Field label="If Surname Differs from Child's, Explain" className="sm:col-span-2">
                          <input className={inp} value={guardian.surnameDiffersReason} onChange={e => patchG('surnameDiffersReason', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Section 4: Children – improved table */}
                    <section>
                      <SectionHeading title="Section 4 – Particulars of Children (Application Made For)" />
                      <div className="space-y-4">
                        {children.map((c, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Child {i + 1}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <Field label="Surname" required={i === 0} error={i === 0 ? fieldErrors['child0_surname'] : undefined}>
                                <input className={`${inp} ${i === 0 && fieldErrors['child0_surname'] ? 'border-red-400' : ''}`}
                                  value={c.surname} onChange={e => patchChild(i, 'surname', e.target.value)}
                                  placeholder="Child surname" />
                              </Field>
                              <Field label="First Name(s)" required={i === 0} error={i === 0 ? fieldErrors['child0_firstName'] : undefined}>
                                <input className={`${inp} ${i === 0 && fieldErrors['child0_firstName'] ? 'border-red-400' : ''}`}
                                  value={c.firstName} onChange={e => patchChild(i, 'firstName', e.target.value)}
                                  placeholder="First name(s)" />
                              </Field>
                              <Field label="Date of Birth">
                                <input type="date" className={inp} value={c.dob} onChange={e => patchChild(i, 'dob', e.target.value)} />
                              </Field>
                              <Field label="Grade" required={i === 0} error={i === 0 ? fieldErrors['child0_grade'] : undefined}>
                                <select className={`${sel} ${i === 0 && fieldErrors['child0_grade'] ? 'border-red-400' : ''}`}
                                  value={c.grade} onChange={e => patchChild(i, 'grade', e.target.value)}>
                                  <option value="">Select grade</option>
                                  {ALLOWED_GRADES.map(g => <option key={g}>Grade {g}</option>)}
                                </select>
                              </Field>
                              <Field label="School" required={i === 0} error={i === 0 ? fieldErrors['child0_school'] : undefined} className="sm:col-span-2">
                                <input className={`${inp} ${i === 0 && fieldErrors['child0_school'] ? 'border-red-400' : ''}`}
                                  value={c.school} onChange={e => patchChild(i, 'school', e.target.value)}
                                  placeholder="School name" />
                              </Field>
                            </div>
                          </div>
                        ))}
                        <button type="button"
                          onClick={() => setChildren(p => [...p, { surname:'',firstName:'',dob:'',grade:'',school:'' }])}
                          className="text-xs text-school-green font-semibold hover:underline">
                          + Add another child
                        </button>
                      </div>
                    </section>

                    {/* Other dependent children */}
                    <section>
                      <SectionHeading title="Other Children Dependent on Parent / Guardian" />
                      <div className="space-y-3">
                        {otherChildren.map((c, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Other Child {i + 1}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <Field label="Surname">
                                <input className={inp} value={c.surname} onChange={e => patchOtherChild(i, 'surname', e.target.value)} />
                              </Field>
                              <Field label="First Names">
                                <input className={inp} value={c.firstName} onChange={e => patchOtherChild(i, 'firstName', e.target.value)} />
                              </Field>
                              <Field label="Date of Birth">
                                <input type="date" className={inp} value={c.dob} onChange={e => patchOtherChild(i, 'dob', e.target.value)} />
                              </Field>
                              <Field label="Reason for Dependence">
                                <input className={inp} value={c.reason} onChange={e => patchOtherChild(i, 'reason', e.target.value)} />
                              </Field>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section 5: Income */}
                    <section>
                      <SectionHeading title="Section 5 – Details of Income" />
                      {(['Mother','Father','Guardian'] as const).map(person => {
                        const prefix = person.toLowerCase() as 'mother' | 'father' | 'guardian';
                        return (
                          <div key={person} className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">{person}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <Field label="Name of Employer">
                                <input className={inp} value={income[`${prefix}Employer` as keyof typeof income]} onChange={e => patchInc(`${prefix}Employer`, e.target.value)} />
                              </Field>
                              <Field label="Employer Telephone">
                                <input className={inp} type="tel" value={income[`${prefix}EmployerTel` as keyof typeof income]} onChange={e => patchInc(`${prefix}EmployerTel`, e.target.value)} />
                              </Field>
                              <Field label="Type of Income">
                                <select className={sel} value={income[`${prefix}IncomeType` as keyof typeof income]} onChange={e => patchInc(`${prefix}IncomeType`, e.target.value)}>
                                  <option value="">Select</option>
                                  <option>Salary</option><option>Pension</option><option>Disability Grant</option>
                                  <option>Child Support Grant</option><option>Unemployed</option><option>Other</option>
                                </select>
                              </Field>
                              <Field label="Gross Income">
                                <input className={inp} placeholder="R 0.00" value={income[`${prefix}GrossIncome` as keyof typeof income]} onChange={e => patchInc(`${prefix}GrossIncome`, e.target.value)} />
                              </Field>
                            </div>
                          </div>
                        );
                      })}
                    </section>

                    {/* Section 6: Distances */}
                    <section>
                      <SectionHeading title="Section 6 – Distances" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="6.1 Distance to School Applied For (km)" required error={fieldErrors['distanceToAppliedSchool']}>
                          <input className={`${inp} ${fieldErrors['distanceToAppliedSchool'] ? 'border-red-400' : ''}`} type="number" min={0} value={distances.distanceToAppliedSchool} onChange={e => patchDis('distanceToAppliedSchool', e.target.value)} />
                        </Field>
                        <Field label="6.2 Name of Nearest School">
                          <input className={inp} value={distances.nearestSchoolName} onChange={e => patchDis('nearestSchoolName', e.target.value)} />
                        </Field>
                        <Field label="6.3 Distance to Nearest School (km)">
                          <input className={inp} type="number" min={0} value={distances.nearestSchoolDistance} onChange={e => patchDis('nearestSchoolDistance', e.target.value)} />
                        </Field>
                        <Field label="6.4 Nearest School with Hostel">
                          <input className={inp} value={distances.nearestHostelSchoolName} onChange={e => patchDis('nearestHostelSchoolName', e.target.value)} />
                        </Field>
                        <Field label="6.5 Distance to Nearest Hostel School (km)">
                          <input className={inp} type="number" min={0} value={distances.nearestHostelSchoolDistance} onChange={e => patchDis('nearestHostelSchoolDistance', e.target.value)} />
                        </Field>
                        <Field label="6.7 Bursary Required From">
                          <input type="date" className={inp} value={distances.bursaryRequiredFrom} onChange={e => patchDis('bursaryRequiredFrom', e.target.value)} />
                        </Field>
                        <Field label="6.6 Reason(s) for Not Attending Nearest School / Hostel School" required className="sm:col-span-2" error={fieldErrors['reasonNotAttendingNearest']}>
                          <textarea className={`${inp + ' resize-none'} ${fieldErrors['reasonNotAttendingNearest'] ? 'border-red-400' : ''}`} rows={3} value={distances.reasonNotAttendingNearest} onChange={e => patchDis('reasonNotAttendingNearest', e.target.value)} placeholder="Attach letters as necessary" />
                        </Field>
                      </div>
                    </section>
                  </>
                )}

                {/* ═══════════ BURSARY STEP 2 – Declaration & Docs ═══════════ */}
                {phase === 'bursary' && bursaryStep === 2 && (
                  <>
                    {/* Download declaration */}
                    <section className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <Download size={22} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-blue-900 text-base mb-1">
                            Step 1 — Download &amp; Sign the HTL 03 Declaration (Section 7)
                          </h4>
                          <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                            The HTL 03 bursary application requires a declaration sworn before a <strong>Commissioner of Oaths</strong> (e.g. at your nearest Police Station).
                            Download the form below, print it, take it to be signed and stamped, then upload it back within <strong>24 hours</strong>.
                            Your application will be submitted now but the declaration must be uploaded before the deadline to avoid auto-rejection.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              downloadDeclarationForm(guardian.fullNames || 'Guardian', learner.year, appNumber);
                              if (!declDeadline) {
                                const deadline = setDeclarationDeadline();
                                setDeclDeadline(deadline);
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow"
                          >
                            <Download size={16} /> Download Declaration Form (HTL 03 Section 7)
                          </button>
                          <p className="text-xs text-blue-600 mt-3">
                            The form opens as HTML — open in your browser and print, or save as PDF.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Countdown warning */}
                    {declDeadline && !files['declarationSigned'] && (
                      <div ref={declRef} className={`flex items-start gap-3 rounded-xl p-4 border-2 ${declExpired ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                        {declExpired ? <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" /> : <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />}
                        <div>
                          <div className={`font-bold text-sm ${declExpired ? 'text-red-700' : 'text-amber-700'}`}>
                            {declExpired ? 'Declaration Deadline Expired' : 'Declaration Upload Deadline'}
                          </div>
                          <div className={`text-xs mt-0.5 ${declExpired ? 'text-red-600' : 'text-amber-600'}`}>
                            {declExpired
                              ? 'The 24-hour window has passed. Submitting now will auto-reject the bursary application. Please upload the signed form immediately or contact the school.'
                              : `You have ${formatCountdown(declCountdown)} remaining to upload the signed declaration. Your application will be submitted now and the bursary will be auto-rejected if not uploaded in time.`}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1.5">
                      <p className="font-bold">Instructions for HTL 03 (Section 1):</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Complete Sections 3–7 in full before downloading the declaration.</li>
                        <li>All children from one family at the same school must be on one form.</li>
                        <li>Attach proof of gross family income (salary slip / certified employer statement).</li>
                        <li>Pensioners must attach proof of old age pension or disability grant.</li>
                        <li>Section 7 must be certified by a Commissioner of Oaths (not the school principal).</li>
                        <li><strong>Applications not submitted by end of September will not be considered.</strong></li>
                        <li><strong>The signed declaration must be uploaded within 24 hours of downloading.</strong></li>
                      </ul>
                    </div>

                    {/* Document uploads – HTL 03 */}
                    <section>
                      <SectionHeading title="Step 2 — Upload All Supporting Documents" />
                      {fieldErrors['bursary_uploads'] && (
                        <p className="text-xs text-red-500 mb-2">{fieldErrors['bursary_uploads']}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {htl03Uploads.map(f => (
                          <FileUploadRow
                            key={f.key}
                            label={f.label}
                            required={f.required}
                            fileKey={f.key}
                            files={files}
                            onChange={handleFileChange}
                            highlight={f.key === 'declarationSigned' && !!declDeadline && !files['declarationSigned']}
                            countdown={f.key === 'declarationSigned' ? declCountdown : null}
                          />
                        ))}
                      </div>
                    </section>

                    {/* Qualifications notice */}
                    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-700 space-y-2">
                      <p className="font-black uppercase tracking-widest text-xs text-gray-600 mb-2">Bursary Qualifications (Section 2)</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Bursaries are not available for those outside the Province of the Eastern Cape.</li>
                        <li>Bursaries are not available for learners within 5 km of a suitable school.</li>
                        <li>Proof of guardianship required if the learner has a different surname.</li>
                      </ul>
                    </section>
                  </>
                )}

                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {phase === 'boarding' ? (
                    <>
                      <div />
                      <button type="submit" disabled={submitting || !!gradeAgeError}
                        className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow">
                        {submitting
                          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                          : <><CheckCircle size={16} /> Submit Boarding Application</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button"
                        onClick={bursaryStep === 1 ? () => { setPhase('boardingComplete'); setError(''); setFieldErrors({}); } : goBursaryBack}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                        <ChevronLeft size={16} /> Back
                      </button>

                      {bursaryStep < 2 ? (
                        <button type="button" onClick={goBursaryNext}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 transition shadow">
                          Next <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button type="submit" disabled={submitting}
                          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow">
                          {submitting
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                            : <><CheckCircle size={16} /> Submit Bursary Application</>}
                        </button>
                      )}
                    </>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          {phase === 'boarding' ? 'HTL 02' : 'HTL 03'} · Province of the Eastern Cape – Department of Education ·
          Application Ref: <span className="font-mono">{appNumber}</span>
        </p>
      </div>
    </div>
  );
};
