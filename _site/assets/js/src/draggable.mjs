import * as UTILITIES from './utilities.mjs';
import { user } from '../scheduler.js';
import { checkPrerequisite } from './utilities.mjs';

function resetContainers()
{
    console.log('resetting');
    $("[class='drop-box']").not("[semester='-1']").not("[semester='0']").each( async function () {
        console.log(this);
        $(this).removeClass(['red', 'green']);
    });
}



async function colorContainers(ele)
{
    var prerequisite = $(ele).find('[prerequisite]').attr('prerequisite');
    // console.log(ele, $(ele).find('[prerequisite]'), prerequisite);

    var boxes = $("[class='drop-box']").not("[semester='-1']").not("[semester='0']");
    for (let box of boxes)
    {
        var semester = parseInt($(box).attr('semester'), 10);
        if (!(await checkPrerequisite(prerequisite, semester)))
        {
            $(box).addClass('red');
        }
        else 
        {
            $(box).addClass('green');
        }
    }
}

async function updateCourse(ele, container)
{
    var semester = $(container).attr('semesterID');
    var courseCode = $(ele).attr('code');


    user.setCourseSemester(courseCode, semester);

    // $('[new-semester]').find("[code][class~='btn']").each( async function () {
    //     var prerequisite = $(this).find('[prerequisite]').attr('prerequisite');

    //     if (! (await UTILITIES.checkPrerequisite(prerequisite)) )
    //     {
    //         console.log(await UTILITIES.checkPrerequisite(prerequisite));
    //         $(this).find('.btn').addClass('unfulfilled');
    //         return;
    //     }
    
    //     $(this).find('.btn').removeClass('unfulfilled');
    // });

}

function updateCredits(ele, container, out)
{
    var creditText = $(container).parent().find('[creditText]');
    var credit = parseInt(creditText.text(), 10);

    credit += ((out) ? -1 : 1) *  parseInt($(ele).find('[credits]').attr('credits'), 10);
    creditText.text(credit);
}

export async function enable()
{

    var boxArray = document.getElementsByClassName("drag-list");
    var boxes = Array.prototype.slice.call(boxArray);

    dragula(
        {
            containers: boxes,
            accepts: (el, target) => {
                var containerSem = $(target).parent().find('.season-btn').text();
                var courseSem = $(el).find('[semester]').attr('semester');

                if (courseSem.includes(containerSem))
                    return true;
                else
                    return false;
            }
        })
        .on('drag', function (ele, source) {
            updateCredits(ele, source, true);
        })
        .on('cancel', function (ele, container) {
            updateCredits(ele, container, false);
        })
        .on('drop', function (ele, target) {
            updateCredits(ele, target, false);
            updateCourse(ele, target);
        });
}
