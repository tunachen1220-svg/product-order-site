 import React, { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://scouakepoanddfkemwaf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wpBcNOGaHbrrSxLO_7E-bQ_QHOqvgIi';
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const CATEGORIES = ['全部','吉他弦','背帶','Pick撥片','琴袋琴盒','調音器','效果器','琴架','其他配件'];
const PROD_CATS  = ['吉他弦','背帶','Pick撥片','琴袋琴盒','調音器','效果器','琴架','其他配件'];
const ORDER_STATUSES = ['待確認','已確認','已完成','已取消'];

// ─── Helpers ───
function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const seq = String(Math.floor(Math.random()*999)+1).padStart(3,'0');
  return `ORD-${y}${m}${day}-${seq}`;
}

function formatDate(iso) {
  if (!iso) return '—';
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

// ─── Colors ───
const C = {
  primary: '#2563eb', primaryHover: '#1d4ed8',
  danger: '#ef4444', bg: '#f8fafc', card: '#fff',
  border: '#e2e8f0', text: '#1e293b', textLight: '#64748b',
  success: '#16a34a', warning: '#f59e0b'
};

// ─── Status badge helpers ───
function orderStatusStyle(status) {
  const clr = { '待確認':'#f97316','已確認':'#3b82f6','已完成':'#16a34a','已取消':'#ef4444' }[status] || '#94a3b8';
  return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, background: clr+'22', color: clr };
}
function productStatusStyle(status) {
  if (status === '上架中') return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, background:'#16a34a22', color:'#16a34a' };
  return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, background:'#94a3b822', color:'#94a3b8' };
}

// ─── Styles ───
const S = {
  app: { fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', color:C.text, background:C.bg, minHeight:'100vh' },
  // Nav
  nav: { background:'#fff', borderBottom:`1px solid ${C.border}`, padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 3px rgba(0,0,0,.05)' },
  navTitle: { fontSize:22, fontWeight:700, color:C.primary, margin:0, cursor:'pointer' },
  navRight: { display:'flex', gap:12, alignItems:'center' },
  navBtn: { background:'none', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:6 },
  navAdminBtn: { background:'#1e293b', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:6 },
  badge: { background:C.primary, color:'#fff', borderRadius:'50%', width:20, height:20, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 },
  container: { maxWidth:1200, margin:'0 auto', padding:'20px 16px' },
  // Filters
  filterBar: { display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' },
  select: { padding:'8px 12px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:14, outline:'none', minWidth:140, background:'#fff' },
  // Product grid
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 },
  card: { background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:'hidden', cursor:'pointer', transition:'box-shadow .15s', display:'flex', flexDirection:'column' },
  cardImg: { width:'100%', height:180, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', color:C.textLight, fontSize:14 },
  cardBody: { padding:16, flex:1, display:'flex', flexDirection:'column' },
  cardName: { fontSize:16, fontWeight:600, marginBottom:4 },
  cardBrand: { fontSize:13, color:C.textLight, marginBottom:4 },
  cardSku: { fontSize:12, color:C.textLight, marginBottom:8 },
  cardPrice: { fontSize:18, fontWeight:700, color:C.primary, marginBottom:12, flex:1 },
  cardActions: { display:'flex', gap:8, alignItems:'center' },
  qtyInput: { width:56, padding:'6px 8px', borderRadius:6, border:`1px solid ${C.border}`, textAlign:'center', fontSize:14 },
  addBtn: { flex:1, padding:'8px 0', background:C.primary, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 },
  detailBtn: { width:'100%', padding:'7px 0', background:'#f1f5f9', color:C.primary, border:`1px solid ${C.primary}`, borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, marginTop:8 },
  // Cart sidebar
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:200 },
  sidebar: { position:'fixed', top:0, right:0, bottom:0, width:400, maxWidth:'90vw', background:'#fff', zIndex:201, display:'flex', flexDirection:'column', boxShadow:'-4px 0 24px rgba(0,0,0,.1)' },
  sidebarHeader: { padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },
  sidebarBody: { flex:1, overflowY:'auto', padding:20 },
  sidebarFooter: { padding:'16px 20px', borderTop:`1px solid ${C.border}` },
  cartItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:`1px solid ${C.border}` },
  cartItemInfo: { flex:1 },
  cartItemName: { fontWeight:600, fontSize:14, marginBottom:4 },
  cartItemPrice: { fontSize:13, color:C.textLight },
  cartQtyGroup: { display:'flex', alignItems:'center', gap:6 },
  cartQtyBtn: { width:28, height:28, borderRadius:6, border:`1px solid ${C.border}`, background:'#fff', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' },
  cartQtyNum: { width:32, textAlign:'center', fontSize:14, fontWeight:600 },
  removeBtn: { background:'none', border:'none', color:C.danger, cursor:'pointer', fontSize:13, marginLeft:8 },
  totalRow: { display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:700, marginBottom:16 },
  submitBtn: { width:'100%', padding:'12px 0', background:C.primary, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:16 },
  disabledBtn: { width:'100%', padding:'12px 0', background:'#94a3b8', color:'#fff', border:'none', borderRadius:8, cursor:'not-allowed', fontWeight:700, fontSize:16 },
  // Modal
  modal: { position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, background:'rgba(0,0,0,.5)' },
  modalBox: { background:'#fff', borderRadius:16, padding:32, width:'90%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', position:'relative' },
  modalTitle: { fontSize:20, fontWeight:700, marginBottom:20 },
  formGroup: { marginBottom:16 },
  label: { display:'block', fontWeight:600, marginBottom:6, fontSize:14 },
  input: { width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:14, outline:'none', boxSizing:'border-box', background:'#fff' },
  inputError: { width:'100%', padding:'10px 12px', borderRadius:8, border:`2px solid ${C.danger}`, fontSize:14, outline:'none', boxSizing:'border-box', background:'#fff' },
  errorText: { color:C.danger, fontSize:12, marginTop:4 },
  textarea: { width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:14, outline:'none', minHeight:60, resize:'vertical', boxSizing:'border-box' },
  modalActions: { display:'flex', gap:12, marginTop:24 },
  cancelBtn: { flex:1, padding:'10px 0', background:'#f1f5f9', color:C.text, border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 },
  confirmBtn: { flex:1, padding:'10px 0', background:C.primary, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 },
  // Confirm page
  confirmPage: { textAlign:'center', maxWidth:600, margin:'0 auto', padding:40 },
  checkIcon: { fontSize:48, color:C.success, marginBottom:12 },
  confirmTitle: { fontSize:24, fontWeight:700, marginBottom:8, color:C.success },
  confirmOrderNum: { fontSize:16, color:C.textLight, marginBottom:24 },
  infoBox: { background:'#f8fafc', borderRadius:12, padding:20, marginBottom:24, textAlign:'left' },
  infoRow: { display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14 },
  table: { width:'100%', borderCollapse:'collapse', marginBottom:16, textAlign:'left' },
  th: { padding:'10px 12px', background:'#f1f5f9', fontWeight:600, fontSize:13, borderBottom:`2px solid ${C.border}` },
  td: { padding:'10px 12px', borderBottom:`1px solid ${C.border}`, fontSize:14 },
  continueBtn: { padding:'12px 32px', background:C.primary, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:16, marginRight:12 },
  printBtn: { padding:'12px 32px', background:'#f1f5f9', color:C.text, border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 },
  // Orders page
  orderCard: { background:'#fff', borderRadius:12, border:`1px solid ${C.border}`, marginBottom:16, overflow:'hidden' },
  orderHeader: { padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' },
  orderHeaderLeft: { display:'flex', flexDirection:'column', gap:4 },
  orderNum: { fontWeight:700, fontSize:15 },
  orderDate: { fontSize:13, color:C.textLight },
  orderAmount: { fontWeight:700, fontSize:16, color:C.primary },
  orderDetail: { padding:'0 20px 16px', borderTop:`1px solid ${C.border}` },
  // Loading & error
  center: { textAlign:'center', padding:60 },
  spinner: { display:'inline-block', width:40, height:40, border:'4px solid #e2e8f0', borderTopColor:C.primary, borderRadius:'50%', animation:'spin 1s linear infinite' },
  retryBtn: { padding:'10px 24px', background:C.primary, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, marginTop:12 },
  empty: { textAlign:'center', padding:60, color:C.textLight, fontSize:16 },

  // ── Admin ──
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

  // ── Product Detail ──
  detailContainer: { maxWidth:1200, margin:'0 auto', padding:'20px 16px' },
  detailBack: { display:'inline-flex', alignItems:'center', gap:6, color:C.primary, background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:500, marginBottom:20, padding:0, textDecoration:'none' },
  detailLayout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:36, marginBottom:32 },
  detailImgBox: { background:'#f1f5f9', borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden', minHeight:340, display:'flex', alignItems:'center', justifyContent:'center' },
  detailInfoBox: { display:'flex', flexDirection:'column', justifyContent:'flex-start' },
  detailName: { fontSize:28, fontWeight:800, marginBottom:8, color:C.text, lineHeight:1.3 },
  detailBrand: { fontSize:15, color:C.textLight, marginBottom:6 },
  detailSku: { fontSize:13, color:C.textLight, marginBottom:14 },
  detailPrice: { fontSize:32, fontWeight:800, color:C.primary, marginBottom:18 },
  detailTagRow: { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:20 },
  detailCatTag: { display:'inline-block', padding:'4px 14px', borderRadius:20, background:C.primary+'18', color:C.primary, fontSize:13, fontWeight:600 },
  detailDivider: { borderTop:`1px solid ${C.border}`, margin:'20px 0' },
  detailCartRow: { display:'flex', gap:12, alignItems:'center' },
  detailQtyInput: { width:68, padding:'11px 8px', borderRadius:8, border:`1px solid ${C.border}`, textAlign:'center', fontSize:16, outline:'none' },
  detailAddBtn: { flex:1, padding:'12px 0', background:C.primary, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:16, transition:'background .2s' },
  detailAddedBtn: { flex:1, padding:'12px 0', background:C.success, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:16 },
  detailDescSection: { background:'#fff', borderRadius:12, border:`1px solid ${C.border}`, padding:28 },
  detailDescTitle: { fontSize:18, fontWeight:700, marginBottom:16, color:C.text },
  detailDescText: { fontSize:15, lineHeight:'1.9', color:'#374151', whiteSpace:'pre-wrap' },
  detailDescEmpty: { color:C.textLight, fontSize:14, fontStyle:'italic' },
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

// Keyframes injection
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
@media print { .no-print { display: none !important; } }
@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr !important; }
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

// ─── App ───
export default function App() {
  // ── Frontend state ──
  const [page, setPage] = useState('shop'); // shop | confirm | orders | admin
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [brandFilter, setBrandFilter] = useState('全部');
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

  // ── Detail page state ──
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailAddedMsg, setDetailAddedMsg] = useState(false);

  // ── Admin state ──
  const [adminPage, setAdminPage] = useState('dashboard');
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminBrands, setAdminBrands] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | 'new' | {product}
  const [productForm, setProductForm] = useState({ name:'', brand_id:'', sku:'', price:0, category:'吉他弦', status:'上架中', image_url:'', description:'' });
  const [productFormErrors, setProductFormErrors] = useState({});
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [brandModal, setBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('全部');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('全部');
  const [expandedAdminOrder, setExpandedAdminOrder] = useState(null);

  // ── Frontend data loading ──
  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [prods, brs] = await Promise.all([
        apiFetch('/rest/v1/products?select=*,brands(name)&status=eq.上架中'),
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
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Admin data loading ──
  const loadAdminProducts = useCallback(async () => {
    try {
      const [prods, brs] = await Promise.all([
        apiFetch('/rest/v1/products?select=*,brands(name)&order=created_at.desc'),
        apiFetch('/rest/v1/brands?select=id,name&order=name.asc')
      ]);
      setAdminProducts(prods); setAdminBrands(brs);
    } catch (e) { alert('載入商品失敗：' + e.message); }
  }, []);

  const loadAdminOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/rest/v1/orders?select=*,order_items(*)&order=created_at.desc');
      setAdminOrders(data);
    } catch (e) { alert('載入訂單失敗：' + e.message); }
  }, []);

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true);
    try { await Promise.all([loadAdminProducts(), loadAdminOrders()]); }
    finally { setAdminLoading(false); }
  }, [loadAdminProducts, loadAdminOrders]);

  useEffect(() => {
    if (page === 'admin') loadAdminData();
  }, [page, loadAdminData]);

  // ── Frontend: filtered products ──
  const filtered = products.filter(p => {
    if (categoryFilter !== '全部' && p.category !== categoryFilter) return false;
    if (brandFilter !== '全部' && String(p.brand_id) !== brandFilter) return false;
    return true;
  });

  const cartCount = cart.reduce((s,c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s,c) => s + c.quantity * c.price, 0);

  function addToCart(product) {
    const qty = quantities[product.id] || 1;
    setCart(prev => {
      const exist = prev.find(c => c.id === product.id);
      if (exist) return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: qty }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  }

  function addToCartWithQty(product, qty) {
    setCart(prev => {
      const exist = prev.find(c => c.id === product.id);
      if (exist) return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: qty }];
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
  }

  async function handleSubmitOrder() {
    const errors = {};
    if (!formData.name.trim()) errors.name = '請輸入姓名';
    if (!formData.contact.trim()) errors.contact = '請輸入聯絡方式';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const orderNum = generateOrderNumber();
      const [order] = await apiFetch('/rest/v1/orders', { method:'POST', body: JSON.stringify({ order_number:orderNum, customer_name:formData.name.trim(), contact:formData.contact.trim(), notes:formData.notes.trim()||null, total_amount:cartTotal }) });
      await apiFetch('/rest/v1/order_items', { method:'POST', body: JSON.stringify(cart.map(c => ({ order_id:order.id, product_id:c.id, product_name:c.name, quantity:c.quantity, unit_price:c.price, subtotal:c.quantity*c.price }))) });
      setConfirmedOrder({ ...order, items: cart, orderTime: new Date().toISOString() });
      setCart([]); setModalOpen(false); setCartOpen(false);
      setFormData({ name:'', contact:'', notes:'' }); setFormErrors({});
      setPage('confirm');
    } catch (e) { alert('訂單送出失敗：' + e.message + '\n購物車內容已保留，請再試一次。'); }
    finally { setSubmitting(false); }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    try { const data = await apiFetch('/rest/v1/orders?select=*,order_items(*)&order=created_at.desc'); setOrders(data); }
    catch (e) { alert('載入訂單失敗：' + e.message); }
    finally { setOrdersLoading(false); }
  }

  // ── Admin: CRUD ──
  function openNewProduct() {
    setProductForm({ name:'', brand_id:'', sku:'', price:0, category:'吉他弦', status:'上架中', image_url:'', description:'' });
    setProductFormErrors({});
    setProductModal('new');
  }
  function openEditProduct(p) {
    setProductForm({ name:p.name||'', brand_id:String(p.brand_id||''), sku:p.sku||'', price:p.price||0, category:p.category||'吉他弦', status:p.status||'上架中', image_url:p.image_url||'', description:p.description||'' });
    setProductFormErrors({});
    setProductModal(p);
  }

  async function handleSaveProduct() {
    const errors = {};
    if (!productForm.name.trim()) errors.name = '商品名稱為必填';
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
    } catch (e) { alert('儲存失敗：' + e.message); }
    finally { setSavingProduct(false); }
  }

  async function handleDeleteProduct(id) {
    try {
      await apiFetch(`/rest/v1/products?id=eq.${id}`, { method:'DELETE' });
      setDeleteConfirm(null);
      await loadAdminProducts();
      loadData();
    } catch (e) { alert('刪除失敗：' + e.message); }
  }

  async function handleToggleStatus(product) {
    const newStatus = product.status === '上架中' ? '已下架' : '上架中';
    try {
      await apiFetch(`/rest/v1/products?id=eq.${product.id}`, { method:'PATCH', body:JSON.stringify({ status:newStatus }) });
      await loadAdminProducts();
      loadData();
    } catch (e) { alert('更新失敗：' + e.message); }
  }

  async function handleUpdateOrderStatus(id, status) {
    try {
      await apiFetch(`/rest/v1/orders?id=eq.${id}`, { method:'PATCH', body:JSON.stringify({ status }) });
      await loadAdminOrders();
    } catch (e) { alert('更新失敗：' + e.message); }
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
    } catch (e) { alert('新增品牌失敗：' + e.message); }
    finally { setAddingBrand(false); }
  }

  // ── Admin: filtered data ──
  const filteredAdminProducts = adminProducts.filter(p => {
    if (productStatusFilter !== '全部' && p.status !== productStatusFilter) return false;
    if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
    return true;
  });
  const filteredAdminOrders = adminOrders.filter(o => {
    if (orderStatusFilter !== '全部' && (o.status||'待確認') !== orderStatusFilter) return false;
    if (orderSearch && !o.order_number?.includes(orderSearch) && !o.customer_name?.includes(orderSearch)) return false;
    return true;
  });
  const totalRevenue = adminOrders.reduce((s,o) => s + (o.total_amount||0), 0);
  const statusDist = ORDER_STATUSES.reduce((acc,s) => { acc[s] = adminOrders.filter(o => (o.status||'待確認') === s).length; return acc; }, {});

  // ═══════════════════════════════════════════════════
  // RENDER: FRONTEND
  // ═══════════════════════════════════════════════════

  const renderNav = () => (
    <nav style={S.nav} className="no-print">
      <h1 style={S.navTitle} onClick={goShop} role="button" tabIndex={0}>商品目錄</h1>
      <div style={S.navRight}>
        <button style={S.navBtn} onClick={() => { setPage('orders'); setSelectedProductId(null); loadOrders(); }}>我的訂單</button>
        <button style={S.navBtn} onClick={() => setCartOpen(true)}>
          🛒 {cartCount > 0 && <span style={S.badge}>{cartCount}</span>}
        </button>
        <button style={S.navAdminBtn} onClick={() => { setPage('admin'); setSelectedProductId(null); }} title="管理後台">⚙️ 管理後台</button>
      </div>
    </nav>
  );

  const renderShop = () => (
    <div style={S.container}>
      <div style={S.filterBar} className="no-print">
        <select style={S.select} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === '全部' ? '所有類別' : c}</option>)}
        </select>
        <select style={S.select} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          <option value="全部">所有品牌</option>
          {brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
        </select>
      </div>
      {loading ? (
        <div style={S.center}><div style={S.spinner} /><p>載入商品中...</p></div>
      ) : error ? (
        <div style={S.center}><p style={{ color:C.danger }}>載入失敗：{error}</p><button style={S.retryBtn} onClick={loadData}>重試</button></div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>沒有符合條件的商品</div>
      ) : (
        <div style={S.grid} className="grid-responsive">
          {filtered.map(p => (
            <div key={p.id} style={S.card} onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.10)'} onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div onClick={() => openDetail(p.id)} style={{ cursor:'pointer' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
                ) : (
                  <div style={S.cardImg}>暫無圖片</div>
                )}
              </div>
              <div style={S.cardBody}>
                <div style={S.cardName} onClick={() => openDetail(p.id)}>{p.name}</div>
                <div style={S.cardBrand}>{p.brands?.name || '—'}</div>
                <div style={S.cardSku}>貨號：{p.sku || '—'}</div>
                <div style={S.cardPrice}>{p.price > 0 ? `NT$ ${p.price.toLocaleString()}` : '洽詢價格'}</div>
                <div style={S.cardActions}>
                  <input type="number" min="1" value={quantities[p.id]||1} onChange={e => setQuantities(prev => ({ ...prev, [p.id]: Math.max(1, parseInt(e.target.value)||1) }))} style={S.qtyInput} onClick={e => e.stopPropagation()} />
                  <button style={S.addBtn} onClick={e => { e.stopPropagation(); addToCart(p); }}>加入購物車</button>
                </div>
                <button style={S.detailBtn} onClick={() => openDetail(p.id)}>查看詳情 →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return (
      <div style={S.container}>
        <button style={S.detailBack} onClick={goShop}>← 返回商品目錄</button>
        <div style={S.empty}>找不到商品，可能已下架</div>
      </div>
    );

    function handleDetailAddToCart() {
      addToCartWithQty(product, detailQty);
      setDetailAddedMsg(true);
      setTimeout(() => setDetailAddedMsg(false), 1500);
    }

    return (
      <div style={S.detailContainer}>
        <button style={S.detailBack} onClick={goShop}>← 返回商品目錄</button>

        <div style={S.detailLayout} className="detail-layout">
          {/* Left: Image */}
          <div style={S.detailImgBox}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', minHeight:340 }} />
            ) : (
              <span style={{ color:C.textLight, fontSize:16 }}>暫無圖片</span>
            )}
          </div>

          {/* Right: Info */}
          <div style={S.detailInfoBox}>
            <h1 style={S.detailName}>{product.name}</h1>
            {product.brands?.name && <div style={S.detailBrand}>{product.brands.name}</div>}
            {product.sku && <div style={S.detailSku}>貨號：{product.sku}</div>}
            <div style={S.detailPrice}>
              {product.price > 0 ? `NT$ ${product.price.toLocaleString()}` : '洽詢價格'}
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
                {detailAddedMsg ? '已加入購物車 ✓' : '加入購物車'}
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={S.detailDescSection}>
          <h2 style={S.detailDescTitle}>商品介紹</h2>
          {product.description ? (
            <div style={S.detailDescText}>{product.description}</div>
          ) : (
            <div style={S.detailDescEmpty}>暫無商品描述</div>
          )}
        </div>
      </div>
    );
  };

  const renderCart = () => cartOpen && (
    <>
      <div style={S.overlay} onClick={() => setCartOpen(false)} />
      <div style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <h2 style={{ margin:0, fontSize:18 }}>購物車</h2>
          <button onClick={() => setCartOpen(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={S.sidebarBody}>
          {cart.length === 0 ? <div style={S.empty}>購物車是空的</div> : cart.map(item => (
            <div key={item.id} style={S.cartItem}>
              <div style={S.cartItemInfo}>
                <div style={S.cartItemName}>{item.name}</div>
                <div style={S.cartItemPrice}>NT$ {item.price.toLocaleString()} × {item.quantity} = NT$ {(item.price*item.quantity).toLocaleString()}</div>
              </div>
              <div style={S.cartQtyGroup}>
                <button style={S.cartQtyBtn} onClick={() => updateCartQty(item.id,-1)}>−</button>
                <span style={S.cartQtyNum}>{item.quantity}</span>
                <button style={S.cartQtyBtn} onClick={() => updateCartQty(item.id,1)}>+</button>
                <button style={S.removeBtn} onClick={() => removeFromCart(item.id)}>刪除</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={S.sidebarFooter}>
            <div style={S.totalRow}><span>總計</span><span>NT$ {cartTotal.toLocaleString()}</span></div>
            <button style={S.submitBtn} onClick={() => setModalOpen(true)}>送出訂單</button>
          </div>
        )}
      </div>
    </>
  );

  const renderModal = () => modalOpen && (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && setModalOpen(false)}>
      <div style={S.modalBox}>
        <h2 style={S.modalTitle}>訂購資訊</h2>
        <div style={S.formGroup}>
          <label style={S.label}>姓名 *</label>
          <input style={formErrors.name ? S.inputError : S.input} value={formData.name} onChange={e => { setFormData(f => ({ ...f, name:e.target.value })); setFormErrors(fe => ({ ...fe, name:'' })); }} placeholder="請輸入姓名" />
          {formErrors.name && <div style={S.errorText}>{formErrors.name}</div>}
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>聯絡方式 *</label>
          <input style={formErrors.contact ? S.inputError : S.input} value={formData.contact} onChange={e => { setFormData(f => ({ ...f, contact:e.target.value })); setFormErrors(fe => ({ ...fe, contact:'' })); }} placeholder="手機或 LINE ID" />
          {formErrors.contact && <div style={S.errorText}>{formErrors.contact}</div>}
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>備註</label>
          <textarea style={S.textarea} value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes:e.target.value }))} placeholder="選填" />
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setModalOpen(false)}>返回修改</button>
          <button style={submitting ? S.disabledBtn : S.confirmBtn} disabled={submitting} onClick={handleSubmitOrder}>{submitting ? '送出中...' : '確認送出'}</button>
        </div>
      </div>
    </div>
  );

  const renderConfirm = () => confirmedOrder && (
    <div style={S.confirmPage}>
      <div style={S.checkIcon}>✅</div>
      <h2 style={S.confirmTitle}>訂單已送出</h2>
      <div style={S.confirmOrderNum}>訂單編號：{confirmedOrder.order_number}</div>
      <div style={S.infoBox}>
        <div style={S.infoRow}><span>訂購者</span><span>{confirmedOrder.customer_name}</span></div>
        <div style={S.infoRow}><span>聯絡方式</span><span>{confirmedOrder.contact}</span></div>
        {confirmedOrder.notes && <div style={S.infoRow}><span>備註</span><span>{confirmedOrder.notes}</span></div>}
        <div style={S.infoRow}><span>下單時間</span><span>{formatDate(confirmedOrder.orderTime)}</span></div>
      </div>
      <table style={S.table}>
        <thead><tr><th style={S.th}>商品</th><th style={{...S.th,textAlign:'center'}}>數量</th><th style={{...S.th,textAlign:'right'}}>單價</th><th style={{...S.th,textAlign:'right'}}>小計</th></tr></thead>
        <tbody>{confirmedOrder.items.map((item,i) => (<tr key={i}><td style={S.td}>{item.name}</td><td style={{...S.td,textAlign:'center'}}>{item.quantity}</td><td style={{...S.td,textAlign:'right'}}>NT$ {item.price.toLocaleString()}</td><td style={{...S.td,textAlign:'right'}}>NT$ {(item.price*item.quantity).toLocaleString()}</td></tr>))}</tbody>
        <tfoot><tr><td colSpan={3} style={{...S.td,fontWeight:700,textAlign:'right'}}>總計</td><td style={{...S.td,fontWeight:700,textAlign:'right',color:C.primary}}>NT$ {confirmedOrder.total_amount.toLocaleString()}</td></tr></tfoot>
      </table>
      <div className="no-print">
        <button style={S.continueBtn} onClick={goShop}>繼續選購</button>
        <button style={S.printBtn} onClick={() => window.print()}>列印訂單</button>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div style={S.container}>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>我的訂單</h2>
      {ordersLoading ? (
        <div style={S.center}><div style={S.spinner} /><p>載入訂單中...</p></div>
      ) : orders.length === 0 ? (
        <div style={S.empty}>尚無訂單記錄</div>
      ) : orders.map(o => (
        <div key={o.id} style={S.orderCard}>
          <div style={S.orderHeader} onClick={() => setExpandedOrder(expandedOrder===o.id ? null : o.id)}>
            <div style={S.orderHeaderLeft}>
              <span style={S.orderNum}>{o.order_number}</span>
              <span style={S.orderDate}>{formatDate(o.created_at)} · {o.customer_name}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={S.orderAmount}>NT$ {o.total_amount?.toLocaleString()}</span>
              <span>{expandedOrder===o.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expandedOrder===o.id && o.order_items && (
            <div style={S.orderDetail}>
              <table style={{...S.table,marginTop:12}}>
                <thead><tr><th style={S.th}>商品</th><th style={{...S.th,textAlign:'center'}}>數量</th><th style={{...S.th,textAlign:'right'}}>單價</th><th style={{...S.th,textAlign:'right'}}>小計</th></tr></thead>
                <tbody>{o.order_items.map((item,i) => (<tr key={i}><td style={S.td}>{item.product_name}</td><td style={{...S.td,textAlign:'center'}}>{item.quantity}</td><td style={{...S.td,textAlign:'right'}}>NT$ {item.unit_price?.toLocaleString()}</td><td style={{...S.td,textAlign:'right'}}>NT$ {item.subtotal?.toLocaleString()}</td></tr>))}</tbody>
              </table>
              {o.contact && <div style={{ fontSize:13,color:C.textLight,marginTop:8 }}>聯絡方式：{o.contact}</div>}
              {o.notes && <div style={{ fontSize:13,color:C.textLight,marginTop:4 }}>備註：{o.notes}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════
  // RENDER: ADMIN
  // ═══════════════════════════════════════════════════

  const renderDashboard = () => (
    <div>
      <div style={S.statsGrid} className="stats-grid-responsive">
        {[
          { icon:'📦', label:'商品總數', value: adminProducts.length },
          { icon:'✅', label:'上架中商品', value: adminProducts.filter(p => p.status==='上架中').length },
          { icon:'🛒', label:'訂單總數', value: adminOrders.length },
          { icon:'💰', label:'總營收', value: `NT$ ${totalRevenue.toLocaleString()}` },
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
          <div style={S.adminCardTitle}>最近 10 筆訂單</div>
          {adminOrders.length === 0 ? (
            <div style={{ color:C.textLight, fontSize:14 }}>暫無訂單</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={S.adminTable}>
                <thead><tr>
                  {['訂單編號','客戶名稱','金額','狀態','時間'].map(h => <th key={h} style={S.adminTh}>{h}</th>)}
                </tr></thead>
                <tbody>{adminOrders.slice(0,10).map((o,i) => (
                  <tr key={o.id}>
                    <td style={adminTd(i%2===1)}>{o.order_number}</td>
                    <td style={adminTd(i%2===1)}>{o.customer_name}</td>
                    <td style={adminTd(i%2===1)}>NT$ {o.total_amount?.toLocaleString()}</td>
                    <td style={adminTd(i%2===1)}><span style={orderStatusStyle(o.status||'待確認')}>{o.status||'待確認'}</span></td>
                    <td style={adminTd(i%2===1)}>{formatDate(o.created_at)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
        <div style={S.adminCard}>
          <div style={S.adminCardTitle}>訂單狀態分佈</div>
          {ORDER_STATUSES.map(s => {
            const count = statusDist[s] || 0;
            const pct = adminOrders.length > 0 ? Math.round(count/adminOrders.length*100) : 0;
            const clr = { '待確認':'#f97316','已確認':'#3b82f6','已完成':'#16a34a','已取消':'#ef4444' }[s];
            return (
              <div key={s} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span>{s}</span><span style={{ fontWeight:600, color:clr }}>{count} 筆</span>
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

  const renderAdminProducts = () => (
    <div>
      <div style={S.toolbar}>
        <button style={S.addProductBtn} onClick={openNewProduct}>＋ 新增商品</button>
        <input style={S.searchInput} placeholder="搜尋商品名稱..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
        <select style={S.select} value={productStatusFilter} onChange={e => setProductStatusFilter(e.target.value)}>
          <option value="全部">全部狀態</option>
          <option value="上架中">上架中</option>
          <option value="已下架">已下架</option>
        </select>
        <button style={iconBtn()} onClick={loadAdminProducts}>🔄 重新整理</button>
      </div>
      <div style={S.adminCard}>
        {filteredAdminProducts.length === 0 ? (
          <div style={{ color:C.textLight, fontSize:14, padding:20 }}>沒有符合條件的商品</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={S.adminTable}>
              <thead><tr>
                {['商品名稱','品牌','貨號','價格','類別','狀態','操作'].map(h => <th key={h} style={S.adminTh}>{h}</th>)}
              </tr></thead>
              <tbody>{filteredAdminProducts.map((p,i) => (
                <tr key={p.id}>
                  <td style={adminTd(i%2===1)}><strong>{p.name}</strong></td>
                  <td style={adminTd(i%2===1)}>{p.brands?.name || '—'}</td>
                  <td style={adminTd(i%2===1)}>{p.sku || '—'}</td>
                  <td style={adminTd(i%2===1)}>{p.price > 0 ? `NT$ ${p.price.toLocaleString()}` : '洽詢'}</td>
                  <td style={adminTd(i%2===1)}>{p.category || '—'}</td>
                  <td style={adminTd(i%2===1)}><span style={productStatusStyle(p.status)}>{p.status}</span></td>
                  <td style={adminTd(i%2===1)}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <button style={iconBtn()} onClick={() => openEditProduct(p)}>✏️ 編輯</button>
                      <button style={iconBtn(p.status==='上架中' ? '#f97316' : '#16a34a')} onClick={() => handleToggleStatus(p)}>
                        {p.status==='上架中' ? '📤 下架' : '📥 上架'}
                      </button>
                      <button style={S.dangerIconBtn} onClick={() => setDeleteConfirm(p)}>🗑 刪除</button>
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
        <input style={S.searchInput} placeholder="搜尋訂單編號或客戶名稱..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
        <select style={S.select} value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
          <option value="全部">全部狀態</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button style={iconBtn()} onClick={loadAdminOrders}>🔄 重新整理</button>
      </div>
      <div style={S.adminCard}>
        {filteredAdminOrders.length === 0 ? (
          <div style={{ color:C.textLight, fontSize:14, padding:20 }}>沒有符合條件的訂單</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={S.adminTable}>
              <thead><tr>
                {['訂單編號','客戶名稱','聯絡方式','商品數','總金額','狀態','下單時間','操作'].map(h => <th key={h} style={S.adminTh}>{h}</th>)}
              </tr></thead>
              <tbody>{filteredAdminOrders.map((o,i) => [
                <tr key={o.id}>
                  <td style={adminTd(i%2===1)}>{o.order_number}</td>
                  <td style={adminTd(i%2===1)}>{o.customer_name}</td>
                  <td style={adminTd(i%2===1)}>{o.contact || '—'}</td>
                  <td style={adminTd(i%2===1)}>{o.order_items?.length || 0} $��</td>
                  <td style={adminTd(i%2===1)}>NT$ {o.total_amount?.toLocaleString()}</td>
                  <td style={adminTd(i%2===1)}><span style={orderStatusStyle(o.status||'待確認')}>{o.status||'待確認'}</span></td>
                  <td style={adminTd(i%2===1)}>{formatDate(o.created_at)}</td>
                  <td style={adminTd(i%2===1)}>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <button style={iconBtn()} onClick={() => setExpandedAdminOrder(expandedAdminOrder===o.id ? null : o.id)}>
                        {expandedAdminOrder===o.id ? '▲ 收起' : '▼ 明細'}
                      </button>
                      <select
                        style={{ padding:'4px 8px', borderRadius:6, border:`1px solid ${C.border}`, fontSize:12, outline:'none', background:'#fff', cursor:'pointer' }}
                        value={o.status||'待確認'}
                        onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>,
                expandedAdminOrder===o.id && (
                  <tr key={`${o.id}-detail`}>
                    <td colSpan={8} style={{ background:'#f1f5f9', padding:'0 16px 16px' }}>
                      <div style={{ paddingTop:12 }}>
                        <table style={{ ...S.adminTable, marginBottom:8 }}>
                          <thead><tr>
                            {['商品名稱','數量','單價','小計'].map(h => <th key={h} style={{ ...S.adminTh, background:'#e2e8f0' }}>{h}</th>)}
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
                        {o.notes && <div style={{ fontSize:13, color:C.textLight }}>備註：{o.notes}</div>}
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
        <h2 style={S.modalTitle}>{productModal==='new' ? '新增商品' : '編輯商品'}</h2>
        <div style={S.formGroup}>
          <label style={S.label}>商品名稱 *</label>
          <input style={productFormErrors.name ? S.inputError : S.input} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name:e.target.value }))} placeholder="請輸入商品名稱" />
          {productFormErrors.name && <div style={S.errorText}>{productFormErrors.name}</div>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={S.formGroup}>
            <label style={S.label}>品牌</label>
            <select style={{ ...S.input, cursor:'pointer' }} value={productForm.brand_id}
              onChange={e => { if (e.target.value === '__new__') { setBrandModal(true); } else { setProductForm(f => ({ ...f, brand_id:e.target.value })); } }}>
              <option value="">無品牌</option>
              {adminBrands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
              <option value="__new__">＋ 新增品牌...</option>
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>貨號</label>
            <input style={S.input} value={productForm.sku} onChange={e => setProductForm(f => ({ ...f, sku:e.target.value }))} placeholder="選填" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>價格（0 = 洽詢）</label>
            <input style={S.input} type="number" min="0" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price:e.target.value }))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>類別</label>
            <select style={{ ...S.input, cursor:'pointer' }} value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category:e.target.value }))}>
              {PROD_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>狀態</label>
          <select style={{ ...S.input, cursor:'pointer' }} value={productForm.status} onChange={e => setProductForm(f => ({ ...f, status:e.target.value }))}>
            <option value="上架中">上架中</option>
            <option value="已下架">已下架</option>
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>圖片 URL（選填）</label>
          <input style={S.input} value={productForm.image_url} onChange={e => setProductForm(f => ({ ...f, image_url:e.target.value }))} placeholder="https://..." />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>商品描述（選填）</label>
          <textarea
            style={{ ...S.textarea, minHeight:140 }}
            value={productForm.description}
            onChange={e => setProductForm(f => ({ ...f, description:e.target.value }))}
            rows={8}
            placeholder={'商品介紹與規格說明\n例如：\nMooer GE200 是一款多功能綜合效果器...\n\n規格：\n- 效果數量：55 種\n- 尺寸：225 x 120 x 48 mm\n- 重量：780g\n- 電源：9V DC'}
          />
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setProductModal(null)}>取消</button>
          <button style={savingProduct ? S.disabledBtn : S.confirmBtn} disabled={savingProduct} onClick={handleSaveProduct}>{savingProduct ? '儲存中...' : '儲存'}</button>
        </div>
      </div>
    </div>
  );

  const renderDeleteConfirm = () => deleteConfirm && (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && setDeleteConfirm(null)}>
      <div style={{ ...S.modalBox, maxWidth:400 }}>
        <div style={{ fontSize:40, textAlign:'center', marginBottom:12 }}>🗑️</div>
        <h2 style={{ ...S.modalTitle, textAlign:'center' }}>確定要刪除此商品嗎？</h2>
        <p style={{ color:C.textLight, textAlign:'center', marginBottom:24 }}>「{deleteConfirm.name}」將被永久刪除，此操作無法復原。</p>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => setDeleteConfirm(null)}>取消</button>
          <button style={{ ...S.confirmBtn, background:C.danger }} onClick={() => handleDeleteProduct(deleteConfirm.id)}>確認刪除</button>
        </div>
      </div>
    </div>
  );

  const renderBrandModal = () => brandModal && (
    <div style={{ ...S.modal, zIndex:400 }} onClick={e => e.target===e.currentTarget && setBrandModal(false)}>
      <div style={{ ...S.modalBox, maxWidth:360 }}>
        <h2 style={S.modalTitle}>新增品牌</h2>
        <div style={S.formGroup}>
          <label style={S.label}>品牌名稱</label>
          <input
            style={S.input}
            value={newBrandName}
            onChange={e => setNewBrandName(e.target.value)}
            placeholder="請輸入品牌名稱"
            onKeyDown={e => e.key==='Enter' && handleAddBrand()}
            autoFocus
          />
        </div>
        <div style={S.modalActions}>
          <button style={S.cancelBtn} onClick={() => { setBrandModal(false); setNewBrandName(''); }}>取消</button>
          <button style={addingBrand ? S.disabledBtn : S.confirmBtn} disabled={addingBrand} onClick={handleAddBrand}>{addingBrand ? '新增中...' : '新增'}</button>
        </div>
      </div>
    </div>
  );

  const renderAdminLayout = () => {
    const navItems = [
      { id:'dashboard', icon:'📊', label:'Dashboard' },
      { id:'products',  icon:'📦', label:'商品管理' },
      { id:'adminorders', icon:'🛒', label:'訂單管理' },
    ];
    const titles = { dashboard:'Dashboard 總覽', products:'商品管理', adminorders:'訂單管理' };
    return (
      <div style={S.adminLayout}>
        {/* Left sidebar */}
        <div style={S.adminSidebar} className="admin-sidebar-hide">
          <div style={S.adminSidebarHeader}>
            <div style={S.adminSidebarTitle}>⚙️ 管理後台</div>
            <div style={S.adminSidebarSubtitle}>商品目錄管理系統</div>
          </div>
          <nav style={S.adminSidebarNav}>
            {navItems.map(item => (
              <div key={item.id} style={adminNavItemStyle(adminPage===item.id)} onClick={() => setAdminPage(item.id)}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </nav>
          <div style={S.adminSidebarFooter}>
            <button style={S.adminBackBtn} onClick={goShop}>← 回到前台</button>
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
              <button style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:13 }} onClick={goShop}>← 回到前台</button>
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
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div style={S.app}>
      {page === 'admin' ? (
        <>
          {renderAdminLayout()}
          {renderProductModal()}
          {renderDeleteConfirm()}
          {renderBrandModal()}
        </>
      ) : (
        <>
          {renderNav()}
          {page === 'shop' && !selectedProductId && renderShop()}
          {page === 'shop' && selectedProductId && renderProductDetail()}
          {page === 'confirm' && renderConfirm()}
          {page === 'orders'  && renderOrders()}
          {renderCart()}
          {renderModal()}
        </>
      )}
    </div>
  );
}
