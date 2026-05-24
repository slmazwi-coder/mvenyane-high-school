import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, TrendingUp, BarChart3, Medal, Calendar, Award, Image as ImageIcon } from 'lucide-react';
import { getHallOfFame, getResultsByYear, type HallOfFameEntry, type YearResults } from '../admin/utils/storage';

// Put your achiever images in:
// public/assets/achievements/
// Then set each Hall of Fame entry image to something like:
// /assets/achievements/2025/top-achiever-1.jpg
const StudentAvatar = ({ image, name, year }: { image: string; name: string; year: string }) => {
  const [hasError, setHasError] = useState(!image);

  return (
    <div className="aspect-[3/4] sm:aspect-square w-full relative overflow-hidden bg-gray-100 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center group">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
          <div className="mb-4 w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-gray-200">
            <ImageIcon className="opacity-60" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">{name}</p>
          <p className="text-xs text-gray-400 italic">Class of {year}</p>
          <p className="text-[11px] text-gray-400 mt-2">
            Add image in <span className="font-mono">public/assets/achievements/</span>
          </p>
        </div>
      )}
      <div className="absolute top-0 right-0 bg-school-green/10 p-4 text-school-green opacity-0 group-hover:opacity-100 transition-opacity">
        <Award size={24} />
      </div>
    </div>
  );
};

export const Achievements = () => {
  const [activeResultsYear, setActiveResultsYear] = useState<'2025' | '2024' | '2023'>('2025');
  const [activeAchieversYear, setActiveAchieversYear] = useState<string>('2025');
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>(getHallOfFame());
  const [currentResults, setCurrentResults] = useState<YearResults | null>(getResultsByYear(activeResultsYear));

  useEffect(() => {
    setHallOfFame(getHallOfFame());
  }, []);

  useEffect(() => {
    setCurrentResults(getResultsByYear(activeResultsYear));
  }, [activeResultsYear]);

  const achieversByYear: Record<string, HallOfFameEntry[]> = {};
  hallOfFame.forEach((entry) => {
    if (!achieversByYear[entry.year]) achieversByYear[entry.year] = [];
    achieversByYear[entry.year].push(entry);
  });

  const yearsList = Object.keys(achieversByYear).sort((a, b) => parseInt(b) - parseInt(a));
  if (yearsList.length > 0 && !yearsList.includes(activeAchieversYear)) {
    setActiveAchieversYear(yearsList[0]);
  }

  return (
    <div className="py-12 sm:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title text-center mb-12 sm:mb-16">Academic Excellence</h1>

        <section className="mb-16 sm:mb-24">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Star size={200} className="text-blue-600" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-blue-200 rounded-full flex flex-col items-center justify-center text-school-green border-8 border-white shadow-lg shrink-0">
                <span className="text-3xl sm:text-4xl font-black">—</span>
                <span className="text-sm font-bold uppercase tracking-tighter italic">Pass Rate</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-school-green font-bold uppercase tracking-widest text-sm mb-2">
                  <Star size={16} fill="currentColor" /> 2025 Matric Highlight <Star size={16} fill="currentColor" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-school-green mb-4 text-center md:text-left">
                  Celebrating strong results
                </h2>
                <p className="text-base sm:text-lg text-gray-700 max-w-2xl italic leading-relaxed text-center md:text-left">
                  "Mvenyane SSS is committed to steady improvement, learner support, and high academic standards."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20 sm:mb-32">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-school-green mb-4 flex items-center justify-center gap-4">
              <Trophy className="text-yellow-500 w-10 h-10 sm:w-12 sm:h-12" />
              Hall of Fame
              <Trophy className="text-yellow-500 w-10 h-10 sm:w-12 sm:h-12" />
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Celebrating outstanding learners.</p>
            <p className="text-sm text-gray-500 max-w-3xl mx-auto mt-2">Names and photos can be managed in the Staff Portal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {hallOfFame.slice(0, 8).map((student, idx) => (
              <motion.div
                key={student.id || idx}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <StudentAvatar image={student.image} name={student.name} year={student.year} />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                  <div className="text-school-green text-sm font-bold mb-3 flex items-center justify-center gap-1">
                    <Medal size={16} /> {student.title}
                  </div>
                  {student.desc ? <p className="text-gray-500 text-xs leading-relaxed">{student.desc}</p> : null}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-20 sm:mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-school-green flex items-center gap-3">
              <BarChart3 className="text-school-green" /> Matric Results Summary
            </h2>
            <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
              {(['2025', '2024', '2023'] as const).map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveResultsYear(year)}
                  className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all text-sm sm:text-base ${
                    activeResultsYear === year ? 'bg-school-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeResultsYear}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              {!currentResults ? (
                <div className="text-center py-16 sm:py-24 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-xl font-bold mb-2">Notice</p>
                  <p>No results data recorded for the year {activeResultsYear}.</p>
                </div>
              ) : (
                <>
                  <div className="bg-school-green rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10 sm:mb-12">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                      <TrendingUp size={200} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl sm:text-2xl font-bold mb-8 flex items-center gap-3">
                        <Star className="text-yellow-400" /> {activeResultsYear} Performance Overview
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{currentResults.overall}%</p>
                          <p className="text-white/80 text-sm font-medium">Overall Pass Rate</p>
                        </div>
                        <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{currentResults.bachelor}</p>
                          <p className="text-white/80 text-sm font-medium">
                            Bachelor Passes ({currentResults.bachelorRate}%)
                          </p>
                        </div>
                        <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{currentResults.distinctions}</p>
                          <p className="text-white/80 text-sm font-medium">Total Distinctions</p>
                        </div>
                        <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{currentResults.wrote}</p>
                          <p className="text-white/80 text-sm font-medium">Learners Wrote</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-8">{activeResultsYear} Subject Pass Rates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentResults.subjects.map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-3 gap-3">
                            <span className="font-semibold text-gray-700">{stat.subject}</span>
                            <span className="text-school-green font-bold">{stat.rate}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.rate}%` }}
                              transition={{ duration: 0.45 }}
                              className="bg-school-green h-2 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <section>
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-school-green flex items-center justify-center gap-3 mb-4">
              <Calendar className="text-school-green" /> Top Achievers Timeline
            </h2>
            <p className="text-gray-600 italic">Select a year to see the class achievers.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-12">
            {yearsList.map((year) => (
              <button
                key={year}
                onClick={() => setActiveAchieversYear(year)}
                className={`px-4 sm:px-5 py-2 rounded-full font-bold transition-all text-sm ${
                  activeAchieversYear === year
                    ? 'bg-school-green text-white shadow-lg scale-105'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-school-green hover:text-school-green'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeAchieversYear}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {achieversByYear[activeAchieversYear] && achieversByYear[activeAchieversYear].length > 0 ? (
                achieversByYear[activeAchieversYear].map((person, i) => (
                  <div key={i} className="text-center">
                    <StudentAvatar image={person.image} name={person.name} year={activeAchieversYear} />
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                      <p className="text-xs font-semibold text-school-green uppercase tracking-wider">{person.title}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <p>No achiever records found for {activeAchieversYear}.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};
