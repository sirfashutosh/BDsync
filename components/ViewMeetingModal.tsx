import React from 'react';
import { Meeting } from '../types';
import { X, Calendar, Clock, CheckSquare, Lightbulb, FileText, User, Edit2 } from 'lucide-react';

interface ViewMeetingModalProps {
    meeting: Meeting;
    onClose: () => void;
    onEdit: (meeting: Meeting) => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({ meeting, onClose, onEdit }) => {
    const meetingDate = new Date(meeting.date);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Meeting Details</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {meetingDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { onClose(); onEdit(meeting); }}
                            className="px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Summary */}
                    {meeting.analysis?.summary && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Executive Summary
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {meeting.analysis.summary}
                            </div>
                        </div>
                    )}

                    {/* Action Items */}
                    {meeting.analysis?.action_items && meeting.analysis.action_items.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" /> Action Items
                            </h3>
                            <div className="grid gap-3">
                                {meeting.analysis.action_items.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                        <div className="mt-1 bg-blue-100 text-blue-700 p-1 rounded-md">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-blue-700 mb-0.5">{item.owner}</div>
                                            <div className="text-sm text-gray-700">{item.task}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strategic Insight */}
                    {meeting.analysis?.suggestions && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Strategic Insight
                            </h3>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 italic">
                                "{meeting.analysis.suggestions}"
                            </div>
                        </div>
                    )}

                    {/* Raw Notes */}
                    {meeting.rawNotes && (
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Original Notes
                            </h3>
                            <div className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed px-4 py-2 border-l-2 border-gray-200">
                                {meeting.rawNotes}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ViewMeetingModal;
