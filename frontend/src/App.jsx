import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import NetworkExplorer from './pages/NetworkExplorer';
import Entities from './pages/Entities';
import EntityProfile from './pages/EntityProfile';
import Timeline from './pages/Timeline';
import GeoAnalysis from './pages/GeoAnalysis';
import AlertCenter from './pages/AlertCenter';
import Documents from './pages/Documents';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CaseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cases" element={<Cases />} />
              <Route path="cases/:id" element={<CaseDetail />} />
              <Route path="network" element={<NetworkExplorer />} />
              <Route path="entities" element={<Entities />} />
              <Route path="entities/:id" element={<EntityProfile />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="map" element={<GeoAnalysis />} />
              <Route path="alerts" element={<AlertCenter />} />
              <Route path="documents" element={<Documents />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit-log" element={<AuditLog />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </CaseProvider>
    </AuthProvider>
  );
}
