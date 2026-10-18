#!/usr/bin/env python3
"""score.py — Sound design for Riders Bay SIEP E-Bike Challenge launch film.
Uses onetake's sfx_palette: 5 synthesized materials in one room, peak -8 dBFS.
"""
import sys, os
sys.path.insert(0, "/Users/parth/.gemini/config/skills/onetake/scripts")
from sfx_palette import Score, air, glass, wood, sub, bubble, wobble

s = Score(dur=15.0)

# 01 · 1.05s: Chassis CAD Vector Ignition
s.place(air(dur=0.6, f0=300, f1=2200, q=1.2, shape=0.4), t=1.05, gain=0.35, pan=-0.2, send=0.3)
s.place(glass(880, dur=0.35, bright=0.7), t=1.12, gain=0.25, pan=0.1, send=0.25)

# 02 · 2.40s: Powertrain & Battery Dock (Mechanical clamp & sub impact)
s.place(sub(54, dur=0.65), t=2.40, gain=0.55, pan=0.0, send=0.35)
s.place(wood(280, dur=0.12), t=2.42, gain=0.40, pan=-0.1, send=0.2)
s.place(glass(1320, dur=0.20, bright=0.9), t=2.45, gain=0.20, pan=0.1, send=0.3)

# 03 · 4.20s: Motion & Suspension Dynamics
s.place(air(dur=0.45, f0=200, f1=1400, q=1.5, shape=0.3), t=4.20, gain=0.30, pan=-0.3, send=0.25)
s.place(sub(68, dur=0.50), t=4.35, gain=0.48, pan=0.0, send=0.3)
s.place(wobble(dur=0.40, f=180), t=4.40, gain=0.22, pan=0.2, send=0.3)

# 04 · 6.60s: Cockpit Zoom & Telemetry Wake
s.place(air(dur=0.50, f0=350, f1=2800, q=1.3, shape=0.5), t=6.60, gain=0.38, pan=0.2, send=0.35)
s.place(glass(1046, dur=0.28, bright=0.8), t=6.75, gain=0.22, pan=0.0, send=0.25)
s.place(wood(380, dur=0.08), t=7.30, gain=0.18, pan=0.1, send=0.15)
s.place(wood(440, dur=0.08), t=7.80, gain=0.20, pan=0.15, send=0.15)

# 05 · 9.15s - 10.65s: Staccato Technical Hits (Rapid 0.3s Cadence)
burst_times = [9.15, 9.45, 9.75, 10.05, 10.35, 10.65]
freqs = [260, 310, 370, 440, 520, 620]
for i, (bt, f) in enumerate(zip(burst_times, freqs)):
    s.place(wood(f, dur=0.09), t=bt, gain=0.42, pan=((i % 2) * 0.4 - 0.2), send=0.2)
    s.place(sub(75 + i * 8, dur=0.25), t=bt, gain=0.35, pan=0.0, send=0.2)

# 06 · 11.20s: Headlight Ignition & Hero Lockup
s.place(sub(48, dur=0.90), t=11.20, gain=0.62, pan=0.0, send=0.4)
s.place(glass(587, dur=0.75, bright=0.85), t=11.22, gain=0.32, pan=0.0, send=0.45)
s.place(air(dur=0.70, f0=500, f1=3200, q=1.1, shape=0.35), t=11.25, gain=0.40, pan=0.0, send=0.35)

# Staggered letter landings
for j, lt in enumerate([11.45, 11.55, 11.65, 11.75]):
    s.place(wood(300 + j * 30, dur=0.06), t=lt, gain=0.18, pan=(j * 0.1 - 0.15), send=0.15)

# 07 · 13.80s: Final Seal Lockup
s.place(wood(240, dur=0.14), t=13.80, gain=0.35, pan=0.0, send=0.25)
s.place(glass(880, dur=0.45, bright=0.5), t=13.82, gain=0.18, pan=0.0, send=0.3)

out_wav = os.path.join(os.path.dirname(__file__), "sfx.wav")
s.write(out_wav)
print(f"Written SFX to {out_wav}")
