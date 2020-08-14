import { User } from './user.mjs';
import * as UTILITIES from './utilities.mjs';
import * as DATA from './data.mjs'

var shownCourses = new Set();   // showing course search

var user = new User();


// load ajax for DOM in schedule.html
$(document).ready(function () {
    // enable jquery buttons
    enableSearch();
    enablePageNavigation();
    enableModal();
    enablePastCourseInput()
    
    // Set up search functionality
    populateMajors();
    populateMinors();
    populateCourses();

});

function enableSearch()
{
    console.log($('.search').not('#course-search'));

    $('.search').keyup( function(event) {
        var filter = $($(this).children('.search-bar')).val().toUpperCase();
        var content = $(this).find('li');

        console.log(event.which, filter);

        if ($(this).attr("id") != "course-search")
        {
            for (let ele of content)
            {
                if ($(ele).text().toUpperCase().includes(filter)) 
                {
                    $(ele).show();
                }
                else 
                {
                    $(ele).hide();
                }
            }
        }

        else
        {
            if (filter.length < 2) 
            {
                for (let ele of shownCourses) 
                {
                    $(ele).hide();
                }
                shownCourses.clear();
            }
            else if (filter.length == 2 || (event.which == 8 || event.which == 46) || !shownCourses.size) 
            {
                // console.log("add");
                for (let ele of content) 
                {
                    if ($(ele).attr('code').startsWith(filter)) 
                    {
                        $(ele).show();
                        shownCourses.add(ele);
                    }
                }
            }
            else 
            {
                for (let ele of content) 
                {
                    if (!$(ele).attr('code').startsWith(filter)) 
                    {
                        $(ele).hide();
                        shownCourses.delete(ele);
                    }
                }
            }
        }
    });

}

function enablePageNavigation()
{
    $("[page='0']").click( function() {
    });

    $(".prev").click( function() {
        var page = parseInt($(this).attr('page'), 10);
        var currPage = "step"+page;
        var prevPage = "step"+(page-1);

        $('#'+currPage).hide();
        $('#'+prevPage).show();
    });

    $(".next").click( function() {
        var page = parseInt($(this).attr('page'), 10);
        var currPage = "step"+page;
        var nextPage = "step"+(page+1);

        $('#'+currPage).hide();
        $('#'+nextPage).show();
    });

}


function enableModal()
{
    $("[modalBtn='open']").click( function()
    {
        console.log($(this).attr('modalID'));
        var modalID = "#"+$(this).attr('modalID');

        console.log(modalID);

        $(modalID).show();
        $(".prev").hide();
        $(".next").hide();
    });


    $("[modalBtn='close']").click( function()
    {
        var modalID = "#"+$(this).attr('modalID');

        $(modalID).hide();
        $(".prev").show();
        $(".next").show();
    });

    $(".modal-background").click( function(event)
    {
        if (event.target != this)
            return;

        $($(this).parent()).hide();

        $(".prev").show();
        $(".next").show();
    });
}

function enablePastCourseInput()
{
    $("#past-course-submit").click(function () 
    {
        var text = $("#past-course-input-box").val().toUpperCase();
        console.log(text);
        var scrapedCourses = text.match(/[A-Z]+\d+[A-Z]?/g);

        
        for (let courseCode of scrapedCourses)
        {
            var subjectCode = courseCode.match(/[a-zA-Z]+/g);

            if (DATA.subjects.get(subjectCode[0]) && DATA.subjects.get(subjectCode[0]).courses[courseCode])
            {
                if (!user.getCourse(courseCode))
                {
                    addPastCourse(courseCode);
                }
            }
        }

        var modalID = "#"+$(this).attr('modalID');

        $(modalID).hide();
        $(".prev").show();
        $(".next").show();
    });
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
                .text(name);

        var bold = $(document.createElement('div'))
            .text(programType)
            .css('-webkit-text-fill-color', '#E3F09B');

        if (programType == "BA")
        {
            bold.css('-webkit-text-fill-color', '#F79F79');
        }
        else if (programType == "BS")
        {
            bold.css('-webkit-text-fill-color', '#F7D08A');
        }

        button.append(bold);
        li.append(button);
        $("#major-search-content").append(li);
    }

    $("#major-search-content").children().click( function() {
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

        console.log(user);
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
                .text(name);


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
    });
};

function removePastCourse(courseCode)
{
    user.removeCourse(courseCode);
    $("#past-course-list").find("[code='"+courseCode+"']").remove();
    $("#course-search-content").find("div[code='"+courseCode+"']").removeClass('selected');
}

function addPastCourse(courseCode)
{
    var subjectCode = courseCode.match(/[a-zA-Z]+/g);
    user.addCourse(courseCode, DATA.subjects.get(subjectCode[0]).courses[courseCode], -1);

    var pastCourse = $(document.createElement('div'))
        .addClass('btn')
        .attr('code', courseCode)
        .text(courseCode);
    var remove = $(document.createElement('button'))
        .addClass('remove')
        .text('x');

    pastCourse.append(remove);
    $("#past-course-list").append(pastCourse);    
    $("#course-search-content").find("div[code='"+courseCode+"']").addClass('selected');       


    $(".remove").click( function() {
        var courseCode = $($(this).parent()).attr("code");
        removePastCourse(courseCode);
    });
}

function addSubstituteCourse(courseCode)
{
    
}

async function populateCourses()
{
    await DATA.loadCourses();

    for (let subject of DATA.subjects.values())
    {
        for (let [courseCode, courseContent] of Object.entries(subject.courses))
        {
            // console.log(courseCode, courseContent);
            var li = $(document.createElement('li'))
                .attr("code", courseCode)
                .hide();

            var button = $(document.createElement('div'))
                    .addClass("btn full")
                    .attr("code", courseCode)
                    .attr("name", courseContent.name)
                    .attr("credits", courseContent.credits)
                    .attr("semester", courseContent.semester)
                    .attr("prerequisite", courseContent.prerequisite)
                    .attr("restriction", courseContent.restriction)
                    .attr("alias", courseContent.alias)
                    .text(courseCode.trim());
            

            li.append(button);
            $("#course-search-content").append(li);
        }
    }

    console.log("courses loaded");

    $("#course-search-content").children().click( function() {
        if ($("#past-course-list").is(':visible'))
        {
            var button = $(this).children()[0];
            var courseCode = $(button).attr("code");

            if (!user.getCourse(courseCode))
            {
                addPastCourse(courseCode);
            }
            else
            {
                removePastCourse(courseCode);
            }
        } 
        else 
        {
            var button = $(this).children()[0];
            var courseCode = $(button).attr("code");

            if (!user.getCourse(courseCode))
            {
                addPastCourse(courseCode);
            }
            else
            {
                removePastCourse(courseCode);
            }
        } 
        
    });
}

