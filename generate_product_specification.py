#!/usr/bin/env python3
"""
Hub4Estate - COMPLETE PRODUCT SPECIFICATION
Focus: Product vision, UX flows, UI placement, architecture, security
NO CODE DUMPS - Pure product and design specification
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
import os

W, H = A4
LEFT = 40
RIGHT = W - 40
TOP = H - 60
BOTTOM = 60

class ProductSpec:
    def __init__(self):
        self.output = os.path.join(os.path.dirname(__file__), "Hub4Estate_Product_Specification.pdf")
        self.c = canvas.Canvas(self.output, pagesize=A4)
        self.c.setTitle("Hub4Estate - Complete Product Specification")
        self.page = 1
        self.y = TOP

    def new_page(self):
        self.c.showPage()
        self.page += 1
        # Header
        self.c.setFillColor(HexColor('#F9FAFB'))
        self.c.rect(0, H - 45, W, 45, fill=1, stroke=0)
        self.c.setFillColor(HexColor('#1E40AF'))
        self.c.setFont('Helvetica-Bold', 10)
        self.c.drawString(LEFT, H - 28, "Hub4Estate Product Specification")
        self.c.setFillColor(HexColor('#6B7280'))
        self.c.setFont('Helvetica', 9)
        self.c.drawRightString(RIGHT, H - 28, f"Page {self.page}")
        self.y = H - 70

    def check_space(self, needed=50):
        if self.y < BOTTOM + needed:
            self.new_page()
            return True
        return False

    def section(self, text, color='#1E40AF'):
        self.check_space(60)
        self.c.setFillColor(HexColor(color))
        self.c.setFont('Helvetica-Bold', 22)
        self.c.drawString(LEFT, self.y, text)
        self.y -= 10
        self.c.setStrokeColor(HexColor(color))
        self.c.setLineWidth(2)
        self.c.line(LEFT, self.y, RIGHT, self.y)
        self.y -= 25

    def subsection(self, text):
        self.check_space(40)
        self.c.setFillColor(HexColor('#2563EB'))
        self.c.setFont('Helvetica-Bold', 16)
        self.c.drawString(LEFT, self.y, text)
        self.y -= 20

    def subsubsection(self, text):
        self.check_space(30)
        self.c.setFillColor(HexColor('#3B82F6'))
        self.c.setFont('Helvetica-Bold', 12)
        self.c.drawString(LEFT, self.y, text)
        self.y -= 18

    def text(self, txt, size=10, color='#000000', indent=0, bold=False):
        self.check_space(16)
        self.c.setFillColor(HexColor(color))
        font = 'Helvetica-Bold' if bold else 'Helvetica'
        self.c.setFont(font, size)
        self.c.drawString(LEFT + indent, self.y, txt)
        self.y -= 14

    def bullet(self, txt, indent=10, size=9):
        self.check_space(14)
        self.c.setFillColor(black)
        self.c.setFont('Helvetica', size)
        self.c.drawString(LEFT + indent, self.y, f"• {txt}")
        self.y -= 12

    def box(self, title, content_lines, bg_color='#F3F4F6'):
        height = len(content_lines) * 14 + 40
        self.check_space(height)

        # Background
        self.c.setFillColor(HexColor(bg_color))
        self.c.roundRect(LEFT, self.y - height + 15, RIGHT - LEFT, height, 6, fill=1, stroke=0)

        # Title
        self.c.setFillColor(HexColor('#1E40AF'))
        self.c.setFont('Helvetica-Bold', 11)
        self.c.drawString(LEFT + 10, self.y - 20, title)

        # Content
        y_content = self.y - 38
        self.c.setFillColor(black)
        self.c.setFont('Helvetica', 9)
        for line in content_lines:
            self.c.drawString(LEFT + 15, y_content, line)
            y_content -= 14

        self.y -= height + 10

    def flowchart_step(self, number, title, description, action=None):
        self.check_space(80)

        # Number circle
        self.c.setFillColor(HexColor('#3B82F6'))
        self.c.circle(LEFT + 15, self.y - 15, 12, fill=1, stroke=0)
        self.c.setFillColor(white)
        self.c.setFont('Helvetica-Bold', 10)
        self.c.drawCentredString(LEFT + 15, self.y - 18, str(number))

        # Title
        self.c.setFillColor(HexColor('#1E40AF'))
        self.c.setFont('Helvetica-Bold', 11)
        self.c.drawString(LEFT + 35, self.y - 12, title)

        # Description
        self.c.setFillColor(HexColor('#4B5563'))
        self.c.setFont('Helvetica', 9)
        y_desc = self.y - 28
        for line in description:
            self.c.drawString(LEFT + 35, y_desc, line)
            y_desc -= 12

        # Action box if provided
        if action:
            self.c.setFillColor(HexColor('#DBEAFE'))
            self.c.roundRect(LEFT + 35, y_desc - 20, 200, 18, 4, fill=1, stroke=0)
            self.c.setFillColor(HexColor('#1E40AF'))
            self.c.setFont('Helvetica-Bold', 8)
            self.c.drawString(LEFT + 45, y_desc - 10, f"ACTION: {action}")
            y_desc -= 25

        # Arrow to next step
        self.c.setStrokeColor(HexColor('#D1D5DB'))
        self.c.setLineWidth(1)
        self.c.line(LEFT + 15, y_desc, LEFT + 15, y_desc - 10)

        self.y = y_desc - 15

    def ui_element(self, element_type, position, specs):
        self.check_space(60)

        # Element type badge
        colors = {
            'BUTTON': '#10B981',
            'INPUT': '#3B82F6',
            'CARD': '#8B5CF6',
            'NAVIGATION': '#F59E0B',
            'SECTION': '#EF4444'
        }

        self.c.setFillColor(HexColor(colors.get(element_type, '#6B7280')))
        self.c.roundRect(LEFT, self.y, 80, 18, 4, fill=1, stroke=0)
        self.c.setFillColor(white)
        self.c.setFont('Helvetica-Bold', 9)
        self.c.drawCentredString(LEFT + 40, self.y + 5, element_type)

        # Position
        self.c.setFillColor(HexColor('#6B7280'))
        self.c.setFont('Helvetica', 9)
        self.c.drawString(LEFT + 90, self.y + 5, position)

        self.y -= 22

        # Specs
        self.c.setFillColor(black)
        self.c.setFont('Helvetica', 8)
        for key, value in specs.items():
            self.c.setFillColor(HexColor('#4B5563'))
            self.c.drawString(LEFT + 10, self.y, f"{key}:")
            self.c.setFillColor(black)
            self.c.drawString(LEFT + 120, self.y, str(value))
            self.y -= 11

        self.y -= 10

    def generate(self):
        self.cover_page()
        self.new_page()
        self.executive_summary()
        self.product_vision()
        self.customer_personas()
        self.complete_user_flows()
        self.detailed_ui_specifications()
        self.database_architecture()
        self.api_architecture()
        self.security_architecture()
        self.admin_panel_specs()
        self.folder_structure()
        self.implementation_roadmap()

        self.c.save()
        print(f"✅ Product Specification Generated: {self.output}")
        print(f"📄 {self.page} pages")
        return self.output

    def cover_page(self):
        # Gradient background
        self.c.setFillColor(HexColor('#1E3A8A'))
        self.c.rect(0, 0, W, H, fill=1, stroke=0)

        # Title
        self.c.setFillColor(white)
        self.c.setFont('Helvetica-Bold', 48)
        self.c.drawCentredString(W/2, H - 140, "Hub4Estate")

        self.c.setFont('Helvetica', 24)
        self.c.drawCentredString(W/2, H - 180, "Complete Product Specification")

        # Subtitle box
        self.c.setFillColor(HexColor('#3B82F6'))
        self.c.roundRect(W/2 - 200, H - 250, 400, 50, 8, fill=1, stroke=0)
        self.c.setFillColor(white)
        self.c.setFont('Helvetica-Bold', 14)
        self.c.drawCentredString(W/2, H - 230, "India's First Dealer Discovery Platform")
        self.c.setFont('Helvetica', 11)
        self.c.drawCentredString(W/2, H - 248, "for Electrical Goods")

        # Key highlights
        highlights = [
            "✓ Complete Product Architecture",
            "✓ Detailed User Experience Flows",
            "✓ Every UI Element Placement",
            "✓ Security-First Design",
            "✓ Database Structure",
            "✓ Admin Panel Capabilities",
            "✓ Implementation Roadmap"
        ]

        y = H - 330
        self.c.setFont('Helvetica', 12)
        for h in highlights:
            self.c.drawCentredString(W/2, y, h)
            y -= 24

        # Footer
        self.c.setFont('Helvetica-Bold', 11)
        self.c.drawCentredString(W/2, 100, "Shreshth Agarwal")
        self.c.setFont('Helvetica', 10)
        self.c.drawCentredString(W/2, 82, "Founder & CEO")
        self.c.setFont('Helvetica', 9)
        self.c.drawCentredString(W/2, 65, "February 2025 • Version 2.0")

    def executive_summary(self):
        self.section("1. Executive Summary")

        self.subsection("1.1 Problem Statement")
        self.text("The electrical goods market in India is fragmented with:")
        self.bullet("Buyers struggle to find reliable dealers and compare prices", indent=15)
        self.bullet("Average 25-35% price gap between MRP and dealer rates", indent=15)
        self.bullet("No transparency in dealer pricing or availability", indent=15)
        self.bullet("Time-consuming process to get multiple quotations", indent=15)
        self.bullet("Risk of fraudulent or unverified dealers", indent=15)
        self.y -= 10

        self.subsection("1.2 Solution: Hub4Estate Platform")
        self.text("A B2B marketplace connecting buyers with verified electrical goods dealers.")
        self.y -= 5

        self.box("Core Value Proposition", [
            "Buyers: Get instant quotes from multiple verified dealers, save 25-35%",
            "Dealers: Access to genuine buyer leads, expand customer base",
            "Platform: Commission-free for MVP, future revenue from premium features"
        ])

        self.subsection("1.3 Target Market")
        self.text("Primary Users:", bold=True)
        self.bullet("Homeowners: Renovations, new constructions (40% of users)", indent=15)
        self.bullet("Contractors: Bulk purchases for projects (35% of users)", indent=15)
        self.bullet("Electricians: Regular procurement (15% of users)", indent=15)
        self.bullet("Architects/Interior Designers: Specification purchases (10%)", indent=15)
        self.y -= 10

        self.text("Geographic Focus: Tier 1 & 2 cities (Mumbai, Delhi, Bangalore, Pune, etc.)")
        self.y -= 10

        self.subsection("1.4 Success Metrics")
        self.box("Key Performance Indicators", [
            "Month 1-3: 500 registered users, 50 verified dealers, 200 RFQs",
            "Month 4-6: 2,000 users, 200 dealers, 1,000 RFQs, 100 closed deals",
            "Month 7-12: 10,000 users, 500 dealers, 5,000 RFQs, 1,000 deals/month",
            "Target: 30% conversion from RFQ to quote, 15% quote acceptance rate"
        ])

    def product_vision(self):
        self.new_page()
        self.section("2. Product Vision & Philosophy")

        self.subsection("2.1 Design Philosophy")
        self.text("Hub4Estate is built on three core principles:")
        self.y -= 5

        self.box("1. SIMPLICITY FIRST", [
            "Every feature must solve a real user problem",
            "No unnecessary complexity or bloated interfaces",
            "Mobile-first design for on-the-go users",
            "Maximum 3 clicks to complete any primary action"
        ])

        self.box("2. TRUST & TRANSPARENCY", [
            "All dealers verified with GST and business documents",
            "Clear pricing with no hidden fees",
            "User reviews and ratings visible for all dealers",
            "Complete quote history and audit trails"
        ])

        self.box("3. SPEED & EFFICIENCY", [
            "RFQ creation in under 2 minutes",
            "Quote responses within 24-48 hours",
            "Real-time notifications for all updates",
            "Instant dealer contact on quote acceptance"
        ])

        self.subsection("2.2 User Experience Principles")

        self.subsubsection("For Buyers:")
        self.bullet("Zero learning curve - intuitive interface", indent=15)
        self.bullet("No spam - only relevant, verified dealer quotes", indent=15)
        self.bullet("Privacy protected - phone number hidden until quote acceptance", indent=15)
        self.bullet("Free forever for basic features", indent=15)
        self.y -= 10

        self.subsubsection("For Dealers:")
        self.bullet("Easy onboarding - under 5 minutes", indent=15)
        self.bullet("Quality leads - only serious buyers with verified profiles", indent=15)
        self.bullet("Fair competition - all dealers get equal visibility", indent=15)
        self.bullet("No spam - filtered RFQs based on dealer's brands/categories", indent=15)
        self.y -= 10

        self.subsection("2.3 Product Differentiation")
        self.text("vs. IndiaMART/TradeIndia:", bold=True)
        self.bullet("Focused ONLY on electrical goods = better matching", indent=15)
        self.bullet("No lead selling - direct B2B connection", indent=15)
        self.bullet("Dealer verification mandatory", indent=15)
        self.bullet("Price transparency enforced", indent=15)
        self.y -= 8

        self.text("vs. Direct Dealer Contact:", bold=True)
        self.bullet("Access to 10-50 dealers in one RFQ", indent=15)
        self.bullet("Automatic price comparison", indent=15)
        self.bullet("Professional interface with quote management", indent=15)
        self.bullet("Review history for dealer selection", indent=15)

    def customer_personas(self):
        self.new_page()
        self.section("3. Customer Personas")

        self.subsection("3.1 Persona: Homeowner Ramesh")

        self.box("Profile", [
            "Age: 38, Lives in Mumbai",
            "Occupation: IT Manager",
            "Scenario: Renovating 2BHK apartment",
            "Budget: Rs. 2-3 lakhs for electrical items",
            "Tech Savvy: High (uses Amazon, Swiggy daily)"
        ])

        self.subsubsection("Pain Points:")
        self.bullet("Doesn't know local dealers, worried about fraud", indent=15)
        self.bullet("No time to visit multiple shops for quotes", indent=15)
        self.bullet("Electrician recommended one dealer - no price comparison", indent=15)
        self.bullet("Confused by technical specifications and brands", indent=15)
        self.y -= 10

        self.subsubsection("Goals:")
        self.bullet("Save money (top priority)", indent=15)
        self.bullet("Buy from trusted, verified dealers", indent=15)
        self.bullet("Get everything delivered to site on time", indent=15)
        self.bullet("Easy process, minimal effort", indent=15)
        self.y -= 10

        self.subsubsection("How Hub4Estate Helps:")
        self.bullet("Creates one RFQ with all 30 items needed", indent=15)
        self.bullet("Receives 8 quotes from verified dealers in 24 hours", indent=15)
        self.bullet("Compares prices instantly, saves Rs. 45,000 (18%)", indent=15)
        self.bullet("Selects dealer with best price + good reviews", indent=15)
        self.bullet("Gets delivery in 3 days, electrician installs smoothly", indent=15)
        self.y -= 15

        self.subsection("3.2 Persona: Contractor Suresh")

        self.box("Profile", [
            "Age: 45, Based in Pune",
            "Occupation: Building Contractor (15 years experience)",
            "Scenario: Handling 3 residential projects simultaneously",
            "Monthly procurement: Rs. 5-8 lakhs electrical goods",
            "Tech Savvy: Medium (uses WhatsApp for business)"
        ])

        self.subsubsection("Pain Points:")
        self.bullet("Regular dealers give same price, no competition", indent=15)
        self.bullet("Bulk discounts not transparent", indent=15)
        self.bullet("Credit terms vary, needs better negotiation", indent=15)
        self.bullet("Urgent requirements need quick quotes", indent=15)
        self.y -= 10

        self.subsubsection("Goals:")
        self.bullet("Best wholesale prices for bulk orders", indent=15)
        self.bullet("Reliable dealers who deliver on time", indent=15)
        self.bullet("Credit facility (30-day terms)", indent=15)
        self.bullet("Build relationships with multiple dealers", indent=15)
        self.y -= 10

        self.subsubsection("How Hub4Estate Helps:")
        self.bullet("Posts RFQ with exact project requirements", indent=15)
        self.bullet("Gets 15 quotes including dealers offering credit terms", indent=15)
        self.bullet("Negotiates better rates due to competition", indent=15)
        self.bullet("Discovers 3 new reliable dealers for future projects", indent=15)
        self.bullet("Tracks all quotes and orders in one dashboard", indent=15)
        self.y -= 15

        self.subsection("3.3 Persona: Dealer Rajesh")

        self.box("Profile", [
            "Age: 52, Legrand dealer in Mumbai",
            "Business: 25-year-old electrical goods shop",
            "Annual Revenue: Rs. 80 lakhs",
            "Challenge: Foot traffic declining, needs online presence",
            "Tech Savvy: Low (son manages WhatsApp Business)"
        ])

        self.subsubsection("Pain Points:")
        self.bullet("Only local customers, want to expand reach", indent=15)
        self.bullet("IndiaMART leads are spam - 90% fake inquiries", indent=15)
        self.bullet("Son wants to modernize, but unsure how", indent=15)
        self.bullet("Competitors on Amazon/Flipkart, can't match prices", indent=15)
        self.y -= 10

        self.subsubsection("Goals:")
        self.bullet("Get genuine B2B customers (not retail)", indent=15)
        self.bullet("Compete on service, not just price", indent=15)
        self.bullet("Build reputation beyond local area", indent=15)
        self.bullet("Easy to use - son can manage online presence", indent=15)
        self.y -= 10

        self.subsubsection("How Hub4Estate Helps:")
        self.bullet("Simple registration - verified in 24 hours", indent=15)
        self.bullet("Only gets RFQs for Legrand products (his specialty)", indent=15)
        self.bullet("Every inquiry is genuine - buyers verified", indent=15)
        self.bullet("Builds rating profile - 4.7 stars after 20 deals", indent=15)
        self.bullet("Increased B2B sales by 30% in 3 months", indent=15)

    def complete_user_flows(self):
        self.new_page()
        self.section("4. Complete User Flows")

        self.subsection("4.1 User Flow: First-Time Buyer Creates RFQ")

        self.flowchart_step(1, "Landing Page Discovery",
            ["User searches Google: 'electrical goods dealer Mumbai'",
             "Finds Hub4Estate, clicks organic result",
             "Lands on homepage at hub4estate.com"],
            "Page Load: <1.5 seconds")

        self.flowchart_step(2, "Homepage Engagement",
            ["Sees hero: 'Get Quotes from 100+ Verified Dealers'",
             "Scrolls to category grid: Switches, Fans, Lights, MCBs",
             "Reads 'How It Works' section with 4 steps",
             "Trust signals: '500+ Dealers Verified' badge visible"],
            "Clicks: 'Create Free RFQ' button (Top right + Hero)")

        self.flowchart_step(3, "Authentication Required",
            ["Redirected to /auth/login",
             "Modal appears: 'Sign up to create RFQ'",
             "Options: Google (1-click) or Phone OTP (2 steps)",
             "Privacy note: 'Your phone stays private until you accept quote'"],
            "User selects: 'Continue with Google'")

        self.flowchart_step(4, "Google OAuth Flow",
            ["Google popup opens in new window",
             "Shows Hub4Estate requesting: Email, Name, Profile Photo",
             "User clicks 'Allow' on Google account",
             "Popup closes, returns to Hub4Estate"],
            "Backend: Creates user record, generates JWT token")

        self.flowchart_step(5, "Profile Completion (New User Only)",
            ["Page: /auth/complete-profile",
             "Form with 3 fields only:",
             "  1. Name (pre-filled from Google)",
             "  2. Role: Dropdown (Homeowner/Contractor/Architect/etc.)",
             "  3. City: Autocomplete search (Top 100 cities)",
             "Progress bar: Step 1 of 2"],
            "Fills: Role='Homeowner', City='Mumbai', Clicks 'Next'")

        self.flowchart_step(6, "RFQ Creation - Product Selection",
            ["Page: /rfqs/create (Step 1 of 3)",
             "Top: Search bar with autocomplete",
             "Left sidebar: Category filters (collapsible on mobile)",
             "Main area: Product grid (4 cols desktop, 2 mobile)",
             "Each product card: Image, Brand, Model, 'Add' button",
             "Right panel: Selected items count badge",
             "Bottom: 'Next' button (disabled until 1+ items)"],
            "Searches 'modular switch', adds 5 products")

        self.flowchart_step(7, "RFQ Creation - Quantity & Details",
            ["Page: /rfqs/create (Step 2 of 3)",
             "List of selected products (from Step 1)",
             "Per product: Quantity input + Unit dropdown",
             "Delivery city: Pre-filled from profile (editable)",
             "Expected delivery: Date picker (min: today + 7 days)",
             "Additional requirements: Textarea (optional, 200 chars)",
             "Back button + Next button"],
            "Enters quantities, selects date, clicks 'Next'")

        self.flowchart_step(8, "RFQ Creation - Review & Submit",
            ["Page: /rfqs/create (Step 3 of 3)",
             "Summary displayed:",
             "  Products: 5 items with quantities",
             "  Delivery: Mumbai by [selected date]",
             "  Requirements: [text if entered]",
             "Checkbox: 'I agree to Terms of Service'",
             "Estimated reach: '23 dealers will see this RFQ'",
             "Submit button: Large, blue, 'Submit RFQ'"],
            "Checks Terms, clicks 'Submit RFQ'")

        self.flowchart_step(9, "RFQ Submitted - Success State",
            ["Page: /rfqs/[rfq-id]/success",
             "Animation: Green checkmark (Lottie)",
             "Large text: 'RFQ Created Successfully!'",
             "RFQ Number: RFQ-2025-0234 (with copy button)",
             "Message: 'Your RFQ has been sent to 23 dealers'",
             "Timeline: 'Expect quotes within 24-48 hours'",
             "Three action buttons:",
             "  Primary: 'View My RFQ'",
             "  Secondary: 'Create Another RFQ'",
             "  Link: 'Go to Dashboard'"],
            "Notifications sent: Email + SMS with RFQ number")

        self.flowchart_step(10, "Waiting for Quotes",
            ["User clicks 'View My RFQ'",
             "Page: /rfqs/[rfq-id]",
             "Status badge: 'Waiting for Quotes' (yellow)",
             "View count: '12 dealers viewed' (updates real-time)",
             "Quote count: '0 quotes received'",
             "Empty state: 'No quotes yet. Check back soon!'",
             "Button: 'Notify Me' (enables push notifications)"],
            "User waits, receives email when first quote arrives")

        self.flowchart_step(11, "Receiving Quotes",
            ["Notification: 'You have 3 new quotes!'",
             "User returns to /rfqs/[rfq-id]",
             "Status: 'Quoted' (green)",
             "Quote cards displayed (sorted by price, low to high):",
             "Each card shows:",
             "  - Dealer name + city",
             "  - Price per unit + total",
             "  - MOQ (if applicable)",
             "  - Delivery time",
             "  - Dealer rating (stars)",
             "  - 'Contact Dealer' button",
             "Best price badge on cheapest quote"],
            "Receives 8 quotes over 36 hours")

        self.flowchart_step(12, "Comparing & Selecting Quote",
            ["User reviews all 8 quotes",
             "Filters: By price range, by city, by rating",
             "Sorts: By price, by rating, by delivery time",
             "User identifies best quote:",
             "  Dealer: Mumbai Electricals",
             "  Price: Rs. 45,200 (18% below next best)",
             "  Rating: 4.6 stars (38 reviews)",
             "  Delivery: 3 days",
             "Clicks 'Contact Dealer' button"],
            "Action: Opens contact modal")

        self.flowchart_step(13, "Contacting Dealer",
            ["Modal appears: 'Contact Dealer Details'",
             "Dealer info now revealed:",
             "  Name: Rajesh Kumar",
             "  Phone: +91 98765 43210 (Click to call)",
             "  WhatsApp: Green button (opens WhatsApp)",
             "  Email: rajesh@mumbaielectricals.com",
             "  Shop Address: Andheri East, Mumbai",
             "Privacy note: 'Dealer can now see your contact details'",
             "Button: 'Mark as Accepted' (changes RFQ status)"],
            "User clicks WhatsApp, negotiates, finalizes deal")

        self.flowchart_step(14, "Post-Purchase (Closing Loop)",
            ["After deal completion (marked by user):",
             "Email: 'How was your experience with [dealer]?'",
             "Rating form: 1-5 stars + review (optional)",
             "Questions:",
             "  - Quality of products?",
             "  - Delivery on time?",
             "  - Would you recommend this dealer?",
             "Incentive: 'Get 10% off on next RFQ (future feature)'"],
            "User submits review, dealer's rating updated")

        self.y -= 20
        self.text("TOTAL TIME: RFQ creation to first quote received = 24-36 hours", bold=True, color='#059669')
        self.text("USER EFFORT: ~5 minutes to create RFQ, ~5 minutes to review quotes", color='#059669')

    def detailed_ui_specifications(self):
        self.new_page()
        self.section("5. Detailed UI Specifications")

        self.subsection("5.1 Homepage Layout - Every Element")

        self.subsubsection("Navigation Bar (Sticky)")
        self.ui_element('NAVIGATION', 'Top: 0px, Height: 64px, Full width', {
            'Background': 'White with shadow-sm on scroll',
            'Logo': 'Left: 40px, Size: 140x36px, Links to /',
            'Menu Items': 'Center: Categories, How It Works, For Dealers',
            'Right Actions': 'Login button (ghost), Create RFQ (primary)',
            'Mobile': 'Hamburger menu (right), logo left, compact 56px height'
        })

        self.subsubsection("Hero Section")
        self.ui_element('SECTION', 'Below nav, Height: 600px desktop, 500px mobile', {
            'Background': 'Gradient: primary-600 to primary-800',
            'Overlay': 'Pattern image at 10% opacity (electrical grid)',
            'Heading': 'text-5xl font-bold, white, center-aligned',
            'Subheading': 'text-xl, white/90, max-width 700px, center',
            'CTA Buttons': '2 buttons, gap 16px, centered below heading',
            'Primary CTA': '"Get Started" - white bg, primary text, large',
            'Secondary CTA': '"Learn More" - transparent, white text, border',
            'Trust Badge': 'Bottom: "500+ Verified Dealers" with checkmark icon'
        })

        self.subsubsection("Search Bar (Floating)")
        self.ui_element('INPUT', 'Overlaps hero section, -40px from hero bottom', {
            'Container': 'max-width 800px, centered, shadow-xl',
            'Background': 'White, rounded-xl (12px)',
            'Height': '64px',
            'Padding': '12px 24px',
            'Icon': 'Search icon (gray-400) left aligned',
            'Placeholder': '"Search for switches, fans, lights, MCBs..."',
            'Autocomplete': 'Dropdown appears below, max 8 suggestions',
            'Mobile': 'Sticky at top after scroll past hero'
        })

        self.subsubsection("Category Grid Section")
        self.ui_element('SECTION', 'Below search, Padding: 80px top, 60px bottom', {
            'Heading': 'text-3xl font-bold, center, "Browse by Category"',
            'Grid': '6 columns desktop, 4 tablet, 2 mobile, gap: 24px',
            'Category Card': 'Each card specs below',
            'Card Size': '180x200px desktop, full-width mobile',
            'Card Background': 'White, rounded-lg, shadow-md',
            'Card Image': '120x120px, centered at top, padding 20px',
            'Card Title': 'text-lg font-semibold, center, margin-top 12px',
            'Card Subtitle': 'text-sm gray-600, product count, center',
            'Hover': 'scale(1.05), shadow-lg, transition 200ms',
            'Click': 'Navigate to /categories/[slug]'
        })

        self.text("Category Grid - Exact Categories:", bold=True)
        categories = [
            "Modular Switches & Sockets", "Fans (Ceiling, Exhaust, Pedestal)",
            "LED Lights & Fixtures", "Wires & Cables",
            "MCBs, RCCBs, Isolators", "Distribution Boards",
            "Conduits & Accessories", "Switchgears",
            "Energy Meters", "Doorbells & Intercoms",
            "Exhaust Fans & Ventilation", "Geysers & Water Heaters"
        ]
        for i, cat in enumerate(categories, 1):
            self.bullet(f"{i}. {cat}", indent=15, size=8)
        self.y -= 10

        self.subsubsection("Features Section (3 Columns)")
        self.ui_element('SECTION', 'Padding: 80px vertical, Background: gray-50', {
            'Layout': '3 equal columns, gap 48px, centered content',
            'Icon': 'Top of each column, 48x48px, primary-600 color',
            'Heading': 'text-xl font-semibold, margin-top 20px',
            'Description': 'text-base gray-600, margin-top 12px',
            'Feature 1': 'Shield icon - "Verified Dealers Only"',
            'Feature 2': 'Zap icon - "Instant Price Comparisons"',
            'Feature 3': 'Users icon - "Community Reviews"',
            'Mobile': 'Stacks vertically, centered'
        })

        self.subsubsection("How It Works Section")
        self.ui_element('SECTION', 'Padding: 100px vertical, White background', {
            'Heading': 'text-4xl font-bold, center, "How It Works"',
            'Subheading': 'text-lg gray-600, center, margin-top 16px',
            'Steps Layout': 'Horizontal timeline desktop, vertical mobile',
            'Step Count': '4 steps with connecting dashed lines',
            'Step 1': 'Browse Products - Catalog icon',
            'Step 2': 'Create RFQ - File-plus icon',
            'Step 3': 'Compare Quotes - Bar-chart icon',
            'Step 4': 'Contact & Purchase - Handshake icon',
            'Each Step': 'Number badge (48px circle), title, description',
            'Connecting Line': 'Dashed, gray-300, 2px, between steps'
        })

        self.subsubsection("Testimonials (Carousel)")
        self.ui_element('SECTION', 'Padding: 80px vertical, Background: primary-50', {
            'Heading': 'text-3xl font-bold, center',
            'Carousel': 'Auto-rotate every 5 seconds, 3 testimonials',
            'Card Size': 'max-width 600px, centered',
            'Card Content': 'Quote text, user name, role, city, rating',
            'Navigation': 'Dots below (gray-300, active: primary-600)',
            'Mobile': 'Swipe enabled, single card view'
        })

        self.subsubsection("Final CTA Section")
        self.ui_element('SECTION', 'Padding: 80px vertical, Background: primary-600', {
            'Text Color': 'White, center-aligned',
            'Heading': 'text-4xl font-bold, "Ready to Save on Electrical?"',
            'Subheading': 'text-xl, margin-top 16px, "Join 1,000+ buyers"',
            'CTA Button': 'Large, white background, primary text',
            'Button Text': '"Create Free RFQ Now"',
            'Button Size': '56px height, 240px min-width',
            'Margin': '32px top'
        })

        self.subsubsection("Footer")
        self.ui_element('SECTION', 'Background: gray-900, Color: white', {
            'Layout': '4 columns desktop, stacked mobile',
            'Column 1': 'Logo + tagline',
            'Column 2': 'Quick Links (Home, Categories, How It Works)',
            'Column 3': 'For Dealers (Register, Login, Support)',
            'Column 4': 'Contact (Email, Phone, WhatsApp)',
            'Bottom Bar': 'Copyright, Privacy Policy, Terms, Social icons',
            'Padding': '60px vertical, 40px horizontal',
            'Links Color': 'gray-400, hover: white'
        })

    def database_architecture(self):
        self.new_page()
        self.section("6. Database Architecture")

        self.subsection("6.1 Database Design Philosophy")
        self.box("Core Principles", [
            "1. NORMALIZED: No redundant data, clean relationships",
            "2. INDEXED: All frequently queried fields have indexes",
            "3. AUDIT TRAIL: Every write operation logged with timestamp",
            "4. SOFT DELETES: No hard deletes, use status flags",
            "5. PRIVACY: Sensitive fields encrypted at rest (AES-256)"
        ])

        self.subsection("6.2 Core Tables - Logical Structure")

        self.subsubsection("Table: users")
        self.text("Purpose: All platform users (buyers only, dealers separate)", bold=True)
        self.box("Fields & Logic", [
            "id: UUID primary key (for URL safety)",
            "email: Unique, nullable (Google OAuth might not give email)",
            "google_id: Unique, nullable (for Google OAuth users)",
            "phone: Unique, nullable, ENCRYPTED (for OTP login users)",
            "name: Required (from OAuth or manual input)",
            "role: ENUM (HOMEOWNER, CONTRACTOR, ARCHITECT, ELECTRICIAN, OTHER)",
            "city: String (for dealer matching by location)",
            "profile_image: URL to CDN",
            "status: ENUM (ACTIVE, SUSPENDED, DELETED) - default ACTIVE",
            "email_verified: Boolean",
            "phone_verified: Boolean (required before creating RFQ)",
            "created_at, updated_at: Timestamps"
        ])
        self.text("Indexes: email, phone, google_id, city, status", size=8, color='#6B7280', indent=10)
        self.text("Business Rule: At least ONE of (email, google_id, phone) must exist", size=8, color='#DC2626', indent=10)
        self.y -= 10

        self.subsubsection("Table: dealers")
        self.text("Purpose: Verified dealers who quote on RFQs", bold=True)
        self.box("Fields & Logic", [
            "id: UUID primary key",
            "business_name: Official name on GST",
            "owner_name: Contact person",
            "email: Unique, required",
            "phone: Unique, required, ENCRYPTED",
            "city: Required (for location-based matching)",
            "address: Full address",
            "gst_number: Unique, ENCRYPTED (for verification)",
            "gst_certificate_url: PDF/image on S3",
            "business_proof_url: Shop photo/license",
            "status: ENUM (PENDING, VERIFIED, ACTIVE, SUSPENDED, REJECTED)",
            "  PENDING: Just registered, awaiting admin review",
            "  VERIFIED: Documents checked, can quote",
            "  ACTIVE: Verified + actively quoting",
            "  SUSPENDED: Temporarily blocked",
            "  REJECTED: Application denied",
            "rating: Decimal (0.00 to 5.00), calculated from reviews",
            "total_quotes_sent: Counter",
            "total_deals_closed: Counter",
            "response_rate: Percentage (quotes sent / RFQs viewed)",
            "avg_response_time: Hours (time to send first quote)",
            "verified_at: Timestamp (when admin approved)",
            "last_active_at: Timestamp (for activity tracking)",
            "created_at, updated_at"
        ])
        self.text("Indexes: email, phone, city, gst_number, status, rating", size=8, color='#6B7280', indent=10)
        self.text("Business Rule: Cannot send quotes unless status = VERIFIED or ACTIVE", size=8, color='#DC2626', indent=10)
        self.y -= 10

        self.subsubsection("Table: brands")
        self.text("Purpose: Electrical goods brands (Legrand, Anchor, Havells, etc.)", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "name: Brand name (unique)",
            "slug: URL-friendly (e.g., 'legrand')",
            "logo_url: Brand logo on CDN",
            "description: Optional",
            "country: String (India, China, USA, etc.)",
            "website: URL",
            "is_active: Boolean (to hide discontinued brands)",
            "created_at"
        ])
        self.text("Total brands: ~500 (preloaded)", size=8, color='#6B7280', indent=10)
        self.y -= 10

        self.subsubsection("Table: categories")
        self.text("Purpose: Top-level product categories (Switches, Fans, etc.)", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "name: Category name",
            "slug: URL-friendly",
            "icon_url: Category icon (180x180px)",
            "description: Optional",
            "display_order: Integer (for sorting on homepage)",
            "is_active: Boolean",
            "total_products: Cached count (updated nightly)",
            "created_at"
        ])
        self.text("Total categories: 12 (fixed set)", size=8, color='#6B7280', indent=10)
        self.y -= 10

        self.subsubsection("Table: subcategories")
        self.text("Purpose: Level 2 grouping within categories", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "category_id: Foreign key to categories",
            "name: Subcategory name",
            "slug: URL-friendly",
            "description: Optional",
            "is_active: Boolean",
            "created_at"
        ])
        self.text("Example: Category='Switches' -> Subcategories=['1 Module', '2 Module', '3 Module']", size=8, color='#6B7280', indent=10)
        self.y -= 10

        self.new_page()
        self.subsubsection("Table: products")
        self.text("Purpose: Individual product SKUs (e.g., Legrand Myrius 1M Switch White)", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "name: Product name",
            "slug: URL-friendly (unique)",
            "brand_id: Foreign key to brands",
            "category_id: Foreign key to categories",
            "subcategory_id: Foreign key to subcategories (nullable)",
            "model_number: Manufacturer model code",
            "description: Rich text (HTML)",
            "specifications: JSON field {",
            "  'color': 'White',",
            "  'material': 'Polycarbonate',",
            "  'warranty': '1 year',",
            "  ... (flexible key-value pairs)",
            "}",
            "images: Array of URLs [img1, img2, img3...]",
            "primary_image: Single URL (for cards)",
            "mrp: Decimal (manufacturer's max retail price)",
            "typical_dealer_price: Decimal (average from quotes, for reference)",
            "is_active: Boolean",
            "views_count: Integer (for trending)",
            "rfq_count: Integer (how many RFQs include this)",
            "created_at, updated_at"
        ])
        self.text("Indexes: slug, brand_id, category_id, is_active, views_count", size=8, color='#6B7280', indent=10)
        self.text("Total products: 5,000+ (grows over time)", size=8, color='#6B7280', indent=10)
        self.y -= 10

        self.subsubsection("Table: rfqs (Request for Quotations)")
        self.text("Purpose: Buyer's request for prices", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "rfq_number: Human-readable (RFQ-2025-0234), unique, indexed",
            "user_id: Foreign key to users",
            "status: ENUM (DRAFT, PENDING, QUOTED, ACCEPTED, CLOSED, EXPIRED)",
            "  DRAFT: User started but not submitted",
            "  PENDING: Submitted, waiting for dealer quotes",
            "  QUOTED: At least 1 quote received",
            "  ACCEPTED: User accepted a quote",
            "  CLOSED: Deal finalized or manually closed",
            "  EXPIRED: Past expiry date with no action",
            "delivery_city: String (where buyer wants delivery)",
            "delivery_date: Date (expected delivery by this date)",
            "additional_requirements: Text (optional notes)",
            "total_items: Integer (count of products in RFQ)",
            "total_views: Integer (how many dealers viewed)",
            "total_quotes: Integer (how many quotes received)",
            "expires_at: Timestamp (default: created_at + 30 days)",
            "accepted_quote_id: Foreign key to quotes (nullable)",
            "accepted_at: Timestamp (when user accepted a quote)",
            "created_at, updated_at"
        ])
        self.text("Indexes: rfq_number, user_id, status, delivery_city, expires_at", size=8, color='#6B7280', indent=10)
        self.text("Business Rule: Cannot modify RFQ after status = ACCEPTED", size=8, color='#DC2626', indent=10)
        self.y -= 10

        self.subsubsection("Table: rfq_items")
        self.text("Purpose: Products within an RFQ (many-to-many)", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "rfq_id: Foreign key to rfqs",
            "product_id: Foreign key to products",
            "quantity: Integer (how many units needed)",
            "unit: String (pieces, boxes, meters, kg, etc.)",
            "notes: Text (optional, product-specific requirements)",
            "created_at"
        ])
        self.text("Indexes: rfq_id, product_id", size=8, color='#6B7280', indent=10)
        self.text("Business Rule: quantity must be > 0", size=8, color='#DC2626', indent=10)
        self.y -= 10

        self.subsubsection("Table: quotes")
        self.text("Purpose: Dealer's price quote for an RFQ", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "rfq_id: Foreign key to rfqs",
            "dealer_id: Foreign key to dealers",
            "product_id: Foreign key to products (which product being quoted)",
            "price_per_unit: Decimal (dealer's price)",
            "quantity: Integer (for this quantity)",
            "total_price: Decimal (price_per_unit * quantity) CALCULATED",
            "moq: Integer (minimum order quantity, optional)",
            "delivery_days: Integer (how many days to deliver)",
            "valid_until: Date (quote expiry, default: +7 days)",
            "notes: Text (dealer's additional terms)",
            "status: ENUM (PENDING, ACCEPTED, REJECTED, EXPIRED)",
            "  PENDING: Quote sent, awaiting buyer response",
            "  ACCEPTED: Buyer accepted this quote",
            "  REJECTED: Buyer rejected or chose different dealer",
            "  EXPIRED: Past valid_until date",
            "created_at"
        ])
        self.text("Indexes: rfq_id, dealer_id, product_id, status", size=8, color='#6B7280', indent=10)
        self.text("Business Rule: One dealer can quote only ONCE per product per RFQ", size=8, color='#DC2626', indent=10)
        self.text("Business Rule: total_price auto-calculated, cannot be set manually", size=8, color='#DC2626', indent=10)
        self.y -= 10

        self.new_page()
        self.subsubsection("Table: dealer_brands")
        self.text("Purpose: Which brands a dealer deals with (many-to-many)", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "dealer_id: Foreign key to dealers",
            "brand_id: Foreign key to brands",
            "is_authorized: Boolean (official dealer vs. parallel import)",
            "created_at"
        ])
        self.text("Usage: Filter RFQs shown to dealer based on brands", size=8, color='#6B7280', indent=10)
        self.y -= 10

        self.subsubsection("Table: dealer_categories")
        self.text("Purpose: Which categories a dealer deals with", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "dealer_id: Foreign key to dealers",
            "category_id: Foreign key to categories",
            "created_at"
        ])
        self.text("Usage: Further filter RFQs (dealer must match brand AND category)", size=8, color='#6B7280', indent=10)
        self.y -= 10

        self.subsubsection("Table: reviews")
        self.text("Purpose: User reviews of dealers after deal completion", bold=True)
        self.box("Fields & Logic", [
            "id: UUID",
            "dealer_id: Foreign key to dealers",
            "user_id: Foreign key to users",
            "rfq_id: Foreign key to rfqs (which transaction)",
            "rating: Integer (1 to 5 stars)",
            "review_text: Text (optional, max 500 chars)",
            "quality_rating: Integer (1-5, product quality)",
            "delivery_rating: Integer (1-5, on-time delivery)",
            "communication_rating: Integer (1-5, responsiveness)",
            "would_recommend: Boolean",
            "is_verified: Boolean (only if deal actually happened)",
            "status: ENUM (PENDING, APPROVED, REJECTED, FLAGGED)",
            "  PENDING: User submitted, awaiting moderation",
            "  APPROVED: Admin approved, visible publicly",
            "  REJECTED: Spam/inappropriate",
            "  FLAGGED: Reported by dealer for review",
            "created_at"
        ])
        self.text("Indexes: dealer_id, user_id, rfq_id, status", size=8, color='#6B7280', indent=10)
        self.text("Business Rule: User can review only if their quote was ACCEPTED", size=8, color='#DC2626', indent=10)
        self.text("Business Rule: One review per RFQ per user", size=8, color='#DC2626', indent=10)
        self.y -= 10

        self.subsection("6.3 Database Relationships Summary")
        self.box("Key Relationships", [
            "users 1 → many rfqs (one user creates many RFQs)",
            "rfqs 1 → many rfq_items (one RFQ has many products)",
            "products 1 → many rfq_items (one product in many RFQs)",
            "rfqs 1 → many quotes (one RFQ receives many quotes)",
            "dealers 1 → many quotes (one dealer sends many quotes)",
            "dealers many ← → many brands (via dealer_brands)",
            "dealers many ← → many categories (via dealer_categories)",
            "dealers 1 → many reviews (one dealer has many reviews)",
            "users 1 → many reviews (one user writes many reviews)"
        ])

        self.subsection("6.4 Data Privacy & Security")
        self.box("Encrypted Fields (AES-256 at rest)", [
            "users.phone → Only decrypted for OTP sending and display to user",
            "users.email → Encrypted (optional extra layer)",
            "dealers.phone → Encrypted until buyer accepts quote",
            "dealers.gst_number → Encrypted, admin-only access"
        ])

        self.box("Data Access Rules", [
            "Buyer can see dealer's full profile ONLY after accepting quote",
            "Dealer can see buyer's phone/email ONLY after quote acceptance",
            "Buyer's name and role visible to dealers on RFQ (for context)",
            "Buyer's exact identity (email/phone) hidden until deal",
            "All queries use row-level security (RLS) in database"
        ])

    def api_architecture(self):
        self.new_page()
        self.section("7. API Architecture & Security")

        self.subsection("7.1 API Design Philosophy")
        self.box("Core Principles", [
            "RESTful design: Standard HTTP methods (GET, POST, PATCH, DELETE)",
            "JSON only: All requests and responses use application/json",
            "Versioned: /api/v1/ prefix (future-proof)",
            "Stateless: JWT tokens, no server-side sessions",
            "Rate Limited: Prevent abuse (100 req/15min per IP)",
            "Documented: OpenAPI/Swagger spec auto-generated"
        ])

        self.subsection("7.2 Authentication & Token Security")

        self.subsubsection("Token Strategy (CRITICAL FOR SECURITY)")
        self.box("NO TOKENS IN BROWSER STORAGE", [
            "❌ WRONG: localStorage.setItem('token', jwt) → VULNERABLE TO XSS",
            "❌ WRONG: sessionStorage → STILL VULNERABLE",
            "✅ CORRECT: httpOnly cookie + short-lived access token",
            "",
            "Implementation:",
            "1. Access Token: JWT, 15-minute expiry, in httpOnly cookie",
            "2. Refresh Token: 7-day expiry, also httpOnly cookie",
            "3. Cookie flags: Secure=true, SameSite=Strict, HttpOnly=true",
            "4. Domain: .hub4estate.com (for subdomain access)",
            "",
            "Why this is secure:",
            "• JavaScript CANNOT read httpOnly cookies (XSS protection)",
            "• Browser automatically sends cookie with requests",
            "• Short expiry (15 min) limits damage if intercepted",
            "• Refresh token rotation prevents replay attacks"
        ])

        self.subsubsection("Token Lifecycle")
        self.box("Login Flow", [
            "1. User logs in (Google OAuth or OTP)",
            "2. Backend generates JWT access token (15 min expiry)",
            "3. Backend generates refresh token (7 day expiry)",
            "4. Both set as httpOnly cookies in response",
            "5. Frontend receives success response (no token in body)",
            "6. Frontend stores only: isAuthenticated=true (boolean)",
            "7. All API calls automatically include cookies"
        ])

        self.box("Token Refresh Flow", [
            "1. Access token expires after 15 minutes",
            "2. Frontend API call fails with 401 Unauthorized",
            "3. Frontend auto-calls POST /api/auth/refresh",
            "4. Backend validates refresh token from cookie",
            "5. Backend issues NEW access token (15 min) + NEW refresh token",
            "6. Both updated in httpOnly cookies",
            "7. Frontend retries original request",
            "",
            "Refresh token rotation:",
            "• Each refresh invalidates old refresh token",
            "• Prevents token theft and replay attacks"
        ])

        self.box("Logout Flow", [
            "1. User clicks logout",
            "2. Frontend calls POST /api/auth/logout",
            "3. Backend adds refresh token to blacklist (Redis)",
            "4. Backend clears cookies (sets maxAge=0)",
            "5. Frontend clears isAuthenticated flag",
            "6. Redirect to homepage"
        ])

        self.subsection("7.3 Critical API Endpoints")

        self.subsubsection("Authentication APIs")
        self.box("POST /api/auth/google", [
            "Purpose: Google OAuth login/signup",
            "Public: Yes (no auth required)",
            "Request Body: { credential: 'google-jwt-here' }",
            "Process:",
            "  1. Verify Google JWT with Google's public key",
            "  2. Extract email, name, profile image",
            "  3. Check if user exists (by google_id or email)",
            "  4. If new: Create user record, flag isNewUser=true",
            "  5. Generate access + refresh tokens",
            "  6. Set httpOnly cookies",
            "Response: { success: true, isNewUser: boolean, user: {...} }",
            "Error 401: Invalid Google token",
            "Error 500: Server error"
        ])

        self.box("POST /api/auth/phone/send-otp", [
            "Purpose: Send OTP to phone for login",
            "Public: Yes",
            "Request: { phone: '+919876543210', countryCode: 'IN' }",
            "Process:",
            "  1. Validate phone format (E.164)",
            "  2. Check rate limit (1 OTP per 60 seconds per phone)",
            "  3. Generate 6-digit OTP (random)",
            "  4. Store in Redis with 5-minute expiry",
            "  5. Send via Twilio Verify API",
            "Response: { success: true, expiresIn: 300 }",
            "Error 429: Too many requests",
            "Error 400: Invalid phone number"
        ])

        self.box("POST /api/auth/phone/verify-otp", [
            "Purpose: Verify OTP and login",
            "Public: Yes",
            "Request: { phone: '+919876543210', otp: '123456' }",
            "Process:",
            "  1. Check OTP in Redis",
            "  2. Validate OTP matches (max 3 attempts)",
            "  3. Delete OTP from Redis (one-time use)",
            "  4. Find or create user by phone",
            "  5. Mark phone_verified=true",
            "  6. Generate tokens, set cookies",
            "Response: { success: true, isNewUser: boolean, user: {...} }",
            "Error 401: Invalid or expired OTP",
            "Error 429: Too many failed attempts"
        ])

        self.box("GET /api/auth/me", [
            "Purpose: Get current logged-in user's profile",
            "Auth: Required (JWT in cookie)",
            "Response: { success: true, user: { id, email, phone, name, role, city, ... } }",
            "Error 401: Not authenticated (token missing/invalid)"
        ])

        self.new_page()
        self.subsubsection("RFQ APIs")
        self.box("POST /api/rfqs", [
            "Purpose: Create new RFQ",
            "Auth: Required (buyer only)",
            "Validation: User must have phone_verified=true",
            "Request Body: {",
            "  items: [",
            "    { productId: 'uuid', quantity: 10, unit: 'pieces', notes: '...' }",
            "  ],",
            "  deliveryCity: 'Mumbai',",
            "  deliveryDate: '2025-03-15',",
            "  additionalRequirements: 'Urgent, need by Friday'",
            "}",
            "Process:",
            "  1. Validate all product IDs exist",
            "  2. Generate unique rfq_number (RFQ-YYYY-####)",
            "  3. Create rfq record (status=PENDING)",
            "  4. Create rfq_items records",
            "  5. Notify matching dealers (background job)",
            "Response: { success: true, rfq: { id, rfqNumber, ... } }",
            "Error 422: Validation failed (missing fields, invalid products)",
            "Error 403: Phone not verified"
        ])

        self.box("GET /api/rfqs (List)", [
            "Purpose: Get user's RFQs",
            "Auth: Required",
            "Query params: ?status=PENDING&page=1&limit=20",
            "Response: { success: true, rfqs: [...], total: 42, page: 1, pages: 3 }",
            "Filters: status, dateFrom, dateTo",
            "Sorting: createdAt desc (newest first)"
        ])

        self.box("GET /api/rfqs/:id (Detail)", [
            "Purpose: Get single RFQ with all quotes",
            "Auth: Required",
            "Authorization: User must own RFQ OR be dealer who quoted",
            "Response: {",
            "  success: true,",
            "  rfq: { id, rfqNumber, status, items: [...], totalQuotes: 8, ... },",
            "  quotes: [ { dealer: {...}, pricePerUnit, total, ... } ]",
            "}",
            "Quotes sorted by: total price (low to high)",
            "Error 403: Forbidden (not your RFQ)",
            "Error 404: RFQ not found"
        ])

        self.subsubsection("Quote APIs")
        self.box("POST /api/quotes", [
            "Purpose: Dealer submits quote for an RFQ",
            "Auth: Required (dealer only)",
            "Validation: Dealer status must be VERIFIED or ACTIVE",
            "Request: {",
            "  rfqId: 'uuid',",
            "  quotes: [",
            "    { productId: 'uuid', pricePerUnit: 125.50, quantity: 10,",
            "      moq: 5, deliveryDays: 3, notes: 'GST extra' }",
            "  ]",
            "}",
            "Process:",
            "  1. Validate RFQ exists and is PENDING or QUOTED",
            "  2. Check dealer hasn't already quoted these products",
            "  3. Create quote records",
            "  4. Increment rfq.total_quotes",
            "  5. Update rfq.status to QUOTED (if first quote)",
            "  6. Notify buyer (email + push notification)",
            "Response: { success: true, quotes: [...] }",
            "Error 409: Already quoted this product",
            "Error 403: Dealer not verified or RFQ closed"
        ])

        self.box("PATCH /api/quotes/:id/accept", [
            "Purpose: Buyer accepts a quote",
            "Auth: Required (buyer, must own RFQ)",
            "Process:",
            "  1. Validate quote belongs to user's RFQ",
            "  2. Update quote.status = ACCEPTED",
            "  3. Update rfq.status = ACCEPTED",
            "  4. Set rfq.accepted_quote_id",
            "  5. Set rfq.accepted_at timestamp",
            "  6. Reject all other quotes for this RFQ",
            "  7. Reveal dealer contact to buyer",
            "  8. Reveal buyer contact to dealer",
            "  9. Notify dealer (email + SMS: 'Your quote was accepted!')",
            "Response: {",
            "  success: true,",
            "  dealerContact: { name, phone, email, whatsapp, address }",
            "}",
            "Error 403: Not your RFQ",
            "Error 409: RFQ already closed"
        ])

        self.subsection("7.4 API Security Measures")

        self.box("Rate Limiting (Per IP)", [
            "Global: 100 requests per 15 minutes",
            "Auth endpoints: 10 requests per 15 minutes (prevent brute force)",
            "OTP send: 3 requests per hour per phone",
            "Implementation: express-rate-limit + Redis store",
            "Response when exceeded: 429 Too Many Requests",
            "Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset"
        ])

        self.box("Input Validation (Every Endpoint)", [
            "Library: Zod schemas (TypeScript)",
            "Validation on: Request body, query params, URL params",
            "Sanitization: Strip HTML tags, trim whitespace",
            "Email validation: RFC 5322 compliant",
            "Phone validation: E.164 format with country code",
            "Error response: 422 with detailed field errors"
        ])

        self.box("SQL Injection Prevention", [
            "ORM: Prisma (TypeScript) - automatic parameterization",
            "NO raw SQL queries (banned in code review)",
            "All queries use prepared statements",
            "User input NEVER interpolated into SQL strings"
        ])

        self.box("XSS Protection", [
            "CSP Headers: Content-Security-Policy set via Helmet.js",
            "No inline scripts: All JS in external files",
            "Output encoding: React auto-escapes (JSX)",
            "User-generated content: Sanitized with DOMPurify before render",
            "httpOnly cookies: JS cannot access tokens (prevents XSS theft)"
        ])

        self.box("CSRF Protection", [
            "SameSite cookies: SameSite=Strict (browser blocks cross-site)",
            "Double-submit pattern: CSRF token in cookie + header",
            "Token rotation: New CSRF token each session",
            "Validation: Backend checks X-CSRF-Token header matches cookie"
        ])

    def security_architecture(self):
        self.new_page()
        self.section("8. Security Architecture")

        self.subsection("8.1 Frontend Security - No Token Exposure")

        self.box("INSPECT ELEMENT PROTECTION", [
            "CRITICAL: No sensitive data visible in browser DevTools",
            "",
            "✅ Safe to see in DevTools:",
            "  • isAuthenticated: true/false (boolean flag)",
            "  • User's own profile data (name, email, city)",
            "  • Public product/category data",
            "  • UI state (modal open/closed, form values)",
            "",
            "❌ NEVER visible in DevTools:",
            "  • JWT access or refresh tokens",
            "  • API keys or secrets",
            "  • Other users' personal data",
            "  • Dealer contact info (before quote acceptance)",
            "  • Password hashes",
            "",
            "Implementation:",
            "• Tokens stored ONLY in httpOnly cookies (not accessible to JS)",
            "• Redux/Zustand state: Only user's own public data",
            "• API responses: Backend filters sensitive fields",
            "• Network tab: Tokens in cookie header (can't copy/paste easily)"
        ])

        self.box("localStorage Security", [
            "✅ Allowed in localStorage:",
            "  • isAuthenticated: true/false",
            "  • Theme preference (dark/light)",
            "  • Language preference",
            "  • UI settings (sidebar collapsed, etc.)",
            "  • Recently viewed products (public data)",
            "",
            "❌ NEVER in localStorage:",
            "  • Authentication tokens (use httpOnly cookies)",
            "  • Passwords or OTPs",
            "  • Sensitive user data",
            "  • API keys"
        ])

        self.subsection("8.2 Backend Security Layers")

        self.box("Layer 1: Network Security", [
            "HTTPS: Force redirect HTTP → HTTPS (HSTS header)",
            "TLS 1.3: Only modern encryption (no SSL, no TLS 1.0/1.1)",
            "Certificate: Let's Encrypt wildcard cert (*.hub4estate.com)",
            "Cloudflare: DDoS protection, WAF, bot filtering",
            "IP Whitelist: Admin APIs only from office IP (optional)"
        ])

        self.box("Layer 2: API Gateway (Reverse Proxy)", [
            "Nginx reverse proxy in front of Node.js",
            "Rate limiting: 100 req/15min per IP (nginx)",
            "Request size limit: 10MB max (prevent large payload DoS)",
            "Timeout: 30 seconds per request",
            "Headers: Remove server version (hide tech stack)",
            "CORS: Whitelist only hub4estate.com domains"
        ])

        self.box("Layer 3: Application Security", [
            "Authentication: JWT with short expiry + httpOnly cookies",
            "Authorization: Role-based (buyer, dealer, admin)",
            "Session management: Redis-backed, auto-expire",
            "Input validation: Zod schemas on every endpoint",
            "Output sanitization: DOMPurify for user content",
            "Database: Prisma ORM (no raw SQL)",
            "File uploads: Virus scan (ClamAV), size limit 5MB",
            "Secrets: Environment variables, never in code",
            "Logging: Structured logs (no passwords/tokens)"
        ])

        self.box("Layer 4: Database Security", [
            "Connection: SSL/TLS encrypted (requireSSL=true)",
            "Authentication: Strong password (32+ chars), rotated monthly",
            "Access: Only backend can connect (no public access)",
            "Encryption at rest: AES-256 for sensitive fields",
            "Backups: Daily automated, encrypted, 30-day retention",
            "Audit logs: All writes logged with user ID + timestamp",
            "Row-level security: Prisma middleware filters by user"
        ])

        self.subsection("8.3 Privacy & Compliance")

        self.box("GDPR / Data Privacy (India DPDP Act)", [
            "Data minimization: Collect only required fields",
            "Consent: Explicit opt-in for marketing emails",
            "Right to access: API endpoint for users to download their data",
            "Right to deletion: Users can request account deletion",
            "Data portability: Export data as JSON",
            "Retention: Deleted user data purged after 90 days",
            "Third parties: Only Twilio (OTP), SendGrid (email), AWS S3 (files)",
            "Privacy policy: Clear, accessible, updated regularly"
        ])

        self.box("PII Protection", [
            "Encrypted fields: Phone, email (optional), GST numbers",
            "Access control: Phone visible only after quote acceptance",
            "Logs: No PII in application logs (phone/email masked)",
            "Monitoring: Admins cannot see passwords/tokens (hashed)",
            "Analytics: No PII sent to Google Analytics (user ID only)"
        ])

        self.subsection("8.4 Fraud Prevention")

        self.box("User Fraud Detection", [
            "Phone verification: Required before creating RFQ",
            "Email verification: Optional but encouraged (bonus features)",
            "Rate limits: Max 5 RFQs per day per user",
            "Duplicate detection: Flag if same products + quantities repeatedly",
            "Fake RFQ patterns: ML model flags suspicious (e.g., 100 RFQs in 1 hour)",
            "Manual review: Flagged users reviewed by admin"
        ])

        self.box("Dealer Fraud Detection", [
            "GST verification: API call to GST portal (or manual check)",
            "Document verification: Human review of certificates",
            "Quote patterns: Flag if always underbidding by 50%+ (price dumping)",
            "Response rate: Low response = lower priority in RFQ feeds",
            "User reports: Buyers can report dealers, auto-suspend after 3 reports",
            "Review authenticity: Check for review bombing (IP, timing)"
        ])

    def admin_panel_specs(self):
        self.new_page()
        self.section("9. Admin Panel Specifications")

        self.subsection("9.1 Admin Panel Purpose")
        self.text("Centralized dashboard for platform management and oversight")
        self.y -= 10

        self.box("Admin Roles", [
            "SUPER_ADMIN: Full access (founder, CTO)",
            "ADMIN: Most access (operations team)",
            "MODERATOR: Limited (review content, approve dealers)",
            "VIEWER: Read-only (analysts, investors)"
        ])

        self.subsection("9.2 Admin Dashboard - Main Sections")

        self.subsubsection("A. Analytics Overview")
        self.ui_element('SECTION', 'Dashboard Home (/admin)', {
            'Layout': '4 stat cards at top, charts below',
            'Stat Cards': 'Total Users, Total Dealers, RFQs This Month, Quotes Sent',
            'Card Design': 'White bg, shadow, icon (colored), number (large), change % (vs last month)',
            'Chart 1': 'Line chart: RFQs over time (last 90 days)',
            'Chart 2': 'Bar chart: Quotes per category (top 10)',
            'Chart 3': 'Pie chart: RFQ status distribution',
            'Chart 4': 'Table: Top 10 dealers by quotes sent',
            'Filters': 'Date range picker (top right)',
            'Refresh': 'Auto-refresh every 60 seconds'
        })

        self.subsubsection("B. User Management")
        self.ui_element('SECTION', '/admin/users', {
            'Table Columns': 'ID, Name, Email, Phone, Role, City, Status, Created Date',
            'Filters': 'Status (Active/Suspended), Role, City, Registration date',
            'Search': 'By name, email, phone (fuzzy)',
            'Actions per row': 'View Profile, Suspend, Send Email, View RFQs',
            'Bulk actions': 'Export to CSV, Send bulk email',
            'Pagination': '50 per page',
            'Click row': 'Opens user detail modal'
        })

        self.box("User Detail Modal", [
            "User info: Name, email, phone (decrypted), role, city",
            "Account stats: Total RFQs, Total quotes received, Avg response time",
            "Recent activity: Last 10 actions (RFQ created, quote accepted, etc.)",
            "Actions:",
            "  • Suspend user (disable login, hide RFQs)",
            "  • Reset password (send reset email)",
            "  • Delete account (soft delete, 90-day grace period)",
            "  • Send email (compose inline)",
            "  • View audit log (all user actions)"
        ])

        self.subsubsection("C. Dealer Verification")
        self.ui_element('SECTION', '/admin/dealers', {
            'Tabs': 'Pending (default), Verified, Suspended, Rejected',
            'Pending Tab': 'Queue of dealers awaiting verification',
            'Card per dealer': 'Business name, city, GST number, registration date',
            'Actions': 'Review Application (opens modal)',
            'Sort': 'Registration date (oldest first = priority)'
        })

        self.box("Dealer Verification Modal", [
            "Left panel: Dealer info",
            "  • Business name, owner name",
            "  • Email, phone (click to call)",
            "  • Address, city, state",
            "  • GST number (with 'Verify on GST Portal' button)",
            "  • Brands selected, categories selected",
            "",
            "Right panel: Uploaded documents",
            "  • GST certificate (PDF/image viewer)",
            "  • Business proof (shop photo, license)",
            "  • Download all button",
            "",
            "Bottom: Decision actions",
            "  • Approve (green button): Status → VERIFIED, send welcome email",
            "  • Reject (red button): Status → REJECTED, send rejection email with reason",
            "  • Request more info (yellow): Email dealer asking for clarification",
            "",
            "Notes field: Internal notes for team (not visible to dealer)"
        ])

        self.subsubsection("D. Product Management")
        self.ui_element('SECTION', '/admin/products', {
            'Table': 'Product name, brand, category, MRP, status, created date',
            'Filters': 'Category, brand, status (active/inactive)',
            'Search': 'By name, model number',
            'Actions': 'Add Product (manual), Bulk Import (CSV), Edit, Deactivate',
            'Pagination': '100 per page'
        })

        self.box("Add/Edit Product Form", [
            "Basic Info:",
            "  • Name (required)",
            "  • Brand (dropdown, 500+ options)",
            "  • Category (dropdown, 12 options)",
            "  • Subcategory (dropdown, filtered by category)",
            "  • Model number",
            "",
            "Pricing:",
            "  • MRP (manufacturer's max retail price)",
            "  • Typical dealer price (optional, for guidance)",
            "",
            "Description:",
            "  • Rich text editor (WYSIWYG)",
            "  • Specifications (key-value pairs, dynamic)",
            "",
            "Images:",
            "  • Upload up to 6 images (drag & drop)",
            "  • Set primary image (for cards)",
            "  • Image requirements: Min 600x600px, max 2MB, JPG/PNG",
            "",
            "SEO:",
            "  • URL slug (auto-generated, editable)",
            "  • Meta description",
            "",
            "Status: Active / Inactive (toggle)"
        ])

        self.subsubsection("E. RFQ & Quote Monitoring")
        self.ui_element('SECTION', '/admin/rfqs', {
            'Table': 'RFQ #, User, Total Items, City, Status, Created, Total Quotes',
            'Filters': 'Status, city, date range',
            'Search': 'By RFQ number, user name',
            'Click row': 'Opens RFQ detail view'
        })

        self.box("RFQ Detail View (Admin)", [
            "RFQ info: Number, user (with link to profile), status, dates",
            "Items: List of products with quantities",
            "Quotes: Table of all quotes received",
            "  • Dealer name, price per unit, total, status, timestamp",
            "  • Highlight accepted quote (green)",
            "Activity log: Timeline of all events",
            "  • RFQ created, viewed by X dealers, quote received, accepted, etc.",
            "Admin actions:",
            "  • Close RFQ (if spam or violates terms)",
            "  • Contact user (email)",
            "  • View dealer profiles"
        ])

        self.subsubsection("F. Review Moderation")
        self.ui_element('SECTION', '/admin/reviews', {
            'Tabs': 'Pending (needs approval), Approved, Flagged, Rejected',
            'Card per review': 'Dealer name, user name, rating, review text, date',
            'Actions': 'Approve, Reject, Flag (suspicious)',
            'Filters': 'Rating (1-5), date range',
            'Search': 'By dealer or user name'
        })

        self.box("Review Moderation Rules", [
            "Auto-approve if:",
            "  • Rating 3-5 stars",
            "  • Review text < 500 chars",
            "  • No profanity detected (keyword filter)",
            "  • User has verified phone + email",
            "",
            "Require manual review if:",
            "  • Rating 1-2 stars (negative reviews)",
            "  • Contains flagged keywords (spam, scam, fraud, etc.)",
            "  • Very long review (>500 chars)",
            "  • User has <2 verified fields",
            "",
            "Auto-reject if:",
            "  • User never accepted quote from this dealer (fake review)",
            "  • Duplicate review (same user, same dealer)",
            "  • Contains URLs or email addresses (spam)"
        ])

        self.subsubsection("G. Analytics Deep Dive")
        self.ui_element('SECTION', '/admin/analytics', {
            'Date Range': 'Picker at top (preset: Last 7/30/90 days, Custom)',
            'Metrics Sections': 'User Growth, RFQ Trends, Dealer Performance, Revenue (future)'
        })

        self.box("User Growth Metrics", [
            "Total users: Count + growth % vs previous period",
            "New registrations: Daily line chart",
            "User roles: Pie chart (Homeowner, Contractor, etc.)",
            "Activation rate: % of users who created at least 1 RFQ",
            "Retention: % of users active in last 30 days",
            "Churn: % of users who haven't logged in for 90+ days"
        ])

        self.box("RFQ Trends", [
            "Total RFQs: Count + growth %",
            "RFQs by status: Bar chart (Pending, Quoted, Accepted, Closed)",
            "Avg quotes per RFQ: Number + trend line",
            "Top categories: Bar chart (which categories have most RFQs)",
            "Top cities: Table (Mumbai, Delhi, Bangalore, ...)",
            "Conversion rate: % of RFQs that got at least 1 quote",
            "Acceptance rate: % of quoted RFQs where user accepted a quote"
        ])

        self.box("Dealer Performance", [
            "Total dealers: Count (Verified, Active, Suspended)",
            "New dealer applications: Line chart over time",
            "Approval rate: % of applications approved",
            "Avg verification time: Days from registration to approval",
            "Top dealers: Table (by quotes sent, by deals closed, by rating)",
            "Response rate: % of RFQs viewed that got a quote",
            "Avg response time: Hours from RFQ creation to first quote"
        ])

    def folder_structure(self):
        self.new_page()
        self.section("10. Project Folder Structure")

        self.subsection("10.1 Monorepo Structure")
        self.text("Single repository with frontend, backend, and shared code", bold=True)
        self.y -= 10

        self.box("Root Directory", [
            "hub4estate/",
            "├── frontend/          # React + TypeScript + Vite",
            "├── backend/           # Node.js + Express + Prisma",
            "├── shared/            # Shared types, utilities",
            "├── docs/              # Documentation (PRD, API docs, etc.)",
            "├── .github/           # GitHub Actions (CI/CD)",
            "├── docker-compose.yml",
            "├── .gitignore",
            "├── README.md",
            "└── package.json       # Workspace root"
        ])

        self.subsection("10.2 Frontend Structure (React)")

        self.box("frontend/", [
            "├── public/",
            "│   ├── favicon.ico",
            "│   ├── logo.svg",
            "│   ├── og-image.jpg           # Open Graph image",
            "│   └── robots.txt",
            "│",
            "├── src/",
            "│   ├── assets/                # Static assets",
            "│   │   ├── images/",
            "│   │   ├── icons/",
            "│   │   └── fonts/             # Custom fonts (if any)",
            "│   │",
            "│   ├── components/            # Reusable components",
            "│   │   ├── common/            # Generic UI components",
            "│   │   │   ├── Button.tsx",
            "│   │   │   ├── Input.tsx",
            "│   │   │   ├── Card.tsx",
            "│   │   │   ├── Modal.tsx",
            "│   │   │   ├── Badge.tsx",
            "│   │   │   ├── Spinner.tsx",
            "│   │   │   └── index.ts       # Barrel export",
            "│   │   │",
            "│   │   ├── layout/            # Layout components",
            "│   │   │   ├── Header.tsx",
            "│   │   │   ├── Footer.tsx",
            "│   │   │   ├── Sidebar.tsx",
            "│   │   │   └── Layout.tsx     # Main wrapper",
            "│   │   │",
            "│   │   ├── auth/              # Auth-specific",
            "│   │   │   ├── LoginModal.tsx",
            "│   │   │   ├── GoogleLoginButton.tsx",
            "│   │   │   ├── OTPInput.tsx",
            "│   │   │   └── ProfileCompletionForm.tsx",
            "│   │   │",
            "│   │   ├── rfq/               # RFQ components",
            "│   │   │   ├── RFQForm.tsx",
            "│   │   │   ├── ProductSelector.tsx",
            "│   │   │   ├── RFQCard.tsx",
            "│   │   │   ├── QuoteCard.tsx",
            "│   │   │   └── QuoteComparison.tsx",
            "│   │   │",
            "│   │   ├── product/           # Product components",
            "│   │   │   ├── ProductCard.tsx",
            "│   │   │   ├── ProductGrid.tsx",
            "│   │   │   ├── CategoryCard.tsx",
            "│   │   │   ├── ImageGallery.tsx",
            "│   │   │   └── SpecTable.tsx",
            "│   │   │",
            "│   │   └── dealer/            # Dealer components",
            "│   │       ├── DealerCard.tsx",
            "│   │       ├── DealerOnboardingForm.tsx",
            "│   │       └── QuoteSubmitForm.tsx",
            "│   │",
            "│   ├── pages/                 # Page components (routes)",
            "│   │   ├── HomePage.tsx",
            "│   │   ├── CategoriesPage.tsx",
            "│   │   ├── ProductDetailPage.tsx",
            "│   │   ├── CreateRFQPage.tsx",
            "│   │   ├── MyRFQsPage.tsx",
            "│   │   ├── RFQDetailPage.tsx",
            "│   │   ├── DealerDashboard.tsx",
            "│   │   ├── DealerOnboarding.tsx",
            "│   │   ├── AdminDashboard.tsx",
            "│   │   ├── LoginPage.tsx",
            "│   │   └── NotFoundPage.tsx",
            "│   │",
            "│   ├── hooks/                 # Custom React hooks",
            "│   │   ├── useAuth.ts",
            "│   │   ├── useRFQ.ts",
            "│   │   ├── useProducts.ts",
            "│   │   ├── useDebounce.ts",
            "│   │   └── useInfiniteScroll.ts",
            "│   │",
            "│   ├── lib/                   # Core libraries",
            "│   │   ├── api.ts             # Axios instance",
            "│   │   ├── queryClient.ts     # React Query",
            "│   │   └── utils.ts           # Utility functions",
            "│   │",
            "│   ├── store/                 # State management (Zustand)",
            "│   │   ├── authStore.ts",
            "│   │   ├── rfqStore.ts",
            "│   │   └── uiStore.ts",
            "│   │",
            "│   ├── types/                 # TypeScript types",
            "│   │   ├── user.ts",
            "│   │   ├── dealer.ts",
            "│   │   ├── product.ts",
            "│   │   ├── rfq.ts",
            "│   │   └── api.ts",
            "│   │",
            "│   ├── styles/                # Global styles",
            "│   │   ├── globals.css        # Tailwind base + custom",
            "│   │   └── animations.css     # Keyframe animations",
            "│   │",
            "│   ├── App.tsx                # Root component",
            "│   ├── main.tsx               # Entry point",
            "│   └── router.tsx             # React Router config",
            "│",
            "├── .env.example",
            "├── .eslintrc.json",
            "├── package.json",
            "├── tsconfig.json",
            "├── tailwind.config.js",
            "├── vite.config.ts",
            "└── index.html"
        ])

        self.new_page()
        self.subsection("10.3 Backend Structure (Node.js)")

        self.box("backend/", [
            "├── prisma/",
            "│   ├── schema.prisma          # Database schema",
            "│   ├── seed.ts                # Seed data script",
            "│   └── migrations/            # Migration history",
            "│",
            "├── src/",
            "│   ├── routes/                # API routes (controllers)",
            "│   │   ├── auth.routes.ts",
            "│   │   ├── user.routes.ts",
            "│   │   ├── product.routes.ts",
            "│   │   ├── category.routes.ts",
            "│   │   ├── rfq.routes.ts",
            "│   │   ├── quote.routes.ts",
            "│   │   ├── dealer.routes.ts",
            "│   │   ├── review.routes.ts",
            "│   │   ├── admin.routes.ts",
            "│   │   └── index.ts           # Route aggregator",
            "│   │",
            "│   ├── services/              # Business logic",
            "│   │   ├── auth.service.ts",
            "│   │   ├── user.service.ts",
            "│   │   ├── product.service.ts",
            "│   │   ├── rfq.service.ts",
            "│   │   ├── quote.service.ts",
            "│   │   ├── dealer.service.ts",
            "│   │   ├── email.service.ts   # SendGrid integration",
            "│   │   ├── sms.service.ts     # Twilio integration",
            "│   │   ├── notification.service.ts",
            "│   │   └── analytics.service.ts",
            "│   │",
            "│   ├── middleware/",
            "│   │   ├── auth.middleware.ts # JWT verification",
            "│   │   ├── role.middleware.ts # RBAC (buyer, dealer, admin)",
            "│   │   ├── validation.middleware.ts",
            "│   │   ├── rateLimit.middleware.ts",
            "│   │   ├── error.middleware.ts",
            "│   │   └── logging.middleware.ts",
            "│   │",
            "│   ├── utils/",
            "│   │   ├── jwt.ts             # JWT helpers",
            "│   │   ├── encryption.ts      # AES-256 for PII",
            "│   │   ├── validators.ts      # Zod schemas",
            "│   │   ├── logger.ts          # Winston logger",
            "│   │   └── prisma.ts          # Prisma client singleton",
            "│   │",
            "│   ├── jobs/                  # Background jobs (cron)",
            "│   │   ├── expireRFQs.job.ts # Close expired RFQs",
            "│   │   ├── sendReminders.job.ts",
            "│   │   └── updateStats.job.ts",
            "│   │",
            "│   ├── types/                 # TypeScript types",
            "│   │   ├── express.d.ts       # Extend Express types",
            "│   │   └── api.ts",
            "│   │",
            "│   └── index.ts               # Express app entry",
            "│",
            "├── .env.example",
            "├── .eslintrc.json",
            "├── package.json",
            "├── tsconfig.json",
            "└── Dockerfile"
        ])

        self.subsection("10.4 Key File Responsibilities")

        self.box("Frontend - Key Files", [
            "src/main.tsx: Entry point, renders React app, sets up providers",
            "src/App.tsx: Root component, wraps entire app with context",
            "src/router.tsx: Defines all routes, protected routes, redirects",
            "src/lib/api.ts: Axios instance with interceptors (auto-refresh token)",
            "src/store/authStore.ts: Auth state (isAuthenticated, user profile)",
            "src/hooks/useAuth.ts: Auth hook (login, logout, register, refresh)",
            "src/components/layout/Layout.tsx: Wraps pages with Header+Footer",
            "src/pages/HomePage.tsx: Landing page component",
            "src/pages/CreateRFQPage.tsx: Multi-step RFQ form"
        ])

        self.box("Backend - Key Files", [
            "src/index.ts: Express app setup, middleware, routes, server start",
            "src/routes/*.routes.ts: API endpoints for each resource",
            "src/services/*.service.ts: Business logic (DB queries, validations)",
            "src/middleware/auth.middleware.ts: Verify JWT, attach user to req",
            "src/utils/jwt.ts: Generate + verify tokens",
            "src/utils/encryption.ts: Encrypt/decrypt PII (phone, GST)",
            "src/utils/prisma.ts: Prisma client (singleton, connection pooling)",
            "prisma/schema.prisma: Database schema (tables, relations)",
            "prisma/seed.ts: Seed script (categories, brands, sample data)"
        ])

    def implementation_roadmap(self):
        self.new_page()
        self.section("11. Implementation Roadmap")

        self.subsection("11.1 MVP Scope (Weeks 1-8)")
        self.text("Minimum Viable Product for launch", bold=True)
        self.y -= 10

        self.box("Week 1-2: Foundation", [
            "✓ Database schema design (final)",
            "✓ Backend setup (Express + Prisma + PostgreSQL)",
            "✓ Frontend setup (React + Vite + Tailwind)",
            "✓ Authentication (Google OAuth + Phone OTP)",
            "✓ Basic user model + JWT",
            "Deliverable: User can sign up and log in"
        ])

        self.box("Week 3-4: Core Features (Part 1)", [
            "✓ Product catalog (categories, products, search)",
            "✓ RFQ creation flow (3-step form)",
            "✓ RFQ listing for buyers",
            "✓ Dealer registration + verification (manual admin approval)",
            "Deliverable: Buyers can create RFQs, dealers can register"
        ])

        self.box("Week 5-6: Core Features (Part 2)", [
            "✓ RFQ feed for dealers (filtered by brands/categories)",
            "✓ Quote submission by dealers",
            "✓ Quote display on RFQ detail page",
            "✓ Quote acceptance + contact reveal",
            "✓ Email notifications (RFQ created, quote received, quote accepted)",
            "Deliverable: Full buyer-dealer flow working end-to-end"
        ])

        self.box("Week 7-8: Polish & Launch Prep", [
            "✓ Admin panel (dashboard, dealer verification, user management)",
            "✓ Review system (post-deal ratings)",
            "✓ Security hardening (rate limiting, CSRF, XSS protection)",
            "✓ Performance optimization (DB indexing, caching)",
            "✓ Deployment (AWS/DigitalOcean, domain, SSL)",
            "✓ Analytics integration (Google Analytics)",
            "Deliverable: Production-ready platform"
        ])

        self.subsection("11.2 Post-MVP Features (Months 2-6)")

        self.box("Month 2: Enhancements", [
            "• WhatsApp notifications (via Twilio API)",
            "• SMS alerts for quote acceptance",
            "• Dealer dashboard improvements (analytics)",
            "• Buyer dashboard (RFQ history, favorites)",
            "• Mobile responsiveness testing + fixes"
        ])

        self.box("Month 3: Growth Features", [
            "• Referral program (invite friends, get discount)",
            "• Dealer subscription tiers (premium placement, analytics)",
            "• Advanced search (filters, sorting, facets)",
            "• Saved searches (email alerts for matching RFQs)",
            "• Bulk RFQ upload (CSV for contractors)"
        ])

        self.box("Month 4-5: Community & Trust", [
            "• Community forum (Q&A, discussions)",
            "• Verified buyer badges (phone + email + 5+ RFQs)",
            "• Dealer certification program (verified + training)",
            "• Video product demos (uploaded by dealers)",
            "• Live chat support (Intercom or Crisp)"
        ])

        self.box("Month 6: Marketplace Features", [
            "• In-platform payments (Razorpay integration)",
            "• Escrow service (hold payment until delivery confirmed)",
            "• Order tracking (delivery status updates)",
            "• Invoice generation",
            "• GST-compliant billing"
        ])

print(f"\n{'='*70}")
print("GENERATING PRODUCT SPECIFICATION (NO CODE DUMPS)")
print(f"{'='*70}\n")

spec = ProductSpec()
spec.generate()

print(f"\n{'='*70}")
print("✅ SPECIFICATION COMPLETE")
print(f"{'='*70}\n")
