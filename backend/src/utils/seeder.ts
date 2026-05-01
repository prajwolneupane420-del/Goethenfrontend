import Product from '../models/Product';

const animeThemes = [
  'One Piece', 'Naruto', 'Jujutsu Kaisen', 'Demon Slayer', 'Attack on Titan', 
  'Dragon Ball Z', 'Death Note', 'Bleach', 'My Hero Academia', 'Hunter x Hunter'
];

const superheroThemes = [
  'Batman', 'Spider-Man', 'Iron Man', 'The Flash', 'Wonder Woman', 
  'Black Panther', 'Doctor Strange', 'Wolverine', 'Deadpool', 'Thor'
];

export async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 48) return;

  console.log('Seeding products...');
  
  const products = [];
  const animeSeries = [
    'Jujutsu Kaisen', 'Naruto Shippuden', 'One Piece', 'Demon Slayer', 
    'Attack on Titan', 'Chainsaw Man', 'Solo Leveling', 'Spy x Family',
    'Bleach: TYBW', 'Death Note', 'Dragon Ball Super', 'Hunter x Hunter',
    'My Hero Academia', 'Tokyo Ghoul', 'Fullmetal Alchemist', 'Steins Gate',
    'Blue Lock', 'Haikyuu', 'Mob Psycho 100', 'One Punch Man'
  ];

  const tshirtDesigns = [
    'Oversized Graphic Tee', 'Minimal Logo Print', 'Manga Panel Edition', 
    'Heavy-weight Vintage Wash', 'Urban Streetwear Fit', 'Aesthetic Box Print'
  ];

  // 24 Anime Products
  for (let i = 1; i <= 24; i++) {
    const series = animeSeries[i % animeSeries.length];
    const design = tshirtDesigns[i % tshirtDesigns.length];
    
    products.push({
      title: `${series} ${design} - Vol. ${i}`,
      description: `Premium quality 240 GSM heavy cotton oversized tshirt. Features high-definition screen printing of ${series} artwork. Pre-shrunk and bio-washed for ultimate comfort.`,
      category: 'Anime',
      basePrice: 899 + (i * 5),
      images: [
        `https://picsum.photos/seed/ethenanime${i}/800/1000`,
        `https://picsum.photos/seed/ethenanimealt${i}/800/1000`
      ],
      variants: [
        { size: 'S', stock: 20 },
        { size: 'M', stock: 25 },
        { size: 'L', stock: 30 },
        { size: 'XL', stock: 15 },
      ],
      isFeatured: i % 5 === 0,
    });
  }

  const superheroSeries = [
    'Batman', 'Spider-Man', 'Iron Man', 'The Flash', 'Wonder Woman', 
    'Black Panther', 'Doctor Strange', 'Wolverine', 'Deadpool', 'Thor'
  ];

  // 12 Superhero Products
  for (let i = 1; i <= 12; i++) {
    const hero = superheroSeries[i % superheroSeries.length];
    const design = tshirtDesigns[i % tshirtDesigns.length];
    
    products.push({
      title: `${hero} Noir Edition ${design}`,
      description: `Limited edition ${hero} streetwear tee. Soft-touch premium fabric with minimalist iconic branding.`,
      category: 'Superhero',
      basePrice: 999 + (i * 10),
      images: [
        `https://picsum.photos/seed/ethenhero${i}/800/1000`,
      ],
      variants: [
        { size: 'S', stock: 10 },
        { size: 'M', stock: 15 },
        { size: 'L', stock: 20 },
        { size: 'XL', stock: 10 },
      ],
      isFeatured: true,
    });
  }

  // 12 Limited Products
  for (let i = 1; i <= 12; i++) {
    products.push({
      title: `Ethen Street Signature Drop #${i}`,
      description: `Ultra-exclusive drop from our vault. 300 GSM pure cotton, custom boxy fit. Unique serial number tag included.`,
      category: 'Limited',
      basePrice: 1499 + (i * 20),
      images: [
        `https://picsum.photos/seed/ethenlimited${i}/800/1000`,
      ],
      variants: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 5 },
        { size: 'L', stock: 8 },
        { size: 'XL', stock: 5 },
      ],
      isFeatured: i < 5,
    });
  }

  await Product.deleteMany({}); // Force re-seed for the 48 items
  await Product.insertMany(products);
  console.log('48 Products (Anime, Superhero, Limited) Seeded successfully.');
}
