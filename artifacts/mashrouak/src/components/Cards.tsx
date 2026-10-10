import { Link } from 'react-router-dom';
import { ArrowUpLeft, MapPin, Plus, Star } from 'lucide-react';
import { useAppState } from '../context/AppState';
import { LocalizedContent, translateText } from '../lib/localization';

export function ProjectCard({ project }: { project: any }) {
  const { state } = useAppState();
  const en = state.language === 'en';
  const count = state.products.filter((item) => item.projectId === project.id).length;
  return <LocalizedContent language={state.language}><article className="surface" style={{ overflow: 'hidden' }}><Link to={`/projects/${project.id}`} aria-label={translateText(state.language, `${en ? 'Visit' : 'زيارة'} ${project.name}`)}><img src={project.image} alt="" style={{ width: '100%', height: 165, objectFit: 'cover' }} /></Link><div style={{ padding: 17 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><span style={{ color: '#16a085', fontWeight: 750, fontSize: 12 }}>{project.category}</span><span className="muted" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: 12 }}><Star size={13} fill="#f4b860" color="#e4a843" />{project.rating} <small>تقييم تجريبي</small></span></div><h3 style={{ margin: '9px 0 5px', fontSize: 19 }}>{project.name}</h3><p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.7, minHeight: 44 }}>{project.description}</p><div className="muted" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 13, fontSize: 12 }}><span><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {project.location}</span><span>{count} {en ? 'products' : 'منتجات'}</span></div><Link to={`/projects/${project.id}`} className="btn btn-secondary" style={{ marginTop: 14, width: '100%', boxSizing: 'border-box' }}>{en ? 'Visit project' : 'زيارة المشروع'} <ArrowUpLeft size={16} /></Link></div></article></LocalizedContent>;
}

export function ProductCard({ product }: { product: any }) {
  const { state, patch, toast } = useAppState();
  const project = state.projects.find((item) => item.id === product.projectId);
  const en = state.language === 'en';
  const add = () => {
    if (!product.available || product.stock < 1) return toast(en ? 'This item is unavailable.' : 'هذا المنتج غير متاح حالياً.');
    patch((draft) => { const row = draft.cart.find((item: any) => item.productId === product.id); if (row) { if (row.quantity < product.stock) row.quantity += 1; } else draft.cart.push({ productId: product.id, quantity: 1 }); });
    toast(en ? 'Added to your cart.' : 'أضيف المنتج إلى سلتك.');
  };
  return <LocalizedContent language={state.language}><article className="surface" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Link to={`/products/${product.id}`}><img className="product-photo" src={product.image} alt={translateText(state.language, product.name)} /></Link><div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}><span className="muted" style={{ fontSize: 12 }}>{translateText(state.language, project?.name ?? '')} · {product.category}</span><Link to={`/products/${product.id}`} className="nav-link" style={{ marginTop: 7, fontSize: 17, fontWeight: 750 }}>{product.name}</Link><p className="muted" style={{ fontSize: 13, lineHeight: 1.6, margin: '7px 0 13px' }}>{product.description}</p><div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ fontSize: 19, color: 'var(--ink)' }}>{product.price.toFixed(2)} <small style={{ fontSize: 12 }}>د.أ</small></b><button className="btn" onClick={add} disabled={!product.available || product.stock < 1} aria-label={translateText(state.language, `${en ? 'Add' : 'إضافة'} ${product.name}`)} style={{ minHeight: 38, padding: '0 11px' }}><Plus size={16} />{en ? 'Add' : 'أضف'}</button></div><small className="muted" style={{ marginTop: 8 }}>{en ? 'In stock:' : 'المتوفر:'} {product.stock}</small></div></article></LocalizedContent>;
}

export function StatusBadge({ status }: { status: string }) {
  const { state } = useAppState();
  const labels: Record<string, string> = { placed: 'تم الطلب', confirmed: 'تم التأكيد', preparing: 'قيد التجهيز', ready: 'جاهز للاستلام', accepted: 'تم إسناد مندوب', picked_up: 'استلمه المندوب', on_the_way: 'في الطريق', delivered: 'تم التسليم', cancelled: 'ملغي', rejected: 'مرفوض' };
  const done = ['ready', 'accepted', 'picked_up', 'on_the_way', 'delivered'].includes(status);
  return <span style={{ borderRadius: 99, padding: '6px 10px', fontSize: 12, background: done ? '#eaf5f2' : status === 'cancelled' ? '#fbeaea' : '#fff4e0', color: done ? '#087e68' : status === 'cancelled' ? '#a33' : '#94661c', fontWeight: 750 }}>{translateText(state.language, labels[status] ?? status)}</span>;
}
