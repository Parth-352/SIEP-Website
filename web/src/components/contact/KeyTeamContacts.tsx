"use client";

import React, { useState, useEffect } from 'react';
import { ContactPerson, INITIAL_TEAM_CONTACTS, KNOWN_PHONES } from './types';

export default function KeyTeamContacts() {
  const [teamContacts, setTeamContacts] = useState<ContactPerson[]>(INITIAL_TEAM_CONTACTS);

  // Dynamically resolve Faculty Mentor, Team Captain, and Vice Captain from live roster
  useEffect(() => {
    let isMounted = true;
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.success || !Array.isArray(data.members)) return;
        const members: any[] = data.members;

        // 1. Faculty Mentor & Advisor
        const mentorContact: ContactPerson = {
          name: "Prof. Deore H.S.",
          role: "Faculty Mentor & Advisor",
          phone: null,
          photoUrl: '/team/prof_deore.jpg',
        };

        // 2. Team Captain (role contains 'captain' and NOT 'vice')
        const captainMember = members.find((m) => {
          const r = (m.role || '').toLowerCase();
          return r.includes('captain') && !r.includes('vice');
        });

        // 3. Vice Captain (role contains 'vice')
        const viceCaptainMember = members.find((m) => {
          const r = (m.role || '').toLowerCase();
          return r.includes('vice');
        });

        const dynamicList: ContactPerson[] = [mentorContact];

        if (captainMember) {
          const phone =
            captainMember.phone ||
            KNOWN_PHONES[captainMember.name.toLowerCase().trim()] ||
            '+91 9271647536';
          dynamicList.push({
            name: captainMember.name,
            role: "Team Captain",
            phone,
            photoUrl: captainMember.photoUrl || (captainMember.name.toLowerCase().includes('tirthraj') ? '/team/tirthraj_pawale.jpg' : undefined),
          });
        } else {
          dynamicList.push({
            name: "Tirthraj Pawale",
            role: "Team Captain",
            phone: "+91 9271647536",
            photoUrl: '/team/tirthraj_pawale.jpg',
          });
        }

        if (viceCaptainMember) {
          const phone =
            viceCaptainMember.phone ||
            KNOWN_PHONES[viceCaptainMember.name.toLowerCase().trim()] ||
            '+91 9307740350';
          dynamicList.push({
            name: viceCaptainMember.name,
            role: "Vice Captain",
            phone,
            photoUrl: viceCaptainMember.photoUrl || (viceCaptainMember.name.toLowerCase().includes('pratik') ? '/team/pratik_desarda.jpg' : undefined),
          });
        } else {
          dynamicList.push({
            name: "Pratik Desarda",
            role: "Vice Captain",
            phone: "+91 9307740350",
            photoUrl: '/team/pratik_desarda.jpg',
          });
        }

        setTeamContacts(dynamicList);
      })
      .catch(() => {
        // Retain verified baseline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="border-t border-jet-black/10 pt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              Direct Coordination
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jet-black tracking-tight uppercase">
            Key Team Contacts<span className="text-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-grey font-light mt-1 max-w-xl">
            Connect directly with our faculty mentor and student heads for technical evaluations, sponsorship proposals, or workshop visits.
          </p>
        </div>
        <div className="font-mono text-xs text-grey bg-white px-3.5 py-2 rounded-xl border border-jet-black/10 shrink-0 self-start md:self-auto">
          <span className="text-orange font-bold">{teamContacts.length}</span> Direct Contacts
        </div>
      </div>

      {/* Dynamic Key Contacts Cards (Faculty Mentor, Team Captain, Vice Captain) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        {teamContacts.map((person, idx) => {
          const initials = person.name
            .split(' ')
            .filter(n => !n.startsWith('Prof.'))
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div 
              key={idx} 
              className="p-5 bg-white border border-jet-black/10 rounded-2xl flex flex-col justify-between hover:border-orange/50 hover:shadow-md transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="w-12 h-12 rounded-xl object-cover border border-jet-black/10 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-jet-black text-alice-blue flex items-center justify-center font-mono font-bold text-sm shadow-sm group-hover:bg-orange group-hover:text-jet-black transition-colors">
                      {initials || "DH"}
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-jet-black/5 text-grey">
                    [ 0{idx + 1} ]
                  </span>
                </div>
                
                <h3 className="font-bold text-base text-jet-black group-hover:text-orange transition-colors">
                  {person.name}
                </h3>
                <p className="text-xs text-orange font-mono uppercase tracking-wider font-semibold mt-1">
                  {person.role}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-jet-black/10">
                {person.phone ? (
                  <a 
                    href={`tel:${person.phone.replace(/\s+/g, '')}`} 
                    className="w-full px-3 py-2 rounded-xl bg-alice-blue border border-jet-black/10 text-xs font-mono text-jet-black font-bold hover:bg-orange hover:border-orange hover:text-jet-black transition-all min-h-[38px] flex items-center justify-center gap-2"
                    title={`Call ${person.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{person.phone}</span>
                  </a>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-jet-black/5 text-center text-[11px] font-mono text-grey font-medium">
                    Institutional Advisory
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
