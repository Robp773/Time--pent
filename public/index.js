const mockHomeData = {
  
  currentBudget: null,
  totalExpenses: 0,
  totalExpectedExpenses: null,
  
    ExpenseRecord: [{
            name: 'Sleep',
            cost: 100,
            productive: true,
            category: 'health'
        },
        {
            name: 'Morning Run',
            cost: 35,
            productive: true,
            category: 'health'
        },
        {
            name: 'Commute-AM',
            cost: 45,
            productive: true,
            category: 'work'
        },
        {
            name: 'Workday',
            cost: 250,
            productive: true,
            category: 'work'
        },
        {
            name: 'Commute-PM',
            cost: 44,
            productive: true,
            category: 'work'
        },
        {
            name: 'Sleep',
            cost: 100,
            productive: true,
            category: 'health'
        },
        {
            name: 'Grocery Shopping',
            cost: 60,
            productive: true,
            category: 'Errands'
        },
        {
            name: 'GOT Binge',
            cost: 55,
            productive: false,
            category: 'Zoning Out'
        }
    ],
    PlannedExpenses: [{
            name: 'Sleep',
            cost: 100,
            productive: true,
            category: 'health'
        },
        {
            name: 'Clean Shower',
            cost: 15,
            productive: true,
            category: 'Errands'
        },
       
        {
            name: 'Take Dog to Vet',
            cost: 30,
            productive: true,
            category: 'Family'
        },
        {
            name: 'Write Card',
            cost: 10,
            productive: true,
            category: 'Friends'
        },
    ]
}
  
  function populateRecorded(){
    mockHomeData.ExpenseRecord.forEach(function(item){
        $('#recordedList').append(
        `<div class="results">
        <div class="recordedName">${item.name}</div>
        <div class="recordedCost">${item.cost}</div>
        </div>`
        )
    })
    
  
  }
  
  function populatePlanned(){
    mockHomeData.PlannedExpenses.forEach(function(item){
      $('#plannedList').append(
       `<div class="results">
        <div class="plannedName">${item.name}</div>
        <div class="plannedCost">${item.cost}</div>
        </div>`)
            })
  }
  
  function calculateTotals (){
    let plannedTotal = 0;
    mockHomeData.PlannedExpenses.forEach(function(item){
      plannedTotal = (plannedTotal + item.cost)
      mockHomeData.totalExpectedExpenses =  plannedTotal
    })
    let recordedTotal = 0;
    mockHomeData.ExpenseRecord.forEach(function(item){
      recordedTotal = recordedTotal + item.cost
      mockHomeData.totalExpenses =  recordedTotal
    })
    
    let totalSpent = mockHomeData.totalExpenses + mockHomeData.totalExpectedExpenses
    let totalFreeTime = 1440 - totalSpent
    let hoursFree = Math.floor(totalFreeTime/60)
    let divFreeTime = totalFreeTime/60
    let minutesFree = Math.floor(divFreeTime % 1 * 60)
    

    let date = new Date();
    let passedHours = date.getHours();
    let passedMinsThisHour = date.getMinutes();
    let totalMinsPassed = (passedHours * 60) + passedMinsThisHour
    
    let pastFreeTime = totalMinsPassed - totalSpent;
    if(pastFreeTime < 0){
      pastFreeTime = 0;
    }
    let futureFreeTime = 1440 - totalMinsPassed - mockHomeData.totalExpectedExpenses
    // console.log(totalMinsPassed)
   $('#totalList').append(`
    <h4>Daily Budget: 1440</h4>
    <h4>Recorded Expenses: ${mockHomeData.totalExpenses}</h4>
    <h4>Planned Expenses: ${mockHomeData.totalExpectedExpenses}</h4>
    <h4>Past Unassigned Mins: ${pastFreeTime}</h4>
    <h4>Future Unassigned Mins: ${futureFreeTime} </h4>
  `)
  }
  
  function calcTimeDate(){
  let currentTime = new Date(),
      hours = currentTime.getHours(),
      minutes = currentTime.getMinutes();
	if (minutes < 10) {
	 minutes = "0" + minutes;
  }

	let suffix = "AM";
	if (hours >= 12) {
    suffix = "PM";
    hours = hours - 12;
	}
	if (hours === 0) {
	 hours = 12;
	}
 let finalTime = `${hours}:${minutes} ${suffix}`
 
 $('#topNavTime').html(finalTime)
 
 let dayArray = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday', 'Friday', 'Saturday']
     
 let monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
   
 let monthName =  monthNames[currentTime.getMonth()]
 
 let dayName = dayArray[currentTime.getDay()]
 let numberDay = currentTime.getDate()
 if(numberDay === 1 || 21 || 31){
   numberDay = `${numberDay}th`
 }
 else if(numberDay === 2 || 22){
 numberDay = `${numberDay}nd`}
 
 else if(numberDay === 3 || 23){
   numberDay === `${numberDay}rd`
 }
 else {
   numberDay = `${numberDay}th`
 }
 
 let year = currentTime.getFullYear()

 
 $('#topNavDate').html(`${dayName} ${monthName} ${numberDay}, ${year}`)
  }
  
  populateRecorded()
  populatePlanned()
  calculateTotals()
  calcTimeDate()