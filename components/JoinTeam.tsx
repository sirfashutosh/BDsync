import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Team } from '../types';
import { Users, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You've been invited!</h1>
        <p className="text-gray-500 mb-8">
          You have been invited to join the team <br/>
          <span className="font-bold text-gray-900 text-lg">{team?.name}</span>
        </p>

        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
              Please sign in to accept this invitation.
            </p>
            <button
              onClick={signIn}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Sign in to Accept
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Signed in as <strong>{user.email}</strong>
            </div>
            
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {joining ? 'Joining...' : (
                <>
                  Accept Invitation <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button onClick={() => navigate('/')} className="text-gray-400 text-sm hover:text-gray-600">
                Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;
