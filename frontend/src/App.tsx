import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingView } from './pages/LandingView';
import { LoginView } from './pages/LoginView';
import { DashboardView } from './pages/DashboardView';
import { DocumentsView } from './pages/DocumentsView';
import { ChatView } from './pages/ChatView';
import { StudyView } from './pages/StudyView';
import { SettingsView } from './pages/SettingsView';
import { authApi, getAuthToken } from './lib/apiClient';

export function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const token = getAuthToken();
    if (token) {
      return { email: 'student@teachme.ai', name: 'Academic Student' };
    }
    return null;
  });

  const handleLoginSuccess = (userObj: { email: string; name: string }) => {
    setUser(userObj);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing View */}
        <Route path="/landing" element={<LandingView />} />

        {/* Auth Route */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginView onLoginSuccess={handleLoginSuccess} />
          }
        />

        {/* Protected App Routes enclosed in AppShell */}
        <Route
          path="/*"
          element={
            user ? (
              <AppShell user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="dashboard" element={<DashboardView />} />
                  <Route path="documents" element={<DocumentsView />} />
                  <Route path="chat" element={<ChatView />} />
                  <Route path="study" element={<StudyView />} />
                  <Route path="settings" element={<SettingsView />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppShell>
            ) : (
              <LandingView />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
