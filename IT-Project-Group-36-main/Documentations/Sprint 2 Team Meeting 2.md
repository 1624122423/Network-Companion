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
