import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

export function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.84}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.38}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.42} />
    </EffectComposer>
  )
}
