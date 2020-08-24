import * as UTILITIES from './utilities.mjs';
import * as DATA from './data.mjs';
import * as DRAGGABLE from './draggable.mjs';

import {user} from '../scheduler.js';
import { parsePrerequisite } from './utilities.mjs';

var shownCourses = new Set();   // showing course search

/** STEP 4
 * Updates the credit menu in requirements page
 */
async function updateCredits()
{
    let reqCredits = await user.getRequiredCredits();
    let userCredits = await user.getCredits();

    $("#required-credits").text( reqCredits );
    $("#user-credits").text( userCredits ).css('color', 'rgba(166, 255, 166, 0.8)');
    if (userCredits < reqCredits)
    {
        $("#user-credits").css('color', 'rgba(255, 166, 166, 0.8)');
    }
}

/** STEP 4
 * Populates the requirements page
 */
async function populateRequirements()
{
    var requirements = await user.getRequirements();
    $('#requirement-list').empty();

    for (let requirement of requirements)
    {
        var reqDiv = await  UTILITIES.createRequirementDiv(requirement);
        $('#requirement-list').append( reqDiv );
    }

    courseInfo();
    modal();
    $("#requirement-list").find("[code][class~='btn']").click( function() { requirementCourse(this); } );

}

function prerequisiteForm()
{
    courseInfo();
    $("#prerequisite-list").find("[code][class~='btn']").click( function() { prerequisiteCourse(this); } )
    
    for (let course of user.getCourses().values())
    {
        if (course.semester != '1')
        {
            var courseCode = course.info.get('code');
            $("#prerequisite-list").find("[class~='btn'][code='"+courseCode+"']").addClass('locked');
        }
    }
}

/** STEP 5
 * Populates the prerequisite page
 */
export async function populatePrerequisites()
{
    $('#prerequisite-list').empty();

    for (let course of user.getCourses().values())
    {
        if (course.semester == "1")
        {
            user.removeCourse(course.info.get('code'));
        }
    }


    for (let course of user.getCourses().values())
    {
        if (course.semester == "-1")
        {
            var fulfilled = await checkPrerequisite(course.info.get("prerequisite"));

            // add div if not fulfilled
            if (!fulfilled)
            {
                var prereqDiv = await UTILITIES.createPrerequisiteDiv(course.info);
                $('#prerequisite-list').append( prereqDiv );
            }
        }
    }

    if ($('#prerequisite-list').children().length)
    {
        prerequisiteForm();
    }
    else 
    {
        $('#prerequisite-list').append( $(document.createElement('h2')).text("You're all Set!") );
    }

}

/**
 * Next function for page
 */
async function next()
{
    var page = $('[step]:visible').attr('step');
    var stepNumber = parseInt(page, 10);
    var currPage = "[step='"+stepNumber+"']";
    var nextPage = "[step='"+(stepNumber+1)+"']";
    
    switch (stepNumber)
    {
        // major
        case 1:
            $("#prev").show(500);
            break;

        // minor
        case 2:
            if (!user.hasPrograms())
                return;

            await populateRequirements();

            break;

        // past courses
        case 3:
            checkRequirements();
            updateCredits();
            $("#course-search-content").find('.selected').removeClass('selected');
            $("#credit-count").show(500);

            break;

        // requirements
        case 4:
            populatePrerequisites();

            break;

        // prerequisites
        case 5:
            $("#credit-count").hide(500);

            break;

        // edit schedule
        case 6:
            $("#next").hide(500);

            break;
    }


    $(currPage).fadeOut(500, function() {
        $(nextPage).fadeIn(500);
    });

}


/**
 * Previous function for page
 */
function prev()
{
    var page = $('[step]:visible').attr('step');
    var stepNumber = parseInt(page, 10);
    var currPage = "[step='"+stepNumber+"']";
    var prevPage = "[step='"+(stepNumber-1)+"']";

    switch (stepNumber)
    {
        // minor
        case 2:
            $("#prev").hide(500);

            break;

        // requirements
        case 4:
            $("#credit-count").hide(500);
            
            break;

        // prerequisites
        case 5:
            // user.removeAddedCourses();

            break;

        //create schedule
        case 6:
            $("#credit-count").show(500);
            
            break;

        case 7:
            $("#next").show(500);

            break;

    }

    $(currPage).fadeOut(500, function() {
        $(prevPage).fadeIn(500);
    });
}

/**
 * Enables page navigation
 */
export function pageNavigation()
{
    $("#prev").click(prev);

    $("#next").click(next);

    $(document).keydown( function(event) {
        // console.log('key ', event.which);
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

/**
 * Enables all search functions 
 * - major/minor search
 * - course directory search
 */
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

    if ($("[step='4'],[step='5']").is(":visible"))
        $('#credit-count').show(500);

    $("#prev").show(500);
    $("#next").show(500); 
}

export async function modal()
{
    $("[modalBtn='open']").click( async function()
    {
        if ($("[step='6']").is(":visible"))
            $("#chosen-courses").hide();

        if ($("[step='4'],[step='5']").is(":visible"))
            $('#credit-count').hide(500);


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

        $("#prev").hide(500);
        $("#next").hide(500);
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

function toggleButtons(ele)
{
    if ($(ele).hasClass('selected'))
    {
        $(ele).removeClass('selected');
        $(ele).parent().siblings().find('.btn').addClass('selected');
    }
    else
    {
        $(ele).addClass('selected');
        $(ele).parent().siblings().find('.btn').removeClass('selected');
    }
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

/**
 * Past course input box
 */
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
                if (!(await user.getCourse(courseCode)))
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
    $("#requirement-list").find("[class~='btn'][code='"+courseCode+"']").removeClass('locked');
    clickRequirementCourse(courseCode);

    // update step 6, create schedule
    $("[semester='0']").find("li[code='"+courseCode+"']").remove();
    if (!$("[semester='0']").find('li').length)
    {
        $("[semester='0']").hide();
    }
}


async function addPastCourse(courseCode)
{
    console.log(courseCode);
    // update step 3, past course input
    if (!(await user.getCourse(courseCode)))
    {
        var pastCourse = $(document.createElement('li'))
        .attr("code", courseCode);

        var button = $(document.createElement('div'))
            .addClass('btn')
            .attr('code', courseCode)
            .append(await UTILITIES.createText(courseCode));        

        var remove = $(await UTILITIES.createText('x'))
            .addClass('remove');

        // add in remove
        $(remove).click( function() {
            console.log(courseCode);
            var courseCode = $($(this).parent()).attr("code");
            removePastCourse(courseCode);
        });

        pastCourse.append(button);
        button.append(remove);

        $("#past-course-list").append(pastCourse); 
        $("#course-search-content").find("div[code='"+courseCode+"']").addClass('selected');

        // update step 4, requirement list
        clickRequirementCourse(courseCode);
        $("#requirement-list").find("[class~='btn'][code='"+courseCode+"']").addClass('locked');


        // update step 6, create schedule
        var courseButton = await UTILITIES.createCourseButton(courseCode);
        var li = $( document.createElement('li') )
            .attr("code", courseCode)
            .append( courseButton );

        $("[semester='0']").find('.block-course-container').append(li); 
        courseInfo();

        // update user info
        var course = await UTILITIES.getButtonData(courseButton)
        await user.addCourse(courseCode, course, '0');

        console.log(user);
    }

    // show past course
    $("[semester='0']").show();
}


export async function courseSearchSelect(ele)
{
    console.log('hello');

    if ($("[step='3']").is(':visible'))
    {
        console.log(ele);
        var courseCode = $(ele).attr("code");
        console.log(courseCode);

        if (!(await user.getCourse(courseCode)))
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
        var courseCode = $(ele).attr("code");

        var substitute = $('#course-search-content').attr('substitute');

        if (!$("[substitute-conditionID='"+substitute+"']").parent().find("[code='"+courseCode+"']").length)
        {
            console.log(courseCode, substitute);
            
            var courseButton = await UTILITIES.createCourseButton(courseCode);
            var li = $( document.createElement('li') )
                .attr("code", courseCode)
                .append( courseButton )
                .click( function() { requirementCourse(this); });            


            $(li).insertAfter($("[substitute-conditionID='"+substitute+"']"));

            // update step 4, substitute list
            var userCourse = await user.getCourse(courseCode);
            console.log(userCourse, userCourse.semester == '0');
            if (userCourse && userCourse.semester == '0')
            {
                console.log(courseButton);
                $(courseButton).addClass('selected').click().addClass('locked');
            }

            courseInfo();
        }
    } 
        
}


/**             STEP 4: REQUIREMENTS             */

/**
 * Checks requirement of reqContainer,
 * if fulfilled remove unfulfilled class
 * @param reqContainer jquery element
 */
export function checkRequirements(reqContainer)
{
    var fulfilled = false;

    var sets = $(reqContainer).find('.set');
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
            $(reqContainer).removeClass('unfulfilled');
            return;
        }
    }

    $(reqContainer).addClass('unfulfilled');
  
}

/**
 * 'clicks' on all buttons in requirement list with courseCode
 * @param courseCode to find and click
 */
function clickRequirementCourse(courseCode)
{
    var selected = $("#requirement-list").find("[code='"+courseCode+"'][class~='btn']").hasClass('selected');
    
    $("#requirement-list").find("[code='"+courseCode+"'][class~='btn']").each( function () {
        if (selected)
            $(this).removeClass('selected');
        else
            $(this).addClass('selected');
        checkRequirements($(this).closest('.requirement-container'));
    });
}

/**
 * Enables on click for requirement course 
 * in requirement div
 * @param ele jquery element
 */
export async function requirementCourse(ele)
{
    var courseCode = $(ele).attr("code");

    if (courseCode != "substitute")
    {
        var userCourse = await user.getCourse(courseCode);
        console.log(userCourse);

        // if user has course and is not a past course
        if (userCourse && user.getCourseSemester(courseCode) == '-1')
        {
            user.removeCourse(courseCode);                    
            clickRequirementCourse(courseCode);

            // remove course from chosen courses
            $("[semester='-1']").find("[code='"+courseCode+"']").remove();
        }
        else if (!userCourse)
        {
            // console.log(this);
            var course = await UTILITIES.getButtonData(ele);
    
            user.addCourse(courseCode, course, '-1');
            clickRequirementCourse(courseCode);

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
        console.log('substitute');
        $('#course-search-content').attr('substitute', $(ele).attr('substitute-conditionID'));
    }

    console.log(user);
    updateCredits();
 
}

/**             STEP 5: PREREQUISITES             */

async function addEnglishPlacement()
{
    console.log(user.getCourses());

    if ($("#passed-english-placement").hasClass('selected'))
    {
        var englishInfo = new Map();
        englishInfo.set('code', 'DESIGNATED SCORE ON ENGLISH PLACEMENT TEST');
        englishInfo.set('name', 'DESIGNATED SCORE ON ENGLISH PLACEMENT TEST');
        user.addCourse('DESIGNATED SCORE ON ENGLISH PLACEMENT TEST', englishInfo, '-1');
    }

}

async function addMathPlacement()
{
    console.log(user.getCourses());

    if ($("#passed-mathematics-placement").hasClass('selected'))
    {
        var mathInfo = new Map();
        mathInfo.set('code', 'DESIGNATED SCORE ON MATHEMATICS PLACEMENT TEST');
        mathInfo.set('name', 'DESIGNATED SCORE ON MATHEMATICS PLACEMENT TEST');
        user.addCourse('DESIGNATED SCORE ON MATHEMATICS PLACEMENT TEST', mathInfo, '-1');
    }
}

/**
 * starting prerequisite info input information
 */
export async function prerequisiteInfoInput()
{
    $("#english-placement, #mathematics-placement").find('.btn').click( function() {
        toggleButtons(this);
    });

    $("#prerequisite-input-submit").click( async function () {
        addEnglishPlacement();
        addMathPlacement();
    });
}

/**
 * 
 * @param prereqContainer 
 */
async function checkPrerequisite(prereqText)
{
    var parsedPrereqs = await UTILITIES.parsePrerequisite(prereqText);
    console.log(parsedPrereqs);

    // add in user information
    for (let i = 0; i < parsedPrereqs.length; i++)
    {
        if (!UTILITIES.delimeters.includes(parsedPrereqs[i]))
        {
            if (await user.getCourse(parsedPrereqs[i]))
            {
                parsedPrereqs[i] = true;
            }
            else 
            {
                parsedPrereqs[i] = false;
            }
        }
    }

    return await UTILITIES.solvePrerequisite(parsedPrereqs);
}

/**
 * 'clicks' on all buttons in requirement list with courseCode
 * @param courseCode to find and click
 */
async function clickPrerequisiteCourse(courseCode)
{
    clickRequirementCourse(courseCode);

    var selected = $("#prerequisite-list").find("[code='"+courseCode+"'][class~='btn']").hasClass('selected');

    $("#prerequisite-list").find("[code='"+courseCode+"'][class~='btn']").each( async function () {
        if (selected)
            $(this).removeClass('selected');
        else
            $(this).addClass('selected');

        var prereqContainer = $(this).closest('.prerequisite-container');
        console.log(prereqContainer);

        if (await checkPrerequisite($(prereqContainer).attr('prerequisiteText')) )
        {
            $(prereqContainer).removeClass('unfulfilled');
            return;
        }

        $(prereqContainer).addClass('unfulfilled');
    });

    var course = await user.getCourse(courseCode);
    var fulfilled = await checkPrerequisite(course.info.get('prerequisite'));

    // add div if not fulfilled
    if (!fulfilled)
    {
        var prereqDiv = await UTILITIES.createPrerequisiteDiv(course.info);
        $('#prerequisite-list').append( prereqDiv );
        prerequisiteForm();
    }
}

/**
 * 
 * @param ele 
 */
export async function prerequisiteCourse(ele)
{
    var courseCode = $(ele).attr("code");

    var userCourse = await user.getCourse(courseCode);
    console.log(userCourse);

    // if user has course and is not a past course
    if (userCourse && user.getCourseSemester(courseCode) == '1')
    {
        user.removeCourse(courseCode);                    
        clickPrerequisiteCourse(courseCode);

        // remove course from chosen courses
        $("[semester='-1']").find("[code='"+courseCode+"']").remove();
    }
    else if (!userCourse)
    {
        var course = await UTILITIES.getButtonData(ele);

        user.addCourse(courseCode, course, '1');
        clickPrerequisiteCourse(courseCode);

        // add course to chosen courses in step 5
        var courseButton = $( document.createElement('li') )
            .attr("code", courseCode)
            .append( await UTILITIES.createCourseButton(courseCode) );

        console.log(courseButton);

        if ($(courseButton).find('.info').length && !$("[semester='-1']").find("[code='"+courseCode+"']").length)
        {
            $("[semester='-1']").find('.block-course-container').append(courseButton); 
            courseInfo();
        }

    }


    console.log(user);
    updateCredits();
}



/**             STEP 6: EDIT SCHEDULE             */

/**
 * starting semester info input information
 */
export function semesterInfoInput()
{
    $("#start-semester").find('.btn').click( function() {
        toggleButtons(this);
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


        $("#development-semester-list").show(400);
        
    });
}

