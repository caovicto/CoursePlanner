class User 
{
    constructor()
    {
        this.programs = new Map();
        // this.requirements = new Map();
        this.courses = new Map();
    }

    async getRequirements()
    {
        var requirements = new Map();

        for (let programRequirement of this.programs.values())
        {
            for (let reqObj of programRequirement.requirement)
            {
                if (await validRequirement(reqObj.name))
                    requirements.set(reqObj.name, reqObj.requirement)
            }
        }

        return requirements;
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
    }

    removeProgram(program)
    {
        this.programs.delete(program);
    }

    async createRequirementSets(reqSets)
    {
        
        return null;

    }

}

async function validRequirement(name)
{
    return  !name.includes("University Residency") && 
            !name.includes("Distribution") && 
            !name.includes("GPA");
}


export { User };