export interface InternshipTemplate {
  title: string;
  field: string;
  tasks: TaskTemplate[];
}

export interface TaskTemplate {
  dayNumber: number;
  title: string;
  description: string;
  instructions: string;
}

const webDevTasks: TaskTemplate[] = [
  {
    dayNumber: 1,
    title: "Introduction to HTML Structure",
    description: "Learn the fundamentals of HTML and create your first webpage structure.",
    instructions: "Create an HTML page with a proper doctype, head, and body. Include a navigation bar, a hero section with a heading and paragraph, and a footer. Submit your HTML code below.",
  },
  {
    dayNumber: 2,
    title: "Styling with CSS",
    description: "Apply CSS styles to make your HTML page visually appealing.",
    instructions: "Add CSS styles to the page you created yesterday. Include: custom colors, fonts, padding, margins, and make the page responsive using media queries. Submit your CSS code.",
  },
  {
    dayNumber: 3,
    title: "CSS Flexbox & Grid",
    description: "Master modern CSS layout techniques with Flexbox and Grid.",
    instructions: "Create a 3-column card layout using CSS Grid and a navigation bar using Flexbox. The layout should be responsive and collapse to a single column on mobile. Submit your code.",
  },
  {
    dayNumber: 4,
    title: "JavaScript Basics",
    description: "Learn JavaScript fundamentals: variables, functions, and DOM manipulation.",
    instructions: "Write a JavaScript program that: (1) Creates an array of 5 items, (2) Displays them in a list on the page, (3) Allows users to add new items via an input and button. Submit your JS code.",
  },
  {
    dayNumber: 5,
    title: "JavaScript DOM Events",
    description: "Handle user interactions using JavaScript event listeners.",
    instructions: "Build an interactive quiz with 3 questions. When the user answers, highlight correct/wrong answers and show a score at the end. Use event listeners and DOM manipulation. Submit your code.",
  },
  {
    dayNumber: 6,
    title: "Fetch API & REST Basics",
    description: "Learn to fetch data from APIs and display it dynamically.",
    instructions: "Use the Fetch API to call https://jsonplaceholder.typicode.com/posts and display the first 10 posts in a styled card grid. Include loading and error states. Submit your code.",
  },
  {
    dayNumber: 7,
    title: "Introduction to React",
    description: "Get started with React.js and component-based architecture.",
    instructions: "Create a React application with 3 components: Navbar, Card, and Footer. The Card component should accept props (title, description, imageUrl). Render 3 cards with different content. Submit your code.",
  },
  {
    dayNumber: 8,
    title: "React State & Hooks",
    description: "Master React useState and useEffect hooks for dynamic apps.",
    instructions: "Build a task manager app in React with useState. Users should be able to add tasks, mark them as complete (strikethrough), and delete them. Use useEffect to save tasks to localStorage. Submit your code.",
  },
  {
    dayNumber: 9,
    title: "React Router & Navigation",
    description: "Implement multi-page navigation with React Router.",
    instructions: "Add React Router to your app. Create Home, About, and Projects pages. The Navbar should have links to each page. Implement an active link style. Submit your code.",
  },
  {
    dayNumber: 10,
    title: "Forms & Validation",
    description: "Build forms with proper validation and user feedback.",
    instructions: "Create a registration form with fields: name, email, password, confirm password. Implement client-side validation: show error messages for empty fields, invalid email, and passwords that don't match. Submit your code.",
  },
  {
    dayNumber: 11,
    title: "REST API Integration",
    description: "Connect your React frontend to a REST API backend.",
    instructions: "Create a React app that fetches users from https://jsonplaceholder.typicode.com/users, displays them in a table with search/filter functionality, and shows user details in a modal when clicked. Submit your code.",
  },
  {
    dayNumber: 12,
    title: "Authentication UI",
    description: "Implement a complete login and registration flow.",
    instructions: "Build a complete auth flow: Login page, Register page, and a protected Dashboard. Store a fake JWT token in localStorage on 'login'. Redirect authenticated users away from login page. Submit your code.",
  },
  {
    dayNumber: 13,
    title: "Final Project - Part 1",
    description: "Start building your capstone project: a full-featured web application.",
    instructions: "Plan and begin building a Blog application. Create: (1) A homepage listing all blog posts fetched from API, (2) A post detail page, (3) A form to create new posts. Use React Router for navigation. Submit your initial code.",
  },
  {
    dayNumber: 14,
    title: "Final Project - Part 2 & Deployment",
    description: "Complete and deploy your capstone project.",
    instructions: "Finish your Blog application. Add: (1) Edit and delete post functionality, (2) CSS animations and transitions, (3) Responsive design for all screen sizes, (4) Deploy it to Vercel or Netlify. Submit your deployed URL and final code.",
  },
];

export const internshipTemplates: InternshipTemplate[] = [
  {
    title: "Web Development Internship",
    field: "Web Development",
    tasks: webDevTasks,
  },
];

export function getRandomInternship(): InternshipTemplate {
  return internshipTemplates[0];
}
