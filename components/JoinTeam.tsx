import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Team } from '../types';
import { Users, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { PageTransition } from './ui/PageTransition';

const JoinTeam: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, signIn, isDemo } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return;

      if (isDemo) {
        setTeam({ id: teamId, name: 'Demo Team', memberIds: [] });
        setLoading(false);
        return;
      }

      try {
        const teamRef = doc(db, 'teams', teamId);
        const teamSnap = await getDoc(teamRef);
        if (teamSnap.exists()) {
          setTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);
        } else {
          setError("Team not found.");
        }
      } catch (err) {
        console.error("Error fetching team", err);
        setError("Failed to load team details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId, isDemo]);

  const handleJoin = async () => {
    if (!user || !teamId) return;
    setJoining(true);

    if (isDemo) {
      // Simulate join
      setTimeout(() => {
        alert("Demo: You have joined the team!");
        navigate(`/team/${teamId}`);
      }, 1000);
      return;
    }

    try {
      // 1. Update User Profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        teamId: teamId
      });

      // 2. Add to Team's member list (redundant but useful for UI)
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        memberIds: arrayUnion(user.uid)
      });

      navigate(`/team/${teamId}`);
    } catch (err) {
      console.error("Error joining team", err);
      alert("Failed to join team. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading invitation...</div>;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Error</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={() => navigate('/')} className="mt-6 text-brand-600 font-medium hover:underline">
          Go back home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <PageTransition className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl backdrop-blur-3xl text-center border-white/60">
          <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Users className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">You've been invited!</h1>
          <p className="text-slate-500 mb-8 text-lg">
            Join the workspace for <br />
            <span className="font-bold text-slate-900 text-xl">{team?.name}</span>
          </p>

          {!user ? (
            <div className="space-y-6">
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800">
                Please sign in to accept this invitation.
              </div>
              <Button
                onClick={signIn}
                className="w-full h-14 text-lg shadow-xl shadow-slate-200/50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3 bg-white rounded-full p-0.5" alt="Google" />
                Sign in with Google
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                Signed in as <strong className="text-slate-900">{user.email}</strong>
              </div>

              <Button
                onClick={handleJoin}
                disabled={joining}
                isLoading={joining}
                className="w-full h-14 text-lg shadow-brand-500/20"
              >
                Accept Invitation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default JoinTeam;
