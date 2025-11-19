import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = (props: any) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.cos(t / 4) / 2;
            meshRef.current.rotation.y = Math.sin(t / 4) / 2;
            meshRef.current.position.y = Math.sin(t / 1.5) / 10;
        }
    });

    return (
        <mesh
            {...props}
            ref={meshRef}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.2 : 1}
        >
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial
                color={hovered ? "#C4A484" : "#8B9A8B"} // Terracotta on hover, Sage Green default
                envMapIntensity={1}
                clearcoat={1}
                clearcoatRoughness={0}
                metalness={0.1}
                distort={0.4}
                speed={2}
            />
        </mesh>
    );
};

const ThreeDLogo = () => {
    return (
        <div className="w-full h-[500px] relative">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Float
                    speed={4}
                    rotationIntensity={1}
                    floatIntensity={2}
                >
                    <AnimatedSphere />
                </Float>
            </Canvas>
        </div>
    );
};

export default ThreeDLogo;
