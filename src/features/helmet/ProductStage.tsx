function StudioLighting() {
  return (
    <>
      <hemisphereLight args={['#f1f0eb', '#34373e', 1.3]} />
      <directionalLight
        position={[-3, 6, 4]} intensity={3.2} color="#fff5e7" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002} shadow-normalBias={0.025}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-camera-near={0.5} shadow-camera-far={15}
      />
      <directionalLight position={[4, 2, -3]} intensity={2} color="#b5c6de" />
      <directionalLight position={[1, 3, 5]} intensity={0.5} color="#f1f0eb" />
    </>
  )
}

export function ProductStage() {
  return (
    <>
      <StudioLighting />
      <group>
        <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 1.36, 0.18, 96]} />
          <meshStandardMaterial color="#34373e" metalness={0.45} roughness={0.52} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.16, 1.22, 0.12, 96]} />
          <meshStandardMaterial color="#181b21" metalness={0.25} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.31, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.24, 1.24, 0.06, 96]} />
          <meshStandardMaterial color="#a3a7ad" metalness={0.4} roughness={0.42} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.348, 0]}>
          <torusGeometry args={[1.17, 0.007, 8, 96]} />
          <meshStandardMaterial color="#34373e" roughness={0.6} metalness={0.35} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
          <torusGeometry args={[1.51, 0.009, 8, 96]} />
          <meshStandardMaterial color="#8c939e" metalness={0.3} roughness={0.65} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
          <group key={angle} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.023, 1.47]} receiveShadow>
              <boxGeometry args={[0.035, 0.025, 0.21]} />
              <meshStandardMaterial color="#ff6547" roughness={0.65} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.23, 1.205]} castShadow>
          <boxGeometry args={[0.28, 0.025, 0.025]} />
          <meshStandardMaterial color="#ff6547" roughness={0.65} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#181b21" roughness={0.95} />
      </mesh>
    </>
  )
}
