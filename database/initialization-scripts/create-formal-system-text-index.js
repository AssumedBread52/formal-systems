db.getSiblingDB('formal-systems').getCollection('systems').createIndex({
  title: 'text',
  description: 'text'
});
