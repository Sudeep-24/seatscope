/* =========================================================
   SEATSCOPE HELPBOT
   Standalone chatbot - does not modify the existing
   SeatScope index.html, style.css or script.js
========================================================= */

const helpbotToggle = document.getElementById("helpbotToggle");
const helpbotWindow = document.getElementById("helpbotWindow");
const helpbotClose = document.getElementById("helpbotClose");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessage = document.getElementById("sendMessage");

const typingIndicator = document.getElementById("typingIndicator");


/* =========================================================
   OPEN / CLOSE BOT
========================================================= */

helpbotToggle.addEventListener("click", () => {

    helpbotWindow.classList.toggle("active");

    if (helpbotWindow.classList.contains("active")) {
        setTimeout(() => {
            chatInput.focus();
        }, 100);
    }
});


helpbotClose.addEventListener("click", () => {
    helpbotWindow.classList.remove("active");
});


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message bot-message";

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    bubble.innerHTML = text;

    message.appendChild(bubble);

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


/* =========================================================
   BOT KNOWLEDGE
========================================================= */

function getBotResponse(question) {

    const q = question.toLowerCase().trim();


    /* HOW SEATSCOPE WORKS */

    if (
        q.includes("how does seatscope work") ||
        q.includes("how seat scope work") ||
        q.includes("how it works")
    ) {

        return `
            SeatScope helps students explore college and course
            options using their rank and counselling preferences.

            You enter your rank, category, seat type, course,
            location and counselling round.

            SeatScope then compares your rank with verified
            historical cutoff records and groups options as
            <strong>High Chance, Moderate or Ambitious</strong>.
        `;
    }


    /* HIGH CHANCE */

    if (
        q.includes("high chance") ||
        q.includes("high chance mean") ||
        q.includes("high chance means")
    ) {

        return `
            <strong>High Chance</strong> means your rank is
            historically more competitive than the relevant
            closing ranks in the available verified data.

            It is only a historical indication and
            <strong>not an admission guarantee</strong>.
        `;
    }


    /* MODERATE */

    if (
        q.includes("moderate") ||
        q.includes("moderate chance")
    ) {

        return `
            <strong>Moderate</strong> means your rank is relatively
            close to the historical closing rank in the available
            verified records.

            Actual allotment can change from year to year.
        `;
    }


    /* AMBITIOUS */

    if (
        q.includes("ambitious") ||
        q.includes("ambitious chance")
    ) {

        return `
            <strong>Ambitious</strong> means the historical closing
            rank was more competitive than your current rank.

            You may still include such options as aspirational
            choices, but SeatScope does not guarantee admission.
        `;
    }


    /* DREAM / REALISTIC / SAFE */

    if (
        q.includes("dream") ||
        q.includes("realistic") ||
        q.includes("safe") ||
        q.includes("choice list")
    ) {

        return `
            SeatScope's Choice-List Planner organizes options into:

            <br><br>

            <strong>Dream</strong> – Ambitious options<br>
            <strong>Realistic</strong> – Moderate options<br>
            <strong>Safe</strong> – High Chance options

            <br><br>

            This helps you build a more structured counselling
            choice list.
        `;
    }


    /* ADMISSION GUARANTEE */

    if (
        q.includes("guarantee") ||
        q.includes("guaranteed admission") ||
        q.includes("sure admission")
    ) {

        return `
            No. SeatScope does <strong>not</strong> guarantee
            admission.

            Its recommendations are based on verified historical
            cutoff information. Actual allotment depends on the
            counselling year, round, seat availability, category,
            competition and other official counselling rules.
        `;
    }


    /* CUTOFF */

    if (
        q.includes("cutoff") ||
        q.includes("cut off") ||
        q.includes("closing rank")
    ) {

        return `
            A cutoff is the rank information associated with seats
            allotted during a particular counselling process.

            SeatScope uses verified historical closing-rank data
            to provide historical indications for students.
        `;
    }


    /* COUNSELLING ROUND */

    if (
        q.includes("round") ||
        q.includes("counselling round")
    ) {

        return `
            The counselling round tells SeatScope which round of
            historical cutoff data to use.

            Depending on the available data, you can select options
            such as <strong>Round 1, Round 2, or Final / Extended
            Round</strong>.
        `;
    }


    /* CATEGORY */

    if (
        q.includes("category") ||
        q.includes("reservation category")
    ) {

        return `
            Category is one of the factors used when comparing your
            rank with historical cutoff records.

            Select the category that matches your counselling
            information. SeatScope uses the category terminology
            available in its verified source data.
        `;
    }


    /* OPN */

    if (
        q.includes("opn") ||
        q.includes("what is opn")
    ) {

        return `
            <strong>OPN</strong> is a category code appearing in
            some of the cutoff source data used by SeatScope.

            SeatScope displays source terminology as stored in the
            verified records rather than changing the meaning of
            the source code.
        `;
    }


    /* RANK */

    if (
        q.includes("rank") ||
        q.includes("my rank")
    ) {

        return `
            Enter your counselling rank in the Rank field.

            SeatScope compares your rank with relevant historical
            closing ranks from the selected course, category,
            seat type and counselling round.
        `;
    }


    /* MARGIN */

    if (
        q.includes("margin") ||
        q.includes("cutoff margin")
    ) {

        return `
            SeatScope uses:

            <br><br>

            <strong>Cutoff Margin = Historical Closing Rank − Your Rank</strong>

            <br><br>

            The margin helps indicate how your rank compares with
            the historical cutoff.
        `;
    }


    /* YEARS */

    if (
        q.includes("year") ||
        q.includes("years") ||
        q.includes("history") ||
        q.includes("historical")
    ) {

        return `
            SeatScope combines the available verified historical
            records for the selected counselling round.

            It does not treat historical data as a prediction or
            admission guarantee.
        `;
    }


    /* COLLEGE */

    if (
        q.includes("college") ||
        q.includes("colleges")
    ) {

        return `
            College results are generated from the cutoff records
            matching your selected course, category, seat type,
            counselling round and other filters.

            Where available, SeatScope also shows the source used
            for the historical cutoff information.
        `;
    }


    /* HOSTEL */

    if (
        q.includes("hostel")
    ) {

        return `
            Hostel preference can be used as one of your counselling
            preferences.

            Hostel availability itself should always be confirmed
            directly with the college because SeatScope does not
            treat historical information as a guarantee.
        `;
    }


    /* LOCATION */

    if (
        q.includes("location") ||
        q.includes("district")
    ) {

        return `
            You can use the location preference to narrow the
            college options shown by SeatScope.

            This can help you focus on colleges in locations that
            are suitable for you.
        `;
    }


    /* DATA */

    if (
        q.includes("data") ||
        q.includes("source") ||
        q.includes("verified")
    ) {

        return `
            SeatScope is designed to use verified historical
            cutoff records.

            Each record can retain information such as the source
            document, year, round, college, branch, category and
            closing rank.

            Always check the linked official source before making
            final counselling decisions.
        `;
    }


    /* HELP */

    if (
        q === "help" ||
        q.includes("what can you do") ||
        q.includes("what can i ask")
    ) {

        return `
            I can help explain:

            <br><br>

            • How SeatScope works<br>
            • High / Moderate / Ambitious<br>
            • Dream / Realistic / Safe choices<br>
            • Cutoffs and closing ranks<br>
            • Counselling rounds<br>
            • Categories and seat types<br>
            • Choice-list planning<br>
            • Historical data<br>
            • SeatScope's limitations
        `;
    }


    /* DEFAULT RESPONSE */

    return `
        I'm currently focused on helping with SeatScope and
        counselling-related questions.

        Try asking:

        <br><br>

        <strong>“How does SeatScope work?”</strong><br>
        <strong>“What does High Chance mean?”</strong><br>
        <strong>“What is a cutoff?”</strong><br>
        <strong>“What are Dream, Realistic and Safe choices?”</strong>
    `;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

function sendUserMessage() {

    const question = chatInput.value.trim();

    if (!question) {
        return;
    }


    addMessage(question, "user");

    chatInput.value = "";

    typingIndicator.classList.add("active");


    setTimeout(() => {

        const response = getBotResponse(question);

        typingIndicator.classList.remove("active");

        addMessage(response, "bot");

    }, 500);
}


/* =========================================================
   SEND BUTTON
========================================================= */

sendMessage.addEventListener("click", sendUserMessage);


/* =========================================================
   ENTER KEY
========================================================= */

chatInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        event.preventDefault();

        sendUserMessage();
    }

});


/* =========================================================
   QUICK QUESTIONS
========================================================= */

document.querySelectorAll(".quick-questions button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const question = button.dataset.question;

            chatInput.value = question;

            sendUserMessage();

        });

    });