import React from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Users, Megaphone, ArrowRight, BookOpen, Target } from 'lucide-react';

const stats = [
  { label: 'Matric Pass Rate', value: '—', icon: TrendingUp },
  { label: 'Learners Enrolled', value: '1 300+', icon: Users },
  { label: 'Staff Complement', value: '36+', icon: Award },
];

export const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Notices */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-green-100 bg-green-50 p-6 sm:p-7 flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-white border border-green-100 text-school-green shrink-0">
                <Megaphone size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-black uppercase tracking-widest text-school-green">Notice</div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-white border border-green-100 text-gray-700">
                    2027
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">Admissions applications are now open</h3>
                <p className="text-gray-700 mt-1">
                  General school applications for the <span className="font-bold">2027</span> academic year are open.
                </p>
                <a href="/admissions" className="mt-4 inline-flex items-center gap-2 text-school-green font-bold">
                  Apply now <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-7 flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-white border border-gray-200 text-school-green shrink-0">
                <Megaphone size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-black uppercase tracking-widest text-school-green">Boarding</div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700">
                    Girls Only
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">Girls' hostel boarding applications</h3>
                <p className="text-gray-700 mt-1">
                  State hostel accommodation for girls — apply online for the next academic year.
                </p>
                <a href="/boarding" className="mt-4 inline-flex items-center gap-2 text-school-green font-bold">
                  Apply for boarding <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Quick View */}
      <section className="py-12 bg-gray-50 -mt-4 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-xl flex items-center gap-6 border-b-4 border-school-green"
            >
              <div className="p-4 bg-green-50 rounded-xl text-school-green">
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Our Vision &amp; Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-green-50 rounded-2xl p-8 border border-green-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-school-green rounded-xl text-white">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We aim to provide quality education that will lead to independent thinking, self-confidence, foresight of job creation, environmental awareness, loyal, responsible citizens with good communication and leadership skills.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-school-green rounded-xl text-white">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Cultivating and supporting our learners</li>
                <li>• Challenging every student to his/her highest potential</li>
                <li>• Partnering with home, school and community for students' success</li>
                <li>• Preparing students to be contributing citizens in the 21st century</li>
                <li>• Providing a safe, nurturing and orderly environment</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Motto */}
      <section className="py-16 bg-school-green">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-3xl text-white leading-relaxed font-light italic">
            "Education is the key to success"
          </p>
          <p className="text-white/60 mt-3 text-sm">— Mvenyane Senior Secondary School</p>
        </div>
      </section>
    </div>
  );
};
