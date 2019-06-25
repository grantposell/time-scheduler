$(document).ready(function () {

	//Firebase link

	var config = {
		apiKey: "AIzaSyDBVHK6LLq2ro44dsY6I2ZAwDY0PCYxb98",
		authDomain: "time-schedule-abaa3.firebaseapp.com",
		databaseURL: "https://time-schedule-abaa3.firebaseio.com",
		projectId: "time-schedule-abaa3",
		storageBucket: "",
		messagingSenderId: "535127508496",
		appId: "1:535127508496:web:db7ac2c7be6059c4"
	};

	firebase.initializeApp(config);

	var database = firebase.database();

	//collect input from the submit button and store it in specific variables
	$(".submitInput").on("click", function (event) {
		// console.log("this works");

		var nameInput = $("#nameInput").val().trim();

		var numberInput = $("#numberInput").val().trim();

		var destinationInput = $("#destInput").val().trim();

		var timeInput = $("#timeInput").val().trim();

		var frequencyInput = $("#freqInput").val().trim();

		//input validation
		if (nameInput != "" &&
			numberInput != "" &&
			destinationInput != "" &&
			timeInput.length === 4 &&
			frequencyInput != "") {

			//use the collected input (above) and port it to firebase db
			database.ref().push({
				name: nameInput,
				number: numberInput,
				destination: destinationInput,
				time: timeInput,
				frequency: frequencyInput,
			});

		} else {
			alert("Please enter valid train data");
			$("input").val("");
			return false;
		}

		//console.log(database);

		$("input").val("");

	});

	database.ref().on("child_added", function (childSnapshot) {
		// console.log(childSnapshot.val());

		var name = childSnapshot.val().name;
		var number = childSnapshot.val().number;
		var destination = childSnapshot.val().destination;
		var time = childSnapshot.val().time;
		var frequency = childSnapshot.val().frequency;

		// console.log(name, number, destination, time, frequency);

		//time formatting
		//this required a LOT of googling to figure out
		var frequency = parseInt(frequency);
		var currentTime = moment();

		//console.log("Current time: " + moment().format("HHmm"));

		//originally used mil format of HHMM but that failed with a null value
		//looked up potential faults and it turns out that moment.js must use
		//HH:mm for mil/euro time format
		var dateConvert = moment(childSnapshot.val().time, "HHmm").subtract(1, "years");

		//console.log("DATE CONVERTED: " + dateConvert);

		var trainTime = moment(dateConvert).format("HHmm");

		//console.log("Train time : " + trainTime);

		//difference bw the times
		var timeConvert = moment(trainTime, "HHmm").subtract(1, "years");
		var timeDifference = moment().diff(moment(timeConvert), "minutes");

		//console.log("Difference in time: " + timeDifference);

		//remainder
		var timeRemaining = timeDifference % frequency;

		//console.log("Time remaining: " + timeRemaining);

		//time until next train
		var timeAway = frequency - timeRemaining;

		//console.log("Minutes until next train: " + timeAway);

		//next train arrival
		var nextArrival = moment().add(timeAway, "minutes");

		//figured out that adding "A" at the end of HH:mm will add AM or PM
		//given that this is mil/euro format, the AM/PM is not necessary
		//console.log("Arrival time: " + moment(nextArrival).format("HHmm"));

		var arrivalDisplay = moment(nextArrival).format("HHmm");

		//append data to table
		$("#boardText").append(
			"<tr><td id='nameDisplay'>" + childSnapshot.val().name +
			"<td id='numberDisplay'>" + childSnapshot.val().number +
			"<td id='destinationDisplay'>" + childSnapshot.val().destination +
			"<td id='frequencyDisplay'>" + childSnapshot.val().frequency +
			"<td id='arrivalDisplay'>" + arrivalDisplay +
			"<td id='awayDisplay'>" + timeAway + " minutes until arrival" + "</td></tr>");

		// console.log(arrivalDisplay);
		// console.log(timeAway);
	});

	//reset functionality
	$(".resetInput").on("click", function (event) {
		location.reload();
	});

	//auto refresh per 1 minute passed
	//updates the train data upon refresh
	setInterval("window.location.reload()", 60000);
});