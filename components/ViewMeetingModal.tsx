import React from 'react';
import { Meeting } from '../types';
import { X, Calendar, Clock, CheckSquare, Lightbulb, FileText, User, Edit2 } from 'lucide-react';
import { Button } from './ui/Button';

interface ViewMeetingModalProps {
    meeting: Meeting;
    onClose: () => void;
    onEdit: (meeting: Meeting) => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({ meeting, onClose, onEdit }) => {
    const meetingDate = new Date(meeting.date);

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden border border-white/20">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meeting Details</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="w-4 h-4 text-brand-500" />
                                {meetingDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-4 h-4 text-orange-500" />
                                {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => { onClose(); onEdit(meeting); }}
                            className="bg-brand-50 text-brand-700 hover:bg-brand-100 border-none shadow-none"
                        >
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">

                    {/* Summary */}
                    {meeting.analysis?.summary && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FileText className="w-4 h-4" /> Executive Summary
                            </h3>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm">
                                {meeting.analysis.summary}
                            </div>
                        </div>
                    )}

                    {/* Action Items */}
                    {meeting.analysis?.action_items && meeting.analysis.action_items.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <CheckSquare className="w-4 h-4" /> Action Items
                            </h3>
                            <div className="grid gap-3">
                                {meeting.analysis.action_items.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="mt-1 bg-brand-100 text-brand-700 p-1 rounded-md">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-brand-700 mb-0.5">{item.owner}</div>
                                            <div className="text-sm text-slate-700">{item.task}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strategic Insight */}
                    {meeting.analysis?.suggestions && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <Lightbulb className="w-4 h-4" /> Strategic Insight
                            </h3>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100/60 text-amber-900/80 italic shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Lightbulb className="w-24 h-24" />
                                </div>
                                <span className="relative z-10">"{meeting.analysis.suggestions}"</span>
                            </div>
                        </div>
                    )}

                    {/* Raw Notes */}
                    {meeting.rawNotes && (
                        <div className="space-y-3 pt-6 border-t border-slate-200/60">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FileText className="w-4 h-4" /> Original Notes
                            </h3>
                            <div
                                className="text-sm text-slate-500 leading-relaxed px-5 py-3 border-l-4 border-slate-200 pl-4 bg-slate-100/30 rounded-r-xl"
                                dangerouslySetInnerHTML={{ __html: meeting.rawNotes }}
                            />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ViewMeetingModal;
