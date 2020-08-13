var majors = new Array();
var userMajors = new Array();

var minors = new Array();
var userMinors = new Array();

var requirements = new Map();
var userRequirements = new Map();    // filtered map of requirements

var pastCourses = new Set();
var shownCourses = new Set();

var courses = new Map();


loadCourses();


$(document).ready(function() {
    // SEARCH BOX

    //setup before functions
    $('.search').not('#past-course-search').keyup(function( event ) {
        console.log(this, "key up ", event.which)
        var filterList = $(this).parent().children('ul')[0];
        var listElements = $(filterList).children('li');
        var filter = $(this).val().toUpperCase();
    
        for (let course of listElements)
        {
            if ($(course).text().toUpperCase().includes(filter))
            {   
                $(course).show();
            }
            else
            {
                $(course).hide();

            }
        }
    });

    $('.search, #past-course-search').keyup(function( event ) {
        console.log(this, "key up ", event.which)
        var filterList = $(this).parent().children('ul')[0];
        var listElements = $(filterList).children('li');
        var filter = $(this).val().toUpperCase();
    
        if (filter.length < $(this).attr("filterMin"))
        {
            console.log("no filter");
            for (let course of shownCourses)
            {
                $(course).hide();
            }
    
            shownCourses.clear();
        }
        else if (filter.length == $(this).attr("filterMin") || (event.which == 8 || event.which == 46) || !shownCourses.size)
        {
            console.log("add");
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
            console.log("remove");
            for (let course of shownCourses)
            {
                if (!$(course).attr('id').startsWith(filter))
                {   
                    $(course).hide();
                    shownCourses.delete(course);
                }
            }
        }
    });

    // MAJOR SELECTION
    $.ajax({
        url: "assets/data/majors",
        success: function(data){
            $(data).find("td > a").each(function(){
                
                var file = $(this).attr("href");
    
                if (file.includes(".json"))
                {
                    majors.push(file);
    
                    var index = majors.length - 1; 
                    var name = majors[index];
                    name = name.replace(/_/g, " ");
                    name = name.replace(".json", "");
        
                    $("#major-list").append(
                        "<li><button class='major-button' id='"+index+"'>"+name+"</button></li>"
                    );
                }
                
            });
         },
         complete: function(){
            $(".major-button").click( function() {
                const majorID = $(this).attr("id");
                const index = userMajors.indexOf(majorID);
                console.log(index, majors[majorID]);

            
                if (index > -1)
                {
                    userMajors.splice(index, 1);
                    $(this).css('background-color', 'lightgrey');
                }
                else 
                {
                    userMajors.push(majorID);
                    $(this).css('background-color', 'lightgreen');
                }

                console.log("majors", userMajors);
            });


         }
    });


    $("#step1-next").click( function() {
        if (!userMajors.length){
            alert("Choose a major");
        }
        else
        {
            var relPath = "assets/data/majors/";
            var programFiles = [];
            for (let major in userMajors)
            {
                programFiles.push(relPath+majors[major])
            }

            addRequirements(programFiles);

            $("#step1").hide();
            $("#step2").show();

            topFunction();
        }
    });



    // MINOR SELECTION
    $.ajax({
        url: "assets/data/minors",
        success: function(data){
            $(data).find("td > a").each(function(){
                
                var file = $(this).attr("href");
    
                if (file.includes(".json"))
                {
                    minors.push(file);
    
                    var index = minors.length - 1; 
                    var name = minors[index];
                    name = name.replace(/_/g, " ");
                    name = name.replace(".json", "");
        
                    $("#minor-list").append(
                        "<li><button class='minor-button' id='"+index+"'>"+name+"</button></li>"
                    );
                }

                
            });
         },
         complete: function(){
            $(".minor-button").click( function() {
                const minorID = $(this).attr("id");
                const index = userMinors.indexOf(minorID);
                console.log(index, minors[minorID]);
            
                if (index > -1)
                {
                    userMinors.splice(index, 1);
                    $(this).css('background-color', 'lightgrey');
                }
                else 
                {
                    userMinors.push(minorID);
                    $(this).css('background-color', 'lightgreen');
                }

                console.log("minors", userMinors);
            });


         }
    });

    $("#step2-back").click( function() {
        var programFiles = [];
        for (let major in userMajors)
        {
            programFiles.push(majors[major])
        }

        removeRequirements(programFiles);

        $("#step2").hide();
        $("#step1").show();

        topFunction();
    });

    $("#step2-next").click( function() {
        var programFiles = [];
        for (let minor in userMinors)
        {
            programFiles.push(minors[minor])
        }

        addRequirements(programFiles);
        
        $("#step2").hide();
        $("#step3").show();

        topFunction();
    });

    // PAST COURSES
    // LOAD Available courses
    
    $("#past-courses-submit").click(function() {
        var text = $("#course-input").val().toUpperCase();

        console.log(text);
        var scrapedCourses = text.match(/[A-Z]+\d+[A-Z]?/g);
        console.log(scrapedCourses);
        addPastCourses(scrapedCourses);   
    });

    $("#step3-back").click( function() {
        var programFiles = [];
        for (let minor in userMinors)
        {
            programFiles.push(minors[minor])
        }

        removeRequirements(programFiles);

        $("#step3").hide();
        $("#step2").show();

        topFunction();
    });

    $("#step3-next").click( function() {
        $("#step3").hide();
        $("#step4").show();

        topFunction();
    });



});



// Helper functions

function topFunction() 
{
    $('html, body').animate({
        scrollTop: $("#schedule-content").offset().top
    });
}


async function loadCourses()
{
    // load courses
    var relPath = "assets/data/courses/";
    var courseFiles = await getCourses(relPath);
    var files = $(courseFiles).find("td > a");

    for (var i = 1; i < files.length; i++)
    {
        var file = $(files[i]).attr("href");
        await loadCourse(relPath+file);
    }

    // fill past-course selector div
    for (let subject of courses.values())
    {
        // console.log(subject.courses);
        Object.keys(subject.courses).forEach(function(key) {
            var name = subject.courses[key].name;

            $("#add-past-course").append(
                "<li id='"+key+"' style='display: none'><button class='past-course-button' id='"+key+"'>"+key+"\t"+name+"</button></li>"
            );
        });
    }

    console.log("loaded all courses");

    $(".past-course-button").click(function() {
        console.log("chose course ", $(this).attr("id"));
        addPastCourse($(this).attr("id"));
    });

}

async function getCourses(relPath){
    return $.ajax({
        url: relPath,
        success: function(data){

        },
        error: function(data){
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
        success: function(data){
            courses.set(data.code, data);
        },
        error: function(error){
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
    await checkCourse(course).then( (result) => {
        if (result && !pastCourses.has(course))
        {
            pastCourses.add(course);
            $("#past-course-list").append(
                "<div class='past-course' id='"+course+"'>"+course+"<button class='remove' id='"+course+"'>X</button></div class='course'>"
            )
        }
    });  

    $(".remove").click( function(){
        var code = $(this).attr("id");
        console.log("remove from past courses ", code, pastCourses);
        $(this).parent().remove();
        pastCourses.delete(code);
    });
}


async function checkCourse(code)
{
    var subjectCode = code.match(/[a-zA-Z]+/g);
    if (subjectCode.length)
    {
        subjectCode = subjectCode[0];
        
        if (courses.get(subjectCode) && courses.get(subjectCode).courses[code])
        {
            return true;
        }
    }
    
    return false;
}



// REQUIREMENTS
async function addRequirements(programFiles)
{
    for (let file of programFiles)
    {
        await loadProgram(file);
    }

    await loadUserRequirements();

    for (let requirement of userRequirements.keys())
    {
        var reqElement = $(document.createElement('div'));
        reqElement.attr("id", requirement);
        reqElement.attr("innerHTML", requirement);

        for (let set in userRequirements[requirement].values())
        {
            var reqElement = $(document.createElement('ul'));
            reqElement.attr("id", requirement);

            for (let courses in set.courses)
            {

            }
        }
    }


    console.log(userRequirements);
}

async function loadProgram(file) 
{
    var name = file.replace(".json", "");
    name = name.match(/[A-Z].*/g, "")[0];

    return $.ajax({
        url: file,
        type: 'GET',
        dataType: 'json',
        success: function(data){
            console.log(name);
            requirements.set(name, data.requirement);
        },
        error: function(error){
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
            userRequirements.set(requirement.name, requirement.requirement);
        }
    }
}



