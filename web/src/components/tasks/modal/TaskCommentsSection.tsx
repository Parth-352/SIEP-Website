'use client';

import React from 'react';
import { Task, UserProfile } from '@/lib/types';

interface TaskCommentsSectionProps {
  task: Task;
  user: UserProfile | null;
  newCommentText: string;
  isPostingComment: boolean;
  onPostComment: (e: React.FormEvent) => void;
  onChangeNewCommentText: (val: string) => void;
}

export default function TaskCommentsSection({
  task,
  user,
  newCommentText,
  isPostingComment,
  onPostComment,
  onChangeNewCommentText,
}: TaskCommentsSectionProps) {
  return (
    <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold">
          Discussion &amp; Workshop Notes ({task.comments?.length || 0})
        </span>
        <span className="text-[10px] font-mono text-grey">Internal Squad Thread</span>
      </div>

      {/* Comments Feed */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {task.comments && task.comments.length > 0 ? (
          task.comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-xl bg-alice-blue/40 border border-jet-black/5 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-jet-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-jet-black text-white flex items-center justify-center text-[9px] font-bold">
                    {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'M'}
                  </span>
                  <span>{comment.authorName}</span>
                  {comment.authorTeam && (
                    <span className="text-orange uppercase">[{comment.authorTeam}]</span>
                  )}
                </span>
                <span className="text-grey/70">
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-jet-black/90 whitespace-pre-wrap leading-relaxed pl-6">
                {comment.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs font-mono italic text-grey/60 py-1">
            No notes recorded yet. Post fabrication notes, tool requirements, or blockers here.
          </p>
        )}
      </div>

      {/* Add Comment Input */}
      {user && (
        <form onSubmit={onPostComment} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => onChangeNewCommentText(e.target.value)}
            placeholder="Write a quick update or note..."
            className="flex-1 px-3 py-2 text-xs font-mono bg-alice-blue/50 border border-jet-black/10 rounded-xl focus:outline-none focus:border-orange text-jet-black"
          />
          <button
            type="submit"
            disabled={isPostingComment || !newCommentText.trim()}
            className="px-3.5 py-2 rounded-xl bg-jet-black text-alice-blue hover:bg-orange text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            Post Note
          </button>
        </form>
      )}
    </div>
  );
}
