import { useContext } from 'react';
import { DashboardContext } from '../contexts/DashboardContextDefinition';

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
