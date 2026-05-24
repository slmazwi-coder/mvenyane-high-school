import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon } from 'lucide-react';
import { getAbout, type AboutInfo } from '../admin/utils/storage';

export const About = () => {
  const [data, setData] = useState<AboutInfo>(getAbout());
  const [campusFailed, setCampusFailed] = useState(false);
  const [principalFailed, setPrincipalFailed] = useState(false);

  const campusImageUrl = '/assets/about/campus.jpg';
  const principalImageUrl = './assets/staff/principal.jpg';

  useEffect(() => {
    setData(getAbout());
  }, []);

  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Title */}
        <h1 className="section-title">About Mvenyane SSS</h1>

        {/* ── Section 1: Our School + Campus Image ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch mb-16 sm:mb-24">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="border-l-4 border-school-green pl-5 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our School</h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed text-base">
              {data.historyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>

          {/* Campus Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#eef0f7] h-[280px] sm:h-[360px]"
          >
            {!campusFailed ? (
              <img
                src={campusImageUrl}
                alt="School campus"
                className="w-full h-full object-cover"
                onError={() => setCampusFailed(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0f1f4b] via-[#1a3a7a] to-[#0f1f4b] flex items-center justify-center">
                <div className="text-center text-white/70 px-6">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                    <ImageIcon />
                  </div>
                  <div className="font-semibold">Campus image</div>
                  <div className="text-sm text-white/60 font-mono">public/assets/about/</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Section 2: Principal's Message ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-16 sm:mb-24"
        >
          {/* Section heading */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Principal's Message</h2>
            <div className="w-16 h-1 bg-school-green mx-auto rounded-full" />
          </div>

          {/* Card */}
          <div className="bg-green-50 rounded-3xl overflow-hidden shadow-lg border border-green-100">
            <div className="grid grid-cols-1 md:grid-cols-3">

              {/* Principal Photo Column */}
              <div className="flex flex-col items-center justify-center bg-school-green p-8 md:p-10">
                {/* Photo frame */}
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#4D913D] shadow-xl mb-5">
                  {!principalFailed ? (
                    <img
                      src={principalImageUrl}
                      alt="Principal"
                      className="w-full h-full object-cover object-top"
                      onError={() => setPrincipalFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0D4904]">
                      <ImageIcon className="text-white/40" size={40} />
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <h3 className="text-lg font-bold text-white text-center leading-tight">
                  {data.principalName}
                </h3>
                <p className="text-[#4D913D] text-sm font-semibold mt-1 text-center">
                  {data.principalTitle}
                </p>

                {/* Decorative divider */}
                <div className="w-10 h-0.5 bg-[#4D913D] mt-4 rounded-full opacity-60" />
              </div>

              {/* Message Column */}
              <div className="col-span-2 flex flex-col justify-center p-8 md:p-12">
                {/* Opening quote mark — decorative only, not wrapping text */}
                <div className="text-school-green text-6xl font-serif leading-none mb-2 opacity-40 select-none">
                  "
                </div>

                <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                  {data.principalMessage.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* Closing quote mark — decorative only */}
                <div className="text-school-green text-6xl font-serif leading-none mt-2 text-right opacity-40 select-none">
                  "
                </div>
              </div>

            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};
