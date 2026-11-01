// Chạy: node tests/logic.test.js  (cần Node.js >= 16, không cần cài thêm gì)
const path=require('path'); process.chdir(__dirname);
const store = {}; 
globalThis.localStorage = { getItem:k=>k in store?store[k]:null, setItem:(k,v)=>{store[k]=String(v)}, removeItem:k=>{delete store[k]} };
const { AVLTree } = require('../js/avl.js');
const { quickSort } = require('../js/quicksort.js');
const S = require('../js/store.js');
const assert = require('assert');
let n=0; const t=(name,f)=>{f();n++;console.log('ok -',name)};

t('AVL random insert/delete stays valid', ()=>{
  const tr=new AVLTree((a,b)=>a-b);
  const ref=new Set();
  for(let i=0;i<3000;i++){
    const k=Math.floor(Math.random()*500);
    if(Math.random()<0.6){ const ok=tr.insert(k,k); assert.strictEqual(ok,!ref.has(k)); ref.add(k);}
    else { const ok=tr.remove(k); assert.strictEqual(ok,ref.has(k)); ref.delete(k);}
    assert.deepStrictEqual(tr.validate(),[]);
    assert.strictEqual(tr.size,ref.size);
  }
  assert.deepStrictEqual(tr.inorder(),[...ref].sort((a,b)=>a-b));
  assert(tr.height<=1.45*Math.log2(ref.size+2));
});
t('each rotation type', ()=>{
  const mk=(ks)=>{const x=new AVLTree((a,b)=>a-b);ks.forEach(k=>x.insert(k,k));return x.rot;};
  assert.strictEqual(mk([3,2,1]).LL,1); assert.strictEqual(mk([1,2,3]).RR,1);
  assert.strictEqual(mk([3,1,2]).LR,1); assert.strictEqual(mk([1,3,2]).RL,1);
});
t('range search pruning', ()=>{
  const tr=new AVLTree(); for(let i=1;i<=100;i++) tr.insert('SP'+String(i).padStart(3,'0'),i);
  const r=tr.rangeSearch('SP010','SP020'); assert.strictEqual(r.items.length,11); assert(r.visited<30);
});
t('BFS save order rebuilds same shape without rotation', ()=>{
  const tr=new AVLTree(); for(let i=1;i<=50;i++) tr.insert('K'+String(i).padStart(3,'0'),i);
  const t2=new AVLTree(); tr.bfsNodes().forEach(n=>t2.insert(n.key,n.data));
  assert.deepStrictEqual(t2.rot,{LL:0,RR:0,LR:0,RL:0});
  assert.deepStrictEqual(t2.bfsNodes().map(n=>n.key),tr.bfsNodes().map(n=>n.key));
});
t('quicksort vs native', ()=>{
  for(let r=0;r<200;r++){const a=Array.from({length:Math.floor(Math.random()*200)},()=>Math.floor(Math.random()*50));
   const b=[...a]; quickSort(a,0,a.length-1,(x,y)=>x<y); b.sort((x,y)=>x-y); assert.deepStrictEqual(a,b);}
  const s=Array.from({length:5000},(_,i)=>i); quickSort(s,(x,y)=>x<y); assert.strictEqual(s[4999],4999);
});
const {QuanLyKho,TaiKhoan,MH,Ngay}=S;
t('sample data: rotations, valid tree, fefo', ()=>{
  const q=new QuanLyKho(); const r=q.napDuLieuMau();
  assert.strictEqual(q.cay.size,10); assert.deepStrictEqual(q.cay.validate(),[]);
  assert.strictEqual(q.cay.height,4); assert(q.cay.rot.RR>=1);
  assert.strictEqual(q.cay.root.key,'SP004');
  const sp=q.tim('sp006'); assert.strictEqual(MH.tongTon(sp),75); assert.strictEqual(MH.tonXuatDuoc(sp),70);
  assert.strictEqual(q.canhBaoHetHan().length,1);
  assert(q.canhBaoSapHet().map(x=>x.ma).includes('SP003'));
});
t('nhap kho rules', ()=>{
  const q=new QuanLyKho(); q.napDuLieuMau();
  let r=q.nhapKho({ma:'SP006',maLo:'L-CU',sl:3,hsd:{d:2,m:2,y:2030},viTri:'A',ncc:'X'}); assert(!r.ok);
  r=q.nhapKho({ma:'SP006',maLo:'L-CU',sl:3,hsd:{d:1,m:1,y:2024},viTri:'A',ncc:'X'}); assert(r.ok&&r.canhBao);
  assert.strictEqual(MH.tongTon(q.tim('SP006')),78);
  r=q.nhapKho({ma:'ZZZ',maLo:'L1',sl:3,hsd:{d:1,m:1,y:2030},viTri:'A',ncc:'X'}); assert(!r.ok);
  assert.strictEqual(q.phieuNhaps.length,1);
});
t('xuat kho FEFO + canh bao + doanh thu', ()=>{
  const q=new QuanLyKho(); q.napDuLieuMau();
  q.nhapKho({ma:'SP001',maLo:'L9',sl:50,hsd:{d:1,m:1,y:Ngay.homNay().y+1},viTri:'A',ncc:'X'}); // sớm hơn L1 (31/12)
  const r=q.xuatKho([{ma:'SP001',sl:60},{ma:'SP003',sl:10}]); assert(r.ok);
  const sp=q.tim('SP001'); const l9=sp.los.find(l=>l.maLo==='L9'), l1=sp.los.find(l=>l.maLo==='L1');
  assert.strictEqual(l9.sl,0); assert.strictEqual(l1.sl,90);
  assert.strictEqual(r.phieu.tongTien,60*120000+10*58000); assert(r.canhBao.some(s=>s.startsWith('SP003')));
  assert(!q.xuatKho([{ma:'SP003',sl:5}]).ok);
  assert(!q.kiemTraDongXuat('SP006',71,0).ok); assert(q.kiemTraDongXuat('SP006',70,0).ok);
  assert.strictEqual(q.thongKeTong().tong,r.phieu.tongTien);
  assert.strictEqual(q.topXuat(5)[0].ma,'SP001');
});
t('huy hang het han tach rieng doanh thu', ()=>{
  const q=new QuanLyKho(); q.napDuLieuMau();
  q.xuatKho([{ma:'SP002',sl:5}]); const dt=q.thongKeTong().tong;
  const r=q.huyHangHetHan(); assert(r.ok&&r.phieu.tongTien===5*32000);
  assert.strictEqual(q.thongKeTong().tong,dt); assert.strictEqual(MH.tongTon(q.tim('SP006')),70);
  assert(!q.huyHangHetHan().ok); assert.strictEqual(q.thongKeHuy().tong,160000);
});
t('add/edit/delete + validation', ()=>{
  const q=new QuanLyKho();
  assert(!q.themMatHang('','a',1,1).ok); assert(!q.themMatHang('A B','a',1,1).ok); assert(!q.themMatHang('a','x',-1,1).ok);
  assert(q.themMatHang('a','Ten',100,5).ok); assert(!q.themMatHang('A','Ten',100,5).ok);
  assert(q.suaMatHang('a','Moi',200,6).ok); assert.strictEqual(q.tim('A').gia,200);
  assert(q.xoaMatHang('a').ok); assert(!q.xoaMatHang('a').ok); assert(q.cay.isEmpty());
});
t('save/load roundtrip + csv + bad import', ()=>{
  const q=new QuanLyKho(); q.napDuLieuMau(); q.xuatKho([{ma:'SP002',sl:5}]);
  const q2=new QuanLyKho(); assert(q2.khoiDong().ok);
  assert.deepStrictEqual(q2.cay.bfsNodes().map(n=>n.key),q.cay.bfsNodes().map(n=>n.key));
  assert.strictEqual(q2.phieuXuats.length,1); assert.deepStrictEqual(q2.cay.rot,{LL:0,RR:0,LR:0,RL:0});
  const q3=new QuanLyKho(); q3.napDuLieuMau(); const before=q3.cay.size;
  assert(!q3.fromData({magic:'x'}).ok); assert(!q3.fromData({magic:'AVL1',matHang:[{ma:'A'}]}).ok);
  assert.strictEqual(q3.cay.size,before);
  assert(q.xuatCSV().split('\r\n').length>=12);
});
t('account', ()=>{
  assert(TaiKhoan.dangNhap('Admin','admin123')); assert(!TaiKhoan.dangNhap('admin','x'));
  assert(!TaiKhoan.doiMatKhau('admin123','123','123').ok); assert(TaiKhoan.doiMatKhau('admin123','newpass1','newpass1').ok);
  assert(TaiKhoan.dangNhap('admin','newpass1'));
});
console.log('\nAll',n,'test groups passed');
