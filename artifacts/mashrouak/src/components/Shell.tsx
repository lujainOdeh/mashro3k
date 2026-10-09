import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Globe2, Moon, ShoppingBag, Sun } from 'lucide-react';
import { useAppState } from '../context/AppState';

const navByRole = {
  customer: [['/customer', 'الرئيسية', 'Home'], ['/projects', 'المشاريع', 'Projects'], ['/orders', 'طلباتي', 'My orders'], ['/profile', 'حسابي', 'Profile']],
  merchant: [['/merchant', 'لوحة المتجر', 'Overview'], ['/merchant/project', 'مشروعي', 'My project'], ['/merchant/products', 'المنتجات', 'Products'], ['/merchant/orders', 'الطلبات', 'Orders'], ['/merchant/smart-delivery', 'التوصيل الذكي', 'Smart delivery']],
  courier: [['/courier', 'لوحة المندوب', 'Courier home'], ['/courier/requests', 'الطلبات القريبة', 'Nearby requests'], ['/courier/history', 'سجل التوصيل', 'History'], ['/profile', 'حسابي', 'Profile']],
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { state, patch, message } = useAppState();
  const location = useLocation();
  const path = location.pathname;
  const english = state.language === 'en';
  const links = navByRole[state.role as keyof typeof navByRole] ?? navByRole.customer;
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="app-shell" dir={english ? 'ltr' : 'rtl'}>
      <header style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="page-wrap" style={{ minHeight: 72, display: 'flex', alignItems: 'center', gap: 25, justifyContent: 'space-between' }}>
          <Link to="/" className="nav-link" aria-label="Mashrouak home" style={{ fontWeight: 850, fontSize: 21, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
            <span style={{ width: 34, height: 34, borderRadius: 11, background: '#172b4d', color: 'white', display: 'grid', placeItems: 'center', fontFamily: 'Manrope' }}>م</span>
            <span>{english ? 'Mashrouak' : 'مشروعك'}</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 19, flex: 1 }} aria-label="Primary navigation" className="desktop-nav">
            {links.map(([href, ar, en]) => <Link key={href} to={href} className="nav-link" style={{ fontWeight: path === href ? 750 : 550, color: path === href ? '#16a085' : 'var(--ink-muted)', fontSize: 14 }}>{english ? en : ar}</Link>)}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {state.role === 'customer' && <Link to="/cart" className="btn btn-outline" aria-label={english ? `Cart, ${cartCount} items` : `السلة، ${cartCount} منتجات`} style={{ padding: '0 11px', minHeight: 38 }}><ShoppingBag size={17} /><span>{cartCount}</span></Link>}
            <button className="btn btn-outline" onClick={() => patch((draft) => { draft.language = draft.language === 'ar' ? 'en' : 'ar'; })} aria-label="Change language" style={{ minHeight: 38, padding: '0 11px' }}><Globe2 size={16} />{english ? 'عربي' : 'EN'}</button>
            <button className="btn btn-outline" onClick={() => patch((draft) => { draft.theme = draft.theme === 'dark' ? 'light' : 'dark'; })} aria-label="Toggle theme" style={{ minHeight: 38, width: 40, padding: 0 }}>{state.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
            <Link to="/demo" className="btn btn-secondary role-switch" style={{ minHeight: 38, padding: '0 11px' }} aria-label="Switch demo role"><ArrowLeftRight size={15} /><span>{english ? 'Demo role' : 'تغيير الدور'}</span></Link>
          </div>
        </div>
        <div className="mobile-nav">
          {links.map(([href, ar, en]) => <Link key={href} to={href} className="nav-link" style={{ color: path === href ? '#16a085' : 'var(--ink-muted)', fontSize: 12, fontWeight: 700 }}>{english ? en : ar}</Link>)}
        </div>
      </header>
      <main>{children}</main>
      <footer className="page-wrap" style={{ padding: '36px 0', color: 'var(--ink-muted)', display: 'flex', justifyContent: 'space-between', gap: 15, borderTop: '1px solid var(--line)', marginTop: 60, fontSize: 13 }}>
        <span>مشروعك · {english ? 'Local talent, closer to home.' : 'مشاريع محلية، أقرب إليك.'}</span>
        <span>{english ? 'Demo experience · No real payments or GPS' : 'نسخة تجريبية · لا مدفوعات أو تتبع GPS حقيقي'}</span>
      </footer>
      {message && <div className="toast-stack" role="status"><div className="toast-item">{message}</div></div>}
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 18, margin: '32px 0 23px', flexWrap: 'wrap' }}><div>{eyebrow && <div style={{ color: '#16a085', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{eyebrow}</div>}<h1 style={{ fontSize: 'clamp(27px, 4vw, 38px)', letterSpacing: '-.04em', margin: 0, color: 'var(--ink)' }}>{title}</h1>{description && <p className="muted" style={{ margin: '8px 0 0', maxWidth: 700, lineHeight: 1.8 }}>{description}</p>}</div>{action}</div>;
}
