const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// GET all tags
router.get('/', (req, res) => {
  Tag.findAll({
    include: [{ model: Product, through: ProductTag }]
  })
    .then(tags => res.status(200).json(tags))
    .catch(err => res.status(500).json(err));
});

// GET one tag by id
router.get('/:id', (req, res) => {
  Tag.findOne({
    where: { id: req.params.id },
    include: [{ model: Product, through: ProductTag }]
  })
    .then(tag => {
      if (!tag) {
        res.status(404).json({ message: `No tag found with id ${req.params.id}` });
        return;
      }
      res.status(200).json(tag);
    })
    .catch(err => res.status(500).json(err));
});

// CREATE a new tag
router.post('/', async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// UPDATE a tag by id
router.put('/:id', (req, res) => {
  Tag.update(
    {
      tag_name: req.body.tag_name
    },
    {
      where: { id: req.params.id }
    }
  )
    .then(rowsUpdated => {
      if (rowsUpdated[0] === 0) {
        res.status(404).json({ message: `No tag found with id ${req.params.id}` });
        return;
      }
      res.status(200).json({ message: `Tag with id ${req.params.id} updated successfully` });
    })
    .catch(err => res.status(500).json(err));
});

// DELETE a tag by id
router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: { id: req.params.id }
  })
    .then(rowsDeleted => {
      if (rowsDeleted === 0) {
        res.status(404).json({ message: `No tag found with id ${req.params.id}` });
        return;
      }
      res.status(200).json({ message: `Tag with id ${req.params.id} deleted successfully` });
    })
    .catch(err => res.status(500).json(err));
});

module.exports = router;
