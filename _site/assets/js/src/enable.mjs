import * as UTILITIES from './utilities.mjs';
import * as DATA from './data.mjs';
import * as DRAGGABLE from './draggable.mjs';

import {user} from '../scheduler.js';

var shownCourses = new Set();   // showing course search

// GENERAL PAGE FUNCTIONS
function next()
{
    var page = $('[step]:visible').attr('step');
    var stepNumber = parseInt(page, 10);
    var currPage = "[step='"+stepNumber+"']";
    var nextPage = "[step='"+(stepNumber+1)+"']";

    console.log(currPage, nextPage);

    if (stepNumber == 6)
    {
        return;
    }
    else if ( stepNumber == 2 && !user.hasPrograms())
    {
        return;
    }
    else if ( stepNumber == 3)
    {
        checkRequirements();
    }
    // else if (stepNumber == 4 && $('.unfulfilled').length)
    // {
    //     return;
    // }

    $(currPage).fadeOut(500, function() {
        $(nextPage).fadeIn(500);
    });

}

function prev()
{
    var page = $('[step]:visible').attr('step');
    var stepNumber = parseInt(page, 10);
    var currPage = "[step='"+stepNumber+"']";
    var prevPage = "[step='"+(stepNumber-1)+"']";

    console.log(currPage, prevPage);

    if (stepNumber == 1)
        return;

    $(currPage).fadeOut(500, function() {
        $(prevPage).fadeIn(500);
    });
}

export function pageNavigation()
{
    $(".prev").click(prev);

    $(".next").click(next);

    $(document).keydown( function(event) {
        console.log('key ', event.which);
        // left arrow key
        if (event.which == 37)
        {
            console.log("prev");
            prev();
        }
        // right arrow key
        else if (event.which == 39)
        {
            console.log("next");
            next();
        }
    });

}

export function search()
{
    console.log($('.search').not('#course-search'));

    $('.search').keyup( function(event) {
        var filter = $($(this).children('.search-bar')).val().toUpperCase();
        var content = $(this).find('li');

        // console.log(event.which, filter);

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

function onClose()
{
    if ($(".modal").is(":visible"))
        return;

    if ($("[step='5']").is(":visible"))
        $("#chosen-courses").show(400);

    $(".prev").show();
    $(".next").show(); 
}

export async function modal()
{
    $("[modalBtn='open']").click( async function()
    {
        if ($("[step='5']").is(":visible"))
            $("#chosen-courses").hide();

        var modalID = "#"+$(this).attr('modalID');

        if (modalID == "#course-info")
        {
            $(modalID).find('table').remove();

            var courseCode = $(modalID).attr("code");

            var table = await UTILITIES.createTable(courseCode);
            console.log(table);

            if ($(modalID).find('table').length < 1)
                $(table).insertAfter($(modalID).find('.modal-header'));
        }

        $(modalID).show(500);

        $(".prev").hide();
        $(".next").hide();
    });


    $("[modalBtn='close']").click( function()
    {
        var modalID = "#"+$(this).attr('modalID');

        $(modalID).hide(500, onClose);

    });

    $(".modal-background").click( function(event)
    {
        if (event.target != this)
            return;

        $($(this).parent()).hide(500, onClose);
    });
}


// COURSE FUNCTIONS
export async function courseInfo()
{
    $(".info").click( function(event) {
        console.log("clicky");
        $("#course-info").attr("code", $($(this).parent()).attr("code"));
        modal();

        event.stopPropagation();
    });
}

// PAST COURSE 
export function pastCourseInput()
{
    $("#past-course-submit").click(async function () 
    {
        var text = $("#past-course-input-box").val().toUpperCase();
        console.log(text);
        var scrapedCourses = text.match(/[A-Z]+\d+[A-Z]?/g);
        
        for (let courseCode of scrapedCourses)
        {
            var course = await DATA.getCourse(courseCode);

            if (course)
            {
                if (!user.getCourse(courseCode))
                {
                    addPastCourse(courseCode);
                }
            }
        }
    });
}

export function removePastCourse(courseCode)
{
    // update user info
    user.removeCourse(courseCode);

    // update step 3, past course input
    $("#past-course-list").find("li[code='"+courseCode+"']").remove();
    $("#course-search-content").find("[code='"+courseCode+"']").removeClass('selected');

    // update step 4, requirement list
    $("#requirement-list").find("[class~='btn'][code='"+courseCode+"']").removeClass('locked').click();

    // update step 5, create schedule
    $("[semester='0']").find("li[code='"+courseCode+"']").remove();
    if (!$("[semester='0']").find('li').length)
    {
        $("[semester='0']").hide();
    }
}


async function addPastCourse(courseCode)
{
    // update user info
    var course = await DATA.getCourse(courseCode);
    user.addCourse(courseCode, course, 0);

    // update step 3, past course input
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

    // update step 4, requirement list
    $("#requirement-list").find("[class~='btn'][code='"+courseCode+"']").addClass(['selected', 'locked']).click();

    // update step 5, create schedule
    var courseButton = $( document.createElement('li') )
        .attr("code", courseCode)
        .append( await UTILITIES.createCourseButton(courseCode) );

    $("[semester='0']").find('.block-course-container').append(courseButton); 
    courseInfo();


    // add in remove
    $(".remove").click( function() {
        console.log(courseCode);
        var courseCode = $($(this).parent()).attr("code");
        removePastCourse(courseCode);
    });

    // show past course
    $("[semester='0']").show();

    console.log(user);
}


export async function courseSearchSelect()
{
    $("#course-search-content").children().click( async function() {
        // step 3, course input
        if ($("[step='3']").is(':visible'))
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
        // step 4, requirement fillout
        else 
        {
            var button = $(this).children()[0];
            var courseCode = $(button).attr("code");

            var requirement = $('#course-search-content').attr('requirement');

            if (!$("[substitute='"+requirement+"']").parent().find("[code='"+courseCode+"']").length)
            {
                console.log(courseCode, requirement);
                var li = $( document.createElement('li') )
                    .attr("code", courseCode)
                    .append( await UTILITIES.createCourseButton(courseCode) );
                $(li).insertAfter($("[substitute='"+requirement+"']"));
    
                courseInfo();
                requirementCourses();  
            }
        } 
        
    });
}

// REQUIREMENT

export function checkRequirements()
{
    $('.requirement-container').click( function() {
        var fulfilled = false;

        var sets = $(this).find('.set');
        for (let set of sets)
        {
            var setfulfilled = true;
    
            var conditions = $(set).find('.condition');

            for (let condition of conditions)
            {
                var number = parseInt($(condition).attr('number'), 10);
                var selected = $(condition).find('.selected');

                if ($(condition).attr('type') == 'course')
                {
                    setfulfilled = setfulfilled && (selected.length >= number);
                }
                else 
                {
                    var totalCredits = 0;
                    for (let course of selected)
                    {
                        totalCredits += parseInt($(course).attr('credits'));
                    }

                    setfulfilled = setfulfilled && (totalCredits >= number);    
                }
            }
    
            fulfilled = fulfilled || setfulfilled;

            if (fulfilled)
            {
                $(this).removeClass('unfulfilled');
                return;
            }
        }

        $(this).addClass('unfulfilled');
    });
}

export async function requirementCourses()
{
    $("#requirement-list").find("li").click( async function() {
        var courseCode = $(this).attr("code");

        if (courseCode != "substitute")
        {
            // if user has course and is not a past course
            if (user.getCourse(courseCode) && user.getCourseSemester(courseCode) == -1)
            {
                user.removeCourse(courseCode);                    
                $(this).find('.btn').removeClass('selected');

                // remove course from chosen courses
                $("[semester='-1']").find("[code='"+courseCode+"']").remove();
            }
            else if (!user.getCourse(courseCode))
            {
                var course = await DATA.getCourse(courseCode);
                console.log(course);
                user.addCourse(courseCode, course, -1);
                $(this).find('.btn').addClass('selected');

                // add course to chosen courses in step 5
                var courseButton = $( document.createElement('li') )
                .attr("code", courseCode)
                .append( await UTILITIES.createCourseButton(courseCode) );
        
                if ($(courseButton).find('.info').length && !$("[semester='-1']").find("[code='"+courseCode+"']").length)
                {
                    $("[semester='-1']").find('.block-course-container').append(courseButton); 
                    courseInfo();
                }
            }
        }
        else 
        {
            $('#course-directory').show();
            $('#course-search-content').attr('requirement', $(this).attr('substitute'));
        }

        console.log(user);

    });  
}


// create schedule
export function semesterInfoInput()
{
    $("#start-semester").find('.btn').click( function() {
        if ($(this).hasClass('selected'))
        {
            $(this).removeClass('selected');
            console.log(this);
            $(this).parent().siblings().find('.btn').addClass('selected');
        }
        else
        {
            $(this).addClass('selected');
            $(this).parent().siblings().find('.btn').removeClass('selected');
        }
    });

    $("#semester-input-submit").click(async function () {

        var semesters = parseInt($("#semester-input-box").val(), 10);

        let semVec = ["F", "S"];
        if ($('#start-semester').find('.selected').text() == "Spring")
        {
            semVec = ["S", "F"];
        }

        for (let i = 0; i < semesters; i++)
        {
            $('#semester-boxes').append(await UTILITIES.createSemesterContainer(i+1, semVec[i%2]));
        }

        DRAGGABLE.enable();

        // hide past courses if needed
        if (!$("[semester='0']").find('li').length)
        {
            $("[semester='0']").hide();
        }

        // close modal

        var modalID = "#"+$(this).attr('modalID');

        $(modalID).hide();

        $(".prev").show();
        $(".next").show();
        $("#chosen-courses").show();
        
    });
}