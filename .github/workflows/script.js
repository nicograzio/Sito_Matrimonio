const fs = require('fs');
// Un esempio semplice di scrittura di dati in un file
fs.writeFileSync('data.json', JSON.stringify({ message: 'Hello, World!' }));
