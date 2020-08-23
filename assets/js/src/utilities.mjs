import * as DATA from './data.mjs';
import * as ENABLE from './enable.mjs';


// GENERAL FUNCTIONS
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

export async function checkValidRequirement()
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

// CREATING TEXT
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
    return $(document.createElement('div')).text('★').css('font-size', '1vw').addClass('star');
}

// CREATING BUTTONS
export async function createCourseButton(courseCode)
{
    courseCode = courseCode.trim();
    
    var button = $(document.createElement('div'))
        .attr("class", "btn")
        .append(await createText( await capitalize(courseCode) ))  
    
    var course = await DATA.getCourse(courseCode);

    if (course) 
    {
        // console.log(course);
        button.attr("code", courseCode)
            .attr("name", course.name)
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

// CREATING CONTAINERS
export async function createStarContainer()
{
    return $(document.createElement('div')).addClass('star-container');
}



export async function createSemesterContainer(semester, semType)
{
    return `<div class='drop-box' semester='`+semester+`'>
            <h3>Semester `+semester+` `+semType+`</h3>
            <ul class="block-course-container drag-list">
            </ul>
            </div>`;

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

export async function createRequirementDiv(requirement)
{
    var name = requirement[0];
    var reqSets = requirement[1];

    var reqDiv = $( document.createElement('div') )
        .addClass('requirement-container unfulfilled')
        .attr('id', name)
        .append( await createTitle(name));

    // console.log(name);
    for (let index in reqSets)
    {
        var set = reqSets[index];
        var setDiv = $( document.createElement('div') )
            .addClass('set')
            .append( await createTitle("Set "+index) );

        for (let condition of set)
        {
            // create set
            var distribution = condition.number + " " + condition.type + ((condition.number > 1) ? "s" : "");
            var conditionDiv = $( document.createElement('div') )
                .attr('type', condition.type)
                .attr('number', condition.number)
                .addClass('condition')
                .append( await createText(distribution) );

            var courseDiv = $( document.createElement('div') )
                .addClass('course-container');

            var courses = condition.courses;

            // Add substitute
            var li = $( document.createElement('li') )
                .attr("code", 'substitute')
                .attr("substitute", name)
                .append( await createCourseButton('+') );

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
        }
        reqDiv.append(setDiv);
    }

    ENABLE.checkRequirements();
    
    return reqDiv;
}

