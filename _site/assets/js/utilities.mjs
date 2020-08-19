import * as DATA from './data.mjs'

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
    return $(document.createElement('div')).text('★').css('font-size', '2vw');
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