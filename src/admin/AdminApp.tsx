import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import Messages from './pages/Messages';
import ProjectsAdmin from './pages/ProjectsAdmin';
import ServicesAdmin from './pages/ServicesAdmin';
import TestimonialsAdmin from './pages/TestimonialsAdmin';
import SiteAdmin from './pages/SiteAdmin';
import SeoAdmin from './pages/SeoAdmin';
import SettingsAdmin from './pages/SettingsAdmin';

/** Everything under /admin. Loaded as one lazy chunk, so visitors never download it. */
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="messages" element={<Messages />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="services" element={<ServicesAdmin />} />
        <Route path="testimonials" element={<TestimonialsAdmin />} />
        <Route path="site" element={<SiteAdmin />} />
        <Route path="seo" element={<SeoAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
