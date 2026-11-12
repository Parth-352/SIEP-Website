# 🏍️ BLENDER 3D PROJECT MASTER CONTEXT: RIDERS BAY SMART SCRAMBLER E-BIKE
> **Master Technical Context & Scene Architecture Reference for the Riders Bay SIEP E-Bike 3D Assets**  
> *Project: SIEP E-Bike Challenge Season 7.0 (2026–2027) | Organized by ISIEINDIA*  
> *Institution: SNJB's Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Chandwad*  
> *Active 3D Environment: Blender 5.2.2 LTS (Apple Silicon macOS) | Live MCP Bridge Port 10309*  
> *Generated & Maintained: November 2026*

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & 3D Project Overview](#1-executive-summary--3d-project-overview)
2. [Master File & Asset Directory Map](#2-master-file--asset-directory-map)
3. [Physical Vehicle vs. 3D Model Subsystems](#3-physical-vehicle-vs-3d-model-subsystems)
4. [Blender Scene Architecture & Hierarchy](#4-blender-scene-architecture--hierarchy)
5. [Detailed Mesh, Object & Geometry Inventory](#5-detailed-mesh-object--geometry-inventory)
6. [Materials, PBR Shaders & Brand Color Matrix](#6-materials-pbr-shaders--brand-color-matrix)
7. [Studio Lighting, Environment & Camera Setup](#7-studio-lighting-environment--camera-setup)
8. [Web Pipeline & Three.js / R3F Integration](#8-web-pipeline--threejs--r3f-integration)
9. [Live Blender MCP Connector & Python Automation](#9-live-blender-mcp-connector--python-automation)
10. [Export Workflows & Maintenance Checklist](#10-export-workflows--maintenance-checklist)

---

## 1. EXECUTIVE SUMMARY & 3D PROJECT OVERVIEW

The **Riders Bay Smart Scrambler** 3D project represents the authoritative digital twin of the competition electric motorcycle engineered for the **SIEP E-Bike Challenge Season 7.0**. 

The 3D model serves a dual purpose:
1. **Engineering Validation & Visual Twin**: Faithfully visualizes the physical CAD spaceframe, 72V 40Ah battery monocoque, 5 kW mid-drive BLDC powertrain, inverted suspension, and custom electronic control units (VCU, PDU, CAN telemetry, and MDS kill switch).
2. **Interactive WebGL Experience**: Provides lightweight, highly optimized `.glb` assets (`/moto.glb`, `/chassis.glb`) deployed on the Next.js marketing and engineering dashboard, driven by `@react-three/fiber`, `@react-three/drei`, and GSAP `ScrollTrigger`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BLENDER 3D DIGITAL TWIN                         │
│             File: /Users/parth/Desktop/Electric_Scrambler_Exo.blend    │
│                     Blender Version: 5.2.2 LTS                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
  [ CAD & HARDWARE ]       [ ELECTRICAL & SMART ]    [ WEBGL PIPELINE ]
  - Chromoly Spaceframe    - 72V 40Ah Battery Pack   - web/public/moto.glb (1.4MB)
  - USD Forks & Monoshock  - 5 kW BLDC Mid-Drive     - web/public/chassis.glb (1.0MB)
  - Spoked Wheels & Discs  - ESP32 CAN VCU & PDU     - Three.js Interactive Viewers
```

### High-Level Scene Statistics
- **Blender Version**: `5.2.2 LTS` (macOS Apple Silicon ARM64)
- **Active Blender Binary**: `/Users/parth/Applications/Blender.app/Contents/MacOS/Blender`
- **Total Objects in Scene**: `111`
- **Total Meshes**: `372`
- **Total Materials**: `84`
- **Total Vertices**: `174,220`
- **Total Faces/Polygons**: `283,498`
- **Active Collections**: `8` organized functional groups

---

## 2. MASTER FILE & ASSET DIRECTORY MAP

### 2.1 File System Paths

| Asset / File Type | Absolute Path / Location | Purpose & Description |
| :--- | :--- | :--- |
| **Active Blender Project** | `/Users/parth/Desktop/Electric_Scrambler_Exo.blend` | The comprehensive, production-grade 3D scrambler model featuring complete chassis, powertrain, suspension, battery, and cockpit electronics. |
| **Blender Backup File** | `/Users/parth/Desktop/Electric_Scrambler_Exo.blend1` | Blender automated rolling backup file. |
| **MCP Live Bridge Server** | `/Users/parth/Desktop/blender_connector.py` | Python HTTP socket server (port 10309) running inside Blender's `bpy.app.timers` to execute dynamic AI scripts. |
| **Original Base Project** | `22-moto_simple/moto_simple_1.blend` | Legacy base motorcycle mesh and early geometry source. |
| **Legacy 3D Formats** | `22-moto_simple/moto_simple_1.obj`, `.mtl`, `.3ds` | Legacy exchange files. |
| **Raw CAD Chassis** | `bike chassis 300 mm_.stl` | High-precision engineering STL export from SolidWorks/Fusion 360 scaled at 300mm. |
| **Scratch Blend File** | `/Users/parth/Desktop/Blender Projects/Untitled.blend` | Large staging/scratch file (1.42 GB). |
| **Optimized Web Model** | `web/public/moto.glb` (1.40 MB) | Production binary glTF model loaded by the Next.js 3D hero scroll and interactive bike explorer. |
| **Chassis Web Model** | `web/public/chassis.glb` (1.05 MB) | Isolated tubular spaceframe chassis model for dedicated structural CAD inspection. |
| **Web STL Chassis** | `web/public/models/chassis.stl` (2.48 MB) | Three.js `STLLoader` asset used on `/bike` CAD view. |
| **Interactive Components** | `web/src/components/Experience.tsx`<br>`web/src/components/BikeExplorer.tsx`<br>`web/src/components/Canvas3D.tsx` | Next.js Three.js / React Three Fiber interactive components. |

---

## 3. PHYSICAL VEHICLE VS. 3D MODEL SUBSYSTEMS

The Blender scene matches the physical competition vehicle specifications down to each sub-assembly:

```
                                    ┌──────────────────────┐
                                    │ Cockpit & TFT Dash   │
                                    │ Handlebars & Levers  │
                                    └──────────┬───────────┘
                                               │
   ┌──────────────────────┐         ┌──────────┴───────────┐         ┌──────────────────────┐
   │ Front USD Gold Forks │◄────────┤ AISC 4130 Spaceframe ├────────►│ Box-Section Swingarm │
   │ Wave Rotor & 18" Rim │         │ Chromoly Steel Frame │         │ Orange Monoshock     │
   └──────────────────────┘         └──────────┬───────────┘         │ 48T Sprocket & Chain │
                                               │                     └──────────────────────┘
                                    ┌──────────┴───────────┐
                                    │ 72V 40Ah Battery     │
                                    │ 5.0 kW BLDC Motor    │
                                    │ Dual ESP32 CAN VCU   │
                                    └──────────────────────┘
```

### Subsystem Mapping

1. **Chassis & Structure (`Chassis_Frame`)**:
   - **Real Vehicle**: Lightweight spaceframe fabricated from AISC 4130 chromoly steel with fishmouth welds, 1,420 Nm/deg torsional stiffness, and a structural safety factor > 2.3.
   - **Blender Twin**: Detailed tubular CAD spaceframe (`Chassis_Frame_CAD`), headstock reinforcing gusset plates (`Chassis_Headstock_Gusset_Plates`), classic scrambler rear subframe hoop (`Chassis_Rear_Subframe_U_Loop`), and CNC aluminum skid plate (`Chassis_Aluminum_Skid_Plate`).
2. **High-Voltage Battery Pack (`Battery_Pack_72V`)**:
   - **Real Vehicle**: 72V 40Ah Lithium-Ion battery pack (~2.88 kWh) placed low in the frame for a low center of gravity. Includes smart BMS with cell-level balancing.
   - **Blender Twin**: High-density vertical monocoque enclosure (`Battery_Pack_Vertical_72V`), CNC frame mounting clamps (`Battery_Frame_Clamps`), Riders Bay branding plate (`Battery_Badges_Plate`), and a vertical 10-bar cyan LED state-of-charge indicator (`Battery_SOC_Indicator`).
3. **Electric Powertrain (`Powertrain_5kW_BLDC`)**:
   - **Real Vehicle**: 5.0 kW peak Mid-Drive Brushless DC motor delivering instant linear torque, driving a 520 heavy-duty chain to a 48-tooth rear sprocket.
   - **Blender Twin**: Finned cylindrical BLDC motor casing (`Powertrain_5kW_Motor_Unit`), dual CNC aluminum hanger plates (`Powertrain_CNC_Hanger_Plates`), individual link Real 520 gold drive chain (`Real_520_Gold_Drive_Chain`), 48T CNC rear sprocket (`Rear_Sprocket_CNC_48T`), chain guide/slider (`Powertrain_Chain_Slider_and_Guide`), and three heavy gauge high-voltage motor phase cables (U, V, W).
4. **Suspension & Dynamics (`Motion_Suspension`)**:
   - **Real Vehicle**: Inverted telescopic hydraulic front forks with preload adjusters; rear monoshock with progressive linkage engineered for 140 mm obstacle clearance.
   - **Blender Twin**: Gold-anodized inverted front forks (`Front_USD_Forks_Gold`), chrome fork stanchions (`Front_Fork_Sliders_Chrome`), CNC triple tree clamps (`Front_Triple_Clamps`), stone guards, rear box-section aluminum swingarm (`Rear_Swingarm_BoxSection`), and adjustable rear monoshock with team orange coilover spring (`Rear_Monoshock_Spring_Orange`).
5. **Wheels & Braking**:
   - **Real Vehicle**: Dual hydraulic disc wave rotors with braided lines and dual-sport all-terrain knobby tires.
   - **Blender Twin**: 36-spoke front and rear wire wheels with central hubs, satin black rims, deep-tread scrambler knobby tires (`Front_Wheel_Tire`, `Rear_Wheel_Tire`), front and rear stainless wave brake discs (`Front_Brake_Wave_Rotor_Assembly`, `Rear_Brake_Wave_Rotor_Assembly`), and braided lines.
6. **Smart Cockpit & Rider Interface (`Smart_System_Cockpit`)**:
   - **Real Vehicle**: Wide tapered scrambler handlebar, TFT digital instrumentation, drive mode toggles (ECO, SPORT, HAZARD), dual-side emergency Master Disconnect Switch (MDS) with <100ms cut actuation.
   - **Blender Twin**: Handlebars with risers and clamp bolts, CNC brake levers with smoked reservoirs, rubber handgrips with anodized orange lockrings, bar-end convex mirrors with integrated amber turn signal LEDs, TFT digital display housing with sun visor hood and active screen graphic, cyan status LED bar, mode buttons (ECO green, SPORT orange, HAZARD red, START cyan), and red mushroom-head MDS emergency kill switch with safety collar.
7. **Vehicle Control Unit & Power Distribution (`Smart_System_VCU`)**:
   - **Real Vehicle**: Dual-core ESP32 VCU with 500 kbps CAN 2.0B bus, Class-T fuse, high-voltage interlock loop (HVIL), and GPS telemetry.
   - **Blender Twin**: Gunmetal CNC VCU casing with anodized orange bezel, smoked inspection window, internal multi-layer PCB, 3 status LEDs (Heartbeat Cyan, CAN Green, Armed Orange), GPS telemetry puck, wiring harness connectors, and high-voltage Power Distribution Unit (PDU) with high-voltage Class-T copper fuse and diagnostic LEDs.
8. **Aesthetics & Ergonomics (`Body_Aesthetics`)**:
   - **Real Vehicle**: Lightweight composite fairings, sculpted fuel tank cover, pleated leather scrambler bench, and circular LED headlight.
   - **Blender Twin**: Sculpted orange tank cover with rubber knee pads and CNC charge port cap, pleated leather scrambler seat (`Body_Scrambler_Seat_Pleated`), round LED headlight with Alice Blue DRL halo ring and rugged scrambler X-grill, front high scrambler fender, rear tail tidy with LED turn indicators, and subframe race number plates.

---

## 4. BLENDER SCENE ARCHITECTURE & HIERARCHY

The Blender scene is organized into clean, functional collections:

```
Scene (Root Collection)
 ├── 📁 Chassis_Frame (4 items)
 │    ├── Chassis_Frame_CAD
 │    ├── Chassis_Rear_Subframe_U_Loop
 │    ├── Chassis_Headstock_Gusset_Plates
 │    └── Chassis_Aluminum_Skid_Plate
 │
 ├── 📁 Battery_Pack_72V (8 items)
 │    ├── Battery_Pack_Vertical_72V
 │    ├── Battery_Badges_Plate
 │    ├── Battery_SOC_Indicator
 │    ├── Battery_Frame_Clamps
 │    └── Studio_KeyLight_Warm / Bounce Lights
 │
 ├── 📁 Powertrain_5kW_BLDC (6 items)
 │    ├── Powertrain_5kW_Motor_Unit
 │    ├── Powertrain_CNC_Hanger_Plates
 │    ├── Real_520_Gold_Drive_Chain
 │    ├── Rear_Sprocket_CNC_48T
 │    ├── Powertrain_Chain_Slider_and_Guide
 │    └── HV_Cable_Motor_Phase_U / V / W
 │
 ├── 📁 Motion_Suspension (32 items)
 │    ├── Front_Triple_Clamps & Pinch_Bolts
 │    ├── Front_USD_Forks_Gold & Sliders_Chrome
 │    ├── Front_Fork_Stone_Guards & Top_Caps
 │    ├── Rear_Swingarm_BoxSection & Chain_Adjusters
 │    ├── Rear_Monoshock_Body & Spring_Orange
 │    ├── Front_Wheel_Tire / Rim / Hub / Spokes
 │    ├── Rear_Wheel_Tire / Rim / Hub / Spokes
 │    ├── Front & Rear Brake Wave Rotors & Calipers
 │    └── Braided Brake Lines & Foot Controls
 │
 ├── 📁 Smart_System_Cockpit (27 items)
 │    ├── Cockpit_Handlebar & Lower_Risers & Upper_Clamps
 │    ├── Cockpit_Display_Housing & Screen_Face & SunVisor
 │    ├── Cockpit_Status_LED_Bar (Cyan)
 │    ├── Cockpit_Handgrips & Grip_Lockrings (Orange)
 │    ├── Cockpit_Brake_Levers & Smoked_Reservoirs
 │    ├── Cockpit_BarEnd_Convex_Mirrors & Turn_LEDs
 │    ├── Cockpit_Btn_ECO, SPORT, HAZARD, Start, Kill_Switch
 │    ├── Cockpit_MDS_KillSwitch_Console (Emergency Cut)
 │    └── Cockpit_Flyscreen & Routing Cables
 │
 ├── 📁 Smart_System_VCU (18 items)
 │    ├── VCU_Main_Casing & Top_Bezel (Orange CNC)
 │    ├── VCU_Inspection_Window & Internal_PCB
 │    ├── VCU_LED_Heartbeat_Cyan, CAN_Green, Armed_Orange
 │    ├── VCU_Telemetry_GPS_Puck & Accent_Ring
 │    ├── PDU_Fuse_Box_Enclosure & ClassT_Fuse & Window
 │    ├── PDU_Diagnostic_LEDs
 │    └── High Voltage & Cockpit Harnesses
 │
 ├── 📁 Body_Aesthetics (13 items)
 │    ├── Headlight_Bucket, Halo_Lens (Alice Blue) & Grill_X
 │    ├── Front_Scrambler_Fender & Rear_Tire_Hugger
 │    ├── Body_Tank_Cover (Orange) & Knee_Pads
 │    ├── Tank_Charge_Port_Assembly & Riders_Bay_Badges
 │    ├── Body_Scrambler_Seat_Pleated (Leather)
 │    ├── Chassis_Subframe_Number_Plates
 │    ├── Body_Front_Battery_Radiator_Cowl
 │    └── Rear_TailLight_Strip & Tail_Tidy_Signals
 │
 └── 📁 Collection (1 item)
      └── Camera (48mm Cinematic Framing)
```

---

## 5. DETAILED MESH, OBJECT & GEOMETRY INVENTORY

### 5.1 Chassis & Frame Subsystem
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Chassis_Frame_CAD` | MESH | 24,835 | 49,590 | 0.329m × 1.474m × 0.776m | `Chassis_Chromoly_Steel` |
| `Chassis_Rear_Subframe_U_Loop` | MESH | 384 | 224 | 0.227m × 0.062m × 0.028m | `Chassis_Chromoly_Steel` |
| `Chassis_Headstock_Gusset_Plates`| MESH | 76 | 46 | 0.102m × 0.140m × 0.140m | `Chassis_Chromoly_Steel` |
| `Chassis_Aluminum_Skid_Plate` | MESH | 80 | 50 | 0.174m × 0.610m × 0.146m | `Powertrain_Silver_Alloy` |

### 5.2 Battery Subsystem (72V Pack)
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Battery_Pack_Vertical_72V` | MESH | 320 | 200 | 0.169m × 0.205m × 0.558m | `Battery_Monocoque_Titanium` |
| `Battery_Badges_Plate` | MESH | 32 | 24 | 0.177m × 0.125m × 0.160m | `Powertrain_Silver_Alloy` |
| `Battery_SOC_Indicator` | MESH | 88 | 66 | 0.005m × 0.024m × 0.130m | `Battery_SOC_Cyan_Glow` |
| `Battery_Frame_Clamps` | MESH | 128 | 80 | 0.194m × 0.035m × 0.452m | `Powertrain_Silver_Alloy` |

### 5.3 Powertrain & Drive Subsystem (5 kW BLDC)
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Powertrain_5kW_Motor_Unit` | MESH | 480 | 320 | 0.210m × 0.185m × 0.185m | `Powertrain_Silver_Alloy`, `Powertrain_Team_Orange` |
| `Powertrain_CNC_Hanger_Plates` | MESH | 160 | 96 | 0.180m × 0.240m × 0.015m | `Cockpit_Gunmetal_CNC` |
| `Real_520_Gold_Drive_Chain` | MESH | 3,840 | 2,400 | 0.085m × 0.720m × 0.240m | `Powertrain_Chain_Gold` |
| `Rear_Sprocket_CNC_48T` | MESH | 640 | 480 | 0.012m × 0.260m × 0.260m | `Cockpit_Gunmetal_CNC` |
| `Powertrain_Chain_Slider_and_Guide`| MESH | 64 | 40 | 0.045m × 0.160m × 0.040m | `Cockpit_Matte_Black_Rubber` |
| `HV_Cable_Motor_Phase_U/V/W` | CURVE | - | - | Cable Looms | `HV_Orange_Cable_Silicone` |

### 5.4 Motion & Suspension Subsystem
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Front_USD_Forks_Gold` | MESH | 96 | 52 | 0.264m × 0.259m × 0.482m | `Suspension_Fork_Gold` |
| `Front_Fork_Sliders_Chrome` | MESH | 112 | 64 | 0.253m × 0.322m × 0.344m | `Cockpit_Chrome_Bolts` |
| `Front_Triple_Clamps` | MESH | 208 | 116 | 0.274m × 0.124m × 0.170m | `Cockpit_Gunmetal_CNC` |
| `Rear_Swingarm_BoxSection` | MESH | 56 | 34 | 0.218m × 0.597m × 0.132m | `Cockpit_Gunmetal_CNC` |
| `Rear_Monoshock_Body` | MESH | 80 | 44 | 0.079m × 0.370m × 0.267m | `Cockpit_Gunmetal_CNC` |
| `Rear_Monoshock_Spring_Orange` | MESH | 336 | 182 | 0.072m × 0.205m × 0.168m | `Cockpit_Anodized_Orange` |
| `Front_Wheel_Tire` | MESH | 804 | 684 | 0.105m × 0.682m × 0.682m | `Cockpit_Matte_Black_Rubber` |
| `Front_Wheel_Rim` | MESH | 72 | 36 | 0.071m × 0.470m × 0.470m | `Wheel_Rim_Satin_Black` |
| `Front_Wheel_Hub` | MESH | 48 | 26 | 0.105m × 0.096m × 0.096m | `Cockpit_Gunmetal_CNC` |
| `Front_Wheel_Spokes` | MESH | 288 | 144 | 0.065m × 0.440m × 0.440m | `Cockpit_Chrome_Bolts` |
| `Rear_Wheel_Tire` | MESH | 804 | 684 | 0.120m × 0.660m × 0.660m | `Cockpit_Matte_Black_Rubber` |
| `Rear_Wheel_Rim` | MESH | 72 | 36 | 0.085m × 0.450m × 0.450m | `Wheel_Rim_Satin_Black` |
| `Front_Brake_Wave_Rotor_Assembly`| MESH | 192 | 128 | 0.024m × 0.280m × 0.280m | `Brake_Rotors_Steel`, `Brake_Caliper_Orange` |
| `Rear_Brake_Wave_Rotor_Assembly` | MESH | 160 | 110 | 0.020m × 0.220m × 0.220m | `Brake_Rotors_Steel`, `Brake_Caliper_Orange` |

### 5.5 Cockpit & Smart Controls Subsystem
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Cockpit_Handlebar` | MESH | 192 | 104 | 0.760m × 0.166m × 0.103m | `Cockpit_Gunmetal_CNC` |
| `Cockpit_Lower_Risers` | MESH | 64 | 36 | 0.148m × 0.052m × 0.056m | `Cockpit_Gunmetal_CNC` |
| `Cockpit_Upper_Clamps` | MESH | 64 | 36 | 0.148m × 0.048m × 0.032m | `Cockpit_Anodized_Orange` |
| `Cockpit_Display_Housing` | MESH | 120 | 80 | 0.160m × 0.095m × 0.028m | `Cockpit_Gunmetal_CNC` |
| `Cockpit_Screen_Face` | MESH | 16 | 12 | 0.148m × 0.077m × 0.036m | `Cockpit_Screen_Display` |
| `Cockpit_Status_LED_Bar` | MESH | 8 | 6 | 0.128m × 0.005m × 0.004m | `Cockpit_LED_Cyan` |
| `Cockpit_TFT_SunVisor_Hood` | MESH | 24 | 18 | 0.174m × 0.062m × 0.103m | `Cockpit_Gunmetal_CNC` |
| `Cockpit_Flyscreen` | MESH | 117 | 96 | 0.210m × 0.082m × 0.112m | `Cockpit_Smoked_Glass` |
| `Cockpit_Handgrips` | MESH | 96 | 52 | 0.748m × 0.046m × 0.031m | `Cockpit_Matte_Black_Rubber` |
| `Cockpit_Grip_Lockrings` | MESH | 192 | 104 | 0.760m × 0.049m × 0.033m | `Cockpit_Anodized_Orange` |
| `Cockpit_Brake_Levers` | MESH | 160 | 96 | 0.714m × 0.061m × 0.030m | `Cockpit_Gunmetal_CNC` |
| `Cockpit_Brake_Fluid_Reservoirs`| MESH | 208 | 120 | 0.578m × 0.056m × 0.090m | `Cockpit_Smoked_Reservoir` |
| `Cockpit_BarEnd_Convex_Mirrors` | MESH | 176 | 100 | 0.906m × 0.080m × 0.096m | `Cockpit_Gunmetal_CNC` |
| `Cockpit_BarEnd_Turn_LEDs` | MESH | 96 | 52 | 0.787m × 0.031m × 0.030m | `Cockpit_LED_Orange` |
| `Cockpit_Btn_ECO` | MESH | 24 | 14 | 0.007m × 0.004m × 0.007m | `Cockpit_LED_Green` |
| `Cockpit_Btn_SPORT` | MESH | 24 | 14 | 0.007m × 0.004m × 0.007m | `Cockpit_LED_Orange` |
| `Cockpit_Btn_HAZARD` | MESH | 24 | 14 | 0.007m × 0.004m × 0.007m | `Cockpit_LED_Red` |
| `Cockpit_Btn_Start` | MESH | 24 | 14 | 0.008m × 0.004m × 0.008m | `Cockpit_LED_Cyan` |
| `Cockpit_MDS_KillSwitch_Console`| MESH | 104 | 58 | 0.042m × 0.042m × 0.038m | `Cockpit_MDS_Red_Button`, `Cockpit_MDS_Yellow_Collar` |

### 5.6 VCU & PDU Subsystems
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VCU_Main_Casing` | MESH | 120 | 90 | 0.158m × 0.146m × 0.034m | `Cockpit_Gunmetal_CNC` |
| `VCU_Top_Bezel` | MESH | 32 | 24 | 0.122m × 0.148m × 0.005m | `Cockpit_Anodized_Orange` |
| `VCU_Inspection_Window` | MESH | 8 | 6 | 0.088m × 0.110m × 0.003m | `Cockpit_Smoked_Glass` |
| `VCU_Internal_PCB` | MESH | 120 | 74 | 0.106m × 0.130m × 0.008m | `VCU_PCB_Board`, `VCU_Gold_Traces` |
| `VCU_LED_Heartbeat_Cyan` | MESH | 8 | 6 | 0.003m × 0.003m × 0.002m | `Cockpit_LED_Cyan` |
| `VCU_LED_CAN_Green` | MESH | 8 | 6 | 0.003m × 0.003m × 0.002m | `Cockpit_LED_Green` |
| `VCU_LED_Armed_Orange` | MESH | 8 | 6 | 0.003m × 0.003m × 0.002m | `Cockpit_LED_Orange` |
| `VCU_Telemetry_GPS_Puck` | MESH | 48 | 26 | 0.032m × 0.032m × 0.010m | `Cockpit_Gunmetal_CNC`, `Cockpit_Anodized_Orange` |
| `PDU_Fuse_Box_Enclosure` | MESH | 312 | 202 | 0.123m × 0.177m × 0.129m | `Cockpit_Gunmetal_CNC` |
| `PDU_Inspection_Window` | MESH | 8 | 6 | 0.002m × 0.076m × 0.048m | `Smoked_Polycarbonate_Window` |
| `PDU_Internal_ClassT_Fuse` | MESH | 64 | 42 | 0.018m × 0.078m × 0.045m | `HighVoltage_Pure_Copper` |
| `PDU_Diagnostic_LEDs` | MESH | 32 | 20 | 0.006m × 0.050m × 0.003m | `LED_Indicator_Green` |

### 5.7 Bodywork & Aesthetics Subsystem
| Object Name | Type | Vertices | Faces | Dimensions (X, Y, Z meters) | Material(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Body_Tank_Cover` | MESH | 40 | 34 | 0.250m × 0.480m × 0.193m | `Body_Paint_Orange` |
| `Body_Scrambler_Seat_Pleated` | MESH | 296 | 222 | 0.194m × 0.741m × 0.094m | `Seat_Pleated_Leather` |
| `Headlight_Bucket` | MESH | 64 | 34 | 0.170m × 0.090m × 0.170m | `Cockpit_Gunmetal_CNC` |
| `Headlight_Halo_Lens` | MESH | 112 | 60 | 0.156m × 0.010m × 0.156m | `Headlight_Halo_Alice_Blue` |
| `Headlight_Grill_X` | MESH | 16 | 12 | 0.114m × 0.003m × 0.114m | `Cockpit_Matte_Black_Rubber` |
| `Front_Scrambler_Fender` | MESH | 64 | 16 | 0.115m × 0.542m × 0.151m | `Cockpit_Matte_Black_Rubber` |
| `Tank_Riders_Bay_Badges_Sleek` | MESH | 48 | 36 | 0.255m × 0.150m × 0.022m | `Tank_Brushed_Badge` |
| `Tank_Charge_Port_Assembly` | MESH | 232 | 134 | 0.090m × 0.090m × 0.012m | `Tank_CNC_Charge_Cap` |
| `Tank_Ergonomic_Knee_Pads` | MESH | 80 | 56 | 0.249m × 0.220m × 0.070m | `Tank_Grip_Rubber` |
| `Chassis_Subframe_Number_Plates`| MESH | 160 | 104 | 0.227m × 0.260m × 0.105m | `Powertrain_Silver_Alloy` |
| `Body_Front_Battery_Radiator_Cowl`| MESH | 248 | 162 | 0.252m × 0.073m × 0.323m | `Cockpit_Gunmetal_CNC` |
| `Rear_TailLight_Strip` | MESH | 48 | 26 | 0.180m × 0.016m × 0.016m | `TailLight_LED_Glow` |
| `Tail_Tidy_Plate_and_Signals` | MESH | 56 | 34 | 0.242m × 0.055m × 0.089m | `Cockpit_Gunmetal_CNC`, `Cockpit_LED_Orange` |

---

## 6. MATERIALS, PBR SHADERS & BRAND COLOR MATRIX

The materials use Blender's `Principled BSDF` shader nodes, tuned for physically accurate roughness/metallic responses and clean translation into glTF / Three.js PBR standards.

```
       ┌────────────────────────────────────────────────────────┐
       │                COLOR & MATERIAL SYSTEM                 │
       └────────────────────────────────────────────────────────┘
          │                   │                     │
          ▼                   ▼                     ▼
     [ BASE METALS ]     [ BRAND PAINTS ]     [ EMISSIVE GLOW ]
     - Chromoly Steel    - Scrambler Orange   - Halo Alice Blue
     - Titanium Mono     - Anodized Orange    - State of Charge Cyan
     - CNC Gunmetal      - Matte Carbon       - CAN Green / MDS Red
```

### 6.1 Master Material Calibration Table

| Material Name | Base Color (RGBA Float) | Metallic | Roughness | Emission Color / Behavior | Physical Counterpart |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Body_Paint_Orange` | `[1.00, 0.45, 0.04, 1.0]` | `0.15` | `0.18` | None | Gloss automotive scrambler body paint |
| `Cockpit_Anodized_Orange` | `[1.00, 0.42, 0.05, 1.0]` | `0.92` | `0.25` | None | Hard-anodized billet aluminum (clamps, spring) |
| `Chassis_Chromoly_Steel` | `[0.12, 0.13, 0.14, 1.0]` | `0.85` | `0.32` | None | TIG-welded AISC 4130 tubular frame finish |
| `Cockpit_Gunmetal_CNC` | `[0.16, 0.17, 0.18, 1.0]` | `0.92` | `0.28` | None | CNC machined 6061-T6 aluminum (triple clamps, swingarm) |
| `Battery_Monocoque_Titanium` | `[0.10, 0.11, 0.12, 1.0]` | `0.88` | `0.32` | None | Brushed titanium battery structural casing |
| `Suspension_Fork_Gold` | `[0.88, 0.62, 0.18, 1.0]` | `0.95` | `0.20` | None | Kashima-coated gold front USD outer tubes |
| `Powertrain_Chain_Gold` | `[0.95, 0.75, 0.15, 1.0]` | `0.95` | `0.18` | None | Heavy-duty 520 gold zinc-plated roller chain |
| `Brake_Rotors_Steel` | `[0.85, 0.85, 0.85, 1.0]` | `0.95` | `0.22` | None | Laser-cut 420 stainless steel wave discs |
| `Cockpit_Chrome_Bolts` | `[0.95, 0.95, 0.95, 1.0]` | `1.00` | `0.08` | None | High-polish chrome hardware & fork sliders |
| `Seat_Pleated_Leather` | `[0.05, 0.05, 0.05, 1.0]` | `0.00` | `0.55` | None | Water-resistant pleated vegan upholstery |
| `Cockpit_Matte_Black_Rubber`| `[0.03, 0.03, 0.03, 1.0]` | `0.00` | `0.85` | None | Grips, footpegs, fenders, knobby tires |
| `Body_Matte_Carbon` | `[0.06, 0.06, 0.07, 1.0]` | `0.20` | `0.40` | None | Twill carbon fiber fairings & covers |
| `HV_Orange_Cable_Silicone` | `[0.95, 0.32, 0.02, 1.0]` | `0.05` | `0.45` | None | High-voltage 72V silicone shielded conduits |
| `Headlight_Halo_Alice_Blue`| `[0.70, 0.90, 1.00, 1.0]` | `0.00` | `0.50` | `[0.70, 0.90, 1.0]` (Energy: 8.0) | Signature circular DRL ring (6500K daylight) |
| `Battery_SOC_Cyan_Glow` | `[0.00, 0.95, 1.00, 1.0]` | `0.00` | `0.50` | `[0.00, 0.95, 1.0]` (Energy: 6.0) | Battery status indicator LED array |
| `Cockpit_LED_Cyan` | `[0.00, 0.88, 1.00, 1.0]` | `0.00` | `0.50` | `[0.00, 0.88, 1.0]` (Energy: 5.0) | VCU Heartbeat & dash status indicator |
| `Cockpit_LED_Green` | `[0.00, 0.90, 0.20, 1.0]` | `0.00` | `0.50` | `[0.00, 0.90, 0.2]` (Energy: 5.0) | CAN bus active / ECO mode indicator |
| `Cockpit_LED_Orange` | `[1.00, 0.38, 0.00, 1.0]` | `0.00` | `0.50` | `[1.00, 0.38, 0.0]` (Energy: 5.0) | Turn signals & SPORT mode indicator |
| `Cockpit_MDS_Red_Button` | `[0.90, 0.05, 0.05, 1.0]` | `0.10` | `0.30` | None | High-visibility emergency stop button |
| `Cockpit_Smoked_Glass` | `[0.05, 0.05, 0.06, 1.0]` | `0.10` | `0.15` | Transmission: 0.85 | VCU inspection lid & cockpit flyscreen |

---

## 7. STUDIO LIGHTING, ENVIRONMENT & CAMERA SETUP

### 7.1 Lighting Rig
The scene contains a 4-point automotive studio lighting configuration designed to accentuate the scrambler's metallic tubes and body curves:

```
                          [ Studio_KeyLight_Warm ]
                              (2.5, 3.0, 2.0)
                                 400 Watts
                                     │
                                     │
           [ Camera ]                ▼
       (-2.6, 2.4, 0.95)   ┌───────────────────┐
              \            │                   │
               \           │  SCRAMBLER MOTOR  │
                ▼          │                   │
  [ Studio_FillLight_Blue ]└───────────────────┘◄───────── [ Studio_RimLight_Orange ]
      (-2.2, 1.5, 1.2)               ▲                         (1.8, -1.8, 1.8)
         300 Watts                   │                            550 Watts
                                     │
                         [ Studio_GroundBounce ]
                            (0.0, 0.0, -0.5)
                                80 Watts
```

1. **Warm Key Light (`Studio_KeyLight_Warm`)**:
   - Type: `AREA` light
   - Location: `X: +2.5m, Y: +3.0m, Z: +2.0m`
   - Energy: `400.0 W` | Color: `[1.0, 0.97, 0.92]` (3200K warm studio daylight)
   - Function: Primary illumination highlighting tank surfaces and cockpit controls.
2. **Team Orange Rim Light (`Studio_RimLight_Orange`)**:
   - Type: `AREA` light
   - Location: `X: +1.8m, Y: -1.8m, Z: +1.8m`
   - Energy: `550.0 W` | Color: `[1.0, 0.45, 0.05]` (High-energy brand orange)
   - Function: Sharp edge backlight defining the rear swingarm, subframe hoop, and tire treads.
3. **Cool Fill Light (`Studio_FillLight_Blue`)**:
   - Type: `AREA` light
   - Location: `X: -2.2m, Y: +1.5m, Z: +1.2m`
   - Energy: `300.0 W` | Color: `[0.75, 0.90, 1.0]` (Soft electric blue fill)
   - Function: Balances deep shadows on the underside of the battery pack and chassis tubes.
4. **Ground Bounce Light (`Studio_GroundBounce`)**:
   - Type: `AREA` light (oriented upwards)
   - Location: `X: 0.0m, Y: 0.0m, Z: -0.5m`
   - Energy: `80.0 W` | Color: `[0.95, 0.95, 1.0]`
   - Function: Simulates reflection off studio floor/skid plate.

### 7.2 Camera Calibration
- **Object**: `Camera`
- **Location**: `X: -2.60m, Y: +2.40m, Z: +0.95m`
- **Rotation (Euler)**: `X: 83.3°, Y: 0.0°, Z: -130.2°`
- **Focal Length**: `48.0 mm` (natural perspective, minimal fish-eye distortion)
- **Sensor Clip Planes**: Near `0.10m`, Far `100.0m`

---

## 8. WEB PIPELINE & THREE.JS / R3F INTEGRATION

### 8.1 Exported glTF Models

1. **`web/public/moto.glb`**:
   - File Size: `1.40 MB` (1,402,780 bytes)
   - Contains: Complete motorcycle assembly (chassis, powertrain, battery, suspension, cockpit, aesthetics).
   - Use Cases:
     - Home page hero scroll animation (`Experience.tsx`).
     - Interactive 360° bike inspector (`BikeExplorer.tsx`).
2. **`web/public/chassis.glb`**:
   - File Size: `1.05 MB` (1,051,740 bytes)
   - Contains: Isolated tubular spaceframe chassis and headstock structure.
   - Use Cases: Structural FEA / CAD engineering focus.

### 8.2 Frontend Code Architecture

#### Home Page Hero Scroll Experience (`web/src/components/Experience.tsx`)
```tsx
import { useGLTF } from '@react-three/drei';
useGLTF.preload('/moto.glb');

export default function Experience() {
  const { scene } = useGLTF('/moto.glb');
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.envMapIntensity = 1.2;
            mat.needsUpdate = true;
          }
        });
      }
    });
    // Auto-center geometry bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene]);

  // Driven by GSAP ScrollTrigger timeline matching storytelling milestones
  // ...
}
```

#### Interactive 3D CAD Explorer (`web/src/components/BikeExplorer.tsx`)
```tsx
import { OrbitControls, Center, useGLTF } from '@react-three/drei';

function ScramberModel() {
  const { scene } = useGLTF('/moto.glb');
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.envMapIntensity = 1.4;
        child.material.needsUpdate = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <Center scale={1}>
      <primitive object={clonedScene} />
    </Center>
  );
}
```

---

## 9. LIVE BLENDER MCP CONNECTOR & PYTHON AUTOMATION

The workstation runs an integrated socket bridge (`blender_connector.py`) on port `10309`. This allows executing Python commands directly on Blender's main thread via MCP tools.

### 9.1 Server Architecture
- **Script**: `/Users/parth/Desktop/blender_connector.py`
- **Protocol**: HTTP POST accepting JSON payload: `{"script": "..."}`
- **Thread Model**: Queue-based execution dispatched to `bpy.app.timers.register(process_queue)`.
- **Port**: `127.0.0.1:10309`

### 9.2 Useful Python Recipes for Blender

#### Recipe 1: Re-export `/moto.glb` to Web Application
```python
import bpy

# Define output path in web public directory
export_path = "/Users/parth/Desktop/SIEP Website/web/public/moto.glb"

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False
)
print("Successfully exported updated model to:", export_path)
```

#### Recipe 2: Isolate and Export Chassis Spaceframe (`chassis.glb`)
```python
import bpy

# Deselect all
bpy.ops.object.select_all(action='DESELECT')

# Select only chassis collection objects
chassis_collection = bpy.data.collections.get("Chassis_Frame")
if chassis_collection:
    for obj in chassis_collection.objects:
        obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath="/Users/parth/Desktop/SIEP Website/web/public/chassis.glb",
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT'
)
print("Chassis GLB export complete!")
```

#### Recipe 3: Adjust Brand Orange Body Paint Color
```python
import bpy

mat = bpy.data.materials.get("Body_Paint_Orange")
if mat and mat.use_nodes:
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        # Set to vivid electric orange [R, G, B, A]
        bsdf.inputs["Base Color"].default_value = (1.0, 0.45, 0.04, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.18
        bsdf.inputs["Metallic"].default_value = 0.15
        print("Updated Body_Paint_Orange material.")
```

#### Recipe 4: Toggle Headlight Halo Glow Intensity
```python
import bpy

mat = bpy.data.materials.get("Headlight_Halo_Alice_Blue")
if mat and mat.use_nodes:
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        # Boost halo emission strength for high-contrast renders
        bsdf.inputs["Emission Strength"].default_value = 10.0
        print("Headlight Halo emission boosted.")
```

---

## 10. EXPORT WORKFLOWS & MAINTENANCE CHECKLIST

When modifying geometry, materials, or collections in `Electric_Scrambler_Exo.blend`, follow this standardized deployment checklist:

### Pre-Export Checklist
1. **Apply Transforms**: Ensure all modified objects have scale applied (`Ctrl + A` -> `Apply All Transforms` / `Scale`).
2. **Check Normals**: In Edit Mode, verify normals face outward (`Shift + N` -> `Recalculate Outside`).
3. **Material Slot Hygiene**: Remove unassigned or empty material slots from meshes.
4. **Purge Orphan Data**: In Blender, run `File -> Clean Up -> Unused Data-Blocks` to keep the file lean.
5. **Keep Mesh Density Balanced**:
   - Primary focal items (TFT dash, frame tubes, battery enclosure): smooth bevels.
   - Fasteners, internal brackets, small bolts: simplified low-poly representations to keep total export under 2.5 MB.

### Post-Export Deployment
1. Run the GLB export script to write directly to:
   - `web/public/moto.glb`
   - `web/public/chassis.glb`
2. Test the 3D model in the local Next.js environment:
   ```bash
   cd web && npm run dev
   ```
3. Open `http://localhost:3000` to verify the scroll timeline animations.
4. Open `http://localhost:3000/bike` to verify 360° OrbitControls and material reflections.
5. Ensure mobile memory safety: verify the `3D Render: ON / OFF` toggle unmounts the canvas as expected.

---
*Maintained by Riders Bay Engineering Collective & Antigravity Pair Programmer.*
