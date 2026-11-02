import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import RiskManagementPage from './RiskManagementPage';
import VideoManagementPage from './VideoManagementPage';
import VideoFolderPage from './VideoFolderPage';
import ReportsPage from './ReportsPage';
import PlaceholderPage from './PlaceholderPage';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import { checkLoginId, login, signup } from './api/auth';

const ReportDetailPage = lazy(() => import('./ReportDetailPage'));
const IndividualReportDetailPage = lazy(() => import('./IndividualReportDetailPage'));

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
          <Route path="/risks" element={<RiskManagementPage />} />
          <Route path="/videos" element={<VideoManagementPage />} />
          <Route path="/videos/:date" element={<VideoFolderPage />} />
          <Route path="/history" element={<PlaceholderPage title="위험 이력" />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/individual/:reportId" element={<Suspense fallback={<div className="grid min-h-[520px] place-items-center text-sm text-app-text-soft">개별 PDF 보고서를 불러오고 있습니다…</div>}><IndividualReportDetailPage /></Suspense>} />
          <Route path="/reports/:reportId" element={<Suspense fallback={<div className="grid min-h-[520px] place-items-center text-sm text-app-text-soft">PDF 보고서를 불러오고 있습니다…</div>}><ReportDetailPage /></Suspense>} />
          <Route path="/settings" element={<PlaceholderPage title="환경설정" />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
