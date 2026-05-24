import React from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Users, Megaphone, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Matric Pass Rate', value: '—', icon: TrendingUp },
  { label: 'Bachelors Pass', value: '—', icon: Award },
  { label: 'Learners Enrolled', value: '500+', icon: Users },
];

export const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Notices */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-7 flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-white border border-blue-100 text-school-green shrink-0">
                <Megaphone size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-black uppercase tracking-widest text-school-green">Notice</div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-white border border-blue-100 text-gray-700">
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
                    2027
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">Boarding applications are now open</h3>
                <p className="text-gray-700 mt-1">
                  Hostel accommodation applications for the <span className="font-bold">2027</span> academic year are open.
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

      {/* Vision Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="section-title">Our Motto</h2>
          <p className="text-2xl text-gray-700 leading-relaxed font-light italic">
            "Education is the key to success"
          </p>
        </div>
      </section>
    </div>
  );
};
