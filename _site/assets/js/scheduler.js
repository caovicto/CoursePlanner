import { User } from './src/user.mjs';
import * as UTILITIES from './src/utilities.mjs';
import * as ENABLE from './src/enable.mjs';
import * as DATA from './src/data.mjs';
import { subjects } from './src/data.mjs';

export var user = new User();


// load ajax for DOM in schedule.html
$(document).ready(async function () {
    DATA.loadCourses().then ( function() {
        // disclaimer
        disclaimer();

        // enable jquery buttons
        ENABLE.search();
        ENABLE.pageNavigation();
        ENABLE.modal();
        ENABLE.pastCourseInput();
        ENABLE.prerequisiteInfoInput();
        ENABLE.semesterInfoInput();
        ENABLE.print()
        
        // Set up search functionality
        populateMajors();
        populateMinors();
        populateCourses();
    });
});

function disclaimer()
{
    $("#disclaimer-agreement").click( function() {
        $("#schedule-content").show();
        $("#disclaimer").slideUp(500);
    })
}



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

        // populateRequirements();
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

        // populateRequirements();
    });
};


async function populateCourseSearch()
{
    for (let subject of DATA.subjects.values())
    {
        for (let courseCode of subject.get('courses').keys())
        {
            var li = $(document.createElement('li'))
                .attr("code", courseCode)
                .hide();

            var button = await UTILITIES.createCourseButton(courseCode);
            $(button).addClass("full");
            
            li.append(button);
            $(li).click( function() { ENABLE.courseSearchSelect(this); });
            $("#course-search-content").append(li);
        }
    }

    return;
}

async function populateCourses()
{
    await populateCourseSearch();

    console.log("courses loaded");

    // ENABLE.courseSearchSelect();
    ENABLE.courseInfo();

}






