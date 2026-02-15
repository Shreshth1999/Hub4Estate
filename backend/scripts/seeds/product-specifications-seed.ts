// ============================================
// DETAILED PRODUCT SPECIFICATIONS DATA
// ============================================
// This file contains real product data with complete specifications
// for seeding into the Hub4Estate database

import prisma from '../src/config/database';

// Product specifications for Wires & Cables
const wireProducts = [
  // Polycab Wires
  {
    brandSlug: 'polycab',
    productTypeName: 'House Wiring Cables',
    products: [
      {
        name: 'Polycab Optima Plus FR 1.0 Sq mm Single Core Wire',
        modelNumber: 'OPTIMA-1.0',
        sku: 'PLB-OPT-1.0-90M',
        description: 'Premium flame retardant single core PVC insulated copper wire for residential wiring.',
        specifications: JSON.stringify({
          'Conductor Size': '1.0 sq mm',
          'Conductor Material': '99.97% Pure Copper (EC Grade)',
          'Insulation': 'HR-PVC (Flame Retardant)',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '11A (at 40°C ambient)',
          'Insulation Resistance': '> 100 MΩ-km',
          'Conductor Resistance': '18.1 Ω/km max',
          'Temperature Rating': '70°C (conductor)',
          'Coil Length': '90 meters',
          'Color Options': 'Red, Yellow, Blue, Black, Green',
          'Fire Performance': 'Oxygen Index > 29%',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010', 'ROHS Compliant'],
        warrantyYears: 10,
        images: ['https://www.polycab.com/images/optima-wire.jpg'],
      },
      {
        name: 'Polycab Optima Plus FR 1.5 Sq mm Single Core Wire',
        modelNumber: 'OPTIMA-1.5',
        sku: 'PLB-OPT-1.5-90M',
        description: 'Standard lighting circuit wire with flame retardant insulation.',
        specifications: JSON.stringify({
          'Conductor Size': '1.5 sq mm',
          'Conductor Material': '99.97% Pure Copper (EC Grade)',
          'Insulation': 'HR-PVC (Flame Retardant)',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '15A (at 40°C ambient)',
          'Insulation Resistance': '> 100 MΩ-km',
          'Conductor Resistance': '12.1 Ω/km max',
          'Temperature Rating': '70°C (conductor)',
          'Coil Length': '90 meters',
          'Recommended Use': 'Light points, fans, low-power circuits',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Polycab Optima Plus FR 2.5 Sq mm Single Core Wire',
        modelNumber: 'OPTIMA-2.5',
        sku: 'PLB-OPT-2.5-90M',
        description: 'Standard power circuit wire for 16A socket points.',
        specifications: JSON.stringify({
          'Conductor Size': '2.5 sq mm',
          'Conductor Material': '99.97% Pure Copper (EC Grade)',
          'Insulation': 'HR-PVC (Flame Retardant)',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '21A (at 40°C ambient)',
          'Insulation Resistance': '> 100 MΩ-km',
          'Conductor Resistance': '7.41 Ω/km max',
          'Temperature Rating': '70°C (conductor)',
          'Coil Length': '90 meters',
          'Recommended Use': '16A socket circuits, power points',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Polycab Optima Plus FR 4.0 Sq mm Single Core Wire',
        modelNumber: 'OPTIMA-4.0',
        sku: 'PLB-OPT-4.0-90M',
        description: 'Heavy duty wire for AC, geyser, and high-load appliances.',
        specifications: JSON.stringify({
          'Conductor Size': '4.0 sq mm',
          'Conductor Material': '99.97% Pure Copper (EC Grade)',
          'Insulation': 'HR-PVC (Flame Retardant)',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '28A (at 40°C ambient)',
          'Insulation Resistance': '> 100 MΩ-km',
          'Conductor Resistance': '4.61 Ω/km max',
          'Temperature Rating': '70°C (conductor)',
          'Coil Length': '90 meters',
          'Recommended Use': 'AC units (1.5-2 Ton), Geysers, Heavy appliances',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Polycab Optima Plus FR 6.0 Sq mm Single Core Wire',
        modelNumber: 'OPTIMA-6.0',
        sku: 'PLB-OPT-6.0-90M',
        description: 'Main circuit wire for sub-distribution boards.',
        specifications: JSON.stringify({
          'Conductor Size': '6.0 sq mm',
          'Conductor Material': '99.97% Pure Copper (EC Grade)',
          'Insulation': 'HR-PVC (Flame Retardant)',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '37A (at 40°C ambient)',
          'Insulation Resistance': '> 100 MΩ-km',
          'Conductor Resistance': '3.08 Ω/km max',
          'Temperature Rating': '70°C (conductor)',
          'Coil Length': '90 meters',
          'Recommended Use': 'Sub-DB feeders, main circuits, heavy loads',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 10,
        images: [],
      },
    ],
  },
  // Havells Wires
  {
    brandSlug: 'havells',
    productTypeName: 'House Wiring Cables',
    products: [
      {
        name: 'Havells Life Line Plus S3 HRFR 1.0 Sq mm Wire',
        modelNumber: 'HRFR-1.0',
        sku: 'HVL-LLP-1.0-90M',
        description: 'Next generation flame retardant wire with enhanced safety features.',
        specifications: JSON.stringify({
          'Conductor Size': '1.0 sq mm',
          'Conductor Material': 'High conductivity annealed copper',
          'Insulation': 'Special HRFR compound',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '11A',
          'Features': 'Triple layer protection, Anti-rodent, Anti-termite',
          'Fire Retardancy': 'Self-extinguishing in < 30 seconds',
          'Lead Content': 'Lead free',
          'Temperature Rating': '85°C',
          'Coil Length': '90 meters',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010', 'ROHS', 'Lead Free'],
        warrantyYears: 15,
        images: [],
      },
      {
        name: 'Havells Life Line Plus S3 HRFR 1.5 Sq mm Wire',
        modelNumber: 'HRFR-1.5',
        sku: 'HVL-LLP-1.5-90M',
        description: 'Premium lighting circuit wire with enhanced fire safety.',
        specifications: JSON.stringify({
          'Conductor Size': '1.5 sq mm',
          'Conductor Material': 'High conductivity annealed copper',
          'Insulation': 'Special HRFR compound',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '15A',
          'Features': 'Triple layer protection',
          'Temperature Rating': '85°C',
          'Coil Length': '90 meters',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 15,
        images: [],
      },
      {
        name: 'Havells Life Line Plus S3 HRFR 2.5 Sq mm Wire',
        modelNumber: 'HRFR-2.5',
        sku: 'HVL-LLP-2.5-90M',
        description: 'Standard power socket wire with superior insulation.',
        specifications: JSON.stringify({
          'Conductor Size': '2.5 sq mm',
          'Conductor Material': 'High conductivity annealed copper',
          'Insulation': 'Special HRFR compound',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '21A',
          'Temperature Rating': '85°C',
          'Coil Length': '90 meters',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 15,
        images: [],
      },
      {
        name: 'Havells Life Line Plus S3 HRFR 4.0 Sq mm Wire',
        modelNumber: 'HRFR-4.0',
        sku: 'HVL-LLP-4.0-90M',
        description: 'Heavy duty AC and appliance wire.',
        specifications: JSON.stringify({
          'Conductor Size': '4.0 sq mm',
          'Conductor Material': 'High conductivity annealed copper',
          'Insulation': 'Special HRFR compound',
          'Voltage Grade': '1100V',
          'Current Carrying Capacity': '28A',
          'Temperature Rating': '85°C',
          'Coil Length': '90 meters',
          'Recommended Use': 'Split AC, Geyser, Kitchen appliances',
          'Standard': 'IS 694:2010',
        }),
        certifications: ['ISI', 'BIS IS 694:2010'],
        warrantyYears: 15,
        images: [],
      },
    ],
  },
];

// MCB Products
const mcbProducts = [
  {
    brandSlug: 'havells',
    productTypeName: 'MCB (Miniature Circuit Breakers)',
    products: [
      {
        name: 'Havells?"?"?" MCB 6A Single Pole C-Curve',
        modelNumber: '?"?"?"-6A-1P-C',
        sku: 'HVL-MCB-6A-SP-C',
        description: 'Single pole MCB for light circuits with C-curve tripping characteristic.',
        specifications: JSON.stringify({
          'Rated Current': '6A',
          'No. of Poles': 'Single Pole (1P)',
          'Breaking Capacity': '10kA',
          'Tripping Curve': 'C (5-10 In)',
          'Rated Voltage': '240V AC',
          'Frequency': '50Hz',
          'Mechanical Life': '20,000 operations',
          'Electrical Life': '10,000 operations',
          'Contact Position Indicator': 'Yes',
          'DIN Rail Mount': '35mm',
          'Module Width': '17.5mm (1 module)',
          'Standard': 'IS/IEC 60898-1',
        }),
        certifications: ['ISI', 'IEC 60898-1', 'CE'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Havells MCB 10A Single Pole C-Curve',
        modelNumber: 'MCB-10A-1P-C',
        sku: 'HVL-MCB-10A-SP-C',
        description: 'Single pole MCB for lighting and fan circuits.',
        specifications: JSON.stringify({
          'Rated Current': '10A',
          'No. of Poles': 'Single Pole (1P)',
          'Breaking Capacity': '10kA',
          'Tripping Curve': 'C (5-10 In)',
          'Rated Voltage': '240V AC',
          'Standard': 'IS/IEC 60898-1',
        }),
        certifications: ['ISI', 'IEC 60898-1'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Havells MCB 16A Single Pole C-Curve',
        modelNumber: 'MCB-16A-1P-C',
        sku: 'HVL-MCB-16A-SP-C',
        description: 'Single pole MCB for 16A power socket circuits.',
        specifications: JSON.stringify({
          'Rated Current': '16A',
          'No. of Poles': 'Single Pole (1P)',
          'Breaking Capacity': '10kA',
          'Tripping Curve': 'C (5-10 In)',
          'Rated Voltage': '240V AC',
          'Recommended Use': '16A socket circuits, small appliances',
          'Standard': 'IS/IEC 60898-1',
        }),
        certifications: ['ISI', 'IEC 60898-1'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Havells MCB 20A Single Pole C-Curve',
        modelNumber: 'MCB-20A-1P-C',
        sku: 'HVL-MCB-20A-SP-C',
        description: 'Single pole MCB for geyser and heavy appliance circuits.',
        specifications: JSON.stringify({
          'Rated Current': '20A',
          'No. of Poles': 'Single Pole (1P)',
          'Breaking Capacity': '10kA',
          'Tripping Curve': 'C (5-10 In)',
          'Rated Voltage': '240V AC',
          'Recommended Use': 'Geyser, Washing machine, Kitchen appliances',
          'Standard': 'IS/IEC 60898-1',
        }),
        certifications: ['ISI', 'IEC 60898-1'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Havells MCB 32A Double Pole C-Curve',
        modelNumber: 'MCB-32A-2P-C',
        sku: 'HVL-MCB-32A-DP-C',
        description: 'Double pole MCB for AC units up to 2 Ton.',
        specifications: JSON.stringify({
          'Rated Current': '32A',
          'No. of Poles': 'Double Pole (2P)',
          'Breaking Capacity': '10kA',
          'Tripping Curve': 'C (5-10 In)',
          'Rated Voltage': '415V AC',
          'Module Width': '35mm (2 modules)',
          'Recommended Use': 'Split AC 1.5-2 Ton',
          'Standard': 'IS/IEC 60898-1',
        }),
        certifications: ['ISI', 'IEC 60898-1'],
        warrantyYears: 5,
        images: [],
      },
    ],
  },
  {
    brandSlug: 'schneider',
    productTypeName: 'MCB (Miniature Circuit Breakers)',
    products: [
      {
        name: 'Schneider Electric Acti9 iC60N 6A SP C-Curve MCB',
        modelNumber: 'A9F44106',
        sku: 'SCH-IC60N-6A-SP',
        description: 'Premium MCB with visual trip indicator and auxiliary contact compatibility.',
        specifications: JSON.stringify({
          'Rated Current': '6A',
          'No. of Poles': 'Single Pole (1P)',
          'Breaking Capacity': '6kA (as per IEC), 10kA (as per IS)',
          'Tripping Curve': 'C',
          'Rated Voltage': '230/400V AC',
          'Trip Indicator': 'Visual (Red/Green)',
          'Auxiliary Contact': 'Compatible with OF, SD, MX+OF',
          'Module Width': '18mm (1 module)',
          'Mechanical Life': '20,000 cycles',
          'Electrical Life': '10,000 cycles at In',
          'Standard': 'IEC 60898-1, IS 8828',
        }),
        certifications: ['IEC 60898-1', 'IS 8828', 'CE', 'KEMA'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Schneider Electric Acti9 iC60N 16A SP C-Curve MCB',
        modelNumber: 'A9F44116',
        sku: 'SCH-IC60N-16A-SP',
        description: 'Premium MCB for power socket circuits.',
        specifications: JSON.stringify({
          'Rated Current': '16A',
          'No. of Poles': 'Single Pole (1P)',
          'Breaking Capacity': '6kA/10kA',
          'Tripping Curve': 'C',
          'Rated Voltage': '230/400V AC',
          'Standard': 'IEC 60898-1, IS 8828',
        }),
        certifications: ['IEC 60898-1', 'IS 8828', 'CE'],
        warrantyYears: 5,
        images: [],
      },
    ],
  },
];

// RCCB Products
const rccbProducts = [
  {
    brandSlug: 'havells',
    productTypeName: 'RCCB (Residual Current Circuit Breaker)',
    products: [
      {
        name: 'Havells RCCB 25A 30mA Double Pole',
        modelNumber: 'DHRMAMFF030025',
        sku: 'HVL-RCCB-25A-30MA-DP',
        description: '30mA earth leakage protection for personal safety.',
        specifications: JSON.stringify({
          'Rated Current': '25A',
          'Sensitivity': '30mA (Type AC)',
          'No. of Poles': 'Double Pole (2P)',
          'Rated Voltage': '240V AC',
          'Breaking Capacity': '10kA',
          'Operating Time': '< 40ms at IΔn',
          'Mechanical Life': '20,000 operations',
          'Module Width': '36mm (2 modules)',
          'Test Button': 'Yes',
          'Trip Indicator': 'Yes',
          'Standard': 'IS 12640-1, IEC 61008-1',
        }),
        certifications: ['ISI', 'IEC 61008-1'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Havells RCCB 40A 30mA Double Pole',
        modelNumber: 'DHRMAMFF030040',
        sku: 'HVL-RCCB-40A-30MA-DP',
        description: '40A RCCB for larger circuits with 30mA sensitivity.',
        specifications: JSON.stringify({
          'Rated Current': '40A',
          'Sensitivity': '30mA (Type AC)',
          'No. of Poles': 'Double Pole (2P)',
          'Rated Voltage': '240V AC',
          'Standard': 'IS 12640-1, IEC 61008-1',
        }),
        certifications: ['ISI', 'IEC 61008-1'],
        warrantyYears: 5,
        images: [],
      },
      {
        name: 'Havells RCCB 63A 30mA Four Pole',
        modelNumber: 'DHRMAMFF030063-4P',
        sku: 'HVL-RCCB-63A-30MA-4P',
        description: '4-pole RCCB for 3-phase installations.',
        specifications: JSON.stringify({
          'Rated Current': '63A',
          'Sensitivity': '30mA (Type AC)',
          'No. of Poles': 'Four Pole (4P)',
          'Rated Voltage': '415V AC (3-phase)',
          'Standard': 'IS 12640-1, IEC 61008-1',
        }),
        certifications: ['ISI', 'IEC 61008-1'],
        warrantyYears: 5,
        images: [],
      },
    ],
  },
];

// Ceiling Fan Products
const fanProducts = [
  {
    brandSlug: 'havells',
    productTypeName: 'Ceiling Fans',
    products: [
      {
        name: 'Havells Festiva 1200mm Ceiling Fan',
        modelNumber: 'FHCFESTBIP48',
        sku: 'HVL-FAN-FESTIVA-1200',
        description: 'Premium decorative ceiling fan with powerful air delivery.',
        specifications: JSON.stringify({
          'Sweep Size': '1200mm (48 inches)',
          'Speed': '370 RPM',
          'Air Delivery': '230 CMM',
          'Power Consumption': '75W',
          'Voltage': '230V AC, 50Hz',
          'Motor Type': 'Copper winding, double ball bearing',
          'Blade Material': 'Aluminum',
          'Number of Blades': '3',
          'Mounting': 'Down rod mount (standard rod included)',
          'Noise Level': '< 55 dB',
          'Color Options': 'Pearl White, Brown, Bianco',
          'IP Rating': 'IP20 (Indoor use)',
        }),
        certifications: ['ISI', 'BIS IS 374:2019', 'BEE 5-Star'],
        warrantyYears: 2,
        images: [],
      },
      {
        name: 'Havells ES-50 Premium 1200mm BLDC Fan',
        modelNumber: 'FHCES50BIP48',
        sku: 'HVL-FAN-ES50-1200',
        description: 'Energy-efficient BLDC motor fan with remote control.',
        specifications: JSON.stringify({
          'Sweep Size': '1200mm (48 inches)',
          'Speed': '330 RPM',
          'Air Delivery': '230 CMM',
          'Power Consumption': '32W (at max speed)',
          'Annual Savings': 'Up to ₹1,500 vs regular fan',
          'Motor Type': 'BLDC (Brushless DC)',
          'Control': 'Remote with timer & sleep mode',
          'Speed Settings': '5 speeds',
          'Reverse Function': 'Yes',
          'LED Indicator': 'Yes',
          'Blade Material': 'Aerodynamic ABS',
          'Number of Blades': '3',
          'Color Options': 'Elegant White, Smoke Brown',
        }),
        certifications: ['ISI', 'BIS IS 374:2019', 'BEE 5-Star'],
        warrantyYears: 3,
        images: [],
      },
    ],
  },
  {
    brandSlug: 'crompton',
    productTypeName: 'Ceiling Fans',
    products: [
      {
        name: 'Crompton Super Briz Deco 1200mm Ceiling Fan',
        modelNumber: 'CFSBD-1200',
        sku: 'CRM-FAN-BRIZ-1200',
        description: 'High-speed decorative fan with superior air delivery.',
        specifications: JSON.stringify({
          'Sweep Size': '1200mm (48 inches)',
          'Speed': '400 RPM',
          'Air Delivery': '245 CMM',
          'Power Consumption': '72W',
          'Motor Type': 'Aluminium die-cast, copper wound',
          'Blade Material': 'High-grade pressed steel',
          'Number of Blades': '3',
          'Color Options': 'Birken, Smoked Brown, Ivory',
        }),
        certifications: ['ISI', 'BIS IS 374:2019'],
        warrantyYears: 2,
        images: [],
      },
      {
        name: 'Crompton Energion HS 1200mm BLDC Fan',
        modelNumber: 'CFENHS-1200',
        sku: 'CRM-FAN-ENERGION-1200',
        description: 'Premium BLDC fan with highest air delivery in its class.',
        specifications: JSON.stringify({
          'Sweep Size': '1200mm (48 inches)',
          'Speed': '350 RPM',
          'Air Delivery': '260 CMM',
          'Power Consumption': '35W',
          'Motor Type': 'BLDC motor',
          'Control': 'Remote with LED display',
          'Speed Settings': '6 speeds',
          'Timer': '1-8 hours',
          'Sleep Mode': 'Yes',
          'Boost Mode': 'Yes',
        }),
        certifications: ['ISI', 'BIS IS 374:2019', 'BEE 5-Star'],
        warrantyYears: 3,
        images: [],
      },
    ],
  },
];

// Modular Switch Products
const switchProducts = [
  {
    brandSlug: 'legrand',
    productTypeName: 'Modular Switches',
    products: [
      {
        name: 'Legrand Mylinc 6A One Way Switch',
        modelNumber: '6170 01',
        sku: 'LGD-MYLINC-6A-1W',
        description: 'Sleek 1-module switch for light and fan control.',
        specifications: JSON.stringify({
          'Current Rating': '6A',
          'Switch Type': 'One Way',
          'Module Size': '1 Module',
          'Voltage': '240V AC',
          'Contact Material': 'Silver alloy',
          'Mechanism': 'Rocker type',
          'Terminal Type': 'Quick connect',
          'Wire Accommodation': 'Up to 4 sq mm',
          'Color': 'White',
          'Mechanical Life': '100,000 operations',
          'Electrical Life': '40,000 operations at rated load',
          'Standard': 'IS 3854',
        }),
        certifications: ['ISI', 'IS 3854'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Legrand Mylinc 16A One Way Switch',
        modelNumber: '6170 14',
        sku: 'LGD-MYLINC-16A-1W',
        description: '16A switch for geyser and heavy appliance control.',
        specifications: JSON.stringify({
          'Current Rating': '16A',
          'Switch Type': 'One Way',
          'Module Size': '1 Module',
          'Voltage': '240V AC',
          'Standard': 'IS 3854',
        }),
        certifications: ['ISI', 'IS 3854'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Legrand Mylinc 6A Two Way Switch',
        modelNumber: '6170 02',
        sku: 'LGD-MYLINC-6A-2W',
        description: 'Two-way switch for staircase and corridor lighting.',
        specifications: JSON.stringify({
          'Current Rating': '6A',
          'Switch Type': 'Two Way',
          'Module Size': '1 Module',
          'Voltage': '240V AC',
          'Use Case': 'Staircase, corridor, bedroom (2-point control)',
          'Standard': 'IS 3854',
        }),
        certifications: ['ISI', 'IS 3854'],
        warrantyYears: 10,
        images: [],
      },
    ],
  },
  {
    brandSlug: 'anchor',
    productTypeName: 'Modular Switches',
    products: [
      {
        name: 'Anchor Roma 6A One Way Switch',
        modelNumber: '21011',
        sku: 'ANC-ROMA-6A-1W',
        description: 'Classic modular switch with proven reliability.',
        specifications: JSON.stringify({
          'Current Rating': '6A',
          'Switch Type': 'One Way',
          'Module Size': '1 Module',
          'Series': 'Roma Classic',
          'Color': 'White',
          'Standard': 'IS 3854',
        }),
        certifications: ['ISI', 'IS 3854'],
        warrantyYears: 7,
        images: [],
      },
      {
        name: 'Anchor Penta Modular 10A One Way Switch',
        modelNumber: '65101',
        sku: 'ANC-PENTA-10A-1W',
        description: 'Modern design switch with enhanced current rating.',
        specifications: JSON.stringify({
          'Current Rating': '10A',
          'Switch Type': 'One Way',
          'Module Size': '1 Module',
          'Series': 'Penta',
          'Finish': 'Matte White',
          'Standard': 'IS 3854',
        }),
        certifications: ['ISI', 'IS 3854'],
        warrantyYears: 10,
        images: [],
      },
    ],
  },
];

// Socket Products
const socketProducts = [
  {
    brandSlug: 'legrand',
    productTypeName: 'Socket Outlets',
    products: [
      {
        name: 'Legrand Mylinc 6A 3 Pin Socket',
        modelNumber: '6177 01',
        sku: 'LGD-MYLINC-6A-3P-SKT',
        description: 'Standard 6A socket for low-power appliances.',
        specifications: JSON.stringify({
          'Current Rating': '6A',
          'Pin Configuration': '3 Pin (Round)',
          'Module Size': '2 Modules',
          'Voltage': '240V AC',
          'Shutter': 'Yes (Child safe)',
          'Standard': 'IS 1293',
        }),
        certifications: ['ISI', 'IS 1293'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Legrand Mylinc 16A 3 Pin Socket',
        modelNumber: '6177 14',
        sku: 'LGD-MYLINC-16A-3P-SKT',
        description: '16A socket for geyser, AC, and heavy appliances.',
        specifications: JSON.stringify({
          'Current Rating': '16A',
          'Pin Configuration': '3 Pin (Round)',
          'Module Size': '2 Modules',
          'Voltage': '240V AC',
          'Shutter': 'Yes',
          'Recommended Use': 'Geyser, AC, washing machine, refrigerator',
          'Standard': 'IS 1293',
        }),
        certifications: ['ISI', 'IS 1293'],
        warrantyYears: 10,
        images: [],
      },
      {
        name: 'Legrand Mylinc USB Charger 2.1A',
        modelNumber: '6170 73',
        sku: 'LGD-MYLINC-USB-2.1A',
        description: 'Built-in USB charging port for smartphones and tablets.',
        specifications: JSON.stringify({
          'Output': '5V DC, 2.1A',
          'USB Ports': '1',
          'Module Size': '1 Module',
          'Input': '100-240V AC',
          'Compatible Devices': 'Smartphones, tablets, smartwatches',
        }),
        certifications: ['CE', 'BIS'],
        warrantyYears: 5,
        images: [],
      },
    ],
  },
];

// LED Lighting Products
const ledProducts = [
  {
    brandSlug: 'philips',
    productTypeName: 'LED Bulbs',
    products: [
      {
        name: 'Philips Stellar Bright 9W LED Bulb',
        modelNumber: 'SB-9W-CDL',
        sku: 'PHI-LED-9W-B22-CDL',
        description: 'High brightness LED bulb with wide beam angle.',
        specifications: JSON.stringify({
          'Wattage': '9W',
          'Equivalent': '60W incandescent',
          'Lumens': '806 lm',
          'Color Temperature': '6500K (Cool Day Light)',
          'CRI': '> 80',
          'Beam Angle': '220°',
          'Base Type': 'B22',
          'Voltage': '220-240V AC',
          'Lifespan': '15,000 hours',
          'Dimmable': 'No',
          'Energy Rating': 'A+',
        }),
        certifications: ['ISI', 'BIS IS 16102', 'BEE Star Rated'],
        warrantyYears: 2,
        images: [],
      },
      {
        name: 'Philips Stellar Bright 12W LED Bulb',
        modelNumber: 'SB-12W-CDL',
        sku: 'PHI-LED-12W-B22-CDL',
        description: 'High lumen LED bulb for larger rooms.',
        specifications: JSON.stringify({
          'Wattage': '12W',
          'Equivalent': '80W incandescent',
          'Lumens': '1055 lm',
          'Color Temperature': '6500K (Cool Day Light)',
          'Base Type': 'B22',
          'Lifespan': '15,000 hours',
        }),
        certifications: ['ISI', 'BIS IS 16102'],
        warrantyYears: 2,
        images: [],
      },
      {
        name: 'Philips Deco Ring 15W LED Downlight',
        modelNumber: 'DR-15W-CDL',
        sku: 'PHI-DL-15W-CDL',
        description: 'Slim panel downlight for false ceiling.',
        specifications: JSON.stringify({
          'Wattage': '15W',
          'Lumens': '1400 lm',
          'Color Temperature': '6500K',
          'Cut-Out Size': '150mm',
          'Outer Diameter': '170mm',
          'Height': '35mm',
          'Driver': 'In-built',
          'Lifespan': '25,000 hours',
        }),
        certifications: ['ISI', 'BIS IS 16102'],
        warrantyYears: 2,
        images: [],
      },
    ],
  },
  {
    brandSlug: 'havells',
    productTypeName: 'LED Bulbs',
    products: [
      {
        name: 'Havells Adore 9W LED Bulb',
        modelNumber: 'LHLADEKL9W6500K',
        sku: 'HVL-LED-9W-B22-CDL',
        description: 'Energy-efficient LED bulb with cool white light.',
        specifications: JSON.stringify({
          'Wattage': '9W',
          'Lumens': '810 lm',
          'Efficacy': '90 lm/W',
          'Color Temperature': '6500K',
          'Base Type': 'B22',
          'Voltage': '220-240V AC',
          'Lifespan': '25,000 hours',
        }),
        certifications: ['ISI', 'BIS IS 16102'],
        warrantyYears: 2,
        images: [],
      },
    ],
  },
];

// Main seeding function
async function seedProductSpecifications() {
  console.log('Starting product specifications seed...');

  const allProductGroups = [
    ...wireProducts,
    ...mcbProducts,
    ...rccbProducts,
    ...fanProducts,
    ...switchProducts,
    ...socketProducts,
    ...ledProducts,
  ];

  for (const group of allProductGroups) {
    // Find the brand
    const brand = await prisma.brand.findUnique({
      where: { slug: group.brandSlug },
    });

    if (!brand) {
      console.log(`Brand not found: ${group.brandSlug}`);
      continue;
    }

    // Find or create product type (simplified - would need proper category mapping)
    // For now, just log what would be created
    console.log(`Would create ${group.products.length} products for ${brand.name} - ${group.productTypeName}`);

    for (const product of group.products) {
      // Check if product exists by SKU
      const existingProduct = await prisma.product.findUnique({
        where: { sku: product.sku },
      });

      if (existingProduct) {
        // Update existing product with specifications
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            specifications: product.specifications,
            certifications: product.certifications,
            warrantyYears: product.warrantyYears,
            images: product.images,
            datasheetUrl: product.datasheetUrl,
            manualUrl: product.manualUrl,
          },
        });
        console.log(`  Updated: ${product.name}`);
      } else {
        console.log(`  Would create: ${product.name} (${product.sku})`);
      }
    }
  }

  console.log('Product specifications seed complete!');
}

export { seedProductSpecifications, wireProducts, mcbProducts, rccbProducts, fanProducts, switchProducts, socketProducts, ledProducts };
