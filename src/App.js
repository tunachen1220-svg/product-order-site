import React, { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://scouakepoanddfkemwaf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wpBcNOGaHbrrSxLO_7E-bQ_QHOqvgIi';
const ADMIN_PASSWORD = 'admin2026';
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const CATEGORIES = ['å¨é¨','åä»/è²æ¯','ææå¨/é³ç®±','é¼/ææ','å¼¦','èå¸¶','Pick/æ¥ç','ç´è¢/ç´ç','èª¿é³å¨/ç¯æå¨','ç´æ¶/æ¯æ¶','ä¿é¤/å·¥å·','ç·æ/éä»¶','ç®¡æ¨å¨','éµç¤/åæå¨','PA/éé³è¨­å','å¶ä»'];
const PROD_CATS  = ['åä»/è²æ¯','ææå¨/é³ç®±','é¼/ææ','å¼¦','èå¸¶','Pick/æ¥ç','ç´è¢/ç´ç','èª¿é³å¨/ç¯æå¨','ç´æ¶/æ¯æ¶','ä¿é¤/å·¥å·','ç·æ/éä»¶','ç®¡æ¨å¨','éµç¤/åæå¨','PA/éé³è¨­å','å¶ä»'];
const ORDER_STATUSES = ['å¾ç¢ºèª','å·²ç¢ºèª','å·²å®æ','å·²åæ¶'];

const DEFAULT_BANNERS = [
  {
    id:'b1',
    image_url:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1600&q=80',
    title:'Your Sound,\nYour Stage.',
    subtitle:'åä»ãè²æ¯ãéµç¤ãé¼çµååå¼éä»¶ï¼ä¸ç«è³¼è¶³',
    cta_label:'ç«å³é¸è³¼',
    cta_category:'',
  },
  {
    id:'b2',
    image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
    title:'Craft Your\nPerfect Tone.',
    subtitle:'ç²¾é¸ææå¨ãé³ç®±ååå¼å¨ééä»¶',
    cta_label:'ææå¨å°å',
    cta_category:'ææå¨',
  },
  {
    id:'b3',
    image_url:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1600&q=80',
    title:'Feel Every\nNote.',
    subtitle:'éµç¤ãé¼ç´ç³»åç²¾é¸åå',
    cta_label:'éµç¤å°å',
    cta_category:'éµç¤/é¼ç´',
  },
];

// âââ Helpers âââ
function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const seq = String(Math.floor(Math.random()*999)+1).padStart(3,'0');
  return `ORD-${y}${m}${day}-${seq}`;
}

function formatDate(iso) {
  if (!iso) return 'â';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, { headers, ...opts });
  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// âââ Colors âââ
const C = {
  primary: '#111111', primaryHover: '#333333',
  danger: '#dc2626', bg: '#ffffff', card: '#ffffff',
  border: '#e5e5e5', text: '#111111', textLight: '#767676',
  success: '#16a34a', warning: '#d97706'
};

// âââ Status badge helpers âââ
function orderStatusStyle(status) {
  const clr = { 'å¾ç¢ºèª':'#f97316','å·²ç¢ºèª':'#3b82f6','å·²å®æ':'#16a34a','å·²åæ¶':'#ef4444' }[status] || '#94a3b8';
  return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, background: clr+'22', color: clr };
}
function productStatusStyle(status) {
  if (status === 'ä¸æ¶ä¸­') return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, background:'#16a34a22', color:'#16a34a' };
  return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, background:'#94a3b822', color:'#94a3b8' };
}

// âââ Styles âââ
const S = {
  app: { fontFamily:'"Inter","Noto Sans TC",-apple-system,BlinkMacSystemFont,sans-serif', color:C.text, background:C.bg, minHeight:'100vh' },
  // Nav
  nav: { background:'#fff', borderBottom:'none', boxShadow:'0 1px 3px rgba(0,0,0,.10)', padding:'10px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 },
  navBrand: { display:'flex', alignItems:'center', gap:12, cursor:'pointer', userSelect:'none', textDecoration:'none' },
  navLogoMark: { width:42, height:42, background:'#1a3a5c', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  navLogoText: { color:'#fff', fontSize:14, fontWeight:700, letterSpacing:'1px' },
  navTitleGroup: { display:'flex', flexDirection:'column', justifyContent:'center' },
  navTitleMain: { fontSize:18, fontWeight:700, color:'#1a1a1a', lineHeight:1.2, letterSpacing:'-0.3px' },
  navTitleSub: { fontSize:11, color:'#888', letterSpacing:'0.5px', lineHeight:1.3 },
  // keep for compat
  navTitle: { fontSize:20, fontWeight:800, color:C.text, margin:0, cursor:'pointer', letterSpacing:'-0.5px' },
  navRight: { display:'flex', gap:8, alignItems:'center' },
  navBtn: { background:'none', border:'none', padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:500, color:C.textLight, display:'flex', alignItems:'center', gap:6, letterSpacing:'0.02em' },
  navAdminBtn: { background:C.text, color:'#fff', border:'none', borderRadius:2, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6, letterSpacing:'0.05em' },
  badge: { background:C.text, color:'#fff', borderRadius:'50%', width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 },
  container: { maxWidth:1280, margin:'0 auto', padding:'24px 24px' },
  // Filters
  filterCard: { background:'#fafafa', border:`1px solid ${C.border}`, borderRadius:0, padding:'12px 16px', marginBottom:28 },
  filterBar: { display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' },
  searchWrap: { position:'relative', flex:'1 1 300px', minWidth:220 },
  searchInput: { width:'100%', padding:'9px 36px 9px 34px', borderRadius:2, border:`1px solid ${C.border}`, fontSize:13, outline:'none', background:'#fff', boxSizing:'border-box', letterSpacing:'0.01em' },
  searchIcon: { position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, pointerEvents:'none', color:C.textLight },
  searchClear: { position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13, color:C.textLight, padding:2, lineHeight:1 },
  select: { padding:'9px 12px', borderRadius:2, border:`1px solid ${C.border}`, fontSize:13, outline:'none', minWidth:130, background:'#fff', cursor:'pointer' },
  searchStatus: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, fontSize:12, color:C.textLight, letterSpacing:'0.02em' },
  searchStatusClear: { background:'none', border:'none', cursor:'pointer', fontSize:12, color:C.text, textDecoration:'underline', padding:0 },
  // Product grid
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:1, background:C.border },
  card: { background:C.card, borderRadius:0, border:'none', overflow:'hidden', cursor:'pointer', transition:'opacity .15s', display:'flex', flexDirection:'column' },
  cardImg: { width:'100%', height:200, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', color:C.textLight, fontSize:13 },
  cardBody: { padding:'12px 14px 16px', flex:1, display:'flex', flexDirection:'column', background:'#fff' },
  cardName: { fontSize:14, fontWeight:600, marginBottom:2, letterSpacing:'-0.01em' },
  cardBrand: { fontSize:12, color:C.textLight, marginBottom:2 },
  cardSku: { fontSize:11, color:C.textLight, marginBottom:8 },
  cardPrice: { fontSize:15, fontWeight:700, color:C.text, marginBottom:10, flex:1 },
  cardActions: { display:'flex', gap:8, alignItems:'center' },
  qtyInput: { width:50, padding:'6px 6px', borderRadius:0, border:`1px solid ${C.border}`, textAlign:'center', fontSize:13 },
  addBtn: { flex:1, padding:'8px 0', background:C.text, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:600, fontSize:13, letterSpacing:'0.05em' },
  detailBtn: { width:'100%', padding:'7px 0', background:'transparent', color:C.text, border:`1px solid ${C.text}`, borderRadius:0, cursor:'pointer', fontWeight:600, fontSize:12, marginTop:8, letterSpacing:'0.05em' },
  // Cart sidebar
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.35)', zIndex:200 },
  sidebar: { position:'fixed', top:0, right:0, bottom:0, width:400, maxWidth:'90vw', background:'#fff', zIndex:201, display:'flex', flexDirection:'column', boxShadow:'-1px 0 0 #e5e5e5' },
  sidebarHeader: { padding:'20px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },
  sidebarBody: { flex:1, overflowY:'auto', padding:'0 24px' },
  sidebarFooter: { padding:'16px 24px', borderTop:`1px solid ${C.border}` },
  cartItem: { display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderBottom:`1px solid ${C.border}` },
  cartThumb: { width:52, height:52, borderRadius:0, objectFit:'cover', flexShrink:0, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, overflow:'hidden' },
  cartItemInfo: { flex:1, minWidth:0 },
  cartItemName: { fontWeight:600, fontSize:13, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  cartItemPrice: { fontSize:12, color:C.textLight },
  cartQtyGroup: { display:'flex', alignItems:'center', gap:6, marginTop:6 },
  cartQtyBtn: { width:26, height:26, borderRadius:0, border:`1px solid ${C.border}`, background:'#fff', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' },
  cartQtyNum: { width:28, textAlign:'center', fontSize:13, fontWeight:600 },
  removeBtn: { background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:11, marginLeft:8, textDecoration:'underline' },
  totalRow: { display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, marginBottom:14, letterSpacing:'-0.02em' },
  submitBtn: { width:'100%', padding:'13px 0', background:C.text, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:700, fontSize:14, letterSpacing:'0.1em' },
  btnSm: { padding:'4px 10px', borderRadius:0, border:'none', cursor:'pointer', fontSize:12, fontWeight:500 },
  disabledBtn: { width:'100%', padding:'13px 0', background:'#c5c5c5', color:'#fff', border:'none', borderRadius:0, cursor:'not-allowed', fontWeight:700, fontSize:14 },
  // Modal
  modal: { position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, background:'rgba(0,0,0,.4)' },
  modalBox: { background:'#fff', borderRadius:0, padding:32, width:'90%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', position:'relative' },
  modalTitle: { fontSize:18, fontWeight:700, marginBottom:20, letterSpacing:'-0.03em' },
  formGroup: { marginBottom:16 },
  label: { display:'block', fontWeight:600, marginBottom:6, fontSize:13, letterSpacing:'0.03em' },
  input: { width:'100%', padding:'10px 12px', borderRadius:0, border:`1px solid ${C.border}`, fontSize:13, outline:'none', boxSizing:'border-box', background:'#fff' },
  inputError: { width:'100%', padding:'10px 12px', borderRadius:0, border:`2px solid ${C.danger}`, fontSize:13, outline:'none', boxSizing:'border-box', background:'#fff' },
  errorText: { color:C.danger, fontSize:12, marginTop:4 },
  textarea: { width:'100%', padding:'10px 12px', borderRadius:0, border:`1px solid ${C.border}`, fontSize:13, outline:'none', minHeight:60, resize:'vertical', boxSizing:'border-box' },
  modalActions: { display:'flex', gap:12, marginTop:24 },
  cancelBtn: { flex:1, padding:'11px 0', background:'#f5f5f5', color:C.text, border:'none', borderRadius:0, cursor:'pointer', fontWeight:600, fontSize:13 },
  confirmBtn: { flex:1, padding:'11px 0', background:C.text, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:600, fontSize:13 },
  // Confirm page
  confirmPage: { textAlign:'center', maxWidth:600, margin:'0 auto', padding:40 },
  checkIcon: { fontSize:48, color:C.success, marginBottom:12 },
  confirmTitle: { fontSize:22, fontWeight:700, marginBottom:8, color:C.success, letterSpacing:'-0.03em' },
  confirmOrderNum: { fontSize:14, color:C.textLight, marginBottom:24 },
  infoBox: { background:'#fafafa', borderRadius:0, border:`1px solid ${C.border}`, padding:20, marginBottom:24, textAlign:'left' },
  infoRow: { display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13 },
  table: { width:'100%', borderCollapse:'collapse', marginBottom:16, textAlign:'left' },
  th: { padding:'10px 12px', background:'#fafafa', fontWeight:600, fontSize:12, borderBottom:`1px solid ${C.border}`, letterSpacing:'0.05em' },
  td: { padding:'10px 12px', borderBottom:`1px solid ${C.border}`, fontSize:13 },
  continueBtn: { padding:'12px 28px', background:C.text, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:700, fontSize:13, marginRight:12, letterSpacing:'0.05em' },
  printBtn: { padding:'12px 28px', background:'#f5f5f5', color:C.text, border:`1px solid ${C.border}`, borderRadius:0, cursor:'pointer', fontWeight:600, fontSize:13 },
  // Orders page
  orderCard: { background:'#fff', borderRadius:0, border:`1px solid ${C.border}`, marginBottom:12, overflow:'hidden' },
  orderHeader: { padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' },
  orderHeaderLeft: { display:'flex', flexDirection:'column', gap:4 },
  orderNum: { fontWeight:700, fontSize:14, letterSpacing:'-0.01em' },
  orderDate: { fontSize:12, color:C.textLight },
  orderAmount: { fontWeight:700, fontSize:15, color:C.text },
  orderDetail: { padding:'0 20px 16px', borderTop:`1px solid ${C.border}` },
  // Loading & error
  center: { textAlign:'center', padding:60 },
  spinner: { display:'inline-block', width:36, height:36, border:'3xx solid #e5e5e5', borderTopColor:C.text, borderRadius:'50%', animation:'spin 1s linear infinite' },
  retryBtn: { padding:'10px 24px', background:C.text, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:600, marginTop:12 },
  empty: { textAlign:'center', padding:60, color:C.textLight, fontSize:15 },

  // ââ Admin ââ
  adminLayout: { display:'flex', minHeight:'100vh' },
  adminSidebar: { width:220, background:'#1e293b', color:'#fff', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:50, overflowY:'auto' },
  adminSidebarHeader: { padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.1)' },
  adminSidebarTitle: { fontSize:16, fontWeight:700, color:'#fff', margin:0 },
  adminSidebarSubtitle: { fontSize:12, color:'#94a3b8', marginTop:4 },
  adminSidebarNav: { flex:1, padding:'12px 0' },
  adminSidebarFooter: { padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,.1)' },
  adminBackBtn: { display:'flex', alignItems:'center', gap:8, color:'#94a3b8', background:'none', border:'none', cursor:'pointer', fontSize:13, padding:0, width:'100%' },
  adminContent: { marginLeft:220, flex:1, background:C.bg, minHeight:'100vh' },
  adminTopBar: { background:'#fff', borderBottom:`1px solid ${C.border}`, padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 },
  adminPageTitle: { fontSize:20, fontWeight:700, margin:0 },
  adminBody: { padding:28 },
  // Stats
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 },
  statCard: { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:`1px solid ${C.border}` },
  statIcon: { fontSize:28, marginBottom:8 },
  statLabel: { fontSize:13, color:C.textLight, marginBottom:6 },
  statValue: { fontSize:26, fontWeight:700, color:C.text },
  // Admin cards & tables
  adminCard: { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:`1px solid ${C.border}`, marginBottom:20 },
  adminCardTitle: { fontSize:16, fontWeight:700, marginBottom:16 },
  adminTable: { width:'100%', borderCollapse:'collapse' },
  adminTh: { padding:'10px 12px', background:'#f8fafc', fontWeight:600, fontSize:13, borderBottom:`2px solid ${C.border}`, textAlign:'left', whiteSpace:'nowrap' },
  // Toolbar
  toolbar: { display:'flex', gap:12, marginBottom:16, flexWrap:'wrap', alignItems:'center' },
  searchInput: { padding:'8px 12px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:14, outline:'none', minWidth:200 },
  addProductBtn: { padding:'8px 16px', background:C.primary, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14, display:'flex', alignItems:'center', gap:6 },
  dangerIconBtn: { padding:'5px 10px', background:'none', border:`1px solid ${C.danger}`, color:C.danger, borderRadius:6, cursor:'pointer', fontSize:12, display:'inline-flex', alignItems:'center', gap:4 },

  // ââ Product Detail ââ
  detailContainer: { maxWidth:1280, margin:'0 auto', padding:'24px 24px' },
  detailBack: { display:'inline-flex', alignItems:'center', gap:4, color:C.textLight, background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:500, marginBottom:24, padding:0, letterSpacing:'0.02em' },
  detailLayout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:40 },
  detailImgBox: { background:'#f5f5f5', borderRadius:0, border:`1px solid ${C.border}`, overflow:'hidden', minHeight:400, display:'flex', alignItems:'center', justifyContent:'center' },
  detailInfoBox: { display:'flex', flexDirection:'column', justifyContent:'flex-start' },
  detailName: { fontSize:26, fontWeight:800, marginBottom:8, color:C.text, lineHeight:1.2, letterSpacing:'-0.04em' },
  detailBrand: { fontSize:13, color:C.textLight, marginBottom:4, letterSpacing:'0.05em', textTransform:'uppercase' },
  detailSku: { fontSize:12, color:C.textLight, marginBottom:16 },
  detailPrice: { fontSize:28, fontWeight:700, color:C.text, marginBottom:20, letterSpacing:'-0.03em' },
  detailTagRow: { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:20 },
  detailCatTag: { display:'inline-block', padding:'3px 10px', borderRadius:0, background:'#f0f0f0', color:C.textLight, fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' },
  detailDivider: { borderTop:`1px solid ${C.border}`, margin:'20px 0' },
  detailCartRow: { display:'flex', gap:10, alignItems:'center' },
  detailQtyInput: { width:60, padding:'12px 8px', borderRadius:0, border:`1px solid ${C.border}`, textAlign:'center', fontSize:14, outline:'none' },
  detailAddBtn: { flex:1, padding:'13px 0', background:C.text, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:700, fontSize:14, letterSpacing:'0.1em' },
  detailAddedBtn: { flex:1, padding:'13px 0', background:C.success, color:'#fff', border:'none', borderRadius:0, cursor:'pointer', fontWeight:700, fontSize:14, letterSpacing:'0.1em' },
  detailDescSection: { background:'#fafafa', borderRadius:0, border:`1px solid ${C.border}`, padding:28 },
  detailDescTitle: { fontSize:14, fontWeight:700, marginBottom:16, color:C.text, letterSpacing:'0.08em', textTransform:'uppercase' },
  detailDescText: { fontSize:14, lineHeight:'1.9', color:'#444', whiteSpace:'pre-wrap' },
  detailDescEmpty: { color:C.textLight, fontSize:13 },
  // Recommendations
  recSection: { marginTop:48 },
  recTitle: { fontSize:14, fontWeight:700, marginBottom:20, color:C.text, letterSpacing:'0.08em', textTransform:'uppercase' },
  recGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:1, background:C.border },
  recCard: { background:'#fff', borderRadius:0, border:'none', overflow:'hidden', cursor:'pointer', transition:'opacity .15s' },
  recImg: { width:'100%', height:160, objectFit:'cover', display:'block' },
  recImgPlaceholder: { width:'100%', height:160, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:C.textLight },
  recBody: { padding:'10px 12px 14px' },
  recName: { fontSize:13, fontWeight:600, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  recBrand: { fontSize:11, color:C.textLight, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' },
  recPrice: { fontSize:13, fontWeight:700, color:C.text },
  // ââ Banner carousel ââ
  bannerWrap: { position:'relative', overflow:'hidden', minHeight:420, background:'#111', userSelect:'none' },
  bannerSlide: { position:'absolute', inset:0, transition:'opacity .9s ease', display:'flex', alignItems:'center' },
  bannerBg: { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' },
  bannerGradient: { position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.3) 55%,rgba(0,0,0,.1) 100%)' },
  bannerContent: { position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto', padding:'60px 48px', width:'100%' },
  bannerArrowLeft: { position:'absolute', top:'50%', left:16, transform:'translateY(-50%)', zIndex:10, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', width:42, height:42, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', lineHeight:1, borderRadius:0 },
  bannerArrowRight: { position:'absolute', top:'50%', right:16, transform:'translateY(-50%)', zIndex:10, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', width:42, height:42, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', lineHeight:1, borderRadius:0 },
  bannerDots: { position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:10 },
  bannerDot: { width:7, height:7, borderRadius:'50%', background:'rgba(255,255,255,.35)', border:'none', cursor:'pointer', padding:0, transition:'all .3s', flexShrink:0 },
  bannerDotActive: { width:22, height:7, borderRadius:4, background:'#fff', border:'none', cursor:'pointer', padding:0, transition:'all .3s', flexShrink:0 },
  // ââ Shop sidebar ââ
  shopWrapper: { display:'flex', borderTop:`1px solid ${C.border}` },
  shopSidebar: { width:200, flexShrink:0, background:'#fff', borderRight:`1px solid ${C.border}`, position:'sticky', top:57, height:'calc(100vh - 57px)', overflowY:'auto' },
  shopSidebarLogo: { display:'flex', alignItems:'center', gap:8, padding:'18px 20px 14px', borderBottom:`1px solid ${C.border}`, cursor:'pointer', background:'none', border:'none', width:'100%', textAlign:'left' },
  shopSidebarSection: { padding:'16px 0 8px' },
  shopSidebarSectionTitle: { fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.textLight, padding:'0 20px', marginBottom:4 },
  shopSidebarItem: { display:'block', width:'100%', textAlign:'left', background:'none', border:'none', padding:'7px 20px', cursor:'pointer', fontSize:13, color:C.text, letterSpacing:'0.01em', borderLeft:'2px solid transparent', lineHeight:1.4 },
  shopSidebarItemActive: { display:'block', width:'100%', textAlign:'left', background:'#f5f5f5', border:'none', padding:'7px 20px', cursor:'pointer', fontSize:13, color:C.primary, fontWeight:700, letterSpacing:'0.01em', borderLeft:`2px solid ${C.primary}`, lineHeight:1.4 },
  shopSidebarDivider: { height:1, background:C.border, margin:'8px 0' },
  shopMain: { flex:1, minWidth:0 },
};

function adminTd(zebra) {
  return { padding:'10px 12px', borderBottom:`1px solid ${C.border}`, fontSize:13, background: zebra ? '#f8fafc' : '#fff', verticalAlign:'middle' };
}
function iconBtn(color) {
  return { padding:'5px 10px', background:'none', border:`1px solid ${color||C.border}`, color:color||C.text, borderRadius:6, cursor:'pointer', fontSize:12, display:'inline-flex', alignItems:'center', gap:4 };
}
function adminNavItemStyle(active) {
  return { display:'flex', alignItems:'center', gap:10, padding:'10px 20px', cursor:'pointer', background: active ? 'rgba(59,130,246,.15)' : 'transparent', color: active ? '#60a5fa' : '#94a3b8', borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent', fontSize:14, fontWeight: active ? 600 : 400, userSelect:'none' };
}

// Google Fonts injection
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;600;700&display=swap';
document.head.appendChild(fontLink);

// Keyframes injection
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
@media print { .no-print { display: none !important; } }
@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr !important; }
}
@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr !important; }
  .shop-sidebar-hide { display: none !important; }
  .amc-logo-mark { width: 32px !important; height: 32px !important; }
  .amc-subtitle { display: none !important; }
}
@media (max-width: 600px) {
  .grid-responsive { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
  .stats-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
  .admin-sidebar-hide { display: none !important; }
  .admin-content-full { margin-left: 0 !important; }
  .admin-sidebar-show { display: block !important; }
}
`;
if (!document.querySelector('[data-app-styles]')) { styleTag.setAttribute('data-app-styles',''); document.head.appendChild(styleTag); }

// âââ App âââ
export default function App() {
  // ââ Frontend state ââ
  const [page, setPage] = useState('shop'); // shop | confirm | orders | admin
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('å¨é¨');
  const [brandFilter, setBrandFilter] = useState('å¨é¨');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name:'', contact:'', notes:'' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [quantities, setQuantities] = useState({});

  // ââ Detail page state ââ
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailAddedMsg, setDetailAddedMsg] = useState(false);

  // ââ Admin state ââ
  const [adminPage, setAdminPage] = useState('dashboard');
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminBrands, setAdminBrands] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | 'new' | {product}
  const [productForm, setProductForm] = useState({ name:'', brand_id:'', sku:'', price:0, category:'åä»å¼¦', status:'ä¸æ¶ä¸­', image_url:'', description:'' });
  const [productFormErrors, setProductFormErrors] = useState({});
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [brandModal, setBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('å¨é¨');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('å¨é¨');
  const [expandedAdminOrder, setExpandedAdminOrder] = useState(null);
  const [orderDeleteConfirm, setOrderDeleteConfirm] = useState(null); // null | order object
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [orderEditModal, setOrderEditModal] = useState(null); // null | order object
  const [orderEditForm, setOrderEditForm] = useState({ customer_name:'', contact:'', notes:'', status:'å¾ç¢ºèª' });
  const [orderEditItems, setOrderEditItems] = useState([]); // [{...item, _deleted:false, _qty:n}]
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaveError, setOrderSaveError] = useState('');

  // ââ My orders identity ââ
  const [myContact, setMyContact] = useState(() => localStorage.getItem('myContact') || '');
  const [contactLookup, setContactLookup] = useState('');

  // ââ Admin auth state ââ
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => sessionStorage.getItem('adminLoggedIn') === 'true');
  const [adminLoginModal, setAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);

  // ââ Image upload state ââ
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // ââ Banner carousel state ââ
  const [bannerSlides, setBannerSlides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bannerSlides') || 'null') || DEFAULT_BANNERS; }
    catch { return DEFAULT_BANNERS; }
  });
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const [bannerModal, setBannerModal] = useState(null); // null | 'new' | {slide object}
  const [bannerForm, setBannerForm] = useState({ title:'', subtitle:'', cta_label:'', cta_category:'', image_url:'' });
  const [bannerUploadErr, setBannerUploadErr] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // ââ Frontend data loading ââ
  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [prods, brs] = await Promise.all([
        apiFetch('/rest/v1/products?select=*,brands(name)&status=eq.ä¸æ¶ä¸­'),
        apiFetch('/rest/v1/brands?select=id,name')
      ]);
      setProducts(prods); setBrands(brs);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setModalOpen(false); setCartOpen(false);
        setProductModal(null); setDeleteConfirm(null); setBrandModal(false);
        setAdminLoginModal(false); setAdminPasswordInput(''); setAdminPasswordError(false);
        setOrderDeleteConfirm(null); setOrderEditModal(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ââ Banner auto-advance ââ
  useEffect(() => {
    if (bannerSlides.length <= 1 || bannerPaused) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % bannerSlides.length), 5000);
    return () => clearInterval(t);
  }, [bannerSlides.length, bannerPaused]);

  useEffect(() => {
    if (bannerIdx >= bannerSlides.length) setBannerIdx(0);
  }, [bannerSlides.length, bannerIdx]);

  useEffect(() => {
    localStorage.setItem('bannerSlides', JSON.stringify(bannerSlides));
  }, [bannerSlides]);

  // ââ Admin data loading ââ
  const loadAdminProducts = useCallback(async () => {
    try {
      const [prods, brs] = await Promise.all([
        apiFetch('/rest/v1/products?select=*,brands(name)&order=created_at.desc'),
        apiFetch('/rest/v1/brands?select=id,name&order=name.asc')
      ]);
      setAdminProducts(prods); setAdminBrands(brs);
    } catch (e) { alert('è¼å¥ååå¤±æï¼' + e.message); }
  }, []);

  const loadAdminOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/rest/v1/orders?select=*,order_items(*)&order=created_at.desc');
      setAdminOrders(data);
    } catch (e) { alert('è¼å¥è¨å®å¤±æï¼' + e.message); }
  }, []);

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true);
    try { await Promise.all([loadAdminProducts(), loadAdminOrders()]); }
    finally { setAdminLoading(false); }
  }, [loadAdminProducts, loadAdminOrders]);

  useEffect(() => {
    if (page === 'admin') loadAdminData();
  }, [page, loadAdminData]);

  // ââ Frontend: filtered + sorted products ââ
  const filtered = (() => {
    const base = products.filter(p => {
      if (categoryFilter !== 'å¨é¨' && p.category !== categoryFilter) return false;
      if (brandFilter !== 'å¨é¨' && String(p.brand_id) !== brandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const brandName = (brands.find(b => b.id === p.brand_id)?.name || '').toLowerCase();
        const haystack = [p.name, p.sku, brandName, p.category].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (sortOrder === 'price_asc')  return [...base].sort((a,b) => (a.price||0) - (b.price||0));
    if (sortOrder === 'price_desc') return [...base].sort((a,b) => (b.price||0) - (a.price||0));
    if (sortOrder === 'newest')     return [...base].sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0));
    return base;
  })();
  const hasActiveFilter = categoryFilter !== 'å¨é¨' || brandFilter !== 'å¨é¨';

  const cartCount = cart.reduce((s,c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s,c) => s + c.quantity * c.price, 0);

  function addToCart(product) {
    const qty = quantities[product.id] || 1;
    setCart(prev => {
      const exist = prev.find(c => c.id === product.id);
      if (exist) return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: qty, image_url: product.image_url || null }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  }

  function addToCartWithQty(product, qty) {
    setCart(prev => {
      const exist = prev.find(c => c.id === product.id);
      if (exist) return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: qty, image_url: product.image_url || null }];
    });
  }

  function updateCartQty(id, delta) { setCart(prev => prev.map(c => c.id===id ? { ...c, quantity: Math.max(1, c.quantity+delta) } : c)); }
  function removeFromCart(id) { setCart(prev => prev.filter(c => c.id !== id)); }

  function openDetail(productId) {
    setSelectedProductId(productId);
    setDetailQty(1);
    setDetailAddedMsg(false);
  }

  function goShop() {
    setPage('shop');
    setSelectedProductId(null);
    setCategoryFilter('å¨é¨');
    setBrandFilter('å¨é¨');
    setSearchQuery('');
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  async function handleSubmitOrder() {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'è«è¼¸å¥å§å';
    if (!formData.contact.trim()) errors.contact = 'è«è¼¸å¥è¯çµ¡æ¹å¼';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const orderNum = generateOrderNumber();
      const [order] = await apiFetch('/rest/v1/orders', { method:'POST', body: JSON.stringify({ order_number:orderNum, customer_name:formData.name.trim(), contact:formData.contact.trim(), notes:formData.notes.trim()||null, total_amount:cartTotal }) });
      await apiFetch('/rest/v1/order_items', { method:'POST', body: JSON.stringify(cart.map(c => ({ order_id:order.id, product_id:c.id, product_name:c.name, quantity:c.quantity, unit_price:c.price, subtotal:c.quantity*c.price }))) });
      // Save contact for "my orders" filtering
      const savedContact = formData.contact.trim();
      localStorage.setItem('myContact', savedContact);
      setMyContact(savedContact);
      setConfirmedOrder({ ...order, items: cart, orderTime: new Date().toISOString() });
      setCart([]); setModalOpen(false); setCartOpen(false);
      setFormData({ name:'', contact:'', notes:'' }); setFormErrors({});
      setPage('confirm');
    } catch (e) { alert('è¨å®éåºå¤±æï¼' + e.message + '\nè³¼ç©è»å§å®¹å·²ä¿çï¼è«åè©¦ä¸æ¬¡ã'); }
    finally { setSubmitting(false); }
  }

  async function loadOrders(contact) {
    const filterContact = contact !== undefined ? contact : myContact;
    if (!filterContact) { setOrders([]); return; }
    setOrdersLoading(true);
    try {
      const encoded = encodeURIComponent(filterContact);
      const data = await apiFetch(`/rest/v1/orders?select=*,order_items(*)&contact=eq.${encoded}&order=created_at.desc`);
      setOrders(data);
    }
    catch (e) { alert('è¼å¥è¨å®å¤±æï¼' + e.message); }
    finally { setOrdersLoading(false); }
  }

  // ââ Admin: auth ââ
  function handleAdminLogin() {
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      setAdminLoginModal(false);
      setAdminPasswordInput('');
      setAdminPasswordError(false);
      setPage('admin');
      setSelectedProductId(null);
    } else {
      setAdminPasswordError(true);
    }
  }

  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    goShop();
  }

  // ââ Admin: CRUD ââ
  function openNewProduct() {
    setProductForm({ name:'', brand_id:'', sku:'', price:0, category:'åä»å¼¦', status:'ä¸æ¶ä¸­', image_url:'', description:'' });
    setProductFormErrors({});
    setUploadError('');
    setProductModal('new');
  }
  function openEditProduct(p) {
    setProductForm({ name:p.name||'', brand_id:String(p.brand_id||''), sku:p.sku||'', price:p.price||0, category:p.category||'åä»å¼¦', status:p.status||'ä¸æ¶ä¸­', image_url:p.image_url||'', description:p.description||'' });
    setProductFormErrors({});
    setUploadError('');
    setProductModal(p);
  }

  async function handleSaveProduct() {
    const errors = {};
    if (!productForm.name.trim()) errors.name = 'åååç¨±çºå¿å¡«';
    setProductFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSavingProduct(true);
    try {
      const body = { name:productForm.name.trim(), brand_id:productForm.brand_id ? parseInt(productForm.brand_id) : null, sku:productForm.sku.trim()||null, price:parseFloat(productForm.price)||0, category:productForm.category, status:productForm.status, image_url:productForm.image_url.trim()||null, description:productForm.description.trim()||null };
      if (productModal === 'new') {
        await apiFetch('/rest/v1/products', { method:'POST', body:JSON.stringify(body) });
      } else {
        await apiFetch(`/rest/v1/products?id=eq.${productModal.id}`, { method:'PATCH', body:JSON.stringify(body) });
      }
      setProductModal(null);
      await loadAdminProducts();
      loadData();
    } catch (e) { alert('å²å­å¤±æï¼' + e.message); }
    finally { setSavingProduct(false); }
  }

  async function handleDeleteProduct(id) {
    try {
      await apiFetch(`/rest/v1/products?id=eq.${id}`, { method:'DELETE' });
      setDeleteConfirm(null);
      await loadAdminProducts();
      loadData();
    } catch (e) { alert('åªé¤å¤±æï¼' + e.message); }
  }

  async function handleToggleStatus(product) {
    const newStatus = product.status === 'ä¸æ¶ä¸­' ? 'å·²ä¸æ¶' : 'ä¸æ¶ä¸­';
    try {
      await apiFetch(`/rest/v1/products?id=eq.${product.id}`, { method:'PATCH', body:JSON.stringify({ status:newStatus }) });
      await loadAdminProducts();
      loadData();
    } catch (e) { alert('æ´æ°å¤±æï¼' + e.message); }
  }

  async function handleUpdateOrderStatus(id, status) {
    try {
      await apiFetch(`/rest/v1/orders?id=eq.${id}`, { method:'PATCH', body:JSON.stringify({ status }) });
      await loadAdminOrders();
    } catch (e) { alert('æ´æ°å¤±æï¼' + e.message); }
  }

  async function handleDeleteOrder() {
    if (!orderDeleteConfirm) return;
    setDeletingOrder(true);
    try {
      await apiFetch(`/rest/v1/order_items?order_id=eq.${orderDeleteConfirm.id}`, { method:'DELETE' });
      await apiFetch(`/rest/v1/orders?id=eq.${orderDeleteConfirm.id}`, { method:'DELETE' });
      setOrderDeleteConfirm(null);
      await loadAdminOrders();
    } catch (e) {
      alert('åªé¤å¤±æï¼' + e.message);
    } finally {
      setDeletingOrder(false);
    }
  }

  function openEditOrder(order) {
    setOrderEditForm({ customer_name: order.customer_name || '', contact: order.contact || '', notes: order.notes || '', status: order.status || 'å¾ç¢ºèª' });
    setOrderEditItems((order.order_items || []).map(item => ({ ...item, _qty: item.quantity, _deleted: false })));
    setOrderSaveError('');
    setOrderEditModal(order);
  }

  async function handleSaveOrder() {
    if (!orderEditModal) return;
    setSavingOrder(true);
    setOrderSaveError('');
    try {
      // Calculate new total from non-deleted items
      const newTotal = orderEditItems.filter(i => !i._deleted).reduce((s, i) => s + (i._qty * i.unit_price), 0);
      // Update order
      await apiFetch(`/rest/v1/orders?id=eq.${orderEditModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ customer_name: orderEditForm.customer_name, contact: orderEditForm.contact, notes: orderEditForm.notes || null, status: orderEditForm.status, total_amount: newTotal })
      });
      // Update/delete order items
      for (const item of orderEditItems) {
        if (item._deleted) {
          await apiFetch(`/rest/v1/order_items?id=eq.${item.id}`, { method:'DELETE' });
        } else if (item._qty !== item.quantity) {
          await apiFetch(`/rest/v1/order_items?id=eq.${item.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity: item._qty, subtotal: item._qty * item.unit_price })
          });
        }
      }
      setOrderEditModal(null);
      await loadAdminOrders();
    } catch (e) {
      setOrderSaveError('å²å­å¤±æï¼' + e.message);
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleAddBrand() {
    if (!newBrandName.trim()) return;
    setAddingBrand(true);
    try {
      const [brand] = await apiFetch('/rest/v1/brands', { method:'POST', body:JSON.stringify({ name:newBrandName.trim() }) });
      setAdminBrands(prev => [...prev, brand].sort((a,b) => a.name.localeCompare(b.name)));
      setBrands(prev => [...prev, brand].sort((a,b) => a.name.localeCompare(b.name)));
      setProductForm(f => ({ ...f, brand_id: String(brand.id) }));
      setBrandModal(false); setNewBrandName('');
    } catch (e) { alert('æ°å¢åçå¤±æï¼' + e.message); }
    finally { setAddingBrand(false); }
  }

  // ââ Image upload ââ
  async function uploadImage(file) {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('æªæ¡å¤§å°ä¸å¾è¶é 5MB');
      return;
    }
    setUploadingImage(true);
    setUploadError('');
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: file
        }
      );
      if (!res.ok) {
        let msg = 'ä¸å³å¤±æ';
        try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
        throw new Error(msg);
      }
      const url = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
      setProductForm(f => ({ ...f, image_url: url }));
    } catch (e) {
      setUploadError('åçä¸å³å¤±æï¼' + e.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // ââ Admin: filtered data ââ
  const filteredAdminProducts = adminProducts.filter(p => {
    if (productStatusFilter !== 'å¨é¨' && p.status !== productStatusFilter) return false;
    if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
    return true;
  });
  const filteredAdminOrders = adminOrders.filter(o => {
    if (orderStatusFilter !== 'å¨é¨' && (o.status||'å¾ç¢ºèª') !== orderStatusFilter) return false;
    if (orderSearch && !o.order_number?.includes(orderSearch) && !o.customer_name?.includes(orderSearch)) return false;
    return true;
  });
  const totalRevenue = adminOrders.reduce((s,o) => s + (o.total_amount||0), 0);
  const statusDist = ORDER_STATUSES.reduce((acc,s) => { acc[s] = adminOrders.filter(o => (o.status||'å¾ç¢ºèª') === s).length; return acc; }, {});

  // âââââââââââââââââââââââââââââââââââââââââââââââââââ
  // RENDER: FRONTEND
  // âââââââââââââââââââââââââââââââââââââââââââââââââââ

  const renderNav = () => (
    <nav style={S.nav} className="no-print">
      {/* ââ AMC Brand ââ */}
      <div style={S.navBrand} onClick={goShop} role="button" tabIndex={0} title="åé¦é "
        onKeyDown={e => e.key === 'Enter' && goShop()}>
        {/* Logo Mark */}
        <div style={S.navLogoMark} className="amc-logo-mark">
          <span style={S.navLogoText}>AMC</span>
        </div>
        {/* Title group */}
        <div style={S.navTitleGroup}>
          <span style={S.navTitleMain}>å®ç¿æ¨å¨</span>
          <span style={S.navTitleSub} className="amc-subtitle">Alliance Music Company</span>
        </div>
      </div>

      {/* ââ Right nav ââ */}
      <div style={S.navRight}>
        <button style={S.navBtn} onClick={() => { setPage('orders'); setSelectedProductId(null); loadOrders(); }}>æçè¨å®</button>
        <button style={S.navBtn} onClick={() => setCartOpen(true)}>
          ð {cartCount > 0 && <span style={S.badge}>{cartCount}</span>}
        </button>
        <button style={S.navAdminBtn} onClick={() => {
          if (isAdminLoggedIn) {
            setPage('admin'); setSelectedProductId(null);
          } else {
            setAdminLoginModal(true); setAdminPasswordInput(''); setAdminPasswordError(false);
          }
        }} title="ç®¡çå¾å°">âï¸ ç®¡çå¾å°</button>
      </div>
    </nav>
  );

  // ââ Category collection tiles (homepage quick-nav) ââ
  const CAT_TILES = [
    { key:'åä»/è²æ¯',    label:'GUITARS & BASS',  sub:'åä»/è²æ¯',   bg:'#1a1a1a', fg:'#fff', icon:'ð¸' },
    { key:'ææå¨/é³ç®±',  label:'FX & AMPLIFIERS', sub:'ææå¨/é³ç®±', bg:'#1a2538', fg:'#fff', icon:'ð' },
    { key:'éµç¤/åæå¨',  label:'KEYS & SYNTHS',   sub:'éµç¤/åæå¨', bg:'#1e1a2a', fg:'#fff', icon:'ð¹' },
    { key:'é¼/ææ',      label:'DRUMS & PERC',    sub:'é¼/ææ',     bg:'#2a1a0e', fg:'#fff', icon:'ð¥' },
    { key:'å¼¦',           label:'STRINGS',         sub:'å¼¦',          bg:'#0e2a1a', fg:'#fff', icon:'ðµ' },
    { key:'ç·æ/éä»¶',    label:'CABLES & ACC',    sub:'ç·æ/éä»¶',   bg:'#1f1f1f', fg:'#fff', icon:'ð' },
  ];

  const renderShop = () => (
    <div>
      {/* ââ Hero Banner Carousel ââ */}
      {page === 'shop' && !searchQuery && categoryFilter === 'å¨é¨' && brandFilter === 'å¨é¨' && bannerSlides.length > 0 && (
        <div
          style={{ ...S.bannerWrap, minHeight: bannerSlides[bannerIdx]?.image_url ? 420 : 380 }}
          className="no-print"
          onMouseEnter={() => setBannerPaused(true)}
          onMouseLeave={() => setBannerPaused(false)}
        >
          {/* Slides */}
          {bannerSlides.map((slide, i) => (
            <div key={slide.id} style={{ ...S.bannerSlide, opacity: i === bannerIdx ? 1 : 0, zIndex: i === bannerIdx ? 1 : 0 }}>
              {slide.image_url ? (
                <img src={slide.image_url} alt="" style={S.bannerBg} />
              ) : (
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#111 0%,#1e293b 50%,#111 100%)', backgroundImage:'repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0px,rgba(255,255,255,.02) 1px,transparent 1px,transparent 60px)' }} />
              )}
              <div style={S.bannerGradient} />
              <div style={S.bannerContent}>
                <p style={{ color:'rgba(255,255,255,.5)', fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:18, fontWeight:600 }}>Musical Instruments & Accessories</p>
                <h2 style={{ color:'#fff', fontSize:'clamp(30px,5vw,62px)', fontWeight:800, lineHeight:1.08, letterSpacing:'-0.04em', marginBottom:20, maxWidth:640, whiteSpace:'pre-line' }}>
                  {slide.title || 'Your Sound, Your Stage.'}
                </h2>
                <p style={{ color:'rgba(255,255,255,.65)', fontSize:15, marginBottom:32, maxWidth:440, lineHeight:1.75 }}>
                  {slide.subtitle}
                </p>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <button
                    style={{ padding:'13px 28px', background:'#fff', color:'#111', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, letterSpacing:'0.08em' }}
                    onClick={() => {
                      if (slide.cta_category) setCategoryFilter(slide.cta_category);
                      document.getElementById('shop-grid')?.scrollIntoView({behavior:'smooth'});
                    }}
                  >{slide.cta_label || 'SHOP NOW'}</button>
                  {!slide.cta_category && (
                    <button
                      style={{ padding:'13px 28px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,.4)', cursor:'pointer', fontWeight:600, fontSize:13, letterSpacing:'0.06em' }}
                      onClick={() => document.getElementById('shop-grid')?.scrollIntoView({behavior:'smooth'})}
                    >çè¦½å¨é¨åå</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Prev / Next arrows */}
          {bannerSlides.length > 1 && (
            <>
              <button style={S.bannerArrowLeft}
                onClick={() => { setBannerIdx(i => (i - 1 + bannerSlides.length) % bannerSlides.length); setBannerPaused(true); }}
              >â¹</button>
              <button style={S.bannerArrowRight}
                onClick={() => { setBannerIdx(i => (i + 1) % bannerSlides.length); setBannerPaused(true); }}
              >âº</button>
            </>
          )}

          {/* Dot indicators */}
          {bannerSlides.length > 1 && (
            <div style={S.bannerDots}>
              {bannerSlides.map((_, i) => (
                <button key={i} style={i === bannerIdx ? S.bannerDotActive : S.bannerDot}
                  onClick={() => { setBannerIdx(i); setBannerPaused(true); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ââ Category Collection Grid ââ */}
      {page === 'shop' && !searchQuery && categoryFilter === 'å¨é¨' && brandFilter === 'å¨é¨' && (
        <div style={{ background:'#111' }} className="no-print">
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:1 }}>
              {CAT_TILES.map(t => (
                <div key={t.key}
                  style={{ background:t.bg, color:t.fg, padding:'24px 18px', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'flex-end', minHeight:120, position:'relative', overflow:'hidden', transition:'opacity .15s' }}
                  onClick={() => { setCategoryFilter(t.key); document.getElementById('shop-grid')?.scrollIntoView({behavior:'smooth'}); }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}
                >
                  <div style={{ position:'absolute', top:12, right:14, fontSize:22, opacity:0.25 }}>{t.icon}</div>
                  <div style={{ fontSize:9, letterSpacing:'0.15em', opacity:0.55, marginBottom:4, textTransform:'uppercase' }}>{t.label}</div>
                  <div style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.01em' }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ââ Sidebar + Products ââ */}
      <div id="shop-grid" style={S.shopWrapper}>

        {/* ââ LEFT SIDEBAR ââ */}
        <aside style={S.shopSidebar} className="no-print shop-sidebar-hide">
          {/* Logo / Home */}
          <button style={S.shopSidebarLogo} onClick={goShop}>
            <div style={{ width:28, height:28, background:'#1a3a5c', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#fff', fontSize:10, fontWeight:700, letterSpacing:'0.5px' }}>AMC</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.text }}>å®ç¿æ¨å¨</span>
              <span style={{ fontSize:9, color:'#999' }}>ææåå</span>
            </div>
          </button>

          {/* Categories */}
          <div style={S.shopSidebarSection}>
            <div style={S.shopSidebarSectionTitle}>åååé¡</div>
            {CATEGORIES.map(c => (
              <button
                key={c}
                style={categoryFilter === c ? S.shopSidebarItemActive : S.shopSidebarItem}
                onClick={() => { setCategoryFilter(c); setBrandFilter('å¨é¨'); }}
              >
                {c === 'å¨é¨' ? 'ð¼ ææåå' : c}
              </button>
            ))}
          </div>

          <div style={S.shopSidebarDivider} />

          {/* Brands */}
          {brands.length > 0 && (
            <div style={S.shopSidebarSection}>
              <div style={S.shopSidebarSectionTitle}>åç ({brands.length})</div>
              <div style={{ maxHeight:300, overflowY:'auto' }}>
                <button
                  style={brandFilter === 'å¨é¨' ? S.shopSidebarItemActive : S.shopSidebarItem}
                  onClick={() => setBrandFilter('å¨é¨')}
                >ææåç</button>
                {[...brands].sort((a,b) => a.name.localeCompare(b.name, 'en')).map(b => (
                  <button
                    key={b.id}
                    style={brandFilter === String(b.id) ? S.shopSidebarItemActive : S.shopSidebarItem}
                    onClick={() => setBrandFilter(String(b.id))}
                  >{b.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {(categoryFilter !== 'å¨é¨' || brandFilter !== 'å¨é¨' || searchQuery) && (
            <>
              <div style={S.shopSidebarDivider} />
              <div style={{ padding:'8px 20px 16px' }}>
                <button
                  style={{ width:'100%', padding:'8px 0', background:C.text, color:'#fff', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.05em' }}
                  onClick={() => { setCategoryFilter('å¨é¨'); setBrandFilter('å¨é¨'); setSearchQuery(''); }}
                >â æ¸é¤ææç¯©é¸</button>
              </div>
            </>
          )}
        </aside>

        {/* ââ MAIN CONTENT ââ */}
        <div style={S.shopMain}>
          <div style={{ padding:'20px 24px' }}>
            {/* Search + Sort bar */}
            <div style={{ ...S.filterBar, marginBottom:16 }} className="no-print">
              <div style={S.searchWrap}>
                <span style={S.searchIcon}>ð</span>
                <input
                  style={S.searchInput}
                  placeholder="æå°åååç¨±ãè²¨èãåç..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 2px ${C.primary}22`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                />
                {searchQuery && (
                  <button style={S.searchClear} onClick={() => setSearchQuery('')} title="æ¸é¤">â</button>
                )}
              </div>
              <select style={{ ...S.select, marginLeft:'auto' }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="default">é è¨­æåº</option>
                <option value="price_asc">å¹æ ¼ï¼ä½ â é«</option>
                <option value="price_desc">å¹æ ¼ï¼é« â ä½</option>
                <option value="newest">ææ°ä¸æ¶</option>
              </select>
            </div>

            {/* Active filter chips */}
            {(categoryFilter !== 'å¨é¨' || brandFilter !== 'å¨é¨') && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }} className="no-print">
                {categoryFilter !== 'å¨é¨' && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#111', color:'#fff', fontSize:12, fontWeight:500 }}>
                    {categoryFilter}
                    <button style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:12, padding:'0 0 0 4px', lineHeight:1 }} onClick={() => setCategoryFilter('å¨é¨')}>â</button>
                  </span>
                )}
                {brandFilter !== 'å¨é¨' && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#111', color:'#fff', fontSize:12, fontWeight:500 }}>
                    {brands.find(b => String(b.id) === brandFilter)?.name || brandFilter}
                    <button style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:12, padding:'0 0 0 4px', lineHeight:1 }} onClick={() => setBrandFilter('å¨é¨')}>â</button>
                  </span>
                )}
              </div>
            )}

            {/* Search status */}
            {searchQuery.trim() && !loading && (
              <div style={S.searchStatus}>
                <span>æå°ã{searchQuery.trim()}ãï¼å± <strong>{filtered.length}</strong> åçµæ{hasActiveFilter && <span>ï¼å·²å¥ç¨ç¯©é¸ï¼</span>}</span>
                <button style={S.searchStatusClear} onClick={() => setSearchQuery('')}>æ¸é¤æå°</button>
              </div>
            )}

            {/* Product grid */}
            {loading ? (
              <div style={S.center}><div style={S.spinner} /><p>è¼å¥ååä¸­...</p></div>
            ) : error ? (
              <div style={S.center}><p style={{ color:C.danger }}>è¼å¥å¤±æï¼{error}</p><button style={S.retryBtn} onClick={loadData}>éè©¦</button></div>
            ) : filtered.length === 0 ? (
              <div style={{ ...S.empty, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                {searchQuery.trim()
                  ? <>æ¾ä¸å°ç¬¦åã{searchQuery.trim()}ãçåå<br/><button style={{ ...S.searchStatusClear, fontSize:14 }} onClick={() => setSearchQuery('')}>æ¸é¤æå°</button></>
                  : 'æ­¤åé¡ç®åæ²æåå'}
              </div>
            ) : (
              <div style={S.grid} className="grid-responsive">
                {filtered.map(p => (
                  <div key={p.id} style={S.card} onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.10)'} onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                    <div onClick={() => openDetail(p.id)} style={{ cursor:'pointer' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
                      ) : (
                        <div style={S.cardImg}>æ«ç¡åç</div>
                      )}
                    </div>
                    <div style={S.cardBody}>
                      <div style={S.cardName} onClick={() => openDetail(p.id)}>{p.name}</div>
                      <div style={S.cardBrand}>{p.brands?.name || 'â'}</div>
                      <div style={S.cardSku}>è²¨èï¼{p.sku || 'â'}</div>
                      <div style={S.cardPrice}>{p.price > 0 ? `NT$ ${p.price.toLocaleString()}` : 'æ´½è©¢å¹æ ¼'}</div>
                      <div style={S.cardActions}>
                        <input type="number" min="1" value={quantities[p.id]||1} onChange={e => setQuantities(prev => ({ ...prev, [p.id]: Math.max(1, parseInt(e.target.value)||1) }))} style={S.qtyInput} onClick={e => e.stopPropagation()} />
                        <button style={S.addBtn} onClick={e => { e.stopPropagation(); addToCart(p); }}>å å¥è³¼ç©è»</button>
                      </div>
                      <button style={S.detailBtn} onClick={() => openDetail(p.id)}>æ¥çè©³æ â</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  const renderProductDetail = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return (
      <div style={S.container}>
        <button style={S.detailBack} onClick={goShop}>â è¿åååç®é</button>
        <div style={S.empty}>æ¾ä¸å°ååï¼å¯è½å·²ä¸æ¶</div>
      </div>
    );

    function handleDetailAddToCart() {
      addToCartWithQty(product, detailQty);
      setDetailAddedMsg(true);
      setTimeout(() => setDetailAddedMsg(false), 1500);
    }

    return (
      <div style={S.detailContainer}>
        <button style={S.detailBack} onClick={goShop}>â è¿åååç®é</button>

        <div style={S.detailLayout} className="detail-layout">
          {/* Left: Image */}
          <div style={S.detailImgBox}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', minHeight:340 }} />
            ) : (
              <span style={{ color:C.textLight, fontSize:16 }}>æ«ç¡åç</span>
            )}
          </div>

          {/* Right: Info */}
          <div style={S.detailInfoBox}>
            <h1 style={S.detailName}>{product.name}</h1>
            {product.brands?.name && <div style={S.detailBrand}>{product.brands.name}</div>}
            {product.sku && <div style={S.detailSku}>è²¨èï¼{product.sku}</div>}
            <div style={S.detailPrice}>
              {product.price > 0 ? `NT$ ${product.price.toLocaleString()}` : 'æ´½è©¢å¹æ ¼'}
            </div>
            <div style={S.detailTagRow}>
              {product.category && <span style={S.detailCatTag}>{product.category}</span>}
              <span style={productStatusStyle(product.status)}>{product.status}</span>
            </div>
            <div style={S.detailDivider} />
            <div style={S.detailCartRow}>
              <input
                type="number"
                min="1"
                value={detailQty}
                onChange={e => setDetailQty(Math.max(1, parseInt(e.target.value)||1))}
                style={S.detailQtyInput}
              />
              <button
                style={detailAddedMsg ? S.detailAddedBtn : S.detailAddBtn}
                onClick={handleDetailAddToCart}
              >
                {detailAddedMsg ? 'å·²å å¥è³¼ç©è» â' : 'å å¥è³¼ç©è»'}
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={S.detailDescSection}>
          <h2 style={S.detailDescTitle}>ååä»ç´¹</h2>
          {product.description ? (
            <div style={S.detailDescText}>{product.description}</div>
          ) : (
            <div style={S.detailDescEmpty}>æ«ç¡ååæè¿°</div>
          )}
        </div>

        {/* æ¨è¦ååï¼ååçåªåï¼ä¸è¶³è£åé¡å¥ï¼æå¤ 4 å */}
        {(() => {
          const sameBrand = products.filter(p => p.id !== product.id && p.brand_id === product.brand_id);
          const sameCat   = products.filter(p => p.id !== product.id && p.brand_id !== product.brand_id && p.category === product.category);
          const recs = [...sameBrand, ...sameCat].slice(0, 4);
          if (recs.length === 0) return null;
          return (
            <div style={S.recSection}>
              <h2 style={S.recTitle}>ä½ å¯è½ä¹åæ­¡</h2>
              <div style={S.recGrid}>
                {recs.map(r => (
                  <div key={r.id} style={S.recCard}
                    onClick={() => { setSelectedProductId(r.id); setDetailQty(1); setDetailAddedMsg(false); window.scrollTo({top:0,behavior:'smooth'}); }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.10)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                  >
                    {r.image_url
                      ? <img src={r.image_url} alt={r.name} style={S.recImg} />
                      : <div style={S.recImgPlaceholder}>æ«ç¡åç</div>}
                    <div style={S.recBody}>
                      <div style={S.recName} title={r.name}>{r.name}</div>
                      <div style={S.recBrand}>{r.brands?.name || 'â'}</div>
                      <div style={S.recPrice}>{r.price > 0 ? `NT$ ${r.price.toLocaleString()}` : 'æ´½è©¢å¹æ ¼'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const renderCart = () => cartOpen && (
    <>
      <div style={S.overlay} onClick={() => setCartOpen(false)} />
      <div style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <h2 style={{ margin:0, fontSize:18 }}>è³¼ç©è»</h2>
          <button onClick={() => setCartOpen(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>â</button>
        </div>
        <div style={S.sidebarBody}>
          {cart.length === 0 ? <div style={S.empty}>è³¼ç©è»æ¯ç©ºç</div> : cart.map(item => (
            <div key={item.id} style={S.cartItem}>
              {/* ç¸®å */}
              <div style={S.cartThumb}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : 'ð¸'}
              </div>
              <div style={S.cartItemInfo}>
                <div style={S.cartItemName}>{item.name}</div>
                <div style={S.cartItemPrice}>NT$ {item.price.toLocaleString()} Ã {item.quantity} = NT$ {(item.price*item.quantity).toLocaleString()}</div>
                <div style={S.cartQtyGroup}>
                  <button style={S.cartQtyBtn} onClick={() => updateCartQty(item.id,-1)}>â</button>
                  <span style={S.cartQtyNum}>{item.quantity}</span>
                  <button style={S.cartQtyBtn} onClick={() => updateCartQty(item.id,1)}>+</button>
                  <button style={S.removeBtn} onClick={() => removeFromCart(item.id)}>åªé¤</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={S.sidebarFooter}>
            <div style={S.totalRow}><span>ç¸½è¨</span><span>NT$ {cartTotal.toLocaleString()}</span></div>
            <button style={S.submitBtn} onClick={() => setModalOpen(true)}>éåºè¨å®</button>
          </div>
        )}
      </div>
    </>
  );

  const renderModal = () => modalOpen && (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && setModalOpen(false)}>
      <div style={S.modalBox}>
        <h2 style={S.modalTitle}>è¨è³¼è³è¨</h2>
        <div style={S.formGroup}>
          <label style={S.label}>å§å *</label>
          <input style={formErrors.name ? S.inputError : S.input} value={formData.name} onChange={e => { setFormData(f => ({ ...f, name:e.target.value })); setFormErrors(fe => ({ ...fe, name:'' })); }} placeholder="è«è¼¸å¥å§å" />
          {formErrors.name && <div style={S.errorText}>{formErrors.name}</div>}
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>è¯çµ¡æ¹å¼ *</label>
          <input style={formErrors.contact ? S.inputError : S.input} value={formData.contact} onChange={e => { setFormData(f => ({ ...f, contact:e.target.value })); setFormErrors(fe => ({ ...fe, contact:'' })); }} placeholder="ææ©æ LINE ID" />
          {formErrors.contact && <div style={S.errorText}>{formErrors.contact}</div>}
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>åè¨»</label>
          <textarea style={S.textarea} value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes:e.target.value }))} placeholder="é¸å¡«" />
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setModalOpen(false)}>è¿åä¿®æ¹</button>
          <button style={submitting ? S.disabledBtn : S.confirmBtn} disabled={submitting} onClick={handleSubmitOrder}>{submitting ? 'éåºä¸­...' : 'ç¢ºèªéåº'}</button>
        </div>
      </div>
    </div>
  );

  const renderConfirm = () => confirmedOrder && (
    <div style={S.confirmPage}>
      <div style={S.checkIcon}>â</div>
      <h2 style={S.confirmTitle}>è¨å®å·²éåº</h2>
      <div style={S.confirmOrderNum}>è¨å®ç·¨èï¼{confirmedOrder.order_number}</div>
      <div style={S.infoBox}>
        <div style={S.infoRow}><span>è¨è³¼è</span><span>{confirmedOrder.customer_name}</span></div>
        <div style={S.infoRow}><span>è¯çµ¡æ¹å¼</span><span>{confirmedOrder.contact}</span></div>
        {confirmedOrder.notes && <div style={S.infoRow}><span>åè¨»</span><span>{confirmedOrder.notes}</span></div>}
        <div style={S.infoRow}><span>ä¸å®æé</span><span>{formatDate(confirmedOrder.orderTime)}</span></div>
      </div>
      <table style={S.table}>
        <thead><tr><th style={S.th}>åå</th><th style={{...S.th,textAlign:'center'}}>æ¸é</th><th style={{...S.th,textAlign:'right'}}>å®å¹</th><th style={{...S.th,textAlign:'right'}}>å°è¨</th></tr></thead>
        <tbody>{confirmedOrder.items.map((item,i) => (<tr key={i}><td style={S.td}>{item.name}</td><td style={{...S.td,textAlign:'center'}}>{item.quantity}</td><td style={{...S.td,textAlign:'right'}}>NT$ {item.price.toLocaleString()}</td><td style={{...S.td,textAlign:'right'}}>NT$ {(item.price*item.quantity).toLocaleString()}</td></tr>))}</tbody>
        <tfoot><tr><td colSpan={3} style={{...S.td,fontWeight:700,textAlign:'right'}}>ç¸½è¨</td><td style={{...S.td,fontWeight:700,textAlign:'right',color:C.primary}}>NT$ {confirmedOrder.total_amount.toLocaleString()}</td></tr></tfoot>
      </table>
      <div className="no-print">
        <button style={S.continueBtn} onClick={goShop}>ç¹¼çºé¸è³¼</button>
        <button style={S.printBtn} onClick={() => window.print()}>åå°è¨å®</button>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div style={S.container}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>æçè¨å®</h2>
        {myContact && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, color:C.textLight }}>æ¥è©¢è¯çµ¡ï¼{myContact}</span>
            <button style={{ ...S.btnSm, background:'transparent', color:C.textLight, border:`1px solid ${C.border}` }}
              onClick={() => { localStorage.removeItem('myContact'); setMyContact(''); setOrders([]); setContactLookup(''); }}>
              åæå¸³è
            </button>
          </div>
        )}
      </div>

      {!myContact ? (
        <div style={{ maxWidth:420, margin:'60px auto', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>ð</div>
          <p style={{ marginBottom:20, color:C.textLight }}>è«è¼¸å¥æ¨ä¸å®æä½¿ç¨çè¯çµ¡æ¹å¼ï¼é»è©±æ Emailï¼ä¾æ¥è©¢è¨å®ã</p>
          <input
            style={{ ...S.input, marginBottom:12, textAlign:'center' }}
            placeholder="è¼¸å¥é»è©± / Email"
            value={contactLookup}
            onChange={e => setContactLookup(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && contactLookup.trim()) { const c = contactLookup.trim(); localStorage.setItem('myContact', c); setMyContact(c); loadOrders(c); } }}
          />
          <button style={{ ...S.submitBtn, width:'100%' }}
            disabled={!contactLookup.trim()}
            onClick={() => { const c = contactLookup.trim(); if (!c) return; localStorage.setItem('myContact', c); setMyContact(c); loadOrders(c); }}>
            æ¥è©¢æçè¨å®
          </button>
        </div>
      ) : ordersLoading ? (
        <div style={S.center}><div style={S.spinner} /><p>è¼å¥è¨å®ä¸­...</p></div>
      ) : orders.length === 0 ? (
        <div style={S.empty}>æ¥ç¡æ­¤è¯çµ¡æ¹å¼çè¨å®è¨é</div>
      ) : orders.map(o => (
        <div key={o.id} style={S.orderCard}>
          <div style={S.orderHeader} onClick={() => setExpandedOrder(expandedOrder===o.id ? null : o.id)}>
            <div style={S.orderHeaderLeft}>
              <span style={S.orderNum}>{o.order_number}</span>
              <span style={S.orderDate}>{formatDate(o.created_at)} Â· {o.customer_name}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={S.orderAmount}>NT$ {o.total_amount?.toLocaleString()}</span>
              <span>{expandedOrder===o.id ? 'â²' : 'â¼'}</span>
            </div>
          </div>
          {expandedOrder===o.id && o.order_items && (
            <div style={S.orderDetail}>
              <table style={{...S.table,marginTop:12}}>
                <thead><tr><th style={S.th}>åå</th><th style={{...S.th,textAlign:'center'}}>æ¸é</th><th style={{...S.th,textAlign:'right'}}>å®å¹</th><th style={{...S.th,textAlign:'right'}}>å°è¨</th></tr></thead>
                <tbody>{o.order_items.map((item,i) => (<tr key={i}><td style={S.td}>{item.product_name}</td><td style={{...S.td,textAlign:'center'}}>{item.quantity}</td><td style={{...S.td,textAlign:'right'}}>NT$ {item.unit_price?.toLocaleString()}</td><td style={{...S.td,textAlign:'right'}}>NT$ {item.subtotal?.toLocaleString()}</td></tr>))}</tbody>
              </table>
              {o.notes && <div style={{ fontSize:13,color:C.textLight,marginTop:8 }}>åè¨»ï¼{o.notes}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // âââââââââââââââââââââââââââââââââââââââââââââââââââ
  // RENDER: ADMIN
  // âââââââââââââââââââââââââââââââââââââââââââââââââââ

  const renderDashboard = () => (
    <div>
      <div style={S.statsGrid} className="stats-grid-responsive">
        {[
          { icon:'ð¦', label:'ååç¸½æ¸', value: adminProducts.length },
          { icon:'â', label:'ä¸æ¶ä¸­åå', value: adminProducts.filter(p => p.status==='ä¸æ¶ä¸­').length },
          { icon:'ð', label:'è¨å®ç¸½æ¸', value: adminOrders.length },
          { icon:'ð°', label:'ç¸½çæ¶', value: `NT$ ${totalRevenue.toLocaleString()}` },
        ].map((s,i) => (
          <div key={i} style={S.statCard}>
            <div style={S.statIcon}>{s.icon}</div>
            <div style={S.statLabel}>{s.label}</div>
            <div style={S.statValue}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <div style={S.adminCard}>
          <div style={S.adminCardTitle}>æè¿ 10 ç­è¨å®</div>
          {adminOrders.length === 0 ? (
            <div style={{ color:C.textLight, fontSize:14 }}>æ«ç¡è¨å®</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={S.adminTable}>
                <thead><tr>
                  {['è¨å®ç·¨è','å®¢æ¶åç¨±','éé¡','çæ','æé'].map(h => <th key={h} style={S.adminTh}>{h}</th>)}
                </tr></thead>
                <tbody>{adminOrders.slice(0,10).map((o,i) => (
                  <tr key={o.id}>
                    <td style={adminTd(i%2===1)}>{o.order_number}</td>
                    <td style={adminTd(i%2===1)}>{o.customer_name}</td>
                    <td style={adminTd(i%2===1)}>NT$ {o.total_amount?.toLocaleString()}</td>
                    <td style={adminTd(i%2===1)}><span style={orderStatusStyle(o.status||'å¾ç¢ºèª')}>{o.status||'å¾ç¢ºèª'}</span></td>
                    <td style={adminTd(i%2===1)}>{formatDate(o.created_at)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
        <div style={S.adminCard}>
          <div style={S.adminCardTitle}>è¨å®çæåä½</div>
          {ORDER_STATUSES.map(s => {
            const count = statusDist[s] || 0;
            const pct = adminOrders.length > 0 ? Math.round(count/adminOrders.length*100) : 0;
            const clr = { 'å¾ç¢ºèª':'#f97316','å·²ç¢ºèª':'#3b82f6','å·²å®æ':'#16a34a','å·²åæ¶':'#ef4444' }[s];
            return (
              <div key={s} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span>{s}</span><span style={{ fontWeight:600, color:clr }}>{count} ç­</span>
                </div>
                <div style={{ background:'#e2e8f0', borderRadius:4, height:8, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, background:clr, height:'100%', borderRadius:4, transition:'width .3s', minWidth: count > 0 ? 4 : 0 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ââ Banner upload helper ââ
  async function uploadBannerImage(file) {
    if (file.size > 5 * 1024 * 1024) { setBannerUploadErr('æªæ¡ä¸å¾è¶é 5MB'); return; }
    setUploadingBanner(true); setBannerUploadErr('');
    try {
      const fileName = `banner-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`, {
        method:'POST',
        headers: { 'apikey':SUPABASE_KEY, 'Authorization':`Bearer ${SUPABASE_KEY}` },
        body: file
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'ä¸å³å¤±æ'); }
      const url = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
      setBannerForm(f => ({ ...f, image_url: url }));
    } catch (e) { setBannerUploadErr('ä¸å³å¤±æï¼' + e.message); }
    finally { setUploadingBanner(false); }
  }

  const renderAdminBanners = () => (
    <div>
      <div style={S.toolbar}>
        <button style={S.addProductBtn} onClick={() => { setBannerForm({ title:'', subtitle:'', cta_label:'', cta_category:'', image_url:'' }); setBannerUploadErr(''); setBannerModal('new'); }}>ï¼ æ°å¢æ©«å¹</button>
        <button style={iconBtn()} onClick={() => { setBannerSlides(DEFAULT_BANNERS); setBannerIdx(0); }}>â© éåé è¨­</button>
      </div>
      {bannerSlides.length === 0 ? (
        <div style={S.empty}>ç®åæ²ææ©«å¹ï¼é»æãæ°å¢æ©«å¹ãéå§è¨­å®</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {bannerSlides.map((slide, idx) => (
            <div key={slide.id} style={{ ...S.adminCard, display:'flex', alignItems:'center', gap:16, marginBottom:0, padding:'14px 20px' }}>
              {/* Thumbnail */}
              <div style={{ width:120, height:68, flexShrink:0, background:'#111', overflow:'hidden', borderRadius:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                {slide.image_url
                  ? <img src={slide.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ color:'#555', fontSize:11 }}>ç¡åç</span>}
              </div>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{slide.title || 'ï¼ç¡æ¨é¡ï¼'}</div>
                <div style={{ fontSize:12, color:C.textLight, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{slide.subtitle}</div>
                {slide.cta_label && <div style={{ fontSize:11, color:C.textLight, marginTop:2 }}>CTAï¼{slide.cta_label}{slide.cta_category ? ` â ${slide.cta_category}` : ''}</div>}
              </div>
              {/* Order controls */}
              <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                <button style={iconBtn()} disabled={idx===0} onClick={() => setBannerSlides(prev => { const a=[...prev]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; return a; })}>â</button>
                <button style={iconBtn()} disabled={idx===bannerSlides.length-1} onClick={() => setBannerSlides(prev => { const a=[...prev]; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; return a; })}>â</button>
                <button style={iconBtn()} onClick={() => { setBannerForm({ ...slide }); setBannerUploadErr(''); setBannerModal(slide); }}>âï¸ ç·¨è¼¯</button>
                <button style={S.dangerIconBtn} onClick={() => { if(window.confirm('ç¢ºå®è¦åªé¤æ­¤æ©«å¹ï¼')) setBannerSlides(prev => prev.filter(s => s.id !== slide.id)); }}>ð åªé¤</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner edit/create modal */}
      {bannerModal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setBannerModal(null)}>
          <div style={{ ...S.modalBox, maxWidth:560 }}>
            <h3 style={S.modalTitle}>{bannerModal === 'new' ? 'æ°å¢æ©«å¹' : 'ç·¨è¼¯æ©«å¹'}</h3>

            {/* Image preview */}
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>æ©«å¹åç</label>
              {bannerForm.image_url && (
                <div style={{ marginBottom:10, borderRadius:0, overflow:'hidden', height:140, background:'#111', position:'relative' }}>
                  <img src={bannerForm.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button onClick={() => setBannerForm(f => ({ ...f, image_url:'' }))} style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.6)', border:'none', color:'#fff', borderRadius:0, padding:'4px 8px', cursor:'pointer', fontSize:12 }}>â ç§»é¤</button>
                </div>
              )}
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <label style={{ padding:'8px 14px', background:C.text, color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.05em', flexShrink:0 }}>
                  {uploadingBanner ? 'ä¸å³ä¸­...' : 'ð ä¸å³åç'}
                  <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploadingBanner}
                    onChange={e => e.target.files[0] && uploadBannerImage(e.target.files[0])} />
                </label>
                <span style={{ fontSize:11, color:C.textLight }}>æè¼¸å¥åçç¶²å</span>
              </div>
              <input style={{ ...S.input, marginTop:8 }} placeholder="https://..." value={bannerForm.image_url}
                onChange={e => setBannerForm(f => ({ ...f, image_url: e.target.value }))} />
              {bannerUploadErr && <div style={S.errorText}>{bannerUploadErr}</div>}
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>æ¨é¡ï¼æ¯æ´æè¡ \nï¼</label>
              <input style={S.input} value={bannerForm.title} onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} placeholder="Your Sound, Your Stage." />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>å¯æ¨é¡</label>
              <textarea style={S.textarea} value={bannerForm.subtitle} onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="åä»ãè²æ¯ãéµç¤ãé¼çµååå¼éä»¶ï¼ä¸ç«è³¼è¶³" rows={2} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={S.formGroup}>
                <label style={S.label}>æéæå­</label>
                <input style={S.input} value={bannerForm.cta_label} onChange={e => setBannerForm(f => ({ ...f, cta_label: e.target.value }))} placeholder="SHOP NOW" />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>é»æè·³å¾åé¡ï¼çç©º=çè¦½å¨é¨ï¼</label>
                <select style={S.select} value={bannerForm.cta_category} onChange={e => setBannerForm(f => ({ ...f, cta_category: e.target.value }))}>
                  <option value="">çè¦½å¨é¨</option>
                  {PROD_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={() => setBannerModal(null)}>åæ¶</button>
              <button style={S.confirmBtn} onClick={() => {
                if (!bannerForm.title.trim() && !bannerForm.image_url) { alert('è«è¼¸å¥æ¨é¡æä¸å³åç'); return; }
                if (bannerModal === 'new') {
                  setBannerSlides(prev => [...prev, { ...bannerForm, id:'b'+Date.now() }]);
                } else {
                  setBannerSlides(prev => prev.map(s => s.id === bannerModal.id ? { ...bannerForm, id:s.id } : s));
                }
                setBannerModal(null);
              }}>å²å­</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdminProducts = () => (
    <div>
      <div style={S.toolbar}>
        <button style={S.addProductBtn} onClick={openNewProduct}>ï¼ æ°å¢åå</button>
        <input style={S.searchInput} placeholder="æå°åååç¨±..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
        <select style={S.select} value={productStatusFilter} onChange={e => setProductStatusFilter(e.target.value)}>
          <option value="å¨é¨">å¨é¨çæ</option>
          <option value="ä¸æ¶ä¸­">ä¸æ¶ä¸­</option>
          <option value="å·²ä¸æ¶">å·²ä¸æ¶</option>
        </select>
        <button style={iconBtn()} onClick={loadAdminProducts}>ð éæ°æ´ç</button>
      </div>
      <div style={S.adminCard}>
        {filteredAdminProducts.length === 0 ? (
          <div style={{ color:C.textLight, fontSize:14, padding:20 }}>æ²æç¬¦åæ¢ä»¶çåå</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={S.adminTable}>
              <thead><tr>
                {['åååç¨±','åç','è²¨è','å¹æ ¼','é¡å¥','çæ','æä½'].map(h => <th key={h} style={S.adminTh}>{h}</th>)}
              </tr></thead>
              <tbody>{filteredAdminProducts.map((p,i) => (
                <tr key={p.id}>
                  <td style={adminTd(i%2===1)}><strong>{p.name}</strong></td>
                  <td style={adminTd(i%2===1)}>{p.brands?.name || 'â'}</td>
                  <td style={adminTd(i%2===1)}>{p.sku || 'â'}</td>
                  <td style={adminTd(i%2===1)}>{p.price > 0 ? `NT$ ${p.price.toLocaleString()}` : 'æ´½è©¢'}</td>
                  <td style={adminTd(i%2===1)}>{p.category || 'â'}</td>
                  <td style={adminTd(i%2===1)}><span style={productStatusStyle(p.status)}>{p.status}</span></td>
                  <td style={adminTd(i%2===1)}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <button style={iconBtn()} onClick={() => openEditProduct(p)}>âï¸ ç·¨è¼¯</button>
                      <button style={iconBtn(p.status==='ä¸æ¶ä¸­' ? '#f97316' : '#16a34a')} onClick={() => handleToggleStatus(p)}>
                        {p.status==='ä¸æ¶ä¸­' ? 'ð¤ ä¸æ¶' : 'ð¥ ä¸æ¶'}
                      </button>
                      <button style={S.dangerIconBtn} onClick={() => setDeleteConfirm(p)}>ð åªé¤</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminOrders = () => (
    <div>
      <div style={S.toolbar}>
        <input style={S.searchInput} placeholder="æå°è¨å®ç·¨èæå®¢æ¶åç¨±..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
        <select style={S.select} value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
          <option value="å¨é¨">å¨é¨çæ</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button style={iconBtn()} onClick={loadAdminOrders}>ð éæ°æ´ç</button>
      </div>
      <div style={S.adminCard}>
        {filteredAdminOrders.length === 0 ? (
          <div style={{ color:C.textLight, fontSize:14, padding:20 }}>æ²æç¬¦åæ¢ä»¶çè¨å®</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={S.adminTable}>
              <thead><tr>
                {['è¨å®ç·¨è','å®¢æ¶åç¨±','è¯çµ¡æ¹å¼','ååæ¸','ç¸½éé¡','çæ','ä¸å®æé','æä½'].map(h => <th key={h} style={S.adminTh}>{h}</th>)}
              </tr></thead>
              <tbody>{filteredAdminOrders.map((o,i) => [
                <tr key={o.id}>
                  <td style={adminTd(i%2===1)}>{o.order_number}</td>
                  <td style={adminTd(i%2===1)}>{o.customer_name}</td>
                  <td style={adminTd(i%2===1)}>{o.contact || 'â'}</td>
                  <td style={adminTd(i%2===1)}>{o.order_items?.length || 0} ä»¶</td>
                  <td style={adminTd(i%2===1)}>NT$ {o.total_amount?.toLocaleString()}</td>
                  <td style={adminTd(i%2===1)}><span style={orderStatusStyle(o.status||'å¾ç¢ºèª')}>{o.status||'å¾ç¢ºèª'}</span></td>
                  <td style={adminTd(i%2===1)}>{formatDate(o.created_at)}</td>
                  <td style={adminTd(i%2===1)}>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                      <button style={iconBtn()} onClick={() => setExpandedAdminOrder(expandedAdminOrder===o.id ? null : o.id)}>
                        {expandedAdminOrder===o.id ? 'â² æ¶èµ·' : 'â¼ æç´°'}
                      </button>
                      <button style={{ padding:'4px 10px', background:'none', border:`1px solid ${C.primary}`, color:C.primary, borderRadius:6, cursor:'pointer', fontSize:12 }} onClick={() => openEditOrder(o)}>âï¸ ç·¨è¼¯</button>
                      <button style={{ padding:'4px 10px', background:'none', border:`1px solid ${C.danger}`, color:C.danger, borderRadius:6, cursor:'pointer', fontSize:12 }} onClick={() => setOrderDeleteConfirm(o)}>ðï¸ åªé¤</button>
                    </div>
                  </td>
                </tr>,
                expandedAdminOrder===o.id && (
                  <tr key={`${o.id}-detail`}>
                    <td colSpan={8} style={{ background:'#f1f5f9', padding:'0 16px 16px' }}>
                      <div style={{ paddingTop:12 }}>
                        <table style={{ ...S.adminTable, marginBottom:8 }}>
                          <thead><tr>
                            {['åååç¨±','æ¸é','å®å¹','å°è¨'].map(h => <th key={h} style={{ ...S.adminTh, background:'#e2e8f0' }}>{h}</th>)}
                          </tr></thead>
                          <tbody>{(o.order_items||[]).map((item,j) => (
                            <tr key={j}>
                              <td style={adminTd(false)}>{item.product_name}</td>
                              <td style={adminTd(false)}>{item.quantity}</td>
                              <td style={adminTd(false)}>NT$ {item.unit_price?.toLocaleString()}</td>
                              <td style={adminTd(false)}>NT$ {item.subtotal?.toLocaleString()}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                        {o.notes && <div style={{ fontSize:13, color:C.textLight }}>åè¨»ï¼{o.notes}</div>}
                      </div>
                    </td>
                  </tr>
                )
              ])}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductModal = () => productModal && (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && setProductModal(null)}>
      <div style={{ ...S.modalBox, maxWidth:560 }}>
        <h2 style={S.modalTitle}>{productModal==='new' ? 'æ°å¢åå' : 'ç·¨è¼¯åå'}</h2>
        <div style={S.formGroup}>
          <label style={S.label}>åååç¨± *</label>
          <input style={productFormErrors.name ? S.inputError : S.input} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name:e.target.value }))} placeholder="è«è¼¸å¥åååç¨±" />
          {productFormErrors.name && <div style={S.errorText}>{productFormErrors.name}</div>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={S.formGroup}>
            <label style={S.label}>åç</label>
            <select style={{ ...S.input, cursor:'pointer' }} value={productForm.brand_id}
              onChange={e => { if (e.target.value === '__new__') { setBrandModal(true); } else { setProductForm(f => ({ ...f, brand_id:e.target.value })); } }}>
              <option value="">ç¡åç</option>
              {adminBrands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
              <option value="__new__">ï¼ æ°å¢åç...</option>
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>è²¨è</label>
            <input style={S.input} value={productForm.sku} onChange={e => setProductForm(f => ({ ...f, sku:e.target.value }))} placeholder="é¸å¡«" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>å¹æ ¼ï¼0 = æ´½è©¢ï¼</label>
            <input style={S.input} type="number" min="0" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price:e.target.value }))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>é¡å¥</label>
            <select style={{ ...S.input, cursor:'pointer' }} value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category:e.target.value }))}>
              {PROD_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>çæ</label>
          <select style={{ ...S.input, cursor:'pointer' }} value={productForm.status} onChange={e => setProductForm(f => ({ ...f, status:e.target.value }))}>
            <option value="ä¸æ¶ä¸­">ä¸æ¶ä¸­</option>
            <option value="å·²ä¸æ¶">å·²ä¸æ¶</option>
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>åååçï¼é¸å¡«ï¼</label>
          {productForm.image_url ? (
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <img
                src={productForm.image_url}
                alt="é è¦½"
                style={{ width:100, height:100, objectFit:'cover', borderRadius:8, border:`1px solid ${C.border}`, flexShrink:0 }}
                onError={e => { e.target.style.display='none'; }}
              />
              <button
                type="button"
                style={{ padding:'6px 12px', background:'none', border:`1px solid ${C.danger}`, color:C.danger, borderRadius:6, cursor:'pointer', fontSize:12 }}
                onClick={() => { setProductForm(f => ({ ...f, image_url:'' })); setUploadError(''); }}
              >â æ¸é¤åç</button>
            </div>
          ) : null}
          <input
            style={{ ...S.input, marginBottom:8 }}
            value={productForm.image_url}
            onChange={e => setProductForm(f => ({ ...f, image_url:e.target.value }))}
            placeholder="è²¼ä¸åçé£çµï¼æé»ä¸æ¹æéä¸å³"
          />
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <input
              id="img-upload-input"
              type="file"
              accept="image/*"
              style={{ display:'none' }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  uploadImage(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            <button
              type="button"
              disabled={uploadingImage}
              style={{ padding:'8px 16px', background: uploadingImage ? '#e2e8f0' : '#f1f5f9', border:`1px solid ${C.border}`, borderRadius:8, cursor: uploadingImage ? 'not-allowed' : 'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6, color: uploadingImage ? C.textLight : C.text }}
              onClick={() => document.getElementById('img-upload-input').click()}
            >
              {uploadingImage ? 'â³ ä¸å³ä¸­...' : 'ð é¸æåçä¸å³'}
            </button>
            <span style={{ fontSize:12, color:C.textLight }}>åæ¥ååçæ ¼å¼ï¼ä¸é 5MB</span>
          </div>
          {uploadError && <div style={{ ...S.errorText, marginTop:6 }}>{uploadError}</div>}
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>ååæè¿°ï¼é¸å¡«ï¼</label>
          <textarea
            style={{ ...S.textarea, minHeight:140 }}
            value={productForm.description}
            onChange={e => setProductForm(f => ({ ...f, description:e.target.value }))}
            rows={8}
            placeholder={'ååä»ç´¹èè¦æ ¼èªªæ\nä¾å¦ï¼\nMooer GE200 æ¯ä¸æ¬¾å¤åè½ç¶åææå¨...\n\nè¦æ ¼ï¼\n- æææ¸éï¼55 ç¨®\n- å°ºå¯¸ï¼225 x 120 x 48 mm\n- ééï¼780g\n- é»æºï¼9V DC'}
          />
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setProductModal(null)}>åæ¶</button>
          <button style={savingProduct ? S.disabledBtn : S.confirmBtn} disabled={savingProduct} onClick={handleSaveProduct}>{savingProduct ? 'å²å­ä¸­...' : 'å²å­'}</button>
        </div>
      </div>
    </div>
  );

  const renderDeleteConfirm = () => deleteConfirm && (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && setDeleteConfirm(null)}>
      <div style={{ ...S.modalBox, maxWidth:400 }}>
        <div style={{ fontSize:40, textAlign:'center', marginBottom:12 }}>ðï¸</div>
        <h2 style={{ ...S.modalTitle, textAlign:'center' }}>ç¢ºå®è¦åªé¤æ­¤åååï¼</h2>
        <p style={{ color:C.textLight, textAlign:'center', marginBottom:24 }}>ã{deleteConfirm.name}ãå°è¢«æ°¸ä¹åªé¤ï¼æ­¤æä½ç¡æ³å¾©åã</p>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setDeleteConfirm(null)}>åæ¶</button>
          <button style={{ ...S.confirmBtn, background:C.danger }} onClick={() => handleDeleteProduct(deleteConfirm.id)}>ç¢ºèªåªé¤</button>
        </div>
      </div>
    </div>
  );

  const renderBrandModal = () => brandModal && (
    <div style={{ ...S.modal, zIndex:400 }} onClick={e => e.target===e.currentTarget && setBrandModal(false)}>
      <div style={{ ...S.modalBox, maxWidth:360 }}>
        <h2 style={S.modalTitle}>æ°å¢åç</h2>
        <div style={S.formGroup}>
          <label style={S.label}>åçåç¨±</label>
          <input
            style={S.input}
            value={newBrandName}
            onChange={e => setNewBrandName(e.target.value)}
            placeholder="è«è¼¸å¥åçåç¨±"
            onKeyDown={e => e.key==='Enter' && handleAddBrand()}
            autoFocus
          />
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => { setBrandModal(false); setNewBrandName(''); }}>åæ¶</button>
          <button style={addingBrand ? S.disabledBtn : S.confirmBtn} disabled={addingBrand} onClick={handleAddBrand}>{addingBrand ? 'æ°å¢ä¸­...' : 'æ°å¢'}</button>
        </div>
      </div>
    </div>
  );

  const renderOrderDeleteConfirm = () => orderDeleteConfirm && (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && setOrderDeleteConfirm(null)}>
      <div style={{ ...S.modalBox, maxWidth:400 }}>
        <h2 style={S.modalTitle}>ç¢ºèªåªé¤è¨å®</h2>
        <p style={{ fontSize:15, color:C.text, marginBottom:8 }}>
          ç¢ºå®è¦åªé¤è¨å® <strong>{orderDeleteConfirm.order_number}</strong> åï¼
        </p>
        <p style={{ fontSize:13, color:C.danger, marginBottom:24 }}>æ­¤æä½ç¡æ³å¾©åã</p>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setOrderDeleteConfirm(null)} disabled={deletingOrder}>åæ¶</button>
          <button style={{ ...S.confirmBtn, background:C.danger }} onClick={handleDeleteOrder} disabled={deletingOrder}>
            {deletingOrder ? 'åªé¤ä¸­...' : 'ç¢ºèªåªé¤'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrderEditModal = () => orderEditModal && (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && !savingOrder && setOrderEditModal(null)}>
      <div style={{ ...S.modalBox, maxWidth:600 }}>
        <h2 style={S.modalTitle}>ç·¨è¼¯è¨å® â {orderEditModal.order_number}</h2>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={S.formGroup}>
            <label style={S.label}>å®¢æ¶åç¨±</label>
            <input style={S.input} value={orderEditForm.customer_name} onChange={e => setOrderEditForm(f => ({ ...f, customer_name:e.target.value }))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>è¯çµ¡æ¹å¼</label>
            <input style={S.input} value={orderEditForm.contact} onChange={e => setOrderEditForm(f => ({ ...f, contact:e.target.value }))} />
          </div>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>è¨å®çæ</label>
          <select style={{ ...S.input, cursor:'pointer' }} value={orderEditForm.status} onChange={e => setOrderEditForm(f => ({ ...f, status:e.target.value }))}>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>åè¨»</label>
          <textarea style={S.textarea} value={orderEditForm.notes} onChange={e => setOrderEditForm(f => ({ ...f, notes:e.target.value }))} rows={2} />
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ ...S.label, marginBottom:8 }}>è¨å®æç´°</label>
          <table style={{ ...S.adminTable, marginBottom:4 }}>
            <thead><tr>
              {['åååç¨±','å®å¹','æ¸é','å°è¨',''].map(h => <th key={h} style={{ ...S.adminTh, background:'#f1f5f9', padding:'8px 10px' }}>{h}</th>)}
            </tr></thead>
            <tbody>{orderEditItems.map((item, idx) => (
              <tr key={item.id} style={item._deleted ? { opacity:0.4, textDecoration:'line-through' } : {}}>
                <td style={{ ...S.td, padding:'8px 10px' }}>{item.product_name}</td>
                <td style={{ ...S.td, padding:'8px 10px' }}>NT$ {item.unit_price?.toLocaleString()}</td>
                <td style={{ ...S.td, padding:'8px 10px' }}>
                  {!item._deleted ? (
                    <input
                      type="number" min="1"
                      style={{ width:60, padding:'4px 6px', borderRadius:6, border:`1px solid ${C.border}`, textAlign:'center', fontSize:13 }}
                      value={item._qty}
                      onChange={e => {
                        const v = Math.max(1, parseInt(e.target.value)||1);
                        setOrderEditItems(prev => prev.map((it,i) => i===idx ? { ...it, _qty:v } : it));
                      }}
                    />
                  ) : item.quantity}
                </td>
                <td style={{ ...S.td, padding:'8px 10px' }}>
                  NT$ {(item._deleted ? item.subtotal : item._qty * item.unit_price)?.toLocaleString()}
                </td>
                <td style={{ ...S.td, padding:'8px 10px' }}>
                  {!item._deleted ? (
                    <button style={{ background:'none', border:'none', color:C.danger, cursor:'pointer', fontSize:13 }}
                      onClick={() => setOrderEditItems(prev => prev.map((it,i) => i===idx ? { ...it, _deleted:true } : it))}>
                      ðï¸
                    </button>
                  ) : (
                    <button style={{ background:'none', border:'none', color:C.primary, cursor:'pointer', fontSize:13 }}
                      onClick={() => setOrderEditItems(prev => prev.map((it,i) => i===idx ? { ...it, _deleted:false } : it))}>
                      â©ï¸
                    </button>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ textAlign:'right', fontWeight:700, fontSize:14, color:C.primary, marginTop:4 }}>
            ç¸½éé¡ï¼NT$ {orderEditItems.filter(i => !i._deleted).reduce((s,i) => s + i._qty * i.unit_price, 0).toLocaleString()}
          </div>
        </div>

        {orderSaveError && <div style={{ color:C.danger, fontSize:13, marginBottom:12 }}>{orderSaveError}</div>}

        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setOrderEditModal(null)} disabled={savingOrder}>åæ¶</button>
          <button style={S.confirmBtn} onClick={handleSaveOrder} disabled={savingOrder}>
            {savingOrder ? 'å²å­ä¸­...' : 'å²å­'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminLoginModal = () => adminLoginModal && (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && (setAdminLoginModal(false), setAdminPasswordInput(''), setAdminPasswordError(false))}>
      <div style={{ ...S.modalBox, maxWidth:360 }}>
        <h2 style={S.modalTitle}>ç®¡çå¾å°ç»å¥</h2>
        <div style={S.formGroup}>
          <input
            type="password"
            style={{ ...S.input, ...(adminPasswordError ? { border:`2px solid ${C.danger}` } : {}) }}
            value={adminPasswordInput}
            onChange={e => { setAdminPasswordInput(e.target.value); setAdminPasswordError(false); }}
            placeholder="è«è¼¸å¥ç®¡çå¯ç¢¼"
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            autoFocus
            onFocus={e => { e.target.style.border = `2px solid ${C.primary}`; e.target.style.outline = 'none'; }}
            onBlur={e => { e.target.style.border = adminPasswordError ? `2px solid ${C.danger}` : `1px solid ${C.border}`; }}
          />
          {adminPasswordError && <div style={S.errorText}>å¯ç¢¼é¯èª¤</div>}
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => { setAdminLoginModal(false); setAdminPasswordInput(''); setAdminPasswordError(false); }}>åæ¶</button>
          <button style={S.confirmBtn} onClick={handleAdminLogin}>ç»å¥</button>
        </div>
      </div>
    </div>
  );

  const renderAdminLayout = () => {
    const navItems = [
      { id:'dashboard',   icon:'ð', label:'Dashboard' },
      { id:'products',    icon:'ð¦', label:'ååç®¡ç' },
      { id:'adminorders', icon:'ð', label:'è¨å®ç®¡ç' },
      { id:'banners',     icon:'ð¼', label:'æ©«å¹ç®¡ç' },
    ];
    const titles = { dashboard:'Dashboard ç¸½è¦½', products:'ååç®¡ç', adminorders:'è¨å®ç®¡ç', banners:'æ©«å¹ç®¡ç' };
    return (
      <div style={S.adminLayout}>
        {/* Left sidebar */}
        <div style={S.adminSidebar} className="admin-sidebar-hide">
          <div style={S.adminSidebarHeader}>
            <div style={S.adminSidebarTitle}>âï¸ AMC ç®¡çå¾å°</div>
            <div style={S.adminSidebarSubtitle}>å®ç¿æ¨å¨å¾å°ç®¡çç³»çµ±</div>
          </div>
          <nav style={S.adminSidebarNav}>
            {navItems.map(item => (
              <div key={item.id} style={adminNavItemStyle(adminPage===item.id)} onClick={() => setAdminPage(item.id)}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </nav>
          <div style={S.adminSidebarFooter}>
            <button style={S.adminBackBtn} onClick={goShop}>â åå°åå°</button>
            <button style={{ ...S.adminBackBtn, marginTop:10, color:'#94a3b8' }} onClick={handleAdminLogout}>ð ç»åº</button>
          </div>
        </div>
        {/* Right content */}
        <div style={S.adminContent} className="admin-content-full">
          <div style={S.adminTopBar}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <h2 style={S.adminPageTitle}>{titles[adminPage]}</h2>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {adminLoading && <div style={{ ...S.spinner, width:22, height:22, borderWidth:3 }} />}
              <button style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:13 }} onClick={goShop}>â åå°åå°</button>
              <button style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:13, color:C.textLight }} onClick={handleAdminLogout}>ð ç»åº</button>
            </div>
          </div>
          {/* Mobile tab nav */}
          <div style={{ display:'none' }} className="admin-sidebar-show">
            <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:'#1e293b' }}>
              {navItems.map(item => (
                <div key={item.id} style={{ flex:1, textAlign:'center', padding:'10px 4px', cursor:'pointer', fontSize:12, color: adminPage===item.id ? '#60a5fa' : '#94a3b8', borderBottom: adminPage===item.id ? '2px solid #3b82f6' : '2px solid transparent', fontWeight: adminPage===item.id ? 600 : 400 }} onClick={() => setAdminPage(item.id)}>
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          </div>
          <div style={S.adminBody}>
            {adminPage==='dashboard'   && renderDashboard()}
            {adminPage==='products'    && renderAdminProducts()}
            {adminPage==='adminorders' && renderAdminOrders()}
            {adminPage==='banners'     && renderAdminBanners()}
          </div>
        </div>
      </div>
    );
  };

  // âââââââââââââââââââââââââââââââââââââââââââââââââââ
  // MAIN RENDER
  // âââââââââââââââââââââââââââââââââââââââââââââââââââ
  return (
    <div style={S.app}>
      {page === 'admin' && isAdminLoggedIn ? (
        <>
          {renderAdminLayout()}
          {renderProductModal()}
          {renderDeleteConfirm()}
          {renderBrandModal()}
          {renderOrderDeleteConfirm()}
          {renderOrderEditModal()}
        </>
      ) : (
        <>
          {renderNav()}
          {(page === 'shop' || (page === 'admin' && !isAdminLoggedIn)) && !selectedProductId && renderShop()}
          {page === 'shop' && selectedProductId && renderProductDetail()}
          {page === 'confirm' && renderConfirm()}
          {page === 'orders'  && renderOrders()}
          {/* ââ Footer ââ */}
          <footer style={{ borderTop:'1px solid #e5e5e5', background:'#f5f5f5', padding:'20px 32px', textAlign:'center' }} className="no-print">
            <p style={{ margin:0, fontSize:13, color:'#888', letterSpacing:'0.3px' }}>
              å®ç¿æ¨å¨ Alliance Music Company &copy; {new Date().getFullYear()}
            </p>
          </footer>
          {renderCart()}
          {renderModal()}
          {renderAdminLoginModal()}
        </>
      )}
    </div>
  );
}
