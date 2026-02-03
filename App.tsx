import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from './services/firebaseConfig';
import { Team, Meeting, MeetingAnalysis } from './types';
import MeetingRecorder from './components/MeetingRecorder';
import JoinTeam from './components/JoinTeam';
import ViewMeetingModal from './components/ViewMeetingModal';
import { LayoutDashboard, Users, LogOut, Briefcase, Plus, AlertCircle, Calendar, CheckSquare, Lightbulb, Link as LinkIcon, Copy, Eye } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isDemo } = useAuth();
  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-brand-600 text-white p-1.5 rounded-lg">
          <Briefcase className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">BD Sync</span>
        {isDemo && (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Demo Mode
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

const LoginView: React.FC = () => {
  const { user, signIn, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to BD Sync</h1>
        <p className="text-slate-500 mb-8">Secure meeting management and AI-powered insights for Business Development teams.</p>
        <button
          onClick={signIn}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>
      </div>
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Department Overview</h2>
          <p className="text-slate-500 text-sm">Manage teams and invite members.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Team
        </button>
      </div>

      {loading ? <p>Loading teams...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team.id} className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all h-full hover:border-brand-300 flex flex-col">
              <Link to={`/team/${team.id}`} className="block p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-50 text-brand-600 p-3 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.memberIds.length} members assigned</p>
              </Link>

              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
                <Link to={`/team/${team.id}`} className="text-sm text-brand-600 font-medium hover:underline">
                  View Dashboard
                </Link>
                <button
                  onClick={() => copyInviteLink(team.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-300 hover:text-brand-700 transition-colors"
                  title="Copy Invite Link"
                >
                  <LinkIcon className="w-3 h-3" /> Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Modal Implementation */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Team</h3>
            <input
              type="text"
              placeholder="Team Name (e.g. Delta Force)"
              className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || isCreating}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

  useEffect(() => {
    const fetchMeetings = async () => {
      // Fetch meetings for both list AND record mode (to get previous meeting context)
      if (id && !isDemo) {
        setIsLoadingMeetings(true);
        try {
          // Simple query. Note: Sorting in JS to avoid index requirements for MVP.
          const q = query(collection(db, 'meetings'), where('teamId', '==', id));
          const snapshot = await getDocs(q);
          const fetchedMeetings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Meeting));

          // Sort by date descending (newest first)
          fetchedMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setMeetings(fetchedMeetings);
        } catch (error) {
          console.error("Error fetching meetings:", error);
        } finally {
          setIsLoadingMeetings(false);
        }
      }
    };
    fetchMeetings();
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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          {user?.role === 'admin' && (
            <Link to="/" className="text-xs text-gray-500 hover:text-brand-600 mb-1 block">&larr; Back to Dashboard</Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Team Workspace: <span className="text-brand-600">{id}</span></h1>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={startNewMeeting}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'record' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {editingMeeting ? 'Editing Meeting' : 'New Meeting'}
          </button>
          <button
            onClick={() => { setActiveTab('list'); setEditingMeeting(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            History
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 p-6 overflow-hidden overflow-y-auto">
        {activeTab === 'record' ? (
          <MeetingRecorder
            teamId={id || ''}
            onSave={handleSave}
            lastMeeting={latestMeeting}
            initialData={editingMeeting}
          />
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {isDemo ? (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                <h3 className="text-amber-900 font-bold flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5" /> Demo Mode: History Unavailable</h3>
                <p className="text-amber-800 text-sm">Since no Firestore keys were provided, meeting history cannot be retrieved. In a production environment, this would list all previous meetings for {id}.</p>
              </div>
            ) : (
              <>
                {isLoadingMeetings ? (
                  <div className="bg-white p-8 rounded-xl text-center border border-gray-200">
                    <p className="text-gray-500">Loading meeting history...</p>
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No meetings recorded</h3>
                    <p className="text-gray-500 mt-2">Start a new meeting to generate insights.</p>
                    <button onClick={startNewMeeting} className="mt-4 text-brand-600 font-medium hover:underline">
                      Start New Meeting
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            <span className="text-gray-300">|</span>
                            {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex gap-3">
                              <button
                                onClick={() => viewMeeting(meeting)}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <button
                                onClick={() => editMeeting(meeting)}
                                className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                              >
                                Edit Meeting
                              </button>
                            </div>
                            {meeting.lastEditedBy && (
                              <span className="text-[10px] text-gray-400 italic">
                                Last Edited by {meeting.lastEditedBy} {meeting.lastEditedAt ? `at ${new Date(meeting.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${new Date(meeting.lastEditedAt).toLocaleDateString()}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Summary</h4>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {meeting.analysis?.summary || meeting.rawNotes.substring(0, 200) + '...'}
                            </p>
                          </div>

                          {meeting.analysis && (
                            <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                              <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <CheckSquare className="w-3 h-3" /> Action Items
                                </h4>
                                <ul className="space-y-2">
                                  {meeting.analysis.action_items.slice(0, 3).map((item, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">{item.owner}</span>
                                      <span className="text-gray-700">{item.task}</span>
                                    </li>
                                  ))}
                                  {meeting.analysis.action_items.length > 3 && (
                                    <li className="text-xs text-gray-400 italic">+{meeting.analysis.action_items.length - 3} more items</li>
                                  )}
                                </ul>
                              </div>

                              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-3 h-3" /> Strategic Insight
                                </h4>
                                <p className="text-sm text-gray-700 italic">"{meeting.analysis.suggestions}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {
        viewingMeeting && (
          <ViewMeetingModal
            meeting={viewingMeeting}
            onClose={() => setViewingMeeting(null)}
            onEdit={(m) => { setViewingMeeting(null); editMeeting(m); }}
          />
        )
      }
    </div >
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
              <>
                <Navbar />
                <DashboardRouter />
              </>
            </ProtectedRoute>
          } />
          <Route path="/team/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <TeamDetail />
              </>
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