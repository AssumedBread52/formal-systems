db.getSiblingDB('formal-systems').getCollection('grouping').createIndex({
  title: 'text',
  description: 'text'
});
