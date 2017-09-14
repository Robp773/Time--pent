const mongoose =  require('mongoose');

const timeSpentSchema =  mongoose.Schema(
        {
	   
            name: String,
            cost: Number,
            productive: Boolean,
            category: String
        })

const plannedSpentSchema =  mongoose.Schema(
          {
            name: String,
            cost: Number,
            productive: Boolean,
            category: String
        })

timeSpentSchema.methods.apiRepr =  function(){
	return {
		 	name: this.name,
            cost: this.cost,
            productive: this.productive,
            category: this.category
			}
}

const SpentMin = mongoose.model('SpentMin', timeSpentSchema)
const PlannedMin =  mongoose.model('PlannedMin', plannedSpentSchema)
module.exports = {SpentMin, PlannedMin};