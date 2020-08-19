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

function next()
{
    var page = parseInt($(this).attr('page'), 10);
    var currPage = "step"+page;
    var nextPage = "step"+(page+1);

    $('#'+currPage).hide();
    $('#'+nextPage).show();
}

function prev()
{
    var page = parseInt($(this).attr('page'), 10);
    var currPage = "step"+page;
    var prevPage = "step"+(page-1);

    $('#'+currPage).hide();
    $('#'+prevPage).show();
}

function enablePageNavigation()
{
    $("[page='0']").click( function() {
    });

    $(".prev").click(prev);

    $(".next").click(next);

}

async function enableModal()
{
    $("[modalBtn='open']").click( async function()
    {
        console.log($(this).attr('modalID'));
        var modalID = "#"+$(this).attr('modalID');

        if (modalID == "#course-info")
        {
            $(modalID).find('table').remove();

            var courseCode = $(modalID).attr("code");

            var table = await DATA.createTable(courseCode);
            console.log(table);

            if ($(modalID).length < 3)
                $(table).insertAfter($(modalID).find('.modal-header'));
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
                    addCourse(courseCode, 0);
                }
            }
        }

        var modalID = "#"+$(this).attr('modalID');

        $(modalID).hide();
        $(".prev").show();
        $(".next").show();
    });
}

async function enableInfo()
{
    // $(".info").hover(
    //     function () {
    //         $(this).text("More Information");
    //     },
    //     function () {
    //         $(this).text("?");
    //     }

    // );

    $(".info").click( function(event) {
        console.log("clicky");
        $("#course-info").attr("code", $($(this).parent()).attr("code"));
        enableModal();

        event.stopPropagation();
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



function removeCourse(courseCode, pastCourse = false)
{
    user.removeCourse(courseCode);
    $("#past-course-list").find("li[code='"+courseCode+"']").remove();
    $("#course-search-content").find("[code='"+courseCode+"']").removeClass('selected');

    if (pastCourse)
        $("#requirement-list").find("[code='"+courseCode+"']").removeClass('locked');
    else
        $("#requirement-list").find("[code='"+courseCode+"']").removeClass('selected');
}


async function addCourse(courseCode, semester, pastCourse = false)
{
    var course = DATA.getCourse(courseCode);
    user.addCourse(courseCode, course, semester);

    var pastCourse = $(document.createElement('li'))
        .attr("code", courseCode);

    var button = $(document.createElement('div'))
        .addClass('btn')
        .attr('code', courseCode)
        .append(await UTILITIES.createText(courseCode));        

    var remove = $(await UTILITIES.createText('x'))
        .addClass('remove');

    pastCourse.append(button);
    button.append(remove);
    $("#past-course-list").append(pastCourse);    
    $("#course-search-content").find("div[code='"+courseCode+"']").addClass('selected');   
    
    // update requirement list
    if (pastCourse)
        $("#requirement-list").find("[code='"+courseCode+"']").addClass('locked');
    else
        $("#requirement-list").find("[code='"+courseCode+"']").addClass('selected');

    // add in remove
    $(".remove").click( function() {
        var courseCode = $($(this).parent()).attr("code");
        removeCourse(courseCode, true);
    });
}


async function populateCourseSearch()
{
    for (let subject of DATA.subjects.values())
    {
        for (let [courseCode, courseContent] of Object.entries(subject.courses))
        {
            // console.log(courseCode, courseContent);
            var li = $(document.createElement('li'))
                .attr("code", courseCode)
                .hide();

            var button = await DATA.createCourseButton(courseCode);
            // console.log(button);
            $(button).addClass("full");
            // console.log($(button).text())
            
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

    $("#course-search-content").children().click( function(event) {
        if ($("#past-course-list").is(':visible') && event.target == this)
        {
            var button = $(this).children()[0];
            var courseCode = $(button).attr("code");

            if (!user.getCourse(courseCode))
            {
                addCourse(courseCode, 0);
            }
            else
            {
                removeCourse(courseCode, true);
            }
        } 
        else 
        {
            var button = $(this).children()[0];
            var courseCode = $(button).attr("code");

            if (!($(this).hasClass('locked')))
            {
                if (!user.getCourse(courseCode))
                {
                    addCourse(courseCode, -1);
                }
                else
                {
                    removeCourse(courseCode);
                }
            }
        } 
        
    });

    enableInfo();
    enableAddNewCourse();
    enableAddSubstitute();
}



function enableAddNewCourse()
{
    $("#requirement-list").find("li").click( async function() {
        var courseCode = $(this).attr("code");

        if (courseCode != "substitute")
        {
            if (!($(this).hasClass('locked')))
            {
                console.log('Not locked');
                if (user.getCourse(courseCode))
                {
                    user.removeCourse(courseCode);
                    $(this).find('.btn').removeClass('selected');
                }
                else
                {
                    var course = await DATA.getCourse(courseCode);
                    console.log(course);
                    user.addCourse(courseCode, course, -1);
                    $(this).find('.btn').addClass('selected');
                }
            }
        }
        else 
        {
            console.log('yes');
            $('#course-directory').show();
        }

      

        console.log(user);

    });    
}

function enableAddSubstitute()
{
}


async function populateRequirements()
{
    var requirements = await user.getRequirements();

    for (let requirement of requirements)
    {
        console.log($('#requirement-list'));
        var reqDiv = await DATA.createRequirementDiv(requirement);
        $('#requirement-list').append( reqDiv );
        console.log(reqDiv);
    }

 
    enableInfo();
    enableAddNewCourse();
}

