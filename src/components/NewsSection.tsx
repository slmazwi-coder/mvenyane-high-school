import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Info } from 'lucide-react';
import { getNews, type NewsItem } from '../admin/utils/storage';

export const NewsSection = () => {
  const [notices, setNotices] = useState<NewsItem[]>(getNews());

  useEffect(() => {
    setNotices(getNews());
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-school-green flex items-center gap-2">
            <Bell className="text-yellow-500" /> News & Notices
          </h2>
          <button className="text-school-green font-semibold hover:underline">View All</button>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            No active notices at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {notices.map((notice) => (
              <div key={notice.id} className="card flex flex-col h-full border-l-4 border-l-school-green">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={14} />
                  <span>{notice.date}</span>
                  <span className="ml-auto px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider">
                    Update
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{notice.title}</h3>
                <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">{notice.content}</p>
                <button className="text-school-green font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  Read More <Info size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
