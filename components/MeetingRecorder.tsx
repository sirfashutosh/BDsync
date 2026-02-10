import React, { useState, useEffect } from 'react';
import { generateMeetingReport } from '../services/geminiService';
import { MeetingAnalysis, Meeting } from '../types';
import { Loader2, Sparkles, CheckCircle, AlertTriangle, PlayCircle, Calendar, Clock, ChevronDown, ChevronUp, User, Plus, Bold, Italic, List, ListOrdered, Save } from 'lucide-react';
import { Button } from './ui/Button';
import { UserProfile } from '../types';

interface MeetingRecorderProps {
  teamId: string;
  onSave: (notes: string, analysis: MeetingAnalysis) => void;
  lastMeeting?: Meeting;
  initialData?: Meeting | null;
  teamMembers?: UserProfile[];
}

const MeetingRecorder: React.FC<MeetingRecorderProps> = ({ teamId, onSave, lastMeeting, initialData, teamMembers = [] }) => {
  const [notes, setNotes] = useState('');
  // ... (existing state) ...
  // Initialize analysis with empty structure for manual entry
  const [analysis, setAnalysis] = useState<MeetingAnalysis>({
    summary: '',
    action_items: [{ task: '', owner: 'Unassigned' }],
    suggestions: ''
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const editorRef = React.useRef<HTMLDivElement>(null);

  // Sync initial data to editor when it changes (and editor is not focused)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== notes) {
        editorRef.current.innerHTML = notes;
      }
    }
  }, [notes]);

  useEffect(() => {
    if (initialData) {
      setNotes(initialData.rawNotes || '');
      if (initialData.analysis) {
        setAnalysis(initialData.analysis);
      }
    } else {
      // Reset 
      setNotes('');
      setAnalysis({
        summary: '',
        action_items: [{ task: '', owner: 'Unassigned' }],
        suggestions: ''
      });
    }
  }, [initialData]);

  // Keep time updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveMeeting = () => {
    if (notes.trim() || analysis.summary.trim() || analysis.action_items.some(i => i.task.trim())) {
      onSave(notes, analysis);
      // Reset state
      setNotes('');
      setAnalysis({
        summary: '',
        action_items: [{ task: '', owner: 'Unassigned' }],
        suggestions: ''
      });
      // Clear editor content manually since it's uncontrolled-ish
      const editor = document.getElementById('rich-editor');
      if (editor) editor.innerHTML = '';
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

  // Rich Text Commands
  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Focus back on editor
    const editor = document.getElementById('rich-editor');
    editor?.focus();
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Top Bar: Date & Time - Compact & Modern */}
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/60 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="bg-brand-100 text-brand-600 p-1.5 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-700">
            <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

        {/* COL 1: Past Context (Reference) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-inner">
          <div className="p-4 border-b border-slate-200/60 bg-slate-100/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> Last Meeting
            </h3>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
            {lastMeeting ? (
              <>
                <div className="bg-white/60 p-4 rounded-xl border border-white/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Summary
                  </p>
                  <div
                    className="rich-text text-xs text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: lastMeeting.analysis?.summary || lastMeeting.rawNotes || "No summary available." }}
                  />
                </div>
                {lastMeeting.analysis?.action_items && lastMeeting.analysis.action_items.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-1">Pending Tasks</p>
                    <ul className="space-y-3">
                      {lastMeeting.analysis.action_items.map((item, i) => (
                        <li key={i} className="flex gap-3 items-start p-2 rounded-lg hover:bg-white/50 transition-colors">
                          <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-brand-400 ring-4 ring-brand-100/50"></div>
                          <div className="text-xs text-slate-600">
                            <span className="text-xs font-bold text-slate-800 block mb-0.5">{item.owner}</span>
                            {item.task}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <p className="text-sm italic">No previous meeting context.</p>
              </div>
            )}
          </div>
        </div>

        {/* COL 2: Present (Editor) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-purple-500"></div>

          <div className="p-2 border-b border-slate-100 flex justify-between items-center bg-white z-10 px-4 pt-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Meeting Notes
            </h3>
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Live Editor
            </span>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-50 bg-slate-50/50">
            <button onClick={() => execCmd('bold')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors" title="Bold">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => execCmd('italic')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors" title="Italic">
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => execCmd('insertOrderedList')} className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div
            id="rich-editor"
            ref={editorRef}
            contentEditable
            className="rich-text flex-1 w-full p-8 resize-none outline-none text-slate-700 text-base leading-relaxed focus:bg-slate-50/20 transition-colors overflow-y-auto"
            style={{ minHeight: '300px' }}
            onInput={(e) => setNotes(e.currentTarget.innerHTML)}
            onBlur={(e) => setNotes(e.currentTarget.innerHTML)}
          ></div>
        </div>

        {/* COL 3: Future (Outcomes) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Outcomes & Tasks
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {/* Summary */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> Executive Summary
              </h4>
              <textarea
                className="w-full text-sm text-slate-700 border-none focus:ring-0 rounded p-0 outline-none h-24 resize-none placeholder:text-slate-300 leading-relaxed"
                placeholder="Summarize key decisions..."
                value={analysis.summary}
                onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> Action Items
              </h4>
              <div className="space-y-3">
                {analysis.action_items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start group bg-slate-50 p-2.5 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                    <User className="w-4 h-4 text-slate-400 mt-2 shrink-0" />
                    <div className="flex-1 space-y-1.5">

                      {/* ASSIGN OWNER DROPDOWN */}
                      <select
                        className="w-full text-xs font-bold text-brand-600 border-none p-0 focus:ring-0 bg-transparent cursor-pointer"
                        value={item.owner}
                        onChange={(e) => updateActionItem(idx, 'owner', e.target.value)}
                      >
                        <option value="Unassigned">Unassigned</option>
                        {teamMembers.map((member) => (
                          <option key={member.uid} value={member.displayName || member.email}>
                            {member.displayName || member.email}
                          </option>
                        ))}
                      </select>

                      <input
                        className="w-full text-sm text-slate-700 placeholder:text-slate-400/50 border-b border-slate-200 focus:border-brand-300 p-0 pb-1 focus:ring-0 bg-transparent transition-colors"
                        placeholder="Task description..."
                        value={item.task}
                        onChange={(e) => updateActionItem(idx, 'task', e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => removeActionItem(idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
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
                className="mt-4 w-full py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-brand-100"
              >
                <Plus className="w-3 h-3" /> Add Action Item
              </button>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50 shadow-sm">
              <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Strategic Insight
              </h4>
              <textarea
                className="w-full text-sm text-amber-900 border-none focus:ring-0 bg-transparent rounded p-0 outline-none h-20 resize-none italic placeholder:text-amber-700/30"
                placeholder="Key strategic takeaway..."
                value={analysis.suggestions}
                onChange={(e) => setAnalysis({ ...analysis, suggestions: e.target.value })}
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="p-5 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={handleSaveMeeting}
              variant="primary"
              size="lg"
              className="w-full h-12 shadow-lg shadow-brand-500/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update Meeting' : 'Save Meeting'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MeetingRecorder;
