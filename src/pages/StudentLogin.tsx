import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function normalizeStudentNumber(v: string) {
  return v.trim();
}

function normalizeIdNumber(v: string) {
  return v.trim();
}

export const StudentLogin = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sn = normalizeStudentNumber(studentNumber);
    const id = normalizeIdNumber(idNumber);

    if (!sn || !id) {
      setError('Please enter your student number and ID number.');
      return;
    }

    // IMPORTANT:
    // This demo portal uses client-side login state only.
    // Real security MUST be enforced server-side (Supabase RLS + protected storage).
    sessionStorage.setItem('mh_student_portal_student_number', sn);
    navigate('/student');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          aria-label="Back to website"
        >
          <ArrowLeft size={16} /> Back to website
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-school-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Student Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Mvenyane SSS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Student number</label>
            <input
              value={studentNumber}
              onChange={(e) => {
                setStudentNumber(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-school-green focus:border-transparent"
              placeholder="e.g. 2027-000123"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">ID number</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={idNumber}
                onChange={(e) => {
                  setIdNumber(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-school-green focus:border-transparent"
                placeholder="Enter your ID number"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className="text-red-400 text-sm text-center">{error}</p> : null}

          <button
            type="submit"
            className="w-full bg-school-green text-white py-3 rounded-xl font-bold hover:bg-green-800 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-8">
          If you cannot log in, please contact the school office.
        </p>
      </div>
    </div>
  );
};
