function colorContainers()
{

}

function resetContainers()
{
}

function colorCourse(ele)
{
}

export async function enable()
{
    var boxArray = document.getElementsByClassName("drag-list");
    var boxes = Array.prototype.slice.call(boxArray);
    dragula({containers: boxes})
        .on('drag', function (ele) {
            colorContainers();
        })
        .on('drop', function (ele) {
            resetContainers();
            colorCourse(ele);

        });
}
