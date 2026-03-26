import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Separate Layouts for each user type
import { UserLayout, DealerLayout, AdminLayout, ProfessionalLayout } from '@/components/layouts';

// Auth Pages (eager - entry points)
import { RoleSelectionPage } from '@/pages/auth/RoleSelectionPage';
import { UserAuthPage } from '@/pages/auth/UserAuthPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { ProfileCompletionPage } from '@/pages/auth/ProfileCompletionPage';
import { DealerLoginPage } from '@/pages/auth/DealerLoginPage';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';

// Product Pages (eager - core browsing flow)
import { CategoriesPage } from '@/pages/products/CategoriesPage';
import { CategoryDetailPage } from '@/pages/products/CategoryDetailPage';
import { ProductTypePage } from '@/pages/products/ProductTypePage';
import { ProductDetailPage } from '@/pages/products/ProductDetailPage';

// Lazy-loaded pages (code-split for faster initial load)
const CreateRFQPage = lazy(() => import('@/pages/rfq/CreateRFQPage').then(m => ({ default: m.CreateRFQPage })));
const MyRFQsPage = lazy(() => import('@/pages/rfq/MyRFQsPage').then(m => ({ default: m.MyRFQsPage })));
const RFQDetailPage = lazy(() => import('@/pages/rfq/RFQDetailPage').then(m => ({ default: m.RFQDetailPage })));

const ProfessionalOnboardingLazy = lazy(() => import('@/pages/professional/ProfessionalOnboarding').then(m => ({ default: m.ProfessionalOnboarding })));
const ProfessionalDashboard = lazy(() => import('@/pages/professional/ProfessionalDashboard').then(m => ({ default: m.ProfessionalDashboard })));

const DealerOnboardingLazy = lazy(() => import('@/pages/dealer/DealerOnboarding').then(m => ({ default: m.DealerOnboarding })));
const DealerRegistrationSuccessLazy = lazy(() => import('@/pages/dealer/DealerOnboarding').then(m => ({ default: m.DealerRegistrationSuccess })));
const DealerRegistrationStatus = lazy(() => import('@/pages/dealer/DealerRegistrationStatus').then(m => ({ default: m.DealerRegistrationStatus })));
const DealerDashboard = lazy(() => import('@/pages/dealer/DealerDashboard').then(m => ({ default: m.DealerDashboard })));
const DealerRFQsPage = lazy(() => import('@/pages/dealer/DealerRFQsPage').then(m => ({ default: m.DealerRFQsPage })));
const DealerQuotesPage = lazy(() => import('@/pages/dealer/DealerQuotesPage').then(m => ({ default: m.DealerQuotesPage })));
const DealerProfilePage = lazy(() => import('@/pages/dealer/DealerProfilePage').then(m => ({ default: m.DealerProfilePage })));
const DealerQuoteSubmitPage = lazy(() => import('@/pages/dealer/DealerQuoteSubmitPage').then(m => ({ default: m.DealerQuoteSubmitPage })));
const DealerAvailableInquiriesPage = lazy(() => import('@/pages/dealer/DealerAvailableInquiriesPage').then(m => ({ default: m.DealerAvailableInquiriesPage })));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProfessionalsPage = lazy(() => import('@/pages/admin/AdminProfessionalsPage').then(m => ({ default: m.AdminProfessionalsPage })));
const AdminDealersPage = lazy(() => import('@/pages/admin/AdminDealersPage').then(m => ({ default: m.AdminDealersPage })));
const AdminLeadsPage = lazy(() => import('@/pages/admin/AdminLeadsPage').then(m => ({ default: m.AdminLeadsPage })));
const AdminChatsPage = lazy(() => import('@/pages/admin/AdminChatsPage').then(m => ({ default: m.AdminChatsPage })));
const AdminCRMPage = lazy(() => import('@/pages/admin/AdminCRMPage').then(m => ({ default: m.AdminCRMPage })));
const AdminScraperPage = lazy(() => import('@/pages/admin/AdminScraperPage').then(m => ({ default: m.AdminScraperPage })));
const AdminInquiriesPage = lazy(() => import('@/pages/admin/AdminInquiriesPage').then(m => ({ default: m.AdminInquiriesPage })));
const AdminInquiryPipelinePage = lazy(() => import('@/pages/admin/AdminInquiryPipelinePage').then(m => ({ default: m.AdminInquiryPipelinePage })));
const AdminBrandDealersPage = lazy(() => import('@/pages/admin/AdminBrandDealersPage').then(m => ({ default: m.AdminBrandDealersPage })));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminRFQsPage = lazy(() => import('@/pages/admin/AdminRFQsPage').then(m => ({ default: m.AdminRFQsPage })));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminFraudPage = lazy(() => import('@/pages/admin/AdminFraudPage').then(m => ({ default: m.AdminFraudPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

const CommunityPage = lazy(() => import('@/pages/community/CommunityPage').then(m => ({ default: m.CommunityPage })));
const PostDetailPage = lazy(() => import('@/pages/community/PostDetailPage').then(m => ({ default: m.PostDetailPage })));
const KnowledgePage = lazy(() => import('@/pages/knowledge/KnowledgePage').then(m => ({ default: m.KnowledgePage })));

const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const JoinTeamPage = lazy(() => import('@/pages/JoinTeamPage').then(m => ({ default: m.JoinTeamPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AIAssistantPage = lazy(() => import('@/pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));
const TrackInquiryPage = lazy(() => import('@/pages/TrackInquiryPage').then(m => ({ default: m.TrackInquiryPage })));
const SmartSlipScanPage = lazy(() => import('@/pages/SmartSlipScanPage').then(m => ({ default: m.SmartSlipScanPage })));

const UserDashboard = lazy(() => import('@/pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const MessagesPage = lazy(() => import('@/pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const ComparePage = lazy(() => import('@/pages/ComparePage').then(m => ({ default: m.ComparePage })));

// Loading fallback for lazy routes
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
    </div>
  );
}

/**
 * App Routing Architecture
 *
 * Code-split into chunks:
 * - Core: Layout, HomePage, CategoriesPage, ProductPages (eager)
 * - Auth: Login, Signup pages (eager - entry points)
 * - User: Dashboard, RFQ pages (lazy)
 * - Dealer: Dashboard, RFQs, Quotes (lazy)
 * - Admin: All admin pages (lazy)
 * - Static: About, Privacy, Terms, etc (lazy)
 */
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ========================================
            AUTH ROUTES (No Layout)
            These pages handle authentication flows
            ======================================== */}
        <Route path="/get-started" element={<RoleSelectionPage />} />
        <Route path="/login" element={<UserAuthPage />} />
        <Route path="/signup" element={<UserAuthPage />} />
        <Route path="/dealer/login" element={<DealerLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="/dealer/onboarding" element={<DealerOnboardingLazy />} />
        <Route path="/pro/onboarding" element={<ProfessionalOnboardingLazy />} />
        <Route path="/dealer/registration-success" element={<DealerRegistrationSuccessLazy />} />
        <Route path="/dealer/registration-status" element={<DealerRegistrationStatus />} />

        {/* ========================================
            PUBLIC ROUTES (Main Layout)
            Landing page and public-facing content
            ======================================== */}
        {/* Standalone full-screen pages (no header/footer) */}
        <Route path="/ai-assistant" element={<AIAssistantPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/product-types/:slug" element={<ProductTypePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<PostDetailPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/join-team" element={<JoinTeamPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<TrackInquiryPage />} />
          <Route path="/smart-scan" element={<SmartSlipScanPage />} />
        </Route>

        {/* ========================================
            USER DASHBOARD (Isolated UserLayout)
            Protected workspace for regular users
            ======================================== */}
        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/rfq/create" element={<CreateRFQPage />} />
            <Route path="/rfq/my-rfqs" element={<MyRFQsPage />} />
            <Route path="/rfq/:id" element={<RFQDetailPage />} />
            <Route path="/user/categories" element={<CategoriesPage />} />
            <Route path="/user/categories/:slug" element={<CategoryDetailPage />} />
            <Route path="/user/product-types/:slug" element={<ProductTypePage />} />
            <Route path="/user/products/:id" element={<ProductDetailPage />} />
            <Route path="/user/knowledge" element={<KnowledgePage />} />
            <Route path="/user/community" element={<CommunityPage />} />
            <Route path="/user/community/:id" element={<PostDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Route>
        </Route>

        {/* ========================================
            PROFESSIONAL PORTAL (ProfessionalLayout)
            Protected workspace for Architects, Designers, Contractors etc.
            ======================================== */}
        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route element={<ProfessionalLayout />}>
            <Route path="/pro" element={<ProfessionalDashboard />} />
            <Route path="/pro/profile" element={<UserDashboard />} />
            <Route path="/pro/documents" element={<ProfessionalOnboardingLazy />} />
            <Route path="/pro/projects" element={<UserDashboard />} />
          </Route>
        </Route>

        {/* ========================================
            DEALER PORTAL (Isolated DealerLayout)
            Protected workspace for verified dealers
            ======================================== */}
        <Route element={<ProtectedRoute requiredRole="dealer" />}>
          <Route element={<DealerLayout />}>
            <Route path="/dealer" element={<DealerDashboard />} />
            <Route path="/dealer/inquiries/available" element={<DealerAvailableInquiriesPage />} />
            <Route path="/dealer/rfqs" element={<DealerRFQsPage />} />
            <Route path="/dealer/rfqs/:rfqId/quote" element={<DealerQuoteSubmitPage />} />
            <Route path="/dealer/quotes" element={<DealerQuotesPage />} />
            <Route path="/dealer/profile" element={<DealerProfilePage />} />
            <Route path="/dealer/messages" element={<MessagesPage />} />
          </Route>
        </Route>

        {/* ========================================
            ADMIN PANEL (Isolated AdminLayout)
            Protected workspace for administrators
            ======================================== */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dealers" element={<AdminDealersPage />} />
            <Route path="/admin/leads" element={<AdminLeadsPage />} />
            <Route path="/admin/chats" element={<AdminChatsPage />} />
            <Route path="/admin/crm" element={<AdminCRMPage />} />
            <Route path="/admin/scraper" element={<AdminScraperPage />} />
            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
            <Route path="/admin/inquiries/:inquiryId/pipeline" element={<AdminInquiryPipelinePage />} />
            <Route path="/admin/brand-dealers" element={<AdminBrandDealersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/rfqs" element={<AdminRFQsPage />} />
            <Route path="/admin/fraud" element={<AdminFraudPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/professionals" element={<AdminProfessionalsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
