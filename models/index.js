const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// product belongs to
Product.belongsTo(Category, {
  foreignKey: 'category_id',
});

// categories have many products
Category.hasMany(Product, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});

// products belongToMany tags
Product.belongsToMany(Tag, {
  through: ProductTag,
  foreignKey: 'product_id',
});

// tags belongToMany products
Tag.belongsToMany(Product, {
  through: ProductTag,
  foreignKey: 'tag_id',
});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
