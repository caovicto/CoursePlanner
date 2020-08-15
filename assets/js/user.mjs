class User 
{
    constructor()
    {
        this.programs = new Map();
        this.requirements = new Map();
        this.courses = new Map();
    }

    async buildRequirements()
    {
        this.requirements.clear();

        for (let programRequirement of this.programs.values())
        {
            for (let reqObj of programRequirement.requirement)
            {
                if (await validRequirement(reqObj.name))
                    this.requirements.set(reqObj.name, reqObj.requirement)
            }
        }

        return;
    }

    // getting course
    getCourse(course)
    {
        return this.courses.get(course);
    }

    getCourseInfo(course)
    {
        return this.courses.get(course).info;
    }

    getCourseSemester(course)
    {
        return this.courses.get(course).semester;
    }

    addCourse(course, courseInfo, semester = -1)
    {
        this.courses.set(course, {'info':courseInfo, 'semester':semester});
    }

    removeCourse(course)
    {
        this.courses.delete(course);
    }

    // getting course
    getProgram(program)
    {
        return this.programs.get(program);
    }

    addProgram(program, programInfo)
    {
        this.programs.set(program, programInfo);
        console.log(this);
        this.buildRequirements();
    }

    removeProgram(program)
    {
        this.programs.delete(program);
        this.buildRequirements();
    }



}

async function validRequirement(name)
{
    return  !name.includes("University Residency") && 
            !name.includes("University Diversity Distribution") && 
            !name.includes("GPA");
}


export { User };