import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
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
      </Routes>
    </BrowserRouter>
  );
}
