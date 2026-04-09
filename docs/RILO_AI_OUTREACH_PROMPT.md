# RILO AI AUTOMATION PROMPT — Hub4Estate Daily Outreach Machine

**For**: Reetik (automation setup on Rilo AI)
**Platform**: Rilo AI Automation Builder
**Connected Account**: shreshth.agarwal@hub4estate.com
**Schedule**: Every day, 8:00 AM IST, 7 days/week, 365 days/year
**Volume**: 500 unique personalized emails per day — one to each person on the list
**Duration**: 1 full year (April 2026 → April 2027)
**Zero manual triggers**: Fully autonomous after setup
**Date Created**: 9 April 2026

---

## THE CORE CONCEPT

This is NOT a drip campaign. This is NOT a follow-up sequence.

This is a **daily relationship-building machine**. Every single morning, all 500 people on the list receive a fresh, unique, short, personalized email from Shreshth. Every day is different. The emails evolve over time. They reference that it's Day 2, Day 14, Day 87, Day 200. They share new updates, new wins, new numbers, new learnings. They are short — 4 to 8 lines MAX. They feel like a founder who genuinely cares is keeping you in the loop because he respects you.

Think of it as a **daily founder journal sent to 500 people who matter**.

---

## STEP 1: BUILD THE MASTER LIST OF 500 PEOPLE

### How to find them:

1. **Search LinkedIn, Crunchbase, AngelList, Tracxn, VCCEdge** for Indian VCs, angels, and founders
2. **Scrape their business email** using Hunter.io, Apollo.io, Snov.io, Clearbit, or any enrichment tool available in Rilo
3. **If email is NOT found for a person**: Add them to the list anyway. In their row, write `EMAIL_NOT_FOUND — FIND MANUALLY`. Reetik will fill these in by hand. DO NOT skip anyone just because the email isn't auto-found.
4. **Verify all found emails** through ZeroBounce / NeverBounce / Rilo's built-in verifier before Day 1

### Data to collect per person:

| Field | Required | Example |
|-------|----------|---------|
| full_name | Yes | Arjun Vaidya |
| first_name | Yes | Arjun |
| email | Yes (or EMAIL_NOT_FOUND) | arjun@example.com |
| linkedin_url | Yes | linkedin.com/in/arjunvaidya |
| company | Yes | Dr. Vaidya's / Angel Investor |
| role | Yes | Founder & Angel |
| category | Yes | A / B / C / D |
| city | Yes | Mumbai |
| sector_expertise | Yes | D2C, Consumer, Healthcare |
| known_for | Yes | Built Dr. Vaidya's, Shark Tank India judge |
| recent_activity | Refresh weekly | "Posted about backing non-tech founders on LinkedIn" |
| tone_preference | Yes | casual / respectful-formal / sir-culture |
| their_portfolio | If applicable | Invested in XYZ, ABC |
| shared_connection | If any | "Both attended TechSparks 2024" |
| reply_status | Auto-tracked | no_reply / replied_positive / replied_negative / replied_referral / removed |

---

### THE 500 PEOPLE — CATEGORY BREAKDOWN

#### CATEGORY A: Angel Investors & Operator-Angels (150 people)

Active Indian angels who invest personal capital. Prioritize those who understand supply chains, B2B, marketplaces, real estate, or construction.

**Named targets (find their emails + fill remaining slots with similar profiles):**

| # | Name | Known For | City |
|---|------|-----------|------|
| 1 | Arjun Vaidya | Dr. Vaidya's founder, prolific angel | Mumbai |
| 2 | Ritesh Agarwal | OYO founder | Delhi/Global |
| 3 | Kunal Shah | CRED founder | Bangalore |
| 4 | Varun Alagh | Mamaearth co-founder | Gurgaon |
| 5 | Ghazal Alagh | Mamaearth co-founder, Shark Tank | Gurgaon |
| 6 | Aman Gupta | boAt founder | Delhi |
| 7 | Vineeta Singh | SUGAR Cosmetics | Mumbai |
| 8 | Anupam Mittal | Shaadi.com / People Group | Mumbai |
| 9 | Peyush Bansal | Lenskart founder | Delhi |
| 10 | Namita Thapar | Emcure Pharma | Pune |
| 11 | Ashneer Grover | BharatPe (former), Third Unicorn | Delhi |
| 12 | Nikhil Kamath | Zerodha co-founder | Bangalore |
| 13 | Nithin Kamath | Zerodha founder | Bangalore |
| 14 | Sanjeev Bikchandani | Naukri / Info Edge founder | Delhi |
| 15 | Deepinder Goyal | Zomato founder | Gurgaon |
| 16 | Naveen Tewari | InMobi founder | Bangalore |
| 17 | Phani Kishan Addepalli | Darwinbox founder | Hyderabad |
| 18 | Sahil Barua | Delhivery founder | Gurgaon |
| 19 | Sriharsha Majety | Swiggy founder | Bangalore |
| 20 | Kalyan Krishnamurthy | Flipkart CEO | Bangalore |
| 21 | Bhavish Aggarwal | Ola / Krutrim founder | Bangalore |
| 22 | Vijay Shekhar Sharma | Paytm founder | Noida |
| 23 | Dhruv Agarwala | PropTiger / Housing.com CEO | Gurgaon |
| 24 | Tanuj Shrinivas | Ather Energy co-founder | Bangalore |
| 25 | Rahul Yadav | Housing.com (former) | Mumbai |
| 26 | T.V. Mohandas Pai | Manipal Group / Aarin Capital | Bangalore |
| 27 | Rajan Anandan | Peak XV / former Google India | Bangalore |
| 28 | Rajesh Sawhney | GSF Accelerator / InnerChef | Delhi |
| 29 | Sanjay Mehta | 100X.VC | Mumbai |
| 30 | Binny Bansal | Flipkart co-founder, xto10x | Bangalore |

**→ Find 120 MORE angel investors** with similar profiles. Focus on: ex-founders who angel invest, CXOs who do side bets, NRI angels investing in India, family office operators, HNIs in real estate/construction who've started angel investing.

---

#### CATEGORY B: VC Partners (150 people — individual humans, NOT firm emails)

Get the **specific partner's name and personal/work email** at each firm. Target the partner who handles seed/pre-seed/early-stage, especially B2B or marketplace.

| # | Firm | Target Partner(s) |
|---|------|-------------------|
| 1 | Blume Ventures | Karthik Reddy, Sanjay Nath |
| 2 | India Quotient | Anand Lunia, Madhukar Sinha |
| 3 | Titan Capital | Kunal Bahl, Rohit Bansal |
| 4 | Better Capital | Vaibhav Domkundwar |
| 5 | Lightspeed India | Dev Khare, Hemant Mohapatra |
| 6 | Elevation Capital | Ravi Adusumalli, Mukul Arora |
| 7 | Peak XV (Sequoia India) | Shailendra Singh, Rajan Anandan |
| 8 | Accel India | Prayank Swaroop, Barath Shankar Subramanian |
| 9 | Matrix Partners India | Vikram Vaidyanathan, Tarun Davda |
| 10 | Stellaris Venture Partners | Alok Goyal, Rahul Chowdhri |
| 11 | 3one4 Capital | Siddarth Pai, Pranav Pai |
| 12 | Nexus Venture Partners | Jishnu Bhattacharjee, Sameer Brij Verma |
| 13 | Chiratae Ventures | Sudhir Sethi, Venkatesh Peddi |
| 14 | Kalaari Capital | Vani Kola |
| 15 | Venture Highway | Samir Sood, Neeraj Arora |
| 16 | WaterBridge Ventures | Manish Kheterpal |
| 17 | Antler India | Rajiv Srivatsa |
| 18 | 100X.VC | Sanjay Mehta, Shashank Randev |
| 19 | ah! Ventures | Harshad Lahoti |
| 20 | LetsVenture | Shanti Mohan |
| 21 | Fireside Ventures | Kanwaljit Singh |
| 22 | DSG Consumer Partners | Deepak Shahdadpuri |
| 23 | Jungle Ventures | Amit Anand |
| 24 | Omnivore Partners | Mark Kahn, Jinesh Shah |
| 25 | Avaana Capital | Anjali Bansal |
| 26 | She Capital | Vishakha Singh |
| 27 | Sauce.vc | Anurag Kedia |
| 28 | Z47 (formerly Matrix) | Avnish Bajaj |
| 29 | Orios Venture Partners | Rehan Yar Khan |
| 30 | Prime Venture Partners | Sanjay Swamy, Amit Somani |
| 31 | Together Fund | Girish Mathrubootham, Manish Vij |
| 32 | Fundamentum Partnership | Nandan Nilekani |
| 33 | Arkam Ventures | Rahul Chandra |
| 34 | 8i Ventures | Vikram Gupta |
| 35 | Athera Venture Partners | Rutvik Doshi |

**→ Find 115 MORE VC partners** from: micro-VCs, solo GPs, rolling funds, syndicate leads on AngelList/LetsVenture, emerging fund managers, sector-specific funds (proptech, B2B, supply chain), regional funds (Rajasthan, Gujarat, Maharashtra).

---

#### CATEGORY C: Founders of Adjacent Companies (125 people)

Founders/CEOs in construction, real estate, home services, B2B marketplaces, supply chain, manufacturing tech. They FEEL the problem.

| # | Name | Company | Why |
|---|------|---------|-----|
| 1 | Dinesh Agarwal | IndiaMART | B2B marketplace godfather |
| 2 | Brijesh Agrawal | IndiaMART co-founder | Same |
| 3 | Aaditya Sharda | Infra.Market | Construction materials — direct space |
| 4 | Souvik Sengupta | Infra.Market | Same |
| 5 | Srikanth Iyer | HomeLane | Home interiors marketplace |
| 6 | Tanuj Choudhry | Square Yards | Real estate platform |
| 7 | Arun Chandra Mohan | NoBroker | Real estate marketplace |
| 8 | Akhil Gupta | NoBroker | Same |
| 9 | Neysa Sanghavi | MaterialDepot | Construction materials |
| 10 | Vidit Aatrey | Meesho | Marketplace for Tier 2/3 |
| 11 | Vaibhav Gupta | Udaan | B2B commerce |
| 12 | Sujeet Kumar | Udaan co-founder | Same |
| 13 | Amod Malviya | Udaan co-founder | Same |
| 14 | Rahul Garg | Moglix | B2B industrial marketplace |
| 15 | Karan Virwani | WeWork India CEO | Real estate + commercial |
| 16 | Abhishek Goyal | Tracxn | Knows every startup |
| 17 | Girish Mathrubootham | Freshworks | B2B SaaS legend |
| 18 | Bhavin Turakhia | Zeta / Directi | Serial tech founder |
| 19 | Shashank ND | Practo | Marketplace in services |
| 20 | Aprameya Radhakrishna | Koo / TaxiForSure | Serial entrepreneur |
| 21 | Vaibhav Sisinty | GrowthSchool | Distribution + marketing |
| 22 | Ankur Warikoo | WebVeda | Content + startup ecosystem |
| 23 | Sahil Vaidya | The Souled Store | D2C + supply chain |
| 24 | Vivek Gupta | Licious | Supply chain marketplace |
| 25 | Albinder Dhindsa | Blinkit | Last-mile logistics |
| 26 | Varun Khaitan | Urban Company co-founder | Service marketplace |
| 27 | Abhiraj Bhal | Urban Company co-founder | Same |
| 28 | Vishal Gupta | Zetwerk | Manufacturing marketplace |
| 29 | Srinath Ramakkrushnan | Zetwerk co-founder | Same |
| 30 | Prashant Prakash | Accel (but also founded DealsAndYou) | Investor + operator |

**→ Find 95 MORE founders** from: Havells leadership, Polycab leadership, Asian Paints digital, Godrej Properties, Brick&Bolt, BuildSupply, Contractorbhai, Homelane, Livspace, Saint-Gobain India, Schneider Electric India, Legrand India, Crompton Greaves, Bajaj Electricals, Orient Electric, Finolex, Anchor (Panasonic), MagicBricks, 99acres, CommonFloor alumni, Quikr Homes team.

---

#### CATEGORY D: Ecosystem Leaders, Mentors, Media, Accelerators (75 people)

| # | Name/Org | Role |
|---|----------|------|
| 1 | Shradha Sharma | YourStory founder |
| 2 | Padmaja Ruparel | IAN Fund |
| 3 | Saurabh Srivastava | IAN co-founder |
| 4 | NASSCOM 10K Startups | Head of program |
| 5 | Startup India Hub | Program director |
| 6 | T-Hub Hyderabad | CEO |
| 7 | NSRCEL IIM Bangalore | Director |
| 8 | CIIE IIM Ahmedabad | Director |
| 9 | Jito Angel Network | Lead |
| 10 | Marwari Catalysts | Lead |
| 11 | TiE Delhi chapter | President |
| 12 | TiE Mumbai chapter | President |
| 13 | TiE Bangalore chapter | President |
| 14 | TiE Rajasthan chapter | If exists |
| 15 | iStart Rajasthan | Program head |
| 16 | Mekin Maheshwari | Udhyam Learning, ex-Flipkart CTO |
| 17 | Sharad Sharma | iSPIRT co-founder |
| 18 | Mohandas Pai | Aarin Capital, 3one4 |
| 19 | Kris Gopalakrishnan | Axilor, Infosys co-founder |
| 20 | Techstars India | Managing Director |

**→ Find 55 MORE**: podcast hosts (The Ken, Barbershop, Indian Silicon Valley), startup journalists, LinkedIn startup influencers, accelerator heads (Surge, Y Combinator India scouts, Plug and Play India), business school entrepreneurship cell heads (IIM, ISB, BITS).

---

## STEP 2: THE DAILY EMAIL ENGINE

### Core Rules — NON-NEGOTIABLE

1. **500 emails sent every single day** — one to each person on the list
2. **Every day, 7 days a week** — Monday through Sunday, no breaks
3. **For 1 full year** — Day 1 to Day 365
4. **8:00 AM IST trigger** — emails start going out at 8 AM, staggered over 2-3 hours with random 10-30 second gaps between each send
5. **Every single email is unique** — no two people receive the same email on any given day, and no person receives the same email twice across the entire year
6. **Emails are SHORT** — 4 to 8 lines maximum. Not a single email should exceed 8 lines of body text (excluding signature)
7. **Personalized to their profile** — every email references something specific about THAT person
8. **Day-aware** — the email knows what day number it is for that recipient and naturally references it (not robotically like "This is Day 47" — but naturally like "I know I've been in your inbox for a while now")
9. **Plain text only** — no HTML, no images, no tracking pixels, no formatting
10. **Sounds like a real 18-year-old founder** — casual, honest, sometimes raw, never corporate
11. **NO AI giveaway phrases** — see banned list below

### Sending Mechanics

- **Sender**: Shreshth Agarwal <shreshth.agarwal@hub4estate.com>
- **Reply-to**: shreshth.agarwal@hub4estate.com
- **Stagger**: Random 10-30 second gap between each email (500 emails over ~2-3 hours starting 8 AM)
- **Warm-up period** (first 10 days):
  - Day 1-3: Send to 50 people/day (start with Category C)
  - Day 4-6: Send to 150 people/day
  - Day 7-9: Send to 300 people/day
  - Day 10 onwards: Full 500/day
- **Use multiple sending IPs / warm-up tools if needed** to maintain deliverability at 500/day volume

---

## STEP 3: EMAIL CONTENT STRATEGY BY PHASE

The year is divided into **phases**. The email tone, content, and purpose evolves over time.

### PHASE 1: INTRODUCTION (Day 1-7)

**Purpose**: Who is Shreshth, what is Hub4Estate, why should they care

**Day 1 email structure:**
- Personalized opener referencing THEM (their company, an investment, a post)
- The problem: buyers overpay 20-40% on construction materials. No transparency.
- The solution: Hub4Estate — blind bidding marketplace for construction materials
- The proof: real numbers (₹24K saved, ₹68K vs ₹1.05L, etc.)
- The ask: not money. Need a tech co-founder. Open to a conversation.
- Links: pitch deck + website
- Sign off

**Day 2-7 emails**: Each day picks ONE angle and goes deeper:
- Day 2: The buyer's pain (personal story — father getting 50 broker calls)
- Day 3: The dealer's pain (good dealers have no way to reach buyers beyond their city)
- Day 4: How blind bidding works (quick 3-line explanation)
- Day 5: A specific deal story (the Sony speaker deal, or the LED panel deal)
- Day 6: Why electricals first (strategic beachhead, ₹8-10L Cr market)
- Day 7: The real ask — "I can sell, I can close, I can't code. That's the gap."

**Sample Day 1 email (to Arjun Vaidya — paraphrase for everyone else):**
```
Hey Arjun,

What you built with Dr. Vaidya's — taking on a market everyone assumed was done — I think about that a lot.

I'm doing something similar in construction materials. Quick version: buyers in India overpay 20-40% on everything because there's no price competition at the dealer level. We built a blind-bidding marketplace. Dealers compete, buyers save. Manually served 10 clients in Sri Ganganagar — saved one guy ₹24K on a single LED panel order.

Not asking for capital. I'm 18, non-tech, and looking for the right CTO/tech co-founder. If anyone comes to mind — or if you have 10 mins — I'd be grateful.

Deck: https://shreshth1999.github.io/Hub4Estate/
Site: https://hub4estate.com

Shreshth
+91 7690001999
```

**Sample Day 2 email (same person):**
```
Hey Arjun,

Me again — Shreshth from Hub4Estate. Yesterday I shared the big picture, today just one story.

My dad's been in real estate in Rajasthan for 20+ years. Every project, he'd call 5-6 dealers for the same wire or MCB. Quotes ranged from ₹83 to ₹127 per meter for the exact same cable. No way to know who's fair. No competition. Just vibes and relationships.

That one problem — that price gap — is what Hub4Estate fixes. Verified dealers, blind bids, real savings.

Still looking for that tech co-founder. If anyone pings your radar, I'm all ears.

Shreshth
```

---

### PHASE 2: BUILDING IN PUBLIC (Day 8-30)

**Purpose**: Show momentum, share updates, build familiarity

Each day's email is a **micro-update** — 4-6 lines:
- New client signed
- New dealer onboarded
- A problem you faced and how you solved it
- A market insight you discovered
- Something you learned about procurement
- A number that changed (savings %, client count, dealer count)
- A question you're wrestling with (makes it interactive)

**Sample Day 12 email:**
```
Hey Arjun,

Day 12 of keeping you posted. Quick one.

Signed our 12th client yesterday — a contractor in Jodhpur building a 4BHK. He was about to buy wiring at ₹95/meter from his usual guy. We got 4 dealers to bid blind. Winning bid: ₹71/meter. He saved ₹9,600 on just the wiring.

Still no tech team though. I'm running all of this on WhatsApp and Google Sheets. If that's not proof of product-market fit, I don't know what is.

Shreshth
```

**Sample Day 21 email:**
```
Arjun,

Thought you'd find this interesting. We mapped pricing for FRLS 2.5mm cable across 14 dealers in Rajasthan. Same brand, same spec. Price difference between cheapest and most expensive: 53%.

That's not a market. That's a lottery. And buyers don't even know they're playing.

This is what Hub4Estate is fixing, one blind bid at a time. 14 clients now.

Shreshth
```

---

### PHASE 3: THE GRIND (Day 31-90)

**Purpose**: Show consistency, share deeper insights, reference that you've been writing for a while

Emails become more varied:
- **Monday**: Weekly number update (clients, deals, savings)
- **Tuesday**: A market insight or pricing data point
- **Wednesday**: A personal founder reflection (struggle, learning, decision)
- **Thursday**: A specific deal story or client testimonial
- **Friday**: Something you read/learned that's relevant to their world
- **Saturday**: A casual/light email (shorter, more human)
- **Sunday**: A question or thought experiment

**Sample Day 45 email:**
```
Hey Arjun,

45 days in your inbox. The fact that you haven't told me to stop might mean something — or you have a great spam filter.

Either way, real update: we crossed ₹3L in documented savings for clients this month. 18 active clients now, all organic, all Tier 2 Rajasthan.

I'm still running this on WhatsApp + Sheets. The irony of building a tech marketplace without a tech person isn't lost on me.

Shreshth
```

**Sample Day 60 email:**
```
Arjun,

Two months. Still writing. Still building.

This week I realized something: the real value isn't just cheaper prices. It's that our clients now KNOW what fair price looks like. One guy told me — "pehle toh pata hi nahi hota tha ki zyada de rahe hain." That's the real unlock.

If you know a technical person who'd want to build India's first construction price-transparency layer — I'm ready to move fast.

Shreshth
hub4estate.com
```

---

### PHASE 4: RELATIONSHIP MODE (Day 91-180)

**Purpose**: You're no longer a stranger. Emails become more personal, more conversational, shorter.

By now, if they haven't replied, they at least know who you are. The emails shift:
- Share wins without asking for anything
- Congratulate them on THEIR news (fund raise, new investment, media feature)
- Ask genuine questions about their domain
- Share something useful to THEM (an article, a data point about their portfolio company's market)

**Sample Day 100 email:**
```
Hey Arjun,

100 days. Triple digits.

Not asking for anything today. Just wanted to say — I saw your recent investment in [X]. Makes total sense given your thesis on India-first brands.

On my end: 24 clients, ₹8L+ cumulative savings, and I finally started talking to a developer in Jaipur about building a proper platform. Early days but movement.

Cheering for you from Rajasthan.

Shreshth
```

**Sample Day 130 email:**
```
Arjun,

Quick thought and then I'll let you go.

I've been thinking about why construction materials haven't been "Amazon-ified" yet despite being a ₹50L crore market. My theory: the problem isn't tech — it's trust. Builders trust their dealer more than any app. So you can't just build a platform. You have to earn the right to be in the chain.

That's what the blind bidding does — it doesn't remove the dealer. It makes dealers compete fairly. Everyone wins except the guy who was overcharging.

Anyway. Just thinking out loud. Happy Wednesday.

Shreshth
```

---

### PHASE 5: PERSISTENCE (Day 181-270)

**Purpose**: The sheer consistency becomes the message. You're the most persistent founder in their inbox.

Emails are now 3-5 lines. Very casual. Like texting a mentor.

**Sample Day 200 email:**
```
Arjun,

Day 200.

32 clients. Platform MVP in testing. First dealer signed up digitally yesterday without me calling them. That's never happened before.

Just wanted you to know it's still moving.

Shreshth
```

**Sample Day 230 email:**
```
Quick one Arjun — 

Remember the contractor from Day 12 who saved ₹9,600 on wiring? He just referred his second project to us. 

That's the metric I care about most. Repeat + referral.

Shreshth
hub4estate.com
```

---

### PHASE 6: THE LONG GAME (Day 271-365)

**Purpose**: Closing the year. Reflection. Gratitude. Future.

Mix of:
- Monthly milestone updates
- Reflections on the year
- Gratitude (even if they never replied)
- Forward-looking (what's coming next)

**Sample Day 300 email:**
```
Arjun,

300 days. Almost a year of this.

You probably think I'm crazy. An 18-year-old kid from Rajasthan emailing you every day about construction materials.

Maybe I am. But here's what crazy got me: 40+ clients, a working platform, ₹15L+ in documented savings, and 3 cities.

If nothing else, I hope I've proved one thing — I don't quit.

Shreshth
```

**Sample Day 365 email:**
```
Hey Arjun,

Day 365. One full year.

I want to thank you — for reading, for not blocking me, for being in my corner even if silently. This daily email made me a better founder. Having to articulate progress every day forced clarity.

Year 1 numbers: [X] clients, [X] dealers, [X] cities, ₹[X]L saved. Platform is live. Team of [X].

If there was ever a day to reply — today's a good one. But either way, I'm grateful.

Here's to Year 2.

Shreshth Agarwal
Founder, Hub4Estate
+91 7690001999
hub4estate.com
```

---

## STEP 4: PERSONALIZATION ENGINE

### For EVERY email, EVERY day, personalize using:

**Layer 1 — Name + Tone**
- Use {first_name} in greeting
- Younger founders (Nikhil Kamath, Arjun Vaidya): casual, "Hey", contractions, lowercase
- Senior legends (Sanjeev Bikchandani, Dinesh Agarwal): respectful, "Hi {name} sir", slightly more formal but still warm
- VC partners: professional but direct, no sir/ma'am, straight to the point
- Ecosystem people: warm, community-oriented language

**Layer 2 — Profile Reference**
- At least once every 3 days, reference something specific about THEM:
  - Their company or fund
  - A recent LinkedIn post or tweet
  - An investment they made
  - Their background or journey
  - Their city or region
  - Something from an interview or podcast

**Layer 3 — Day Number Awareness**
- Naturally weave in awareness of ongoing communication:
  - Day 1: No reference (it's the first email)
  - Day 2-7: "me again", "following up from yesterday", "one more thing from yesterday's email"
  - Day 8-30: "been in your inbox for X days", "couple weeks of this now"
  - Day 31-90: "month X", "you've been hearing from me for a while"
  - Day 91+: "I know I'm persistent", "triple digits", "still here"
  - Day 365: "one full year"

**Layer 4 — Content Variation**
- Rotate across these content types (never repeat same type 2 days in a row):
  1. New deal / client story
  2. Market insight / data point
  3. Personal founder reflection
  4. Platform / product update
  5. Question / thought experiment
  6. Congratulations on THEIR news
  7. A useful share (article, report, data relevant to them)
  8. A short one-liner update + sign off

---

## STEP 5: PARAPHRASING — MAKE EVERY EMAIL HUMAN

### The Paraphrasing Algorithm

Before sending each email, the system MUST:

1. **Generate the email from the day's content theme + personalization data**
2. **Run it through paraphrasing** — rewrite sentence structures, swap synonyms, change paragraph order, vary the opening and closing
3. **Ensure NO two emails on the same day share more than 20% of the same phrasing**
4. **Ensure NO email sent to Person X on Day N is similar to the email sent to Person X on Day N-1**

### Banned Phrases (sounds like AI):
```
- "I hope this email finds you well"
- "I wanted to reach out"
- "I'm excited to share"
- "At the intersection of"
- "Leverage" / "synergy" / "disrupt" / "unlock"
- "Allow me to introduce"
- "Innovative solution"
- "Game-changing" / "revolutionary"
- "End-to-end" / "seamless"
- "I trust this message"
- "In today's dynamic landscape"
- "Needless to say"
- "It goes without saying"
- "Please find attached"
- "As per our conversation"
- "Moving forward"
- "Circle back"
- "Touch base"
- "Low-hanging fruit"
- "Deep dive"
```

### Encouraged Phrases (sounds like Shreshth):
```
- "Hey" / "Hi" / "Yo" (for young founders)
- "Quick one" / "Short today"
- "Here's the deal" / "Real talk"
- "Not gonna lie"
- "Honestly"
- "Thing is" / "Point is"
- "So yeah" / "Anyway"
- "Still at it" / "Still building"
- "Appreciate it" / "Means a lot"
- "If you have 10 mins"
- "No worries either way"
- "Cheers" / "Thanks for reading"
- Hindi-English mix occasionally: "pehle pata hi nahi hota tha", "yahi toh problem hai", "ekdum simple"
```

---

## STEP 6: REPLY MONITORING & INTELLIGENCE

### The automation MUST monitor replies in real-time, 24/7

**When a reply comes in:**

1. **Immediately classify** the reply:

| Reply Type | Action | Priority |
|------------|--------|----------|
| Interested — wants a call/meeting | Notify Shreshth IMMEDIATELY (WhatsApp + email + in-app) | P0 |
| Referred someone (name/email of a tech person) | Notify Shreshth immediately, add referral to a separate tracking list | P0 |
| Asked a question about Hub4Estate | Notify Shreshth to reply personally within 2 hours | P1 |
| Positive but no action ("cool, keep going") | Log it, continue daily emails, acknowledge in next email | P2 |
| Not interested, polite decline | Log it, reduce email frequency to 1x/week for this person | P3 |
| "Stop emailing me" / "Unsubscribe" / "Remove" | **IMMEDIATELY stop all emails** to this person. Permanently. No exceptions. | P0 |
| Out of office auto-reply | Note return date, continue sending but acknowledge when they're back | P4 |
| Angry / hostile | **IMMEDIATELY stop emails**. Log it. Notify Shreshth. | P0 |

2. **After someone replies positively**, the next day's email to them should reference the reply:
   - "Thanks for getting back to me yesterday. That meant a lot."
   - "Really appreciated your note. Quick update since our last exchange..."

3. **After someone refers a person**, the next email should thank them and update on the intro:
   - "The intro to [name] was incredible. We spoke yesterday and..."

4. **Build a live dashboard** showing:
   - Total replies received (lifetime)
   - Replies by type (interested / referral / decline / remove)
   - Reply rate per category (A/B/C/D)
   - Top 10 most engaged contacts (replied multiple times)
   - People who opened but never replied (if link click tracking available)
   - People who replied to stop (removed list)

---

## STEP 7: SUBJECT LINE STRATEGY

### Rules:
- **Never use the same subject line for the same person twice**
- **Rotate across 50+ base templates** (listed below) + daily variations
- **Subject should be 3-7 words** — short, curious, personal
- **Lowercase preferred** — feels less marketing-y
- **Include {first_name} in ~30% of subject lines**

### Subject Line Pool (50 base templates — paraphrase and expand to 365):

**Week 1 (intro phase):**
1. `{first_name} — 2 min read, real numbers`
2. `construction pricing is broken`
3. `not a pitch — just a problem`
4. `18 y/o, real clients, no tech team`
5. `the middleman tax nobody talks about`
6. `{first_name}, thought of you`
7. `from rajasthan, building something real`

**Week 2-4 (building in public):**
8. `day {N} — quick update`
9. `new deal closed yesterday`
10. `{first_name} — a number that surprised me`
11. `still building, still emailing`
12. `saved another client ₹{X} this week`
13. `one insight from the field`
14. `day {N} in your inbox`

**Month 2-3 (grind phase):**
15. `{first_name} — month {X} update`
16. `a question i'm wrestling with`
17. `short one today`
18. `the metric i care about most`
19. `{first_name}, heard something that reminded me of you`
20. `proof > pitch`
21. `tier 2 india doesn't have this yet`
22. `{first_name} — 3 lines and done`

**Month 4-6 (relationship):**
23. `congrats on {their_recent_news}`
24. `{first_name} — not asking for anything today`
25. `day {N}, still going`
26. `thought you'd like this data point`
27. `quick win this week`
28. `{first_name} — genuine question`
29. `the one email I look forward to writing`

**Month 7-9 (persistence):**
30. `{N} days and counting`
31. `still here, still building`
32. `{first_name} — the update`
33. `persistence > perfection`
34. `another week, another save`
35. `{first_name}, 30 seconds today`
36. `if you ever have 10 mins`

**Month 10-12 (long game):**
37. `approaching day 300`
38. `{first_name} — year in review (almost)`
39. `the hardest part isn't building`
40. `{first_name}, a thank you`
41. `day 365 — one year`
42. `still that kid from rajasthan`
43. `what a year`
44. `{first_name} — one last thing (for this year)`

**Evergreen (use any time):**
45. `{first_name}`
46. `quick one`
47. `fyi`
48. `thought of you`
49. `🤙` (only for casual/young founders)
50. `re: hub4estate` (looks like a reply thread — use sparingly)

---

## STEP 8: LINKS TO INCLUDE

Rotate how links appear — don't include both links every day (that feels spammy). Schedule:

- **Day 1**: Both links (pitch deck + website)
- **Day 2-7**: One link per email, alternating
- **Day 8+**: Include a link only 2-3 times per week, not every day
- **When sharing a link**, make it casual: "here if you're curious: [link]" — never "Please visit our website"
- **Pitch deck**: https://shreshth1999.github.io/Hub4Estate/
- **Website**: https://hub4estate.com

---

## STEP 9: SIGNATURE

Keep it minimal. Vary slightly:

**Standard:**
```
Shreshth
+91 7690001999
```

**Slightly longer (use 2x/week):**
```
Shreshth Agarwal
Hub4Estate
+91 7690001999
```

**Full (use 1x/week, especially early phase):**
```
Shreshth Agarwal
Founder, Hub4Estate
+91 7690001999
shreshth.agarwal@hub4estate.com
hub4estate.com
```

**Ultra casual (for young founders):**
```
— Shreshth
```

---

## STEP 10: DELIVERABILITY AT 500/DAY

### Critical infrastructure requirements:

1. **SPF, DKIM, DMARC** properly configured on hub4estate.com — Reetik MUST verify before Day 1
2. **Dedicated IP** for sending (shared IPs at 500/day will get flagged)
3. **Email warm-up** for 2 weeks before launch:
   - Week 1: 20-50 emails/day to warm contacts (friends, family, existing clients)
   - Week 2: 50-150 emails/day, gradually increasing
   - Day 1 of campaign: start at 50, ramp to 500 over 10 days (as described in Step 2)
4. **Domain age**: hub4estate.com must have been active for email for at least 30 days
5. **Multiple sending domains** (optional but recommended for 500/day):
   - Primary: shreshth.agarwal@hub4estate.com
   - Backup: shreshth@hub4estate.com
   - Backup: founder@hub4estate.com
   - Rotate across these to distribute volume
6. **Bounce handling**: If bounce rate > 2% on any day, PAUSE and clean list
7. **Spam complaint monitoring**: If any complaint, immediately investigate
8. **Unsubscribe footer** on every email (small, bottom): "Reply 'stop' to opt out"
9. **Mail-tester.com score**: Must be 8+/10 before launch

---

## STEP 11: WEEKLY CONTENT CALENDAR

To ensure variety, follow this loose weekly structure (the AI should use this as guidance, not rigid template):

| Day | Content Theme | Length |
|-----|---------------|--------|
| Monday | Weekly numbers recap (clients, savings, deals) | 5-6 lines |
| Tuesday | A market insight or pricing data | 4-5 lines |
| Wednesday | Personal founder reflection | 5-7 lines |
| Thursday | A specific deal story or client win | 5-6 lines |
| Friday | Something relevant to THEIR world (congrats, shared article, question) | 4-5 lines |
| Saturday | Casual/light (humor, one-liner, meme-energy without actual memes) | 3-4 lines |
| Sunday | A bigger thought or question | 5-8 lines |

---

## STEP 12: DYNAMIC CONTENT FEEDS

The automation needs FRESH content to write unique emails for 365 days. Set up these content feeds:

1. **Shreshth's update feed**: A simple Google Sheet or Notion page where Shreshth (or Reetik) logs daily updates:
   - New client signed
   - New deal closed (with numbers)
   - New dealer onboarded
   - Platform development updates
   - A problem faced
   - A lesson learned
   - A number/metric that changed

   → The automation pulls from this sheet to generate that day's emails with real, fresh data

2. **Recipient activity feed**: Weekly scrape of each recipient's recent LinkedIn posts, tweets, news mentions
   → Used for personalization lines

3. **Market data feed**: Construction material pricing data, industry news, government policy changes
   → Used for "market insight" emails

**If no fresh update is available for a day**, the automation should:
- Pull from a library of 50+ pre-written "thought pieces" on:
  - Why procurement transparency matters
  - Tier 2/3 India's digital gap
  - The blind bidding model explained differently
  - Why construction-tech is underfunded
  - Comparisons to other marketplace transformations (IndiaMart, Urban Company, Udaan)
  - Shreshth's founder journey moments

---

## STEP 13: SAFETY RAILS

1. **NEVER send to someone marked as "removed"** — triple check this
2. **NEVER send more than 1 email per day** to any person
3. **If the system fails to send on a day**, do NOT send double the next day — just skip and continue
4. **If an email bounces 2x**, remove that person from the list permanently
5. **If Shreshth says "pause"**, the entire system pauses within 1 hour
6. **Log every email sent**: timestamp, recipient, subject, body preview (first 50 chars)
7. **Weekly backup** of the entire contact list + send history
8. **If Gmail/Outlook is the recipient** and bounce rate spikes for that domain → pause those recipients and investigate

---

## STEP 14: REETIK'S LAUNCH CHECKLIST

- [ ] All 500 contacts identified with names, companies, categories
- [ ] At least 400 emails found and verified (remaining 100 marked EMAIL_NOT_FOUND for manual lookup)
- [ ] SPF/DKIM/DMARC verified on hub4estate.com
- [ ] 2-week email warmup completed
- [ ] Mail-tester.com score 8+/10
- [ ] Personalization data collected for all 500 (name, company, known_for, tone_preference)
- [ ] Content calendar loaded for first 30 days
- [ ] Google Sheet / Notion update feed created and shared with Shreshth
- [ ] Paraphrasing engine tested — 10 test emails generated, all confirmed unique
- [ ] Reply monitoring active and classification working
- [ ] Notification to Shreshth working (WhatsApp or email on every reply)
- [ ] 5 test emails sent to Shreshth's personal email — formatting, deliverability, tone approved
- [ ] Bounce monitoring active (pause at >2%)
- [ ] Unsubscribe/removal mechanism tested
- [ ] Warm-up schedule configured (50 → 150 → 300 → 500 over 10 days)
- [ ] Backup sending domains configured (optional)
- [ ] All 500 people get Day 1 email within first 10 days (staggered per warm-up)
- [ ] Shreshth has approved 5 sample emails across all 4 categories

---

## SUMMARY FOR REETIK

**What this is**: A daily automated email system that sends 500 unique, personalized, short emails every morning at 8 AM — one to each of 500 VCs, angels, founders, and ecosystem leaders across India. It runs every day for 1 year. Every email sounds like Shreshth personally typed it. The system tracks all replies, classifies them, and notifies Shreshth instantly for personal follow-up.

**What Reetik sets up in Rilo AI**:
1. Contact list of 500 with enriched data (or EMAIL_NOT_FOUND flags for manual)
2. Email verification on all addresses
3. Paraphrasing engine that makes every email unique
4. Daily 8 AM IST trigger — 7 days/week — auto-runs for 365 days
5. Reply monitoring with auto-classification and instant notification
6. Deliverability infrastructure (SPF/DKIM/DMARC, warmup, bounce monitoring)
7. Content feed integration (Google Sheet for Shreshth's daily updates)
8. Dashboard showing: emails sent, replies, classifications, bounce rate, removal requests

**The emails are NOT sales pitches.** They're a founder keeping 500 important people in the loop about a real business, sharing real numbers, asking for genuine help finding a tech co-founder, and building relationships through consistency.

**After setup, Shreshth touches nothing.** He just updates the Google Sheet with daily progress, and the machine handles the rest. He only jumps in personally when someone replies.

---

*Built for Shreshth Agarwal, Hub4Estate — 9 April 2026*
*Campaign: April 2026 → April 2027*
*Target: 500 people × 365 days = 182,500 personalized emails*
