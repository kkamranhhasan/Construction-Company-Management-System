"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Environment, ContactShadows, Float, Stage } from "@react-three/drei"
import * as THREE from "three"

// Since we don't have a real GLTF model, we'll build a programmatic advanced construction scene.
// Instead of a single box, we'll create a stylized low-poly construction site with cranes, beams, etc.
function Crane() {
  const craneRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (craneRef.current) {
      craneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5
    }
  })

  return (
    <group ref={craneRef} position={[0, 0, 0]}>
      {/* Tower */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[0.5, 8, 0.5]} />
        <meshStandardMaterial color="#fca311" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Jib */}
      <mesh position={[2, 8, 0]}>
        <boxGeometry args={[6, 0.4, 0.4]} />
        <meshStandardMaterial color="#fca311" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Counter Jib */}
      <mesh position={[-1.5, 8, 0]}>
        <boxGeometry args={[2.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Hook lines */}
      <mesh position={[4, 6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Hook block */}
      <mesh position={[4, 4, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#e63946" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[4, 3.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
    </group>
  )
}

function BuildingSkeleton() {
  return (
    <group position={[-3, 0, -2]}>
      {/* Base Foundation */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      {/* Pillars */}
      {[-1.8, 1.8].map((x, i) =>
        [-1.8, 1.8].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 2, z]}>
            <cylinderGeometry args={[0.15, 0.15, 4]} />
            <meshStandardMaterial color="#bdc3c7" metalness={0.6} />
          </mesh>
        ))
      )}

      {/* Floors */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[4, 0.2, 4]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
      
      {/* Second Level Pillars */}
      {[-1.8, 1.8].map((x, i) =>
        [-[-1.8], 1.8].map((z, j) => (
          <mesh key={`L2-${i}-${j}`} position={[x, 6, z]}>
            <cylinderGeometry args={[0.15, 0.15, 4]} />
            <meshStandardMaterial color="#bdc3c7" metalness={0.6} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Elements() {
  return (
    <group position={[0, -2, 0]}>
      <Crane />
      <BuildingSkeleton />
      
      {/* Small details */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[2, 0.5, 3]} rotation={[1, 1, 1]}>
          <octahedronGeometry args={[0.5]} />
          <meshPhysicalMaterial color="#4facfe" transmission={1} thickness={0.5} roughness={0} />
        </mesh>
      </Float>

      <mesh position={[-2, 0.5, 3]}>
         <boxGeometry args={[1, 1, 1]} />
         <meshStandardMaterial color="#e67e22" roughness={0.1} />
      </mesh>
      <mesh position={[-1.2, 0.3, 3.2]} rotation={[0, Math.PI/4, 0]}>
         <boxGeometry args={[0.6, 0.6, 0.6]} />
         <meshStandardMaterial color="#f1c40f" roughness={0.1} />
      </mesh>
    </group>
  )
}

export function ConstructionScene() {
  return (
    <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
      <Elements />
    </Stage>
  )
}
