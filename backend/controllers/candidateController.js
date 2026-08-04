const { Candidate, Department, Position, Election } = require('../models');

exports.getCandidates = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { election_id, position_id } = req.query;
    const where = { college_id };
    if (election_id) where.election_id = election_id;
    if (position_id) where.position_id = position_id;

    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Department, attributes: ['name'] },
        { model: Position, attributes: ['name'] }
      ],
      order: [['display_order', 'ASC']]
    });
    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidates', error: error.message });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { election_id, department_id, position_id, name, manifesto, achievements, display_order } = req.body;

    let photo_url = null;
    let symbol_url = null;
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        photo_url = `/uploads/photos/${req.files.photo[0].filename}`;
      }
      if (req.files.symbol && req.files.symbol[0]) {
        symbol_url = `/uploads/symbols/${req.files.symbol[0].filename}`;
      }
    }

    const candidate = await Candidate.create({
      college_id, election_id, department_id, position_id, name,
      photo_url, symbol_url, manifesto, achievements,
      display_order: display_order || 0
    });

    res.status(201).json({ message: 'Candidate added', candidate });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add candidate', error: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const candidate = await Candidate.findOne({ where: { id: req.params.id, college_id } });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const updates = { ...req.body };
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        updates.photo_url = `/uploads/photos/${req.files.photo[0].filename}`;
      }
      if (req.files.symbol && req.files.symbol[0]) {
        updates.symbol_url = `/uploads/symbols/${req.files.symbol[0].filename}`;
      }
    }

    await candidate.update(updates);
    res.json({ message: 'Candidate updated', candidate });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update candidate', error: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const candidate = await Candidate.findOne({ where: { id: req.params.id, college_id } });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    await candidate.destroy();
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete candidate', error: error.message });
  }
};
