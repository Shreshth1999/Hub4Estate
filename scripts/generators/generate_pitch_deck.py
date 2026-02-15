#!/usr/bin/env python3
"""
Hub4Estate - Pitch Deck Generator
Creates a sharp, minimal, data-driven pitch deck PDF.
"""

from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Table, TableStyle
import os

# ─── COLORS ──────────────────────────────────────────────────────────────────
DARK_BG = HexColor("#0F1419")
ACCENT_BLUE = HexColor("#1DA1F2")
ACCENT_GREEN = HexColor("#00C853")
ACCENT_RED = HexColor("#FF3B30")
ACCENT_ORANGE = HexColor("#FF9500")
ACCENT_PURPLE = HexColor("#7C3AED")
LIGHT_TEXT = HexColor("#E8EAED")
MUTED_TEXT = HexColor("#8B95A2")
CARD_BG = HexColor("#1A2332")
CARD_BORDER = HexColor("#2D3B4E")
WHITE = white

W, H = landscape(A4)  # 841.89 x 595.28


def draw_bg(c):
    """Draw dark background."""
    c.setFillColor(DARK_BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_accent_line(c, y, width=None, color=ACCENT_BLUE):
    """Draw a thin accent line."""
    if width is None:
        width = W - 2 * inch
    c.setStrokeColor(color)
    c.setLineWidth(2)
    c.line(inch, y, inch + width, y)


def draw_card(c, x, y, w, h, fill=CARD_BG):
    """Draw a rounded card background."""
    c.setFillColor(fill)
    c.setStrokeColor(CARD_BORDER)
    c.setLineWidth(0.5)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=1)


def draw_stat_card(c, x, y, w, h, number, label, color=ACCENT_BLUE):
    """Draw a stat card with big number and label."""
    draw_card(c, x, y, w, h)
    # Color accent bar on top
    c.setFillColor(color)
    c.roundRect(x, y + h - 4, w, 4, 2, fill=1, stroke=0)
    # Number
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(x + w / 2, y + h / 2 - 5, str(number))
    # Label
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 10)
    c.drawCentredString(x + w / 2, y + 15, label)


def draw_comparison_bar(c, x, y, w, retail, dealer, label, savings_pct):
    """Draw a horizontal comparison bar showing retail vs dealer price."""
    bar_h = 22
    gap = 6

    # Label
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x, y + bar_h * 2 + gap + 8, label)

    # Retail bar (full width = retail price)
    c.setFillColor(ACCENT_RED)
    c.roundRect(x, y + bar_h + gap, w, bar_h, 4, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 8, y + bar_h + gap + 6, f"Retail: Rs.{retail:,}")

    # Dealer bar (proportional width)
    dealer_w = (dealer / retail) * w
    c.setFillColor(ACCENT_GREEN)
    c.roundRect(x, y, dealer_w, bar_h, 4, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 8, y + 6, f"Dealer: Rs.{dealer:,}")

    # Savings badge
    badge_x = x + w + 12
    c.setFillColor(ACCENT_GREEN)
    c.roundRect(badge_x, y + bar_h / 2 - 2, 80, 26, 6, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(badge_x + 40, y + bar_h / 2 + 4, f"-{savings_pct}%")


def draw_page_number(c, page, total=5):
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 9)
    c.drawRightString(W - 0.6 * inch, 0.4 * inch, f"{page}/{total}")


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1: TITLE
# ══════════════════════════════════════════════════════════════════════════════
def slide_1_title(c):
    draw_bg(c)

    # Subtle gradient accent at top
    c.setFillColor(ACCENT_BLUE)
    c.rect(0, H - 6, W, 6, fill=1, stroke=0)

    # Logo / Brand
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(inch, H - 1.2 * inch, "hub4estate")

    # Main title
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 52)
    c.drawString(inch, H - 2.8 * inch, "Hub4Estate")

    # Tagline
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(inch, H - 3.5 * inch, "India's Dealer Discovery Platform")

    draw_accent_line(c, H - 3.8 * inch, width=4.5 * inch)

    # Subtitle
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica", 15)
    c.drawString(inch, H - 4.4 * inch, "Connecting buyers directly with verified dealers.")
    c.drawString(inch, H - 4.7 * inch, "Save 20-50% on every purchase. No middlemen.")

    # Founder info
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 12)
    c.drawString(inch, 1.6 * inch, "Founded by")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(inch, 1.1 * inch, "Shreshth Agarwal")
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 11)
    c.drawString(inch, 0.7 * inch, "February 2025")

    # Right side: key stats preview
    sx = W - 4 * inch
    draw_stat_card(c, sx, H - 2.5 * inch, 1.6 * inch, 1.1 * inch, "Rs 3.26L", "Savings Proven", ACCENT_GREEN)
    draw_stat_card(c, sx + 1.8 * inch, H - 2.5 * inch, 1.6 * inch, 1.1 * inch, "29.6%", "Avg. Price Gap", ACCENT_BLUE)
    draw_stat_card(c, sx, H - 4.0 * inch, 1.6 * inch, 1.1 * inch, "63", "Products Tested", ACCENT_PURPLE)
    draw_stat_card(c, sx + 1.8 * inch, H - 4.0 * inch, 1.6 * inch, 1.1 * inch, "20", "Dealers Connected", ACCENT_ORANGE)

    draw_page_number(c, 1)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2: THE PROBLEM
# ══════════════════════════════════════════════════════════════════════════════
def slide_2_problem(c):
    draw_bg(c)

    # Header
    c.setFillColor(ACCENT_RED)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(inch, H - 0.8 * inch, "THE PROBLEM")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(inch, H - 1.5 * inch, "Indians overpay by 20-50%")
    c.setFont("Helvetica-Bold", 32)
    c.drawString(inch, H - 2.1 * inch, "on electrical goods. Every single day.")

    draw_accent_line(c, H - 2.4 * inch, width=7 * inch, color=ACCENT_RED)

    # Problem bullets
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica", 14)
    problems = [
        "Showrooms & retailers charge MRP or close to it - massive hidden margins",
        "Buyers have zero visibility into dealer/wholesale pricing",
        "No platform connects end-consumers to the dealer network",
        "Even for bulk purchases, people don't know whom to call",
    ]
    y = H - 2.9 * inch
    for p in problems:
        c.setFillColor(ACCENT_RED)
        c.circle(inch + 6, y + 5, 4, fill=1, stroke=0)
        c.setFillColor(LIGHT_TEXT)
        c.setFont("Helvetica", 12)
        c.drawString(inch + 20, y, p)
        y -= 26

    # DATA PROOF section
    proof_x = inch
    proof_y = H - 6.0 * inch

    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(proof_x, proof_y + 100, "REAL DATA  --  TESTED WITH 63 PRODUCTS, 20 DEALERS")

    # Sony Speaker comparison
    draw_comparison_bar(
        c, proof_x, proof_y + 10,
        w=4.2 * inch,
        retail=105000, dealer=66500,
        label="Sony Tower Speaker + 2 Mics",
        savings_pct=36.7
    )

    # Atomberg Fan comparison
    draw_comparison_bar(
        c, proof_x + 5.2 * inch, proof_y + 10,
        w=4.2 * inch,
        retail=5600, dealer=4460,
        label="Atomberg BLDC Ceiling Fan (per piece)",
        savings_pct=20.4
    )

    # Bottom stat bar
    stat_y = 0.5 * inch
    stat_w = (W - 2.4 * inch) / 4

    draw_stat_card(c, inch, stat_y, stat_w - 10, 0.8 * inch,
                   "Rs.11L+", "Total Retail Value Tested", ACCENT_RED)
    draw_stat_card(c, inch + stat_w, stat_y, stat_w - 10, 0.8 * inch,
                   "Rs.3.26L", "Total Savings Found", ACCENT_GREEN)
    draw_stat_card(c, inch + 2 * stat_w, stat_y, stat_w - 10, 0.8 * inch,
                   "29.6%", "Average Price Gap", ACCENT_BLUE)
    draw_stat_card(c, inch + 3 * stat_w, stat_y, stat_w - 10, 0.8 * inch,
                   "50%", "Max Gap Found", ACCENT_PURPLE)

    draw_page_number(c, 2)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3: THE PRODUCT
# ══════════════════════════════════════════════════════════════════════════════
def slide_3_product(c):
    draw_bg(c)

    # Header
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(inch, H - 0.8 * inch, "THE SOLUTION")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(inch, H - 1.5 * inch, "Hub4Estate: The dealer network")
    c.drawString(inch, H - 2.1 * inch, "in your pocket.")

    draw_accent_line(c, H - 2.4 * inch, width=6 * inch, color=ACCENT_BLUE)

    # How it works — 3 steps
    step_y = H - 3.2 * inch
    step_w = (W - 2.5 * inch) / 3

    # Step 1
    sx = inch
    draw_card(c, sx, step_y - 1.5 * inch, step_w - 15, 1.8 * inch)
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(sx + 15, step_y - 0.1 * inch, "01")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(sx + 15, step_y - 0.5 * inch, "Search & Inquire")
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica", 11)
    c.drawString(sx + 15, step_y - 0.8 * inch, "User searches for any")
    c.drawString(sx + 15, step_y - 1.0 * inch, "electrical product. Submits")
    c.drawString(sx + 15, step_y - 1.2 * inch, "inquiry with quantity needed.")

    # Step 2
    sx = inch + step_w
    draw_card(c, sx, step_y - 1.5 * inch, step_w - 15, 1.8 * inch)
    c.setFillColor(ACCENT_GREEN)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(sx + 15, step_y - 0.1 * inch, "02")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(sx + 15, step_y - 0.5 * inch, "Dealers Compete")
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica", 11)
    c.drawString(sx + 15, step_y - 0.8 * inch, "8-12 verified dealers get")
    c.drawString(sx + 15, step_y - 1.0 * inch, "notified. They send their")
    c.drawString(sx + 15, step_y - 1.2 * inch, "best prices with shipping.")

    # Step 3
    sx = inch + 2 * step_w
    draw_card(c, sx, step_y - 1.5 * inch, step_w - 15, 1.8 * inch)
    c.setFillColor(ACCENT_PURPLE)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(sx + 15, step_y - 0.1 * inch, "03")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(sx + 15, step_y - 0.5 * inch, "Compare & Save")
    c.setFillColor(LIGHT_TEXT)
    c.setFont("Helvetica", 11)
    c.drawString(sx + 15, step_y - 0.8 * inch, "User sees all quotes ranked")
    c.drawString(sx + 15, step_y - 1.0 * inch, "by price. Picks the best deal.")
    c.drawString(sx + 15, step_y - 1.2 * inch, "Saves 20-50% instantly.")

    # Key differentiators
    diff_y = step_y - 2.2 * inch
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(inch, diff_y, "WHY US")

    features = [
        ("Dealer-first model", "We don't sell. Dealers compete for the buyer. Best price wins."),
        ("18 Categories", "Lighting, Fans, Switches, Wires, MCBs, Speakers, Pumps & more."),
        ("Verified Network", "20+ dealers across 15 cities. Rated, reviewed, accountable."),
        ("Transparent Pricing", "Every quote shows product price + shipping + warranty. No hidden costs."),
    ]

    fx = inch
    fw = (W - 2 * inch) / 2
    for i, (title, desc) in enumerate(features):
        col = i % 2
        row = i // 2
        bx = fx + col * fw
        by = diff_y - 30 - row * 45

        c.setFillColor(ACCENT_GREEN)
        c.circle(bx + 6, by + 5, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(bx + 18, by, title)
        c.setFillColor(MUTED_TEXT)
        c.setFont("Helvetica", 10)
        c.drawString(bx + 18, by - 15, desc)

    draw_page_number(c, 3)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4: TRACTION & CUSTOMERS
# ══════════════════════════════════════════════════════════════════════════════
def slide_4_traction(c):
    draw_bg(c)

    # Header
    c.setFillColor(ACCENT_GREEN)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(inch, H - 0.8 * inch, "TRACTION & GO-TO-MARKET")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(inch, H - 1.5 * inch, "Early validation. Real savings.")
    c.drawString(inch, H - 2.1 * inch, "Ready to scale.")

    draw_accent_line(c, H - 2.4 * inch, width=5 * inch, color=ACCENT_GREEN)

    # Traction stats
    stat_y = H - 3.5 * inch
    stat_w = (W - 2.5 * inch) / 4

    draw_stat_card(c, inch, stat_y, stat_w - 10, 1 * inch,
                   "63", "Products Priced", ACCENT_BLUE)
    draw_stat_card(c, inch + stat_w, stat_y, stat_w - 10, 1 * inch,
                   "20", "Dealers Onboarded", ACCENT_GREEN)
    draw_stat_card(c, inch + 2 * stat_w, stat_y, stat_w - 10, 1 * inch,
                   "15", "Cities Covered", ACCENT_ORANGE)
    draw_stat_card(c, inch + 3 * stat_w, stat_y, stat_w - 10, 1 * inch,
                   "18", "Product Categories", ACCENT_PURPLE)

    # Two columns: Target Customers & Go-to-Market
    col_w = (W - 2.5 * inch) / 2
    col_y = stat_y - 0.5 * inch

    # LEFT: Target Customers
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(inch, col_y, "TARGET CUSTOMERS")

    customers = [
        ("Homeowners", "Renovating or building — need bulk electricals"),
        ("Interior Designers", "Buying for clients, need best dealer rates"),
        ("Contractors", "Regular bulk buyers, price-sensitive"),
        ("Small Businesses", "Office/shop setup, need switches, lights, ACs"),
        ("Retail Buyers", "Anyone buying 1+ item and wanting dealer price"),
    ]

    cy = col_y - 30
    for title, desc in customers:
        c.setFillColor(ACCENT_BLUE)
        c.circle(inch + 6, cy + 5, 3, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(inch + 18, cy, title)
        c.setFillColor(MUTED_TEXT)
        c.setFont("Helvetica", 9.5)
        c.drawString(inch + 18, cy - 14, desc)
        cy -= 36

    # RIGHT: Go-to-Market
    rx = inch + col_w + 15
    c.setFillColor(ACCENT_GREEN)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(rx, col_y, "GO-TO-MARKET STRATEGY")

    strategies = [
        ("WhatsApp-First", "Share quotes via WhatsApp. Viral loop built-in."),
        ("Dealer Partnerships", "Onboard dealers city-by-city. They bring buyers."),
        ("Content & SEO", "\"Best price for [product]\" — capture search intent."),
        ("Referral Program", "Users share savings screenshots. Social proof."),
        ("Builder/Architect Tie-ups", "B2B channel for bulk project sourcing."),
    ]

    cy = col_y - 30
    for title, desc in strategies:
        c.setFillColor(ACCENT_GREEN)
        c.circle(rx + 6, cy + 5, 3, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(rx + 18, cy, title)
        c.setFillColor(MUTED_TEXT)
        c.setFont("Helvetica", 9.5)
        c.drawString(rx + 18, cy - 14, desc)
        cy -= 36

    # Revenue model at bottom
    bottom_y = 0.5 * inch
    draw_card(c, inch, bottom_y, W - 2 * inch, 0.7 * inch, fill=HexColor("#0D2818"))
    c.setFillColor(ACCENT_GREEN)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(inch + 15, bottom_y + 30, "REVENUE MODEL:")
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 11)
    c.drawString(inch + 155, bottom_y + 30,
                 "Commission per transaction (2-5%)  |  Dealer subscription plans  |  Featured listings for dealers")
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 10)
    c.drawString(inch + 15, bottom_y + 10,
                 "India's electrical goods market: Rs.2.5L Cr+. Even 0.01% = Rs.250 Cr TAM for Hub4Estate.")

    draw_page_number(c, 4)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5: NEXT 2 WEEKS ROADMAP
# ══════════════════════════════════════════════════════════════════════════════
def slide_5_roadmap(c):
    draw_bg(c)

    # Header
    c.setFillColor(ACCENT_PURPLE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(inch, H - 0.8 * inch, "THE NEXT 2 WEEKS")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(inch, H - 1.5 * inch, "Sprint plan. Ship fast.")
    c.drawString(inch, H - 2.1 * inch, "Validate harder.")

    draw_accent_line(c, H - 2.4 * inch, width=4.5 * inch, color=ACCENT_PURPLE)

    # Two-week split
    week_w = (W - 2.5 * inch) / 2
    wy = H - 2.9 * inch

    # ── WEEK 1 ──
    wx = inch
    draw_card(c, wx, wy - 3.3 * inch, week_w - 10, 3.5 * inch, fill=HexColor("#1A1A2E"))
    c.setFillColor(ACCENT_BLUE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(wx + 15, wy - 0.05 * inch, "WEEK 1 — BUILD")
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 10)
    c.drawString(wx + 145, wy - 0.05 * inch, "Feb 12 - Feb 18")

    week1_tasks = [
        ("Platform", "Launch MVP web app with product search & inquiry form"),
        ("Dealers", "Onboard 30 more dealers (target: 50 total) across 5 new cities"),
        ("Database", "Add 200+ products with real pricing across all 18 categories"),
        ("Inquiry Flow", "Build automated dealer notification system (WhatsApp API)"),
        ("Auth & Profiles", "Dealer dashboard with quote management & response tracking"),
        ("SEO", "Deploy product landing pages for top 50 searched electrical items"),
    ]

    ty = wy - 0.5 * inch
    for tag, task in week1_tasks:
        # Tag badge
        c.setFillColor(ACCENT_BLUE)
        c.roundRect(wx + 15, ty - 3, 62, 18, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(wx + 46, ty + 1, tag)
        # Task
        c.setFillColor(LIGHT_TEXT)
        c.setFont("Helvetica", 10.5)
        c.drawString(wx + 85, ty, task)
        ty -= 26

    # ── WEEK 2 ──
    wx = inch + week_w + 10
    draw_card(c, wx, wy - 3.3 * inch, week_w - 10, 3.5 * inch, fill=HexColor("#1A1A2E"))
    c.setFillColor(ACCENT_GREEN)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(wx + 15, wy - 0.05 * inch, "WEEK 2 — VALIDATE")
    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 10)
    c.drawString(wx + 175, wy - 0.05 * inch, "Feb 19 - Feb 25")

    week2_tasks = [
        ("Users", "Run 50 real inquiries through the platform end-to-end"),
        ("Metrics", "Track conversion: inquiry → quote → purchase completion"),
        ("Feedback", "Interview 20 buyers & 10 dealers on experience & pricing"),
        ("Growth", "Launch WhatsApp referral loop — users share savings screenshots"),
        ("Content", "Publish 10 comparison articles (\"Best price for X in India\")"),
        ("Iterate", "Ship v2 with top feedback: filters, price alerts, saved quotes"),
    ]

    ty = wy - 0.5 * inch
    for tag, task in week2_tasks:
        c.setFillColor(ACCENT_GREEN)
        c.roundRect(wx + 15, ty - 3, 62, 18, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(wx + 46, ty + 1, tag)
        c.setFillColor(LIGHT_TEXT)
        c.setFont("Helvetica", 10.5)
        c.drawString(wx + 85, ty, task)
        ty -= 26

    # Bottom CTA
    cta_y = 0.4 * inch
    draw_card(c, inch, cta_y, W - 2 * inch, 0.85 * inch, fill=HexColor("#1B0B3A"))
    c.setFillColor(ACCENT_PURPLE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(inch + 20, cta_y + 42, "2-WEEK GOAL:")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(inch + 165, cta_y + 42, "50 dealers  |  200+ products  |  50 real inquiries  |  First 10 completed transactions")

    c.setFillColor(MUTED_TEXT)
    c.setFont("Helvetica", 11)
    c.drawString(inch + 20, cta_y + 15, "Shreshth Agarwal  •  hub4estate  •  Let's build India's dealer discovery layer.")

    draw_page_number(c, 5)


# ══════════════════════════════════════════════════════════════════════════════
# GENERATE PDF
# ══════════════════════════════════════════════════════════════════════════════
def generate():
    output = os.path.join(os.path.dirname(__file__), "Hub4Estate_Pitch_Deck.pdf")
    c = canvas.Canvas(output, pagesize=landscape(A4))
    c.setTitle("Hub4Estate - Pitch Deck")
    c.setAuthor("Shreshth Agarwal")

    slide_1_title(c)
    c.showPage()

    slide_2_problem(c)
    c.showPage()

    slide_3_product(c)
    c.showPage()

    slide_4_traction(c)
    c.showPage()

    slide_5_roadmap(c)
    c.showPage()

    c.save()
    print(f"Pitch deck saved to: {output}")
    return output


if __name__ == "__main__":
    generate()
