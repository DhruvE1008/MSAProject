# Introduction
ClassConnect is a full-stack web application for students to get help with their courses through participating in course chats and discussions with classmates and to find and make meaningful connections with other users on the platform.

# How the Project relates to the Theme
Since the theme for phase 2 is "Networking", I decided to go with an academic tool that can help create social connections and provide help with other students who would be doing similar courses to them. 
The project's purpose was to:
- Make it easier for users to get help with their coursework
- Find others with similar interests
- Participate in course discussions

These points perfectly tie into the networking theme, as they help facilitate academic and social connections between the users of my platform.

# Interesting Features
- Connection Recommendations: There are recommended connection suggestions based on the courses users have in common.
- Live Chats: There are live chats for courses and private chats between connections, which do not require the page to refresh, as it makes it easier for the user to chat with others when they see the messages appear in real time.
- Real Time Connection Updates: Updates for connections, such as when users send, accept, and deny requests, happen in real time.

# Basic Requirements
- Frontend: 
    - My project is a full-stack application that uses React with TypeScript 
    - Uses the React Router library to navigate pages across my project
    - Uses Tailwind CSS to style the Frontend.
- Backend:  
    - C# with .NET 9 
    - EF Core to connect to my PostgreSQL database. 
- It has a visually appealing and responsive UI on both desktop and mobile. 
- I implemented CRUD functionality for my courses and connections, where users can create, read, update, and delete courses and connections.
- I deployed my Frontend via Vercel, and I deployed my backend and hosted my PostgreSQL on Render.

# Advanced Requirements
- Integrate all UI components with Storybook: All my key UI components have a story component and have been tried and isolatedly tested through Storybook.
- Support for theme switching (e.g., light/dark mode): In the top right, there is a button that the user can use to change the appearance mode. I also made it so that the icon changes according to the mode.
- Implement WebSockets: I implemented WebSockets via SignalR so that all chat rooms were live and all connection requests and acceptances/rejections happened in real time, so the user did not have to refresh the page to see any changes.

# Local Set Up Instructions
After cloning the repository and getting into the MSAProject Folder.
Place the following files in their respective directories:

ClassConnectFrontend/<br>
├── .env.development <br>
└── .env.production

ClassConnectBackend/ <br>
    └── appsettings.Development.json

Open **two terminal windows** and run the following commands:

### Terminal 1 – Frontend

    cd ClassConnectFrontend
    npm install
    npm run dev

### Terminal 2 – Backend

    cd ClassConnectBackend
    dotnet run


The frontend runs at:
http://localhost:3000

The backend runs at:
http://localhost:5082
