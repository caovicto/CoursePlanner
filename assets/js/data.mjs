---
---
import * as UTILITIES from './utilities.mjs';
import { createStar } from './utilities.mjs';

export var majors, minors, subjects;

export async function loadMajors()
{
    var tempMajors = {{ site.data.majors | jsonify }};

    while(typeof tempMajors == undefined)
    {
        UTILITIES.sleep(500);
    }

    majors = new Map(Object.entries(tempMajors).sort());

    return;
};

export async function loadMinors()
{
    var tempMinors = {{ site.data.minors | jsonify }};

    while(typeof tempMinors == undefined)
    {
        UTILITIES.sleep(500);
    }

    minors = new Map(Object.entries(tempMinors).sort());

    return;
};

export async function loadCourses()
{
    var tempCourses = {{ site.data.courses | jsonify }};

    while(typeof tempCourses == undefined)
    {
        UTILITIES.sleep(500);
    }

    subjects = new Map(Object.entries(tempCourses).sort());

    return;
};

export async function getCourse(courseCode)
{
    var subjectCode = UTILITIES.getSubject(courseCode);

    if (subjects.get(subjectCode))
    {
        // console.log(courseCode, subjects.get(subjectCode).courses[courseCode]);
        return subjects.get(subjectCode).courses[courseCode];
    }

    return undefined;
}

export async function createTable(courseCode)
{
    console.log(courseCode);
    var course = await getCourse(courseCode);

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
                <th>`+((course.description) ? course.description : '')+`</th>
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

export async function createCourseButton(courseCode)
{
    courseCode = courseCode.trim();
    
    var button = $(document.createElement('div'))
        .attr("class", "btn")
        .append(await UTILITIES.createText( await UTILITIES.capitalize(courseCode) ))  
    
    var course = await getCourse(courseCode);

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

        var info = $(await UTILITIES.createText('?'))
            .addClass("info")
            .attr("modalID", "course-info")
            .attr("modalBtn", "open");

        button.append(info);
    }

    return button;
}

/// getting all requirements
export async function createRequirementDiv(requirement)
{
    var name = requirement[0];
    var reqSets = requirement[1];

    var reqDiv = $( document.createElement('div') )
        .addClass('requirement-container')
        .append( await UTILITIES.createTitle(name));

    console.log(name);
    for (let index in reqSets)
    {
        var set = reqSets[index];
        var setDiv = $( document.createElement('div') )
            .addClass('set')
            .append( await UTILITIES.createTitle("Set "+index) );

        for (let condition of set)
        {
            // create set
            var distribution = condition.number + " " + condition.type + ((condition.number > 1) ? "s" : "");
            var conditionDiv = $( document.createElement('div') )
                .attr('type', condition.type)
                .attr('number', condition.number)
                .apend( await UTILITIES.createText(distribution) );

            var courseDiv = $( document.createElement('div') )
                .addClass('set-container');

            var courses = condition.courses;

            // Add substitute
            var li = $( document.createElement('li') )
                .attr("code", 'substitute')
            .append( await createCourseButton('+') );

            courseDiv.append( li );

            // Add courses
            if (await UTILITIES.checkValidCourses(courses))
            {
                for (let courseCode of courses)
                {
                    var li = $( document.createElement('li') )
                        .attr("code", courseCode)
                        .append( await createCourseButton(courseCode) );

                    console.log($('#requirement-list').find("[code='"+courseCode+"']"));
                    
                    // add in recommended 
                    if ($('#requirement-list').find("[code='"+courseCode+"']").length > 1)
                    {
                        $('#requirement-list').find("li[code='"+courseCode+"']").prepend( await createStar() );
                        li.prepend( await createStar() );
                    }    
    
                    courseDiv.append( li );
                }
            }
            else
            {
                var description = await UTILITIES.createText(courses.join(' '));
                conditionDiv.append(description);
            }

            conditionDiv.append(courseDiv);
            setDiv.append(conditionDiv);
        }

        reqDiv.append(setDiv);
    }
    
    return reqDiv;
}

export async function checkRequirement(key)
{
    
}