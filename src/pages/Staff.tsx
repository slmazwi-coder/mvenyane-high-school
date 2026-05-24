import React from 'react';
import { User } from 'lucide-react';

interface StaffMember {
  name: string;
  position: string;
  subject?: string;
  category: string;
  image?: string;
}

const staffData: StaffMember[] = [
  // Leadership
  { name: 'Principal', position: 'Principal', category: 'Leadership', image: './assets/staff/principal.jpg' },
  { name: 'Deputy Principal', position: 'Deputy Principal', category: 'Leadership', image: './assets/staff/deputy.jpg' },

  // Support Staff
  { name: 'School Administrator', position: 'School Administrator', category: 'Support Staff' },
];

const categories = [
  'Leadership',
  'Departmental Heads',
  'Class Teachers',
  'Support Staff',
  'Hostel Staff',
];

const StaffCard = ({ member }: { member: StaffMember }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center p-6 text-center border border-[#dde3f0] hover:-translate-y-1">
    <div className="w-24 h-24 rounded-full bg-[#eef0f7] border-4 border-[#d4d9ec] flex items-center justify-center mb-4 overflow-hidden">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <User size={40} className="text-[#2a3f7a] opacity-25" />
      )}
    </div>
    <h3 className="text-sm font-bold text-[#0f1f4b] leading-tight">{member.name}</h3>
    <p className="text-xs text-[#c9a84c] font-semibold mt-1">{member.position}</p>
    {member.subject && (
      <span className="mt-2 inline-block bg-[#eef0f7] text-[#0f1f4b] text-xs font-medium px-3 py-1 rounded-full">
        {member.subject}
      </span>
    )}
  </div>
);

export const Staff = () => {
  const [activeCategory, setActiveCategory] = React.useState('Leadership');
  const filtered = staffData.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#f0f2f8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: '#0f1f4b' }}>
            Our Staff
          </h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-4" style={{ background: '#c9a84c' }} />
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Meet the dedicated team of educators and support staff at Mvenyane Senior Secondary School.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={
                activeCategory === cat
                  ? { background: '#c9a84c', color: '#0f1f4b', borderColor: '#c9a84c' }
                  : { background: '#ffffff', color: '#0f1f4b', borderColor: '#c5cfe0' }
              }
              className="px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 hover:shadow-md"
            >
              {cat}
              <span className="ml-2 text-xs font-bold opacity-60">
                ({staffData.filter(m => m.category === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* Staff Cards Grid */}
        <div className="flex flex-wrap justify-center gap-5">
          {filtered.map((member, index) => (
            <div key={index} className="w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] md:w-[calc(25%-15px)] lg:w-[calc(20%-16px)]">
              <StaffCard member={member} />
            </div>
          ))}
        </div>

        {/* Photo note */}
        <p className="text-center text-gray-400 text-xs mt-10 italic">
          Staff photos and subject details will be updated progressively.
        </p>
      </div>
    </div>
  );
};
