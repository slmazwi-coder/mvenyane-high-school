import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  CheckCircle,
  BedDouble,
  X,
  FileText,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import {
  generateId,
  generateStudentNumber,
  getApplications,
  setApplications,
  type Application,
  type UploadedFile,
} from '../admin/utils/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadField = { key: string; label: string; required?: boolean };

const uploadFields: UploadField[] = [
  { key: 'learnerId',     label: 'Copy of Birth Certificate / ID',                    required: true },
  { key: 'reportCard',    label: 'Progress Report from Previous School',              required: true },
  { key: 'guardianId',    label: 'Parent/Guardian ID Copy',                           required: true },
  { key: 'residence',     label: 'Proof of Residence',                                required: true },
  { key: 'transfer',      label: 'Transfer Letter from Previous School (if applicable)' },
  { key: 'immunisation',  label: 'Copy of Immunisation Records (if available)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ─── Small reusable UI pieces ─────────────────────────────────────────────────

const Field = ({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inp =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-school-green/40 focus:border-school-green transition w-full bg-white';

const sel = inp + ' cursor-pointer';

const SectionHeading = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-4">
    <span className="text-school-green">{icon}</span>
    <h3 className="text-sm font-black uppercase tracking-widest text-gray-700">{title}</h3>
  </div>
);

const StepBadge = ({
  num, label, active, done,
}: { num: number; label: string; active: boolean; done: boolean }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all
        ${done   ? 'bg-school-green border-school-green text-white'
        : active ? 'bg-white border-white text-school-green'
        :          'bg-white/20 border-white/30 text-white/60'}`}
    >
      {done ? <CheckCircle size={14} /> : num}
    </div>
    <span
      className={`text-xs font-bold uppercase tracking-widest transition-all
        ${active ? 'text-white' : done ? 'text-green-200' : 'text-white/50'}`}
    >
      {label}
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const Admissions = () => {
  const [step,       setStep]       = useState<1 | 2 | 3>(1);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [disclaimer, setDisclaimer] = useState(false);
  const [files,      setFiles]      = useState<Record<string, File | null>>({});

  // ── Step 1 state ─────────────────────────────────────────────────────────

  const [learner, setL] = useState({
    surname: '', firstName: '', initials: '', otherNames: '',
    dob: '', gender: '', identificationNumber: '', citizenship: '', race: '',
    grade: '', year: '2027',
    highestGradePassed: '', yearWhenGradeWasPassed: '', accessionNo: '',
    countryOfResidence: '', province: '', physicalAddress: '', citySuburb: '', postalCode: '',
    homeLanguage: '', preferredLanguageOfInstruction: '',
    homeTelephone: '', emergencyTelephone: '', learnerCell: '', learnerEmail: '',
    isBoarder: '', modeOfTransport: '', deceasedParent: 'None', religion: '',
  });

  const [prevSchool, setPrevSchool] = useState({
    name: '', address: '', code: '', province: '', country: '',
  });

  const [medical, setMedical] = useState({
    medicalAidNumber: '', medicalAidName: '', medicalAidMainMember: '',
    doctorName: '', doctorTelephoneNumber: '', doctorAddress: '',
    medicalCondition: '', specialProblemsRequiringCounselling: '',
    dexterity: '', socialGrantReg: '', socialGrantRec: '',
  });

  // ── Step 2 state ─────────────────────────────────────────────────────────

  const [siblings, setSiblings] = useState({
    numberOfOtherChildrenAtSchool: '', positionInFamily: '',
    sibling1Name: '', sibling1Grade: '',
    sibling2Name: '', sibling2Grade: '',
    sibling3Name: '', sibling3Grade: '',
  });

  // ── Step 3 state ─────────────────────────────────────────────────────────

  const [hasSecondParent, setHasSecondParent] = useState(false);

  const emptyParent = (accountPayer: string) => ({
    title: '', initials: '', firstName: '', surname: '', gender: '', race: '',
    homeLanguage: '', identificationNumber: '', accountPayer,
    residentialStreetAddress: '', citySuburb: '', code: '',
    employer: '', occupation: '',
    surnameOfSpouse: '', occupationOfSpouse: '', spouseIdNumber: '',
    learnerResidesWithThisParent: '', relationshipToLearner: '', maritalStatusOfParent: '',
  });

  const [parent1, setParent1] = useState(emptyParent('Yes'));
  const [parent2, setParent2] = useState(emptyParent('No'));

  const [correspondence, setCorrespondence] = useState({
    title: '', surname: '', postalAddress: '', citySuburb: '', code: '',
  });

  const [otherContact, setOtherContact] = useState({
    homeTelephone: '', faxNumber: '', workTelephone: '', cellNumber: '',
    spouseWorkTelephoneNumber: '', spouseCellNumber: '',
    emailAddress: '', spouseEmailAddress: '',
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const missingRequiredUploads = useMemo(
    () => uploadFields.filter((f) => f.required && !files[f.key]),
    [files],
  );

  const patchL  = (k: string, v: string) => setL(p => ({ ...p, [k]: v }));
  const patchPS = (k: string, v: string) => setPrevSchool(p => ({ ...p, [k]: v }));
  const patchM  = (k: string, v: string) => setMedical(p => ({ ...p, [k]: v }));
  const patchSib= (k: string, v: string) => setSiblings(p => ({ ...p, [k]: v }));
  const patchP1 = (k: string, v: string) => setParent1(p => ({ ...p, [k]: v }));
  const patchP2 = (k: string, v: string) => setParent2(p => ({ ...p, [k]: v }));
  const patchCC = (k: string, v: string) => setCorrespondence(p => ({ ...p, [k]: v }));
  const patchOC = (k: string, v: string) => setOtherContact(p => ({ ...p, [k]: v }));

  const validateStep = () => {
    if (step === 1) {
      if (!learner.firstName || !learner.surname || !learner.dob || !learner.gender) {
        setError('Please complete learner name, surname, date of birth and gender.');
        return false;
      }
      if (!learner.grade) { setError('Please select the grade applied for.'); return false; }
    }
    if (step === 3) {
      if (!parent1.firstName || !parent1.surname) {
        setError('Please complete Parent/Guardian 1 first name and surname.');
        return false;
      }
      if (missingRequiredUploads.length > 0) {
        setError(`Please upload all required documents (${missingRequiredUploads.map(f => f.label).join(', ')}).`);
        return false;
      }
      if (!disclaimer) {
        setError('Please read and accept the declaration before submitting.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const goNext = () => { if (validateStep()) setStep(s => (s < 3 ? (s + 1) as 1|2|3 : s)); };
  const goBack = () => { setError(''); setStep(s => (s > 1 ? (s - 1) as 1|2|3 : s)); };

  const handleFileChange = (key: string, file: File | null) => {
    setFiles(p => ({ ...p, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const uploads: UploadedFile[] = [];
      for (const field of uploadFields) {
        const file = files[field.key];
        if (!file) continue;
        const dataUrl = await fileToDataUrl(file);
        uploads.push({ key: field.key, label: field.label, fileName: file.name, mimeType: file.type || 'application/octet-stream', dataUrl });
      }
      const studentNumber = generateStudentNumber(learner.year);
      const app: Application = {
        id: generateId(),
        firstName:          learner.firstName.trim(),
        lastName:           learner.surname.trim(),
        dob:                learner.dob,
        gender:             learner.gender,
        grade:              learner.grade,
        year:               learner.year,
        studentNumber,
        guardianName:       `${parent1.firstName} ${parent1.surname}`.trim(),
        guardianRelationship: parent1.relationshipToLearner || '',
        guardianPhone:      otherContact.cellNumber || learner.emergencyTelephone || '',
        guardianEmail:      otherContact.emailAddress || learner.learnerEmail || '',
        address:            learner.physicalAddress.trim(),
        locality:           learner.citySuburb.trim(),
        previousSchool:     prevSchool.name.trim(),
        lastGradeCompleted: learner.highestGradePassed.trim(),
        medicalInfo:        medical.medicalCondition.trim() || medical.specialProblemsRequiringCounselling.trim(),
        applicationType:    'General',
        uploads,
        subjectMarks: [],
        averageMark:  0,
        status:       'Pending',
        submittedDate: todayISO(),
      };
      setApplications([app, ...getApplications()]);
      setSubmitted(true);
    } catch {
      setError('Something went wrong while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center p-10 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to Mvenyane Senior Secondary School. We have received your application and will be in contact shortly.
          </p>
          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">General Application for Admission</h1>

        {/* Boarding notice */}
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-bold text-gray-900">Need boarding accommodation?</div>
            <div className="text-sm text-gray-600">
              General and boarding applications are separate. Submit both if a hostel bed is required.
            </div>
          </div>
          <a href="/boarding" className="btn-primary inline-flex items-center justify-center gap-2 shrink-0">
            <BedDouble size={18} /> Boarding Application
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header / step indicator */}
          <div className="bg-school-green px-8 py-7 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-bold">Application for Admission to School</h2>
                <p className="text-white/70 text-sm mt-1">
                  Mvenyane Senior Secondary School &nbsp;·&nbsp; Mvenyane A/A, Cedarville 4735
                </p>
              </div>
              <div className="text-right text-sm text-white/70">
                <div>Tel: 082 768 8305</div>
                <div>Step {step} of 3</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 bg-white/20 rounded-full mb-5 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                animate={{ width: `${((step - 1) / 2) * 100 + 33.33}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <StepBadge num={1} label="Learner & Medical"  active={step === 1} done={step > 1} />
              <StepBadge num={2} label="Siblings"           active={step === 2} done={step > 2} />
              <StepBadge num={3} label="Parent / Documents" active={step === 3} done={false} />
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="p-6 sm:p-8 space-y-10"
              >

                {/* ══════════════════ STEP 1 ══════════════════ */}
                {step === 1 && (
                  <>
                    {/* Learner Particulars */}
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Learner Particulars" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <Field label="Grade Applied For" required>
                          <select className={sel} value={learner.grade} onChange={e => patchL('grade', e.target.value)}>
                            <option value="">Select grade</option>
                            {['8','9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                          </select>
                        </Field>

                        <Field label="Year">
                          <select className={sel} value={learner.year} onChange={e => patchL('year', e.target.value)}>
                            {['2025','2026','2027','2028'].map(y => <option key={y}>{y}</option>)}
                          </select>
                        </Field>

                        <Field label="Highest Grade Passed">
                          <input className={inp} value={learner.highestGradePassed} onChange={e => patchL('highestGradePassed', e.target.value)} placeholder="e.g. Grade 9" />
                        </Field>

                        <Field label="Year When Grade Was Passed">
                          <input className={inp} value={learner.yearWhenGradeWasPassed} onChange={e => patchL('yearWhenGradeWasPassed', e.target.value)} placeholder="YYYY" maxLength={4} />
                        </Field>

                        <Field label="Accession No">
                          <input className={inp} value={learner.accessionNo} onChange={e => patchL('accessionNo', e.target.value)} />
                        </Field>

                        <div className="lg:col-span-1" />

                        <Field label="Surname" required>
                          <input className={inp} value={learner.surname} onChange={e => patchL('surname', e.target.value)} />
                        </Field>

                        <Field label="First Name" required>
                          <input className={inp} value={learner.firstName} onChange={e => patchL('firstName', e.target.value)} />
                        </Field>

                        <Field label="Initials">
                          <input className={inp} value={learner.initials} onChange={e => patchL('initials', e.target.value)} maxLength={5} />
                        </Field>

                        <Field label="Other Names">
                          <input className={inp} value={learner.otherNames} onChange={e => patchL('otherNames', e.target.value)} />
                        </Field>

                        <Field label="Nick Name">
                          <input className={inp} value={learner.otherNames} onChange={e => patchL('otherNames', e.target.value)} />
                        </Field>

                        <Field label="Date of Birth (YYYY-MM-DD)" required>
                          <input type="date" className={inp} value={learner.dob} onChange={e => patchL('dob', e.target.value)} />
                        </Field>

                        <Field label="Gender" required>
                          <select className={sel} value={learner.gender} onChange={e => patchL('gender', e.target.value)}>
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </Field>

                        <Field label="Race">
                          <select className={sel} value={learner.race} onChange={e => patchL('race', e.target.value)}>
                            <option value="">Select</option>
                            <option>African</option>
                            <option>Coloured</option>
                            <option>Indian/Asian</option>
                            <option>White</option>
                            <option>Other</option>
                          </select>
                        </Field>

                        <Field label="ID / Passport Number">
                          <input className={inp} value={learner.identificationNumber} onChange={e => patchL('identificationNumber', e.target.value)} />
                        </Field>

                        <Field label="Citizenship">
                          <input className={inp} value={learner.citizenship} onChange={e => patchL('citizenship', e.target.value)} placeholder="e.g. South African" />
                        </Field>

                        <Field label="Country of Residence">
                          <input className={inp} value={learner.countryOfResidence} onChange={e => patchL('countryOfResidence', e.target.value)} placeholder="e.g. South Africa" />
                        </Field>

                        <Field label="Province (if SA)">
                          <select className={sel} value={learner.province} onChange={e => patchL('province', e.target.value)}>
                            <option value="">Select</option>
                            {['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(p => <option key={p}>{p}</option>)}
                          </select>
                        </Field>

                        <Field label="Physical Address" required>
                          <input className={inp} value={learner.physicalAddress} onChange={e => patchL('physicalAddress', e.target.value)} />
                        </Field>

                        <Field label="City / Suburb">
                          <input className={inp} value={learner.citySuburb} onChange={e => patchL('citySuburb', e.target.value)} />
                        </Field>

                        <Field label="Postal Code">
                          <input className={inp} value={learner.postalCode} onChange={e => patchL('postalCode', e.target.value)} maxLength={6} />
                        </Field>

                        <Field label="Home Language">
                          <input className={inp} value={learner.homeLanguage} onChange={e => patchL('homeLanguage', e.target.value)} />
                        </Field>

                        <Field label="Preferred Language of Instruction">
                          <select className={sel} value={learner.preferredLanguageOfInstruction} onChange={e => patchL('preferredLanguageOfInstruction', e.target.value)}>
                            <option value="">Select</option>
                            <option>English</option>
                            <option>Afrikaans</option>
                            <option>IsiZulu</option>
                            <option>IsiXhosa</option>
                            <option>Sesotho</option>
                            <option>Other</option>
                          </select>
                        </Field>

                        <Field label="Home Telephone">
                          <input className={inp} type="tel" value={learner.homeTelephone} onChange={e => patchL('homeTelephone', e.target.value)} />
                        </Field>

                        <Field label="Emergency Telephone">
                          <input className={inp} type="tel" value={learner.emergencyTelephone} onChange={e => patchL('emergencyTelephone', e.target.value)} />
                        </Field>

                        <Field label="Learner Cell">
                          <input className={inp} type="tel" value={learner.learnerCell} onChange={e => patchL('learnerCell', e.target.value)} />
                        </Field>

                        <Field label="Learner Email Address">
                          <input className={inp} type="email" value={learner.learnerEmail} onChange={e => patchL('learnerEmail', e.target.value)} />
                        </Field>

                        <Field label="Boarder">
                          <select className={sel} value={learner.isBoarder} onChange={e => patchL('isBoarder', e.target.value)}>
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </Field>

                        <Field label="Mode of Transport">
                          <select className={sel} value={learner.modeOfTransport} onChange={e => patchL('modeOfTransport', e.target.value)}>
                            <option value="">Select</option>
                            <option>Formal</option>
                            <option>Non Formal</option>
                            <option>Both</option>
                            <option>Father</option>
                            <option>Mother</option>
                          </select>
                        </Field>

                        <Field label="Deceased Parent">
                          <select className={sel} value={learner.deceasedParent} onChange={e => patchL('deceasedParent', e.target.value)}>
                            <option>None</option>
                            <option>Father</option>
                            <option>Mother</option>
                            <option>Both</option>
                          </select>
                        </Field>

                        <Field label="Religion">
                          <input className={inp} value={learner.religion} onChange={e => patchL('religion', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Previous School */}
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Previous School Information" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Name of Previous School">
                          <input className={inp} value={prevSchool.name} onChange={e => patchPS('name', e.target.value)} />
                        </Field>
                        <Field label="Previous School Address">
                          <input className={inp} value={prevSchool.address} onChange={e => patchPS('address', e.target.value)} />
                        </Field>
                        <Field label="Code">
                          <input className={inp} value={prevSchool.code} onChange={e => patchPS('code', e.target.value)} maxLength={6} />
                        </Field>
                        <Field label="Province">
                          <input className={inp} value={prevSchool.province} onChange={e => patchPS('province', e.target.value)} />
                        </Field>
                        <Field label="Country">
                          <input className={inp} value={prevSchool.country} onChange={e => patchPS('country', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Medical */}
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Learner Medical Information" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Medical Aid Number">
                          <input className={inp} value={medical.medicalAidNumber} onChange={e => patchM('medicalAidNumber', e.target.value)} />
                        </Field>
                        <Field label="Medical Aid Name">
                          <input className={inp} value={medical.medicalAidName} onChange={e => patchM('medicalAidName', e.target.value)} />
                        </Field>
                        <Field label="Medical Aid Main Member">
                          <input className={inp} value={medical.medicalAidMainMember} onChange={e => patchM('medicalAidMainMember', e.target.value)} />
                        </Field>
                        <Field label="Doctor's Name">
                          <input className={inp} value={medical.doctorName} onChange={e => patchM('doctorName', e.target.value)} />
                        </Field>
                        <Field label="Doctor Telephone Number">
                          <input className={inp} type="tel" value={medical.doctorTelephoneNumber} onChange={e => patchM('doctorTelephoneNumber', e.target.value)} />
                        </Field>
                        <Field label="Doctor's Address">
                          <input className={inp} value={medical.doctorAddress} onChange={e => patchM('doctorAddress', e.target.value)} />
                        </Field>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <Field label="Medical Condition">
                            <textarea className={inp + ' resize-none'} rows={2} value={medical.medicalCondition} onChange={e => patchM('medicalCondition', e.target.value)} />
                          </Field>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <Field label="Special Problems Requiring Counselling">
                            <textarea className={inp + ' resize-none'} rows={2} value={medical.specialProblemsRequiringCounselling} onChange={e => patchM('specialProblemsRequiringCounselling', e.target.value)} />
                          </Field>
                        </div>
                        <Field label="Dexterity of Learner">
                          <select className={sel} value={medical.dexterity} onChange={e => patchM('dexterity', e.target.value)}>
                            <option value="">Select</option>
                            <option>Right Handed</option>
                            <option>Left Handed</option>
                            <option>Ambidextrous</option>
                          </select>
                        </Field>
                        <Field label="Registered for Social Grant?">
                          <select className={sel} value={medical.socialGrantReg} onChange={e => patchM('socialGrantReg', e.target.value)}>
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </Field>
                        <Field label="Receiving Social Grant?">
                          <select className={sel} value={medical.socialGrantRec} onChange={e => patchM('socialGrantRec', e.target.value)}>
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </Field>
                      </div>
                    </section>
                  </>
                )}

                {/* ══════════════════ STEP 2 ══════════════════ */}
                {step === 2 && (
                  <>
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Siblings at This School" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Number of Other Children at This School">
                          <input className={inp} type="number" min={0} max={20} value={siblings.numberOfOtherChildrenAtSchool} onChange={e => patchSib('numberOfOtherChildrenAtSchool', e.target.value)} />
                        </Field>
                        <Field label="Position in Family (e.g. 1st, 2nd)">
                          <input className={inp} value={siblings.positionInFamily} onChange={e => patchSib('positionInFamily', e.target.value)} placeholder="e.g. First" />
                        </Field>
                      </div>

                      <p className="text-xs text-gray-500 mt-4 mb-3 font-semibold uppercase tracking-wide">Please supply full names of siblings at this school:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {([1,2,3] as const).map(n => (
                          <React.Fragment key={n}>
                            <Field label={`Sibling ${n} – Full Name`}>
                              <input className={inp} value={siblings[`sibling${n}Name` as keyof typeof siblings]} onChange={e => patchSib(`sibling${n}Name`, e.target.value)} />
                            </Field>
                            <Field label={`Sibling ${n} – Grade`}>
                              <input className={inp} value={siblings[`sibling${n}Grade` as keyof typeof siblings]} onChange={e => patchSib(`sibling${n}Grade`, e.target.value)} placeholder="e.g. Grade 10" />
                            </Field>
                          </React.Fragment>
                        ))}
                      </div>
                    </section>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      <strong>Note:</strong> Complete a <strong>separate parent form</strong> for each parent living at a different physical address. You will capture parent/guardian details in Step 3.
                    </div>
                  </>
                )}

                {/* ══════════════════ STEP 3 ══════════════════ */}
                {step === 3 && (
                  <>
                    {/* Parent 1 */}
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Parent / Guardian 1" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          ['title','Title'],['initials','Initials'],['firstName','First Name *'],['surname','Surname *'],
                        ].map(([k,l]) => (
                          <Field key={k} label={l} required={l.includes('*')}>
                            <input className={inp} value={parent1[k as keyof typeof parent1]} onChange={e => patchP1(k, e.target.value)} />
                          </Field>
                        ))}
                        <Field label="Gender">
                          <select className={sel} value={parent1.gender} onChange={e => patchP1('gender', e.target.value)}>
                            <option value="">Select</option><option>Male</option><option>Female</option>
                          </select>
                        </Field>
                        <Field label="Race">
                          <select className={sel} value={parent1.race} onChange={e => patchP1('race', e.target.value)}>
                            <option value="">Select</option>
                            <option>African</option><option>Coloured</option><option>Indian/Asian</option><option>White</option><option>Other</option>
                          </select>
                        </Field>
                        <Field label="Home Language">
                          <input className={inp} value={parent1.homeLanguage} onChange={e => patchP1('homeLanguage', e.target.value)} />
                        </Field>
                        <Field label="ID / Passport Number">
                          <input className={inp} value={parent1.identificationNumber} onChange={e => patchP1('identificationNumber', e.target.value)} />
                        </Field>
                        <Field label="Account Payer">
                          <select className={sel} value={parent1.accountPayer} onChange={e => patchP1('accountPayer', e.target.value)}>
                            <option>Yes</option><option>No</option>
                          </select>
                        </Field>
                        <Field label="Residential Street Address">
                          <input className={inp} value={parent1.residentialStreetAddress} onChange={e => patchP1('residentialStreetAddress', e.target.value)} />
                        </Field>
                        <Field label="City / Suburb">
                          <input className={inp} value={parent1.citySuburb} onChange={e => patchP1('citySuburb', e.target.value)} />
                        </Field>
                        <Field label="Code">
                          <input className={inp} value={parent1.code} onChange={e => patchP1('code', e.target.value)} maxLength={6} />
                        </Field>
                        <Field label="Employer">
                          <input className={inp} value={parent1.employer} onChange={e => patchP1('employer', e.target.value)} />
                        </Field>
                        <Field label="Occupation">
                          <input className={inp} value={parent1.occupation} onChange={e => patchP1('occupation', e.target.value)} />
                        </Field>
                        <Field label="Surname of Spouse">
                          <input className={inp} value={parent1.surnameOfSpouse} onChange={e => patchP1('surnameOfSpouse', e.target.value)} />
                        </Field>
                        <Field label="Occupation of Spouse">
                          <input className={inp} value={parent1.occupationOfSpouse} onChange={e => patchP1('occupationOfSpouse', e.target.value)} />
                        </Field>
                        <Field label="Spouse ID Number">
                          <input className={inp} value={parent1.spouseIdNumber} onChange={e => patchP1('spouseIdNumber', e.target.value)} />
                        </Field>
                        <Field label="Learner Resides with This Parent?">
                          <select className={sel} value={parent1.learnerResidesWithThisParent} onChange={e => patchP1('learnerResidesWithThisParent', e.target.value)}>
                            <option value="">Select</option><option>Yes</option><option>No</option>
                          </select>
                        </Field>
                        <Field label="Relationship to Learner">
                          <select className={sel} value={parent1.relationshipToLearner} onChange={e => patchP1('relationshipToLearner', e.target.value)}>
                            <option value="">Select</option>
                            <option>Father</option><option>Mother</option><option>Guardian</option><option>Grandparent</option><option>Other</option>
                          </select>
                        </Field>
                        <Field label="Marital Status">
                          <select className={sel} value={parent1.maritalStatusOfParent} onChange={e => patchP1('maritalStatusOfParent', e.target.value)}>
                            <option value="">Select</option>
                            <option>Married</option><option>Single</option><option>Divorced</option><option>Widowed</option><option>Other</option>
                          </select>
                        </Field>
                      </div>
                    </section>

                    {/* Toggle second parent */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHasSecondParent(p => !p)}
                        className="text-sm font-semibold text-school-green underline underline-offset-2"
                      >
                        {hasSecondParent ? '− Remove second parent/guardian' : '+ Add second parent/guardian'}
                      </button>
                      <span className="text-xs text-gray-400">(living at a different address)</span>
                    </div>

                    {/* Parent 2 */}
                    {hasSecondParent && (
                      <section>
                        <SectionHeading icon={<FileText size={16} />} title="Parent / Guardian 2" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            ['title','Title'],['initials','Initials'],['firstName','First Name'],['surname','Surname'],
                          ].map(([k,l]) => (
                            <Field key={k} label={l}>
                              <input className={inp} value={parent2[k as keyof typeof parent2]} onChange={e => patchP2(k, e.target.value)} />
                            </Field>
                          ))}
                          <Field label="Gender">
                            <select className={sel} value={parent2.gender} onChange={e => patchP2('gender', e.target.value)}>
                              <option value="">Select</option><option>Male</option><option>Female</option>
                            </select>
                          </Field>
                          <Field label="ID / Passport Number">
                            <input className={inp} value={parent2.identificationNumber} onChange={e => patchP2('identificationNumber', e.target.value)} />
                          </Field>
                          <Field label="Residential Street Address">
                            <input className={inp} value={parent2.residentialStreetAddress} onChange={e => patchP2('residentialStreetAddress', e.target.value)} />
                          </Field>
                          <Field label="City / Suburb">
                            <input className={inp} value={parent2.citySuburb} onChange={e => patchP2('citySuburb', e.target.value)} />
                          </Field>
                          <Field label="Relationship to Learner">
                            <select className={sel} value={parent2.relationshipToLearner} onChange={e => patchP2('relationshipToLearner', e.target.value)}>
                              <option value="">Select</option>
                              <option>Father</option><option>Mother</option><option>Guardian</option><option>Grandparent</option><option>Other</option>
                            </select>
                          </Field>
                          <Field label="Account Payer">
                            <select className={sel} value={parent2.accountPayer} onChange={e => patchP2('accountPayer', e.target.value)}>
                              <option>Yes</option><option>No</option>
                            </select>
                          </Field>
                        </div>
                      </section>
                    )}

                    {/* Correspondence */}
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Correspondence Details" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Title"><input className={inp} value={correspondence.title} onChange={e => patchCC('title', e.target.value)} /></Field>
                        <Field label="Surname"><input className={inp} value={correspondence.surname} onChange={e => patchCC('surname', e.target.value)} /></Field>
                        <Field label="Postal Address"><input className={inp} value={correspondence.postalAddress} onChange={e => patchCC('postalAddress', e.target.value)} /></Field>
                        <Field label="City / Suburb"><input className={inp} value={correspondence.citySuburb} onChange={e => patchCC('citySuburb', e.target.value)} /></Field>
                        <Field label="Code"><input className={inp} value={correspondence.code} onChange={e => patchCC('code', e.target.value)} maxLength={6} /></Field>
                      </div>
                    </section>

                    {/* Other Contact Details */}
                    <section>
                      <SectionHeading icon={<FileText size={16} />} title="Other Contact Details" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          ['homeTelephone','Home Telephone'],['faxNumber','Fax Number'],
                          ['workTelephone','Work Telephone'],['cellNumber','Cell Number'],
                          ['spouseWorkTelephoneNumber','Spouse Work Telephone'],['spouseCellNumber','Spouse Cell Number'],
                          ['emailAddress','E-Mail Address'],['spouseEmailAddress','Spouse E-Mail Address'],
                        ].map(([k,l]) => (
                          <Field key={k} label={l}>
                            <input className={inp} type={k.includes('email') || k.includes('Email') ? 'email' : 'tel'} value={otherContact[k as keyof typeof otherContact]} onChange={e => patchOC(k, e.target.value)} />
                          </Field>
                        ))}
                      </div>
                    </section>

                    {/* Document Uploads */}
                    <section>
                      <SectionHeading icon={<Upload size={16} />} title="Required Documents" />
                      <p className="text-xs text-gray-500 mb-4">
                        If the learner is accepted, the following documents must be submitted to the school.
                        Please upload them now where possible.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {uploadFields.map(field => {
                          const file = files[field.key];
                          return (
                            <div
                              key={field.key}
                              className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition
                                ${file
                                  ? 'border-school-green bg-green-50'
                                  : field.required
                                    ? 'border-dashed border-red-300 bg-red-50/40'
                                    : 'border-dashed border-gray-300 bg-gray-50'}`}
                            >
                              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${file ? 'bg-school-green text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {file ? <CheckCircle size={16} /> : <Upload size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-700 leading-tight">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </div>
                                {file && <div className="text-xs text-school-green truncate mt-0.5">{file.name}</div>}
                                {!file && <div className="text-xs text-gray-400 mt-0.5">No file chosen</div>}
                              </div>
                              <label className="shrink-0 text-xs font-bold text-school-green cursor-pointer hover:underline">
                                {file ? 'Change' : 'Upload'}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={e => handleFileChange(field.key, e.target.files?.[0] ?? null)}
                                />
                              </label>
                              {file && (
                                <button type="button" onClick={() => handleFileChange(field.key, null)} className="shrink-0 text-gray-400 hover:text-red-500">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Declaration */}
                    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-3">Declaration</h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        I hereby declare that to the best of my knowledge, the above information as supplied is <strong>accurate and correct</strong>. I understand that completing this form does not necessarily mean that the learner has been accepted into the school. All changes to be initialled or signed by parent/guardian.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={disclaimer}
                          onChange={e => setDisclaimer(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-school-green cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          I, the parent/guardian, confirm that the information provided is accurate and correct, and I agree to the above declaration.
                        </span>
                      </label>
                    </section>
                  </>
                )}

                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 1}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 transition shadow"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow"
                    >
                      {submitting ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                      ) : (
                        <><CheckCircle size={16} /> Submit Application</>
                      )}
                    </button>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Applications and uploads are saved in the school's browser storage. For a live deployment, connect the staff portal to a database.
        </p>
      </div>
    </div>
  );
};
