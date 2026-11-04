import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import RiskManagementPage from './RiskManagementPage';
import VideoManagementPage from './VideoManagementPage';
import VideoFolderPage from './VideoFolderPage';
import ReportsPage from './ReportsPage';
import RiskHistoryPage from './RiskHistoryPage';
import PlaceholderPage from './PlaceholderPage';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import { checkLoginId, login, signup } from './api/auth';

const ReportDetailPage = lazy(() => import('./ReportDetailPage'));
const IndividualReportDetailPage = lazy(() => import('./IndividualReportDetailPage'));
const WorkerLayout = lazy(() => import('./layouts/WorkerLayout'));
const WorkerHomePage = lazy(() => import('./WorkerHomePage'));
const WorkerActionsPage = lazy(() => import('./WorkerActionsPage'));
const WorkerRiskDetailPage = lazy(() => import('./WorkerRiskDetailPage'));
const WorkerUploadPage = lazy(() => import('./WorkerUploadPage'));
const WorkerNotificationsPage = lazy(() => import('./WorkerNotificationsPage'));

function WorkerLoadingFallback() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f4f7f9] text-sm font-semibold text-[#74818a]" role="status">
      작업자 화면을 불러오고 있습니다…
    </div>
  );
}

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
          <Route path="/history" element={<RiskHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/individual/:reportId" element={<Suspense fallback={<div className="grid min-h-[520px] place-items-center text-sm text-app-text-soft">개별 PDF 보고서를 불러오고 있습니다…</div>}><IndividualReportDetailPage /></Suspense>} />
          <Route path="/reports/:reportId" element={<Suspense fallback={<div className="grid min-h-[520px] place-items-center text-sm text-app-text-soft">PDF 보고서를 불러오고 있습니다…</div>}><ReportDetailPage /></Suspense>} />
          <Route path="/settings" element={<PlaceholderPage title="환경설정" />} />
        </Route>
        <Route path="/worker" element={<Suspense fallback={<WorkerLoadingFallback />}><WorkerLayout /></Suspense>}>
          <Route index element={<WorkerHomePage />} />
          <Route path="actions" element={<WorkerActionsPage />} />
          <Route path="actions/:riskId" element={<WorkerRiskDetailPage />} />
          <Route path="upload" element={<WorkerUploadPage />} />
          <Route path="notifications" element={<WorkerNotificationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
