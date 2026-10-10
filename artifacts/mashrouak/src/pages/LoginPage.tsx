import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Globe2, ShieldCheck, ShoppingBag, Store, Truck } from 'lucide-react';
import { useAppState } from '../context/AppState';
import { authenticateDemoUser, createDemoAccount, DemoAuthError, type DemoRole, type DemoUser } from '../services/demoAuth';

type Role = DemoRole;

const roleDetails: Record<Role, {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  button: string;
  buttonEn: string;
  path: string;
  userId: string;
  email: string;
  phone: string;
  icon: typeof ShoppingBag;
  color: string;
}> = {
  customer: {
    title: 'المستخدم أو المشتري',
    titleEn: 'Customer / Buyer',
    description: 'اكتشف المشاريع، تصفح المنتجات، تسوق بسهولة، وتابع طلباتك حتى وصولها.',
    descriptionEn: 'Discover local projects, shop with ease, and follow your orders through delivery.',
    button: 'الدخول كمشتري',
    buttonEn: 'Continue as customer',
    path: '/customer',
    userId: 'user-customer',
    email: 'layan@example.com',
    phone: '079 555 0132',
    icon: ShoppingBag,
    color: '#16a085',
  },
  merchant: {
    title: 'البائع أو صاحب المشروع',
    titleEn: 'Seller / Project owner',
    description: 'أدر مشروعك ومنتجاتك وطلبات العملاء، وتابع المبيعات وعمليات التوصيل.',
    descriptionEn: 'Manage your project, products, customer orders, sales, and deliveries.',
    button: 'الدخول كصاحب مشروع',
    buttonEn: 'Continue as project owner',
    path: '/merchant',
    userId: 'user-merchant',
    email: 'sara@example.com',
    phone: '079 555 0188',
    icon: Store,
    color: '#f4b860',
  },
  courier: {
    title: 'مندوب التوصيل',
    titleEn: 'Delivery courier',
    description: 'اكتشف طلبات التوصيل القريبة منك، واقبل الطلبات المناسبة، وتابع عمليات التسليم.',
    descriptionEn: 'Find nearby delivery requests, accept suitable orders, and track deliveries.',
    button: 'الدخول كمندوب',
    buttonEn: 'Continue as courier',
    path: '/courier',
    userId: 'user-courier',
    email: 'omar@example.com',
    phone: '079 555 0119',
    icon: Truck,
    color: '#172b4d',
  },
};

export function LoginPage() {
  const { state, patch } = useAppState();
  const navigate = useNavigate();
  const english = state.language === 'en';
  const selectedRole = roleDetails[state.authSelectedRole as Role] ? state.authSelectedRole as Role : null;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectCategory, setProjectCategory] = useState('');

  async function login(role: Role, isDemoAccess = false) {
    const details = roleDetails[role];
    let user: DemoUser | undefined;
    try {
      user = isDemoAccess
        ? state.users.find((candidate: DemoUser) => candidate.id === details.userId)
        : await authenticateDemoUser(state.users, role, identifier, password) ?? undefined;
    } catch (authError) {
      setError(authError instanceof DemoAuthError && authError.code === 'secure-crypto-unavailable'
        ? (english ? 'Secure browser storage is unavailable. Try a current browser over HTTPS or localhost.' : 'التخزين الآمن غير متاح. جرّب متصفحاً حديثاً عبر HTTPS أو localhost.')
        : (english ? 'Sign-in could not be completed. Please try again.' : 'تعذر إكمال تسجيل الدخول. حاول مرة أخرى.'));
      return;
    }
    if (!user) {
      setError(english ? 'Check your demo email or phone and password.' : 'تحقق من البريد أو رقم الهاتف وكلمة المرور التجريبية.');
      return;
    }
    const authenticatedUser = user;

    patch((draft) => {
      draft.role = role;
      draft.userId = authenticatedUser.id;
      draft.demoSession = { role, userId: authenticatedUser.id, rememberMe, signedInAt: new Date().toISOString() };
    });
    navigate(details.path);
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) return;
    if (password !== confirmPassword) {
      setError(english ? 'Passwords do not match.' : 'كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      const user = await createDemoAccount(state.users, {
        role: selectedRole,
        name: fullName,
        email,
        phone,
        password,
        ...(selectedRole === 'merchant' ? { projectName, projectCategory } : {}),
      });
      patch((draft) => {
        draft.users.push(user);
        if (selectedRole === 'merchant') {
          draft.projects.push({
            id: `project-${user.id}`,
            merchantId: user.id,
            name: user.projectName,
            category: user.projectCategory,
            location: 'عمّان',
            governorate: 'عمّان',
            locationCoords: { lat: 31.9539, lng: 35.9106 },
            description: english ? 'A local independent project in Amman.' : 'مشروع محلي مستقل في عمّان.',
            image: 'https://images.pexels.com/photos/6044229/pexels-photo-6044229.jpeg?auto=compress&cs=tinysrgb&w=900',
            rating: 5,
          });
        }
        draft.role = selectedRole;
        draft.userId = user.id;
        draft.demoSession = { role: selectedRole, userId: user.id, rememberMe: true, signedInAt: new Date().toISOString() };
      });
      navigate(roleDetails[selectedRole].path);
    } catch (registrationError) {
      if (registrationError instanceof DemoAuthError && registrationError.code === 'account-already-exists') {
        setError(english ? 'An account already uses this email or phone number.' : 'يوجد حساب مسجل بهذا البريد الإلكتروني أو رقم الهاتف.');
      } else if (registrationError instanceof DemoAuthError && registrationError.code === 'secure-crypto-unavailable') {
        setError(english ? 'Secure browser storage is unavailable. Try a current browser over HTTPS or localhost.' : 'التخزين الآمن غير متاح. جرّب متصفحاً حديثاً عبر HTTPS أو localhost.');
      } else {
        setError(english ? 'Account creation could not be completed. Please try again.' : 'تعذر إكمال إنشاء الحساب. حاول مرة أخرى.');
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedRole) login(selectedRole);
  }

  function chooseRole(role: Role) {
    patch((draft) => { draft.authSelectedRole = role; });
    setIdentifier(roleDetails[role].email);
    setPassword('');
    setAuthMode('login');
    setFullName('');
    setEmail('');
    setPhone('');
    setConfirmPassword('');
    setProjectName('');
    setProjectCategory('');
    setError('');
    setNotice('');
  }

  function returnToRoleSelection() {
    patch((draft) => { draft.authSelectedRole = null; });
    setIdentifier('');
    setPassword('');
    setError('');
    setNotice('');
  }

  return (
    <main className="auth-page" dir={english ? 'ltr' : 'rtl'}>
      <div className="auth-topbar">
        <Link className="auth-brand" to="/" aria-label={english ? 'Mashrouak home' : 'الرئيسية'}>
          <img src="/assets/logo.png" alt="" aria-hidden="true" width="50" height="50" className="auth-brand-logo" />
          <span>{english ? 'Mashrouak' : 'مشروعك'}</span>
        </Link>
        <button className="btn btn-outline auth-language" onClick={() => patch((draft) => { draft.language = english ? 'ar' : 'en'; })} type="button">
          <Globe2 size={17} />{english ? 'عربي' : 'English'}
        </button>
      </div>

      <div className="auth-content">
        <header className="auth-heading">
          <span className="auth-eyebrow">{english ? 'A marketplace made for you' : 'سوق محلي يجمعنا'}</span>
          <h1>{english ? 'Welcome to Mashrouak' : 'أهلاً بك في مشروعك'}</h1>
          <p>{english ? 'Choose your account type to continue.' : 'اختَر نوع حسابك للمتابعة.'}</p>
        </header>

        <section className="auth-role-grid" aria-label={english ? 'Choose an account type' : 'اختر نوع الحساب'}>
          {(Object.keys(roleDetails) as Role[]).map((role) => {
            const detail = roleDetails[role];
            const Icon = detail.icon;
            const selected = selectedRole === role;
            return (
              <article key={role} className={`auth-role-card${selected ? ' is-selected' : ''}`} style={{ '--role-accent': detail.color } as CSSProperties}>
                <div className="auth-role-icon"><Icon size={25} strokeWidth={1.8} /></div>
                <h2>{english ? detail.titleEn : detail.title}</h2>
                <p>{english ? detail.descriptionEn : detail.description}</p>
                <button className="btn auth-role-button" type="button" aria-pressed={selected} onClick={() => chooseRole(role)}>
                  {english ? detail.buttonEn : detail.button}
                  <ArrowLeft size={17} />
                </button>
              </article>
            );
          })}
        </section>

        {selectedRole && (
          <section className="auth-form-card" aria-live="polite">
            <button className="auth-back-button" type="button" onClick={returnToRoleSelection}>
              <ArrowLeft size={16} />{english ? 'Back to account types' : 'العودة لاختيار نوع الحساب'}
            </button>
            <div className="auth-form-heading">
              <span className="auth-eyebrow">{english ? 'Selected account' : 'الحساب المحدد'}</span>
              <h2>{authMode === 'login'
                ? (english ? `Sign in as ${roleDetails[selectedRole].titleEn}` : `تسجيل الدخول كـ ${roleDetails[selectedRole].title}`)
                : (english ? `Create a ${roleDetails[selectedRole].titleEn} account` : `إنشاء حساب ${roleDetails[selectedRole].title}`)}</h2>
              <p>{authMode === 'login'
                ? (english ? 'Use the demo credentials below or enter the demo directly.' : 'استخدم بيانات العرض أدناه أو ادخل مباشرة إلى الحساب التجريبي.')
                : (english ? 'Create a local demo account to continue.' : 'أنشئ حساباً تجريبياً محلياً للمتابعة.')}</p>
            </div>
            {authMode === 'login' ? (
              <form onSubmit={handleSubmit} className="auth-form">
                <label className="field-label">
                  {english ? 'Email or phone number' : 'البريد الإلكتروني أو رقم الهاتف'}
                  <input className="field" autoComplete="username" value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError(''); }} required />
                </label>
                <label className="field-label">
                  {english ? 'Password' : 'كلمة المرور'}
                  <span className="auth-password-wrap">
                    <input className="field" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} required />
                    <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? (english ? 'Hide password' : 'إخفاء كلمة المرور') : (english ? 'Show password' : 'إظهار كلمة المرور')}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <div className="auth-form-options">
                  <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />{english ? 'Remember me' : 'تذكرني'}</label>
                  <button className="auth-text-button" type="button" onClick={() => setNotice(english ? 'Password recovery will be available in a future update.' : 'استعادة كلمة المرور ستكون متاحة في تحديث قادم.')}>
                    {english ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
                  </button>
                </div>
                {error && <p className="auth-error" role="alert">{error}</p>}
                {notice && <p className="auth-notice" role="status">{notice}</p>}
                <button className="btn auth-submit" type="submit">{english ? 'Sign in' : 'تسجيل الدخول'}</button>
                <button className="auth-demo-button" type="button" onClick={() => login(selectedRole, true)}>
                  {english ? 'Enter demo account directly' : 'الدخول المباشر للحساب التجريبي'}
                </button>
                <p className="auth-demo-note">
                  {english ? `Demo password: demo123 · ${roleDetails[selectedRole].email}` : `بيانات تجريبية فقط: ${roleDetails[selectedRole].email} · كلمة المرور: demo123`}
                </p>
                <p className="auth-register-note">
                  {english ? 'New to Mashrouak?' : 'ليس لديك حساب؟'}{' '}
                  <button className="auth-text-button" type="button" onClick={() => { setAuthMode('register'); setError(''); }}>
                    {english ? 'Create an account' : 'إنشاء حساب'}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <label className="field-label">
                  {english ? 'Full name' : 'الاسم الكامل'}
                  <input className="field" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} required />
                </label>
                <div className="auth-registration-grid">
                  <label className="field-label">
                    {english ? 'Email' : 'البريد الإلكتروني'}
                    <input className="field" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </label>
                  <label className="field-label">
                    {english ? 'Phone number' : 'رقم الهاتف'}
                    <input className="field" type="tel" autoComplete="tel" pattern="[+0-9() -]{8,20}" value={phone} onChange={(event) => setPhone(event.target.value)} required />
                  </label>
                </div>
                {selectedRole === 'merchant' && (
                  <div className="auth-registration-grid">
                    <label className="field-label">
                      {english ? 'Project name' : 'اسم المشروع'}
                      <input className="field" value={projectName} onChange={(event) => setProjectName(event.target.value)} required />
                    </label>
                    <label className="field-label">
                      {english ? 'Project category' : 'تصنيف المشروع'}
                      <input className="field" value={projectCategory} onChange={(event) => setProjectCategory(event.target.value)} required />
                    </label>
                  </div>
                )}
                <label className="field-label">
                  {english ? 'Password (at least 8 characters)' : 'كلمة المرور (٨ أحرف على الأقل)'}
                  <span className="auth-password-wrap">
                    <input className="field" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
                    <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? (english ? 'Hide password' : 'إخفاء كلمة المرور') : (english ? 'Show password' : 'إظهار كلمة المرور')}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <label className="field-label">
                  {english ? 'Confirm password' : 'تأكيد كلمة المرور'}
                  <input className="field" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
                </label>
                {selectedRole === 'courier' && (
                  <div className="auth-verification-note">
                    <ShieldCheck size={19} />
                    <span>{english
                      ? 'Identity and driving-license checks are future integrations. No document is collected or verified in this demo.'
                      : 'التحقق من الهوية ورخصة القيادة تكامل مستقبلي. لا يتم جمع أو التحقق من أي وثائق في هذا العرض.'}</span>
                  </div>
                )}
                {error && <p className="auth-error" role="alert">{error}</p>}
                <button className="btn auth-submit" type="submit">{english ? 'Create account' : 'إنشاء الحساب'}</button>
                <p className="auth-register-note">
                  {english ? 'Already registered?' : 'لديك حساب بالفعل؟'}{' '}
                  <button className="auth-text-button" type="button" onClick={() => { setAuthMode('login'); setPassword(''); setConfirmPassword(''); setError(''); }}>
                    {english ? 'Sign in' : 'تسجيل الدخول'}
                  </button>
                </p>
              </form>
            )}
          </section>
        )}

        <p className="auth-footer-note">
          {english ? 'Hackathon demo only — accounts are stored on this device and are not secure production authentication.' : 'نسخة هاكاثون تجريبية — الحسابات محفوظة على هذا الجهاز وليست نظام تسجيل آمن للإنتاج.'}
        </p>
      </div>
    </main>
  );
}
