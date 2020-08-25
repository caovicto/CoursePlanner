import * as DATA from './data.mjs';
import * as ENABLE from './enable.mjs';
import { courseSearchSelect } from './enable.mjs';
import { user } from '../scheduler.js';

var seasons = ['Fall', 'Spring', 'Summer'];
var colors = ['#F79F79', '#F7D08A', '#E3F09B '];
export var delimeters = ['(', ')', 'or', 'and', 'OR', 'AND']


/**                         GENERAL FUNCTIONS                   **/
export function scrollTop() 
{
    $('html, body').animate({
        scrollTop: $("#schedule-content").offset().top
    });
}

export function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getSubject(courseCode)
{
    var subject = courseCode.match(/[a-zA-Z]+/g);
    if (subject)
        return subject[0];
    else
        return "";
}

export async function capitalize(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function checkValidCourses(courseList)
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

async function convert(text)
{
    text = text.toUpperCase(); 

    if (text.match(/\d+/g))
    {
        return text.replace(/\s/g, "");
    }

    return text;
}

            /**        PREREQUISITE FUNCTIONS         **/
/**
 * inflix to postfix
 * @param arr to translate to postfix
 */
async function postfix(arr)
{
    var stack = new Array();
    var postfix = new Array();

    for (let ele of arr)
    {
        if (ele == ')')
        {
            var popped = stack[stack.length-1];
            stack.pop();

            while (popped != '(')
            {
                postfix.push(popped);

                popped = stack[stack.length-1];
                stack.pop();
            }
        }
        else if (delimeters.includes(ele))
        {
            stack.push(ele);
        }
        else
        {
            postfix.push(ele);
        }
    }

    postfix = postfix.concat(stack.reverse());

    return postfix;
}

/**
 * Parses blocks from prerequisite function
 * @param text 
 */
export async function parsePrerequisite(text)
{
    console.log(text);
    if (text)
    {
        var parsed = text.split(/\s/g);
        var processed = new Array();

        for (let word of parsed)
        {
            var splitWord = word.split(/((?<=\))|(?=\))|(?<=\()|(?=\())/g);
            processed = processed.concat(splitWord);
            
        }

        parsed.length = 0;

        for (let i = 0; i < processed.length; i++)
        {
            if (delimeters.includes(processed[i]))
            {
                parsed.push(processed[i].toUpperCase());
            }
            else
            {
                var joinedWord = processed[i];
                while(!delimeters.includes(processed[i+1]) && i+1 < processed.length)
                {
                    ++i;
                    if (processed[i] != '')
                    {
                        joinedWord += ' ' + processed[i];
                    }
                }
                parsed.push(await convert(joinedWord));
            }
        }


        return parsed;
    }

    return [];

}

/**
 * 
 * @param prereqContainer 
 */
export async function checkPrerequisite(prereqText, semester = -1)
{
    var parsedPrereqs = await parsePrerequisite(prereqText);

    // add in user information
    for (let i = 0; i < parsedPrereqs.length; i++)
    {
        if (!delimeters.includes(parsedPrereqs[i]))
        {
            var course = await user.getCourse(parsedPrereqs[i]);
            if (course)
            {
                var courseSem = parseInt(course.semester, 10);
                console.log('course Sem', courseSem < semester);

                if (semester == -1 || (courseSem > -1 && courseSem < semester))
                    parsedPrereqs[i] = true;
                else 
                    parsedPrereqs[i] = false;
            }
            else 
            {
                parsedPrereqs[i] = false;
            }
        }
    }

    return await solvePrerequisite(parsedPrereqs);
}

/**
 * Solves the parsedPrereq
 * @param parsedPrereq array prerequisite delimeters and 'courses,
 * courses taken are marked by true
 * @returns solved version of parsed prerequisite
 */
export async function solvePrerequisite(parsedPrereq)
{
    parsedPrereq = await postfix(parsedPrereq);
    var stack = new Array();

    for (let ele of parsedPrereq)
    {
        // ele is 'and' || 'or'
        if (delimeters.includes(ele))
        {
            var popped = stack[stack.length-1];
            stack.pop();

            if (ele == 'and' || ele == 'AND')
            {
                stack[stack.length-1] &= popped;
            }
            else
            {
                stack[stack.length-1] |= popped;
            }
        }
        else
        {
            stack.push(ele);
        }

    }

    return (stack.length) ? stack[stack.length-1] : true;

}

/**                         CREATING TEXT                       **/
export async function createText(text)
{
    return $(document.createElement('div')).text(text);
}

export async function createTitle(text)
{
    return $(document.createElement('h3')).text(text);
}

export async function createStar()
{
    return $(document.createElement('div')).text('★').addClass('star');
}

/**                         CREATING BUTTONS                    **/
export async function createCourseButton(courseCode)
{
    courseCode = courseCode.trim();
    
    var button = $(document.createElement('div'))
        .attr("class", "btn")
        .attr("code", courseCode)
        .append(await createText( await capitalize(courseCode) ))  
    
    var course = await DATA.getCourse(courseCode);

    if (course) 
    {
        // console.log(course);
        button.attr("name", course.name)
            .attr("credits", course.credits)
            .attr("semester", course.semester)
            .attr("prerequisite", course.prerequisite)
            .attr("restriction", course.restriction)
            .attr("alias", course.alias);

        var info = $(await createText('?'))
            .addClass("info")
            .attr("modalID", "course-info")
            .attr("modalBtn", "open");

        button.append(info);
    }

    return button;
}

async function createSubstituteButton(conditionID)
{
    var button = $(await createCourseButton('+'))
        .attr('code', 'substitute')
        .attr('substitute-conditionID', conditionID)
        .attr("modalID", 'course-directory')
        .attr("modalBtn", "open");

    return $( document.createElement('li') )
        .attr("code", 'substitute')
        .append( button );
        // .click( function() { ENABLE.requirementCourse(this); });
}

export async function getButtonData(ele)
{
    var info = new Map();

    info.set('code', $(ele).attr('code'));
    info.set('name', $(ele).attr('name'));
    info.set('credits', $(ele).attr('credits'));
    info.set('semester', $(ele).attr('semester'));
    info.set('prerequisite', $(ele).attr('prerequisite'));
    info.set('restriction', $(ele).attr('restriction'));
    info.set('alias', $(ele).attr('alias'));

    return info;
}

// CREATING CONTAINERS
export async function createStarContainer()
{
    return $(document.createElement('div')).addClass('star-container');
}

async function createSemesterCredits(semester)
{
    var creditText =  await createText('0');
    $(creditText).attr('semesterID', semester)
        .attr('creditText', 'true');

    var container = $( document.createElement('div') )
        .addClass('credits')
        .append( await createText('Credits') )
        .append( creditText );

    return container;
}

async function createSemesterSeason(season)
{
    var container = $( document.createElement('div') )
        .addClass('semester-season');

    var seasonButton = $( document.createElement('div') )
        .addClass('season-btn')
        .attr('season', season)
        .text(season)
        .css('color', colors[seasons.indexOf(season)]);

    $(seasonButton).click( function() {
        console.log('switch');
        let index = (seasons.indexOf($(this).attr('season'))+1)%3;
        $(this).attr('season', seasons[index])
            .text(seasons[index])
            .css('color', colors[index]);
    });

    container.append(seasonButton);
    // container.append(switchButton);

    return container;
}

async function createSemesterTitle(semester)
{
    return $( document.createElement('div') )
        .css('padding-top', '1.5vh')
        .append( await createTitle('Semester '+semester) );
}


export async function createSemesterContainer(semester, season)
{
    var dropBox = $( document.createElement('div') )
        .addClass('drop-box')
        .attr('semester', semester)
        .attr('new-semester', 'true')
        .append( await createSemesterTitle(semester) );

    var infoBox = $( document.createElement('div') )
        .addClass('semester-info')
        .append( await createSemesterCredits(semester) )
        .append( await createSemesterSeason(season) );

    var ul = $( document.createElement('ul') )
        .attr('semesterID', semester)
        .addClass(['block-course-container', 'drag-list']);

    $(dropBox)
        .append(infoBox)
        .append(ul);

    return dropBox;
}

// CREATING CONTENT
export async function createTable(courseCode)
{
    console.log(courseCode);
    var course = await DATA.getCourse(courseCode);

    return $(document.createElement('table'))
        .addClass("course-table")
        .append(
        `
            <tr>
                <th>Course Code</th>
                <th>`+courseCode+`</th>
            </tr>
            <tr>
                <th>Name</th>
                <th>`+course.name+`</th>
            </tr>
            <tr>
                <th>Credits</th>
                <th>`+course.credits+`</th>
            </tr>
            <tr>
                <th>Semester</th>
                <th>`+course.semester+`</th>
            </tr>
            <tr>
                <th>Prerequisite</th>
                <th>`+((course.prerequisite) ? course.prerequisite : '')+`</th>
            </tr>
            <tr>
                <th>Description</th>
                <th>`+course.description+`</th>
            </tr>  
            <tr>
                <th>Restrictions</th>
                <th>`+((course.restrictions) ? course.restrictions : '')+`</th>
            </tr> 
            <tr>
                <th>Alias</th>
                <th>`+((course.alias) ? course.alias : '')+`</th>
            </tr>  
        `);
}

/**
 * Creates requirement Div for requirement info
 * - enables check requirement
 * 
 * @param requirment info from user
 * @returns div element with requirement buttons to select
 */
export async function createRequirementDiv(requirement)
{
    var name = requirement[0];
    var reqSets = requirement[1];

    var reqDiv = $( document.createElement('div') )
        .addClass('form-container requirement-container unfulfilled')
        .attr('id', name)
        .append( await createTitle(name));

    // console.log(name);
    for (let setIndex in reqSets)
    {
        var set = reqSets[setIndex];
        var setDiv = $( document.createElement('div') )
            .addClass('set')
            .append( await createTitle("Set "+setIndex) );

        var conditionIndex = 0;
        for (let condition of set)
        {
            // conditionID
            var conditionID = name+setIndex+conditionIndex;

            // create set
            var distribution = condition.number + " " + condition.type + ((condition.number > 1) ? "s" : "");
            var conditionDiv = $( document.createElement('div') )
                .attr('type', condition.type)
                .attr('number', condition.number)
                .attr('conditionID', conditionID)
                .addClass('condition')
                .append( await createText(distribution) );

            var courseDiv = $( document.createElement('div') )
                .addClass('course-container');

            var courses = condition.courses;

            // Add substitute
            var li = await createSubstituteButton(conditionID);

            courseDiv.append( li );

            // Add courses
            if (await checkValidCourses(courses))
            {
                for (let courseCode of courses)
                {
                    var li = $( document.createElement('li') )
                        .attr("code", courseCode)
                        .append( await createStarContainer() )
                        .append( await createCourseButton(courseCode) );
                        // .click( function() { ENABLE.requirementCourse(this); });
                    
                    // add in recommended 
                    if ($('#requirement-list').find("[code='"+courseCode+"']").length > 1)
                    {
                        $('#requirement-list').find("li[code='"+courseCode+"']").find('.star-container').prepend( await createStar() );
                        li.find('.star-container').prepend( await createStar() );
                    }    

                    courseDiv.append( li );
                }
            }
            else
            {
                var description = await createText(courses.join(' '));
                conditionDiv.append(description);
            }

            conditionDiv.append(courseDiv);
            setDiv.append(conditionDiv);

            ++conditionIndex;
        }
        reqDiv.append(setDiv);
    }

    return reqDiv;
}

/**
 * Creates prerequisite Div for course element
 * @param course data info from user
 * @param solvedPrereq Solved array of prerequisite
 * @returns div element with prerequisites to select
 */
export async function createPrerequisiteDiv(course)
{
    var prerequisites = await parsePrerequisite(course.get("prerequisite"));
    prerequisites = prerequisites.filter( ele => !delimeters.includes(ele));

    console.log(prerequisites);

    // creating prerequisite div
    var title = course.get('code') + ((course.get('name')) ? (": "+course.get('name')) : "");
    var name = (course.get('name')) ? course.get('name') : course.get('code') ;

    var prepreqDiv = $( document.createElement('div') )
        .addClass('form-container prerequisite-container unfulfilled' )
        .attr('prerequisiteID', name )
        .attr('prerequisiteText', course.get("prerequisite") )
        .append( await createTitle(title) )
        .append( await createText(course.get("prerequisite")) );


    var courseDiv = $( document.createElement('div') )
        .addClass('course-container');

    for (let courseCode of prerequisites)
    {
        var li = $( document.createElement('li') )
            .attr("code", courseCode)
            .append( await createCourseButton(courseCode) );
            // .click( function() { ENABLE.prerequisiteCourse(this); }); 

        courseDiv.append( li );
    }

    prepreqDiv.append( courseDiv );


    return prepreqDiv;
}
