"use client";

import { useLoader, useFrame } from '@react-three/fiber';
import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MTLLoader, OBJLoader } from 'three-stdlib';

gsap.registerPlugin(ScrollTrigger);

import { Environment, ContactShadows, Float } from '@react-three/drei';

export default function Experience() {
  const groupRef = useRef<THREE.Group>(null);
  
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
        scroller: '.overflow-y-auto',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // Initial positioning (Hero) - Cinematic 3/4 beauty shot
    gsap.set(groupRef.current.position, { x: 0, y: -0.5, z: 0 });
    gsap.set(groupRef.current.rotation, { x: 0.05, y: -Math.PI / 4, z: 0 });

    // 0. Fade out the "Scroll to Explore" indicator immediately upon scrolling
    tl.to('#scroll-indicator', { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

    // 1. Hero -> Chassis (Text left) - Dramatic low angle, looking up at the chassis
    tl.to(groupRef.current.position, { x: 1.5, y: 1.2, z: 2, duration: 1, ease: 'power2.inOut' }, 0);
    tl.to(groupRef.current.rotation, { x: -0.3, y: -Math.PI / 8, z: 0.1, duration: 1, ease: 'power2.inOut' }, 0); // Slight Dutch angle

    // 2. Chassis -> Powertrain & Battery (Text right) - Top-down swoop, looking at the core
    tl.to(groupRef.current.position, { x: -1.5, y: -1.5, z: 1.5, duration: 1, ease: 'power2.inOut' }, 1);
    tl.to(groupRef.current.rotation, { x: 0.6, y: Math.PI / 6, z: -0.1, duration: 1, ease: 'power2.inOut' }, 1);

    // 3. Powertrain -> Systems Integration (Text left) - Extreme macro zoom on front forks/wheel
    tl.to(groupRef.current.position, { x: 2.5, y: -2, z: 3.5, duration: 1, ease: 'power2.inOut' }, 2);
    tl.to(groupRef.current.rotation, { x: 0, y: -Math.PI / 2.5, z: 0.15, duration: 1, ease: 'power2.inOut' }, 2);

    // 4. Systems Integration -> Final Reveal (Center) - Dramatic pull-back into a heroic left profile
    tl.to(groupRef.current.position, { x: 0, y: -0.5, z: -1, duration: 1, ease: 'power2.inOut' }, 3);
    tl.to(groupRef.current.rotation, { x: 0, y: Math.PI * 1.5, z: 0, duration: 1, ease: 'power2.inOut' }, 3);
    
    return () => {
      tl.kill();
    };
  }, [obj]);

  if (!obj) return null;

  return (
    <group ref={groupRef} scale={1.1}>
      
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
