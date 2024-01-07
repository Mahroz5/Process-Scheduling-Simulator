// static/app.js
let timerInterval; 
$(document).ready(function () {
    // Keep track of the next process ID
    let nextProcessId = 1;
    let timerInterval;

    function calculateAverageTurnaroundTime(completionTimes, processes) {
        const totalTurnaroundTime = Object.values(completionTimes).reduce((acc, time) => acc + time, 0);
        return (totalTurnaroundTime / processes.length).toFixed(2);
    }

    function simulateScheduling(result) {
        const simulationContainer = $("#simulation-container");
        simulationContainer.empty();
        console.log(result);
    
        let totalWaitingTime = 0;
        const waitingTimes = {};
        let timer = 0;
    
        // Calculate waiting time for each process and total waiting time
        result.order.forEach((processId, index) => {
            const completionTime = result.completionTimes[processId];
            const burstTime = result.burstTimes[processId];
            const waitingTime = Math.max(completionTime - burstTime, 0);
    
            totalWaitingTime += waitingTime;
            waitingTimes[processId] = waitingTime;
            //html element for the current process with animation
            const processElement = $(`<div class="process" style="left: ${index * 100}px;">Process Id: ${processId} <br> Turnaround Time: ${completionTime}secs <br> Burst Time: ${burstTime}secs <br> Waiting Time: ${waitingTime}secs</div>`);
            simulationContainer.append(processElement);
    
           // Animation delay based on index
            processElement.hide().delay(index * 1000).fadeIn(500);

    
            // Increment timer every second
            timerInterval = setInterval(function () {
                timer++;
                $("#timer").text(timer);
            }, 1000);
    
            // Check if this is the last process, then stop the timer
            if (index === result.order.length - 1) {
                clearInterval(timerInterval);
            }
        });
    
        // Display the added processes in Gantt chart style
        const ganttChartContainer = $(".gantt-chart-container");
        ganttChartContainer.empty();
        ganttChartContainer.append("<h2>Added Processes Gantt Chart:</h2>");
    
        result.order.forEach((processId, index) => {
            const burstTime = result.burstTimes[processId];
            const ganttElement = $(`<div class="gantt-process" style="width: ${burstTime * 30}px;">${processId}</div>`);
            ganttChartContainer.append(ganttElement);
    
            // Gantt Chart Animation with delay based on waiting time
            ganttElement.hide().delay(waitingTimes[processId] * 1000).fadeIn(500);
        });
    
        // Calculate and display average waiting time
        const numProcesses = result.order.length;
        const averageWaitingTime = (totalWaitingTime / numProcesses).toFixed(2);
        const averageTurnaroundTime = calculateAverageTurnaroundTime(result.completionTimes, result.order);
    
        const averageTimesContainer = $("#average-times-container");
        averageTimesContainer.empty();
    
        const averageTimesElement = $(`<div class="average-times">Average Waiting Time: ${averageWaitingTime}secs <br> Average Turnaround Time: ${averageTurnaroundTime}secs</div>`);
        averageTimesContainer.append(averageTimesElement);
    
        // Add a button to select another algorithm
        const selectAnotherBtn = $('<button type="button" id="select-another-btn">Select Another Algorithm</button>');
        averageTimesContainer.append(selectAnotherBtn);
    
        // Handle button click to select another algorithm
        selectAnotherBtn.click(function () {
            // Reset the UI for selecting another algorithm (clear added processes, etc.)
            $("#added-process-list").empty();
            $("#process-list").empty();
            simulationContainer.empty();
            averageTimesContainer.empty();
            ganttChartContainer.empty();
    
            // Clear the timer interval
            clearInterval(timerInterval);
    
            // For simplicity, let's reload the page after clicking the button
            location.reload();
        });
    }

    function displayAddedProcesses(processes) {
        const addedProcessList = $("#added-process-list");
    
        processes.forEach((process) => {
            const addedProcessItem = $(`<li>Process Id: ${process.id} (Burst Time: ${process.burstTime}) </li>`);
            addedProcessList.append(addedProcessItem);
        });

        // Display the added processes in Gantt chart style
        const ganttChartContainer = $("#gantt-chart-container");
        ganttChartContainer.empty();
        ganttChartContainer.append("<h2>Added Processes Gantt Chart:</h2>");

        processes.forEach((process) => {
            const ganttElement = $(`<div class="gantt-process" style="width: ${process.burstTime * 30}px;">${process.id}</div>`);
            ganttChartContainer.append(ganttElement);

            // Gantt Chart Animation
            ganttElement.hide().fadeIn(500);
        });
    }    

    function updateProcessList() {
        const processes = [];

        $(".process-input").each(function () {
            const burstTime = $(this).find(".burst-time").val();

            processes.push({
                id: nextProcessId++, // Auto-incrementing process ID
                burstTime: parseInt(burstTime) || 0
            });
        });

        // Show the added processes immediately
        displayAddedProcesses(processes);

        // Clear existing input fields
        $(".process-input").remove();

        return processes;
    }

    $("#add-process-btn").click(function () {
        const newIndex = $(".process-input").length;

        const processElement = $(
            `<div class="process-input">
                <label for="burst-time-${newIndex}">Burst Time:</label>
                <div class="input-with-remove">
                    <input type="text" class="burst-time" id="burst-time-${newIndex}" name="burst-time-${newIndex}">
                    <button type="button" class="remove-process-btn">Remove</button>
                </div>
            </div>`
        );

        $("#process-list").append(processElement);
    });

    // Remove a dynamically added process
    $("#process-form").on("click", ".remove-process-btn", function () {
        $(this).closest(".process-input").remove();
        // Do not clear the added processes when removing one
        displayAddedProcesses(updateProcessList());
    });

    $("#simulate-btn").click(function () {
        const algorithm = $("#algorithm-select").val();
        const processes = updateProcessList();

        if (processes.length > 0) {
            $.ajax({
                type: "POST",
                url: "/simulate",
                contentType: "application/json;charset=UTF-8",
                data: JSON.stringify({
                    algorithm,
                    processes: processes.map(process => ({ id: process.id, burstTime: process.burstTime })),
                }),
                success: function (result) {
                    simulateScheduling(result);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        } else {
            alert("Please add processes before simulating.");
        }
    });
});
