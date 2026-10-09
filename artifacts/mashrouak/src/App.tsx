import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppState';
import { Landing, DemoSelection, CustomerHome, DiscoverProjects, Storefront, ProductDetails, CartPage, CheckoutPage, OrdersPage, OrderDetails, ProfileSettings } from './pages/MarketPages';
import { MerchantDashboard, MerchantProject, MerchantProducts, MerchantOrders, SmartDelivery, CourierDashboard, CourierRequests, CourierDelivery, CourierHistory } from './pages/RolePages';
import { Shell, PageTitle } from './components/Shell';
import { Link } from 'react-router-dom';

function NotFound() {
  return <Shell><div className="page-wrap" style={{ padding: '70px 0', textAlign: 'center' }}><PageTitle title="هذه الصفحة غير موجودة" description="قد يكون الرابط قديماً أو تمت إزالة الصفحة." /><Link className="btn" to="/">العودة للرئيسية</Link></div></Shell>;
}

function App() {
  return <AppStateProvider><BrowserRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/demo" element={<DemoSelection />} />
    <Route path="/customer" element={<CustomerHome />} />
    <Route path="/projects" element={<DiscoverProjects />} />
    <Route path="/projects/:projectId" element={<Storefront />} />
    <Route path="/products/:productId" element={<ProductDetails />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/orders/:orderId" element={<OrderDetails />} />
    <Route path="/merchant" element={<MerchantDashboard />} />
    <Route path="/merchant/project" element={<MerchantProject />} />
    <Route path="/merchant/products" element={<MerchantProducts />} />
    <Route path="/merchant/orders" element={<MerchantOrders />} />
    <Route path="/merchant/smart-delivery" element={<SmartDelivery />} />
    <Route path="/courier" element={<CourierDashboard />} />
    <Route path="/courier/requests" element={<CourierRequests />} />
    <Route path="/courier/deliveries/:orderId" element={<CourierDelivery />} />
    <Route path="/courier/history" element={<CourierHistory />} />
    <Route path="/profile" element={<ProfileSettings />} />
    <Route path="/settings" element={<ProfileSettings />} />
    <Route path="*" element={<NotFound />} />
  </Routes></BrowserRouter></AppStateProvider>;
}

export default App;
