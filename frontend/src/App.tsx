import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Separate Layouts for each user type
import { UserLayout, DealerLayout, AdminLayout } from '@/components/layouts';

// Auth Pages
import { RoleSelectionPage } from '@/pages/auth/RoleSelectionPage';
import { UserAuthPage } from '@/pages/auth/UserAuthPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { ProfileCompletionPage } from '@/pages/auth/ProfileCompletionPage';
import { DealerLoginPage } from '@/pages/auth/DealerLoginPage';

// Product Pages
import { CategoriesPage } from '@/pages/products/CategoriesPage';
import { CategoryDetailPage } from '@/pages/products/CategoryDetailPage';
import { ProductDetailPage } from '@/pages/products/ProductDetailPage';

// RFQ Pages
import { CreateRFQPage } from '@/pages/rfq/CreateRFQPage';
import { MyRFQsPage } from '@/pages/rfq/MyRFQsPage';
import { RFQDetailPage } from '@/pages/rfq/RFQDetailPage';

// Dealer Pages
import { DealerOnboarding, DealerRegistrationSuccess } from '@/pages/dealer/DealerOnboarding';
import { DealerRegistrationStatus } from '@/pages/dealer/DealerRegistrationStatus';
import { DealerDashboard } from '@/pages/dealer/DealerDashboard';
import { DealerRFQsPage } from '@/pages/dealer/DealerRFQsPage';
import { DealerQuotesPage } from '@/pages/dealer/DealerQuotesPage';
import { DealerProfilePage } from '@/pages/dealer/DealerProfilePage';
import { DealerQuoteSubmitPage } from '@/pages/dealer/DealerQuoteSubmitPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminDealersPage } from '@/pages/admin/AdminDealersPage';
import { AdminLeadsPage } from '@/pages/admin/AdminLeadsPage';
import { AdminChatsPage } from '@/pages/admin/AdminChatsPage';
import { AdminCRMPage } from '@/pages/admin/AdminCRMPage';
import { AdminScraperPage } from '@/pages/admin/AdminScraperPage';

// Community & Knowledge Pages
import { CommunityPage } from '@/pages/community/CommunityPage';
import { PostDetailPage } from '@/pages/community/PostDetailPage';
import { KnowledgePage } from '@/pages/knowledge/KnowledgePage';

// Static Pages
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { JoinTeamPage } from '@/pages/JoinTeamPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';

// User Pages
import { UserDashboard } from '@/pages/user/UserDashboard';
import { MessagesPage } from '@/pages/MessagesPage';
import { ComparePage } from '@/pages/ComparePage';

/**
 * App Routing Architecture
 *
 * The app now has THREE completely separate application shells:
 *
 * 1. PUBLIC ROUTES (Layout) - Landing page, public pages, product browsing
 *    - For unauthenticated visitors
 *    - Shows landing page navigation with "Sign In" / "Get Quote" CTAs
 *
 * 2. USER DASHBOARD (UserLayout) - Protected user workspace
 *    - For authenticated users (type: 'user')
 *    - Clean SaaS-style sidebar navigation
 *    - No landing page elements, no dealer tools
 *    - Focus: RFQs, quotes, product browsing
 *
 * 3. DEALER PORTAL (DealerLayout) - Protected dealer workspace
 *    - For verified dealers (type: 'dealer')
 *    - Dark theme, dealer-focused navigation
 *    - No user tools, no landing page elements
 *    - Focus: Available RFQs, quotes, analytics
 *
 * 4. ADMIN PANEL (AdminLayout) - Protected admin workspace
 *    - For administrators (type: 'admin')
 *    - Administrative controls and oversight
 *    - Completely isolated from user/dealer views
 *
 * This architecture ensures:
 * - Zero overlap between user types
 * - Role enforcement at authentication + routing level
 * - Clean separation of concerns
 */
function App() {
  return (
    <Routes>
      {/* ========================================
          AUTH ROUTES (No Layout)
          These pages handle authentication flows
          ======================================== */}
      <Route path="/get-started" element={<RoleSelectionPage />} />
      <Route path="/login" element={<UserAuthPage />} />
      <Route path="/signup" element={<UserAuthPage />} />
      <Route path="/dealer/login" element={<DealerLoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/complete-profile" element={<ProfileCompletionPage />} />
      <Route path="/dealer/onboarding" element={<DealerOnboarding />} />
      <Route path="/dealer/registration-success" element={<DealerRegistrationSuccess />} />
      <Route path="/dealer/registration-status" element={<DealerRegistrationStatus />} />

      {/* ========================================
          PUBLIC ROUTES (Main Layout)
          Landing page and public-facing content
          ======================================== */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoryDetailPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:id" element={<PostDetailPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/join-team" element={<JoinTeamPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
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
          {/* User can still browse products within their dashboard */}
          <Route path="/user/categories" element={<CategoriesPage />} />
          <Route path="/user/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/user/products/:id" element={<ProductDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>
      </Route>

      {/* ========================================
          DEALER PORTAL (Isolated DealerLayout)
          Protected workspace for verified dealers
          ======================================== */}
      <Route element={<ProtectedRoute requiredRole="dealer" />}>
        <Route element={<DealerLayout />}>
          <Route path="/dealer" element={<DealerDashboard />} />
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
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
