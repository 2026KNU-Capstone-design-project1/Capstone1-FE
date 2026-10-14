import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import PlaceholderPage from './PlaceholderPage';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import { checkLoginId, login, signup } from './api/auth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route
          path="/signup"
          element={(
            <SignupPage
              onCheckLoginId={checkLoginId}
              onSignup={signup}
            />
          )}
        />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/risks" element={<PlaceholderPage title="위험 관리" />} />
          <Route path="/videos" element={<PlaceholderPage title="영상" />} />
          <Route path="/history" element={<PlaceholderPage title="위험 이력" />} />
          <Route path="/reports" element={<PlaceholderPage title="AI 보고서" />} />
          <Route path="/settings" element={<PlaceholderPage title="환경설정" />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
