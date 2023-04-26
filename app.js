/**
 * Fetch 100 items from the V&A API
 *
 * @return {Promise<Array>} Array of museum objects
 */
async function fetchMuseumObjects() {
  const itemsPerPage = 15;
  const targetItems = 100;
  let currentPage = 2;
  let fetchedItems = [];

  try {
    while (fetchedItems.length < targetItems) {
      const endpoint = `https://api.vam.ac.uk/v2/objects/search?q_object_production_date_year:[*%20TO%20*]&page=${currentPage}&page_size=${itemsPerPage}`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        fetchedItems = fetchedItems.concat(data.records);

        // Check if there are more items to fetch
        if (data.records.length < itemsPerPage) {
          break;
        }
      } else {
        throw new Error("Failed to fetch data from the V&A Museum API");
      }

      currentPage++;
    }

    // Truncate the fetched items if it exceeds the target
    if (fetchedItems.length > targetItems) {
      fetchedItems = fetchedItems.slice(0, targetItems);
    }

    return fetchedItems;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

/**
 * Present the returned results as a timeline
 *
 * @param {Object} object - Museum object
 * @return {HTMLElement} - Timeline item element
 */
function createTimelineItem(object, year) {
  if(year != null){
    if (object._primaryDate.includes(year)) {
      timelineItem = createTimeLineHtml(object);
    }
  }else{
    timelineItem = createTimeLineHtml(object);
  }
  return timelineItem;
}

function createTimeLineHtml(object) {
  const timelineItem = document.createElement("div");
  timelineItem.className = "timeline-item";
  timelineItem.setAttribute("id", object.systemNumber);
  const timelineItemDiv = document.createElement("div");
  timelineItemDiv.className = "item";
  timelineItem.appendChild(timelineItemDiv);
  const title = document.createElement("h2");
  title.textContent = object._primaryTitle || "Untitled";
  timelineItemDiv.appendChild(title);

  const productionDate = document.createElement("p");
  const date = object._primaryDate || "Undefined";
  productionDate.textContent = `Production Date: ${date}`;
  timelineItemDiv.appendChild(productionDate);

  const image = document.createElement("img");
  image.src = object._images._primary_thumbnail || "";
  timelineItemDiv.appendChild(image);

  return timelineItem;
}

/**
 * Present the returned results as a timeline
 *
 * @param {Object} object - Museum object
 * @return {HTMLElement} - Timeline item element
 */
function createTimelineItem2(objects) {
  var timeline = [];
  timeline["unknown"] = 0;
  currentYear = 2020;
  objects.forEach(createTimelineArray);
  function createTimelineArray(object){
    i = 0;
    objectDate = object._primaryDate;
    objectPlaced = 0;
    while (i == 0) {
      if(!timeline[currentYear])
        timeline[currentYear] = 0;
        year = currentYear + 10;
        while (year > currentYear) {
          if (objectDate.includes(year)) {
            timeline[currentYear] = timeline[currentYear] + 1
            objectPlaced = 1;
          }
          year = year - 1;
        }
      currentYear = currentYear - 10;
      if(currentYear < 1600){
        i = 1;
        currentYear = 2020;
      }
    }
    if(objectPlaced == 0){
      timeline["unknown"] = timeline["unknown"] + 1;
    }
  }
  return timeline;
}

/**
 * Present the returned results as a timeline
 *
 * @param {Object} object - Museum object
 * @return {HTMLElement} - Timeline item element
 */
function createTimeline2HTML(items, year) {
  timeLine2 = document.getElementById("timeline2List");
  const timelineLi = document.createElement("li");
  const timelineSpan = document.createElement("span");
  const newContent = document.createTextNode(year);

  // Convert year to a number and extract the last two digits
  const lastTwoDigits = Number(year) % 100;

  // Generate random values for red, green, and blue components
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Use the last two digits of the year to adjust the opacity of the color
  const opacity = lastTwoDigits / 100;

  // Combine the color components and opacity into a CSS color value
  const color = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  
  // Return the color value
  timelineSpan.style.width = items*15+"%";
  timelineSpan.style.backgroundColor = color;
  timelineSpan.style.borderColor = color;
  timelineLi.appendChild(newContent);
  timelineLi.appendChild(timelineSpan);
  timeLine2.appendChild(timelineLi);

  return timeLine2;
}


/**
 * Extract the earliest date from the random date formats stored
 *
 * @param {string} dateString - Date string
 * @return {number} - Earliest year extracted from the date string
 */
function extractEarliestYear(dateString) {
  const yearMatches = dateString.match(/\d{4}/g);

  if (yearMatches && yearMatches.length > 0) {
    return Math.min(...yearMatches.map(Number));
  }

  return Number.MAX_VALUE;
}

/**
 * Display the results
 *
 */
async function displayTimeline() {
  const timelineElement = document.getElementById("timeline");
  const museumObjects = await fetchMuseumObjects();
  // Sort the items by primary date (oldest to newest)
  museumObjects.sort((a, b) => {
    const dateA = a._primaryDate ? extractEarliestYear(a._primaryDate) : Number.MAX_VALUE;
    const dateB = b._primaryDate ? extractEarliestYear(b._primaryDate) : Number.MAX_VALUE;
    return dateA - dateB;
  });

  timeLine2 = createTimelineItem2(museumObjects);
  timeLine2.forEach(createTimelineHTML);
  function createTimelineHTML(items, year){
    createTimeline2HTML(items, year);
  }

  museumObjectsCall(museumObjects, null, timelineElement);

  //On click Filter items
  const spans = document.getElementsByTagName("span");
  for (let i = 0; i < spans.length; i++) {
    spans[i].addEventListener("click", function() {
      const parentElement = document.getElementById('timeline');
      // remove all child elements
      parentElement.innerHTML = '';
      const value = event.target.parentNode.textContent;
      museumObjectsCall(museumObjects, value, parentElement);
      const element = document.getElementById('my-element');
      parentElement.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function museumObjectsCall(museumObjects, year, timelineElement) {
  museumObjects.forEach((object) => {
    const timelineItem = createTimelineItem(object, year);
    timelineElement.appendChild(timelineItem);
    // create modal for each timeline item
    const modal = createModal(object);
    modalParent = document.getElementById(object.systemNumber)
    if(modalParent){
      modalParent.appendChild(modal);
      
      // add click event listener to open modal
      modalParent.children[0].addEventListener("click", () => {
        modal.classList.add("block");
      });
    }
  });
}

// Initiate the JS code
displayTimeline();

function createModal(object) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modal.appendChild(modalContent);

  const title = document.createElement("h2");
  title.textContent = object._primaryTitle || "Untitled";
  modalContent.appendChild(title);

  const productionDate = document.createElement("p");
  const date = object._primaryDate || "Undefined";
  productionDate.textContent = `Production Date: ${date}`;
  modalContent.appendChild(productionDate);

  const image = document.createElement("img");
  image.src = object._images._primary_thumbnail || "";
  modalContent.appendChild(image);

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.innerHTML = "&times;";
  modalContent.appendChild(closeBtn);

  // add click event listener to close modal
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("block");
  });

  return modal;
}
