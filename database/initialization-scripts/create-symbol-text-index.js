db.getSiblingDB('formal-systems').getCollection('symbol').createIndex({
  title: 'text',
  description: 'text'
});
