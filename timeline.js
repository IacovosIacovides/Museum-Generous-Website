function getInfoForYear(year) {
  console.log('getInfoForYear called for year ' + year);
  // Make API request using year parameter
  fetch('https://api.vam.ac.uk/v2/objects/search?q=acquisitionYear:' + year + '&limit=50&offset=0')
    .then(response => response.json())
    .then(data => {
      // Update HTML code to display results
      let resultDiv = document.getElementById('results');
      resultDiv.innerHTML = '';
      for (let i = 0; i < data.records.length; i++) {
        let record = data.records[i];
        resultDiv.innerHTML += '<div class="result-item"><h3>' + record.title + '</h3><p>' + record.description + '</p></div>';
      }
    })
    .catch(error => console.error(error));
}
    
    function qs(selector, all = false) {
       return all ? document.querySelectorAll(selector) : document.querySelector(selector);
     }
     
     const sections = qs('.section', true);
     const timeline = qs('.timeline');
     const line = qs('.line');
     line.style.bottom = `calc(100% - 20px)`;
     let prevScrollY = window.scrollY;
     let up, down;
     let full = false;
     let set = 0;
     const targetY = window.innerHeight * .8;
     
     function scrollHandler(e) {
       const {
         scrollY
       } = window;
       up = scrollY < prevScrollY;
       down = !up;
       const timelineRect = timeline.getBoundingClientRect();
       const lineRect = line.getBoundingClientRect(); // const lineHeight = lineRect.bottom - lineRect.top;
     
       const dist = targetY - timelineRect.top;
       console.log(dist);
     
       if (down && !full) {
         set = Math.max(set, dist);
         line.style.bottom = `calc(100% - ${set}px)`;
       }
     
       if (dist > timeline.offsetHeight + 50 && !full) {
         full = true;
         line.style.bottom = `-50px`;
       }
     
       sections.forEach(item => {
         // console.log(item);
         const rect = item.getBoundingClientRect(); //     console.log(rect);
     
         if (rect.top + item.offsetHeight / 5 < targetY) {
           item.classList.add('show-me');
         }
       }); // console.log(up, down);
     
       prevScrollY = window.scrollY;
     }
     
     scrollHandler();
     line.style.display = 'block';
     window.addEventListener('scroll', scrollHandler);