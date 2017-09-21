
'use strict';
const mongoose =  require('mongoose');

const timeSpentSchema =  mongoose.Schema(
  { 
    name: String,
    cost: Number,
    productive: String,
    category: String
  });

const plannedSpentSchema =  mongoose.Schema(
  {
    name: String,
    cost: Number,
    productive: String,
    category: String
  });

const SpentMin = mongoose.model('SpentMin', timeSpentSchema);
const PlannedMin =  mongoose.model('PlannedMin', plannedSpentSchema);
module.exports = {SpentMin, PlannedMin};