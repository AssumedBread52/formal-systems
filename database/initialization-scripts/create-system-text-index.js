db.getSiblingDB('formal-systems').getCollection('system').createIndex({
  title: 'text',
  description: 'text'
});
