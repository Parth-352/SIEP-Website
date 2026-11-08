"use client";

import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MTLLoader, OBJLoader } from 'three-stdlib';

gsap.registerPlugin(ScrollTrigger);

import { Environment, ContactShadows, Float } from '@react-three/drei';

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
  
  // Use React state to hold the loaded OBJ
  const [obj, setObj] = useState<THREE.Group | null>(null);

  useEffect(() => {
    // Load materials first
    const mtlLoader = new MTLLoader();
    mtlLoader.load('/moto_simple_1.mtl', (materials) => {
      materials.preload();
      
      // Load OBJ and apply materials
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('/moto_simple_1.obj', (object) => {
        
        // Brand color mapping
        const colorMap: Record<string, string> = {
          tank: '#FFB347',       // Orange
          seat: '#2B303A',       // Jet Black
          tire: '#2B303A',       // Jet Black
          engine: '#7C7C7C',     // Grey
          exhaust: '#7C7C7C',    // Grey
          plane: '#7C7C7C',
          plate: '#7C7C7C',
          gauge: '#7C7C7C',
          flash: '#FFB347',      // Orange accents
          front_light: '#EDF6F9',// Alice Blue lens
          rear_light: '#ff0000', // Red taillight
        };

        // Traverse and apply colors
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            
            mats.forEach(mat => {
              for (const [key, colorHex] of Object.entries(colorMap)) {
                if (mat.name && mat.name.toLowerCase().includes(key)) {
                  if (mat.color) {
                    mat.color.set(colorHex);
                  }
                }
              }
              // Make materials highly reflective for the Environment map
              mat.roughness = 0.2;
              mat.metalness = 0.8;
              if (mat.shininess !== undefined) mat.shininess = 150;
            });
          }
        });

        // Center the geometry
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);
        
        setObj(object);
      });
    });
  }, []);

  useLayoutEffect(() => {
    if (!groupRef.current || !obj) return;

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
      // Initial positioning (Hero) - 3/4 beauty shot, positioned to the right
      gsap.set(groupRef.current.position, { x: 2.2, y: -1.2, z: 0 });
      gsap.set(groupRef.current.rotation, { x: 0.1, y: -Math.PI / 5, z: 0 });

      // 0. Fade out the "Scroll to Explore" indicator immediately upon scrolling
      tl.to('#scroll-indicator', { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

      // STAGE 1: Hero -> Chassis (Text LEFT) - Elevated 3/4 view showing the frame, bike stays RIGHT
      tl.to(groupRef.current.position, { x: 1.8, y: 0.3, z: 0.5, duration: 1, ease: 'power2.inOut' }, 0);
      tl.to(groupRef.current.rotation, { x: 0.25, y: -Math.PI / 4, z: 0, duration: 1, ease: 'power2.inOut' }, 0);

      // STAGE 2: Chassis -> Powertrain (Text RIGHT) - Right-side profile showing engine/motor, bike LEFT
      tl.to(groupRef.current.position, { x: -1.8, y: -0.6, z: 0.4, duration: 1, ease: 'power2.inOut' }, 1);
      tl.to(groupRef.current.rotation, { x: 0.15, y: Math.PI / 3, z: 0, duration: 1, ease: 'power2.inOut' }, 1);

      // STAGE 3: Powertrain -> Battery (Text LEFT) - Elevated angle showing mid-frame battery area, bike RIGHT
      tl.to(groupRef.current.position, { x: 1.5, y: 0.5, z: 0.6, duration: 1, ease: 'power2.inOut' }, 2);
      tl.to(groupRef.current.rotation, { x: 0.45, y: -Math.PI / 5, z: 0, duration: 1, ease: 'power2.inOut' }, 2);

      // STAGE 4: Battery -> Motion (Text RIGHT) - Low front angle showing forks & wheels, bike LEFT
      tl.to(groupRef.current.position, { x: -1.8, y: -0.8, z: 0.7, duration: 1, ease: 'power2.inOut' }, 3);
      tl.to(groupRef.current.rotation, { x: -0.1, y: -Math.PI / 6, z: 0.05, duration: 1, ease: 'power2.inOut' }, 3);

      // STAGE 5: Motion -> Body (Text LEFT) - Full clean side profile, bike RIGHT & pulled back
      tl.to(groupRef.current.position, { x: 1.5, y: -0.5, z: -0.3, duration: 1, ease: 'power2.inOut' }, 4);
      tl.to(groupRef.current.rotation, { x: 0.05, y: -Math.PI / 2, z: 0, duration: 1, ease: 'power2.inOut' }, 4);

      // STAGE 6: Body -> Smart System (Text RIGHT) - Rear 3/4 view showing cockpit/gauge area, bike LEFT
      tl.to(groupRef.current.position, { x: -1.5, y: -0.2, z: 0.3, duration: 1, ease: 'power2.inOut' }, 5);
      tl.to(groupRef.current.rotation, { x: -0.15, y: Math.PI * 0.7, z: 0, duration: 1, ease: 'power2.inOut' }, 5);

      // STAGE 7: Smart System -> Ready to Ride (CENTER) - Pull back, classic 3/4 front beauty shot
      tl.to(groupRef.current.position, { x: 0, y: -0.5, z: -0.8, duration: 1, ease: 'power2.inOut' }, 6);
      tl.to(groupRef.current.rotation, { x: 0.08, y: -Math.PI / 5, z: 0, duration: 1, ease: 'power2.inOut' }, 6);
    }
    
    return () => {
      tl.kill();
    };
  }, [obj, isMobile]);

  if (!obj) return null;

  return (
    <group ref={groupRef} scale={isMobile ? 0.72 : 1.1}>
      
      {/* Photorealistic Environment Reflections */}
      <Environment preset="city" />

      {/* Studio Lighting Setup */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={2.5} color="#ffffff" castShadow />
      <directionalLight position={[5, 2, 2]} intensity={1.2} color="#EDF6F9" />
      <spotLight position={[0, 5, -10]} intensity={3} color="#FFB347" angle={0.3} penumbra={1} />
      
      {/* Subtle Floating Animation */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
        <primitive object={obj} />
      </Float>

      {/* Realistic Soft Floor Shadows */}
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.6} 
        scale={10} 
        blur={2} 
        far={4} 
        color="#000000"
      />

    </group>
  );
}
