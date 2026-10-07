import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Coordenadas da planta: X/Y no chão, Z vertical. Conversão única para o Three.
export function montarPropostas(cena, gerente, render) {
  const grupo = new THREE.Group(); grupo.name = 'Propostas de decoração'; cena.add(grupo);
  const barreiras = [], loader = new THREE.TextureLoader(gerente);
  const materiais = {};
  function material(nome, cor, tecido) {
    const m = new THREE.MeshStandardMaterial({color:cor, roughness:tecido?.94:.62});
    if(tecido){
      const t=loader.load(`propostas/texturas/${tecido}.jpg`);t.colorSpace=THREE.SRGBColorSpace;
      t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.anisotropy=Math.min(8,render.capabilities.getMaxAnisotropy());m.map=t;
      const n=loader.load(`propostas/texturas/${tecido}-normal.jpg`);n.wrapS=n.wrapT=THREE.RepeatWrapping;n.repeat.set(3,3);m.normalMap=n;m.normalScale.set(.18,.18);
    }
    if(tecido){m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
 vec4 sampledDiffuseColor = texture2D(map, vMapUv);
 float luminancia = dot(sampledDiffuseColor.rgb, vec3(.2126,.7152,.0722));
 diffuseColor *= vec4(vec3(clamp(luminancia * 2.2, .48, 1.25)), sampledDiffuseColor.a);
 #endif`.replaceAll('\n+','\n'));};m.customProgramCacheKey=()=> 'proposta-tecido-neutro-v1';}
    materiais[nome]=m;return m;
  }
  const areia=material('areia',0xe5d4b5,'linho'), oliva=material('oliva',0x969777,'linho'), marfim=material('marfim',0xf3eadb,'linho');
  const madeira=material('madeira',0xd0aa7b,'madeira'), tapete=material('tapete',0xd9c6a5,'tapete');
  const preto=material('metal',0x343532), ceramica=material('cerâmica',0xe3dac8), caramelo=material('caramelo',0xb99063,'linho');
  const led=new THREE.MeshBasicMaterial({color:0xffd398});
  function caixa(nome,x,y,z,w,d,h,mat,r=.015,obstaculo=false){
    const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,d/4,h/4)),mat);
    o.name=nome;o.position.set(x,z,-y);grupo.add(o);
    if(obstaculo)barreiras.push([x-w/2,y-d/2,x+w/2,y+d/2]);return o;
  }
  function cilindro(nome,x,y,z,r,h,mat){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,48),mat);o.name=nome;o.position.set(x,z,-y);grupo.add(o);return o;}
  function almofada(nome,x,y,z,w=.46,h=.46,mat=oliva,orient=0){
    const geo=new RoundedBoxGeometry(w,h,.17,5,.068);
    geo.computeVertexNormals();const o=new THREE.Mesh(geo,mat);o.name=nome;o.position.set(x,z,-y);o.rotation.y=orient;grupo.add(o);return o;
  }
  function vaso(nome,x,y,z){cilindro(nome,x,y,z+.09,.055,.18,ceramica);cilindro(nome+' gargalo',x,y,z+.20,.027,.06,ceramica);}
  function luz(x,y,z,intensidade=12){const l=new THREE.PointLight(0xffdfb0,intensidade,4,2);l.position.set(x,z,-y);grupo.add(l);}
  function toalhas(x,y,z){for(let i=0;i<3;i++)caixa('Toalha dobrada',x,y,z+i*.035,.26,.18,.032,marfim,.012);}
  function quadro(nome,x,y,z,w,h,rot=0){const mold=caixa(nome+' moldura',x,y,z,w,.035,h,madeira,.006);mold.rotation.y=rot;
    const tela=caixa(nome+' composição em tecido',x+Math.sin(rot)*.023,y-Math.cos(rot)*.023,z,w-.045,.008,h-.045,areia,.002);tela.rotation.y=rot;}
  // Sala: móveis originais mantidos; novos tecidos e luz de leitura.
  caixa('Tapete da sala',2.45,1.85,.025,3,2.35,.014,tapete,.004);
  [1.62,2.04,2.85].forEach((x,i)=>almofada('Almofada da sala',x,3.13,.75,.44,.44,i===1?oliva:marfim));
  caixa('Manta da chaise',1.12,2.17,.49,.64,1.04,.026,marfim,.01);
  cilindro('Base da luminária',4.91,1.45,.025,.14,.045,preto);
  cilindro('Haste da luminária',4.91,1.45,.85,.012,1.65,preto);
  cilindro('Cúpula da luminária',4.91,1.45,1.62,.15,.20,areia);luz(4.91,1.45,1.48,8);
  quadro('Arte do jantar',.06,6.05,1.70,1.15,1.05,Math.PI/2);
  // Varanda: almofadas sobre as seis cadeiras existentes.
  [[-2.25,5.05,0],[-2.25,5.65,0],[-.65,5.05,Math.PI],[-.65,5.65,Math.PI],[-1.45,4.33,Math.PI/2],[-1.45,6.37,-Math.PI/2]].forEach(([x,y,a])=>{
    caixa('Almofada assento externo',x,y,.478,.40,.40,.045,areia,.02);
  });
  vaso('Centro de mesa externo',-1.45,5.35,.75);
  [-4.7,-3.6,-2.7].forEach(x=>quadro('Arte corredor',x,1.78,1.60,.46,.66));
  // Suíte: camada clara sobre a colcha existente, sem substituir a cama.
  caixa('Enxoval marfim suíte',-7.70,-1.35,.70,1.25,1.98,.035,marfim,.016);
  caixa('Manta caramelo suíte',-7.20,-1.35,.73,.46,1.97,.028,caramelo,.012);
  [-1.83,-.87].forEach(y=>almofada('Almofada oliva suíte',-8.57,y,.88,.44,.44,oliva,Math.PI/2));
  caixa('Tapete suíte',-7.63,-1.35,.027,2.1,2.7,.016,tapete,.004);
  // Hóspedes.
  [-1.695,-3.509].forEach(y=>{caixa('Manta hóspedes',-4.16,y,.627,.45,.90,.026,oliva,.01);almofada('Almofada hóspedes',-5.2,y,.74,.40,.32,caramelo,Math.PI/2);quadro('Arte hóspedes',-5.70,y,1.57,.55,.70,Math.PI/2);});
  // Escritório e canto pet.
  caixa('Tapete escritório',.65,-2.80,.025,1.35,1.12,.012,tapete,.003);
  for(let i=0;i<3;i++)caixa('Painel acústico',1.76,-2.9+i*.48,1.65,.055,.34,.85,areia,.02);
  for(let i=0;i<3;i++){caixa('Prateleira gatos',-.55-i*.42,10.32,1.05+i*.38,.52,.26,.045,madeira,.01);caixa('Almofada prateleira',-.55-i*.42,10.32,1.09+i*.38,.43,.23,.04,areia,.015);}
  cilindro('Arranhador',-.42,9.15,.43,.07,.86,tapete);cilindro('Base arranhador',-.42,9.15,.026,.18,.05,madeira);
  // Banheiros e lavanderia: organizadores compactos, fora da circulação.
  toalhas(-12.43,-.47,.50);vaso('Dispenser master',-12.41,-.74,.94);
  toalhas(-2.35,-1.49,.47);vaso('Dispenser hóspedes',-2.25,-1.61,.93);
  toalhas(-2.35,-.34,.50);vaso('Dispenser lavabo',-2.20,-.40,.93);
  for(let i=0;i<2;i++)caixa('Cesto lavanderia',.66+i*.43,10.11,1.61,.36,.30,.26,tapete,.025);
  // Lounge ao lado oeste da jacuzzi: piso quase no nível do gramado.
  for(let i=0;i<22;i++)caixa('Régua deck lounge',-8.35+i*.115,4.42,-.27,.108,3.45,.05,madeira,.005);
  caixa('Banco longo base',-7.10,5.95,-.055,2.9,.68,.42,madeira,.035,true);
  caixa('Banco lateral base',-8.25,4.92,-.055,.68,1.48,.42,madeira,.035,true);
  caixa('Banco longo assento',-7.10,5.95,.19,2.86,.64,.12,areia,.055);
  caixa('Banco lateral assento',-8.25,4.92,.19,.64,1.44,.12,areia,.055);
  caixa('Banco encosto',-7.10,6.24,.44,2.9,.12,.51,areia,.045,true);
  [-8.12,-7.47,-6.82,-6.18].forEach((x,i)=>almofada('Almofada lounge',x,6.08,.48,.44,.40,i%2?marfim:oliva));
  for(const x of [-8.58,-5.89])for(const y of [2.72,6.32])caixa('Pilar cobertura',x,y,1.0,.075,.075,2.55,preto,.009,true);
  caixa('Cobertura lounge',-7.235,4.52,2.30,2.91,3.82,.12,preto,.012);
  caixa('Forro cobertura',-7.235,4.52,2.228,2.72,3.62,.026,areia,.008);
  cilindro('Mesa lounge tampo',-6.96,4.76,.19,.39,.045,madeira);cilindro('Mesa lounge pé',-6.96,4.76,-.025,.10,.40,preto);
  barreiras.push([-7.37,4.35,-6.55,5.17]);
  for(let i=0;i<18;i++)caixa('Ripado privacidade',-5.86+i*.076,2.76,.76,.045,.06,2.05,madeira,.008,true);
  cilindro('Ducha haste',-5.10,2.65,1.20,.017,1.42,preto);cilindro('Ducha cabeça',-5.10,2.53,1.91,.11,.035,preto);
  caixa('LED banco',-7.10,5.62,.03,2.70,.014,.014,led,.003);
  for(const x of [-8,-6.5]){cilindro('Spot cobertura',x,4.8,2.20,.04,.025,led);luz(x,4.8,2.08,2);}
  // Plantação conceitual em volumes de canteiro; sem inventar espécie botânica.
  caixa('Canteiro lounge',-8.87,4.52,-.13,.42,3.84,.34,madeira,.025,true);

  const ambiente=new THREE.HemisphereLight(0xfff0da,0x8c806b,.75);grupo.add(ambiente);
  let ativo=true;
  return {grupo,barreiras,materiais,setAtivo(v){ativo=!!v;grupo.visible=ativo;},get ativo(){return ativo;},
    bloqueado(x,y,r=.17){return ativo&&barreiras.some(([a,b,c,d])=>x>a-r&&x<c+r&&y>b-r&&y<d+r);},
    altura(x,y){return ativo&&x>-8.62&&x<-5.9&&y>2.7&&y<6.35?-.245:null;}};
}
