const router = require('express').Router();
const { Category, Product } = require('../../models');

// find all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [Product]
    });
    res.status(200).json(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one category by id
router.get('/:id', (req, res) => {
  Category.findOne({
    where: { id: req.params.id },
    include: [{ model: Product }]
  })
    .then(category => {
      if (!category) {
        res.status(404).json({ message: `No category found with id ${req.params.id}` });
        return;
      }
      res.status(200).json(category);
    })
    .catch(err => res.status(500).json(err));
});

// create new category
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update category
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    const [ numAffectedRows, [ updatedCategoryData ] ] = updatedCategory;
    if (numAffectedRows === 0) {
      res.status(404).json({ message: `No category found with id ${req.params.id}` });
      return;
    }
    res.status(200).json(updatedCategoryData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// delete a category
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.destroy({
      where: { id: req.params.id }
    });
    if (!deletedCategory) {
      res.status(404).json({ message: `No category found with id ${req.params.id}` });
      return;
    }
    res.json(deletedCategory);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
