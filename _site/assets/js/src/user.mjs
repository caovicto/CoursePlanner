class User 
{
    constructor()
    {
        this.programs = new Map();
        this.courses = new Map();
        this.requiredCredits = 0;
        this.totalCredits = 0;
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

    // get credits
    async getRequiredCredits()
    {
        let credits = 0;
        for (let program of this.programs.values())
        {
            credits += parseInt(program.credits, 10);
        }
        return credits;
    }

    async getCredits()
    {
        let credits = 0;
        for (let course of this.courses.values())
        {
            // console.log(course.info, course.info.get('credits'))
            credits += parseInt(course.info.get('credits'), 10);
        }
        return credits;
    }


    // getting course
    getCourses()
    {
        return this.courses;
    }

    async getCourse(course)
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

    async addCourse(courseCode, course, semester)
    {
        this.courses.set(courseCode, {'info':course, 'semester':semester});   
    }

    removeCourse(course)
    {
        this.courses.delete(course);
        console.log('hello', this.courses);
    }

    // getting course
    getProgram(program)
    {
        return this.programs.get(program);
    }

    addProgram(program, programInfo)
    {
        this.programs.set(program, programInfo);
    }

    removeProgram(program)
    {
        this.programs.delete(program);
    }

    hasPrograms()
    {
        return this.programs.size;
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