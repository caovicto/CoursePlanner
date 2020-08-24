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

    tempCourses = new Map(Object.entries(tempCourses).sort());

    for (let [subject, info] of tempCourses.entries())
    {
        tempCourses.set(subject, new Map(Object.entries(info)));
        tempCourses.get(subject).set('courses', new Map(Object.entries(info.courses).sort()));
    }

    subjects = tempCourses;

    console.log(subjects);

    return;
};

export async function getCourse(courseCode)
{
    var subjectCode = UTILITIES.getSubject(courseCode);

    if (subjects.get(subjectCode))
    {
        // console.log(courseCode, subjects.get(subjectCode).courses[courseCode]);
        return subjects.get(subjectCode).get('courses').get(courseCode);
    }
    else
    {
        return undefined;
    }


}




