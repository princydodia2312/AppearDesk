const Offer = require('../models/offer.model');

const getOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.type) filter.type = req.query.type;

    const total = await Offer.countDocuments(filter);
    const data = await Offer.find(filter).skip(skip).limit(limit);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOffer = async (req, res) => {
  try {
    const offerData = { ...req.body, createdBy: req.user._id };
    if (offerData.code) {
      offerData.code = offerData.code.toUpperCase();
    }
    const offer = await Offer.create(offerData);
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offerData = { ...req.body };
    if (offerData.code) {
      offerData.code = offerData.code.toUpperCase();
    }
    const offer = await Offer.findByIdAndUpdate(req.params.id, offerData, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyOffer = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const offer = await Offer.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') }, isActive: true });
    
    if (!offer) return res.status(404).json({ message: 'Invalid offer code' });
    
    const now = new Date();
    if (offer.startDate && new Date(offer.startDate) > now) {
      return res.status(400).json({ message: 'Offer not yet active' });
    }
    if (offer.endDate && new Date(offer.endDate) < now) {
      return res.status(400).json({ message: 'Offer has expired' });
    }
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      return res.status(400).json({ message: 'Offer usage limit reached' });
    }
    if (offer.minOrderAmt && subtotal < offer.minOrderAmt) {
      return res.status(400).json({ message: `Minimum order amount is ₹${offer.minOrderAmt}` });
    }

    let discount = 0;
    let freeShipping = false;
    
    if (offer.type === 'percentage') {
      discount = subtotal * (offer.value / 100);
    } else if (offer.type === 'fixed') {
      discount = offer.value;
    } else if (offer.type === 'free_shipping') {
      discount = 0;
      freeShipping = true;
    }

    res.json({
      valid: true,
      discount,
      freeShipping,
      offer: {
        title: offer.title,
        code: offer.code,
        type: offer.type,
        value: offer.value
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOffers, getOffer, createOffer, updateOffer, deleteOffer, applyOffer };
