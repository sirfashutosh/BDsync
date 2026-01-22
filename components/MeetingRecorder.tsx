import React, { useState, useEffect } from 'react';
import { generateMeetingReport } from '../services/geminiService';
import { MeetingAnalysis, Meeting } from '../types';
import { Loader2, Sparkles, CheckCircle, AlertTriangle, PlayCircle, Calendar, Clock, ChevronDown, ChevronUp, User, Plus } from 'lucide-react';

interface MeetingRecorderProps {
  teamId: string;
  onSave: (notes: string, analysis: MeetingAnalysis) => void;
  lastMeeting?: Meeting;
  initialData?: Meeting | null;
}

const MeetingRecorder: React.FC<MeetingRecorderProps> = ({ teamId, onSave, lastMeeting, initialData }) => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Initialize analysis with empty structure for manual entry
  const [analysis, setAnalysis] = useState<MeetingAnalysis>({
    summary: '',
    action_items: [{ task: '', owner: 'Unassigned' }],
    suggestions: ''
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPrevContext, setShowPrevContext] = useState(true);

  useEffect(() => {
    if (initialData) {
      setNotes(initialData.rawNotes || '');
      if (initialData.analysis) {
        setAnalysis(initialData.analysis);
      }
    } else {
      // Reset if no initial data (New Meeting)
      setNotes('');
      setAnalysis({
        summary: '',
        action_items: [{ task: '', owner: 'Unassigned' }],
        suggestions: ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Removed handleGenerate function as user wants manual entry only

  const handleSaveMeeting = () => {
    // Only save if there is some content
    if (notes.trim() || analysis.summary.trim() || analysis.action_items.some(i => i.task.trim())) {
      onSave(notes, analysis);
      // Reset state
      setNotes('');
      setAnalysis({
        summary: '',
        action_items: [{ task: '', owner: 'Unassigned' }],
        suggestions: ''
      });
    } else {
      alert("Please enter some meeting notes or summary before saving.");
    }
  };

  const updateActionItem = (index: number, field: 'task' | 'owner', value: string) => {
    const newItems = [...analysis.action_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setAnalysis({ ...analysis, action_items: newItems });
  };

  const removeActionItem = (index: number) => {
    const newItems = analysis.action_items.filter((_, i) => i !== index);
    setAnalysis({ ...analysis, action_items: newItems });
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top Bar: Date & Time - Compact */}
      <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-brand-50 p-1.5 rounded-md text-brand-600">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-orange-50 p-1.5 rounded-md text-orange-600">
              <Clock className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

        {/* COL 1: Past Context (Reference) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col bg-slate-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-slate-100/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> Last Meeting Context
            </h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            {lastMeeting ? (
              <>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Previous Summary</p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap border-l-2 border-slate-300 pl-3">
                    {lastMeeting.analysis?.summary || lastMeeting.rawNotes || "No summary available."}
                  </p>
                </div>
                {lastMeeting.analysis?.action_items && lastMeeting.analysis.action_items.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Pending Tasks</p>
                    <ul className="space-y-2">
                      {lastMeeting.analysis.action_items.map((item, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <div className="mt-0.5 min-w-[12px] h-[12px] rounded-sm border border-slate-300"></div>
                          <div className="text-xs text-slate-600">
                            <span className="text-xs font-bold text-slate-700 block mb-0.5">{item.owner}</span>
                            {item.task}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm italic">No previous meeting found.</p>
              </div>
            )}
          </div>
        </div>

        {/* COL 2: Present (Editor) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Meeting Notes
            </h3>
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full uppercase tracking-wide">Live Editor</span>
          </div>
          <textarea
            className="flex-1 w-full p-6 resize-none outline-none text-gray-700 text-base leading-relaxed focus:bg-gray-50/30 transition-colors"
            placeholder="Start typing your meeting notes here...&#10;&#10;• Key point discussed...&#10;• Decision made...&#10;• Action item assigned..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* COL 3: Future (Outcomes) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Outcomes & Tasks
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
            {/* Summary */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
              <textarea
                className="w-full text-sm text-gray-700 border border-transparent focus:border-brand-200 focus:bg-brand-50/10 rounded p-2 outline-none h-24 resize-none transition-all placeholder:text-gray-300 leading-relaxed whitespace-pre-wrap"
                placeholder="Summarize key decisions..."
                value={analysis.summary}
                onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Action Items</h4>
              <div className="space-y-2">
                {analysis.action_items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start group">
                    <User className="w-3 h-3 text-gray-400 mt-2 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <input
                        className="w-full text-xs font-bold text-blue-700 placeholder:text-blue-300 border-none p-0 focus:ring-0 bg-transparent"
                        placeholder="Owner"
                        value={item.owner}
                        onChange={(e) => updateActionItem(idx, 'owner', e.target.value)}
                      />
                      <input
                        className="w-full text-sm text-gray-700 placeholder:text-gray-300 border-b border-gray-100 focus:border-brand-300 p-0 pb-1 focus:ring-0 bg-transparent"
                        placeholder="Task description..."
                        value={item.task}
                        onChange={(e) => updateActionItem(idx, 'task', e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => removeActionItem(idx)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setAnalysis({ ...analysis, action_items: [...analysis.action_items, { task: '', owner: 'Unassigned' }] })}
                className="mt-3 w-full py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            {/* Insights */}
            <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
              <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">Strategic Insight</h4>
              <textarea
                className="w-full text-sm text-gray-700 border-none focus:ring-0 bg-transparent rounded p-0 outline-none h-16 resize-none italic placeholder:text-amber-300"
                placeholder="Key takeaway..."
                value={analysis.suggestions}
                onChange={(e) => setAnalysis({ ...analysis, suggestions: e.target.value })}
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleSaveMeeting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            >
              {initialData ? 'Update Meeting' : 'Save Meeting'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MeetingRecorder;
