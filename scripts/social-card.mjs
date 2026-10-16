import sharp from 'sharp';
await sharp('design/social-card.svg').png().toFile('public/social-card.png');
console.log('Generated public/social-card.png (1200 × 630).');
