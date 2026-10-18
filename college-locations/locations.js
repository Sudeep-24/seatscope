/* =========================================================
   SEATSCOPE COLLEGE SEARCH
   COMPLETELY SEPARATE FROM MAIN SCRIPT.JS
========================================================= */

const collegeSearch =
    document.getElementById("collegeSearch");

const clearSearch =
    document.getElementById("clearSearch");

const collegeList =
    document.getElementById("collegeList");

const collegeCount =
    document.getElementById("collegeCount");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");


let colleges = [];


/* =========================================================
   LOAD COLLEGE DATA
========================================================= */

async function loadColleges() {

    try {

        const response =
            await fetch("locations-data.json");

        if (!response.ok) {
            throw new Error(
                "Unable to load college data"
            );
        }

        colleges =
            await response.json();

        loading.classList.add("hidden");

        displayColleges(colleges);

    } catch (error) {

        console.error(error);

        loading.textContent =
            "Unable to load college information.";

    }

}


/* =========================================================
   DISPLAY COLLEGES
========================================================= */

function displayColleges(list) {

    collegeList.innerHTML = "";

    collegeCount.textContent =
        `${list.length} college${list.length === 1 ? "" : "s"}`;


    if (list.length === 0) {

        emptyState.classList.remove("hidden");

        return;
    }


    emptyState.classList.add("hidden");


    list.forEach((college, index) => {

        const card =
            document.createElement("div");

        card.className =
            "college-card";

        card.style.animationDelay =
            `${Math.min(index * 0.04, 0.5)}s`;


        const courses =
            college.courses || [];


        const courseHTML =
            courses.length > 0

                ? courses
                    .slice(0, 5)
                    .map(course =>
                        `<span class="course-tag">
                            ${escapeHTML(course)}
                         </span>`
                    )
                    .join("")

                : `<span class="course-tag">
                        Course information available in cutoff data
                   </span>`;


        card.innerHTML = `

            <div class="college-top">

                <div>
                    <h3>
                        ${escapeHTML(college.name)}
                    </h3>
                </div>

                <span class="college-code">
                    ${escapeHTML(college.code)}
                </span>

            </div>


            <div class="college-location">

                <span class="location-icon">
                    📍
                </span>

                <span>
                    ${escapeHTML(college.city)}
                    ${college.district
                        ? ", " + escapeHTML(college.district)
                        : ""}
                </span>

            </div>


            <div class="course-label">
                Available Courses
            </div>

            <div class="course-list">
                ${courseHTML}
            </div>


            <button
                class="view-location"
                onclick="viewLocation('${encodeURIComponent(
                    college.name + ", " + college.city + ", Karnataka"
                )}')">

                📍 View Location

            </button>

        `;


        collegeList.appendChild(card);

    });

}


/* =========================================================
   SEARCH
========================================================= */

collegeSearch.addEventListener(
    "input",
    function () {

        const search =
            this.value
                .trim()
                .toLowerCase();


        if (!search) {

            displayColleges(colleges);

            return;
        }


        const filtered =
            colleges.filter(college => {

                const name =
                    (college.name || "")
                        .toLowerCase();

                const code =
                    (college.code || "")
                        .toLowerCase();

                const city =
                    (college.city || "")
                        .toLowerCase();

                const district =
                    (college.district || "")
                        .toLowerCase();


                return (
                    name.includes(search) ||
                    code.includes(search) ||
                    city.includes(search) ||
                    district.includes(search)
                );

            });


        displayColleges(filtered);

    }
);


/* =========================================================
   CLEAR SEARCH
========================================================= */

clearSearch.addEventListener(
    "click",
    function () {

        collegeSearch.value = "";

        displayColleges(colleges);

        collegeSearch.focus();

    }
);


/* =========================================================
   OPEN MAP LOCATION
========================================================= */

function viewLocation(location) {

    const decodedLocation =
        decodeURIComponent(location);

    const mapsURL =
        "https://www.google.com/maps/search/?api=1&query="
        + encodeURIComponent(decodedLocation);


    window.open(
        mapsURL,
        "_blank"
    );

}


/* =========================================================
   BASIC HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   START
========================================================= */

loadColleges();