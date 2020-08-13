 
##################################################
# \file Scraper.py
#
# \brief Class for scraping from website
##################################################

import json
import re
from termcolor import colored
from selenium import webdriver



# scraper object for scraping profile #
class Scraper:
    def __init__(self):
        self.driver = webdriver.Chrome(executable_path="/usr/lib/chromium-browser/chromedriver")

    def CollectPrograms(self):
        """

        :return:
        :rtype:
        """
        # entering driver information
        self.driver.get("https://reg.msu.edu/AcademicPrograms/Programs.aspx?PType=MNUN")
        
        contents = self.driver.find_element_by_xpath("//div[@id='MainContent_divData']")
        links = [ele.get_attribute("href") for ele in contents.find_elements_by_xpath("//a")]

        for link in links:
            if link.find("Program=") != -1:
                self.ScrapeProgram(link)


    def ScrapeProgram(self, link):
        """

        :param link:
        :type link:
        :return:
        :rtype:
        """
        self.driver.get(link)

        # initializing json info
        program = {}
        program['requirement'] = []

        # grab degree content
        content = self.driver.find_element_by_xpath("//div[@id='MainContent_divDnData']")
        rows = content.text.split("\n\n")

        for i in range(0, len(rows)):
            # get degree name and credits
            if i == 0:
                textBlock = rows[i].split('(')
                program['name'] = textBlock[0]

                textBlock = rows[i].split()
                program['credits'] = textBlock[textBlock.index("Credits:")+1]

            # get degree requirements
            else:
                requirement = self.ParseRequirement(rows[i])
                if requirement.get('name') and (requirement['name'] != 'University Residency' or requirement['name'] != 'University Diversity Distribution'):
                    program['requirement'].append(requirement)


        if len(program['requirement']):
            # write program info to file
            fileName = '_'.join(re.findall(r"(\w+)", program['name']))

            file = open('../data/minors/'+fileName+'.json', 'w+')
            json.dump(program, file)

            print("Created ", colored(fileName, 'green'))



    def ParseRequirement(self, textBlock):
        """

        :param textBlock:
        :type textBlock:
        :return:
        :rtype:
        """
        # initialize requirement set
        requirement = {}
        requirement['requirement'] = []
        rows = textBlock.split(': ')

        # grab requirements options
        for i in range(0, len(rows)):
            # init requirement name
            if i == 1:
                requirement['name'] = rows[i].split('\n')[0]

            # get requirement options
            else:
                possibleSet = []
                for row in re.findall(r"(\d{1,2}\ \w+\ from.*)", rows[i]):
                    parsedRow = row.split(' from ')
                    reqSet = {}

                    reqSet['type'] = "credit" if parsedRow[0].find('credit') != -1 else "course"
                    reqSet['number'] = parsedRow[0].split(' ')[0]

                    reqSet['courses'] = (parsedRow[1].split(','))

                    possibleSet.append(reqSet)

                if len(possibleSet):
                    requirement['requirement'].append(possibleSet)

        # for ele in requirement['requirement']:
        #     print(ele)

        return requirement



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
    scraper.CollectPrograms()
    scraper.Close()


if __name__ == "__main__":
    main()

