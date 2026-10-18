# ⚡ EVERYTHING U WANNA KNOW: RIDERS BAY (SIEP E-BIKE) ⚡
> **Comprehensive Master Documentation for the Riders Bay Smart Scrambler E-Bike Project**  
> *SNJB's Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Chandwad (Nashik)*  
> *SIEP E-Bike Challenge Season 7.0 (2026–2027) | Organized by ISIEINDIA*

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Project Mission](#1-executive-summary--project-mission)
2. [The Machine: Engineering & Technical Specifications](#2-the-machine-engineering--technical-specifications)
3. [SIEP E-Bike Challenge Season 7.0 Proving Ground](#3-siep-e-bike-challenge-season-70-proving-ground)
4. [Team Structure & Roster (23 Members + 1 Faculty Mentor)](#4-team-structure--roster-23-members--1-faculty-mentor)
5. [Web Application Architecture & Tech Stack](#5-web-application-architecture--tech-stack)
6. [Internal Portal & Team Credentials Directory](#6-internal-portal--team-credentials-directory)
7. [5 GB Google Drive Resumable Upload Architecture](#7-5-gb-google-drive-resumable-upload-architecture)
8. [Repository Directory & File Map](#8-repository-directory--file-map)
9. [Local Development & Setup Guide](#9-local-development--setup-guide)
10. [Promotional Engine & Multimedia Assets](#10-promotional-engine--multimedia-assets)
11. [Official Contact Information & Key Contacts](#11-official-contact-information--key-contacts)

---

## 1. EXECUTIVE SUMMARY & PROJECT MISSION

### 1.1 The Identity
**Riders Bay** is an elite collegiate engineering collective founded at **SNJB’s Late Sau. Kantabai Bhavarlalji Jain College of Engineering (SNJB's KBJ COE)** in Chandwad, Nashik, Maharashtra, India. The team represents a cross-disciplinary force uniting students and faculty from Mechanical, Electronics & Telecommunication (EnTC), and Computer/Software Engineering.

### 1.2 The Mission
To design, engineer, validate, and manufacture a high-performance **Smart Scrambler Electric Motorcycle** built from the ground up for the national **SIEP E-Bike Challenge Season 7.0 (2026–27)**.

Unlike off-the-shelf conversion kits, Riders Bay builds custom spaceframe tubular chassis, proprietary high-voltage battery enclosures, custom CAN bus telemetry systems, and intelligent vehicle control units (VCU) to demonstrate authentic electric mobility innovation.

```
       ┌────────────────────────────────────────────────────────┐
       │                      RIDERS BAY                        │
       │     Smart Scrambler E-Bike Engineering Collective      │
       │       SNJB's KBJ College of Engineering, Chandwad      │
       └───────────────────────────┬────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
[ HARDWARE & CHASSIS ]    [ POWERTRAIN & 72V BMS ]    [ CAN BUS & TELEMETRY ]
- AISC 4130 Chromoly      - 5 kW Peak BLDC Mid-Drive  - ESP32 Microcontrollers
- TIG Welded Spaceframe   - 72V 40Ah Li-Ion Pack      - 500kbps CAN 2.0B Bus
- 1,420 Nm/deg Stiffness  - Smart Active BMS Loop     - Real-Time Cloud Stream
```

---

## 2. THE MACHINE: ENGINEERING & TECHNICAL SPECIFICATIONS

### 2.1 Vehicle Systems Architecture

| Subsystem | Specifications & Engineering Details |
| :--- | :--- |
| **Chassis & Frame** | Lightweight tubular spaceframe fabricated from AISC 4130 chromoly steel. TIG welded with notched fishmouth node points. Engineered for a torsional rigidity of **1,420 Nm/deg** and a structural safety factor **> 2.3** under 20g frontal and 15g lateral impact vectors. |
| **Powertrain** | High-efficiency Mid-Drive Brushless DC (BLDC) motor with custom-fabricated CNC mounting plates. Peak power output: **5.0 kW**. Immediate linear torque delivery to the rear wheel via reinforced chain drive. |
| **Battery Pack** | **72V 40Ah Lithium-Ion** high-density series-parallel architecture. Integrated lower inside the frame to maximize stability and drastically lower the center of gravity (CG). Features active cell-level balancing, thermal monitoring, and isolation contactors. |
| **Smart BMS & Safety** | Custom Battery Management System monitoring individual cell voltages, pack temperature, and state of charge (SoC). Dual-side emergency **Master Disconnect Switches (MDS)** and high-voltage interlock loop (HVIL) ensuring **<100ms power cut actuation**. |
| **Suspension & Dynamics** | Inverted front telescopic hydraulic forks with adjustable pre-load; rear monoshock with progressive linkage. Designed for high ground clearance capable of tackling **140 mm potholes** and extreme off-road terrain. |
| **Braking & Wheels** | Dual hydraulic disc brakes (front and rear) paired with regenerative braking algorithms to recapture kinetic energy during braking. |
| **VCU & Telemetry** | Central Vehicle Control Unit powered by dual-core ESP32 microcontrollers. Communicates across a **500 kbps CAN 2.0B bus** at a 50 Hz refresh cycle, streaming motor RPM, temperatures, cell voltages, and speeds to the digital cluster and pit wall cloud dashboard. |
| **Ergonomics & Body** | Lightweight aerodynamic composite fairings and sculpted fuel tank cover designed in CAD. Delivers the classic rugged Scrambler silhouette while optimizing airflow around the battery pack and inverter heatsinks. |

### 2.2 Key Performance Targets

```
┌────────────────────────┬──────────────────────────────────────────┐
│ METRIC                 │ TARGET SPECIFICATION                     │
├────────────────────────┼──────────────────────────────────────────┤
│ Peak Power             │ 5.0 kW                                   │
│ Nominal Voltage        │ 72 V DC                                  │
│ Battery Capacity       │ 40 Ah (~2.88 kWh)                        │
│ 0–50m Acceleration     │ High-torque launch optimized             │
│ Maximum Gradeability   │ 40° Total Incline (Hill Climb Test)      │
│ Single-Charge Range    │ 40–50 km (Durability Test track demand)  │
│ Obstacle Clearance     │ 140 mm deep pothole tolerance            │
│ CAN Bus Speed          │ 500 kbps (CAN 2.0B protocol)             │
│ Current Project Phase  │ Systems Integration & Physical Testing   │
└────────────────────────┴──────────────────────────────────────────┘
```

---

## 3. SIEP E-BIKE CHALLENGE SEASON 7.0 PROVING GROUND

The **SIEP E-Bike Challenge (Student Innovation and Engineering Program)** is India’s premier collegiate electric two-wheeler engineering competition, organized by the **Imperial Society of Innovative Engineers (ISIEINDIA)**.

### 3.1 The 4 Evaluation Pillars

1. **Engineering Design (Static Evaluation)**
   - CAD 3D modeling, structural FEA stress analysis, and CFD aerodynamic simulation.
   - Chassis structural equivalency, ergonomics, rider triangle, and suspension kinematics.
2. **Electric Powertrain (Static & Bench)**
   - Motor selection, thermal dissipation calculations, inverter tuning.
   - Battery pack safety, cell isolation, BMS architecture, wiring loom integrity, and IP-rated enclosures.
3. **Fabrication Quality (Scrutiny)**
   - TIG welding quality, structural weld penetration, CNC machining tolerance.
   - Electrical wiring harness aesthetics, flame-retardant sleeving, and general vehicle reliability.
4. **Cost & Business Presentation**
   - Comprehensive Bill of Materials (BOM), cost estimation report, and manufacturing feasibility.
   - Real-world marketability, pricing strategies, and mass production roadmap.

### 3.2 The 6 Dynamic Testing Rounds

```
[01. Acceleration] ──► 50m flat pavement sprint from a dead standstill
[02. Hill Climb]   ──► 40° total inclination gradient climb under maximum load
[03. Off-Road]     ──► Severe mud tracks, speed breakers & 140mm deep potholes
[04. Balance Run]  ──► Zero-touch handling course (0 leg touches allowed; finish standstill)
[05. Autonomous]   ──► Driverless parking via voice activation / remote VCU control
[06. Durability]   ──► The Ultimate Trial: 40–50 km non-stop endurance on single charge
```

### 3.3 Official Season 7.0 Timeline

- **15 July 2026**: Phase 2 Registration Opens
- **10 August 2026**: Official Registration Deadline
- **October & November 2026**: Design & Technical Report Submissions (CAD, Thermal FEA, DFMEA, ESF, BOM)
- **December 2026**: Video Submission & Manufacturing Proof Scrutiny
- **January 2027**: College-Level Technical Inspection
- **Jan – Feb 2027**: **The Final National Event** at **Galgotias University, Greater Noida**

### 3.4 Official Competition Partners & Sponsors
- **Royal Enfield**
- **Ansys**
- **EaseMyTrip**
- **Skill AP**
- **SMEV** (Society of Manufacturers of Electric Vehicles)
- **CK Birla Group**
- **Luminous**
- **Hero Electric**
- **Roshi Motors**
- **Altair Engineering**

---

## 4. TEAM STRUCTURE & ROSTER (23 MEMBERS + 1 FACULTY MENTOR)

The Riders Bay team is structured exactly like an agile engineering corporation, divided into 8 technical and operational divisions overseen by Core Leadership.

### 4.1 Faculty Mentor & Domain Leads

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FACULTY MENTOR & ADVISOR                        │
│          Prof. Deore H.S. — Department of Mechanical Engineering       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                             DOMAIN LEADS                               │
│   1. Software        : Parth Kshirsagar (Parth Prashant Kshirsagar)    │
│   2. EnTC            : Tirthraj Pawale                                 │
│   3. Mechanical      : Meet Samdadiya (Meet Nayan Samdadiya)           │
│   4. Design          : Meet Samdadiya (Meet Nayan Samdadiya)           │
│   5. Research        : Aditya Fuldeore (Aditya Namdeo Fuldeore)        │
│   6. Sponsorship     : Shravani Gadekar (Shravani Chaitanya Gadekar)   │
│   7. Social Media    : Nishant Shinde (Nishant Rajendra Shinde)        │
│   8. Documentation   : Pratik Desarda (Desarda Pratik Sachin)          │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 The 8 Domains & Complete Roster (From Official Records)

#### 1. Software
- **Parth Prashant Kshirsagar** *(Domain Lead)*
- Samiksha Vasant Patole
- Shravani Chaitanya Gadekar
- Riddhi Niraj Munot
- Nishant Rajendra Shinde

#### 2. EnTC
- **Tirthraj Pawale** *(Domain Lead)*
- Bachhav Ankita Rakesh
- Desarda Pratik Sachin
- Nayan Punamchand Jain
- Snehal Ravsaheb Shinde
- Prathamesh Sanjay Deshmukh
- Prem Manohar Chaudhari
- Sharvari Prashant Bhambar
- Pagar Mohit Yogesh

#### 3. Mechanical
- **Meet Nayan Samdadiya** *(Domain Lead)*
- Ganesh Santosh Sonawane
- Pagar Mohit Yogesh
- Prathamesh Vilas Tidake
- Siddhesh Raskar
- Ajay Dilip Kate
- Nyaharkar Kiran Balasaheb

#### 4. Design
- **Meet Nayan Samdadiya** *(Domain Lead)*
- Aditya Namdeo Fuldeore
- Prathamesh Vilas Tidake
- Prem Manohar Chaudhari
- Siddhesh Raskar

#### 5. Research
- **Aditya Namdeo Fuldeore** *(Domain Lead)*
- Ahire Omshri Shrikant
- Bachhav Ankita Rakesh
- Shravani Chaitanya Gadekar
- Meet Nayan Samdadiya
- Tirthraj Pawale
- Nayan Punamchand Jain

#### 6. Sponsorship
- **Shravani Chaitanya Gadekar** *(Domain Lead)*
- Desarda Pratik Sachin
- Nishant Rajendra Shinde
- Snehal Ravsaheb Shinde
- Meet Nayan Samdadiya
- Parth Prashant Kshirsagar
- Riddhi Niraj Munot
- Ahire Omshri Shrikant

#### 7. Social Media
- **Nishant Rajendra Shinde** *(Domain Lead)*
- Nikhil Prabhakar Patil
- Tirthraj Pawale
- Ajay Dilip Kate
- Bachhav Ankita Rakesh

#### 8. Documentation
- **Desarda Pratik Sachin** *(Domain Lead)*
- Nikhil Prabhakar Patil
- Sharvari Prashant Bhambar
- Snehal Ravsaheb Shinde
- Parth Prashant Kshirsagar
- Riddhi Niraj Munot
- Ajay Dilip Kate

---

## 5. WEB APPLICATION ARCHITECTURE & TECH STACK

The web portal (`/web`) is a modern, high-performance web application serving both the public face of the project and the restricted engineering operating portal.

### 5.1 Technology Stack

- **Framework**: Next.js 16.4.0 (React 19.3.0, TypeScript 5)
- **Styling**: Tailwind CSS v4 with custom CSS custom properties
- **3D Graphics**: Three.js v0.186.1, `@react-three/fiber` v9.8.1, `@react-three/drei` v10.7.9
- **Animations**: GSAP v3.15.0 with `ScrollTrigger` plugin
- **Backend & Storage**: Next.js App Router API Routes, Edge Middleware, JSON file store (`siep_store.json`), and Google Drive API v3
- **Authentication**: Custom cookie-based session management (`siep_session`) with Firebase Auth fallback
- **External Deliveries**: Web3Forms API for direct email contact form submissions

### 5.2 Brand Design System & Color Tokens

Defined in `web/src/app/globals.css`:
- **Jet Black** (`#2B303A`): Structural ink, headings, primary buttons, chassis dark elements.
- **High-Voltage Orange** (`#FFB347` / `#D97706`): Brand accent, primary highlight, active states.
- **Alice Blue** (`#F8F9FA`): Blueprint canvas background, clean light workspace.
- **Grey** (`#7C7C7C`): Technical metadata, secondary body typography, line dividers.
- **Pearl Aqua** (`#90E0DA`): Accent highlights, secondary energy elements.

### 5.3 Public Routes vs Protected Portal Routes

```
PUBLIC PAGES:
  ├── /             (Cinematic 3D Hero + Scroll-linked Engineering Story + Toggle)
  ├── /about        (Mission, 4 Pillars, 8-Stage Journey, 23-Member Team Roster)
  ├── /competition  (SIEP 7.0 Overview, Evaluation Criteria, 6 Dynamic Tests, Sponsors)
  ├── /bike         (Interactive 3D Chassis STL Explorer, Hardware Specs, Phase Status)
  └── /contact      (Partner with Us, Support Areas, Direct Contacts, Web3Forms Form)

PROTECTED INTERNAL PAGES (Guarded by middleware.ts):
  ├── /login        (Team Login with Instant Quick-Login Pills)
  ├── /dashboard    (Administrative Hub: Kanban Board, Team Overviews, Video Vault, Credentials)
  └── /log          (Engineering Build Log: Step Logging, 5 GB Video Uploader, Multi-Member Tagging)

PROTECTED API ROUTES:
  ├── /api/tasks    (GET, POST, PATCH, DELETE - Project Kanban Tasks)
  ├── /api/logs     (GET, POST - Engineering Build Logs)
  └── /api/upload   (POST - Google Drive 5 GB Resumable Upload Gateway & Streaming Proxy)
```

### 5.4 3D Graphics & Performance Engineering

1. **Interactive Scroll Timeline (`Canvas3D` + `Experience.tsx`)**:
   - Loads `moto_simple_1.obj` and `moto_simple_1.mtl` with brand material mapping.
   - Centered and responsive: Uses dynamic GSAP ScrollTrigger timeline matching the page height.
   - Panned to the right side on desktop so that hero typography remains 100% legible.
2. **Interactive CAD Chassis Explorer (`BikeExplorer.tsx`)**:
   - Loads high-detail `chassis.stl` via Three.js `STLLoader`.
   - Supports 360° OrbitControls, touch gestures (rotate/pinch-zoom), environment lighting, and fallback states.
3. **Hardware Acceleration Toggle**:
   - A floating pill button (`3D Render: ON / OFF`) enables users to dynamically unmount the WebGL canvas to preserve battery and RAM on mobile devices.

---

## 6. INTERNAL PORTAL & TEAM CREDENTIALS DIRECTORY

The internal portal provides role-based access for the team. 
- **Admin Role** (`software`, `mechanical`, `core`): Full access to create, assign, and delete tasks on the Kanban board, view all team build logs, and access credentials.
- **Team Role** (`entc`, `design`, `research`, `sponsorship`, `socialmedia`, `documentation`): Access to submit and view their division's engineering logs.

### 6.1 Team Accounts Directory

| Team Division | Short Code | Portal Login Email | Default Password | Role Access |
| :--- | :---: | :--- | :--- | :---: |
| **Core Leadership** | `CORE` | `core@ridersbay.com` | `Core@9352` | Admin |
| **Software** | `SOFT` | `software@ridersbay.com` | `Software@9352` | Admin |
| **Mechanical & Chassis** | `MECH` | `mechanical@ridersbay.com` | `Mechanical@9352` | Admin |
| **Electronics & Telecom** | `ENTC` | `entc@ridersbay.com` | `EnTC@9352` | Team |
| **Design & Ergonomics** | `DSGN` | `design@ridersbay.com` | `Design@9352` | Team |
| **Research & Simulation** | `R&D` | `research@ridersbay.com` | `Research@9352` | Team |
| **Sponsorship & Outreach** | `SPON` | `sponsorship@ridersbay.com` | `Sponsorship@9352` | Team |
| **Social Media & Media** | `SOCM` | `socialmedia@ridersbay.com` | `Socialmedia@9352` | Team |
| **Documentation & Compliance** | `DOCS` | `documentation@ridersbay.com` | `Documentation@9352` | Team |

> **Note**: The `/login` page features an **Instant Quick-Login** drawer allowing any team lead to authenticate with one click during workshop testing sessions.

---

## 7. 5 GB GOOGLE DRIVE RESUMABLE UPLOAD ARCHITECTURE

Building an electric vehicle requires capturing high-definition video proof of welding, dyno tests, and fabrication for competition scrutiny. Traditional Google Apps Script web apps fail for files over 50 MB due to script execution limits and base64 memory overhead.

Riders Bay features a **High-Speed Resumable Upload Architecture** supporting raw video uploads up to **5 GB**:

```
[Browser / Client]
       │
       │ 1. POST /api/upload (Tiny <1KB JSON: filename, fileSize, team)
       ▼
[Next.js Server Route]
       │
       │ 2. Forward to Google Apps Script Web App
       ▼
[Google Apps Script v2.0]
       │
       │ 3. Call Google Drive API v3 (resumable session endpoint)
       │    Creates folder: "SIEP Team Logs / <Team Name> /"
       ▼
[Google Drive API v3] ──► Returns unique Resumable Upload Session URI
       │
       │ 4. Passed back to Browser / Server
       ▼
[Direct Resumable Chunk Streaming]
       │
       │ 5. Streams raw binary file directly into Google Drive (PUT request)
       │    (Bypasses Apps Script completely; 0 MB server memory used)
       ▼
[Finalize & Embed Generation]
       │
       │ 6. Apps Script sets public view permissions and formats
       │    inline responsive embed: "https://drive.google.com/file/d/FILE_ID/preview"
       ▼
[Recorded in siep_store.json & Visible in Build Log Video Vault]
```

---

## 8. REPOSITORY DIRECTORY & FILE MAP

```
SIEP Website/
├── EVERYTHINGUWANNAKNOW.MD        # Master project documentation (This file)
├── bike chassis 300 mm_.stl       # High-detail 3D CAD chassis model (300mm scale)
├── sports_assistant.ipynb         # Conversational assistant notebook
├── Untitled.ipynb                 # Workspace notebook
├── 22-moto_simple/                # 3D Motorcycle CAD assets
│   ├── moto_simple_1.blend        # Blender project source file
│   ├── moto_simple_1.3ds          # 3D Studio exchange file
│   ├── moto_simple_1.obj          # Wavefront 3D geometry
│   └── moto_simple_1.mtl          # Wavefront material definitions
├── promo/                         # Launch video generation suite (onetake)
│   ├── comp.html                  # Motion layout composition
│   ├── draft.mp4                  # Rendered promotional video
│   ├── draft.render.json          # Render telemetry
│   ├── look.js / look.json        # Color, typography, and theme definitions
│   ├── motion.js                  # Spring physics and kinetic type timeline
│   ├── score.py                   # Procedural audio generator
│   ├── sfx.wav                    # Generated soundtrack
│   └── stills.png                 # Storyboard stills
├── venv/                          # Local Python virtual environment
└── web/                           # Next.js 16 Web Application
    ├── package.json               # Node.js dependencies and scripts
    ├── tsconfig.json              # TypeScript configuration
    ├── next.config.ts             # Next.js configuration
    ├── eslint.config.mjs          # Linting rules
    ├── generate_svgs.js           # Sponsor SVG placeholder generator
    ├── download_logos.py          # Sponsor logo downloader script
    ├── .env.example               # Environment variables template
    ├── .env.local                 # Local environment secrets
    ├── data/
    │   └── siep_store.json        # Persistent JSON database for logs & tasks
    ├── scripts/
    │   └── google-apps-script.js  # Apps Script v2.0 code for Google Drive uploads
    ├── public/                    # Static public assets
    │   ├── chassis.glb            # Optimized GLTF chassis model
    │   ├── moto.glb               # Optimized GLTF motorcycle model
    │   ├── moto_simple_1.obj      # 3D Bike geometry for Canvas3D
    │   ├── moto_simple_1.mtl      # 3D Bike materials
    │   ├── models/
    │   │   └── chassis.stl        # 3D STL chassis loaded by BikeExplorer
    │   ├── sponsors/              # 10 official sponsor logos
    │   └── team/                  # Team workshop gallery & portraits
    └── src/
        ├── middleware.ts          # Edge authentication & route protection
        ├── context/
        │   └── AuthContext.tsx    # Global authentication & session provider
        ├── lib/
        │   ├── types.ts           # TypeScript interfaces (Log, Task, Team, User)
        │   ├── teams.ts           # 8 Subsystem division configurations & credentials
        │   ├── members.ts         # Complete 23-member roster definitions
        │   ├── session.ts         # Base64 session cookie encoder/decoder
        │   ├── store.ts           # JSON file storage API (logs & tasks)
        │   ├── driveUpload.ts     # Resumable upload client & URL embedder
        │   └── firebase.ts        # Firebase client initialization
        ├── components/
        │   ├── Navigation.tsx     # Responsive navbar with Portal & Mobile drawer
        │   ├── Canvas3D.tsx       # Background Three.js canvas
        │   ├── Experience.tsx     # GSAP ScrollTrigger 3D bike animation
        │   ├── ScrollOverlay.tsx  # Hero + 7-stage engineering narrative
        │   ├── EngineeringStage.tsx # Stage component renderer
        │   ├── TimelineIndicator.tsx # Vertical (desktop) & horizontal (mobile) tracker
        │   ├── BikeExplorer.tsx   # Interactive WebGL 3D STL viewer
        │   ├── TeamSection.tsx    # Full team roster with category filters
        │   ├── TeamGallerySlider.tsx # Workshop photo carousel
        │   ├── MemberSelect.tsx   # Multi-select member tagging dropdown
        │   └── ErrorBoundary.tsx  # Graceful WebGL error isolation
        └── app/
            ├── layout.tsx         # Root layout with Geist font & AuthProvider
            ├── globals.css        # Tailwind v4 theme, colors, and keyframes
            ├── page.tsx           # Home page with 3D scroll experience
            ├── about/page.tsx     # About page (Mission, Pillars, Team, Roadmap)
            ├── competition/page.tsx # SIEP 7.0 (Rounds, Criteria, Sponsors)
            ├── bike/page.tsx      # Bike Explorer & System Specifications
            ├── contact/page.tsx   # Partner With Us & Web3Forms contact form
            ├── login/page.tsx     # Portal authentication & quick login
            ├── dashboard/page.tsx # Admin Kanban, Team Hub & Video Vault
            ├── log/page.tsx       # Team Build Log & 5 GB Video Uploader
            └── api/
                ├── tasks/route.ts # Kanban task CRUD endpoints
                ├── logs/route.ts  # Build log CRUD endpoints
                └── upload/route.ts # Resumable upload gateway & binary proxy
```

---

## 9. LOCAL DEVELOPMENT & SETUP GUIDE

### 9.1 Prerequisites
- **Node.js**: v18.17.0+ (Node 20+ recommended)
- **npm** or **pnpm**
- **Python**: 3.9+ (for promo generation or data scripts)

### 9.2 Step-by-Step Installation

1. **Clone or Navigate to the Repository**:
   ```bash
   cd "/Users/parth/Desktop/SIEP Website/web"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Apps Script URL and Firebase credentials (optional):
   ```env
   # Riders Bay Environment
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

4. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Building for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 10. PROMOTIONAL ENGINE & MULTIMEDIA ASSETS

The repository contains a standalone promotional pipeline inside `/promo`:
- **Composition (`comp.html`)**: A deterministic HTML/CSS animation canvas designed for high-resolution video exports.
- **Audio Synthesis (`score.py` & `sfx.wav`)**: Procedural audio synthesis utilizing Python's `wave` module to generate bass impacts, synth risers, and high-frequency UI clicks.
- **Video Output (`draft.mp4`)**: A pre-rendered 1080p promotional launch video ready for social media deployment.
- **Storyboards (`stills.png`)**: Frame-accurate visual slices for press decks and partner presentations.

---

## 11. OFFICIAL CONTACT INFORMATION & KEY CONTACTS

### 11.1 Official Digital Channels
- **Official Team Email**: [ebikeclubcoe@snjb.org](mailto:ebikeclubcoe@snjb.org)
- **Website Contact Form**: Integrated via Web3Forms delivering directly to the team inbox.
- **College Address**:  
  *SNJB's Late Sau. Kantabai Bhavarlalji Jain College of Engineering*  
  *Neminagar, Chandwad, Nashik – 423101, Maharashtra, India*

### 11.2 Key Team Liaisons

| Name | Role | Contact Number |
| :--- | :--- | :--- |
| **Meet Samdadiya (Meet Jain)** | Domain Lead (Mechanical & Design) | [+91 7058471449](tel:+917058471449) |
| **Prof. Deore H.S.** | Faculty Mentor & Advisor | Mechanical Engineering Dept. |
| **Tirthraj Pawale** | Domain Lead (EnTC) | [+91 9271647536](tel:+919271647536) |
| **Pratik Desarda** | Domain Lead (Documentation) | [+91 9307740350](tel:+919307740350) |
| **Parth Kshirsagar** | Domain Lead (Software) | Computer Engineering Dept. |

---

*Document compiled for Riders Bay (SIEP E-Bike Challenge Season 7.0). All rights reserved.*
