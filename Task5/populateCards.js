


function populateCards(cardDataArray) {
    const section = document.querySelector('.container');
    

    cardDataArray.forEach(cardData => {
        const card = document.createElement('section');
        card.className = 'section3';
        
        card.innerHTML = `
            ${cardData.isExpired ? `<div class="expired"><p>EXPIRED</p></div>` : ''}
            <div class='card'>
                
                <div class="courseimage">
                    <img src="${cardData.img}">
                </div>
                <div class="coursedetails">
                    <div class="sec1">
                        <p>${cardData.topic}</p>
                        ${cardData.is_favourite ? `<img src="./icons/favourite.svg">` :`<img src="./icons/notFavourite.svg">`}
                        
                    </div>
                    <div class="sec2">
                        <p>${cardData.subject}</p>
                        <p>|</p>
                        <p>Grade<span> ${cardData.grade}</span><span style="color : green;"> ${cardData.grade_plus}</span></p>
                    </div>
                    <div class="sec3">
                    ${cardData.units ? `<p><span><b>${cardData.units}</b></span> Units</p>` : ''}
                    ${cardData.lessons ? `<p><span><b>${cardData.lessons}</b></span> Lessons</p>` : ''}
                    ${cardData.topics ? `<p><span><b>${cardData.topics}</b></span> Topics</p>` : ''}
                    </div>

                    <div class="sec4">
                        <select class="teachername" id="teachername">
                        
                            ${cardData.teacher_class ? `<option  selected>${cardData.teacher_class  }</option>` : `<option  selected>No Classes</option>`}
                        </select>
                    </div>
                    <div class="sec5">
                        ${cardData.no_of_students ?`<p>${cardData.no_of_students} Students</p>`: ''}
                        ${cardData.date_of_class ? `<p>|</p>` : ''}
                        ${cardData.date_of_class ? `<p>${cardData.date_of_class}</p>` : ''}
                    </div>
                </div>
            </div>
            
        `;

        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.innerHTML = `
            <div class='div1' style="opacity: ${cardData.preview ? "1" : "0.4"}">
                <img src="./icons/preview.svg">
            </div>
            <div  style="opacity: ${cardData.manage_course ? "1" : "0.4"}">
                <img src="./icons/manage course.svg">
            </div>
            <div  style="opacity: ${cardData.grade_submission ? "1" : "0.4"}">
                <img src="./icons/grade submissions.svg">
            </div>
            <div class='div4' style="opacity: ${cardData.reports ? "1" : "0.4"}">
                <img src="./icons/reports.svg">
            </div>
        `;

        section.appendChild(card);
        card.appendChild(actions);
    });
}


function populateannouncements(annDataArray) {
    const section = document.querySelector('.announcementitems');

    annDataArray.forEach(annData => {
        const annitem = document.createElement('div');
        annitem.className = 'annitem'; // Fixed variable name from 'item' to 'annitem'
        annitem.style.backgroundColor = !annData.checked ?  "#FFFFEE" : 'white'

        annitem.innerHTML = `
            <div class="annsec1">
                <div class="panadname">
                    <span class="pa">PA:</span><span class="name">${annData.pa}</span>
                </div>
                <div class="checkimage">
                    ${annData.checked ? `<img src="./icons/checkbox-checked.svg">` : `<img src="./icons/checkbox-unchecked.svg">`}
                </div>
            </div>
            <div class="annsec2">
                <div class="content">
                    <p>${annData.content}</p>
                </div>
            </div>
            <div class="annsec3">
                <div class="courseinann">
                    ${!annData.course ? '': `<span>Course :</span> <span class="coursename">${annData.course}</span>`}
                    
                </div>
            </div>
            <div class="annsec4">
                <div class="files">
                    ${annData.filesAttached != 0 ?`<span>${annData.filesAttached}</span><span> Files attached</span>` : '' }
                    
                </div>
                <div class="dateandtime">
                    ${annData.dateAndTime}
                </div>
            </div>
        `;

        section.appendChild(annitem);
    });
}

function populatebell(bellDataArray) {
    const section = document.querySelector('.bellitems');

    bellDataArray.forEach(bellData => {
        const bellitem = document.createElement('div');
        bellitem.className = 'bellitem'; // Fixed variable name from 'item' to 'bellitem'
        bellitem.style.backgroundColor = !bellData.checked ?  "#FFFFEE" : 'white'

        bellitem.innerHTML = `
                
                    <div class="bellsec1">
                        <div class="bellcontent">
                            <p>${bellData.content}</p>
                        </div>
                        <div class="bellcheckimage">
                            ${bellData.checked ? `<img src="./icons/checkbox-checked.svg">` : `<img src="./icons/minus.png">`}
                        </div>
                    </div>
                    <div class="bellsec2">
                        <div class="bellcourse">
                            ${!bellData.course ? '': `<span>Course :</span> <span class="coursename">${bellData.course}</span>`}
                        </div>
                    </div>
                    <div class="bellsec3">
                        <div class="belldateandtime">
                            ${bellData.dateAndTime}
                        </div>
                    </div>
                
        `;

        section.appendChild(bellitem);
    });
}


const cardData = [
    {
        img: "./images/imageMask.png",
        topic: "Acceleration",
        subject: "Physics",
        grade: "7",
        grade_plus: "+2",
        units: 4,
        lessons: 18,
        topics: 24,
        teacher_class: "Mr. Frank's Class B",
        no_of_students: 50,
        date_of_class: "21-Jan-2020 - 21-Aug-2020",
        is_favourite: true,
        isExpired: false,
        preview: true,
        manage_course: true,
        grade_submission: true,
        reports: true
    },
    {
        img: "./images/imageMask-1.png",
        topic: "Displacement, Velocity and Speed",
        subject: "Physics 2",
        grade: "6",
        grade_plus: "+3",
        units: 2,
        lessons: 15,
        topics: 20,
        teacher_class: "",
        no_of_students: "",
        date_of_class: "",
        is_favourite: true,
        isExpired: false,
        preview: true,
        manage_course: false,
        grade_submission: false,
        reports: true
    },
    {
        img: "./images/imageMask-3.png",
        topic: "Introduction to Biology: Micro organisms and how they affec...",
        subject: "Biology",
        grade: "4",
        grade_plus: "+1",
        units: 5,
        lessons: 16,
        topics: 22,
        teacher_class: "All Classes",
        no_of_students: 300,
        date_of_class: "",
        is_favourite: true,
        isExpired: false,
        preview: true,
        manage_course: false,
        grade_submission: false,
        reports: true
    },
    {
        img: "./images/imageMask-2.png",
        topic: "Introduction to High School Mathematics",
        subject: "Mathematics",
        grade: "8",
        grade_plus: "+3",
        units: "",
        lessons: "",
        topics: "",
        teacher_class: "Mr. Frank's Class A",
        no_of_students: 44,
        date_of_class: "14-Oct-2019 - 20-Oct-2020",
        is_favourite: false,
        isExpired: true,
        preview: true,
        manage_course: true,
        grade_submission: true,
        reports: true
    }
];

const announcements = [
  {
    pa: "Wilson Kumar",
    checked: true,
    content: "No classes will be held on 21st Nov",
    course: "Mathematics 101",
    filesAttached: 2,
    dateAndTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    pa: "Samson White",
    checked: true,
    content: "Guest lecture on Geometry on 20th September",
    course: "",
    filesAttached: 2,
    dateAndTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    pa: "Wilson Kumar",
    checked: false,
    content: "Additional course materials available on request",
    course: "Mathematics 101",
    filesAttached: 0,
    dateAndTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    pa: "Wilson Kumar",
    checked: true,
    content: "No classes will be held on 25th Dec",
    course: "",
    filesAttached: 0,
    dateAndTime: "15-Sep-2018 at 07:21 pm"
  }
]

belldata = [
  {
    checked: true,
    content: "License for Introduction to Algebra has been assigned to your school",
    course: "Mathematics 101",
    dateAndTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    checked: false,
    content: "Lesson 3 Practice Worksheet overdue for Amy Santiago",
    course: "Advanced Mathematics",
    dateAndTime: "15-Sep-2018 at 05:21 pm"
  },
  {
    checked: false,
    content: "23 new students created",
    course: "",
    dateAndTime: "14-Sep-2018 at 01:21 pm"
  },
  {
    checked: false,
    content: "15 submissions ready for evaluation (Class: Basics of Algebra)",
    course: "Basics of Algebra",
    dateAndTime: "13-Sep-2018 at 01:15 pm"
  },
  {
    checked: true,
    content: "License for Basic Concepts in Geometry has been assigned to your school",
    course: "Mathematics 101",
    dateAndTime: "15-Sep-2018 at 07:21 pm"
  }
]



populateCards(cardData)
populateannouncements(announcements)
populatebell(belldata)


let hamburger = document.getElementById('hamburger');
let hamburgermenu = document.getElementsByClassName('hiddenhamburger');

console.log(hamburger);

// Check if both elements exist
if (hamburger && hamburgermenu.length > 0) {
  hamburger.addEventListener('mouseover', (e) => {
    hamburgermenu[0].classList.add('ablehamburger');
    

  });

  hamburger.addEventListener('mouseout', (e) => {
    hamburgermenu[0].classList.remove('ablehamburger');
  });

} else {
  console.error("Element(s) not found: hamburger or hiddenhamburger");
}

let bell = document.getElementById('bell')
let bellimg='green'
let belldiv = document.querySelector('.belldiv')
console.log(bell)
bell.addEventListener('click',()=>{
    if (bellimg=='green'){
        bell.innerHTML='<img src="./icons/alerts-clicked.svg"><span class="badge">1</span>';
        bellimg= 'white';
        belldiv.style.display='flex'
    }
    else{
        bell.innerHTML='<img src="./icons/alerts.svg"><span class="badge">1</span>';
        bellimg='green'
        belldiv.style.display='none'
    }
})

let ann = document.getElementById('announcements')
let annimg='green'
let anndiv = document.querySelector('.anndiv')
console.log(anndiv)
console.log(bell)
ann.addEventListener('click',()=>{
    if (annimg=='green'){
        ann.innerHTML='<img src="./icons/announcement-clicked.svg"><span class="badge">1</span>';
        annimg= 'white';
        // anndiv.style.display=''
        anndiv.style.display='flex'
    }
    else{
        ann.innerHTML='<img src="./icons/announcements.svg"><span class="badgeann">1</span>';
        annimg='green'
        anndiv.style.display='none'
        
    }
})

// let nav = document.getElementsByTagName('li')
// // console.log(nav)
// for(let i=0;1<=nav.length;i++){
//     nav[i].addEventListener('click',(e)=>{
//     for(let j=0;j<nav.length;j++){
//         nav[j].setAttribute('class','navitem')
//     }

//     nav[i].setAttribute('class','selected-navitem')
//     })
// }