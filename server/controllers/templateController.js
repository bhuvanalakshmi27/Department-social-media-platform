const Template = require('../models/Template');

const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().populate('createdBy', 'name email');
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error fetching templates.' });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { title, imageUrl, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required.' });
    }

    const template = new Template({
      title,
      imageUrl,
      category,
      createdBy: req.user._id
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error creating template.' });
  }
};

module.exports = {
  getTemplates,
  createTemplate
};
