const mongoose =  require('mongoose');

const timeSpentSchema =  mongoose.Schema({
	    expenseRecord:{
            name: String,
            cost: Number,
            productive: Boolean,
            category: String
        },
        plannedExpenses:{
            name: String,
            cost: Number,
            productive: Boolean,
            category: String
        }
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
module.exports = {SpentMin};