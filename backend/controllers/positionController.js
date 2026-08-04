const { Position } = require('../models');

exports.getPositions = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { election_id } = req.query;
    const where = { college_id };
    if (election_id) where.election_id = election_id;

    const positions = await Position.findAll({
      where,
      order: [['display_order', 'ASC']]
    });
    res.json({ positions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch positions', error: error.message });
  }
};

exports.addPosition = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { name, election_id, display_order } = req.body;

    const position = await Position.create({
      college_id, election_id, name,
      display_order: display_order || 0
    });
    res.status(201).json({ message: 'Position added', position });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add position', error: error.message });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const position = await Position.findOne({ where: { id: req.params.id, college_id } });
    if (!position) return res.status(404).json({ message: 'Position not found' });

    await position.update(req.body);
    res.json({ message: 'Position updated', position });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update position', error: error.message });
  }
};

exports.deletePosition = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const position = await Position.findOne({ where: { id: req.params.id, college_id } });
    if (!position) return res.status(404).json({ message: 'Position not found' });

    await position.destroy();
    res.json({ message: 'Position deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete position', error: error.message });
  }
};
