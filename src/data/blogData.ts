import { BlogPost } from '../types';

export const seedBlogs: BlogPost[] = [
  {
    id: 'ev-charging-guide-india',
    title: 'The Ultimate Guide to EV Charging in India: Speeds, Plugs, & Networks',
    content: `Switching to an electric vehicle is one of the most rewarding decisions you can make. However, understanding how, where, and how fast you can charge your EV remains one of the primary concerns for new buyers. In this comprehensive guide, we break down the entire EV charging ecosystem in India.

First, let us talk about charger types. In India, AC chargers are standard for home and office environments, usually ranging from 3.3 kW (which takes 8-15 hours) up to 7.2 kW or 11 kW (taking 5-8 hours). DC Fast Chargers, on the other hand, bypass the car's onboard charger and feed power directly to the battery pack. These generally start at 25 kW and go up to 50 kW or even 150 kW+, allowing you to top up from 10% to 80% in under an hour.

The standard charging connector for four-wheelers in India has consolidated around the CCS2 (Combined Charging System Type 2) plug. Almost all public DC fast chargers use this standard. For two-wheelers, various proprietary plugs and the emerging light EV charging standard (Ather-led or standard 5A/15A sockets) are common.

Navigating public charging is easier than ever with aggregated applications. Major networks such as Tata Power EZ Charge, Zeon Charging, Jio-bp pulse, and Fortum Charge & Drive have mapped charging spots across national highways, ensuring you can plan long-distance road trips with complete confidence. Keep in mind that keeping your battery state-of-charge between 20% and 80% is the optimal way to preserve battery health on long road trips.`,
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800',
      'https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=800',
      'https://images.unsplash.com/photo-1529369623266-f5264b696110?q=80&w=800'
    ],
    author: 'CARZev Editorial',
    createdAt: '2026-06-05T10:00:00.000Z',
    readTime: '4 min read'
  },
  {
    id: 'upcoming-evs-india-2026',
    title: 'Top 5 Groundbreaking Electric SUVs Launching in India in 2026',
    content: `The Indian EV landscape is expanding at an unprecedented pace. While 2024 and 2025 established a strong entry-level foundation, 2026 is shaping up to be the year of premium, dedicated-platform electric SUVs. Here are the top 5 highly anticipated launches that are set to redefine their segments.

Leading the charge is the Tata Harrier EV. Built on the newly engineered Acti.ev dedicated architecture, the Harrier EV brings rugged styling, all-wheel-drive capability via dual-motors, and an estimated range of over 600 km. It represents Tata's next leap into premium mid-size segments.

Next is Mahindra's ambitious born-electric lineup: the BE 6e and XEV 9e. Both are built on the INGLO architecture and feature futuristic cockpits with multiple digital screens, high-voltage battery options, and ultra-fast 175 kW DC charging support. The BE 6e targets sportier coupe aesthetics, while the XEV 9e acts as a flagship luxury SUV.

Hyundai's upcoming Creta Electric is also generating huge excitement. Translating India's most popular SUV nameplate into the zero-emission era, the Creta EV will feature custom aerodynamic styling, a robust 45 kWh battery, V2L capabilities, and premium interior systems.

Finally, Vietnam's VinFast is introducing the VF 7, a stunning crossover designed by the world-famous Pininfarina studio. With 348 bhp of peak output and an immersive glass cockpit, it is aimed squarely at luxury buyers seeking top-tier performance.`,
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800'
    ],
    author: 'Siddharth Sharma, EV Specialist',
    createdAt: '2026-06-03T14:30:00.000Z',
    readTime: '3 min read'
  },
  {
    id: 'ev-battery-life-demystified',
    title: 'EV Battery Lifespans: How Long Do They Last and Tips to Maximize Health',
    content: `One of the most persistent myths surrounding electric cars is that the battery pack will degrade rapidly and require extremely expensive replacement within a few years. In reality, modern EV battery packs are engineered with advanced chemistries and active thermal management, ensuring they outlast the general lifecycle of the car itself.

Most EV manufacturers in India offer warranties spanning 8 years or 1,60,000 km, guaranteeing at least 70% to 80% battery capacity retention. In real-world data, electric vehicle batteries lose only about 1.5% to 2% of their total range capacity per year, meaning that even after a decade of driving, the car will still retain 80%+ of its initial range.

This longevity is made possible by active liquid cooling systems, which keep the battery operating in its optimal temperature zone (15°C to 35°C), protecting the cells from extreme Indian summer heat. Additionally, battery management systems reserve a portion of the capacity (a buffer) that is invisible to the driver, cushioning the cells from overcharging stress.

To make your battery last even longer, follow these simple guidelines. First, try to avoid fast charging to 100% too frequently; DC charging is fastest up to 80%, after which the charging speed tapers significantly to protect cell integrity. Second, keep the vehicle between 20% and 80% state of charge for daily city driving. Finally, avoid parking in direct hot sunlight for long periods when fully charged.`,
    images: [
      'https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=800',
      'https://images.unsplash.com/photo-1505705694340-019e1e335916?q=80&w=800',
      'https://images.unsplash.com/photo-1522083165195-342750297f91?q=80&w=800'
    ],
    author: 'Neha Kapoor, Battery Systems Engineer',
    createdAt: '2026-05-28T09:15:00.000Z',
    readTime: '4 min read'
  }
];
