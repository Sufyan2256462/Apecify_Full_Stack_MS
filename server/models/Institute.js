const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Institute', InstituteSchema); 