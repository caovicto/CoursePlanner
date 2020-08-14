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