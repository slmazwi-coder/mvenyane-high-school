import React from 'react';
import { BookOpen, Mic, Sigma, Brain, Globe, PenTool } from 'lucide-react';

const activities = [
  {
    name: 'Spelling Bee',
    icon: PenTool,
    description: 'Building vocabulary, spelling accuracy, and confidence in public performance.',
  },
  {
    name: 'Debate',
    icon: Mic,
    description: 'Structured debating that develops critical thinking, research, and public speaking.',
  },
  {
    name: 'Maths Olympiad',
    icon: Sigma,
    description: 'Problem-solving and competition preparation for learners who enjoy mathematics.',
  },
  {
    name: 'Science Club',
    icon: Brain,
    description: 'Experiments, projects, and exploration of practical science and technology.',
  },
  {
    name: 'Reading & Writing Club',
    icon: BookOpen,
    description: 'Creative writing, reading circles, and language enrichment activities.',
  },
  {
    name: 'Geography & Environment',
    icon: Globe,
    description: 'Environmental awareness, map skills, and geography enrichment projects.',
  },
];

export const Activities = () => {
  return (
    <div className="py-12 sm:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title text-center">Activities</h1>
        <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          Academic activities help learners grow confidence, strengthen problem-solving skills, and prepare for competitions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((a) => (
            <div key={a.name} className="bg-gray-50 rounded-3xl border border-gray-100 p-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-white border border-gray-200 text-school-green">
                  <a.icon size={22} />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">{a.name}</h2>
              </div>
              <p className="text-gray-600">{a.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-3xl p-6 sm:p-7">
          <div className="text-sm font-black uppercase tracking-widest text-school-green">More activities</div>
          <p className="text-gray-700 mt-2">
            The school may add more academic activities over time, such as quiz competitions, coding club, entrepreneurship club,
            chess, and career guidance programs.
          </p>
        </div>
      </div>
    </div>
  );
};
