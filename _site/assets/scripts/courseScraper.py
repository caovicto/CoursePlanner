##################################################
# \file Scraper.py
#
# \brief Class for scraping from website
##################################################

import json
import re
from time import sleep

from termcolor import colored
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


# scraper object for scraping profile #
class Scraper:
    def __init__(self):
        self.driver = webdriver.Chrome(executable_path="/usr/lib/chromium-browser/chromedriver")

    def CollectCourses(self):
        """

        :return:
        :rtype:
        """
        # entering driver information
        self.driver.get("https://reg.msu.edu/Courses/Search.aspx")

        selections = self.driver.find_element_by_id("MainContent_ddlSubjectCode")
        options = [x for x in selections.find_elements_by_tag_name("option")]

        # looping through all subjects
        for text in range(20, len(options)):
            # collect subject code
            subjectElement = options[text]
            optionText = subjectElement.get_attribute("innerHTML")

            try:
                # selecting subject code
                subjectElement.click()

                # submission
                self.driver.find_element_by_xpath("//input[@id='MainContent_btnSubmit']").click()

                # wait until body has loaded and contains subject information
                sleep(3)

                # scraping information
                optionText = re.sub(r'(&nbsp;)+', ':', optionText)
                info = optionText.split(":")
                print(info)

                courses = self.driver.find_element_by_id("MainContent_divSearchResults")
                # print(courses.text)

                subject = {
                    'code': info[0],
                    'name': info[1],
                    'courses': self.ScrapeCourse(courses.text)
                }


                if len(subject['courses']):
                    file = open('../data/courses/'+subject['code']+'.json', 'w+')
                    json.dump(subject, file)

                    print("Created ", colored(file, 'green'))



            except (NoSuchElementException, TimeoutException) as e:
                pass

            # sleep(10)
            # break

    def ScrapeCourse(self, text):
        """

        :param text:
        :type text:
        :return:
        :rtype:
        """

        # grab degree content
        text = "\n".join(text.split("\n")[1:])
        courses = text.split("\n\n\n")

        courseJSON = {}

        for courseText in courses:
            firstLine = courseText.split("\n")[0]
            code = "".join(firstLine.split(" ")[:2])
            name = " ".join(firstLine.split(" ")[2:])

            info = re.split(':|\n|(\s\s+)', "\n".join(courseText.split("\n")[1:]))
            info = [name for name in info if name and name.strip()]

            # SEMESTER
            try:
                semester = info[info.index("Semester")+1]
            except ValueError:
                break

            # Description
            try:
                description = info[info.index("Description") + 1]
            except ValueError:
                break

            # Credits
            try:
                credits = info[info.index("Total Credits") + 1]
            except ValueError:
                credits = info[info.index("Credits") + 1]


            # PREREQUISITE
            try:
                prerequisite = info[info.index("Prerequisite") + 1]
            except ValueError:
                prerequisite = ""

            # RESTRICTIONS
            try:
                restrictions = info[info.index("Restrictions") + 1]
            except ValueError:
                restrictions = ""

            # ALIAS
            try:
                alias = info[info.index("Semester Alias") + 1]
            except ValueError:
                alias = ""

            # EXCLUDE
            try:
                exclude = info[info.index("Not open to students with credit in") + 1]
            except ValueError:
                exclude = ""

            # Create new course
            newCourse = {
                'name': name,
                'semester': semester,
                'credits': credits,
                'description': description,
                'prerequisite': prerequisite,
                'restrictions': restrictions,
                'alias': alias,
                'exclude': exclude
            }

            # strip out empty fields
            newCourse = {k: v for k, v in newCourse.items() if v != ""}

            courseJSON[code] = newCourse

        return courseJSON


    def Close(self):
        self.driver.close()


################################################################
#
#       RUNNING PROGRAM
#
#
################################################################

def main():
    scraper = Scraper()
    scraper.CollectCourses()
    scraper.Close()


if __name__ == "__main__":
    main()
