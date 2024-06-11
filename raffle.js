/**
  *  Totemancer.com
  *  Copyright by Totemancer.com
**/

const crypto = require('crypto');

function seededRandom(seed) {
  let m = 0x80000000;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
    return (seed / m);
  };
}

function shuffleArray(array, seed) {
  let random = seededRandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function calculateRarities(transactions) {
  return {
    ultraRare: Math.floor(transactions * 0.005),
    rare: Math.floor(transactions * 0.045),
    uncommon: Math.floor(transactions * 0.15),
    common: transactions - Math.floor(transactions * 0.005) - Math.floor(transactions * 0.045) - Math.floor(transactions * 0.15)
  };
}

function runRaffle(txHash, transactions) {
  const hash = crypto.createHash('sha256');
  hash.update(txHash);
  const buffer = hash.digest();
  // Use first 4 bytes to create a manageable integer
  const seed = buffer.readInt32BE(0);

  const { ultraRare, rare, uncommon, common } = calculateRarities(transactions);
  const rarities = Array(ultraRare).fill('Ultra Rare')
    .concat(Array(rare).fill('Rare'))
    .concat(Array(uncommon).fill('Uncommon'))
    .concat(Array(common).fill('Common'));

  shuffleArray(rarities, seed);

  const results = rarities.map((rarity, index) => ({ tx: index + 1, rarity }));

  // Display results and summary
  results.forEach((result) => {
    console.log(`TX: ${result.tx}, Rarity: ${result.rarity}`);
  });

  console.log('\nRarity Summary:');
  console.log(`Ultra Rare: ${ultraRare} (${(ultraRare / transactions * 100).toFixed(2)}%)`);
  console.log(`Rare: ${rare} (${(rare / transactions * 100).toFixed(2)}%)`);
  console.log(`Uncommon: ${uncommon} (${(uncommon / transactions * 100).toFixed(2)}%)`);
  console.log(`Common: ${common} (${(common / transactions * 100).toFixed(2)}%)`);
}

// Get inputs from command line arguments
const [, , txHash, transactions] = process.argv;

// Check if inputs are valid
if (!txHash || !transactions) {
  console.error('Please provide valid values for Transaction Hash and Total TX Number.');
  process.exit(1);
}

// Run the raffle
runRaffle(txHash, parseInt(transactions));
