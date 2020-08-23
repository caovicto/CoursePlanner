import { User } from './src/user.mjs';
import * as UTILITIES from './src/utilities.mjs';
import * as DATA from './src/data.mjs';
import * as ENABLE from './src/enable.mjs';


export var user = new User();


// load ajax for DOM in schedule.html
$(document).ready(function () {
    // enable jquery buttons
    ENABLE.search();
    ENABLE.pageNavigation();
    ENABLE.modal();
    ENABLE.pastCourseInput();
    ENABLE.semesterInfoInput();
    
    // Set up search functionality
    populateMajors();
    populateMinors();
    populateCourses();

});





async function populateMajors()
{
    await DATA.loadMajors();

    for (let major of DATA.majors.keys())
    {
        var programType = major.substring(major.lastIndexOf("_")+1).trim();
        var name = major.substring(0, major.lastIndexOf("_")).replace(/_/g, " ").trim();

        var li = $(document.createElement('li'));

        var button = $(document.createElement('div'))
                .addClass("btn full")
                .attr("key", major)
                .append( await UTILITIES.createText(name));

        var bold = $(await UTILITIES.createText(programType))
            .css('-webkit-text-fill-color', '#E3F09B')
            .css('margin-left', '1vw');

        if (programType == "BA")
        {
            $(bold).css('-webkit-text-fill-color', '#F79F79');
        }
        else if (programType == "BS")
        {
            $(bold).css('-webkit-text-fill-color', '#F7D08A');
        }

        $(li).append(button);
        $(button).append(bold);
        $("#major-search-content").append(li);
    }

    $("#major-search-content").children().click( async function() {
        var button = $(this).children('.btn')[0];
        var major = $(button).attr("key");
        console.log($(this), major, DATA.majors.get(major));

        if (user.getProgram(major))
        {
            $(button).removeClass('selected');
            user.removeProgram(major);
        }
        else
        {
            $(button).addClass('selected');
            user.addProgram(major, DATA.majors.get(major));
        }

        populateRequirements();
    });
};


async function populateMinors()
{
    await DATA.loadMinors();

    for (let minor of DATA.minors.keys())
    {
        var name = minor.substring(0, minor.lastIndexOf("_")).replace(/_/g, " ").trim();

        var li = $(document.createElement('li'));
        var button = $(document.createElement('div'))
                .addClass("btn full")
                .attr("key", minor)
                .append(await UTILITIES.createText(name));


        li.append(button);
        $("#minor-search-content").append(li);
    }

    $("#minor-search-content").children().click( function() {
        var button = $(this).children()[0];
        var minor = $(button).attr("key");
        console.log($(this), minor, DATA.minors.get(minor));

        if (user.getProgram(minor))
        {
            $(button).removeClass('selected');
            user.removeProgram(minor);
        }
        else
        {
            $(button).addClass('selected');
            user.addProgram(minor, DATA.minors.get(minor));
        }

        populateRequirements();
    });
};


async function populateCourseSearch()
{
    for (let subject of DATA.subjects.values())
    {
        for (let [courseCode, courseContent] of Object.entries(subject.courses))
        {
            var li = $(document.createElement('li'))
                .attr("code", courseCode)
                .hide();

            var button = await UTILITIES.createCourseButton(courseCode);
            $(button).addClass("full");
            
            li.append(button);
            $("#course-search-content").append(li);
        }
    }

    return;
}

async function populateCourses()
{
    await DATA.loadCourses();

    await populateCourseSearch();

    console.log("courses loaded");

    ENABLE.courseSearchSelect();
    ENABLE.courseInfo();
}

/// getting all requirements

async function autoSelect(condition)
{
    var number = parseInt($(condition).attr('number'), 10);
    var courses = $(condition).find("li[code!='substitute']");
    // console.log(condition, number, courses);
    if ($(condition).attr('type') == 'course' && courses.length == number)
    {
        courses.addClass('selected');
    }
    else 
    {
        var totalCredits = 0;

        for (let course of courses)
        {
            totalCredits += parseInt($(course).attr('credits'));
        }

        if (totalCredits == number)
        {
            courses.addClass('selected');
        } 
    }
}


async function populateRequirements()
{
    var requirements = await user.getRequirements();
    $('#requirement-list').empty();

    for (let requirement of requirements)
    {
        var reqDiv = await  UTILITIES.createRequirementDiv(requirement);
        $('#requirement-list').append( reqDiv );
    }

    ENABLE.courseInfo();
    ENABLE.requirementCourses();  
}


