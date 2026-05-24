import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // Fixed library name to prevent crash
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { getContact, type ContactInfo } from '../admin/utils/storage';

export const Contact = () => {
  const [info, setInfo] = useState<ContactInfo>(getContact());

  useEffect(() => {
    setInfo(getContact());
  }, []);

  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-school-green mb-8">Get in Touch</h2>
            <div className="space-y-8">

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-school-green rounded-xl shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Address</h3>
                  <p className="text-gray-600">{info.address || "Mvenyane A/A, Cedarville, 4735"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-school-green rounded-xl shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Phone</h3>
                  <p className="text-gray-600">{info.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-school-green rounded-xl shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <p className="text-gray-600">{info.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-school-green rounded-xl shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">School Hours</h3>
                  <p className="text-gray-600">Mon - Thu: {info.monThu}</p>
                  <p className="text-gray-600">Friday: {info.friday}</p>
                </div>
              </div>
            </div>

            {/* Google Maps Embed for Cedarville Area */}
            <div className="mt-10 rounded-2xl overflow-hidden h-64 border border-gray-200">
              <iframe
                title="School Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13900!2d28.78!3d-31.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCedarville!5e0!3m2!1sen!2sza!4v1715580000000!5m2!1sen!2sza"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 24 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-50 p-8 rounded-3xl border border-gray-100"
          >
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="Your email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Message</label>
                <textarea
                  rows={4}
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button className="bg-school-green text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors" type="button">
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
