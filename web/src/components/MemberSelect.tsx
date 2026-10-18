"use client";

import React, { useState, useRef, useEffect } from 'react';
import { TeamId } from '@/lib/types';
import { ROSTER_MEMBERS } from '@/lib/members';

interface MemberSelectProps {
  teamId?: TeamId;
  selectedMembers: string[];
  onChange: (members: string[]) => void;
}

export default function MemberSelect({
  teamId,
  selectedMembers,
  onChange,
}: MemberSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [customName, setCustomName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter roster
  const availableMembers = ROSTER_MEMBERS.filter((m) => {
    const matchesTeam = showAllTeams || !teamId || teamId === 'core' || m.teamId === teamId;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const toggleMember = (name: string) => {
    if (selectedMembers.includes(name)) {
      onChange(selectedMembers.filter((n) => n !== name));
    } else {
      onChange([...selectedMembers, name]);
    }
  };

  const removeMember = (name: string) => {
    onChange(selectedMembers.filter((n) => n !== name));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customName.trim();
    if (clean && !selectedMembers.includes(clean)) {
      onChange([...selectedMembers, clean]);
      setCustomName('');
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      
      {/* Selected Pills Container */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {selectedMembers.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-jet-black text-alice-blue text-xs font-mono font-medium shadow-sm"
            >
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeMember(name)}
                className="text-grey hover:text-white transition-colors focus:outline-none p-0.5 cursor-pointer"
                title={`Remove ${name}`}
              >
                ✕
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] font-mono text-grey hover:text-red-500 underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/40 hover:bg-white text-jet-black text-sm font-mono flex items-center justify-between focus:ring-2 focus:ring-orange focus:outline-none transition-all cursor-pointer"
      >
        <span className={selectedMembers.length === 0 ? 'text-grey' : 'font-semibold'}>
          {selectedMembers.length === 0
            ? 'Tick members present from list...'
            : `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`}
        </span>
        <svg
          className={`w-4 h-4 text-grey transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Checkbox Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-jet-black/15 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 max-h-80 flex flex-col">
          
          {/* Search & Team Filter Row */}
          <div className="pb-2 mb-2 border-b border-jet-black/10 space-y-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member name or role..."
              className="w-full px-3 py-1.5 rounded-lg border border-jet-black/15 text-xs font-mono bg-alice-blue/30 focus:outline-none focus:ring-1 focus:ring-orange"
              autoFocus
            />

            {teamId && teamId !== 'core' && (
              <div className="flex items-center justify-between text-[11px] font-mono text-grey px-1">
                <span>
                  Showing {showAllTeams ? 'All Team Members' : 'Subsystem Roster'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllTeams(!showAllTeams)}
                  className="text-orange hover:underline font-bold cursor-pointer"
                >
                  {showAllTeams ? 'Filter to my team' : 'Show all teams'}
                </button>
              </div>
            )}
          </div>

          {/* Members Checkbox List */}
          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {availableMembers.length === 0 ? (
              <div className="text-center py-4 text-xs font-mono text-grey">
                No matching members found
              </div>
            ) : (
              availableMembers.map((member) => {
                const isSelected = selectedMembers.includes(member.name);
                return (
                  <label
                    key={member.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-orange/10 text-jet-black font-semibold'
                        : 'hover:bg-alice-blue text-jet-black/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(member.name)}
                        className="w-4 h-4 accent-orange rounded cursor-pointer shrink-0"
                      />
                      <div className="truncate">
                        <span className="block truncate text-xs text-jet-black font-bold">
                          {member.name}
                        </span>
                        <span className="block text-[10px] text-grey font-light truncate">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-jet-black/5 text-grey shrink-0 ml-2">
                      {member.teamId}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Custom Name Quick-Adder */}
          <div className="pt-2 mt-2 border-t border-jet-black/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="+ Add unlisted member..."
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-jet-black/15 text-xs font-mono bg-alice-blue/30 focus:outline-none focus:ring-1 focus:ring-orange"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="px-3 py-1.5 rounded-lg bg-jet-black text-alice-blue hover:bg-orange text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
