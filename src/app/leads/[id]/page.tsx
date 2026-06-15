import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LeadDetails from './LeadDetails';
import { User, Phone, Mail, FileText, Bot } from 'lucide-react';

export default async function LeadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !lead) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>
        <h1>ליד לא נמצא או שאין לך הרשאה לצפות בו</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      <LeadDetails initialLead={lead} />
    </div>
  );
}
