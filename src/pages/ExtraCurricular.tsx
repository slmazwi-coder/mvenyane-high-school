import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Music, Users, Star, Dumbbell, Target, BookOpen, Mic } from 'lucide-react';
import { getActivities, type Activity } from '../admin/utils/storage';

const sportsPrograms = [
  { 
    name: 'Soccer', 
    icon: Target, 
    description: 'The beautiful game — our teams compete passionately at district and regional tournaments.',
    category: 'Sport'
  },
  { 
    name: 'Rugby', 
    icon: Dumbbell, 
    description: 'Our flagship sport with a rich history of regional dominance and provincial representation.',
    category: 'Sport'
  },
  { 
    name: 'Netball', 
    icon: Users, 
    description: 'Competitive teams across all age groups with provincial accolades.',
    category: 'Sport'
  },
  { 
    name: 'Athletics', 
    icon: Trophy, 
    description: 'Track and field excellence — developing speed, strength, and endurance across all events.',
    category: 'Sport'
  },
];

const academicPrograms = [
  { 
    name: 'Spelling Bee', 
    icon: BookOpen, 
    description: 'Sharpening language skills and vocabulary. National-level finalists multiple years running.',
    category: 'Academic'
  },
  { 
    name: 'Debating & Public Speaking', 
    icon: Mic, 
    description: 'Developing critical thinkers and eloquent future leaders through competitive debate.',
    category: 'Academic'
  },
];

const culturePrograms = [
  { 
    name: 'Choral Music', 
    icon: Music, 
    description: 'Award-winning choir known for excellence in regional and provincial competitions.',
    category: 'Culture'
  },
];

const accolades = [
  { title: "Regional Rugby Champions", year: "2024", category: "Sport" },
  { title: "Provincial Choir Competition - 1st Place", year: "2023", category: "Culture" },
  { title: "National Spelling Bee Finalist", year: "2025", category: "Academic" },
  { title: "District Netball Gold Medalists", year: "2024", category: "Sport" },
  { title: "District Athletics Meet - Overall Winners", year: "2024", category: "Sport" },
  { title: "Provincial Debate Semi-Finalists", year: "2023", category: "Academic" },
];

const ProgramCard: React.FC<{ prog: any }> = ({ prog }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group"
  >
    <div className="aspect-video bg-school-green/10 flex items-center justify-center relative">
      <prog.icon size={64} className="text-school-green/40" />
      <div className="absolute inset-0 bg-school-green/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <prog.icon size={48} className="text-white" />
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
          prog.category === 'Sport' ? 'bg-blue-100 text-blue-700' : 
          prog.category === 'Academic' ? 'bg-purple-100 text-purple-700' :
          'bg-orange-100 text-orange-700'
        }`}>{prog.category}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{prog.name}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{prog.description}</p>
    </div>
  </motion.div>
);

export const ExtraCurricular = () => {
  const [activities, setActivities] = useState<Activity[]>(getActivities());

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const sportsPrograms = activities.filter(a => a.category === 'Sport');
  const academicPrograms = activities.filter(a => a.category === 'Academic');
  const culturePrograms = activities.filter(a => a.category === 'Culture');

  const accolades = [
    { title: "Regional Rugby Champions", year: "2024", category: "Sport" },
    { title: "Provincial Choir Competition - 1st Place", year: "2023", category: "Culture" },
    { title: "National Spelling Bee Finalist", year: "2025", category: "Academic" },
    { title: "District Netball Gold Medalists", year: "2024", category: "Sport" },
    { title: "District Athletics Meet - Overall Winners", year: "2024", category: "Sport" },
    { title: "Provincial Debate Semi-Finalists", year: "2023", category: "Academic" },
  ];

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title text-center">Sports & Culture</h1>
        
        <p className="text-center text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
          At [SCHOOL NAME], we believe in a holistic education. Our extra-curricular programs are designed to discover and nurture the diverse talents of our learners.
        </p>

        {/* Sports */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-school-green mb-8 flex items-center gap-3">
            <Dumbbell className="text-school-green" /> Sports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sportsPrograms.map((prog, i) => <ProgramCard key={i} prog={prog} />)}
          </div>
        </section>

        {/* Academic Extra-Curricular */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-school-green mb-8 flex items-center gap-3">
            <BookOpen className="text-school-green" /> Academic Extra-Curricular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicPrograms.map((prog, i) => <ProgramCard key={i} prog={prog} />)}
          </div>
        </section>

        {/* Arts & Culture */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold text-school-green mb-8 flex items-center gap-3">
            <Music className="text-school-green" /> Arts & Culture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {culturePrograms.map((prog, i) => <ProgramCard key={i} prog={prog} />)}
          </div>
        </section>

        {/* Accolades and Hall of Fame */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <section>
            <h2 className="text-3xl font-bold text-school-green mb-8 flex items-center gap-3">
              <Trophy className="text-yellow-600" /> Recent Accolades
            </h2>
            <div className="space-y-4">
              {accolades.map((acc, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 4 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-lg">{acc.title}</h4>
                    <p className="text-gray-500 text-sm">{acc.category} • {acc.year}</p>
                  </div>
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                    <Trophy size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-school-green mb-8 flex items-center gap-3">
              <Star className="text-yellow-500" /> Sports Hall of Fame
            </h2>
            <div className="bg-school-green rounded-3xl p-8 text-white">
              <p className="text-lg italic mb-8 text-green-100">
                "Recognizing those who have gone above and beyond in representing [SCHOOL NAME] at regional, provincial, and national levels."
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <p className="font-bold">[NAME]</p>
                    <p className="text-sm text-green-100">National Rugby U18 Representative</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <p className="font-bold">[NAME]</p>
                    <p className="text-sm text-green-100">Provincial Choir Soloist Winner</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <p className="font-bold">[NAME]</p>
                    <p className="text-sm text-green-100">National Spelling Bee Finalist</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
