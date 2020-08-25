var tierIWriting = ['WRA101', 'WRA195H', 'LB133', 'MC111', 'MC112', 'RCAH111'];

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
            if (course.info.get('credits'))
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
        if (course == 'COMPLETION OF TIER I WRITING REQUIREMENT')
        {
            var found;
            for (let alias of tierIWriting)
            {
                found = this.courses.get(alias);
                if (found)
                    return found;
            }

        }

        return this.courses.get(course);
    }

    getCourseInfo(course)
    {
        return this.courses.get(course).info;
    }

    getCourseSemester(course)
    {
        if (this.courses.get(course))
            return this.courses.get(course).semester;
        
        return undefined;
    }

    setCourseSemester(course, newSemester)
    {
        this.courses.get(course)['semester'] = newSemester;
    }

    async addCourse(courseCode, course, semester)
    {
        this.courses.set(courseCode, {'info':course, 'semester':semester});   
        return true;
    }

    removeCourse(course)
    {
        this.courses.delete(course);
        console.log('hello', this.courses);
    }

    removeAddedCourses()
    {
        for (let course of this.courses)
        {
            if (course.semester == '1')
            {
                console.log('delete', course);
                this.courses.delete(course);
            }

        }
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