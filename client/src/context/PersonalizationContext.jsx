import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const PersonalizationContext = createContext(null);

export const CONTEXT_MODES = [
  'Learning',
  'Building Project',
  'Interview Preparation',
  'Exam Preparation',
  'Career Planning'
];

export function PersonalizationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [persona, setPersona] = useState(null);
  const [currentContext, setCurrentContext] = useState('Learning');
  const [isLoading, setIsLoading] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  const fetchPersona = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await api.get('/persona');
      if (res.data?.success) {
        const p = res.data.data.persona;
        setPersona(p);
        if (p.currentContext) setCurrentContext(p.currentContext);
      }
    } catch (err) {
      console.warn('Error loading persona:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPersona();
    } else {
      setPersona(null);
    }
  }, [isAuthenticated]);

  // Requirement 13: Instant Context Switching
  const handleSwitchContext = async (newMode) => {
    try {
      setIsLoading(true);
      const res = await api.post('/context', { context: newMode });
      if (res.data?.success) {
        setCurrentContext(newMode);
        if (res.data.data.persona) {
          setPersona(res.data.data.persona);
        }
        setLastNotification(`Context mode updated to "${newMode}". Recommendations recalibrated.`);
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to switch context:', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPersona = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/persona/reset');
      if (res.data?.success) {
        setPersona(res.data.data.persona);
        setLastNotification('Persona reset to explicit onboarding baseline.');
        return res.data.data.persona;
      }
    } catch (err) {
      console.error('Failed to reset persona:', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBehavioral = async (enabled) => {
    try {
      const res = await api.post('/persona/toggle-behavioral', { enabled });
      if (res.data?.success) {
        setPersona(prev => prev ? { ...prev, behavioralPersonalizationEnabled: enabled } : null);
        setLastNotification(
          enabled
            ? 'Behavioral personalization enabled: persona actively adapts to actions.'
            : 'Behavioral personalization disabled: only explicit onboarding preferences will be used.'
        );
      }
    } catch (err) {
      console.error('Failed to toggle behavioral personalization:', err.message);
      throw err;
    }
  };

  return (
    <PersonalizationContext.Provider
      value={{
        persona,
        currentContext,
        availableContexts: CONTEXT_MODES,
        isLoading,
        switchContext: handleSwitchContext,
        resetPersona: handleResetPersona,
        toggleBehavioral: handleToggleBehavioral,
        refreshPersona: fetchPersona,
        lastNotification,
        clearNotification: () => setLastNotification(null)
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) throw new Error('usePersonalization must be used within PersonalizationProvider');
  return ctx;
}
