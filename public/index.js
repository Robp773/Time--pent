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
  $('.form, .submitPlanned, .formBackground').removeClass('hidden'); 
  $('.submitRecorded').addClass('hidden');
  $('.legend').html('Add Planned Expense ');
});

$('.addRecord').click(function(){
  $('.form, .submitRecorded, .formBackground').removeClass('hidden');
  $('.submitPlanned').addClass('hidden');
  $('.legend').html('Add a Record');
  
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
  buildChart(pastFreeTime, todaysUnusedMins);
  $('.unRecordedMins').append(`<div>${pastFreeTime} Unrecorded Minutes</div>`);
  $('.totalList').empty();
  $('.totalList').append(`
   <tr class="total">
   <td>Daily Budget</td>
   <td>1440 mins</td>
   </tr>
   <tr class="recordedTotal">
   <td>Recorded Expenses</td>
   <td>-${globalVars.recordedCost} mins</td>
   </tr>
   <tr class="unspentTotal">
   <td>Unspent Passed Time</td>
   <td>-${pastFreeTime} mins</td>
   </tr>
   <tr class="total">
   <td><b>Current Budget</b></td>
   <td>${futureFreeTime} mins</td>
   </tr>
   <tr class="plannedTotal">
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
  
    $('.recordedList').append(
      `
      <tr class="listedRecord">
      <td class="res recordedName">${item.name}</td>
      <td class="res recordedCategory">${item.category}</td>
      <td class="res recordedProductive">${item.productive}</td>
      <td class="res recordedCost">${item.cost} mins</td>
      </tr>
      `
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
  $('.plannedList').empty(); 
          
  $('.plannedList').append(`
        <tr>
      <th>Name</th> 
      <th>Category</th> 
      <th>Type</th> 
      <th>Cost</th> 
  </tr>`);

  data.forEach(function(item){  

    $('.plannedList').append(`
      <tr class="listedPlanned">
            <td class="res plannedName">${item.name}</td>
            <td class="res plannedCategory">${item.category}</td>
            <td class="res plannedProductive">${item.productive}</td>
            <td class="res plannedCost">${item.cost} mins</td>
      </tr>`
           
    );
    
 
  });

  
}

function buildChart(pastFreeTime, todaysUnusedMins){

  const ctxTotal = $('#totalChart');
  ctxTotal.height = 250;
  const totalChart = new Chart(ctxTotal, {
    type: 'pie',
    
    data: {
      labels: ['Recorded', 'Planned', 'Past Unused', 'Future Unused' ],
      datasets: [{
        label: 'Time Spent',
        data: [globalVars.recordedCost, globalVars.plannedCost, pastFreeTime, todaysUnusedMins],
        backgroundColor: [
          '#E45641',
          '#44B3C2',
          '#ffb84d',
          '#42f465'
        ],
        borderColor: [
          '#FFFFF',
          '#FFFFF',
          '#FFFFF',
          '#FFFFF',
          '#FFFFF',
          
        ],
        borderWidth: .5
      }]
    },

  });
   
  const ctxRecord = $('#recordChart');

  const recordChart = new Chart(ctxRecord, {
    type: 'doughnut',
    
    data: {
      labels: ['Recorded', 'Unused'],
      datasets: [{
        label: 'Time Spent',
        data: [globalVars.recordedCost, pastFreeTime],
        backgroundColor: [
          '#E45641',
          '#ffb84d',
        
        ],
        borderColor: [
          '#FFFFF',
          '#FFFFF',
          '#FFFFF'       
        ],
        borderWidth: .5
      }]
    },

  });
   
  const ctxPlanned = $('#plannedChart');
  
  const plannedChart = new Chart(ctxPlanned, {
    type: 'doughnut',
      
    data: {
      labels: ['Future Unused', 'Planned'],
      datasets: [{
        label: 'Time Spent',
        data: [todaysUnusedMins, globalVars.plannedCost],
        backgroundColor: [
          '#42f465',
          '#44B3C2',
          
        ],
        borderColor: [
          '#FFFFF',
          '#FFFFF',

           
        ],
        borderWidth: .5
      }]
    },
  
  });
}


 
$('.submitRecorded').click(function(event){ 
   
  event.preventDefault();
  let name =  $('.name').val();
  let category = $('.category').val();
  let productive = $('.productive').val();
  let cost = $('.cost').val(); 
    
  if(!(cost > globalVars.unusedPastTime)){
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
  }
    
  else{
    alert(`You tried to spend ${cost} minutes but only have ${globalVars.unusedPastTime} minutes to spend`);
  } 
});



$('.submitPlanned').click(function(event){ 
    
  event.preventDefault();
  let name =  $('.name').val();
  let category = $('.category').val();
  let productive = $('.productive').val();
  let cost = $('.cost').val(); 
  let data = {
    name: name, 
    cost: cost, 
    productive: productive,
    category: category
  };
  $('.unRecordedMins').empty();
  resetGlobal();
  addPlanned(data);
});

function addRecorded(data){
  $.ajax(
    {
      url: '/homeRecorded',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      success: function(){
        loadRecorded();
      }
    });
}

function addPlanned(data){
  $.ajax(
    {
      url: '/homePlanned',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      success: function(){
        loadRecorded();
      }
    });
}

   


// $('.recordedName').click(function(){
//   alert('it worked');
// });

$('.recordedList').on('click', '.listedRecord', function() {
  
  $('.form, .formBackground, .deleteRecorded, .updateRecorded').removeClass('hidden'); 
  $('.submitRecorded, .submitPlanned').addClass('hidden');
  $('.legend').html('Edit or Delete');
  let name = $(this).closest('tr').find('.recordedName').text();
  let cost = $(this).closest('tr').find('.recordedCost').text();
  let numCost = cost.match(/\d+/);
  let actualCost = numCost[0];
  let productive = $(this).closest('tr').find('.recordedProductive').text();
  let category = $(this).closest('tr').find('.recordedCategory').text();
  let message  = `${name} ${numCost} ${productive} ${category}`;
  
  $('.form input[name=name]').val(`${name}`);
  $('.form input[name=cost]').val(`${actualCost}`);
  $('.form input[name=category]').val(`${category}`);
  $('.form select[name=productive]').val(`${productive}`);
  let data = {name: name, cost: actualCost, productive: productive, category: category};
  $('.deleteRecorded').click(function(event){
    event.preventDefault();
    deleteRecord(data);

  });

  // update button clicked
  $('.updateRecorded').on('click', function(event){ 
      
    event.preventDefault();
      
    let updateData = {};
      
    // current values of the inputs to account for changes made
    let newName = $('.form input[name=name]').val();
    let newCost =$('.form input[name=cost]').val().match(/\d+/)[0];
    let newCategory = $('.form input[name=category]').val();
    let newProductive = $('.form select[name=productive]').val();
    let newData = {
      name: newName, 
      cost: newCost, 
      productive: newProductive,
      category: newCategory
    };
      
    $.each(newData, function(item){
      if(newData[item] !== data[item]){
        updateData[item] = newData[item];
      }
    });
          
    let putData = {updated: updateData, old: data};
      
    updateRecorded(putData);
          
  });
});

function deleteRecord(data){
  $.ajax({
    url: '/homeRecorded',
    contentType: 'application/json',  
    type: 'DELETE',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function(){
      console.log('success function ran');
    }
  });
}


function updateRecorded(updateData){
  $.ajax({
    url: '/homeRecorded',
    contentType: 'application/json',  
    type: 'PUT',
    dataType: 'json',
    data: JSON.stringify(updateData),
    success: function(){
      console.log('success function ran');
    }
  });

}


$('.plannedList').on('click', '.listedPlanned', function() { 
  //  opens up modal for edit and delete
  $('.form, .formBackground, .deletePlanned, .updatePlanned, .addPlannedRecord').removeClass('hidden'); 
  $('.submitRecorded, .submitPlanned').addClass('hidden');
  $('.legend').html('Edit, Delete, or Add to Records');
  // getting the table data text values from the tr that was clicked on.
  let name = $(this).closest('tr').find('.plannedName').text();
  let cost = $(this).closest('tr').find('.plannedCost').text();
  let numCost = cost.match(/\d+/);
  let actualCost = numCost[0];
  let productive = $(this).closest('tr').find('.plannedProductive').text();
  let category = $(this).closest('tr').find('.plannedCategory').text();
  // presetting the table data as the modal form's values
  $('.form input[name=name]').val(`${name}`);
  $('.form input[name=cost]').val(`${cost}`);
  $('.form input[name=category]').val(`${category}`);
  $('.form select[name=productive]').val(`${productive}`);
  // data to be sent for DELETE
  let data = {name: name, cost: actualCost, productive: productive, category: category};

  $('.deletePlanned').click(function(event){
    event.preventDefault();
    // ajax delete
    deletePlanned(data);    
  });

  // update button clicked
  $('.updatePlanned').on('click', function(event){ 

    event.preventDefault();

    let updateData = {};

    // current values of the inputs to account for changes made
    let newName = $('.form input[name=name]').val();
    let newCost =$('.form input[name=cost]').val().match(/\d+/)[0];
    let newCategory = $('.form input[name=category]').val();
    let newProductive = $('.form select[name=productive]').val();
    let newData = {
      name: newName, 
      cost: newCost, 
      productive: newProductive,
      category: newCategory
    };

    $.each(newData, function(item){
      if(newData[item] !== data[item]){
        updateData[item] = newData[item];
      }
    });
    
    let putData = {updated: updateData, old: data};

    updatePlanned(putData);
    
  });

  $('.addPlannedRecord').click(function(event){
    
    event.preventDefault();
    let newName = $('.form input[name=name]').val();
    let newCost =$('.form input[name=cost]').val().match(/\d+/)[0];
    let newCategory = $('.form input[name=category]').val();
    let newProductive = $('.form select[name=productive]').val();
    let dataForRecord = {
      name: newName, 
      cost: newCost, 
      productive: newProductive,
      category: newCategory
    };
    deletePlanned(data);
    addRecorded(dataForRecord);
  
  });
});
function deletePlanned(data){
  $.ajax({
    url: '/homePlanned',
    contentType: 'application/json',  
    type: 'DELETE',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function(){
      console.log('success function ran');
    }
  });
}

function updatePlanned(updateData){
  $.ajax({
    url: '/homePlanned',
    contentType: 'application/json',  
    type: 'PUT',
    dataType: 'json',
    data: JSON.stringify(updateData),
    success: function(){
      console.log('success function ran');
    }
  });

}

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


$(document).ready(function() {
  loadRecorded();
  calcTimeDate();
  
});




