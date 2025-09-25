import pool from "config/db";

export interface ComparativeStats {
  total_events: number;
  total_events_previous_month: number;
  total_participants: number;
  total_participants_previous_month: number;
  active_events: number;
  active_events_previous_month: number;
  upcoming_events: number;
  upcoming_events_previous_month: number;
  total_users: number;
  total_users_previous_month: number;
  recent_registrations: number;
  recent_registrations_previous_month: number;
}

export interface StatsRepository {
  getComparativeStats(): Promise<ComparativeStats>;
  getMonthlyGrowth(): Promise<{
    events_growth: number;
    participants_growth: number;
    active_events_growth: number;
    upcoming_events_growth: number;
    users_growth: number;
    registrations_growth: number;
  }>;
}

class StatsRepositoryImpl implements StatsRepository {
  async getComparativeStats(): Promise<ComparativeStats> {
    const query = `
      WITH current_month AS (
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN event_date > CURRENT_TIMESTAMP THEN 1 END) as upcoming_events,
          COUNT(CASE WHEN event_date <= CURRENT_TIMESTAMP AND event_date >= CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 1 END) as active_events,
          COALESCE(SUM(r.registered_count), 0) as total_participants
        FROM events e
        LEFT JOIN (
          SELECT event_id, COUNT(*) as registered_count
          FROM registrations 
          WHERE status = 'registered'
          GROUP BY event_id
        ) r ON e.event_id = r.event_id
        WHERE e.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ),
      previous_month AS (
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN event_date > CURRENT_TIMESTAMP THEN 1 END) as upcoming_events,
          COUNT(CASE WHEN event_date <= CURRENT_TIMESTAMP AND event_date >= CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 1 END) as active_events,
          COALESCE(SUM(r.registered_count), 0) as total_participants
        FROM events e
        LEFT JOIN (
          SELECT event_id, COUNT(*) as registered_count
          FROM registrations 
          WHERE status = 'registered'
          GROUP BY event_id
        ) r ON e.event_id = r.event_id
        WHERE e.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND e.created_at < DATE_TRUNC('month', CURRENT_DATE)
      ),
      current_users AS (
        SELECT COUNT(*) as total_users
        FROM users 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ),
      previous_users AS (
        SELECT COUNT(*) as total_users
        FROM users 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
      ),
      current_registrations AS (
        SELECT COUNT(*) as recent_registrations
        FROM registrations 
        WHERE registered_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND status = 'registered'
      ),
      previous_registrations AS (
        SELECT COUNT(*) as recent_registrations
        FROM registrations 
        WHERE registered_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND registered_at < DATE_TRUNC('month', CURRENT_DATE)
          AND status = 'registered'
      )
      SELECT 
        cm.total_events,
        pm.total_events as total_events_previous_month,
        cm.total_participants,
        pm.total_participants as total_participants_previous_month,
        cm.active_events,
        pm.active_events as active_events_previous_month,
        cm.upcoming_events,
        pm.upcoming_events as upcoming_events_previous_month,
        cu.total_users,
        pu.total_users as total_users_previous_month,
        cr.recent_registrations,
        pr.recent_registrations as recent_registrations_previous_month
      FROM current_month cm
      CROSS JOIN previous_month pm
      CROSS JOIN current_users cu
      CROSS JOIN previous_users pu
      CROSS JOIN current_registrations cr
      CROSS JOIN previous_registrations pr
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  async getMonthlyGrowth(): Promise<{
    events_growth: number;
    participants_growth: number;
    active_events_growth: number;
    upcoming_events_growth: number;
    users_growth: number;
    registrations_growth: number;
  }> {
    const stats = await this.getComparativeStats();
    
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      events_growth: calculateGrowth(stats.total_events, stats.total_events_previous_month),
      participants_growth: calculateGrowth(stats.total_participants, stats.total_participants_previous_month),
      active_events_growth: calculateGrowth(stats.active_events, stats.active_events_previous_month),
      upcoming_events_growth: calculateGrowth(stats.upcoming_events, stats.upcoming_events_previous_month),
      users_growth: calculateGrowth(stats.total_users, stats.total_users_previous_month),
      registrations_growth: calculateGrowth(stats.recent_registrations, stats.recent_registrations_previous_month)
    };
  }
}

export const statsRepository = new StatsRepositoryImpl();
export { StatsRepositoryImpl };
