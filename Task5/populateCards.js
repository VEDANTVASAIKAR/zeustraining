
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
                            ${cardData.teacher_class ? `<option  selected>${cardData.teacher_class  }</option>` : `<option style="text-align: left;font-style: QuickSandMedium;font-size:16px;letter-spacing: 0px;color:rgb(112, 112, 112);opacity: 0.4;" selected>No Classes</option>`}
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

populateCards(cardData)