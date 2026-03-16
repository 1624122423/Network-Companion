Meeting 1: 

Date: September 20th, starts at 4:30PM, countinues for around 1 hour.

Participants: all team members

Goals: Based on the comments of progress report 1, make inmprovements.

Disccussion topics: 
Github: Each person creates a branch or each function gets a branch

Kanban Board: use jira or trello to record the progress of the sprint and align with the weekly stand up meetings.

Tooliustification: give detailed explaination of each choice of the tools.

Use Case Diagram and low-fi high-fi designs: he current diagram is incomplete — it’s missing users and the database. Update it so it properly reflects the system. And there is not enough low-fi and high-fi designs.

Team meeting records: records are not deatiled enough. More deatils should be recorded.

Coding convention: missing coding convention on naming, formatting, commenting. 

Stand up meeting : should be in more depth and strcuture.


Decisions: 
Github branches are setup. Each different function gets a individual branch. After the fucntion is done, merge into dev branch and after all testing, merge into main.
Use Jira for Kanban board to record and keep track of the sprints. Mark will organise it. link: https://itprojectgroup36.atlassian.net/jira/software/projects/KAN/boards/1?atlOrigin=eyJpIjoiYjk4MWUyZjhmNDFmNDFmMzhhOWU3MDA0NDM3NDdlM2MiLCJwIjoiaiJ9
Tool justification should be explained in detail as a txt file,Josh will be responsible for that.
Brainstorm for the usecase diagrams. For the hi-fi and low-fi designs, use figma. Tony will be responsible for the use case diagram, Desmond and Andrew will be going through the hi-fi and low-fi designs.
Team meetings should be documented in more detail and place with all other materials in the same place, which we plan to all put into the github repository.
Coding conventions should be set and all coding work should follow the coding convention. After the discussion in detail, Josh will be putting everything into one piece. 





Meeting 2:

Date: September 24th, 2pm

Participants: all team members

Goal(s):  Discussion of technical details regarding the project 

Discussion topics: 

Database usage: MySQL vs mongoengine

User Authentication: JWT vs Session Cookies

Discussion: 
the pros and cons of SQL approach vs NoSQL approach
SQL: Fixed schema, must define tables and columns before inserting data
NoSQL: flexible schema, data can vary in structure
Use NoSQL approach (mongoengine) for rapid development as we are short on time

Mark has more experience with mongoengine, more confident to work with this

the pros and cons of JWT vs Session Cookies
JWT is stateless so it doesn't take up too much memory from server, 
where as sessions are stateful and all servers need to keep track of each sessions
JWT is harder to implement than sessions as we have to keep track of revoked tokens to invalidate,
in a way is also stateful

Plans: 
For database use mongoengine
For user authentication use the session cookies approach
