function toggleBoxes() {
    var urlParams = new URLSearchParams(window.location.search);
    var selectedValue = urlParams.get('designation');
    var row1 = document.getElementById("row1");
    var row2 = document.getElementById("row2");
    var row3 = document.getElementById("row3");
    var box1 = document.getElementById("box1");
    var box2 = document.getElementById("box2");
    var box3 = document.getElementById("box3");
    var box4 = document.getElementById("box4");
    var box5 = document.getElementById("box5");
    var box6 = document.getElementById("box6");
    if (selectedValue === "option1") {
        row1.style.display = "flex";
        row2.style.display = "flex";
        row3.style.display = "flex";

    } else if (selectedValue === "option2") {
        box1.style.display = "flex";
        box2.style.display = "flex";
        box3.style.display = "flex";
        box4.style.display = "none";
        box5.style.display = "none";
        box6.style.display = "flex";

    } else if (selectedValue === "option3") {
        box1.style.display = "flex";
        box2.style.display = "none";
        box3.style.display = "flex";
        box4.style.display = "none";
        box5.style.display = "flex";
        box6.style.display = "flex";
    }

}

function signin() {
    var selectedValue = document.getElementById("dropdown").value;
    window.location.href = "index.html?designation=" + encodeURIComponent(selectedValue);
}

document.addEventListener("DOMContentLoaded", function () {
    toggleBoxes();
});

/* function toggleBoxes() {
    var urlParams = new URLSearchParams(window.location.search);
    var selectedValue = urlParams.get('designation');
    var row1 = document.getElementById("row1");
    var row2 = document.getElementById("row2");
    var row3 = document.getElementById("row3");
    var box1 = document.getElementById("box1");
    var box2 = document.getElementById("box2");
    var box3 = document.getElementById("box3");
    var box4 = document.getElementById("box4");
    var box5 = document.getElementById("box5");
    var box6 = document.getElementById("box6");
    if (selectedValue === "option1") {
        row1.style.display = "flex";
        row2.style.display = "flex";
        row3.style.display = "flex";

    } else if (selectedValue === "option2") {
        box1.style.display = "flex";
        box2.style.display = "flex";
        box3.style.display = "none";
        box4.style.display = "flex";
        box5.style.display = "none";
        box6.style.display = "flex";

    } else if (selectedValue === "option3") {
        box1.style.display = "none";
        box2.style.display = "none";
        box3.style.display = "none";
        box4.style.display = "flex";
        box5.style.display = "flex";
        box6.style.display = "flex";
    }

}

function signin() {
    var selectedValue = document.getElementById("dropdown").value;
    window.location.href = "newindex.html?designation=" + encodeURIComponent(selectedValue);
}

document.addEventListener("DOMContentLoaded", function () {
    toggleBoxes();
}); */