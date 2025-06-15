import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ModernHomePage from './pages/ModernHomePage';
import ModernPrimaryPage from './pages/ModernPrimaryPage';
import ModernPriorityBoard from './pages/ModernPriorityBoard';
import ModernBlogsPage from './pages/ModernBlogsPage';
import ModernUploadIssuePage from './pages/ModernUploadIssuePage';
import ModernHeader from './components/ModernHeader';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <ModernHeader />

          <main className="min-h-screen">
            <Routes>
              {/* Redirect root to primary page */}
              <Route path="/" element={<Navigate to="/primary" replace />} />

              {/* Main routes */}
              <Route path="/primary" element={<ModernPrimaryPage />} />
              <Route path="/issues" element={<ModernHomePage />} />
              <Route path="/priority" element={<ModernPriorityBoard />} />
              <Route path="/blogs" element={<ModernBlogsPage />} />
              <Route path="/upload-issue" element={<ModernUploadIssuePage />} />

              {/* Catch all route - redirect to primary */}
              <Route path="*" element={<Navigate to="/primary" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;