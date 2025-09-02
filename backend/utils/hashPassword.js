const bcrypt = require('bcrypt');

const password = 'participant123';
const hash = '$2b$10$31efj7reCUVzdTVbtcBsleDx.g6mYkDeOocEVW2knSqmzEIfVhYQK';

bcrypt.compare(password, hash).then(result => console.log(result));
