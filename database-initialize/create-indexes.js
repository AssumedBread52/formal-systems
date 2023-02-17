db.getSiblingDB('formal-systems').getCollection('formal-systems').createIndex({
  title: 'text',
  description: 'text'
});
