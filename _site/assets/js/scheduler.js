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

        if (modalID == "#course-info")
        {
            $(modalID).find('table').remove();

            var courseCode = $(modalID).attr("code");
            console.log(DATA.createTable(courseCode));
            $(DATA.createTable(courseCode)).insertAfter($(modalID).find('.modal-header'));
        }

        $(modalID).show();

        $(".prev").hide();
        $(".next").hide();
    });


    $("[modalBtn='close']").click( function()
    {
        var modalID = "#"+$(this).attr('modalID');

        $(modalID).hide();

        if ($(".modal").is(":visible"))
            return; 

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
            var course = DATA.getCourse(courseCode);

            if (course)
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

        populateRequirements();
    });
};

function removePastCourse(courseCode)
{
    user.removeCourse(courseCode);
    $("#past-course-list").find("li[code='"+courseCode+"']").remove();
    $("#course-search-content").find("li[code='"+courseCode+"']").removeClass('selected');
}

function addPastCourse(courseCode)
{
    var course = DATA.getCourse(courseCode);
    user.addCourse(courseCode, course, -1);

    var pastCourse = $(document.createElement('li'))
        .attr("code", courseCode);

    var button = $(document.createElement('div'))
        .addClass('btn')
        .attr('code', courseCode)
        .text(courseCode);        

    var remove = $(document.createElement('button'))
        .addClass('remove')
        .text('x');

    pastCourse.append(button);
    button.append(remove);
    $("#past-course-list").append(pastCourse);    
    $("#course-search-content").find("div[code='"+courseCode+"']").addClass('selected');       


    $(".remove").click( function() {
        var courseCode = $($(this).parent()).attr("code");
        removePastCourse(courseCode);
    });
}

function enableInfo()
{
    $(".info").click( function(event) {
        console.log("clicky");
        $("#course-info").attr("code", $($(this).parent()).attr("code"));
        enableModal();

        event.stopPropagation();
    });
}

async function createCourseButton(courseCode)
{
    courseCode = courseCode.trim();
    
    var button = $(document.createElement('div'))
        .attr("class", "btn")
        .text(UTILITIES.capitalize(courseCode));

        console.log(courseCode);

    if (courseCode != "+")
        var course = DATA.getCourse(courseCode);
    
    if (course) 
    {
        button.attr("code", courseCode)
            .attr("name", course.name)
            .attr("credits", course.credits)
            .attr("semester", course.semester)
            .attr("prerequisite", course.prerequisite)
            .attr("restriction", course.restriction)
            .attr("alias", course.alias);

        var info = $(document.createElement('div'))
            .addClass("info")
            .attr("modalID", "course-info")
            .attr("modalBtn", "open")
            .text("?");

        button.append(info);
    }

    return button;
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

            var button = await createCourseButton(courseCode);
            $(button).addClass("full");
            // console.log($(button).text())
            

            li.append(button);
            $("#course-search-content").append(li);
        }
    }

    console.log("courses loaded");

    $("#course-search-content").children().click( function(event) {
        if ($("#past-course-list").is(':visible') && event.target == this)
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

    enableInfo();
}


async function checkValidCourses(courseList)
{
    var valid = false;

    for (let course of courseList)
    {
        valid = valid || Boolean(await DATA.getCourse(course) != null);

        if (valid)
            return true;
    }

    return valid;
}

function enableAddNewCourse()
{
    $("#requirement-list").find("li").click( function() {
        var courseCode = $(this).attr("code");

        if (courseCode != "substitute")
        {
            if (user.getCourse(courseCode))
            {
                user.removeCourse(courseCode);
                $(this).find('.btn').removeClass('selected');
            }
            else
            {
                var course = DATA.getCourse(courseCode);
                if (course)
                {
                    user.addCourse(courseCode, course);
                    $(this).find('.btn').addClass('selected');
                }
                else 
                {
                    alert("Course does not exist within MSU Course Descriptions as of 8/13/20");
                }
            }
        }
        else 
        {
            var courseButton = $("li[code='"+courseCode+"']").clone().show();
            $(courseButton).find('div').removeClass('full');

            setElement.append(courseButton);

            $("#course-search-content").find("div[code='"+courseCode+"']").addClass('selected');    
        }

      

        console.log(user);

    });    
}

function enableAddSubstitute()
{
    $()
}

async function populateRequirements()
{
    await user.buildRequirements();

    for (let [key, value] of  user.requirements.entries()) 
    {
        var reqElement = $(document.createElement('div'))
            .addClass("requirement-container")
            .attr("id", key)
            .css("max-height", "100%")
            .append(    function() {
                return $(document.createElement('h5')).text(key);  
            });

        for (var setID = 0; setID < value.length; setID++) 
        {

            var set = value[setID];
            var setElement = $(document.createElement('ul'))
                .attr("id", setID)
                .append(    function() {
                    return $(document.createElement('h5')).text("Set "+setID);  
                });


            for (let courses of set) 
            {
                setElement.attr("type", courses.type)
                    .addClass("search-content set-container")
                    .attr("number", courses.number);

                if (await checkValidCourses(courses.courses))
                {
                    var li = $(document.createElement('li'))
                        .attr("code", "substitute")
                        .css("background-color", "lightgreen");

                    var addButton = await createCourseButton("Substitute +");
                    
                    $(addButton).attr("set", setID)
                        .attr("requirement", key);
                        
                    li.append(addButton);
                    setElement.append(li);

                    for (let courseCode of courses.courses)
                    {
                        try
                        {
                            var courseButton = $("li[code='"+courseCode+"']").clone().show();
                            $(courseButton).find('div').removeClass('full');

                            setElement.append(courseButton);
                        }
                        catch (error)
                        {
                            var courseButton = await createCourseButton(courseCode);

                            setElement.append(courseButton);
                        }
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

        if (reqElement.find('div').length !== 0)
        {
            $("#requirement-list").append(reqElement);
        }
    }

    enableInfo();
    enableAddNewCourse();
}

