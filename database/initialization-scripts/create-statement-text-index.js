db.getSiblingDB('formal-systems').getCollection('statement').createIndex({
  title: 'text',
  description: 'text'
});
