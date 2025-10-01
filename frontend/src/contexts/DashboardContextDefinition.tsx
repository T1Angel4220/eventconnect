import { createContext } from 'react';
import type { 
  DashboardStatsWithGrowth,
  EventWithOrganizer, 
  TopUser, 
  EventCategory 
} from '../types/dashboard.types';
import type { MonthlyParticipantsData } from '../types/dashboard-context.types';

interface DashboardContextType {
  // Datos
  stats: DashboardStatsWithGrowth | null;
  recentEvents: EventWithOrganizer[];
  topUsers: TopUser[];
  eventCategories: EventCategory[];
  participantsData: MonthlyParticipantsData[];
  
  // Estados
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Acciones
  refreshData: () => Promise<void>;
  clearData: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
