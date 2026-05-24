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
  // School Management Team
  { name: 'Ms. S.N. Basiwe', position: 'Principal', category: 'Leadership' },
  { name: 'Mr. Q. Maphosa', position: 'Deputy Principal', subject: 'English', category: 'Leadership' },

  // Departmental Heads
  { name: 'Mr. M. Khoadi', position: 'Head of Department', subject: 'Life Sciences', category: 'Departmental Heads' },
  { name: 'Ms. N.K. Mdlalana', position: 'Head of Department', subject: 'Geography', category: 'Departmental Heads' },
  { name: 'Mr. N. Mlobothi', position: 'Head of Department', subject: 'Mathematics', category: 'Departmental Heads' },
  { name: 'Mr. L. Mbedla', position: 'Head of Department', subject: 'Languages', category: 'Departmental Heads' },
  { name: 'Mr. M.B. Nakin', position: 'Senior Educator', subject: 'Life Orientation', category: 'Departmental Heads' },

  // Educators
  { name: 'Mr. N. Njeje', position: 'Educator', subject: 'Technology', category: 'Educators' },
  { name: 'Ms. N. Gwiji', position: 'Educator', subject: 'IsiXhosa', category: 'Educators' },
  { name: 'Mr. P.N. Bubu', position: 'Educator', subject: 'Geography', category: 'Educators' },
  { name: 'Ms. L. Nyusela', position: 'Educator', subject: 'English', category: 'Educators' },
  { name: 'Ms. N.T. Mboxela', position: 'Educator', subject: 'IsiXhosa', category: 'Educators' },
  { name: 'Ms. N. Mbethe', position: 'Educator', subject: 'English', category: 'Educators' },
  { name: 'Ms. S. Sabekwayo', position: 'Educator', subject: 'Commerce', category: 'Educators' },
  { name: 'Ms. B. Mapboyi', position: 'Educator', subject: 'IsiXhosa', category: 'Educators' },
  { name: 'Ms. Y. Manyaba', position: 'Educator', subject: 'Natural Sciences', category: 'Educators' },
  { name: 'Ms. N. Dlamini', position: 'Educator', subject: 'Life Sciences', category: 'Educators' },
  { name: 'Mr. S.S. Mhlongo', position: 'Educator', subject: 'Economics', category: 'Educators' },
  { name: 'Ms. A.M. Makatla', position: 'Educator', subject: 'Sesotho', category: 'Educators' },
  { name: 'Ms. T. Simetsha', position: 'Educator', subject: 'Life Orientation', category: 'Educators' },
  { name: 'Ms. O. Bubu', position: 'Educator', subject: 'EMS', category: 'Educators' },
  { name: 'Ms. T. Vikwa', position: 'Educator', subject: 'Life Sciences', category: 'Educators' },
  { name: 'Mr. L. Bam', position: 'Educator', subject: 'Mathematics', category: 'Educators' },
  { name: 'Mr. S. Sibobi', position: 'Educator', subject: 'English', category: 'Educators' },
  { name: 'Mr. P. Dlomo', position: 'Educator', subject: 'Mathematics', category: 'Educators' },
  { name: 'Mr. Siwela', position: 'Educator', subject: 'Creative Arts & Life Orientation', category: 'Educators' },
  { name: 'Mr. Z. Harris', position: 'Educator', subject: 'Natural Sciences', category: 'Educators' },
  { name: 'Ms. Cindy Mpohlo', position: 'Educator', subject: 'Physical Sciences & Mathematics', category: 'Educators' },
  { name: 'Mr. Yanga Ngcobo', position: 'Educator', subject: 'EMS & Mathematics', category: 'Educators' },
  { name: 'Ms. Athiphila Siko', position: 'Educator', subject: 'English & Music', category: 'Educators' },
  { name: 'Mr. P. Khambula', position: 'Educator', subject: 'Physical Sciences', category: 'Educators' },
  { name: 'Mr. Ndiphiwe Sabokwe', position: 'Learner Support Assistant', category: 'Educators' },
  { name: 'Mr. L. Maqashalala', position: 'Educator', subject: 'Geography & Social Sciences', category: 'Educators' },
  { name: 'Mr. M. Matyeni', position: 'Educator', subject: 'Mathematics & Science', category: 'Educators' },
  { name: 'Mr. M. Mokena', position: 'Educator', category: 'Educators' },

  // Admin & Support
  { name: 'Ms. Z. Dingana', position: 'Administrator', category: 'Support Staff' },
  { name: 'Ms. S.C. Gecelo', position: 'Administrator', category: 'Support Staff' },
  { name: 'Ms. N. Tshotsho', position: 'Administrator (Hostel)', category: 'Support Staff' },
  { name: 'Mr. S.M. Ludidi', position: 'Support Staff', category: 'Support Staff' },
];

const categories = [
  'Leadership',
  'Departmental Heads',
  'Educators',
  'Support Staff',
];

const StaffCard = ({ member }: { member: StaffMember }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center p-6 text-center border border-[#dde3f0] hover:-translate-y-1">
    <div className="w-24 h-24 rounded-full bg-[#e8f5ee] border-4 border-[#c5e0d0] flex items-center justify-center mb-4 overflow-hidden">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <User size={40} className="text-school-green opacity-25" />
      )}
    </div>
    <h3 className="text-sm font-bold text-gray-900 leading-tight">{member.name}</h3>
    <p className="text-xs text-school-green font-semibold mt-1">{member.position}</p>
    {member.subject && (
      <span className="mt-2 inline-block bg-[#e8f5ee] text-school-green text-xs font-medium px-3 py-1 rounded-full">
        {member.subject}
      </span>
    )}
  </div>
);

export const Staff = () => {
  const [activeCategory, setActiveCategory] = React.useState('Leadership');
  const filtered = staffData.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-school-green">
            Our Staff
          </h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-4 bg-school-green" />
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
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 hover:shadow-md ${
                activeCategory === cat
                  ? 'bg-school-green text-white border-school-green'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
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
      </div>
    </div>
  );
};
