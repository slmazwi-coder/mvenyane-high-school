import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-school-green text-white pt-12 pb-8 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Grid: stacks on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Col 1 — Logo + Name + Socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-white/95 overflow-hidden border border-white/20 shadow-lg">
                <img
                  src="./assets/logo.png"
                  alt="Mvenyane SSS logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">
                  Mvenyane Senior Secondary School
                </h3>
                <p className="text-white/70 text-sm italic mt-0.5">"Education is the key to success"</p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/MvenyaneSSSOfficial/"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Col 2 — Contact */}
          <div>
            <h4 className="text-sm font-bold mb-4 border-b border-white/20 pb-2 uppercase tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3 text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="shrink-0 mt-0.5" size={16} />
                <span>Mvenyane A/A, Cedarville, 4735 (Eastern Cape)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>082 768 8305</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>082 083 7333</span>
              </li>
            </ul>
          </div>

          {/* Col 3 — Email */}
          <div>
            <h4 className="text-sm font-bold mb-4 border-b border-white/20 pb-2 uppercase tracking-wide">
              Email
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="shrink-0 mt-0.5 text-white/80" />
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wide font-semibold mb-0.5">Principal</p>
                  <a
                    href="mailto:principal@mvenyanehighschool.com"
                    className="text-white/80 hover:text-white transition-colors break-all"
                  >
                    principal@mvenyanehighschool.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="shrink-0 mt-0.5 text-white/80" />
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wide font-semibold mb-0.5">Admin</p>
                  <a
                    href="mailto:admin@mvenyanehighschool.com"
                    className="text-white/80 hover:text-white transition-colors break-all"
                  >
                    admin@mvenyanehighschool.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="shrink-0 mt-0.5 text-white/80" />
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wide font-semibold mb-0.5">Hostel</p>
                  <a
                    href="mailto:hostel@mvenyanehighschool.com"
                    className="text-white/80 hover:text-white transition-colors break-all"
                  >
                    hostel@mvenyanehighschool.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4 — School Hours */}
          <div>
            <h4 className="text-sm font-bold mb-4 border-b border-white/20 pb-2 uppercase tracking-wide">
              School Hours
            </h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex justify-between gap-4">
                <span>Mon – Thu</span>
                <span className="font-medium">07:30 – 15:30</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Friday</span>
                <span className="font-medium">07:30 – 13:30</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sat – Sun</span>
                <span className="font-medium">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 text-center text-white/60 text-xs">
          <p>&copy; {new Date().getFullYear()} Mvenyane Senior Secondary School. All Rights Reserved.</p>
          <Link
            to="/admin/login"
            className="text-white/30 hover:text-white/60 text-xs mt-2 inline-block transition-colors"
          >
            Staff Portal
          </Link>
          <br />
          <a
            href="https://agethirty4.co.za"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 text-xs mt-1 inline-block transition-colors"
          >
            Powered by AGE34
          </a>
        </div>

      </div>
    </footer>
  );
};
