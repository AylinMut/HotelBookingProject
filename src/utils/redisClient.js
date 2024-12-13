const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connection successful.'));

module.exports = client;
