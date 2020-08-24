import * as UTILITIES from './utilities.mjs';

var courseMap = new Map();



function resetContainers()
{
}



async function colorContainers(ele)
{
    console.log(courseMap);

    var prerequisite = $(ele).find('[prerequisite]').attr('prerequisite');
    console.log(prerequisite);

    if (prerequisite)
    {
        var parsed = await UTILITIES.parsePrerequisite(prerequisite);
        console.log(parsed);
    }


}

function updateCourse(ele, container)
{
    var semester = $(container).attr('semesterID');
    var courseCode = $(ele).attr('code');

    courseMap.set(courseCode, semester)
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
            // removeOnSpill: true
        })
        .on('drag', function (ele, source) {
            updateCredits(ele, source, true);
            colorContainers(ele);
        })
        .on('cancel', function (ele, container) {
            updateCredits(ele, container, false);
        })
        .on('drop', function (ele, target) {
            updateCredits(ele, target, false);
            updateCourse(ele, target);
        });
}
