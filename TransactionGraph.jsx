import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';
import * as THREE from 'three';

const TransactionGraph = () => {
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x12121a, 0.02);
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create demo graph nodes
    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const colors = [0x6366f1, 0xef4444, 0xf97316, 0x22c55e];

    for (let i = 0; i < 30; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      mesh.userData = { id: i, address: `0x${Math.random().toString(16).slice(2, 14)}...`, risk: color === 0xef4444 ? 'CRITICAL' : color === 0xf97316 ? 'HIGH' : color === 0x22c55e ? 'LOW' : 'MEDIUM' };
      scene.add(mesh);
      nodes.push(mesh);
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0x3a3a50, transparent: true, opacity: 0.3 });
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.85) {
          const geo = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position]);
          const line = new THREE.Line(geo, lineMat);
          scene.add(line);
          lines.push(line);
        }
      }
    }

    camera.position.z = 8;
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);
      if (intersects.length > 0) {
        setSelectedNode(intersects[0].object.userData);
      }
    };
    renderer.domElement.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      nodes.forEach((n, i) => {
        n.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Network size={24} className="text-sentinel-accent" />Transaction Graph</h1>
        <div className="flex items-center gap-2">
          <select className="input-field text-sm py-2" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button className="p-2 bg-sentinel-800 rounded-lg hover:bg-sentinel-700"><ZoomIn size={18} /></button>
          <button className="p-2 bg-sentinel-800 rounded-lg hover:bg-sentinel-700"><ZoomOut size={18} /></button>
          <button className="p-2 bg-sentinel-800 rounded-lg hover:bg-sentinel-700"><RotateCcw size={18} /></button>
        </div>
      </div>
      <div className="relative flex-1 min-h-[600px] card p-0 overflow-hidden">
        <div ref={mountRef} className="absolute inset-0" />
        {selectedNode && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 right-4 w-72 card bg-sentinel-900/90 backdrop-blur-md">
            <h3 className="font-bold mb-3">Wallet Intelligence</h3>
            <div className="text-sm font-mono text-gray-300 mb-2">{selectedNode.address}</div>
            <div className={`badge badge-${selectedNode.risk.toLowerCase()}`}>{selectedNode.risk}</div>
            <button onClick={() => setSelectedNode(null)} className="mt-4 w-full btn-secondary text-sm py-2">Close</button>
          </motion.div>
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-gray-500 bg-sentinel-900/80 px-3 py-2 rounded-lg">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Low</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionGraph;
