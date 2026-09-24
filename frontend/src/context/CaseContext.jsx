import React, { createContext, useContext, useState, useEffect } from 'react';
import { caseService } from '../services/api';

const CaseContext = createContext();

export const CaseProvider = ({ children }) => {
  const [activeCaseId, setActiveCaseId] = useState('CASE-2026-001');
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshCases = async () => {
    try {
      const res = await caseService.getCases();
      setCases(res.data);
      const curr = res.data.find(c => c.id === activeCaseId) || res.data[0];
      if (curr) setActiveCase(curr);
    } catch (e) {
      console.error('Failed to fetch cases:', e);
    }
  };

  useEffect(() => {
    refreshCases();
  }, [activeCaseId]);

  const selectCase = (caseId) => {
    setActiveCaseId(caseId);
    const found = cases.find(c => c.id === caseId);
    if (found) setActiveCase(found);
  };

  return (
    <CaseContext.Provider value={{
      activeCaseId,
      activeCase,
      cases,
      selectCase,
      refreshCases,
      selectedEntityId,
      setSelectedEntityId,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => useContext(CaseContext);
