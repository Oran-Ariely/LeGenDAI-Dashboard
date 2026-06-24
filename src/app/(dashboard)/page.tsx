import styles from './page.module.css';
import { Users, TrendingUp, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import TimeFilter from '@/components/TimeFilter';

export default async function Home({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const supabase = await createClient();
  
  // Fetch real data from Supabase
  let query = supabase.from('leads').select('*');
  
  if (days && days !== 'all') {
    const now = new Date();
    if (days === 'today') {
      // Set to start of today in local time/UTC
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte('created_at', todayStart);
    } else if (days === '7') {
      const pastStr = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', pastStr);
    } else if (days === '30') {
      const pastStr = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', pastStr);
    }
  }

  const { data: leads, error } = await query.order('created_at', { ascending: false });

  const totalLeads = leads?.length || 0;
  
  // Example metrics:
  const scheduledMeetings = leads?.filter(l => l.status === 'נקבעה פגישה').length || 0;
  const requireAttention = leads?.filter(l => !l.status || l.status === '' || l.status === 'ליד חדש' || l.status === 'ענה' || l.status === 'התקבלה הודעה' || l.status === 'מחכה לתשובה').length || 0;

  // Calculate total revenue from closed deals or deals with value
  const totalRevenue = leads?.reduce((sum, l) => {
    // If you only want closed deals: if (l.status === 'עסקה נסגרה') ...
    return sum + (Number(l.deal_value) || 0);
  }, 0) || 0;

  // Let's get the 5 most recent leads for "פעילות אחרונה"
  const recentLeads = leads?.slice(0, 5) || [];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>ברוכים הבאים, צוות נגה 👋</h1>
          <p className={styles.subtitle}>הנה סקירה של מה שקורה היום בעסק שלך.</p>
        </div>
        <div style={{ alignSelf: 'center' }}>
          <TimeFilter />
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
              <Users size={24} />
            </div>
            <span className={styles.statLabel}>סך הכל לידים</span>
          </div>
          <div className={styles.statValue}>{totalLeads}</div>
          <div className={styles.statTrend} style={{ color: 'var(--success)' }}>
            <TrendingUp size={16} />
            <span>מתעדכן בזמן אמת</span>
          </div>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <DollarSign size={24} />
            </div>
            <span className={styles.statLabel}>הכנסות (שווי עסקאות)</span>
          </div>
          <div className={styles.statValue}>₪{totalRevenue.toLocaleString()}</div>
          <div className={styles.statTrend} style={{ color: 'var(--success)' }}>
            <span>מבוסס על שווי עסקאות בלידים</span>
          </div>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Calendar size={24} />
            </div>
            <span className={styles.statLabel}>פגישות שנקבעו</span>
          </div>
          <div className={styles.statValue}>{scheduledMeetings}</div>
          <div className={styles.statTrend} style={{ color: 'var(--success)' }}>
            <span>מהלידים במערכת</span>
          </div>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <AlertCircle size={24} />
            </div>
            <span className={styles.statLabel}>דורשים טיפול</span>
          </div>
          <div className={styles.statValue}>{requireAttention}</div>
          <div className={styles.statTrend} style={{ color: 'var(--text-secondary)' }}>
            <span>לידים חדשים או שענו</span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={`glass-card ${styles.mainPanel}`}>
          <h2 className={styles.panelTitle}>פעילות אחרונה</h2>
          {recentLeads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentLeads.map(lead => (
                <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div>
                    <strong>
                      {lead.name && lead.name !== 'ללא שם' 
                        ? lead.name 
                        : (lead.form_data?.['שם פרטי'] 
                            ? `${lead.form_data['שם פרטי']} ${lead.form_data['שם משפחה'] || ''}` 
                            : 'ללא שם')}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.phone}</div>
                  </div>
                  <div>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              אין לידים להצגה
            </div>
          )}
        </div>
        
        <div className={`glass-card ${styles.sidePanel}`}>
          <h2 className={styles.panelTitle}>תזכורות AI</h2>
          <div className={styles.aiAlerts}>
            <div className={styles.aiAlert}>
              <div className={styles.aiIndicator}></div>
              <div>
                <strong>סוכן חכם מופעל</strong> הזיכרון לטווח ארוך מתעדכן מליד לליד ויעזור לך לסגור יותר עסקאות.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
