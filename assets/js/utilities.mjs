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

