import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from './services/firebaseConfig';
import { Team, Meeting, MeetingAnalysis } from './types';
import MeetingRecorder from './components/MeetingRecorder';
import JoinTeam from './components/JoinTeam';
import ViewMeetingModal from './components/ViewMeetingModal';
import { Layout } from './components/Layout';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { PageTransition } from './components/ui/PageTransition';
import { Input } from './components/ui/Input';
import { Users, LogOut, Briefcase, Plus, AlertCircle, Calendar, CheckSquare, Lightbulb, Link as LinkIcon, Eye, ArrowRight, Sparkles, ChevronDown, FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './components/ui/Logo';

const LoginView: React.FC = () => {
  const { user, signIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-400/30 rounded-full blur-[120px] animate-blob mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
      </div>

      <PageTransition className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl backdrop-blur-3xl text-center border-white/40">
          <div className="flex justify-center mb-8">
            <Logo className="scale-125" />
          </div>
          <p className="text-slate-600 mb-10 text-lg leading-relaxed">
            The intelligent workspace for high-velocity Business Development teams.
          </p>

          <Button
            onClick={signIn}
            variant="primary"
            size="lg"
            className="w-full rounded-2xl text-lg h-14 shadow-xl shadow-brand-500/20 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
              Sign in with Google
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Button>

          <p className="mt-8 text-xs text-slate-400 font-medium tracking-wide">
            SECURE ACCESS • ENTERPRISE READY
          </p>
        </div>
      </PageTransition>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemo, user } = useAuth();

  // Protect Admin Dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />; // Will trigger DashboardRouter logic
  }

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      // Return mock data immediately if in Demo Mode
      if (isDemo) {
        setTeams([
          { id: 'team-alpha', name: 'Alpha Squad (Enterprise)', memberIds: [] },
          { id: 'team-beta', name: 'Beta Force (SMB)', memberIds: [] },
          { id: 'team-gamma', name: 'Gamma Growth (Partnerships)', memberIds: [] },
        ]);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'teams'));
        const snapshot = await getDocs(q);
        const fetchedTeams: Team[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
        setTeams(fetchedTeams);
      } catch (e) {
        console.error("Error fetching teams", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [isDemo]);

  const copyInviteLink = (teamId: string) => {
    const link = `${window.location.origin}/#/join/${teamId}`;
    navigator.clipboard.writeText(link);
    alert(`Invitation link copied!\n${link}`);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, 'teams'), {
        name: newTeamName,
        memberIds: [],
        createdAt: serverTimestamp()
      });
      // Optimistic update
      setTeams([...teams, { id: docRef.id, name: newTeamName, memberIds: [] }]);
      setNewTeamName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Department Overview</h2>
          <p className="text-slate-500 font-medium">Manage your sales squads and performance.</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Team
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/50 animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team, idx) => (
            <Card
              key={team.id}
              variant="interactive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col h-full border-transparent hover:border-brand-200/50"
            >
              <Link to={`/team/${team.id}`} className="block p-7 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-brand-50 text-brand-600 p-3.5 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-brand-500/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-100 uppercase tracking-wider">
                    {team.memberIds.length} Reps
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{team.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Active pipeline management and meeting tracking.</p>
              </Link>

              <div className="p-4 px-7 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <Link to={`/team/${team.id}`} className="text-sm font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1 transition-colors">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyInviteLink(team.id)}
                  className="h-8 text-xs bg-white hover:bg-white text-slate-500"
                  title="Copy Invite Link"
                >
                  <LinkIcon className="w-3 h-3 mr-1.5" /> Invite
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modern Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Briefcase className="w-24 h-24 text-brand-900" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Create New Team</h3>
              <p className="text-slate-500 mb-8 relative z-10">Establish a new squad for tracking.</p>

              <Input
                placeholder="Team Name (e.g. Delta Force)"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                autoFocus
                className="mb-8"
              />

              <div className="flex justify-end gap-3 relative z-10">
                <Button
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || isCreating}
                  isLoading={isCreating}
                >
                  Create Team
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

const MeetingCard: React.FC<{
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  idx: number;
}> = ({ meeting, onEdit, idx }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      variant="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`overflow-hidden group transition-all duration-300 ${isExpanded ? 'ring-2 ring-brand-500/20' : 'hover:scale-[1.01]'}`}
    >
      <div
        className="bg-white/40 px-6 py-4 border-b border-white/50 flex justify-between items-center cursor-pointer hover:bg-white/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`bg-white p-2 rounded-lg shadow-sm transition-colors ${isExpanded ? 'text-brand-600 bg-brand-50' : 'text-brand-500'}`}>
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">
              {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onEdit(meeting); }}
              className="h-8 text-xs"
            >
              Edit
            </Button>
          </div>
          {meeting.lastEditedBy && (
            <span className="text-[10px] text-slate-400 font-medium">
              Edited by {meeting.lastEditedBy}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 border-t border-white/50">
              {meeting.analysis?.summary && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Executive Summary</h4>
                  <div
                    className="rich-text text-slate-700 text-sm leading-relaxed pl-4 border-l-2 border-brand-200"
                    dangerouslySetInnerHTML={{ __html: meeting.analysis.summary }}
                  />
                </div>
              )}

              {meeting.analysis && (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {meeting.analysis.action_items && meeting.analysis.action_items.length > 0 && (
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-white/50">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckSquare className="w-3 h-3" /> Action Items
                      </h4>
                      <ul className="space-y-2.5">
                        {meeting.analysis.action_items.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2.5">
                            <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 shadow-sm">{item.owner}</span>
                            <span className="text-slate-600 leading-snug">{item.task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meeting.analysis.suggestions && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Strategic Insight
                      </h4>
                      <p className="text-sm text-amber-900/80 italic leading-relaxed">"{meeting.analysis.suggestions}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Original Notes Section */}
              {meeting.rawNotes && (
                <div className="pt-6 border-t border-slate-200/60">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1 mb-3">
                    <FileText className="w-4 h-4" /> Original Notes
                  </h3>
                  <div
                    className="text-sm text-slate-500 leading-relaxed px-5 py-3 border-l-4 border-slate-200 pl-4 bg-slate-100/30 rounded-r-xl"
                    dangerouslySetInnerHTML={{ __html: meeting.rawNotes }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'record'>('record');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);

  // Security check: If member, ensure they match the team ID
  if (user?.role === 'member' && user.teamId !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">You do not have permission to view this team's workspace.</p>
          <Link to="/" className="mt-6 inline-block text-brand-600 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const [teamMembers, setTeamMembers] = useState<any[]>([]); // Using any[] for now to match UserProfile structure effectively

  useEffect(() => {
    const fetchMeetings = async () => {
      // Fetch meetings for both list AND record mode
      if (id && !isDemo) {
        setIsLoadingMeetings(true);
        try {
          const q = query(collection(db, 'meetings'), where('teamId', '==', id));
          const snapshot = await getDocs(q);
          const fetchedMeetings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Meeting));
          fetchedMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setMeetings(fetchedMeetings);
        } catch (error) {
          console.error("Error fetching meetings:", error);
        } finally {
          setIsLoadingMeetings(false);
        }
      }
    };

    // Fetch Team Members for Assignment Dropdown
    const fetchTeamMembers = async () => {
      if (id && !isDemo) {
        try {
          const q = query(collection(db, 'users'), where('teamId', '==', id));
          const snapshot = await getDocs(q);
          const members = snapshot.docs.map(d => d.data());
          setTeamMembers(members);
        } catch (e) {
          console.error("Error fetching team members", e);
        }
      } else if (isDemo) {
        // Mock members
        setTeamMembers([
          { uid: '1', displayName: 'Sarah Jenkins', email: 'sarah@example.com' },
          { uid: '2', displayName: 'Mike Ross', email: 'mike@example.com' },
          { uid: '3', displayName: 'Jessica Pearson', email: 'jessica@example.com' }
        ]);
      }
    };

    fetchMeetings();
    fetchTeamMembers();
  }, [id, isDemo]);

  const handleSave = async (notes: string, analysis: MeetingAnalysis) => {
    try {
      if (isDemo) {
        alert("Demo Mode: Meeting saved locally (not persisted to Firestore).");
        // Mock update local list - simplistic for demo
        setActiveTab('list');
        return;
      }

      if (!id) return;

      if (editingMeeting) {
        // Update existing meeting
        const meetingRef = doc(db, 'meetings', editingMeeting.id);
        const updateData: any = {
          rawNotes: notes,
          analysis: analysis,
          lastEditedBy: user?.displayName || user?.email || 'Unknown',
          lastEditedAt: new Date().toISOString()
        };
        await updateDoc(meetingRef, updateData);
        alert('Meeting updated successfully!');
      } else {
        // Create new meeting
        const now = new Date().toISOString();
        const userName = user?.displayName || user?.email || 'Unknown';
        await addDoc(collection(db, 'meetings'), {
          teamId: id,
          rawNotes: notes,
          analysis,
          date: now,
          createdAt: serverTimestamp(),
          createdBy: userName,
          lastEditedBy: userName,
          lastEditedAt: now
        });
        alert('Meeting saved successfully!');
      }

      // Refresh list
      const q = query(collection(db, 'meetings'), where('teamId', '==', id));
      const snapshot = await getDocs(q);
      const fetchedMeetings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Meeting));
      fetchedMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMeetings(fetchedMeetings);

      setActiveTab('list');
      setEditingMeeting(null); // Reset edit state
    } catch (e) {
      console.error("Error saving meeting", e);
      alert("Error saving to Firestore");
    }
  };

  const startNewMeeting = () => {
    setEditingMeeting(null);
    setActiveTab('record');
  }

  const editMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setActiveTab('record');
  }

  const viewMeeting = (meeting: Meeting) => {
    setViewingMeeting(meeting);
  };

  const latestMeeting = meetings.length > 0 ? meetings[0] : undefined;

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link to="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-white shadow-sm transition-all border border-slate-100">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Link>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Workspace</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID:</span>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{id}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-white/60 shadow-sm flex gap-1">
            <Button
              variant={activeTab === 'record' ? 'primary' : 'ghost'}
              size="sm"
              onClick={startNewMeeting}
              className={activeTab === 'record' ? 'shadow-brand-500/20' : ''}
            >
              {editingMeeting ? 'Editing Meeting' : 'New Meeting'}
            </Button>
            <Button
              variant={activeTab === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setActiveTab('list'); setEditingMeeting(null); }}
              className={activeTab === 'list' ? 'bg-white shadow-sm' : ''}
            >
              History
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'record' ? (
            <div className="h-full overflow-y-auto pr-1 pb-20">
              <MeetingRecorder
                teamId={id || ''}
                onSave={handleSave}
                lastMeeting={latestMeeting}
                initialData={editingMeeting}
                teamMembers={teamMembers}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-2 pb-20 space-y-6">
              {isDemo ? (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                  <h3 className="text-amber-900 font-bold flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5" /> Demo Mode: History Unavailable</h3>
                  <p className="text-amber-800 text-sm">Since no Firestore keys were provided, meeting history cannot be retrieved. In a production environment, this would list all previous meetings for {id}.</p>
                </div>
              ) : (
                <>
                  {isLoadingMeetings ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/50 animate-pulse"></div>)}
                    </div>
                  ) : meetings.length === 0 ? (
                    <div className="glass-panel p-16 rounded-3xl text-center">
                      <div className="w-20 h-20 bg-brand-50 text-brand-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">No meetings recorded</h3>
                      <p className="text-slate-500 mt-2 mb-8">Start a new meeting to generate insights.</p>
                      <Button onClick={startNewMeeting}>
                        Start New Meeting
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {meetings.map((meeting, idx) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          onEdit={editMeeting}
                          idx={idx}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {
          viewingMeeting && (
            <ViewMeetingModal
              meeting={viewingMeeting}
              onClose={() => setViewingMeeting(null)}
              onEdit={(m) => { setViewingMeeting(null); editMeeting(m); }}
            />
          )
        }
      </AnimatePresence>
    </PageTransition>
  );
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // Member routing logic: immediate redirect to their team
  if (user.role === 'member') {
    if (user.teamId) {
      return <Navigate to={`/team/${user.teamId}`} replace />;
    } else {
      // Member with no team
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Team Assigned</h2>
            <p className="text-gray-500 mb-6">You are not currently a member of any team. Please ask your administrator to send you an invitation link.</p>
          </div>
        </div>
      );
    }
  }

  // Admin sees the main dashboard
  return <AdminDashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/join/:teamId" element={<JoinTeam />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <DashboardRouter />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/team/:id" element={
            <ProtectedRoute>
              <Layout>
                <TeamDetail />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default App;