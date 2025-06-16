console.log('hi');
function populateCard(cardDataArray) {
    var section = document.querySelector('.container');
    if (!section) {
        return "<h1> nothing</h1>";
    }
    cardDataArray.forEach(function (cardData) {
        var card = document.createElement('section');
        card.className = 'section3';
        card.innerHTML = "\n            ".concat(cardData.isExpired ? "<div class=\"expired\"><p>EXPIRED</p></div>" : '', "\n            <div class='card'>\n                \n                <div class=\"courseimage\">\n                    <img src=\"").concat(cardData.img, "\">\n                </div>\n                <div class=\"coursedetails\">\n                    <div class=\"sec1\">\n                        <p>").concat(cardData.topic, "</p>\n                        ").concat(cardData.is_favourite ? "<img src=\"./icons/favourite.svg\">" : "<img src=\"./icons/notFavourite.svg\">", "\n                        \n                    </div>\n                    <div class=\"sec2\">\n                        <p>").concat(cardData.subject, "</p>\n                        <p>|</p>\n                        <p>Grade<span> ").concat(cardData.grade, "</span><span style=\"color : green;\"> ").concat(cardData.grade_plus, "</span></p>\n                    </div>\n                    <div class=\"sec3\">\n                    ").concat(cardData.units ? "<p><span><b>".concat(cardData.units, "</b></span> Units</p>") : '', "\n                    ").concat(cardData.lessons ? "<p><span><b>".concat(cardData.lessons, "</b></span> Lessons</p>") : '', "\n                    ").concat(cardData.topics ? "<p><span><b>".concat(cardData.topics, "</b></span> Topics</p>") : '', "\n                    </div>\n\n                    <div class=\"sec4\">\n                        <select class=\"teachername\" id=\"teachername\">\n                        \n                            ").concat(cardData.teacher_class ? "<option  selected>".concat(cardData.teacher_class, "</option>") : "<option  selected>No Classes</option>", "\n                        </select>\n                    </div>\n                    <div class=\"sec5\">\n                        ").concat(cardData.no_of_students ? "<p>".concat(cardData.no_of_students, " Students</p>") : '', "\n                        ").concat(cardData.date_of_class ? "<p>|</p>" : '', "\n                        ").concat(cardData.date_of_class ? "<p>".concat(cardData.date_of_class, "</p>") : '', "\n                    </div>\n                </div>\n            </div>\n            \n        ");
        var actions = document.createElement('div');
        actions.className = 'actions';
        actions.innerHTML = "\n            <div class='div1' style=\"opacity: ".concat(cardData.preview ? "1" : "0.4", "\">\n                <img src=\"./icons/preview.svg\">\n            </div>\n            <div  style=\"opacity: ").concat(cardData.manage_course ? "1" : "0.4", "\">\n                <img src=\"./icons/manage course.svg\">\n            </div>\n            <div  style=\"opacity: ").concat(cardData.grade_submission ? "1" : "0.4", "\">\n                <img src=\"./icons/grade submissions.svg\">\n            </div>\n            <div class='div4' style=\"opacity: ").concat(cardData.reports ? "1" : "0.4", "\">\n                <img src=\"./icons/reports.svg\">\n            </div>\n        ");
        section === null || section === void 0 ? void 0 : section.appendChild(card);
        card.appendChild(actions);
    });
}
function populateannouncement(annDataArray) {
    var section = document.querySelector('.announcementitems');
    if (!section) {
        return "<h1> no section</h1>";
    }
    annDataArray.forEach(function (annData) {
        var annitem = document.createElement('div');
        annitem.className = 'annitem'; // Fixed variable name from 'item' to 'annitem'
        annitem.style.backgroundColor = !annData.checked ? "#FFFFEE" : 'white';
        annitem.innerHTML = "\n            <div class=\"annsec1\">\n                <div class=\"panadname\">\n                    <span class=\"pa\">PA:</span><span class=\"name\">".concat(annData.pa, "</span>\n                </div>\n                <div class=\"checkimage\">\n                    ").concat(annData.checked ? "<img src=\"./icons/checkbox-checked.svg\">" : "<img src=\"./icons/checkbox-unchecked.svg\">", "\n                </div>\n            </div>\n            <div class=\"annsec2\">\n                <div class=\"content\">\n                    <p>").concat(annData.content, "</p>\n                </div>\n            </div>\n            <div class=\"annsec3\">\n                <div class=\"courseinann\">\n                    ").concat(!annData.course ? '' : "<span>Course :</span> <span class=\"coursename\">".concat(annData.course, "</span>"), "\n                    \n                </div>\n            </div>\n            <div class=\"annsec4\">\n                <div class=\"files\">\n                    ").concat(annData.filesAttached != 0 ? "<span>".concat(annData.filesAttached, "</span><span> Files attached</span>") : '', "\n                    \n                </div>\n                <div class=\"dateandtime\">\n                    ").concat(annData.dateAndTime, "\n                </div>\n            </div>\n        ");
        section.appendChild(annitem);
    });
}
function populatebelll(bellDataArray) {
    var section = document.querySelector('.bellitems');
    if (!section) {
        return "<h1>no data to show</h1>";
    }
    bellDataArray.forEach(function (bellData) {
        var bellitem = document.createElement('div');
        bellitem.className = 'bellitem'; // Fixed variable name from 'item' to 'bellitem'
        bellitem.style.backgroundColor = !bellData.checked ? "#FFFFEE" : 'white';
        bellitem.innerHTML = "\n                \n                    <div class=\"bellsec1\">\n                        <div class=\"bellcontent\">\n                            <p>".concat(bellData.content, "</p>\n                        </div>\n                        <div class=\"bellcheckimage\">\n                            ").concat(bellData.checked ? "<img src=\"./icons/checkbox-checked.svg\">" : "<img src=\"./icons/minus.png\">", "\n                        </div>\n                    </div>\n                    <div class=\"bellsec2\">\n                        <div class=\"bellcourse\">\n                            ").concat(!bellData.course ? '' : "<span>Course :</span> <span class=\"coursename\">".concat(bellData.course, "</span>"), "\n                        </div>\n                    </div>\n                    <div class=\"bellsec3\">\n                        <div class=\"belldateandtime\">\n                            ").concat(bellData.dateAndTime, "\n                        </div>\n                    </div>\n                \n        ");
        section.appendChild(bellitem);
    });
}
var cardDat = [
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
        no_of_students: null,
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
        units: null,
        lessons: null,
        topics: null,
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
var announcement = [
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
];
var belldata = [
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
];
populateCard(cardDat);
populateannouncement(announcement);
populatebelll(belldata);
var hamburgerr = document.getElementById('hamburger');
var hamburgermenuu = document.getElementsByClassName('hiddenhamburger');
var click = 'notclicked';
if (hamburgerr && hamburgermenuu.length > 0) {
    hamburgerr.addEventListener('click', function (e) {
        if (click === 'notclicked') {
            hamburgermenuu[0].classList.add('ablehamburger');
            click = 'clicked';
        }
        else {
            hamburgermenuu[0].classList.remove('ablehamburger');
            click = 'notclicked';
        }
    });
}
else {
    console.error("Element(s) not found: hamburger or hiddenhamburger");
}
// function handlebell(){
var bell = document.getElementById('bell');
var belldiv = document.querySelector('.belldiv');
var bellimg = document.querySelector('#bellimg');
var bellbadge = document.querySelector('.badge');
// if(!bell || !belldiv){
//     return`<h1>no data to show</h1>`
// }
// bell.addEventListener('click',()=>{
//     if (belldiv.style.display =='none' || belldiv.style.display ==''){
//         bell.innerHTML='<img src="./icons/alerts-clicked.svg">';
//         bellimg= 'white';
//         belldiv.style.display='flex'
//     }
//     else{
//         bell.innerHTML='<img src="./icons/alerts.svg"><span class="badge">1</span>';
//         bellimg='green'
//         belldiv.style.display='none'
//     }
// })
bell.addEventListener('mouseenter', function () {
    // bell.innerHTML='<img src="./icons/alerts-clicked.svg">';
    bellimg.src = 'http://127.0.0.1:5500/Task5/icons/alerts-clicked.svg';
    console.log('mouseover');
    belldiv.style.display = 'flex';
    bellbadge.style.opacity = '0';
    // if (bellimg=='green'){
    //     bell.innerHTML='<img src="./icons/alerts-clicked.svg">';
    //     bellimg= 'white';
    //     belldiv.style.display='flex'
    // }
    // else{
    //     bell.innerHTML='<img src="./icons/alerts.svg"><span class="badge">1</span>';
    //     bellimg='green'
    //     belldiv.style.display='none'
    // }
});
bell.addEventListener('mouseleave', function () {
    console.log('mouseout');
    // bell.innerHTML='<img src="./icons/alerts.svg"><span class="badge">1</span>';
    bellimg.src = 'http://127.0.0.1:5500/Task5/icons/alerts.svg';
    // belldiv.classList.remove("show-bell-icon");
    belldiv.style.display = 'none';
    bellbadge.style.opacity = '1';
});
// let div = document.querySelector('.belldiv')
// if(!div ){
//     return `<h1>no data to show</h1>`
// }
// div.addEventListener('mouseleave',()=>{
//     bell.innerHTML='<img src="./icons/alerts.svg"><span class="badge">1</span>';
//     bellimg='green'
//     belldiv.style.display='none'
// })
// }
// handlebell()
function handleann() {
    var ann = document.getElementById('announcements');
    var badge = document.querySelector('.badgeann');
    var annimg = document.querySelector('#annimage');
    var anndiv = document.querySelector('.anndiv');
    if (!ann || !anndiv || !badge) {
        return "<h1>no data to show</h1>";
    }
    ann.addEventListener('mouseenter', function () {
        // ann.innerHTML='<img src="./icons/announcement-clicked.svg">';
        annimg.src = 'http://127.0.0.1:5500/Task5/icons/announcement-clicked.svg';
        // annimg= 'white';
        anndiv.style.display = 'flex';
        badge.style.opacity = '0';
    });
    var div = document.querySelector('.anndiv');
    if (!div) {
        return "<h1>no data to show</h1>";
    }
    ann.addEventListener('mouseleave', function () {
        // ann.innerHTML='<img src="./icons/announcements.svg"><span class="badgeann">1</span>';
        annimg.src = 'http://127.0.0.1:5500/Task5/icons/announcements.svg';
        // annimg='green'
        anndiv.style.display = 'none';
        badge.style.opacity = '1';
    });
}
handleann();
// console.log('hi')
// let navv = document.getElementsByClassName('hamburger')
// for(let i=0;1<=navv.length;i++){
//     navv[i].addEventListener('click',(e)=>{
//     for(let j=0;j<navv.length;j++){
//         navv[j].setAttribute('class','navitem')
//     }
//     navv[i].setAttribute('class','selected-navitem')
//     })
// }
console.log('hi');
function hdashboardclick() {
    var hdashboard = document.querySelector('.hdashboard');
    var coursecatlog = document.querySelector('.coursecatlog');
    console.log(hdashboard);
    if (!hdashboard || !coursecatlog) {
        return "<h1>no data</h1>";
    }
    var dboard = 'notclicked';
    hdashboard.addEventListener('click', function () {
        if (dboard === 'notclicked') {
            hdashboard.style.backgroundColor = '#F3F3F3';
            dboard = 'clicked';
            coursecatlog.style.display = 'block';
        }
        else {
            hdashboard.style.backgroundColor = '#FFFFFF';
            dboard = 'notclicked';
            coursecatlog.style.display = 'none';
        }
    });
}
hdashboardclick();
