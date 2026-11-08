"use client";

import { useRef, useLayoutEffect, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { Environment, ContactShadows, Float, useGLTF } from '@react-three/drei';

// Preload the model for instant display
useGLTF.preload('/moto.glb');

export default function Experience() {
  const groupRef = useRef<THREE.Group>(null);
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load the GLB model with full PBR materials from Blender
  const { scene } = useGLTF('/moto.glb');

  // Clone and enhance for Three.js rendering
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadow casting for all meshes
        child.castShadow = true;
        child.receiveShadow = true;
        
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        
        mats.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            // Boost environment reflections for studio look
            mat.envMapIntensity = 1.3;
            
            // Enhance emissive materials (LEDs, headlight halo)
            if (mat.emissiveIntensity > 0) {
              mat.toneMapped = false; // Allow emissive to glow beyond tonemapping
            }
            
            mat.needsUpdate = true;
          }
        });
      }
    });

    // Center the geometry for clean rotation origin
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.x -= center.x;
    clone.position.y -= center.y;
    clone.position.z -= center.z;
    
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current || !clonedScene) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#timeline-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    if (isMobile) {
      // Mobile positioning - bike below hero text
      gsap.set(groupRef.current.position, { x: 0, y: -1.2, z: 0.2 });
      gsap.set(groupRef.current.rotation, { x: 0.1, y: -Math.PI / 5, z: 0 });

      // 0. Fade out the "Scroll to Explore" indicator immediately upon scrolling
      tl.to('#scroll-indicator', { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

      // STAGE 1: Hero -> Chassis — 3/4 elevated view showing frame structure
      tl.to(groupRef.current.position, { x: 0, y: -0.3, z: 0.3, duration: 1, ease: 'power2.inOut' }, 0);
      tl.to(groupRef.current.rotation, { x: 0.25, y: -Math.PI / 4, z: 0, duration: 1, ease: 'power2.inOut' }, 0);

      // STAGE 2: Chassis -> Powertrain — right side showing engine/motor area
      tl.to(groupRef.current.position, { x: 0, y: -0.6, z: 0.4, duration: 1, ease: 'power2.inOut' }, 1);
      tl.to(groupRef.current.rotation, { x: 0.15, y: Math.PI / 3, z: 0, duration: 1, ease: 'power2.inOut' }, 1);

      // STAGE 3: Powertrain -> Battery — slightly elevated angle showing mid-frame battery area
      tl.to(groupRef.current.position, { x: 0, y: 0.2, z: 0.5, duration: 1, ease: 'power2.inOut' }, 2);
      tl.to(groupRef.current.rotation, { x: 0.45, y: -Math.PI / 5, z: 0, duration: 1, ease: 'power2.inOut' }, 2);

      // STAGE 4: Battery -> Motion — low angle front view, showing forks & front wheel
      tl.to(groupRef.current.position, { x: 0, y: -0.8, z: 0.6, duration: 1, ease: 'power2.inOut' }, 3);
      tl.to(groupRef.current.rotation, { x: -0.1, y: -Math.PI / 6, z: 0.05, duration: 1, ease: 'power2.inOut' }, 3);

      // STAGE 5: Motion -> Body — full side profile showing silhouette
      tl.to(groupRef.current.position, { x: 0, y: -0.5, z: -0.3, duration: 1, ease: 'power2.inOut' }, 4);
      tl.to(groupRef.current.rotation, { x: 0.05, y: -Math.PI / 2, z: 0, duration: 1, ease: 'power2.inOut' }, 4);

      // STAGE 6: Body -> Smart System — rear 3/4 showing gauge/cockpit area
      tl.to(groupRef.current.position, { x: 0, y: -0.2, z: 0.3, duration: 1, ease: 'power2.inOut' }, 5);
      tl.to(groupRef.current.rotation, { x: -0.15, y: Math.PI * 0.7, z: 0, duration: 1, ease: 'power2.inOut' }, 5);

      // STAGE 7: Smart System -> Ready to Ride — pull back, classic 3/4 beauty shot
      tl.to(groupRef.current.position, { x: 0, y: -0.5, z: -0.8, duration: 1, ease: 'power2.inOut' }, 6);
      tl.to(groupRef.current.rotation, { x: 0.08, y: -Math.PI / 5, z: 0, duration: 1, ease: 'power2.inOut' }, 6);
    } else {
      // Desktop positioning
      gsap.set(groupRef.current.position, { x: 2.2, y: -1.2, z: 0 });
      gsap.set(groupRef.current.rotation, { x: 0.1, y: -Math.PI / 5, z: 0 });

      tl.to('#scroll-indicator', { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

      // STAGE 1: Hero -> Chassis (Text LEFT) — Elevated 3/4 view, bike RIGHT
      tl.to(groupRef.current.position, { x: 1.8, y: 0.3, z: 0.5, duration: 1, ease: 'power2.inOut' }, 0);
      tl.to(groupRef.current.rotation, { x: 0.25, y: -Math.PI / 4, z: 0, duration: 1, ease: 'power2.inOut' }, 0);

      // STAGE 2: Chassis -> Powertrain (Text RIGHT) — Right-side profile, bike LEFT
      tl.to(groupRef.current.position, { x: -1.8, y: -0.6, z: 0.4, duration: 1, ease: 'power2.inOut' }, 1);
      tl.to(groupRef.current.rotation, { x: 0.15, y: Math.PI / 3, z: 0, duration: 1, ease: 'power2.inOut' }, 1);

      // STAGE 3: Powertrain -> Battery (Text LEFT) — Elevated angle, bike RIGHT
      tl.to(groupRef.current.position, { x: 1.5, y: 0.5, z: 0.6, duration: 1, ease: 'power2.inOut' }, 2);
      tl.to(groupRef.current.rotation, { x: 0.45, y: -Math.PI / 5, z: 0, duration: 1, ease: 'power2.inOut' }, 2);

      // STAGE 4: Battery -> Motion (Text RIGHT) — Low front angle, bike LEFT
      tl.to(groupRef.current.position, { x: -1.8, y: -0.8, z: 0.7, duration: 1, ease: 'power2.inOut' }, 3);
      tl.to(groupRef.current.rotation, { x: -0.1, y: -Math.PI / 6, z: 0.05, duration: 1, ease: 'power2.inOut' }, 3);

      // STAGE 5: Motion -> Body (Text LEFT) — Full clean side profile, bike RIGHT
      tl.to(groupRef.current.position, { x: 1.5, y: -0.5, z: -0.3, duration: 1, ease: 'power2.inOut' }, 4);
      tl.to(groupRef.current.rotation, { x: 0.05, y: -Math.PI / 2, z: 0, duration: 1, ease: 'power2.inOut' }, 4);

      // STAGE 6: Body -> Smart System (Text RIGHT) — Rear 3/4 view, bike LEFT
      tl.to(groupRef.current.position, { x: -1.5, y: -0.2, z: 0.3, duration: 1, ease: 'power2.inOut' }, 5);
      tl.to(groupRef.current.rotation, { x: -0.15, y: Math.PI * 0.7, z: 0, duration: 1, ease: 'power2.inOut' }, 5);

      // STAGE 7: Smart System -> Ready to Ride (CENTER) — Classic 3/4 beauty shot
      tl.to(groupRef.current.position, { x: 0, y: -0.5, z: -0.8, duration: 1, ease: 'power2.inOut' }, 6);
      tl.to(groupRef.current.rotation, { x: 0.08, y: -Math.PI / 5, z: 0, duration: 1, ease: 'power2.inOut' }, 6);
    }
    
    return () => {
      tl.kill();
    };
  }, [clonedScene, isMobile]);

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} scale={isMobile ? 0.72 : 1.1}>
      
      {/* HDR Environment — City preset for metallic reflections on chrome, steel & gold anodized parts */}
      <Environment preset="city" />

      {/* 4-Point Automotive Studio Lighting (matches Blender rig from context.md) */}
      
      {/* Ambient fill — very soft to not wash out metals */}
      <ambientLight intensity={0.25} color="#f8f9fa" />
      
      {/* Key Light — warm studio daylight from upper right (3200K) */}
      <directionalLight 
        position={[2.5, 3.0, 2.0]} 
        intensity={2.2} 
        color="#fff7eb" 
        castShadow 
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Fill Light — cool blue from opposite side to reveal chassis underside */}
      <directionalLight position={[-2.2, 1.5, 1.2]} intensity={0.9} color="#bfe6ff" />
      
      {/* Rim Light — brand orange backlight defining silhouette & rear subframe */}
      <spotLight 
        position={[1.8, 1.8, -1.8]} 
        intensity={3.0} 
        color="#FF7300" 
        angle={0.4} 
        penumbra={0.8}
        distance={12}
        decay={2}
      />
      
      {/* Ground Bounce — subtle upward fill simulating reflective studio floor */}
      <pointLight position={[0, -1.5, 0]} intensity={0.5} color="#f2f2ff" distance={6} decay={2} />
      
      {/* Subtle Floating Animation — reduced intensity for premium feel */}
      <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.3} floatingRange={[-0.06, 0.06]}>
        <primitive object={clonedScene} />
      </Float>

      {/* Soft Contact Shadows — dark jet black for grounding effect */}
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.5} 
        scale={12} 
        blur={2.5} 
        far={4} 
        color="#2B303A"
      />

    </group>
  );
}
