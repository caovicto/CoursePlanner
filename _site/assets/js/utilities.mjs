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
    return courseCode.match(/[a-zA-Z]+/g)[0];
}

export function capitalize(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}