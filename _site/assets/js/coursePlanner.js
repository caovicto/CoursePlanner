var majors = new Array();   // all avaiable majors files
// var user.majors = new Array();   // files names for requiested majors

var minors = new Array();   // all avaiable minor files
// var user.minors = new Array();   // files names for requested minor

var requirements = new Map();   // program name to extracted json requirements
var requirementsLoaded = false;

var user = {
    'majors': new Array(),
    'minors': new Array(),
    'requirements': new Map(),
    'pastCourses': new Set(),
    'addedCourses': new Set()
};

var shownCourses = new Set();   // showing course search

var courses = new Map();    // map of all courses
var coursesLoaded = false;


// load courses while user is choosing major/minor
loadCourses();



// load ajax for DOM in schedule.html
$(document).ready(function () {
    // Set up search functionality
    searchFunction();
    
    // MAJOR SELECTION
    loadMajorFunctions();

    // MINOR SELECTION
    loadMinorFunctions();

    // PAST COURSES
    loadPastCoursesFunctions();

});



// Helper functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function searchFunction()
{
    $('.search').not('#past-course-search').keyup(function (event) 
    {
        // console.log(this, "key up ", event.which)
        var filterList = $(this).parent().children('ul')[0];
        var listElements = $(filterList).children('li');
        var filter = $(this).val().toUpperCase();

        for (let course of listElements) 
        {
            if ($(course).text().toUpperCase().includes(filter)) 
            {
                $(course).show();
            }
            else {
                $(course).hide();

            }
        }
    });

    $('.search, #past-course-search').keyup(function (event) 
    {
        if ($("#past-course-search").is(':visible'))
        {
            // console.log(this, "key up ", event.which)
            var filterList = $(this).parent().children('ul')[0];
            var listElements = $(filterList).children('li');
            var filter = $(this).val().toUpperCase();

            if (filter.length < $(this).attr("filterMin")) 
            {
                // console.log("no filter");
                for (let course of shownCourses) 
                {
                    $(course).hide();
                }

                shownCourses.clear();
            }
            else if (filter.length == $(this).attr("filterMin") || (event.which == 8 || event.which == 46) || !shownCourses.size) 
            {
                // console.log("add");
                for (let course of listElements) 
                {
                    if ($(course).attr('id').startsWith(filter)) 
                    {
                        $(course).show();
                        shownCourses.add(course);
                    }
                }
            }
            // filter
            else 
            {
                // console.log("remove");
                for (let course of shownCourses) 
                {
                    if (!$(course).attr('id').startsWith(filter)) 
                    {
                        $(course).hide();
                        shownCourses.delete(course);
                    }
                }
            }
        }
       
    });
}


function topFunction() 
{
    $('html, body').animate({
        scrollTop: $("#schedule-content").offset().top
    });
}

function loadMajorFunctions()
{
    $.ajax({
        url: "assets/data/majors",
        success: function (data) 
        {
            $(data).find("td > a").each(function () 
            {
                var file = $(this).attr("href");

                if (file.includes(".json")) 
                {
                    majors.push(file);

                    var index = majors.length - 1;
                    var name = majors[index];
                    name = name.replace(/_/g, " ");
                    name = name.replace(".json", "");

                    $("#major-list").append(
                        "<li><button class='major-button' id='" + index + "'>" + name + "</button></li>"
                    );
                }

            });
        },
        complete: function () 
        {
            $(".major-button").click(function () 
            {
                const majorID = $(this).attr("id");
                const index = user.majors.indexOf(majorID);
                console.log(index, majors[majorID]);

                if (index > -1) 
                {
                    user.majors.splice(index, 1);
                    $(this).removeClass("chosen");
                }
                else 
                {
                    user.majors.push(majorID);
                    $(this).addClass("chosen");
                }
                console.log("majors", user.majors);
            });
        }
    });


    $("#step1-next").click(function () 
    {
        if (!user.majors.length) {
            alert("Choose a major");
        }
        else {
            $("#step1").hide();
            $("#step2").show();

            topFunction();
        }
    });
}

function loadMinorFunctions()
{
    $.ajax({
        url: "assets/data/minors",
        success: function (data) {
            $(data).find("td > a").each(function () 
            {
                var file = $(this).attr("href");

                if (file.includes(".json")) {
                    minors.push(file);

                    var index = minors.length - 1;
                    var name = minors[index];
                    name = name.replace(/_/g, " ");
                    name = name.replace(".json", "");

                    $("#minor-list").append(
                        "<li><button class='minor-button' id='" + index + "'>" + name + "</button></li>"
                    );
                }
            });
        },
        complete: function () {
            $(".minor-button").click(function () 
            {
                const minorID = $(this).attr("id");
                const index = user.minors.indexOf(minorID);
                console.log(index, minors[minorID]);

                if (index > -1) {
                    user.minors.splice(index, 1);
                    $(this).removeClass("chosen");
                }
                else {
                    user.minors.push(minorID);
                    $(this).addClass("chosen");
                }
                console.log("minors", user.minors);
            });
        }
    });

    $("#step2-back").click(function () 
    {
        $("#step2").hide();
        $("#step1").show();

        topFunction();
    });

    $("#step2-next").click(function () 
    {
        addRequirements();

        $("#step2").hide();
        $("#step3").show();

        topFunction();
    });
}

function loadPastCoursesFunctions()
{
    $("#past-courses-submit").click(function () 
    {
        var text = $("#course-input").val().toUpperCase();

        console.log(text);
        var scrapedCourses = text.match(/[A-Z]+\d+[A-Z]?/g);
        console.log(scrapedCourses);
        addPastCourses(scrapedCourses);
    });

    $("#step3-back").click(function () 
    {
        removeRequirements();

        $("#step3").hide();
        $("#step2").show();

        topFunction();
    });

    $("#step3-next").click(function () 
    {
        $("#step3").hide();
        $("#step4").show();

        topFunction();
    });
}



// load courses
async function loadCourses() 
{
    // load courses
    var relPath = "assets/data/courses/";
    var courseFiles = await loadCourseFiles(relPath);
    var files = $(courseFiles).find("td > a");

    for (var i = 1; i < files.length; i++) 
    {
        var file = $(files[i]).attr("href");
        await loadCourse(relPath + file);
    }

    // fill past-course selector div
    for (let subject of courses.values()) 
    {
        // console.log(subject.courses);
        Object.keys(subject.courses).forEach(function (key) 
        {
            var name = subject.courses[key].name;

            $("#add-past-course").append(
                "<li id='" + key + "' style='display: none'><button class='past-course-button' id='" + key + "'>" + key + "\t" + name + "</button></li>"
            );
        });
    }

    coursesLoaded = true;
    console.log("loaded all courses");

    $(".past-course-button").click(function () 
    {
        console.log("chose course ", $(this).attr("id"));
        addPastCourse($(this).attr("id"));
    });

}

async function loadCourseFiles(relPath) 
{
    return $.ajax({
        url: relPath,
        success: function (data) 
        {
        },
        error: function (data) 
        {
            console.log("Cannot load courses");
        }
    });
}


async function loadCourse(file) 
{
    return $.ajax({
        url: file,
        type: 'GET',
        dataType: 'json',
        success: function (data) 
        {
            courses.set(data.code, data);
        },
        error: function (error) 
        {
            console.log(error);
        }
    });

}

async function addPastCourses(scrapedCourses) 
{
    for (var i = 0; i < scrapedCourses.length; i++) 
    {
        var course = scrapedCourses[i].toUpperCase();
        await addPastCourse(course);
    }

}

async function addPastCourse(course) 
{
    const result = await getCourse(course);

    if (result && !user.pastCourses.has(course)) 
    {
        user.pastCourses.add(course);
        $("#past-course-list").append(
            "<div class='past-course' id='" + course + "'>" + course + "<button class='remove' id='" + course + "'>X</button></div>"
        )

        while (!requirementsLoaded)
        {
            await sleep(500);
        }

        $("button[id='"+course+"'][class='course-button']").addClass("chosen")
            .attr("pastCourse", "true");
    }


    $(".remove").click(function () 
    {
        var code = $(this).attr("id");
        console.log("remove from past courses ", code, user.pastCourses);
        $(this).parent().remove();
        user.pastCourses.delete(code);

        $("button[id='"+course+"]'").removeClass("chosen")
            .removeAttr("pastCourse");
    });
}


async function getCourse(code) 
{
    var subjectCode = code.match(/[a-zA-Z]+/g);
    if (subjectCode.length && courses.get(subjectCode[0]) && courses.get(subjectCode[0]).courses[code]) 
    { 
        return courses.get(subjectCode[0]).courses[code];
    }

    return null;
}



// REQUIREMENTS
async function removeRequirements()
{
    user.requirements.clear();
    $("#requirements").empty();
}

async function addRequirements() 
{
    // gather programs
    var programFiles = [];
    for (let major of user.majors) 
    {
        programFiles.push("assets/data/majors/" + majors[major])
    }
    for (let minor of user.minors) 
    {
        programFiles.push("assets/data/minors/" + minors[minor])
    }

    // load programs from file
    for (let file of programFiles) 
    {
        await loadProgram(file);
    }

    // load user requirement
    await loadUserRequirements();

    // add all user requirements to div
    await addUserRequirements();

    // enable buttons
    enableCourseButtons();

    requirementsLoaded = true;

}

async function loadProgram(file) 
{
    var name = file;
    var name = name.replace(".json", "");
    name = name.match(/[A-Z].*/g, "")[0];

    return $.ajax({
        url: file,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(name);
            requirements.set(name, data.requirement);
        },
        error: function (error) {
            console.log(error);
        }
    });

}

async function loadUserRequirements() 
{
    // load all requirements
    for (let program of requirements.values()) 
    {
        for (let requirement of program) 
        {
            if (!requirement.name.includes("University Residency") && 
                !requirement.name.includes("University Diversity Distribution") && 
                !requirement.name.includes("GPA"))
                user.requirements.set(requirement.name, requirement.requirement);
        }
        // console.log(user.requirements);
    }
}

async function checkValidCourses(courseList)
{
    var valid = false;

    for (let course of courseList)
    {
        valid = valid || Boolean(await getCourse(course) != null);

        if (valid)
            return true;
    }

    return valid;
}

async function addUserRequirements()
{
    while (!coursesLoaded)
    {
        await sleep(500);
    }

    for (let [key, value] of  user.requirements.entries()) 
    {
        var reqElement = $(document.createElement('div'))
            .attr("id", key)
            .text(key)
            .attr("class", "selector")
            .css("max-height", "100%");

        for (var setID = 0; setID < value.length; setID++) 
        {
            var set = value[setID];
            var setElement = $(document.createElement('ul'))
                .attr("id", setID)
                .text("Set "+setID);

            for (let courses of set) 
            {
                setElement.attr("type", courses.type)
                    .attr("number", courses.number);

                if (await checkValidCourses(courses.courses))
                {
                    for (let course of courses.courses)
                    {
                        var courseButton = await createCourseButton(course);
                        setElement.append(courseButton);
                    }
                }
                else
                {
                    var text = courses.courses.join(" ");
                    var courseButton = await createCourseButton(text);
                    setElement.append(courseButton);
                }

            }

            reqElement.append(setElement);
        }

        if (reqElement.find('button').length !== 0)
            $("#requirements").append(reqElement);
    }

   
}

function capitalize(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function createCourseButton(code)
{
    code = code.trim();
    
    var li = $(document.createElement('li'));
    li.attr("id", code);

    var button = $(document.createElement('button'))
        .attr("class", "course-button")
        .attr("id", code)
        .text(capitalize(code));

    var course = await getCourse(code);
    
    if (course) 
    {
        button.attr("name", course.name)
            .attr("credits", course.credits)
            .attr("description", course.description)
            .attr("semester", course.semester)
            .attr("prerequisite", course.prerequisite);
    }

    li.append(button);
    return li;
}

function enableCourseButtons()
{
    $(".course-button").click(function () 
    {
        if (!$(this).attr("pastCourse") && $(this).attr("id").length < 50)
        {
            const courseCode = $(this).attr("id");

            if (user.addedCourses.has(courseCode))
            {
                user.addedCourses.delete(courseCode);
                $("button[id='"+courseCode+"']").removeClass("chosen");
            }
            else
            {
                user.addedCourses.add(courseCode);
                $("button[id='"+courseCode+"']").addClass("chosen");            
            }
    
            console.log("courses", user.addedCourses);
        }
    });

}




