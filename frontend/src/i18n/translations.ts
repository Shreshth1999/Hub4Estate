// ─── Hub4Estate — Full site translations ────────────────────────────────────
// Primary: English | Implemented: English + Hindi
// Architecture: add new language code + object to add more languages

export type LangCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'pa' | 'ml';

export interface LanguageOption {
  code: LangCode;
  name: string;
  native: string;
  available: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English',   native: 'English',    available: true  },
  { code: 'hi', name: 'Hindi',     native: 'हिंदी',       available: true  },
  { code: 'mr', name: 'Marathi',   native: 'मराठी',       available: false },
  { code: 'ta', name: 'Tamil',     native: 'தமிழ்',       available: false },
  { code: 'te', name: 'Telugu',    native: 'తెలుగు',      available: false },
  { code: 'bn', name: 'Bengali',   native: 'বাংলা',       available: false },
  { code: 'gu', name: 'Gujarati',  native: 'ગુજરાતી',     available: false },
  { code: 'kn', name: 'Kannada',   native: 'ಕನ್ನಡ',       available: false },
  { code: 'pa', name: 'Punjabi',   native: 'ਪੰਜਾਬੀ',      available: false },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം',      available: false },
];

// ─── Translation object type ─────────────────────────────────────────────────
export interface SiteTranslations {
  nav: {
    products: string;
    guides: string;
    community: string;
    forDealers: string;
    track: string;
    getQuotes: string;
    myDashboard: string;
    dealerPortal: string;
    adminPanel: string;
    logout: string;
    language: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string[];
    formTitle: string;
    formSubtitle: string;
    formModeTabs: { manual: string; aiScan: string };
    formLabels: {
      productModel: string;
      speak: string;
      stop: string;
      listening: string;
      quantity: string;
      city: string;
      autoDetect: string;
      yourName: string;
      phone: string;
      photo: string;
      photoOptional: string;
      getPrice: string;
      submitting: string;
      noSpam: string;
    };
    aiScan: {
      title: string;
      desc: string;
      steps: string[];
      upload: string;
      uploadHint: string;
      or: string;
      camera: string;
      tips: { title: string; items: string[] };
    };
    submitted: {
      title: string;
      subtitle: string;
      inquiryLabel: string;
      inquiryHint: string;
      trackBtn: string;
      submitAnother: string;
    };
  };
  howItWorks: {
    label: string;
    title: string;
    subtitle: string;
    steps: Array<{ step: string; title: string; desc: string; highlight: string }>;
  };
  aiSection: {
    badge: string;
    title: string;
    subtitle: string;
    tapHint: string;
    features: Array<{ label: string; tagline: string; desc: string; metric: string }>;
    cta: string;
    ctaSubtitle: string;
  };
  categories: {
    title: string;
    subtitle: string;
    cta: string;
  };
  realDeals: {
    label: string;
    title: string;
    subtitle: string;
    footnote: string;
    deals: Array<{
      tag: string;
      title: string;
      rows: Array<{ label: string; price: string; strikethrough: boolean }>;
      savedLabel: string;
      savedNote: string;
    }>;
  };
  whyWeExist: {
    label: string;
    title: string;
    subtitle: string;
    cards: Array<{ title: string; desc: string }>;
    summary: { title: string; desc: string };
  };
  personas: {
    label: string;
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      role: string;
      headline: string;
      bullets: string[];
      metric: string;
      cta: string;
      ctaLink: string;
      isLink: boolean;
    }>;
  };
  finalCta: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    tagline: string;
    registered: string;
    sections: {
      products: string;
      resources: string;
      forDealers: string;
      contact: string;
    };
    links: {
      viewAll: string;
      buyingGuides: string;
      community: string;
      aiAssistant: string;
      trackRequest: string;
      joinDealer: string;
      dealerLogin: string;
    };
    bottom: { copyright: string; about: string; contact: string; privacy: string; terms: string; careers: string };
  };
}

// ─── English ─────────────────────────────────────────────────────────────────
const en: SiteTranslations = {
  nav: {
    products: 'Products',
    guides: 'Guides',
    community: 'Community',
    forDealers: 'For Dealers',
    track: 'Track',
    getQuotes: 'Get Quotes',
    myDashboard: 'My Dashboard',
    dealerPortal: 'Dealer Portal',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
    language: 'Language',
  },
  hero: {
    headline: 'We Will Get You The Cheapest Price Of Any Electrical Across India.',
    subheadline: 'Wires, switches, MCBs, fans, lights — tell us what you need, we contact verified dealers, you compare their real prices and pick the best deal.',
    ctaPrimary: 'Submit an Inquiry',
    ctaSecondary: 'Track Your Inquiry',
    trust: [
      'Multiple quotes from real dealers — compare side by side',
      'We verify dealers before connecting you',
      'Full transparency — you see every quote, no hidden fees',
    ],
    formTitle: 'Get the Best Price',
    formSubtitle: 'Tell us what you need — speak, type, or scan a slip',
    formModeTabs: { manual: 'Manual Entry', aiScan: 'AI Scan Slip' },
    formLabels: {
      productModel: 'Product / Model Number',
      speak: 'Speak',
      stop: 'Stop',
      listening: 'Listening...',
      quantity: 'Quantity',
      city: 'Delivery City',
      autoDetect: 'Auto-detect',
      yourName: 'Your Name',
      phone: 'Phone Number',
      photo: 'Product Photo',
      photoOptional: '(optional)',
      getPrice: 'Get the Best Price',
      submitting: 'Submitting...',
      noSpam: "We'll reach out with dealer quotes. No spam, ever.",
    },
    aiScan: {
      title: 'Scan Your Material Slip',
      desc: 'Upload a photo of your slip or materials list. AI extracts products, quantities, and brands automatically.',
      steps: ['Upload Photo', 'AI Reads It', 'Auto-Fill Form'],
      upload: 'Click to Upload Slip',
      uploadHint: 'or drag and drop here · JPG, PNG · Max 10MB',
      or: 'OR',
      camera: 'Use Camera',
      tips: {
        title: 'For best results:',
        items: ['Good lighting — natural light works best', 'Capture the full slip in frame', 'Avoid blurry or angled shots'],
      },
    },
    submitted: {
      title: 'Inquiry Submitted!',
      subtitle: "We'll get back to you with the best price shortly.",
      inquiryLabel: 'Your Inquiry Number',
      inquiryHint: 'Save this number to track your inquiry anytime',
      trackBtn: 'Track Your Request',
      submitAnother: 'Submit Another Inquiry',
    },
  },
  howItWorks: {
    label: 'Simple Process',
    title: 'How It Works',
    subtitle: 'Submit your inquiry. We do the sourcing. You compare and choose.',
    steps: [
      { step: '01', title: 'Submit Your Inquiry', desc: 'Tell us what you need — product name, model, quantity, and your city. Upload a photo or a contractor\'s material slip if you have one.', highlight: 'Takes 2 minutes' },
      { step: '02', title: 'We Source Quotes', desc: 'We reach out to our network of verified dealers who stock what you need. They compete to give you the best price.', highlight: 'We do the work' },
      { step: '03', title: 'Compare & Choose', desc: 'We share the dealer quotes with you. Review prices, terms, and ratings. Pick the deal that makes sense for you.', highlight: 'You decide' },
    ],
  },
  aiSection: {
    badge: 'Volt AI',
    title: 'AI that does the heavy lifting',
    subtitle: 'Scan a slip, speak your requirement, or just type. Volt handles the rest and gets you the best price from verified dealers.',
    tapHint: '↑ Tap any card to see a live demo',
    features: [
      { label: 'Slip Scanner', tagline: '12 items in 8 seconds', desc: 'Photo your contractor\'s materials slip. AI reads every product, quantity, and brand instantly — no typing.', metric: '8 sec' },
      { label: 'Voice Input', tagline: 'Hindi & English', desc: 'Speak your requirement out loud. AI fills your inquiry form — product, quantity, and city — hands-free.', metric: 'Hands-free' },
      { label: 'Smart Compare', tagline: 'Best deal highlighted', desc: 'When 3–5 quotes arrive, AI ranks them by price, delivery time, and dealer reliability so you pick with confidence.', metric: '₹37k saved' },
    ],
    cta: 'Submit an Inquiry',
    ctaSubtitle: "No account needed. It's free.",
  },
  categories: {
    title: 'Everything Electrical. One Platform.',
    subtitle: 'Havells, Polycab, Schneider, Legrand, Anchor — all major brands with verified specs and warranty details.',
    cta: 'Explore Full Catalog',
  },
  realDeals: {
    label: 'Verified Results',
    title: 'What Real Price Access Looks Like',
    subtitle: 'Actual deals closed through Hub4Estate. Real numbers, no fabrications.',
    footnote: 'These are real, verified deals. We don\'t fabricate numbers or testimonials.',
    deals: [
      {
        tag: 'Audio Equipment',
        title: 'Sony Tower Speaker + 2 Mics',
        rows: [
          { label: 'MRP', price: '₹1,15,000', strikethrough: true },
          { label: 'Croma (retail)', price: '₹1,05,000', strikethrough: true },
          { label: 'Hub4Estate', price: '₹68,000', strikethrough: false },
        ],
        savedLabel: 'Saved vs Croma',
        savedNote: 'We tracked 8 dealers to find this price',
      },
      {
        tag: 'LED Lighting',
        title: 'Philips 15W LED Panels × 200 units',
        rows: [
          { label: 'Local dealer (per piece)', price: '₹585/pc', strikethrough: true },
          { label: 'Hub4Estate (incl. shipping)', price: '₹465/pc', strikethrough: false },
        ],
        savedLabel: 'Total Saved on Order',
        savedNote: '₹120 saved per unit × 200 units',
      },
      {
        tag: 'Wiring & Cable',
        title: 'FRLS 2.5mm² Wire × 200 metres',
        rows: [
          { label: 'Highest dealer quote', price: '₹127/m', strikethrough: true },
          { label: 'Best dealer (via Hub4Estate)', price: '₹83/m', strikethrough: false },
        ],
        savedLabel: 'Saved on 200m Order',
        savedNote: '6 dealers quoted — ₹44/m spread between them',
      },
    ],
  },
  whyWeExist: {
    label: 'The Problem We Solve',
    title: 'The Same Product. Very Different Prices.',
    subtitle: 'The price you\'re quoted depends entirely on who you ask. Most buyers never find out.',
    cards: [
      { title: 'The Information Gap', desc: 'Dealers know exactly what they paid for the product. You don\'t. The same Sony speaker set was priced at ₹1,05,000 at one retailer and ₹68,000 through our network. That gap is real — and it\'s common.' },
      { title: 'The Local Monopoly Problem', desc: 'If there are only one or two dealers near you, they set the price. No competition means no transparency. Calling 5–6 dealers manually takes hours. Most people don\'t bother — and pay the first price they\'re given.' },
      { title: 'The Documentation Problem', desc: 'Cash purchases, no proper GST bills, no warranty cards in your name. When something fails, you\'re left with no recourse and no proof of purchase.' },
      { title: 'What We\'re Fixing', desc: 'We connect buyers to multiple verified dealers at once. You see all the quotes side by side. The dealer who wins your business earns it fairly. That\'s the whole model.' },
    ],
    summary: {
      title: 'Transparent Pricing. Verified Dealers. Your Choice.',
      desc: "We're not here to guarantee the lowest price in the universe. We're here to give you enough information to make the right call.",
    },
  },
  personas: {
    label: 'Built For Everyone',
    title: 'Who is Hub4Estate for?',
    subtitle: 'Whether you\'re buying, selling, or specifying — Hub4Estate is built for your workflow.',
    items: [
      {
        icon: '🏪',
        role: 'Dealers',
        headline: 'Get qualified buyers, not random calls.',
        bullets: ['Verified buyers arrive with product, quantity & budget set', 'Submit a quote in under 60 seconds', 'Fair competition — win on merit, not connections'],
        metric: '₹37,000 avg. saved per order',
        cta: 'Register as Dealer — Free',
        ctaLink: '/dealer/onboarding',
        isLink: true,
      },
      {
        icon: '📐',
        role: 'Architects & Designers',
        headline: 'Specify precisely. Source with confidence.',
        bullets: ['Search by brand, rating, finish, or standard', 'Compare 3–5 verified dealers on price & lead time', 'Download client-ready quotes instantly'],
        metric: '10× faster than calling dealers',
        cta: 'Submit an Inquiry',
        ctaLink: 'inquiry-form',
        isLink: false,
      },
      {
        icon: '🔨',
        role: 'Contractors',
        headline: 'Your full materials list. One submission.',
        bullets: ['Photo your slip — AI reads 12+ items in 8 seconds', 'Multiple dealers quote simultaneously', 'GST-billed delivery directly to site'],
        metric: '120 calls → 1 submission',
        cta: 'Submit Materials List',
        ctaLink: 'inquiry-form',
        isLink: false,
      },
      {
        icon: '🏠',
        role: 'Homeowners',
        headline: 'Know if the price you got is actually fair.',
        bullets: ['Tell us product, quantity, city — takes 2 minutes', 'We contact 3–5 verified dealers on your behalf', 'Compare all quotes, choose the best'],
        metric: '₹24,000 saved on one LED order',
        cta: 'Get Free Quotes',
        ctaLink: 'inquiry-form',
        isLink: false,
      },
    ],
  },
  finalCta: {
    title: 'Ready to Find the Best Price?',
    subtitle: 'Submit an inquiry and let our dealer network do the work. No commitment. No spam. Just real quotes.',
    ctaPrimary: 'Submit an Inquiry',
    ctaSecondary: 'Track an Existing Inquiry',
  },
  footer: {
    tagline: "India's marketplace for electrical procurement. Dealers compete. You save.",
    registered: 'Hub4Estate LLP · Registered in India',
    sections: { products: 'Products', resources: 'Resources', forDealers: 'For Dealers', contact: 'Contact Us' },
    links: {
      viewAll: 'View All →',
      buyingGuides: 'Buying Guides',
      community: 'Community',
      aiAssistant: 'AI Assistant',
      trackRequest: 'Track Request',
      joinDealer: 'Join as Dealer',
      dealerLogin: 'Dealer Login',
    },
    bottom: { copyright: '© 2026 Hub4Estate LLP. All rights reserved.', about: 'About', contact: 'Contact', privacy: 'Privacy', terms: 'Terms', careers: 'Careers' },
  },
};

// ─── Hindi ────────────────────────────────────────────────────────────────────
const hi: SiteTranslations = {
  nav: {
    products: 'उत्पाद',
    guides: 'गाइड',
    community: 'समुदाय',
    forDealers: 'डीलर के लिए',
    track: 'ट्रैक करें',
    getQuotes: 'कोटेशन पाएं',
    myDashboard: 'मेरा डैशबोर्ड',
    dealerPortal: 'डीलर पोर्टल',
    adminPanel: 'एडमिन पैनल',
    logout: 'लॉगआउट',
    language: 'भाषा',
  },
  hero: {
    headline: 'हम आपको पूरे भारत में किसी भी इलेक्ट्रिकल का सबसे सस्ता दाम दिलाएंगे।',
    subheadline: 'तार, स्विच, MCB, पंखे, लाइटें — बताएं क्या चाहिए, हम verified dealers से quotes लाते हैं, आप best deal चुनते हैं।',
    ctaPrimary: 'Inquiry Submit करें',
    ctaSecondary: 'अपनी Inquiry Track करें',
    trust: [
      'Real dealers से multiple quotes — side by side compare करें',
      'हम dealers को connect करने से पहले verify करते हैं',
      'पूरी transparency — हर quote दिखेगी, कोई hidden fees नहीं',
    ],
    formTitle: 'Best Price पाएं',
    formSubtitle: 'बताएं क्या चाहिए — बोलें, टाइप करें, या slip scan करें',
    formModeTabs: { manual: 'Manual Entry', aiScan: 'AI Slip Scan' },
    formLabels: {
      productModel: 'Product / Model Number',
      speak: 'बोलें',
      stop: 'रोकें',
      listening: 'सुन रहा हूं...',
      quantity: 'मात्रा',
      city: 'Delivery City',
      autoDetect: 'Auto-detect',
      yourName: 'आपका नाम',
      phone: 'फोन नंबर',
      photo: 'Product फोटो',
      photoOptional: '(वैकल्पिक)',
      getPrice: 'Best Price पाएं',
      submitting: 'Submit हो रहा है...',
      noSpam: 'हम dealer quotes के साथ संपर्क करेंगे। कोई spam नहीं।',
    },
    aiScan: {
      title: 'अपनी Material Slip Scan करें',
      desc: 'अपनी slip या materials list की photo upload करें। AI products, quantities और brands अपने आप निकाल लेगा।',
      steps: ['Photo Upload करें', 'AI पढ़ता है', 'Form Auto-Fill'],
      upload: 'Slip Upload करें',
      uploadHint: 'या यहाँ drag & drop करें · JPG, PNG · Max 10MB',
      or: 'या',
      camera: 'Camera Use करें',
      tips: {
        title: 'Best results के लिए:',
        items: ['अच्छी रोशनी — natural light सबसे अच्छा', 'पूरी slip frame में आनी चाहिए', 'Blurry या तिरछी photo से बचें'],
      },
    },
    submitted: {
      title: 'Inquiry Submit हो गई!',
      subtitle: 'हम जल्द ही best price के साथ संपर्क करेंगे।',
      inquiryLabel: 'आपका Inquiry Number',
      inquiryHint: 'इस number से कभी भी अपनी inquiry track करें',
      trackBtn: 'Request Track करें',
      submitAnother: 'एक और Inquiry Submit करें',
    },
  },
  howItWorks: {
    label: 'सरल प्रक्रिया',
    title: 'यह कैसे काम करता है',
    subtitle: 'Inquiry submit करें। हम sourcing करते हैं। आप compare करके चुनें।',
    steps: [
      { step: '01', title: 'Inquiry Submit करें', desc: 'बताएं क्या चाहिए — product name, model, quantity, और आपका शहर। चाहें तो photo या contractor की material slip upload करें।', highlight: '2 मिनट लगते हैं' },
      { step: '02', title: 'हम Quotes लाते हैं', desc: 'हम अपने verified dealer network से संपर्क करते हैं जो आपका product stock करते हैं। वे best price देने के लिए compete करते हैं।', highlight: 'हम काम करते हैं' },
      { step: '03', title: 'Compare करें और चुनें', desc: 'हम dealer quotes आपके साथ share करते हैं। Prices, terms और ratings review करें। जो deal सही लगे वो चुनें।', highlight: 'आप तय करें' },
    ],
  },
  aiSection: {
    badge: 'Volt AI',
    title: 'AI जो भारी काम करती है',
    subtitle: 'Slip scan करें, requirement बोलें, या type करें। Volt बाकी सब संभालती है और verified dealers से best price लाती है।',
    tapHint: '↑ Live demo देखने के लिए किसी card पर tap करें',
    features: [
      { label: 'Slip Scanner', tagline: '8 seconds में 12 items', desc: 'Contractor की materials slip की photo लें। AI हर product, quantity और brand तुरंत पढ़ लेती है — कोई typing नहीं।', metric: '8 sec' },
      { label: 'Voice Input', tagline: 'Hindi और English', desc: 'अपनी requirement बोलें। AI आपका inquiry form भर देती है — product, quantity और city — hands-free।', metric: 'Hands-free' },
      { label: 'Smart Compare', tagline: 'Best deal highlight होती है', desc: '3–5 quotes आने पर AI उन्हें price, delivery time और dealer reliability के आधार पर rank करती है।', metric: '₹37k तक बचत' },
    ],
    cta: 'Inquiry Submit करें',
    ctaSubtitle: 'कोई account नहीं चाहिए। बिल्कुल free है।',
  },
  categories: {
    title: 'सब कुछ इलेक्ट्रिकल। एक Platform।',
    subtitle: 'Havells, Polycab, Schneider, Legrand, Anchor — सभी major brands verified specs और warranty details के साथ।',
    cta: 'पूरा Catalog देखें',
  },
  realDeals: {
    label: 'Verified Results',
    title: 'Real Price Access कैसी दिखती है',
    subtitle: 'Hub4Estate के through actual deals। Real numbers, कोई fabrication नहीं।',
    footnote: 'ये real, verified deals हैं। हम numbers या testimonials fabricate नहीं करते।',
    deals: [
      {
        tag: 'Audio Equipment',
        title: 'Sony Tower Speaker + 2 Mics',
        rows: [
          { label: 'MRP', price: '₹1,15,000', strikethrough: true },
          { label: 'Croma (retail)', price: '₹1,05,000', strikethrough: true },
          { label: 'Hub4Estate', price: '₹68,000', strikethrough: false },
        ],
        savedLabel: 'Croma से बचत',
        savedNote: 'यह price ढूंढने के लिए हमने 8 dealers track किए',
      },
      {
        tag: 'LED Lighting',
        title: 'Philips 15W LED Panels × 200 units',
        rows: [
          { label: 'Local dealer (per piece)', price: '₹585/pc', strikethrough: true },
          { label: 'Hub4Estate (shipping सहित)', price: '₹465/pc', strikethrough: false },
        ],
        savedLabel: 'पूरे Order पर बचत',
        savedNote: '₹120 प्रति unit × 200 units',
      },
      {
        tag: 'Wiring & Cable',
        title: 'FRLS 2.5mm² Wire × 200 metres',
        rows: [
          { label: 'सबसे ऊंचा dealer quote', price: '₹127/m', strikethrough: true },
          { label: 'Best dealer (Hub4Estate से)', price: '₹83/m', strikethrough: false },
        ],
        savedLabel: '200m Order पर बचत',
        savedNote: '6 dealers ने quote दिया — ₹44/m का फर्क',
      },
    ],
  },
  whyWeExist: {
    label: 'हम किस समस्या को हल करते हैं',
    title: 'एक ही product। बहुत अलग prices।',
    subtitle: 'आपको जो price मिलती है वो पूरी तरह इस पर निर्भर करती है कि आप किससे पूछते हैं। ज़्यादातर buyers को पता ही नहीं चलता।',
    cards: [
      { title: 'Information का अंतर', desc: 'Dealers को पता है उन्होंने product कितने में खरीदा। आपको नहीं। एक ही Sony speaker set एक retailer पर ₹1,05,000 और हमारे network से ₹68,000 में मिला। यह अंतर real है — और आम है।' },
      { title: 'Local Monopoly की समस्या', desc: 'अगर आपके पास only एक-दो dealers हैं, तो वो price तय करते हैं। Competition नहीं = transparency नहीं। 5-6 dealers को manually call करना घंटों का काम है।' },
      { title: 'Documentation की समस्या', desc: 'Cash purchases, proper GST bills नहीं, warranty cards आपके नाम पर नहीं। जब कुछ fail होता है, आपके पास कोई recourse नहीं।' },
      { title: 'हम क्या Fix कर रहे हैं', desc: 'हम buyers को एक साथ multiple verified dealers से connect करते हैं। आप सभी quotes side by side देखते हैं। जो dealer आपका business जीतता है, वो merit पर जीतता है।' },
    ],
    summary: {
      title: 'Transparent Pricing। Verified Dealers। आपकी Choice।',
      desc: 'हम universe में सबसे कम price guarantee करने नहीं आए हैं। हम आपको enough information देने आए हैं ताकि आप सही decision ले सकें।',
    },
  },
  personas: {
    label: 'सभी के लिए बना',
    title: 'Hub4Estate किसके लिए है?',
    subtitle: 'चाहे आप खरीद रहे हों, बेच रहे हों, या specify कर रहे हों — Hub4Estate आपके workflow के लिए बना है।',
    items: [
      {
        icon: '🏪',
        role: 'Dealers',
        headline: 'Qualified buyers पाएं, random calls नहीं।',
        bullets: ['Verified buyers product, quantity और budget के साथ आते हैं', '60 seconds में quote submit करें', 'Fair competition — merit पर जीतें'],
        metric: 'प्रति order ₹37,000 avg. बचत',
        cta: 'Dealer Register करें — Free',
        ctaLink: '/dealer/onboarding',
        isLink: true,
      },
      {
        icon: '📐',
        role: 'Architects & Designers',
        headline: 'Precisely specify करें। Confidently source करें।',
        bullets: ['Brand, rating, finish, या standard से search करें', '3–5 verified dealers compare करें price और lead time पर', 'Client-ready quotes instantly download करें'],
        metric: 'Dealers को call करने से 10× faster',
        cta: 'Inquiry Submit करें',
        ctaLink: 'inquiry-form',
        isLink: false,
      },
      {
        icon: '🔨',
        role: 'Contractors',
        headline: 'पूरी materials list। एक submission।',
        bullets: ['Slip की photo लें — AI 8 seconds में 12+ items पढ़ लेती है', 'Multiple dealers एक साथ quote करते हैं', 'GST-billed delivery सीधे site पर'],
        metric: '120 calls → 1 submission',
        cta: 'Materials List Submit करें',
        ctaLink: 'inquiry-form',
        isLink: false,
      },
      {
        icon: '🏠',
        role: 'Homeowners',
        headline: 'जानें कि आपको मिली price actually fair है या नहीं।',
        bullets: ['Product, quantity, city बताएं — 2 मिनट लगते हैं', 'हम 3–5 verified dealers से आपकी तरफ से contact करते हैं', 'सभी quotes compare करें, best चुनें'],
        metric: 'एक LED order पर ₹24,000 की बचत',
        cta: 'Free Quotes पाएं',
        ctaLink: 'inquiry-form',
        isLink: false,
      },
    ],
  },
  finalCta: {
    title: 'Best Price ढूंढने के लिए तैयार हैं?',
    subtitle: 'Inquiry submit करें और हमारे dealer network को काम करने दें। कोई commitment नहीं। कोई spam नहीं। बस real quotes।',
    ctaPrimary: 'Inquiry Submit करें',
    ctaSecondary: 'Existing Inquiry Track करें',
  },
  footer: {
    tagline: 'Electrical procurement के लिए India का marketplace। Dealers compete करते हैं। आप बचाते हैं।',
    registered: 'Hub4Estate LLP · India में registered',
    sections: { products: 'उत्पाद', resources: 'Resources', forDealers: 'Dealers के लिए', contact: 'संपर्क करें' },
    links: {
      viewAll: 'सभी देखें →',
      buyingGuides: 'Buying Guides',
      community: 'Community',
      aiAssistant: 'AI Assistant',
      trackRequest: 'Request Track करें',
      joinDealer: 'Dealer बनें',
      dealerLogin: 'Dealer Login',
    },
    bottom: { copyright: '© 2026 Hub4Estate LLP. सर्वाधिकार सुरक्षित।', about: 'हमारे बारे में', contact: 'संपर्क', privacy: 'Privacy', terms: 'Terms', careers: 'Careers' },
  },
};

// ─── Translations map ─────────────────────────────────────────────────────────
export const translations: Partial<Record<LangCode, SiteTranslations>> = { en, hi };

export const getTranslations = (lang: LangCode): SiteTranslations =>
  translations[lang] ?? translations.en!;
