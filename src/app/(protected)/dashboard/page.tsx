import { createClient, getCachedUser } from '@/lib/supabase/server';
import { NewProjectButton } from '@/components/dashboard/NewProjectButton';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { calculateSCurve } from '@/lib/scurve';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await getCachedUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('system_role')
    .eq('id', user!.id)
    .single();

  const isSuperadmin = profile?.system_role === 'superadmin';

  type ProjectData = {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    owner_id: string;
    userRole: 'owner' | 'superadmin' | 'admin' | 'editor' | 'viewer';
  };

  let allProjects: ProjectData[] = [];

  if (isSuperadmin) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    allProjects = (data || []).map(p => ({
      ...p,
      userRole: p.owner_id === user!.id ? 'owner' : 'superadmin'
    }));
  } else {
    // Fetch projects where user is owner or member
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user!.id)
      .order('created_at', { ascending: false });

    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id, role, projects(*)')
      .eq('user_id', user!.id);

    // Deduplicate: filter out member projects where the user is already the owner
    const ownedIds = new Set((ownedProjects || []).map((p) => p.id));
    const filteredMemberProjects = (memberProjects || []).filter(
      (m: { project_id: string }) => !ownedIds.has(m.project_id)
    );

    allProjects = [
      ...(ownedProjects || []).map((p) => ({ ...p, userRole: 'owner' as const })),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...filteredMemberProjects.map((m: { projects: any; role: string }) => ({
        ...(Array.isArray(m.projects) ? m.projects[0] : m.projects || {}),
        userRole: m.role,
      })).filter((p) => p.id), // Filter out missing/null projects
    ];
  }

  // PRE-FETCH OPTIMIZADO (Elimina N+1 de ProjectCard)
  const projectIds = allProjects.map(p => p.id);

  // 1. Fetch de Alertas
  const { data: allAlerts } = await supabase
    .from('alerts')
    .select('project_id')
    .in('project_id', projectIds)
    .eq('is_read', false);

  const unreadAlertsMap = (allAlerts || []).reduce((acc: Record<string, number>, alert) => {
    acc[alert.project_id] = (acc[alert.project_id] || 0) + 1;
    return acc;
  }, {});

  // 2. Fetch de Partidas y Actividades
  const { data: allPartidas } = await supabase
    .from('partidas')
    .select('project_id, items(activities(*))')
    .in('project_id', projectIds);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activitiesByProject: Record<string, any[]> = {};
  const allActivityIds: string[] = [];

  (allPartidas || []).forEach(p => {
    const projId = p.project_id;
    if (!activitiesByProject[projId]) activitiesByProject[projId] = [];
    
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acts = (p.items || []).flatMap((i: any) => i.activities || []);
    activitiesByProject[projId].push(...acts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    allActivityIds.push(...acts.map((a: any) => a.id));
  });

  // 3. Fetch de Daily Progress
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allDailyProgress: any[] = [];
  if (allActivityIds.length > 0) {
    const { data: dpData } = await supabase
      .from('daily_progress')
      .select('*')
      .in('activity_id', allActivityIds);
    allDailyProgress = dpData || [];
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyProgressByActivity = allDailyProgress.reduce((acc: Record<string, any[]>, dp) => {
    if (!acc[dp.activity_id]) acc[dp.activity_id] = [];
    acc[dp.activity_id].push(dp);
    return acc;
  }, {});

  // 4. Precalcular Métricas
  const projectsWithMetrics = allProjects.map(project => {
    const activities = activitiesByProject[project.id] || [];
    const dailyProgress = activities.flatMap(a => dailyProgressByActivity[a.id] || []);
    
    // Memoización: pasamos los datos precalculados a la card
    const scurveData = calculateSCurve(
      project.start_date,
      project.end_date,
      activities,
      dailyProgress
    );

    return {
      ...project,
      unreadAlerts: unreadAlertsMap[project.id] || 0,
      scurveData
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">Mis Proyectos</h1>
          <p className="text-sm text-surface-200/60 mt-1">
            {allProjects.length} proyecto{allProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <NewProjectButton />
      </div>

      {/* Projects Grid */}
      {allProjects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-400/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            Sin proyectos aún
          </h3>
          <p className="text-sm text-surface-200/60 mb-6">
            Crea tu primer proyecto para comenzar a planificar
          </p>
          <NewProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithMetrics.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              unreadAlerts={project.unreadAlerts} 
              scurveData={project.scurveData} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
