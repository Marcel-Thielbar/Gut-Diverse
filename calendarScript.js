const date = new Date();

const renderCalendar = () => {
  date.setDate(1);

  const monthDays = document.querySelector(".days");

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  const prevLastDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).getDate();

  const firstDayIndex = date.getDay();

  const lastDayIndex = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDay();

  const nextDays = 7 - lastDayIndex - 1;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthName = months[date.getMonth()];

  document.querySelector(".date h1").innerHTML = monthName;

  document.querySelector(".date p").innerHTML = new Date().toDateString();

  let days = "";

  for (let x = firstDayIndex; x > 0; x--) {
    days += `<div class="prev-date">${prevLastDay - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDay; i++) {
    if (
      i === new Date().getDate() &&
      date.getMonth() === new Date().getMonth()
    ) {
      days += `<div class="today">${i}</div>`;
    } else {
      days += `<div>${i}</div>`;
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="next-date">${j}</div>`;
  }

  monthDays.innerHTML = days;

  // Add event listeners to each day element
  const dayElements = document.querySelectorAll(".days div");
  dayElements.forEach((dayElement) => {
    dayElement.addEventListener("click", () => {
        // Remove existing selected class from all days
        dayElements.forEach((element) => {
            element.classList.remove("selected");
        });
        // Add selected class to the clicked day
        dayElement.classList.add("selected");
        // Update daySelector value to selected day
        const selectedDay = dayElement.textContent;
        const selectedDate = new Date(date.getFullYear(), date.getMonth(), parseInt(selectedDay));
        const formattedDate = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById("daySelector").value = formattedDate;
        // Check if the selected day already exists in the daySelector dropdown
        const daySelector = document.getElementById("daySelector");
        const existingOptions = Array.from(daySelector.options).map(option => option.value);
        if (!existingOptions.includes(formattedDate)) {
            // Add option to daySelector only if it's not already present
            const option = document.createElement("option");
            option.value = formattedDate;
            option.textContent = formattedDate;
            daySelector.appendChild(option);
        }
        // Close the calendar after selecting a day
        toggleCalendarDiv();
    });
});
};

document.querySelector(".prev").addEventListener("click", () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
});

document.querySelector(".next").addEventListener("click", () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
});

// Function to toggle the visibility of the calendar container
function toggleCalendarDiv() {
  const calendarContainer = document.querySelector(".calendarContainer");
  if (calendarContainer.style.display === "none") {
    calendarContainer.style.display = "block";
  } else {
    calendarContainer.style.display = "none";
  }
}

// Adding event listener to the calendar button
renderCalendar();
