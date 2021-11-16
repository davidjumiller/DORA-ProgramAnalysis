Use this file to commit information clearly documenting your milestones'
content. If you want to store more information/details besides what's required
for the milestones that's fine too. Make sure that your TA has had a chance to
sign off on your milestones each week (before the deadline); typically you
should discuss your material with them before finalizing it here.


# Milestone 1

## Probable Ideas for the Project

List of ideas being considered:

- NodeJS Packages Analyser
  - Provide link to a public github repo
  - Program looks at the code and package.json file to find:
    - Packages unused in actual code.
    - List of packages with known vulnerabilities
    - Total size of the program when all packages/dependencies are installed.
    - Displays the hierarchy of dependencies/packages (diagram).


- JavaScript/NodeJS Functional Program Visualizer
  - Provide a link to a public github repo.
  - Get a UML-Like diagram showing the relationships between different modules/functions in the code.
    - Or on TS/Python if we want to work with OOP instead.
  - Easily identify redundant code in large projects.

- JavaScript - Programmer’s Frustration Analyser 😂
  - For programmers frustrated by job interviews
  - Given a Github repo
  - Looks at and visualises:
    - How many times did engineers have to invert a binary tree?
    - How many times did they reverse a linkedList?
    - Did anyone talk about BigO notation in the comments?
    - etc...

- Memory leak/code vulnerability analyzer? (e.g. Valgrind on C++/C, but much simpler, or maybe with other language -- security/vulnerabilities)
  - If there are existing packages, we can use them to get stats on these info then do visualization

### Other Ideas that can be looked into further:
- General ideas on (static) program analyzer + visualization:
    - Performance of different APIs/features for that program
    - Unused imports, variables, etc. + visualization on how many of them are coming from each file in the program
    - Code style consistency between files in a program (e.g. indentation level, type of comment--e.g. Line comments vs block of comments)

## To-do
- Think about a few more ideas
- Bring ideas to the the TA on tuesday
- Finalize an idea for milestone 2


# Milestone 2

## Description of Idea
- JavaScript Functional Program Visualizer
  - User provides a link to a public Github repository. 
  - The program generates a visualization showing the relationships between different modules in the code (that is written in a functional fashion).
  - Between modules (that are not third-party) in the code, the visualization will also show which functions and properties are used.
  - The purpose of the program is to help identify redundant code in large projects and aid in making refactoring decisions.

## TA Feedback
- All ideas except for #2 are either not valid or too complicated for this project
- For #2 it's important to be accurate when checking which calls are going where, for example be careful of multiple functions of the same name (overriding, overloading)

## Responsibilities 
- Everyone
  - Attend weekly meetings, monday + thursday
- David
  - Milestone submissions
  - Engine
- Dhruv
  - Visualizer
  - Arrange 1-2 user(s) for the final user study.
- Howard
  - Video
  - Fetching Service (or Upload)
- Michelle
  - Engine
  - Arrange 1 user for the first user study

## Roadmap
- Research - By Monday, Nov 7
  - Import/export syntax possibilities in Javascript based on specs provided by W3C and Linux Foundation.
  - Identify appropriate libraries for AST parsing
    - acorn?--AST looks “clean” but doesn’t seem to support parsing of “import” statements according to astexplorer.net
    - typescript--more detailed info from the AST, may contain more unnecessary data in the AST, but can support parsing for pretty much any type of JS code.
    - flow--type inference
  - Identify appropriate format and mechanism for generating the visualisation graph.
  - Identify mechanism to fetch and read source code from Github.
- First User study
  - Modify the design based on the first user study
- Implementation
  - Fetching Service (Or only upload?)
    - Downloads source code from provided Github repository (only .js files?)
  - Engine
    - Checks the package.json file to determine third-party packages?
    - Iterates through the source tree of JS files, parses them and identifies the relationships between each of the modules and their functions. 
  - Visualizer (https://modeling-languages.com/javascript-drawing-libraries-diagrams/)
    - Displays visual representation of the relationships in the parsed JS code

# Milestone 3

## Mockup

DHRUV UPLOADS HERE THX

## Notes on first user study

Still in progress, expect in a few hours

## Changes to original design

 - Visualization changes were made, we originally intended to have an arrow going from every call to every callee, but this would end up being a lot of arrows. For less clutter we have arrows only between each file with additional information on click.

- Further added a sidebar with the ability to hide the modules contained in a certain directory to help the user navigate the visualization better and reduce visual overload

## Progress so far

- Fetching service - saves js files found on github to our designated folder.
- Visualizer - design finalized for the most part (See Mockup), json input sent from engine also mostly finalized.
- Engine - File input and AST generation finished, AST Visitor and JSON output in progress.

## Working JSON input to visualizer

    [
      {
          "id": 1,
          "filePath": "/src/app.js",
          "functions": [
              {
                  "signature": "foo(x)",
                  "calledBy": [
                      {
                          "id": 2,
                          "atLineNum": [
                              100,
                              152
                          ],
                          "countRefs": "3"
                      },
                      {
                          "id": 3,
                          "atLineNum": [
                              10
                          ],
                          "countRefs": "1"
                      }
                  ]
              },
              {
                  "signature": "foo(x, y)",
                  "calledBy": [
                      {
                          "id": 2,
                          "atLineNum": [
                              102
                          ],
                          "countRefs": "1"
                      }
                  ]
              }
          ],
          "importedInFiles": [
              2,
              3,
              5,
              10
          ]
      },
      {
          "id": 2,
          "filePath": "/lib/haha.js",
          "functions": [
              {
                  "signature": "blah(x)",
                  "calledBy": [
                      {
                          "id": 3,
                          "atLineNum": [
                              110,
                              125
                          ],
                          "countRefs": "2"
                      },
                      {
                          "id": 10,
                          "atLineNum": [
                              1
                          ],
                          "countRefs": "1"
                      }
                  ]
              },
              {
                  "signature": "bobTheBuilder(x, y)",
                  "calledBy": [
                      {
                          "id": 3,
                          "atLineNum": [
                              100
                          ],
                          "countRefs": "1"
                      }
                  ]
              }
          ],
          "importedInFiles": [
              3,
              5,
              10
          ]
      }
    ]

## Due dates:
- Milestone 3: Monday, Nov. 15th
- Milestone 4: Friday, Nov. 19th
- Milestone 5: Friday, Nov. 26th
- Project: Wednesday Dec. 1st (8:59am)



