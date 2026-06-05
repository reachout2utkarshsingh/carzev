import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDCarCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.5, 1.8, 4.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00C896, 1.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9acbff, 1.5);
    dirLight2.position.set(-5, 3, -5);
    scene.add(dirLight2);

    // 5. Procedural Wireframe Sports Car
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Cyan and Neon Green materials
    const cyanMaterial = new THREE.LineBasicMaterial({ color: 0x9acbff, linewidth: 2 });
    const greenMaterial = new THREE.LineBasicMaterial({ color: 0x00C896, linewidth: 2 });

    // Chassis vertices definition (glowing neon frame)
    const vertices = new Float32Array([
      // Front Bumper Nose to Hood
      -1.8, -0.1, 0.5,    -1.2, 0.15, 0.5,
      -1.2, 0.15, 0.5,    -0.6, 0.35, 0.45,
      -0.6, 0.35, 0.45,    0.4, 0.35, 0.45,
       0.4, 0.35, 0.45,    1.2, 0.2, 0.5,
       1.2, 0.2, 0.5,      1.8, -0.1, 0.5,

      -1.8, -0.1, -0.5,   -1.2, 0.15, -0.5,
      -1.2, 0.15, -0.5,   -0.6, 0.35, -0.45,
      -0.6, 0.35, -0.45,   0.4, 0.35, -0.45,
       0.4, 0.35, -0.45,   1.2, 0.2, -0.5,
       1.2, 0.2, -0.5,     1.8, -0.1, -0.5,

      // Windshield & Roof Outline
      -0.6, 0.35, 0.45,   -0.2, 0.75, 0.4,
      -0.2, 0.75, 0.4,     0.5, 0.75, 0.4,
       0.5, 0.75, 0.4,     1.0, 0.3, 0.48,

      -0.6, 0.35, -0.45,  -0.2, 0.75, -0.4,
      -0.2, 0.75, -0.4,    0.5, 0.75, -0.4,
       0.5, 0.75, -0.4,    1.0, 0.3, -0.48,

      // Horizontal Cross Connects (Symmetry connecting left & right sides)
      -1.8, -0.1, 0.5,    -1.8, -0.1, -0.5,
      -1.2, 0.15, 0.5,    -1.2, 0.15, -0.5,
      -0.6, 0.35, 0.45,   -0.6, 0.35, -0.45,
       0.4, 0.35, 0.45,    0.4, 0.35, -0.45,
       1.2, 0.2, 0.5,      1.2, 0.2, -0.5,
       1.8, -0.1, 0.5,      1.8, -0.1, -0.5,

      -0.2, 0.75, 0.4,    -0.2, 0.75, -0.4,
       0.5, 0.75, 0.4,     0.5, 0.75, -0.4,
       1.0, 0.3, 0.48,     1.0, 0.3, -0.48,

      // Side Skirts (Underbody edges)
      -1.8, -0.25, 0.5,    1.8, -0.25, 0.5,
      -1.8, -0.25, -0.5,   1.8, -0.25, -0.5,

      -1.8, -0.25, 0.5,   -1.8, -0.1, 0.5,
       1.8, -0.25, 0.5,    1.8, -0.1, 0.5,
      -1.8, -0.25, -0.5,  -1.8, -0.1, -0.5,
       1.8, -0.25, -0.5,   1.8, -0.1, -0.5,

      -1.8, -0.25, 0.5,   -1.8, -0.25, -0.5,
       1.8, -0.25, 0.5,    1.8, -0.25, -0.5,
    ]);

    const chassisGeometry = new THREE.BufferGeometry();
    chassisGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const chassisLine = new THREE.LineSegments(chassisGeometry, cyanMaterial);
    carGroup.add(chassisLine);

    // Decorative Neon Accent lines (Highlights the EV engine/battery glow inside)
    const accentVertices = new Float32Array([
      // Central battery pack frame
      -0.8, -0.2, 0.35,    0.8, -0.2, 0.35,
      -0.8, -0.2, -0.35,   0.8, -0.2, -0.35,
      -0.8, -0.2, 0.35,   -0.8, -0.2, -0.35,
       0.8, -0.2, 0.35,    0.8, -0.2, -0.35,

      // Glowing engine block front
      -1.4, -0.18, 0.25,  -1.0, -0.18, 0.25,
      -1.4, -0.18, -0.25, -1.0, -0.18, -0.25,
      -1.4, -0.18, 0.25,  -1.4, -0.18, -0.25,
      -1.0, -0.18, 0.25,  -1.0, -0.18, -0.25,
    ]);

    const accentGeometry = new THREE.BufferGeometry();
    accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentVertices, 3));
    const accentLine = new THREE.LineSegments(accentGeometry, greenMaterial);
    carGroup.add(accentLine);

    // 4 Glowing Wheels (procedure cylinders)
    const wheelGeom = new THREE.TorusGeometry(0.3, 0.08, 8, 24);
    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      { x: -0.9, y: -0.2, z: 0.55 },
      { x: -0.9, y: -0.2, z: -0.55 },
      { x: 0.9, y: -0.2, z: 0.55 },
      { x: 0.9, y: -0.2, z: -0.55 },
    ];

    const wheelMaterial = new THREE.MeshBasicMaterial({
      color: 0x00C896,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      // Torus is created on XY plane, rotate it to stand up along Z axis
      wheel.rotation.x = Math.PI / 2;
      carGroup.add(wheel);
      wheels.push(wheel);
    });

    // 6. Infinite Moving Neon Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x00C896, 0x414750);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    // 7. Mouse Interaction logic
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / width) * 2 - 1;
      const y = -((event.clientY - rect.top) / height) * 2 + 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate wheels to simulate driving forward
      wheels.forEach((w) => {
        w.rotation.z = -elapsedTime * 6;
      });

      // Slide the grid backward to simulate speed
      gridHelper.position.z = (elapsedTime * 1.5) % 1.0;

      // Dampened mouse tilt & auto-rotate logic
      const targetRotationY = mouseRef.current.x * 0.4 + elapsedTime * 0.08;
      const targetRotationX = mouseRef.current.y * 0.2;

      carGroup.rotation.y += (targetRotationY - carGroup.rotation.y) * 0.08;
      carGroup.rotation.x += (targetRotationX - carGroup.rotation.x) * 0.08;

      // Add a subtle electric levitation vibration
      carGroup.position.y = Math.sin(elapsedTime * 4) * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanups on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      chassisGeometry.dispose();
      cyanMaterial.dispose();
      accentGeometry.dispose();
      greenMaterial.dispose();
      wheelGeom.dispose();
      wheelMaterial.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] sm:min-h-[400px] cursor-grab active:cursor-grabbing relative"
      id="3d-car-container"
    >
      <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 pointer-events-none select-none">
        <span className="text-[10px] uppercase tracking-widest text-[#00C896] font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#00C896] rounded-full animate-ping"></span>
          Interactive 3D Engine
        </span>
      </div>
    </div>
  );
}
