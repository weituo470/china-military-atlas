import { useLayoutEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'

// A low-resolution coverage mask of the *selected model*, mirrored at its
// local waterline. This is a lighting pass for one actual globe vessel; no
// duplicate Earth, camera controller, visible scene or additional canvas.
export function useContactReflection(mat:RefObject<T.ShaderMaterial|null>, enabled:boolean, key:string, id:string|undefined) {
  const pass=useRef<{
    stage:T.Scene; root:T.Group; mirror:T.Matrix4; rt:T.WebGLRenderTarget; src:T.Object3D|null
    berth:T.Object3D|null; vp:T.Matrix4; nextVP:T.Matrix4; oldRGB:T.Color
    oldParent:T.Matrix4; age:number; nFrame:number
  }|null>(null)
  useLayoutEffect(()=>{
    if(!enabled||!id||!mat.current)return
    const rt=new T.WebGLRenderTarget(320,192,{depthBuffer:true,stencilBuffer:false,
      minFilter:T.LinearFilter,magFilter:T.LinearFilter})
    const stage=new T.Scene(),root=new T.Group(),mask=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide,toneMapped:false})
    root.matrixAutoUpdate=false;stage.add(root);stage.overrideMaterial=mask
    const vp=new T.Matrix4()
    const uniforms=mat.current.uniforms
    uniforms.reflected.value=rt.texture;uniforms.mirrorVP.value=vp;uniforms.hasMirror.value=0
    pass.current={stage,root,mirror:new T.Matrix4().makeScale(1,-1,1),rt,src:null,berth:null,vp,
      nextVP:new T.Matrix4(),oldParent:new T.Matrix4(),oldRGB:new T.Color(),age:1,nFrame:0}
    return ()=>{
      uniforms.hasMirror.value=0;uniforms.reflected.value=null;pass.current=null
      root.clear();stage.clear();mask.dispose();rt.dispose()
    }
  },[mat,enabled,key,id])
  useFrame(({gl,scene,camera},dt)=>{
    const p=pass.current
    if(!p||!mat.current)return
    if(!p.src){
      p.berth=scene.getObjectByName('Fleet berth / '+key)||null
      p.src=p.berth?.getObjectByName('Pacific exterior / '+id)||null
      if(!p.src||!p.berth)return
      // Clones share the real model's buffers. Only this pass's tint and
      // framebuffer are owned here; never dispose the visible ship's geometry.
      p.root.add(p.src.clone(true))
    }
    const target=p.berth!
    camera.updateMatrixWorld()
    target.updateWorldMatrix(true,false)
    p.age+=dt;p.nextVP.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)
    if(p.nFrame && (p.age<1/20 || (p.vp.equals(p.nextVP)&&p.oldParent.equals(target.matrixWorld))))return
    p.nFrame++;p.age=0;p.oldParent.copy(target.matrixWorld)
    p.root.matrix.copy(target.matrixWorld).multiply(p.mirror)
    p.root.matrixWorldNeedsUpdate=true
    p.vp.copy(p.nextVP)
    const prevRT=gl.getRenderTarget(),alpha=gl.getClearAlpha()
    gl.getClearColor(p.oldRGB)
    gl.setRenderTarget(p.rt);gl.setClearColor(0x000000,0)
    gl.clear();gl.render(p.stage,camera)
    gl.setRenderTarget(prevRT);gl.setClearColor(p.oldRGB,alpha)
    mat.current.uniforms.hasMirror.value=1
  })
}

