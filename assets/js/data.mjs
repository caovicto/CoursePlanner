---
---

import * as UTILITIES from './utilities.mjs';

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

export function getCourse(courseCode)
{
    var subjectCode = UTILITIES.getSubject(courseCode);

    if (subjects.get(subjectCode))
    {
        return subjects.get(subjectCode).courses[courseCode];
    }

    return undefined;
}

export function createTable(courseCode)
{
    var course = getCourse(courseCode);

    return $(document.createElement('table'))
        .addClass("course-table")
        .append(
        `
            <tr>
                <th>code</th>
                <th>`+courseCode+`</th>
            </tr>
            <tr>
                <th>name</th>
                <th>`+course.name+`</th>
            </tr>
            <tr>
                <th>credits</th>
                <th>`+course.credits+`</th>
            </tr>
            <tr>
                <th>semester</th>
                <th>`+course.semester+`</th>
            </tr>
            <tr>
                <th>prerequisite</th>
                <th>`+((course.description) ? course.description : 'None')+`</th>
            </tr>
            <tr>
                <th>description</th>
                <th>`+course.description+`</th>
            </tr>  
            <tr>
                <th>restrictions</th>
                <th>`+((course.restrictions) ? course.restrictions : 'None')+`</th>
            </tr> 
            <tr>
                <th>alias</th>
                <th>`+((course.alias) ? course.alias : 'None')+`</th>
            </tr>  
        `);
}