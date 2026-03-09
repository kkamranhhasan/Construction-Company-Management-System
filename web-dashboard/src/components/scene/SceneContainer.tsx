"use client"

import { Canvas } from "@react-three/fiber"
import { ConstructionScene } from "./ConstructionScene"
import { OrbitControls, ContactShadows } from "@react-three/drei"
import { Suspense } from "react"

export function SceneContainer() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas shadows camera={{ position: [10, 5, 10], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        <Suspense fallback={null}>
          <ConstructionScene />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={50} blur={2.5} far={10} />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        
        {/* Dramatic lighting defaults */}
        <ambientLight intensity={0.5} />
        <directionalLight castShadow position={[10, 10, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
      </Canvas>
    </div>
  )
}
