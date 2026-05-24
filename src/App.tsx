import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { NewsSection } from './components/NewsSection';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Staff } from './pages/Staff';
import { Documents } from './pages/Documents';
import { Achievements } from './pages/Achievements';
import { Sport } from './pages/Sport';
import { Activities } from './pages/Activities';
import { Admissions } from './pages/Admissions';
import { Boarding } from './pages/Boarding';
import { Contact } from './pages/Contact';
import { StudentLogin } from './pages/StudentLogin';
import { StudentPortal } from './pages/StudentPortal';

// Admin imports
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/Dashboard';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { NewsEditor } from './admin/editors/NewsEditor';
import { AboutEditor } from './admin/editors/AboutEditor';
import { AchievementsEditor } from './admin/editors/AchievementsEditor';
import { DocumentsEditor } from './admin/editors/DocumentsEditor';
import { ExtraCurricularEditor } from './admin/editors/ExtraCurricularEditor';
import { ApplicationsEditor } from './admin/editors/ApplicationsEditor';
import { ContactEditor } from './admin/editors/ContactEditor';
import { StudentDocsEditor } from './admin/editors/StudentDocsEditor';

const HomePage = () => (
  <>
    <Hero />
    <NewsSection />
    <Home />
  </>
);

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PageShell><HomePage /></PageShell>} />
        <Route path="/about" element={<PageShell><About /></PageShell>} />
        <Route path="/staff" element={<PageShell><Staff /></PageShell>} />
        <Route path="/documents" element={<PageShell><Documents /></PageShell>} />
        <Route path="/achievements" element={<PageShell><Achievements /></PageShell>} />
        <Route path="/sport" element={<PageShell><Sport /></PageShell>} />
        <Route path="/activities" element={<PageShell><Activities /></PageShell>} />
        <Route path="/admissions" element={<PageShell><Admissions /></PageShell>} />
        <Route path="/boarding" element={<PageShell><Boarding /></PageShell>} />
        <Route path="/contact" element={<PageShell><Contact /></PageShell>} />

        {/* Student portal routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student" element={<StudentPortal />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="news" element={<NewsEditor />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="achievements" element={<AchievementsEditor />} />
          <Route path="documents" element={<DocumentsEditor />} />
          <Route path="extra-curricular" element={<ExtraCurricularEditor />} />
          <Route path="applications" element={<ApplicationsEditor />} />
          <Route path="student-documents" element={<StudentDocsEditor />} />
          <Route path="contact" element={<ContactEditor />} />
        </Route>
      </Routes>

      <ChatbotWidget />
    </Router>
  );
}
