const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    if (!product) {
      res.status(404).json({ message: `No product found with id ${req.params.id}` });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    const savedProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.status(201).json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    const [ numAffectedRows, [ updatedProductData ] ] = updatedProduct;
    if (numAffectedRows === 0) {
      res.status(404).json({ message: `No product found with id ${req.params.id}` });
      return;
    }
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      const updatedProductTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
      const updatedProductTagIds = updatedProductTags.map(({ tag_id }) => tag_id);
      const newProductTags = productTagIdArr.filter(({ tag_id }) => !updatedProductTagIds.includes(tag_id));
      const productTagsToRemove = updatedProductTags.filter(({ tag_id }) => !req.body.tagIds.includes(tag_id)).map(({ id }) => id);
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }
    const savedProduct = await Product.findOne({
      where: { id: req.params.id },
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.status(200).json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// delete product by id
router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deletedProduct) => {
      if (!deletedProduct) {
        res.status(404).json({ message: `No product found with id ${req.params.id}` });
        return;
      }
      res.json(deletedProduct);
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
