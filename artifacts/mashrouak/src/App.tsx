import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppStateProvider } from './context/AppState';
import { useAppState } from './context/AppState';
import { Landing, DemoSelection, CustomerHome, DiscoverProjects, Storefront, ProductDetails, CartPage, CheckoutPage, OrdersPage, OrderDetails, ProfileSettings } from './pages/MarketPages';
import { MerchantDashboard, MerchantProject, MerchantProducts, MerchantOrders, SmartDelivery, CourierDashboard, CourierRequests, CourierDelivery, CourierHistory } from './pages/RolePages';
import { Shell, PageTitle } from './components/Shell';
import { LoginPage } from './pages/LoginPage';

type Role = 'customer' | 'merchant' | 'courier';

const roleHome: Record<Role, string> = {
  customer: '/customer',
  merchant: '/merchant',
  courier: '/courier',
};

function RequireRole({ children, role }: { children: ReactNode; role?: Role }) {
  const { state } = useAppState();
  const location = useLocation();
  const session = state.demoSession;
  if (!session || session.userId !== state.userId || session.role !== state.role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && session.role !== role) return <Navigate to={roleHome[session.role as Role]} replace />;
  return children;
}

function NotFound() {
  return <Shell><div className="page-wrap" style={{ padding: '70px 0', textAlign: 'center' }}><PageTitle title="هذه الصفحة غير موجودة" description="قد يكون الرابط قديماً أو تمت إزالة الصفحة." /><Link className="btn" to="/">العودة للرئيسية</Link></div></Shell>;
}

function App() {
  return <AppStateProvider><BrowserRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/demo" element={<DemoSelection />} />
    <Route path="/customer" element={<RequireRole role="customer"><CustomerHome /></RequireRole>} />
    <Route path="/projects" element={<DiscoverProjects />} />
    <Route path="/projects/:projectId" element={<Storefront />} />
    <Route path="/products/:productId" element={<ProductDetails />} />
    <Route path="/cart" element={<RequireRole role="customer"><CartPage /></RequireRole>} />
    <Route path="/checkout" element={<RequireRole role="customer"><CheckoutPage /></RequireRole>} />
    <Route path="/orders" element={<RequireRole role="customer"><OrdersPage /></RequireRole>} />
    <Route path="/orders/:orderId" element={<RequireRole role="customer"><OrderDetails /></RequireRole>} />
    <Route path="/merchant" element={<RequireRole role="merchant"><MerchantDashboard /></RequireRole>} />
    <Route path="/merchant/project" element={<RequireRole role="merchant"><MerchantProject /></RequireRole>} />
    <Route path="/merchant/products" element={<RequireRole role="merchant"><MerchantProducts /></RequireRole>} />
    <Route path="/merchant/orders" element={<RequireRole role="merchant"><MerchantOrders /></RequireRole>} />
    <Route path="/merchant/smart-delivery" element={<RequireRole role="merchant"><SmartDelivery /></RequireRole>} />
    <Route path="/courier" element={<RequireRole role="courier"><CourierDashboard /></RequireRole>} />
    <Route path="/courier/requests" element={<RequireRole role="courier"><CourierRequests /></RequireRole>} />
    <Route path="/courier/deliveries/:orderId" element={<RequireRole role="courier"><CourierDelivery /></RequireRole>} />
    <Route path="/courier/history" element={<RequireRole role="courier"><CourierHistory /></RequireRole>} />
    <Route path="/profile" element={<RequireRole><ProfileSettings /></RequireRole>} />
    <Route path="/settings" element={<RequireRole><ProfileSettings /></RequireRole>} />
    <Route path="*" element={<NotFound />} />
  </Routes></BrowserRouter></AppStateProvider>;
}

export default App;
