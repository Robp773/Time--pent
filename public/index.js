'use strict';

let globalVars = {
  dailyBudget: 1440,
  recordedData: null,
  recordedCost: 0,
  plannedData: null,
  plannedCost: 0,
  futureFreeTime: null,
  totalMinsPassed: 0,
  unusedPastTime: 0
};



$('.addPlanned').click(function(){
  $('.form, .submitPlanned, .resetPlanned, .plannedLegend, .formBackground').removeClass('hidden'); 
  $('.submitRecorded, .resetRecorded, .recordLegend').addClass('hidden');
});

// $('.testButton').click(function(){
//   console.log(this.getAttribute('data-id'));
// });

$('.addRecord').click(function(){
  $('.form, .submitRecorded, .resetRecorded, .recordLegend, .formBackground').removeClass('hidden');
  $('.submitPlanned, .resetPlanned, .plannedLegend').addClass('hidden');
  
});

$('.closer').click(function(){
  $(this).closest('form').addClass('hidden');
  $('.formBackground').addClass('hidden');
  
});
function calculateTotals (){
  globalVars.recordedData.forEach(function(item){
    globalVars.recordedCost = globalVars.recordedCost + item.cost;
  });
  globalVars.plannedData.forEach(function(item){
    globalVars.plannedCost = globalVars.plannedCost + item.cost;
  });
  
  let date = new Date();
  // amount of hours passed up until now
  let passedHours = date.getHours();
  // remaineder of minutes this hour - example 6:40 = 40 mins
  let passedMinsThisHour = date.getMinutes();
  // hours and mins added together for total mins
  let totalMinsPassed = (passedHours * 60) + passedMinsThisHour;
  // globalVars.totalMinsPassed + totalMinsPassed = globalVars.totalMinsPassed;
  globalVars.totalMinsPassed = globalVars.totalMinsPassed + totalMinsPassed;

  // time that was not recorded or planned for up until now
  let pastFreeTime = totalMinsPassed - globalVars.recordedCost;
  globalVars.unusedPastTime = pastFreeTime;
  
  // Mins that are being planned for or recorded but are not available at this point in the day. 
  let debt;
  // Unspent time in the future based on how much time is left in the day and planned and recorded expenses
  let futureFreeTime = 1440 - totalMinsPassed;
  
  let todaysUnusedMins  =  futureFreeTime - globalVars.plannedCost;
  
  $('.unRecordedMins').append(`<div>${pastFreeTime} Unrecorded Minutes</div>`);
  $('.totalList').empty();
  $('.totalList').append(`
   <tr class="total">
   <td>Daily Budget</td>
   <td>1440 mins</td>
   </tr>
   <tr class="subtract">
   <td>Recorded Expenses</td>
   <td>-${globalVars.recordedCost} mins</td>
   </tr>
   <tr class="subtract">
   <td>Unspent Passed Time</td>
   <td>-${pastFreeTime} mins</td>
   </tr>
   <tr class="total">
   <td><b>Current Budget</b></td>
   <td>${futureFreeTime} mins</td>
   </tr>
   <tr class="subtract plannedExp">
   <td>Planned Expenses</td>
   <td>-${globalVars.plannedCost} mins</td>
   </tr>
   <tr class="total projected">
    <td>Projected Budget</td>
    <td>${todaysUnusedMins} mins</td>
   </tr>
  `); 
  if(todaysUnusedMins < 0){ 
    $('.projected').addClass('red');
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
        loadPlanned();
        populateRecorded(data);
      }
    });
}

function populateRecorded(data){ 
  $('.recordedList').empty();
  $('.recordedList').append(
    ` <tr>
    <th>Name</th> 
    <th>Category</th> 
    <th>Type</th> 
    <th>Cost</th> 
</tr>`);

  data.forEach(function(item){  
    let productive; 
    if(item.productive === true){
      productive = 'Productive';
    } 
    else{
      productive = 'Unproductive';
    }  
           
    $('.recordedList').append(
      `
      <tr data-id = ${item._id} class="listed">
      <td class="res recordedName">${item.name}</td>
      <td class="res recordedCategory">${item.category}</td>
      <td class="res recordedProductive">${productive}</td>
      <td class="res recordedCost">${item.cost} mins</td>
      </tr>`
      
    );      
    
  });
}
$('.testButton').click(function(){
  
  console.log(this.getAttribute('data-id'));
});

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
  $('.plannedList').empty(); 
          
  $('.plannedList').append(`
        <tr>
      <th>Name</th> 
      <th>Category</th> 
      <th>Type</th> 
      <th>Cost</th> 
  </tr>`);

  data.forEach(function(item){  
    let productive; 
    if(item.productive === true){
      productive = 'Productive';
    } 
    else{
      productive = 'Unproductive';
    }  
         
    $('.plannedList').append(`
      <tr class="listItem">
            <td class="res plannedName">${item.name}</td>
            <td class="res plannedCategory">${item.category}</td>
            <td class="res plannedProductive">${productive}</td>
            <td class="res plannedCost">${item.cost} mins</td>
      </tr>`
           
    );
  });
}


 
$('.submitRecorded').click(function(event){ 
 
  // if(globalVars.totalMinsPassed < globalVars.recordedCost){
  //   alert(`You've recorded more minutes than possible for this point in the day. You've spent ${globalVars.recordedCost} minutes
  //   but only have ${globalVars.totalMinsPassed} minutes available to record with.`);
  // }
  // else 
  // if (globalVars.unusedPastTime <= 0){ 
   
  event.preventDefault();
  let name =  $('.name').val();
  let category = $('.category').val();
  let productive = $('.productive').val();
  let cost = $('.cost').val(); 
    
  if(cost > globalVars.unusedPastTime){
    alert(`You tried to spend ${cost} minutes but only have ${globalVars.unusedPastTime} minutes to spend`);
  }
    
  
  $('.unRecordedMins').empty();
  resetGlobal();
    
  $.ajax(
    {
      url: '/homeRecorded',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(
        {
          name: name, 
          cost: cost, 
          productive: productive,
          category: category
        }
      ),
      success: function(){
        loadRecorded();
        // location.reload(true);
      }
    });
  
});

$('.submitPlanned').click(function(event){ 
  
  // if(globalVars.totalMinsPassed < globalVars.recordedCost){
  //   alert(`You've recorded more minutes than possible for this point in the day. You've spent ${globalVars.recordedCost} minutes
  //   but only have ${globalVars.totalMinsPassed} minutes available to record with.`);
  // }
  // else 
  // if (globalVars.unusedPastTime <= 0){ 
    
  event.preventDefault();
  let name =  $('.name').val();
  let category = $('.category').val();
  let productive = $('.productive').val();
  let cost = $('.cost').val(); 
     
  // if(cost > globalVars.unusedPastTime){
  //   alert(`You tried to spend ${cost} minutes but only have ${globalVars.unusedPastTime} minutes to spend`);
  // }
     
   
  $('.unRecordedMins').empty();
  resetGlobal();
     
  $.ajax(
    {
      url: '/homePlanned',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(
        {
          name: name, 
          cost: cost, 
          productive: productive,
          category: category
        }
      ),
      success: function(){
        loadRecorded();
      }
    });
   
});

function resetGlobal(){
  globalVars = {
    dailyBudget: 1440,
    recordedData: null,
    recordedCost: 0,
    plannedData: null,
    plannedCost: 0,
    futureFreeTime: null,
    totalMinsPassed: 0
  };
}
 

loadRecorded();
calcTimeDate();

