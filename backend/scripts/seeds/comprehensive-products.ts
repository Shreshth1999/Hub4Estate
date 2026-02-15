// Comprehensive India Electrical Product Database
// Based on real brands: Polycab, Havells, Finolex, RR Kabel, KEI, Schneider, L&T, Legrand, Anchor, GM, Philips, Syska, Crompton, Orient, etc.

export const comprehensiveCategories = [
  // Category 1: Electrical Wiring (shown in screenshot)
  {
    id: 'electrical-wiring',
    name: 'Electrical Wiring',
    slug: 'electrical-wiring',
    description: 'Complete house wiring solutions including conduits, junction boxes, and wiring accessories.',
    icon: '⚡',
    whatIsIt: 'Electrical wiring forms the nervous system of your building, carrying power safely from the distribution board to every outlet.',
    whereUsed: 'Throughout the building - main distribution, room circuits, AC points, kitchen appliances, outdoor lighting.',
    whyQualityMatters: 'Poor quality wiring is responsible for 70% of electrical fires in India. Good wiring lasts 25+ years; cheap wire fails in 5.',
    commonMistakes: 'Undersized wires for AC (use 4 sq mm, not 2.5), mixing copper-aluminum, skipping FRLS for safety, no color coding.',
    subcategories: [
      { name: 'House Wiring Cables', slug: 'house-wiring', description: 'FR/FRLS/ZHFR cables for indoor residential and commercial wiring' },
      { name: 'Conduits & Pipes', slug: 'conduits', description: 'PVC conduits, casing-capping for wire protection' },
      { name: 'Junction Boxes', slug: 'junction-boxes', description: 'Connection and distribution boxes' },
    ]
  },
  // Category 2: LED Lighting (shown in screenshot)
  {
    id: 'led-lighting',
    name: 'LED Lighting',
    slug: 'led-lighting',
    description: 'Energy-efficient LED bulbs, battens, panels, and smart lighting solutions.',
    icon: '💡',
    whatIsIt: 'Modern LED lighting that provides efficient illumination while consuming 80% less power than traditional bulbs.',
    whereUsed: 'Every space - ambient lighting for rooms, task lighting for work, accent lighting for aesthetics.',
    whyQualityMatters: 'Quality LEDs last 25,000+ hours and maintain brightness. Cheap ones flicker, lose lumens, and fail in 2 years.',
    commonMistakes: 'Wrong color temperature (warm for bedrooms, cool for offices), inadequate lumens, no layered lighting plan.',
    subcategories: [
      { name: 'LED Bulbs', slug: 'led-bulbs', description: 'B22 and E27 base bulbs in warm/cool/daylight' },
      { name: 'LED Panels', slug: 'led-panels', description: 'Surface and recessed panels for false ceiling' },
      { name: 'LED Battens', slug: 'led-battens', description: 'Direct replacement for fluorescent tubes' },
    ]
  },
  // Category 3: MCBs & Distribution (shown in screenshot)
  {
    id: 'mcbs-distribution',
    name: 'MCBs & Distribution',
    slug: 'mcbs-distribution',
    description: 'Circuit breakers, distribution boards, and load management solutions.',
    icon: '🔒',
    whatIsIt: 'Protection devices that automatically disconnect power during faults, preventing fires, shocks, and appliance damage.',
    whereUsed: 'Main DB, sub-distribution boards, individual circuit points, heavy appliances like AC and geyser.',
    whyQualityMatters: 'Cheap MCBs fail to trip during faults - leading to fires and electrocution. ISI-marked quality MCBs save lives.',
    commonMistakes: 'Wrong MCB rating (too high = no protection), skipping RCCB entirely, no surge protection for electronics.',
    subcategories: [
      { name: 'MCBs', slug: 'mcb', description: 'Miniature circuit breakers for overcurrent protection' },
      { name: 'Distribution Boards', slug: 'distribution-boards', description: 'SPN, TPN boards for organizing circuit protection' },
      { name: 'RCCBs', slug: 'rccb', description: 'Residual current circuit breakers for earth leakage protection' },
    ]
  },
  // Category 4: Water Heaters (shown in screenshot)
  {
    id: 'water-heaters',
    name: 'Water Heaters',
    slug: 'water-heaters',
    description: 'Instant and storage geysers, solar water heaters, and heating elements.',
    icon: '🔥',
    whatIsIt: 'Electric water heating appliances for bathrooms and kitchens, available in instant and storage variants.',
    whereUsed: 'Bathrooms for bathing, kitchens for dishwashing, utility areas for laundry.',
    whyQualityMatters: 'Quality geysers have better insulation (lower electricity bills), safety features (thermostat, pressure valve), and longer life.',
    commonMistakes: 'Undersizing capacity, skipping ISI mark, no pressure relief valve, inadequate wiring (use 4 sq mm).',
    subcategories: [
      { name: 'Instant Geysers', slug: 'instant-geysers', description: 'Quick heating for small water requirements' },
      { name: 'Storage Geysers', slug: 'storage-geysers', description: 'Tank-based heaters for family use' },
      { name: 'Solar Water Heaters', slug: 'solar-water-heaters', description: 'Eco-friendly solar heating systems' },
    ]
  },
  // Category 5: Doorbells & Accessories (shown in screenshot)
  {
    id: 'doorbells-accessories',
    name: 'Doorbells & Accessories',
    slug: 'doorbells-accessories',
    description: 'Wired and wireless doorbells, video doorbells, and calling accessories.',
    icon: '🔔',
    whatIsIt: 'Door notification systems ranging from simple chimes to smart video doorbells with two-way communication.',
    whereUsed: 'Main entrance, gate entry, office reception, apartment intercom systems.',
    whyQualityMatters: 'Quality doorbells have clear audio, durable buttons, and reliable wireless range or wiring.',
    commonMistakes: 'Weak wireless range, cheap plastic buttons that crack, no backup power for video doorbells.',
    subcategories: [
      { name: 'Wired Doorbells', slug: 'wired-doorbells', description: 'Traditional wired chime doorbells' },
      { name: 'Wireless Doorbells', slug: 'wireless-doorbells', description: 'Battery or plug-in wireless doorbells' },
      { name: 'Video Doorbells', slug: 'video-doorbells', description: 'Smart doorbells with camera and intercom' },
    ]
  },
  // Category 6: Wires & Cables (core category)
  {
    id: 'wires-cables',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'House wiring, armoured cables, submersible cables, and communication cables for every electrical need.',
    icon: '⚡',
    whatIsIt: 'Electrical cables that carry power from distribution to outlets, available in various sizes and types.',
    whereUsed: 'Throughout the building - main distribution, room circuits, AC points, kitchen appliances, outdoor lighting.',
    whyQualityMatters: 'Poor quality wiring is responsible for 70% of electrical fires in India. Good wiring lasts 25+ years; cheap wire fails in 5.',
    commonMistakes: 'Undersized wires for AC (use 4 sq mm, not 2.5), mixing copper-aluminum, skipping FRLS for safety, no color coding.',
    subcategories: [
      { name: 'House Wiring Cables', slug: 'house-wiring', description: 'FR/FRLS/ZHFR cables for indoor residential and commercial wiring' },
      { name: 'Armoured Cables', slug: 'armoured-cables', description: 'PVC/XLPE armoured cables for mains and underground installation' },
      { name: 'Flexible Cables', slug: 'flexible-cables', description: 'Multi-strand flexible cables for appliances and temporary connections' },
      { name: 'Submersible Cables', slug: 'submersible-cables', description: 'Water-resistant cables for borewell and submersible pumps' },
      { name: 'Communication Cables', slug: 'communication-cables', description: 'CAT5e, CAT6, coaxial cables for data and TV' },
      { name: 'Solar Cables', slug: 'solar-cables', description: 'UV-resistant DC cables for solar panel installations' },
    ]
  },
  // Category 7: Switchgear & Protection (shown in screenshot)
  {
    id: 'switchgear-protection',
    name: 'Switchgear & Protection',
    slug: 'switchgear-protection',
    description: 'MCBs, RCCBs, MCCBs, distribution boards, and surge protection devices for complete circuit safety.',
    icon: '🔒',
    whatIsIt: 'Protection devices that automatically disconnect power during faults, preventing fires, shocks, and appliance damage.',
    whereUsed: 'Main DB, sub-distribution boards, individual circuit points, heavy appliances like AC and geyser.',
    whyQualityMatters: 'Cheap MCBs fail to trip during faults - leading to fires and electrocution. ISI-marked quality MCBs save lives.',
    commonMistakes: 'Wrong MCB rating (too high = no protection), skipping RCCB entirely, no surge protection for electronics.',
    subcategories: [
      { name: 'MCB (Miniature Circuit Breakers)', slug: 'mcb', description: 'Overcurrent and short-circuit protection for circuits' },
      { name: 'RCCB/RCBO', slug: 'rccb-rcbo', description: 'Earth leakage protection to prevent electric shocks' },
      { name: 'MCCB', slug: 'mccb', description: 'Molded case circuit breakers for high-current applications' },
      { name: 'Distribution Boards', slug: 'distribution-boards', description: 'SPN, TPN boards for organizing circuit protection' },
      { name: 'Isolators & Changeovers', slug: 'isolators', description: 'Manual disconnection and power source switching' },
      { name: 'Surge Protection Devices', slug: 'spd', description: 'Lightning and voltage spike protection' },
      { name: 'Contactors & Relays', slug: 'contactors', description: 'Motor starters and control circuit devices' },
    ]
  },
  // Category 8: Modular Switches & Sockets (shown in screenshot)
  {
    id: 'switches-sockets',
    name: 'Modular Switches & Sockets',
    slug: 'switches-sockets',
    description: 'Premium modular switches, sockets, regulators, and plates for residential and commercial interiors.',
    icon: '🔌',
    whatIsIt: 'Touch points where you interact with your electrical system daily. Available in 1M, 2M, 6M, 8M, 12M configurations.',
    whereUsed: 'Every room - near doors for switches, work areas for sockets, beds for USB charging points.',
    whyQualityMatters: 'You touch these 50+ times daily. Cheap switches spark, fail within 2 years, and can cause shocks.',
    commonMistakes: 'Insufficient socket points (plan 20% extra), wrong height placement, no USB points, buying based on looks only.',
    subcategories: [
      { name: 'Modular Switches', slug: 'modular-switches', description: '1-way, 2-way, intermediate switches in various ratings' },
      { name: 'Socket Outlets', slug: 'sockets', description: '6A, 16A, USB sockets, universal sockets' },
      { name: 'Fan Regulators', slug: 'fan-regulators', description: 'Electronic and step regulators for ceiling fans' },
      { name: 'Dimmers', slug: 'dimmers', description: 'LED-compatible dimmers for mood lighting' },
      { name: 'Plates & Frames', slug: 'plates-frames', description: '1M to 18M cover plates in various finishes' },
      { name: 'Bell Pushes & Indicators', slug: 'bell-indicators', description: 'Door bell switches and DND indicators' },
    ]
  },
  // Category 9: Lighting & Luminaires (shown in screenshot)
  {
    id: 'lighting-luminaires',
    name: 'Lighting & Luminaires',
    slug: 'lighting-luminaires',
    description: 'LED bulbs, panels, downlights, street lights, and decorative fixtures for every lighting need.',
    icon: '💡',
    whatIsIt: 'Modern LED lighting that provides efficient illumination while consuming 80% less power than traditional bulbs.',
    whereUsed: 'Every space - ambient lighting for rooms, task lighting for work, accent lighting for aesthetics, safety lighting for exits.',
    whyQualityMatters: 'Quality LEDs last 25,000+ hours and maintain brightness. Cheap ones flicker, lose lumens, and fail in 2 years.',
    commonMistakes: 'Wrong color temperature (warm for bedrooms, cool for offices), inadequate lumens, no layered lighting plan.',
    subcategories: [
      { name: 'LED Bulbs', slug: 'led-bulbs', description: 'B22 and E27 base bulbs in warm/cool/daylight' },
      { name: 'LED Battens & Tubes', slug: 'led-battens', description: 'Direct replacement for fluorescent tubes' },
      { name: 'LED Panels', slug: 'led-panels', description: 'Surface and recessed panels for false ceiling' },
      { name: 'Downlights & Spotlights', slug: 'downlights', description: 'Recessed COB lights and track spotlights' },
      { name: 'Street & Outdoor Lights', slug: 'outdoor-lighting', description: 'Flood lights, street lights, garden lights' },
      { name: 'Decorative Fixtures', slug: 'decorative', description: 'Chandeliers, pendants, wall sconces' },
      { name: 'Emergency Lights', slug: 'emergency-lights', description: 'Exit signs and emergency backup lights' },
    ]
  },
  // Category 10: Fans & Ventilation (shown in screenshot)
  {
    id: 'fans-ventilation',
    name: 'Fans & Ventilation',
    slug: 'fans-ventilation',
    description: 'Ceiling fans, exhaust fans, BLDC fans, and industrial ventilation systems.',
    icon: '🌀',
    whatIsIt: 'Air circulation devices that keep spaces comfortable and remove stale air, moisture, and odors.',
    whereUsed: 'Bedrooms and living rooms (ceiling fans), kitchens and bathrooms (exhaust), large halls (industrial fans).',
    whyQualityMatters: 'A good fan reduces AC usage by 30%. Bad fans are noisy, wobble, and consume 2x power. 5-star rating matters!',
    commonMistakes: 'Wrong blade size for room (48" for 150 sq ft), mounting too low (min 8 ft), ignoring energy rating.',
    subcategories: [
      { name: 'Ceiling Fans', slug: 'ceiling-fans', description: 'Standard, decorative, and BLDC ceiling fans' },
      { name: 'Exhaust Fans', slug: 'exhaust-fans', description: 'Kitchen, bathroom, and industrial exhaust' },
      { name: 'Pedestal & Wall Fans', slug: 'pedestal-fans', description: 'Portable and wall-mounted fans' },
      { name: 'BLDC Fans', slug: 'bldc-fans', description: 'Energy-efficient brushless DC motor fans' },
      { name: 'Industrial Fans', slug: 'industrial-fans', description: 'High-volume air circulators for large spaces' },
    ]
  },
  // Category 11: Earthing & Safety Systems (shown in screenshot)
  {
    id: 'earthing-safety-systems',
    name: 'Earthing & Safety Systems',
    slug: 'earthing-safety-systems',
    description: 'Earth pits, earthing electrodes, lightning arrestors, and surge protection for building safety.',
    icon: '🛡️',
    whatIsIt: 'Grounding systems that provide a safe path for fault current, preventing electric shocks and equipment damage.',
    whereUsed: 'Main earth pit near meter, body earthing for appliances, lightning protection on rooftops.',
    whyQualityMatters: 'Proper earthing is literally life-saving. Bad earthing kills people during faults and monsoons.',
    commonMistakes: 'Single earth pit instead of multiple, no maintenance schedule, using pipe earthing in rocky soil.',
    subcategories: [
      { name: 'Earth Electrodes', slug: 'earth-electrodes', description: 'GI pipe, copper plate, chemical earthing' },
      { name: 'Earth Strips & Clamps', slug: 'earth-strips', description: 'Copper strips and connection clamps' },
      { name: 'Lightning Arrestors', slug: 'lightning-arrestors', description: 'ESE and conventional lightning protection' },
      { name: 'Surge Protection', slug: 'surge-protection', description: 'Type 1, 2, 3 surge protective devices' },
    ]
  },
  // Category 12: Power Backup & Solar (shown in screenshot)
  {
    id: 'power-backup-solar',
    name: 'Power Backup & Solar',
    slug: 'power-backup-solar',
    description: 'Inverters, UPS systems, batteries, and solar solutions for uninterrupted power.',
    icon: '🔋',
    whatIsIt: 'Backup power systems that keep essential loads running during grid outages using batteries or solar.',
    whereUsed: 'Homes (inverter + battery), offices (online UPS), IT equipment (rack UPS), solar for long-term savings.',
    whyQualityMatters: 'Cheap inverters have poor waveform damaging motors. Bad batteries need replacement in 2 years vs 5 years.',
    commonMistakes: 'Undersizing inverter VA capacity, wrong battery type (tubular for long backup), no solar integration planning.',
    subcategories: [
      { name: 'Inverters', slug: 'inverters', description: 'Pure sine wave inverters for home and office' },
      { name: 'UPS Systems', slug: 'ups', description: 'Online and offline UPS for computers and servers' },
      { name: 'Batteries', slug: 'batteries', description: 'Tubular, SMF, and lithium batteries' },
      { name: 'Solar Panels', slug: 'solar-panels', description: 'Mono and polycrystalline solar modules' },
      { name: 'Solar Inverters', slug: 'solar-inverters', description: 'On-grid and off-grid solar inverters' },
    ]
  },
  // Category 13: Tools & Testers (shown in screenshot)
  {
    id: 'tools-testers',
    name: 'Tools & Testers',
    slug: 'tools-testers',
    description: 'Multimeters, clamp meters, wire strippers, crimping tools, and installation accessories.',
    icon: '🔧',
    whatIsIt: 'Professional-grade tools for electrical installation, testing, and maintenance work.',
    whereUsed: 'By electricians for installation, testing earth resistance, checking load, crimping lugs, and cable management.',
    whyQualityMatters: 'Quality tools ensure proper connections, accurate measurements, and safe working conditions.',
    commonMistakes: 'Using wrong lug sizes, cheap crimping tools causing loose connections, not testing before energizing.',
    subcategories: [
      { name: 'Multimeters', slug: 'multimeters', description: 'Digital and analog meters for voltage/current/resistance' },
      { name: 'Clamp Meters', slug: 'clamp-meters', description: 'Non-contact current measurement devices' },
      { name: 'Hand Tools', slug: 'hand-tools', description: 'Wire strippers, crimpers, screwdrivers' },
      { name: 'Cable Accessories', slug: 'cable-accessories', description: 'Lugs, glands, ties, channels' },
      { name: 'Conduit & Trunking', slug: 'conduit', description: 'PVC conduits, casing-capping, trunking' },
    ]
  },
  // Category 14: Smart Electrical & Automation (shown in screenshot)
  {
    id: 'smart-electrical-automation',
    name: 'Smart Electrical & Automation',
    slug: 'smart-electrical-automation',
    description: 'Smart switches, home automation, WiFi-enabled devices, and IoT electrical solutions.',
    icon: '📱',
    whatIsIt: 'Internet-connected electrical devices that can be controlled via smartphone, voice assistants, or automation rules.',
    whereUsed: 'Living rooms (smart lights, curtains), security (smart locks, cameras), energy management (smart plugs, meters).',
    whyQualityMatters: 'Quality smart devices have reliable connectivity, regular security updates, and local control fallback.',
    commonMistakes: 'Buying devices without checking app compatibility, no neutral wire for smart switches, weak WiFi coverage.',
    subcategories: [
      { name: 'Smart Switches', slug: 'smart-switches', description: 'WiFi and Zigbee enabled wall switches' },
      { name: 'Smart Plugs', slug: 'smart-plugs', description: 'Remote controlled power outlets with energy monitoring' },
      { name: 'Smart Lighting', slug: 'smart-lighting', description: 'Color-changing and dimmable smart bulbs' },
      { name: 'Home Automation Hubs', slug: 'automation-hubs', description: 'Central controllers for smart home devices' },
      { name: 'Smart Sensors', slug: 'smart-sensors', description: 'Motion, door, temperature, and humidity sensors' },
    ]
  },
];

export const comprehensiveBrands = [
  // Wires & Cables
  { name: 'Polycab', slug: 'polycab', website: 'https://www.polycab.com', category: 'wires-cables', priceSegment: 'Mid-range', qualityRating: 4.2, isPremium: false, description: 'India\'s largest wire manufacturer with 50+ years legacy' },
  { name: 'Finolex Cables', slug: 'finolex', website: 'https://www.finolex.com', category: 'wires-cables', priceSegment: 'Budget', qualityRating: 3.8, isPremium: false, description: 'Trusted budget option with good quality-price ratio' },
  { name: 'RR Kabel', slug: 'rr-kabel', website: 'https://www.rrkabel.com', category: 'wires-cables', priceSegment: 'Mid-range', qualityRating: 4.0, isPremium: false, description: 'Known for industrial and submersible cables' },
  { name: 'KEI Industries', slug: 'kei', website: 'https://www.kei-ind.com', category: 'wires-cables', priceSegment: 'Mid-range', qualityRating: 4.1, isPremium: false, description: 'Premium quality with focus on safety standards' },
  { name: 'Havells Cables', slug: 'havells-cables', website: 'https://www.havells.com', category: 'wires-cables', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'Trusted household brand with premium quality' },
  { name: 'V-Guard', slug: 'vguard', website: 'https://www.vguard.in', category: 'wires-cables', priceSegment: 'Mid-range', qualityRating: 4.0, isPremium: false, description: 'South India favorite with good service network' },

  // Switchgear
  { name: 'Schneider Electric', slug: 'schneider', website: 'https://www.se.com/in', category: 'switchgear', priceSegment: 'Premium', qualityRating: 4.7, isPremium: true, description: 'Global leader in electrical distribution and automation' },
  { name: 'Havells', slug: 'havells', website: 'https://www.havells.com', category: 'switchgear', priceSegment: 'Mid-range', qualityRating: 4.4, isPremium: false, description: 'Most trusted Indian brand for MCBs and DBs' },
  { name: 'L&T Electrical', slug: 'lnt', website: 'https://www.lntebg.com', category: 'switchgear', priceSegment: 'Premium', qualityRating: 4.6, isPremium: true, description: 'Industrial-grade switchgear with proven reliability' },
  { name: 'Siemens', slug: 'siemens', website: 'https://new.siemens.com/in', category: 'switchgear', priceSegment: 'Premium', qualityRating: 4.8, isPremium: true, description: 'German engineering excellence in electrical systems' },
  { name: 'ABB', slug: 'abb', website: 'https://new.abb.com/in', category: 'switchgear', priceSegment: 'Premium', qualityRating: 4.7, isPremium: true, description: 'Pioneer in power and automation technologies' },
  { name: 'Legrand', slug: 'legrand', website: 'https://www.legrand.co.in', category: 'switchgear', priceSegment: 'Premium', qualityRating: 4.5, isPremium: true, description: 'French elegance meets electrical excellence' },
  { name: 'C&S Electric', slug: 'cands', website: 'https://www.cnepl.com', category: 'switchgear', priceSegment: 'Mid-range', qualityRating: 4.2, isPremium: false, description: 'Value-for-money switchgear solutions' },

  // Switches & Sockets
  { name: 'Anchor by Panasonic', slug: 'anchor', website: 'https://www.lsin.panasonic.com', category: 'switches-sockets', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'India\'s most popular modular switch brand' },
  { name: 'Legrand India', slug: 'legrand-switches', website: 'https://www.legrand.co.in', category: 'switches-sockets', priceSegment: 'Premium', qualityRating: 4.6, isPremium: true, description: 'Premium aesthetics with European design' },
  { name: 'Havells Switches', slug: 'havells-switches', website: 'https://www.havells.com', category: 'switches-sockets', priceSegment: 'Mid-range', qualityRating: 4.4, isPremium: false, description: 'Reliable switches with modern designs' },
  { name: 'Goldmedal', slug: 'goldmedal', website: 'https://www.goldmedalindia.com', category: 'switches-sockets', priceSegment: 'Mid-range', qualityRating: 4.1, isPremium: false, description: 'Strong presence in West India markets' },
  { name: 'GM Modular', slug: 'gm-modular', website: 'https://www.gmmodular.com', category: 'switches-sockets', priceSegment: 'Budget', qualityRating: 3.8, isPremium: false, description: 'Budget-friendly modular solutions' },
  { name: 'Wipro Lighting', slug: 'wipro', website: 'https://www.wiprolighting.com', category: 'switches-sockets', priceSegment: 'Mid-range', qualityRating: 4.0, isPremium: false, description: 'IT company bringing tech to electricals' },

  // Lighting
  { name: 'Philips / Signify', slug: 'philips', website: 'https://www.signify.com', category: 'lighting-luminaires', priceSegment: 'Premium', qualityRating: 4.8, isPremium: true, description: 'World leader in lighting with 100+ years legacy' },
  { name: 'Syska LED', slug: 'syska', website: 'https://www.syska.co.in', category: 'lighting-luminaires', priceSegment: 'Mid-range', qualityRating: 4.2, isPremium: false, description: 'Popular LED brand with competitive pricing' },
  { name: 'Havells Lighting', slug: 'havells-lighting', website: 'https://www.havells.com', category: 'lighting-luminaires', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'Comprehensive lighting solutions' },
  { name: 'Crompton Lighting', slug: 'crompton-lighting', website: 'https://www.crompton.co.in', category: 'lighting-luminaires', priceSegment: 'Mid-range', qualityRating: 4.1, isPremium: false, description: 'Trusted brand with wide product range' },
  { name: 'Orient Electric', slug: 'orient-lighting', website: 'https://www.orientelectric.com', category: 'lighting-luminaires', priceSegment: 'Budget', qualityRating: 3.9, isPremium: false, description: 'Budget LED options with decent quality' },
  { name: 'Eveready', slug: 'eveready', website: 'https://www.evereadyindia.com', category: 'lighting-luminaires', priceSegment: 'Budget', qualityRating: 3.7, isPremium: false, description: 'Household name in batteries and lights' },

  // Fans
  { name: 'Crompton Fans', slug: 'crompton-fans', website: 'https://www.crompton.co.in', category: 'fans-ventilation', priceSegment: 'Mid-range', qualityRating: 4.4, isPremium: false, description: 'Energy-efficient fans with 5-star ratings' },
  { name: 'Orient Electric Fans', slug: 'orient-fans', website: 'https://www.orientelectric.com', category: 'fans-ventilation', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'Pioneer in BLDC technology' },
  { name: 'Havells Fans', slug: 'havells-fans', website: 'https://www.havells.com', category: 'fans-ventilation', priceSegment: 'Mid-range', qualityRating: 4.2, isPremium: false, description: 'Stylish designs with good performance' },
  { name: 'Usha Fans', slug: 'usha', website: 'https://www.usha.com', category: 'fans-ventilation', priceSegment: 'Budget', qualityRating: 3.9, isPremium: false, description: 'Value-for-money exhaust and ceiling fans' },
  { name: 'Atomberg', slug: 'atomberg', website: 'https://www.atomberg.com', category: 'fans-ventilation', priceSegment: 'Premium', qualityRating: 4.6, isPremium: true, description: 'Gorilla fans - India\'s most efficient BLDC fans' },

  // Power Backup
  { name: 'Luminous', slug: 'luminous', website: 'https://www.luminousindia.com', category: 'power-backup-solar', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'Market leader in inverters and batteries' },
  { name: 'Microtek', slug: 'microtek', website: 'https://www.microtekdirect.com', category: 'power-backup-solar', priceSegment: 'Mid-range', qualityRating: 4.1, isPremium: false, description: 'Reliable UPS and inverter solutions' },
  { name: 'APC by Schneider', slug: 'apc', website: 'https://www.apc.com', category: 'power-backup-solar', priceSegment: 'Premium', qualityRating: 4.7, isPremium: true, description: 'Premium UPS for IT and critical loads' },
  { name: 'Exide', slug: 'exide', website: 'https://www.exideindustries.com', category: 'power-backup-solar', priceSegment: 'Mid-range', qualityRating: 4.2, isPremium: false, description: 'India\'s largest battery manufacturer' },
  { name: 'Amara Raja', slug: 'amararaja', website: 'https://www.amararaja.com', category: 'power-backup-solar', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'Amaron batteries - power you can trust' },

  // Tools
  { name: 'Fluke', slug: 'fluke', website: 'https://www.fluke.com', category: 'tools-testers', priceSegment: 'Premium', qualityRating: 4.9, isPremium: true, description: 'Gold standard in electrical testing equipment' },
  { name: 'Bosch Professional', slug: 'bosch', website: 'https://www.boschprofessional.com', category: 'tools-testers', priceSegment: 'Premium', qualityRating: 4.7, isPremium: true, description: 'German engineering in power tools' },
  { name: 'Stanley', slug: 'stanley', website: 'https://www.stanleyworks.com', category: 'tools-testers', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false, description: 'Professional hand tools and testers' },
  { name: 'Taparia', slug: 'taparia', website: 'https://www.taparia.com', category: 'tools-testers', priceSegment: 'Budget', qualityRating: 3.8, isPremium: false, description: 'India\'s leading hand tool manufacturer' },
];

export const comprehensiveProducts = [
  // ============ WIRES & CABLES ============
  // Polycab
  { name: 'Polycab 1.5 sq mm FR PVC Wire (90m)', brand: 'polycab', category: 'wires-cables', subcategory: 'house-wiring', sku: 'POLY-FR-1.5-90', price: { min: 2200, max: 2600 }, unit: 'roll', specs: { size: '1.5 sq mm', length: '90m', type: 'FR PVC', conductor: 'Copper', standard: 'IS 694' }, popular: true },
  { name: 'Polycab 2.5 sq mm FR PVC Wire (90m)', brand: 'polycab', category: 'wires-cables', subcategory: 'house-wiring', sku: 'POLY-FR-2.5-90', price: { min: 3600, max: 4200 }, unit: 'roll', specs: { size: '2.5 sq mm', length: '90m', type: 'FR PVC', conductor: 'Copper', standard: 'IS 694' }, popular: true },
  { name: 'Polycab 4 sq mm FR PVC Wire (90m)', brand: 'polycab', category: 'wires-cables', subcategory: 'house-wiring', sku: 'POLY-FR-4-90', price: { min: 5800, max: 6600 }, unit: 'roll', specs: { size: '4 sq mm', length: '90m', type: 'FR PVC', conductor: 'Copper', standard: 'IS 694' } },
  { name: 'Polycab 6 sq mm FR PVC Wire (90m)', brand: 'polycab', category: 'wires-cables', subcategory: 'house-wiring', sku: 'POLY-FR-6-90', price: { min: 8500, max: 9800 }, unit: 'roll', specs: { size: '6 sq mm', length: '90m', type: 'FR PVC', conductor: 'Copper', standard: 'IS 694' } },
  { name: 'Polycab Submersible Flat Cable 4 core x 4 sq mm', brand: 'polycab', category: 'wires-cables', subcategory: 'submersible-cables', sku: 'POLY-SUB-4X4', price: { min: 180, max: 220 }, unit: 'meter', specs: { size: '4 sq mm', cores: 4, type: 'Submersible' } },

  // Havells
  { name: 'Havells Lifeline Plus 1.5 sq mm HRFR (90m)', brand: 'havells-cables', category: 'wires-cables', subcategory: 'house-wiring', sku: 'HAV-HRFR-1.5-90', price: { min: 2400, max: 2900 }, unit: 'roll', specs: { size: '1.5 sq mm', length: '90m', type: 'HRFR', conductor: 'Copper' }, popular: true },
  { name: 'Havells Lifeline Plus 2.5 sq mm HRFR (90m)', brand: 'havells-cables', category: 'wires-cables', subcategory: 'house-wiring', sku: 'HAV-HRFR-2.5-90', price: { min: 3900, max: 4500 }, unit: 'roll', specs: { size: '2.5 sq mm', length: '90m', type: 'HRFR', conductor: 'Copper' }, popular: true },
  { name: 'Havells Lifeline Plus 4 sq mm HRFR (90m)', brand: 'havells-cables', category: 'wires-cables', subcategory: 'house-wiring', sku: 'HAV-HRFR-4-90', price: { min: 6200, max: 7200 }, unit: 'roll', specs: { size: '4 sq mm', length: '90m', type: 'HRFR', conductor: 'Copper' } },

  // Finolex
  { name: 'Finolex 1.5 sq mm FR Wire (90m)', brand: 'finolex', category: 'wires-cables', subcategory: 'house-wiring', sku: 'FIN-FR-1.5-90', price: { min: 1900, max: 2300 }, unit: 'roll', specs: { size: '1.5 sq mm', length: '90m', type: 'FR PVC' } },
  { name: 'Finolex 2.5 sq mm FR Wire (90m)', brand: 'finolex', category: 'wires-cables', subcategory: 'house-wiring', sku: 'FIN-FR-2.5-90', price: { min: 3200, max: 3800 }, unit: 'roll', specs: { size: '2.5 sq mm', length: '90m', type: 'FR PVC' } },

  // ============ SWITCHGEAR ============
  // Schneider Electric
  { name: 'Schneider Easy9 6A SP MCB C-Curve', brand: 'schneider', category: 'switchgear-protection', subcategory: 'mcb', sku: 'SCH-E9-6A-SP', price: { min: 120, max: 160 }, unit: 'piece', specs: { rating: '6A', poles: 'SP', curve: 'C', breaking: '10kA' } },
  { name: 'Schneider Easy9 16A SP MCB C-Curve', brand: 'schneider', category: 'switchgear-protection', subcategory: 'mcb', sku: 'SCH-E9-16A-SP', price: { min: 130, max: 170 }, unit: 'piece', specs: { rating: '16A', poles: 'SP', curve: 'C', breaking: '10kA' }, popular: true },
  { name: 'Schneider Easy9 32A SP MCB C-Curve', brand: 'schneider', category: 'switchgear-protection', subcategory: 'mcb', sku: 'SCH-E9-32A-SP', price: { min: 150, max: 190 }, unit: 'piece', specs: { rating: '32A', poles: 'SP', curve: 'C', breaking: '10kA' }, popular: true },
  { name: 'Schneider Easy9 40A DP MCB', brand: 'schneider', category: 'switchgear-protection', subcategory: 'mcb', sku: 'SCH-E9-40A-DP', price: { min: 380, max: 450 }, unit: 'piece', specs: { rating: '40A', poles: 'DP', curve: 'C', breaking: '10kA' } },
  { name: 'Schneider Acti9 40A 30mA RCCB 2P', brand: 'schneider', category: 'switchgear-protection', subcategory: 'rccb-rcbo', sku: 'SCH-A9-RCCB-2P', price: { min: 1800, max: 2200 }, unit: 'piece', specs: { rating: '40A', sensitivity: '30mA', poles: '2P' }, popular: true },
  { name: 'Schneider Acti9 63A 30mA RCCB 4P', brand: 'schneider', category: 'switchgear-protection', subcategory: 'rccb-rcbo', sku: 'SCH-A9-RCCB-4P', price: { min: 3200, max: 3800 }, unit: 'piece', specs: { rating: '63A', sensitivity: '30mA', poles: '4P' } },

  // Havells
  { name: 'Havells 6A SP MCB C-Curve', brand: 'havells', category: 'switchgear-protection', subcategory: 'mcb', sku: 'HAV-MCB-6A-SP', price: { min: 100, max: 140 }, unit: 'piece', specs: { rating: '6A', poles: 'SP', curve: 'C' } },
  { name: 'Havells 16A SP MCB C-Curve', brand: 'havells', category: 'switchgear-protection', subcategory: 'mcb', sku: 'HAV-MCB-16A-SP', price: { min: 110, max: 150 }, unit: 'piece', specs: { rating: '16A', poles: 'SP', curve: 'C' }, popular: true },
  { name: 'Havells 32A SP MCB C-Curve', brand: 'havells', category: 'switchgear-protection', subcategory: 'mcb', sku: 'HAV-MCB-32A-SP', price: { min: 130, max: 170 }, unit: 'piece', specs: { rating: '32A', poles: 'SP', curve: 'C' }, popular: true },
  { name: 'Havells 4-Way SPN DB', brand: 'havells', category: 'switchgear-protection', subcategory: 'distribution-boards', sku: 'HAV-DB-4W-SPN', price: { min: 800, max: 1100 }, unit: 'piece', specs: { ways: 4, type: 'SPN', material: 'Metal' }, popular: true },
  { name: 'Havells 8-Way SPN DB', brand: 'havells', category: 'switchgear-protection', subcategory: 'distribution-boards', sku: 'HAV-DB-8W-SPN', price: { min: 1200, max: 1600 }, unit: 'piece', specs: { ways: 8, type: 'SPN', material: 'Metal' } },
  { name: 'Havells 40A 30mA RCCB 2P', brand: 'havells', category: 'switchgear-protection', subcategory: 'rccb-rcbo', sku: 'HAV-RCCB-40A-2P', price: { min: 1500, max: 1900 }, unit: 'piece', specs: { rating: '40A', sensitivity: '30mA', poles: '2P' }, popular: true },

  // L&T
  { name: 'L&T 32A DP MCB', brand: 'lnt', category: 'switchgear-protection', subcategory: 'mcb', sku: 'LNT-MCB-32A-DP', price: { min: 350, max: 420 }, unit: 'piece', specs: { rating: '32A', poles: 'DP', curve: 'C' } },
  { name: 'L&T 63A TP MCB', brand: 'lnt', category: 'switchgear-protection', subcategory: 'mcb', sku: 'LNT-MCB-63A-TP', price: { min: 650, max: 780 }, unit: 'piece', specs: { rating: '63A', poles: 'TP', curve: 'C' } },

  // ============ SWITCHES & SOCKETS ============
  // Anchor
  { name: 'Anchor Roma 6A 1-Way Switch', brand: 'anchor', category: 'switches-sockets', subcategory: 'modular-switches', sku: 'ANC-ROMA-6A-1W', price: { min: 45, max: 65 }, unit: 'piece', specs: { rating: '6A', type: '1-Way', size: '1 Module' }, popular: true },
  { name: 'Anchor Roma 16A Switch', brand: 'anchor', category: 'switches-sockets', subcategory: 'modular-switches', sku: 'ANC-ROMA-16A', price: { min: 75, max: 100 }, unit: 'piece', specs: { rating: '16A', type: '1-Way', size: '2 Module' } },
  { name: 'Anchor Roma 6A 2-Pin Socket', brand: 'anchor', category: 'switches-sockets', subcategory: 'sockets', sku: 'ANC-ROMA-6A-2P', price: { min: 40, max: 55 }, unit: 'piece', specs: { rating: '6A', type: '2-Pin' }, popular: true },
  { name: 'Anchor Roma 16A 3-Pin Socket', brand: 'anchor', category: 'switches-sockets', subcategory: 'sockets', sku: 'ANC-ROMA-16A-3P', price: { min: 95, max: 125 }, unit: 'piece', specs: { rating: '16A', type: '3-Pin with Earth' }, popular: true },
  { name: 'Anchor Roma 8M Cover Plate', brand: 'anchor', category: 'switches-sockets', subcategory: 'plates-frames', sku: 'ANC-ROMA-8M-PLATE', price: { min: 85, max: 120 }, unit: 'piece', specs: { size: '8 Module', material: 'Polycarbonate' } },
  { name: 'Anchor Roma Fan Regulator', brand: 'anchor', category: 'switches-sockets', subcategory: 'fan-regulators', sku: 'ANC-ROMA-REG', price: { min: 180, max: 240 }, unit: 'piece', specs: { type: 'Step Regulator', steps: 5 } },

  // Legrand
  { name: 'Legrand Myrius 6A 1-Way Switch', brand: 'legrand-switches', category: 'switches-sockets', subcategory: 'modular-switches', sku: 'LEG-MYR-6A-1W', price: { min: 85, max: 110 }, unit: 'piece', specs: { rating: '6A', type: '1-Way', finish: 'White' }, popular: true },
  { name: 'Legrand Myrius 16A 3-Pin Socket', brand: 'legrand-switches', category: 'switches-sockets', subcategory: 'sockets', sku: 'LEG-MYR-16A-3P', price: { min: 150, max: 190 }, unit: 'piece', specs: { rating: '16A', type: '3-Pin', safety: 'Child Safe' } },
  { name: 'Legrand Arteor USB Charger Module', brand: 'legrand-switches', category: 'switches-sockets', subcategory: 'sockets', sku: 'LEG-ART-USB', price: { min: 450, max: 550 }, unit: 'piece', specs: { output: '2.1A', ports: 2, type: 'USB-A' } },

  // GM Modular
  { name: 'GM Vivid 6A 1-Way Switch', brand: 'gm-modular', category: 'switches-sockets', subcategory: 'modular-switches', sku: 'GM-VIV-6A-1W', price: { min: 35, max: 50 }, unit: 'piece', specs: { rating: '6A', type: '1-Way' } },
  { name: 'GM Vivid 16A Socket', brand: 'gm-modular', category: 'switches-sockets', subcategory: 'sockets', sku: 'GM-VIV-16A', price: { min: 70, max: 95 }, unit: 'piece', specs: { rating: '16A', type: '3-Pin' } },

  // ============ LIGHTING ============
  // Philips
  { name: 'Philips Stellar Bright 9W LED Bulb B22', brand: 'philips', category: 'lighting-luminaires', subcategory: 'led-bulbs', sku: 'PHI-SB-9W-B22', price: { min: 85, max: 110 }, unit: 'piece', specs: { wattage: '9W', lumens: '900lm', base: 'B22', cct: '6500K' }, popular: true },
  { name: 'Philips Stellar Bright 12W LED Bulb B22', brand: 'philips', category: 'lighting-luminaires', subcategory: 'led-bulbs', sku: 'PHI-SB-12W-B22', price: { min: 110, max: 140 }, unit: 'piece', specs: { wattage: '12W', lumens: '1200lm', base: 'B22', cct: '6500K' }, popular: true },
  { name: 'Philips 20W LED Batten', brand: 'philips', category: 'lighting-luminaires', subcategory: 'led-battens', sku: 'PHI-BAT-20W', price: { min: 280, max: 350 }, unit: 'piece', specs: { wattage: '20W', lumens: '2000lm', length: '4ft' }, popular: true },
  { name: 'Philips 36W LED Batten', brand: 'philips', category: 'lighting-luminaires', subcategory: 'led-battens', sku: 'PHI-BAT-36W', price: { min: 450, max: 550 }, unit: 'piece', specs: { wattage: '36W', lumens: '3600lm', length: '4ft' } },
  { name: 'Philips 18W Round LED Panel', brand: 'philips', category: 'lighting-luminaires', subcategory: 'led-panels', sku: 'PHI-PAN-18W-R', price: { min: 550, max: 700 }, unit: 'piece', specs: { wattage: '18W', shape: 'Round', mounting: 'Recessed' } },

  // Syska
  { name: 'Syska 9W LED Bulb B22', brand: 'syska', category: 'lighting-luminaires', subcategory: 'led-bulbs', sku: 'SYS-9W-B22', price: { min: 70, max: 95 }, unit: 'piece', specs: { wattage: '9W', lumens: '850lm', base: 'B22' }, popular: true },
  { name: 'Syska 20W LED Batten', brand: 'syska', category: 'lighting-luminaires', subcategory: 'led-battens', sku: 'SYS-BAT-20W', price: { min: 220, max: 280 }, unit: 'piece', specs: { wattage: '20W', length: '4ft' } },

  // Crompton
  { name: 'Crompton 15W Rechargeable LED Bulb', brand: 'crompton-lighting', category: 'lighting-luminaires', subcategory: 'led-bulbs', sku: 'CRO-RECH-15W', price: { min: 280, max: 350 }, unit: 'piece', specs: { wattage: '15W', backup: '4 hours', type: 'Emergency' } },
  { name: 'Crompton 18W LED Panel', brand: 'crompton-lighting', category: 'lighting-luminaires', subcategory: 'led-panels', sku: 'CRO-PAN-18W', price: { min: 480, max: 600 }, unit: 'piece', specs: { wattage: '18W', shape: 'Square' } },

  // ============ FANS ============
  // Crompton
  { name: 'Crompton Energion HS 1200mm Ceiling Fan', brand: 'crompton-fans', category: 'fans-ventilation', subcategory: 'ceiling-fans', sku: 'CRO-ENR-1200', price: { min: 1400, max: 1700 }, unit: 'piece', specs: { sweep: '1200mm', power: '53W', star: '5-Star' }, popular: true },
  { name: 'Crompton Super Briz 1200mm Fan', brand: 'crompton-fans', category: 'fans-ventilation', subcategory: 'ceiling-fans', sku: 'CRO-SB-1200', price: { min: 1100, max: 1350 }, unit: 'piece', specs: { sweep: '1200mm', power: '70W' } },
  { name: 'Crompton Brisk Air 200mm Exhaust Fan', brand: 'crompton-fans', category: 'fans-ventilation', subcategory: 'exhaust-fans', sku: 'CRO-EXH-200', price: { min: 850, max: 1050 }, unit: 'piece', specs: { size: '200mm', airflow: '600 CMH' } },

  // Orient
  { name: 'Orient Aeroquiet 1200mm BLDC Fan', brand: 'orient-fans', category: 'fans-ventilation', subcategory: 'bldc-fans', sku: 'ORI-AQ-1200', price: { min: 2800, max: 3400 }, unit: 'piece', specs: { sweep: '1200mm', power: '28W', motor: 'BLDC', remote: 'Yes' }, popular: true },
  { name: 'Orient Electric Summer King 1200mm', brand: 'orient-fans', category: 'fans-ventilation', subcategory: 'ceiling-fans', sku: 'ORI-SK-1200', price: { min: 1200, max: 1500 }, unit: 'piece', specs: { sweep: '1200mm', power: '75W' } },

  // Atomberg
  { name: 'Atomberg Gorilla 1200mm BLDC Fan', brand: 'atomberg', category: 'fans-ventilation', subcategory: 'bldc-fans', sku: 'ATM-GOR-1200', price: { min: 3200, max: 3800 }, unit: 'piece', specs: { sweep: '1200mm', power: '28W', motor: 'BLDC', warranty: '5 Years' }, popular: true },
  { name: 'Atomberg Renesa 1200mm BLDC Fan', brand: 'atomberg', category: 'fans-ventilation', subcategory: 'bldc-fans', sku: 'ATM-REN-1200', price: { min: 3600, max: 4200 }, unit: 'piece', specs: { sweep: '1200mm', power: '28W', design: 'Premium' } },

  // ============ POWER BACKUP ============
  // Luminous
  { name: 'Luminous Eco Watt Neo 900VA Inverter', brand: 'luminous', category: 'power-backup-solar', subcategory: 'inverters', sku: 'LUM-ECO-900', price: { min: 4500, max: 5500 }, unit: 'piece', specs: { capacity: '900VA', waveform: 'Square', display: 'LED' }, popular: true },
  { name: 'Luminous Zelio+ 1100VA Pure Sine Wave', brand: 'luminous', category: 'power-backup-solar', subcategory: 'inverters', sku: 'LUM-ZEL-1100', price: { min: 6500, max: 7800 }, unit: 'piece', specs: { capacity: '1100VA', waveform: 'Pure Sine', display: 'LCD' }, popular: true },
  { name: 'Luminous Red Charge RC 18000 150Ah Battery', brand: 'luminous', category: 'power-backup-solar', subcategory: 'batteries', sku: 'LUM-RC-150', price: { min: 12000, max: 14500 }, unit: 'piece', specs: { capacity: '150Ah', type: 'Tubular', warranty: '36+24 months' }, popular: true },

  // Microtek
  { name: 'Microtek UPS EB 900VA', brand: 'microtek', category: 'power-backup-solar', subcategory: 'inverters', sku: 'MIC-EB-900', price: { min: 4200, max: 5000 }, unit: 'piece', specs: { capacity: '900VA', type: 'Home UPS' } },
  { name: 'Microtek Super Power 1100VA', brand: 'microtek', category: 'power-backup-solar', subcategory: 'inverters', sku: 'MIC-SP-1100', price: { min: 5800, max: 6800 }, unit: 'piece', specs: { capacity: '1100VA', waveform: 'Pure Sine' } },

  // Exide
  { name: 'Exide Inva Master 150Ah Tubular Battery', brand: 'exide', category: 'power-backup-solar', subcategory: 'batteries', sku: 'EXI-IM-150', price: { min: 11500, max: 13500 }, unit: 'piece', specs: { capacity: '150Ah', type: 'Tubular' }, popular: true },
  { name: 'Exide Inva Master 200Ah Tubular Battery', brand: 'exide', category: 'power-backup-solar', subcategory: 'batteries', sku: 'EXI-IM-200', price: { min: 16000, max: 19000 }, unit: 'piece', specs: { capacity: '200Ah', type: 'Tubular' } },

  // APC
  { name: 'APC Back-UPS 600VA', brand: 'apc', category: 'power-backup-solar', subcategory: 'ups', sku: 'APC-BU-600', price: { min: 3500, max: 4200 }, unit: 'piece', specs: { capacity: '600VA', outlets: 3, backup: '10 min' } },
  { name: 'APC Back-UPS Pro 1500VA', brand: 'apc', category: 'power-backup-solar', subcategory: 'ups', sku: 'APC-BUP-1500', price: { min: 12000, max: 14500 }, unit: 'piece', specs: { capacity: '1500VA', waveform: 'Sine', lcd: 'Yes' } },

  // ============ EARTHING & SAFETY ============
  { name: 'GI Pipe Earthing Electrode 3m', brand: 'generic', category: 'earthing-safety-systems', subcategory: 'earth-electrodes', sku: 'GI-EARTH-3M', price: { min: 2500, max: 3200 }, unit: 'piece', specs: { material: 'GI', length: '3m', diameter: '40mm' } },
  { name: 'Copper Plate Earthing 600x600mm', brand: 'generic', category: 'earthing-safety-systems', subcategory: 'earth-electrodes', sku: 'CU-EARTH-600', price: { min: 3500, max: 4500 }, unit: 'piece', specs: { material: 'Copper', size: '600x600mm', thickness: '3mm' } },
  { name: 'Chemical Earthing Electrode', brand: 'generic', category: 'earthing-safety-systems', subcategory: 'earth-electrodes', sku: 'CHEM-EARTH', price: { min: 4500, max: 6000 }, unit: 'piece', specs: { type: 'Chemical', maintenance: 'Low' } },

  // ============ TOOLS ============
  { name: 'Fluke 117 Digital Multimeter', brand: 'fluke', category: 'tools-testers', subcategory: 'multimeters', sku: 'FLU-117', price: { min: 12000, max: 14500 }, unit: 'piece', specs: { type: 'True RMS', category: 'CAT III 600V' }, popular: true },
  { name: 'Fluke 323 Clamp Meter', brand: 'fluke', category: 'tools-testers', subcategory: 'clamp-meters', sku: 'FLU-323', price: { min: 8500, max: 10500 }, unit: 'piece', specs: { type: 'AC Clamp', current: '400A' } },
  { name: 'Taparia 813 Electrician Tool Kit', brand: 'taparia', category: 'tools-testers', subcategory: 'hand-tools', sku: 'TAP-813-KIT', price: { min: 2800, max: 3500 }, unit: 'set', specs: { pieces: 13, type: 'Insulated' } },
  { name: 'Stanley 8-Piece Screwdriver Set', brand: 'stanley', category: 'tools-testers', subcategory: 'hand-tools', sku: 'STN-SCRW-8', price: { min: 800, max: 1100 }, unit: 'set', specs: { pieces: 8, type: 'Insulated' } },
];

// Dummy dealers for testing
export const dummyDealers = [
  {
    email: 'dealer1@test.com',
    password: 'password123',
    businessName: 'Krishna Electricals',
    ownerName: 'Ramesh Kumar',
    phone: '9876543210',
    gstNumber: '29AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    shopAddress: '123, Electronic City, Phase 1',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    brands: ['polycab', 'havells', 'anchor'],
    categories: ['wires-cables', 'switches-sockets'],
    serviceAreas: ['560100', '560101', '560102', '560103'],
  },
  {
    email: 'dealer2@test.com',
    password: 'password123',
    businessName: 'Shree Ganesh Electricals',
    ownerName: 'Suresh Patel',
    phone: '9876543211',
    gstNumber: '27AABCU9603R1ZN',
    panNumber: 'AABCU9603S',
    shopAddress: '456, Andheri West, MIDC',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    brands: ['schneider', 'legrand-switches', 'philips'],
    categories: ['switchgear', 'lighting'],
    serviceAreas: ['400053', '400054', '400055', '400056'],
  },
  {
    email: 'dealer3@test.com',
    password: 'password123',
    businessName: 'Delhi Power Solutions',
    ownerName: 'Amit Singh',
    phone: '9876543212',
    gstNumber: '07AABCU9603R1ZO',
    panNumber: 'AABCU9603T',
    shopAddress: '789, Nehru Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110019',
    brands: ['luminous', 'exide', 'crompton-fans'],
    categories: ['power-backup', 'fans-ventilation'],
    serviceAreas: ['110019', '110020', '110024', '110025'],
  },
];
