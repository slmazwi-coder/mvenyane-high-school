import React from 'react';
import { Trophy, CalendarDays, Target, Users, Flag } from 'lucide-react';

const sports = [
  {
    name: 'Soccer',
    description: 'Training and matches for boys and girls teams across age groups.',
    icon: Target,
  },
  {
    name: 'Netball',
    description: 'Competitive netball teams with structured training and league participation.',
    icon: Users,
  },
  {
    name: 'Athletics',
    description: 'Track and field events to develop speed, strength, and endurance.',
    icon: Trophy,
  },
];

type Fixture = {
  date: string;
  sport: string;
  opponent: string;
  venue: string;
  time: string;
};

type Result = {
  date: string;
  sport: string;
  opponent: string;
  venue: string;
  result: string;
};

const fixtures: Fixture[] = [
  { date: 'TBA', sport: 'Soccer', opponent: 'TBA', venue: 'TBA', time: 'TBA' },
  { date: 'TBA', sport: 'Netball', opponent: 'TBA', venue: 'TBA', time: 'TBA' },
  { date: 'TBA', sport: 'Athletics', opponent: 'TBA', venue: 'TBA', time: 'TBA' },
];

const results: Result[] = [
  { date: 'TBA', sport: 'Soccer', opponent: 'TBA', venue: 'TBA', result: 'TBA' },
  { date: 'TBA', sport: 'Netball', opponent: 'TBA', venue: 'TBA', result: 'TBA' },
  { date: 'TBA', sport: 'Athletics', opponent: 'TBA', venue: 'TBA', result: 'TBA' },
];

export const Sport = () => {
  return (
    <div className="py-12 sm:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title text-center">Sport</h1>
        <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          Mvenyane SSS offers structured sport programs to develop teamwork, fitness, and discipline.
        </p>

        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sports.map((s) => (
              <div key={s.name} className="bg-gray-50 rounded-3xl border border-gray-100 p-7">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-2xl bg-white border border-gray-200 text-school-green">
                    <s.icon size={22} />
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">{s.name}</h2>
                </div>
                <p className="text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-gray-50 rounded-3xl border border-gray-100 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-white border border-gray-200 text-school-green">
                <CalendarDays size={22} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Fixtures</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Sport</th>
                    <th className="py-2 pr-4">Opponent</th>
                    <th className="py-2 pr-4">Venue</th>
                    <th className="py-2">Time</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {fixtures.map((f, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-3 pr-4 whitespace-nowrap">{f.date}</td>
                      <td className="py-3 pr-4 whitespace-nowrap font-semibold">{f.sport}</td>
                      <td className="py-3 pr-4">{f.opponent}</td>
                      <td className="py-3 pr-4">{f.venue}</td>
                      <td className="py-3 whitespace-nowrap">{f.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
              <Flag size={16} /> Fixtures can be updated in the Staff Portal.
            </div>
          </section>

          <section className="bg-gray-50 rounded-3xl border border-gray-100 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-white border border-gray-200 text-school-green">
                <Trophy size={22} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Results</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Sport</th>
                    <th className="py-2 pr-4">Opponent</th>
                    <th className="py-2 pr-4">Venue</th>
                    <th className="py-2">Result</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {results.map((r, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-3 pr-4 whitespace-nowrap">{r.date}</td>
                      <td className="py-3 pr-4 whitespace-nowrap font-semibold">{r.sport}</td>
                      <td className="py-3 pr-4">{r.opponent}</td>
                      <td className="py-3 pr-4">{r.venue}</td>
                      <td className="py-3 whitespace-nowrap font-semibold">{r.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
              <Flag size={16} /> Results can be updated in the Staff Portal.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
