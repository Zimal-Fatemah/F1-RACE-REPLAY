import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK_CURVE } from '../services/trackData';

export const Track: React.FC = () => {
  const TRACK_WIDTH = 14;
  const POINTS_COUNT = 800; // Increased resolution for smoother curves

  // Calculate geometries for the road surface and the edge lines
  const { roadGeometry, leftLineGeometry, rightLineGeometry } = useMemo(() => {
    // 1. Road Surface (Extruded shape)
    const shape = new THREE.Shape();
    // Create a road profile
    shape.moveTo(-TRACK_WIDTH / 2, 0);
    shape.lineTo(TRACK_WIDTH / 2, 0);
    shape.lineTo(TRACK_WIDTH / 2, 0.1); 
    shape.lineTo(-TRACK_WIDTH / 2, 0.1);
    
    const geometry = new THREE.ExtrudeGeometry(shape, {
      extrudePath: TRACK_CURVE,
      steps: POINTS_COUNT,
      bevelEnabled: false,
    });

    // 2. Calculate Continuous Edge Lines (Ribbons)
    // We compute Frenet frames to get the normals along the curve
    const points = TRACK_CURVE.getPoints(POINTS_COUNT);
    const frames = TRACK_CURVE.computeFrenetFrames(POINTS_COUNT, true);
    
    // Width of the edge line
    const lineWidth = 0.8; 
    const halfWidth = TRACK_WIDTH / 2;
    
    // Helper to build a strip mesh for the edges
    const buildStrip = (offsetScalar: number) => {
        const vertices: number[] = [];
        const indices: number[] = [];
        
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const normal = frames.normals[i];
            
            // Calculate inner and outer points for the ribbon
            // We lift y by 0.15 to sit slightly above the road surface
            const inner = p.clone().add(normal.clone().multiplyScalar(offsetScalar));
            
            const outerOffset = offsetScalar > 0 
                ? offsetScalar + lineWidth 
                : offsetScalar - lineWidth;
            
            const outer = p.clone().add(normal.clone().multiplyScalar(outerOffset));
            
            // Push vertices (x, y, z)
            vertices.push(inner.x, inner.y + 0.15, inner.z); 
            vertices.push(outer.x, outer.y + 0.15, outer.z);
            
            if (i < points.length - 1) {
                const base = i * 2;
                // Triangle 1
                indices.push(base, base + 1, base + 2);
                // Triangle 2
                indices.push(base + 1, base + 3, base + 2);
            }
        }
        
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;
    };

    const leftGeo = buildStrip(halfWidth);
    const rightGeo = buildStrip(-halfWidth);

    return { 
      roadGeometry: geometry, 
      leftLineGeometry: leftGeo, 
      rightLineGeometry: rightGeo 
    };
  }, []);

  return (
    <group>
      {/* The Asphalt - Changed to Medium Grey with Emissive glow for better visibility */}
      <mesh geometry={roadGeometry} position={[0, -0.1, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#222222"
          roughness={0.6} 
          metalness={0.1}
        />
      </mesh>

      {/* Left Edge Line - Bright White Basic Material for 100% visibility */}
      <mesh geometry={leftLineGeometry}>
         <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Right Edge Line - Bright White Basic Material */}
      <mesh geometry={rightLineGeometry}>
         <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      
      {/* Ground Plane - Subtle grid for context */}
      <gridHelper args={[1000, 100, 0x333333, 0x111111]} position={[0, -2, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="#050a14" />
      </mesh>
    </group>
  );
};