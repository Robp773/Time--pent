'use strict';
// const startingState
// caps
let globalVars = {
  dailyBudget: 1440,
  recordedData: null,
  recordedCost: 0,
  plannedData: null,
  plannedCost: 0,
  futureFreeTime: null
};
  
function calculateTotals (){
  globalVars.recordedData.forEach(function(item){
    globalVars.recordedCost = globalVars.recordedCost + item.cost;
  });
  globalVars.plannedData.forEach(function(item){
    globalVars.plannedCost = globalVars.plannedCost + item.cost;
  });
  // recorded + planned 
  let totalSpent = globalVars.recordedCost + globalVars.plannedCost;
  let date = new Date();
  // amount of hours passed up until now
  let passedHours = date.getHours();
  // remaineder of minutes this hour - example 6:40 = 40 mins
  let passedMinsThisHour = date.getMinutes();
  // hours and mins added together for total mins
  let totalMinsPassed = (passedHours * 60) + passedMinsThisHour;
  // time that was not recorded or planned for up until now
  let pastFreeTime = totalMinsPassed - totalSpent;
  if(pastFreeTime < 0){
    pastFreeTime = 0;
  }
  // Mins that are being planned for or recorded but are not available at this point in the day. 
  let debt;
  // Unspent time in the future based on how much time is left in the day and planned and recorded expenses
  let futureFreeTime = 1440 - totalMinsPassed - totalSpent;
  if(futureFreeTime < 0){
    // gets rid of - sign
    debt = futureFreeTime * -1;
    futureFreeTime = 0;
    $('#negativeNum').addClass('red');
  }
  else if (futureFreeTime > 0){
    debt = 0;
  }
  $('.unRecordedMins').append(`<div>${futureFreeTime} Unrecorded Minutes</div>`);


  $('.totalList').append(`
   <tr>
   <td>Daily Budget</td>
   <td>1440 mins</td>
   </tr>
   <tr>
   <td>Recorded Expenses</td>
   <td>-${globalVars.recordedCost} mins</td>
   </tr>
   <tr>
   <td>Planned Expenses</td>
   <td>-${globalVars.plannedCost} mins</td>
   </tr>
   <tr>
   <td>Passed Time</td>
   <td>-${totalMinsPassed} mins</td>
   </tr>
   <tr class="totalRow">
   <td><b>Total Unspent Mins</b></td>
   <td id="negativeNum">${futureFreeTime} mins</td>
   </tr>
    
    
    // <h4>Unrecorded: ${pastFreeTime} mins</h4>
    // <h4>Debt: ${debt} mins</h4>
  `); 
  if(futureFreeTime < 0){
    $('#negativeNum').addClass('red');
  }
}
  
function calcTimeDate(){
  let currentTime = new Date(),
    hours = currentTime.getHours(),
    minutes = currentTime.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  let suffix = 'AM';
  if (hours >= 12) {
    suffix = 'PM';
    hours = hours - 12;
  }
  if (hours === 0) {
	 hours = 12;
  }
  let finalTime = `${hours}:${minutes} ${suffix}`;
 
  $('.topNavTime').html(finalTime);
 
  let dayArray = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday', 'Friday', 'Saturday'];
     
  let monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
   
  let monthName =  monthNames[currentTime.getMonth()];
 
  let dayName = dayArray[currentTime.getDay()];
  let numberDay = currentTime.getDate();
  if(numberDay === 1 || 21 || 31){
    numberDay = `${numberDay}th`;
  }
  else if(numberDay === 2 || 22){
    numberDay = `${numberDay}nd`;}
 
  else if(numberDay === 3 || 23){
    numberDay === `${numberDay}rd`;
  }
  else {
    numberDay = `${numberDay}th`;
  }
  let year = currentTime.getFullYear();
  $('.topNavDate').html(`${dayName} ${monthName} ${numberDay}, ${year}`);
}

function loadRecorded(){
  $.ajax(
    {
      url: '/homeRecorded',
      contentType: 'application/json',
      type: 'GET',
      dataType: 'json',
      crossDomain: true,
      success: function(data){
        // needed for calculateTotals function, cannot pass as argument 
        // because calculate totals is also called by loadPlanned()
        globalVars.recordedData = data;
        populateRecorded(data);
        calculateTotals();
      }
    });
}

function populateRecorded(data){
  data.forEach(function(item){  
    let productive; 
    if(item.productive === true){
      productive = 'Productive';
    } 
    else{
      productive = 'Unproductive';
    }          
    $('.recordedList').append(
      `<tr>
      <td class="res recordedName">${item.name}</td>
      <td class="res recordedCategory">${item.category}</td>
      <td class="res recordedProductive">${productive}</td>
      <td class="res recordedCost">${item.cost} mins</td>
      </tr>`
    );
  });
}

function loadPlanned(){
  $.ajax(
    {
      url: '/homePlanned',
      contentType: 'application/json',
      type: 'GET',
      dataType: 'json',
      crossDomain: true,
      success: function(data){
        globalVars.plannedData = data;
        populatePlanned(data);
        calculateTotals();   
      }
    });
}

function populatePlanned(data){
    
  data.forEach(function(item){  
    let productive; 
    if(item.productive === true){
      productive = 'Productive';
    } 
    else{
      productive = 'Unproductive';
    }          
    $('.plannedList').append(`
    
      <tr>
            <td class="res plannedName">${item.name}</td>
            <td class="res plannedCategory">${item.category}</td>
            <td class="res plannedProductive">${productive}</td>
            <td class="res plannedCost">${item.cost} mins</td>
      </tr>`
           
    );
  });
}
loadRecorded();
loadPlanned();
calcTimeDate();