# DORA Project

(Diagrammatic Observed Relationship Analyser)


Deployment Details: <a href="https://dora-rho.vercel.app/"> Demo Link </a>


## Context
This project is aimed at building a tool that helps visualise a JavaScript application to aid in understanding a program and further identifying redundant code.
The project works with both functional and oop-style code with support for class inhieritance. It is ideal for visualising small to mid-sized projects.

## Usage & Limitations

Our programmer analyzer statically analyzes JavaScript (JS) files in a repo and generates relationship diagram from the static analysis. 

To generate an analysis for a repo of your choice, copy & paste the GitHub link to the selected repo to the input textbox and hit the analyse button. Nodes on the diagram can be clicked to reveal more information about the relationship of a file, its functions and generate call graph for a particular function. 

For the analysis to work properly, the repo for analysis must satisfy the following restrictions:

* The repo must be published on GitHub (not GitHub Enterprise) as a public repo.

* Any file ending in strictly .js (excluding files ending in *.min.js, *.d.js, etc.) must contain plain JS code (e.g. JS files that contain React components are not supported for analysis) that follow the syntax of the latest "stage 4" (i.e. finalized) ECMAScript.

* All JS files must be written as JS modules (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules - modules_and_classes). In particular, they should not contain any code that results in errors under the "strict mode" (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode). For example, any line that attempts to delete a variable will result in an error from the underlying AST generator used by this program analyzer (acorn.js).


Examples of compatible repos:
* https://github.com/giovanimdelcol/pirpleassignment4
* https://github.com/giovanimdelcol/pirpleassignment3

## Final User Studies
Users (Both JavaScript Developers): Attempt to analyse at least one JavaScript repository of your choice, conforming to ‘strict mode’ requirements. Comment on the usefulness and accuracy of the tool.

Comments from User 1:

* The tool provided is useful for determining the relationships between various files in a JavaScript program.
* It can serve as a good first introduction to small open-source projects on GitHub, such that a new contributor can familiarize themselves.
* The tool still needs some refinement as the information displayed about function usage is not always accurate.

Comments from User 2: 

* Relationships displayed between files give a good first-time overview to unknown projects on Github.
* The tool is able to process multiple programming styles with decent accuracy.
* I observed some discrepancies in the number of references counted by the tool in the function usage section. However, it still gives a fair idea of how an import is used.
* It is somewhat restrictive that it only supports repos adhering to strict mode and therefore, is not compatible with a significant number of repos.

## Effort on first user study

* Based on the inital user study, efforts were made to simplfy the visualisation and UI.



