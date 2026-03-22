import { db, usersTable, internshipTemplatesTable, taskTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const WEB_DEV_TASKS = [
  { dayNumber: 1, title: "Introduction to HTML Structure", description: "Learn the fundamentals of HTML and create your first webpage structure.", instructions: "Create an HTML page with a proper doctype, head, and body. Include a navigation bar, a hero section with a heading and paragraph, and a footer. Submit your HTML code below." },
  { dayNumber: 2, title: "Styling with CSS", description: "Apply CSS styles to make your HTML page visually appealing.", instructions: "Add CSS styles to the page you created yesterday. Include: custom colors, fonts, padding, margins, and make the page responsive using media queries. Submit your CSS code." },
  { dayNumber: 3, title: "CSS Flexbox & Grid", description: "Master modern CSS layout techniques with Flexbox and Grid.", instructions: "Create a 3-column card layout using CSS Grid and a navigation bar using Flexbox. The layout should be responsive and collapse to a single column on mobile. Submit your code." },
  { dayNumber: 4, title: "JavaScript Basics", description: "Learn JavaScript fundamentals: variables, functions, and DOM manipulation.", instructions: "Write a JavaScript program that: (1) Creates an array of 5 items, (2) Displays them in a list on the page, (3) Allows users to add new items via an input and button. Submit your JS code." },
  { dayNumber: 5, title: "JavaScript DOM Events", description: "Handle user interactions using JavaScript event listeners.", instructions: "Build an interactive quiz with 3 questions. When the user answers, highlight correct/wrong answers and show a score at the end. Use event listeners and DOM manipulation. Submit your code." },
  { dayNumber: 6, title: "Fetch API & REST Basics", description: "Learn to fetch data from APIs and display it dynamically.", instructions: "Use the Fetch API to call https://jsonplaceholder.typicode.com/posts and display the first 10 posts in a styled card grid. Include loading and error states. Submit your code." },
  { dayNumber: 7, title: "Introduction to React", description: "Get started with React.js and component-based architecture.", instructions: "Create a React application with 3 components: Navbar, Card, and Footer. The Card component should accept props (title, description, imageUrl). Render 3 cards with different content. Submit your code." },
  { dayNumber: 8, title: "React State & Hooks", description: "Master React useState and useEffect hooks for dynamic apps.", instructions: "Build a task manager app in React with useState. Users should be able to add tasks, mark them as complete (strikethrough), and delete them. Use useEffect to save tasks to localStorage. Submit your code." },
  { dayNumber: 9, title: "React Router & Navigation", description: "Implement multi-page navigation with React Router.", instructions: "Add React Router to your app. Create Home, About, and Projects pages. The Navbar should have links to each page. Implement an active link style. Submit your code." },
  { dayNumber: 10, title: "Forms & Validation", description: "Build forms with proper validation and user feedback.", instructions: "Create a registration form with fields: name, email, password, confirm password. Implement client-side validation: show error messages for empty fields, invalid email, and passwords that don't match. Submit your code." },
  { dayNumber: 11, title: "REST API Integration", description: "Connect your React frontend to a REST API backend.", instructions: "Create a React app that fetches users from https://jsonplaceholder.typicode.com/users, displays them in a table with search/filter functionality, and shows user details in a modal when clicked. Submit your code." },
  { dayNumber: 12, title: "Authentication UI", description: "Implement a complete login and registration flow.", instructions: "Build a complete auth flow: Login page, Register page, and a protected Dashboard. Store a fake JWT token in localStorage on 'login'. Redirect authenticated users away from login page. Submit your code." },
  { dayNumber: 13, title: "Final Project - Part 1", description: "Start building your capstone project: a full-featured web application.", instructions: "Plan and begin building a Blog application. Create: (1) A homepage listing all blog posts fetched from API, (2) A post detail page, (3) A form to create new posts. Use React Router for navigation. Submit your initial code." },
  { dayNumber: 14, title: "Final Project - Part 2 & Deployment", description: "Complete and deploy your capstone project.", instructions: "Finish your Blog application. Add: (1) Edit and delete post functionality, (2) CSS animations and transitions, (3) Responsive design for all screen sizes, (4) Deploy it to Vercel or Netlify. Submit your deployed URL and final code." },
];

const DATA_SCIENCE_TASKS = [
  { dayNumber: 1, title: "Python Basics & Setup", description: "Set up your Python environment and learn core syntax.", instructions: "Install Python and Jupyter Notebook. Write a Python script that: creates variables of each type (int, float, str, list, dict), implements a function that takes a list of numbers and returns their mean, median, and mode. Submit your script." },
  { dayNumber: 2, title: "Data Manipulation with Pandas", description: "Load and manipulate datasets using the Pandas library.", instructions: "Using pandas, load the Titanic dataset (from seaborn.load_dataset('titanic')). Perform: (1) Display first 5 rows, (2) Count missing values per column, (3) Fill missing 'age' with median, (4) Filter passengers who survived and were older than 30. Submit your code." },
  { dayNumber: 3, title: "Data Visualization with Matplotlib", description: "Create insightful charts and graphs from data.", instructions: "Using the Titanic dataset, create 3 charts with Matplotlib: (1) Bar chart showing survival count by gender, (2) Histogram of passenger ages, (3) Pie chart of passenger class distribution. Add titles, labels, and save as PNG. Submit your code." },
  { dayNumber: 4, title: "Statistical Analysis", description: "Apply statistical concepts to draw insights from data.", instructions: "Analyze a sales dataset (create sample data with 100 rows). Calculate: mean, median, standard deviation for revenue. Perform a t-test comparing two groups. Create a correlation matrix heatmap using seaborn. Submit your code and findings." },
  { dayNumber: 5, title: "Data Cleaning & Preprocessing", description: "Learn essential data cleaning techniques for real-world datasets.", instructions: "Create a messy dataset with missing values, duplicates, and inconsistent formats. Then: (1) Remove duplicates, (2) Handle missing values (different strategies), (3) Normalize numeric columns, (4) Encode categorical variables. Submit your code." },
  { dayNumber: 6, title: "Machine Learning Basics with Scikit-learn", description: "Build your first machine learning model.", instructions: "Using the Iris dataset, build a classification model: (1) Split data into train/test (80/20), (2) Train a Decision Tree Classifier, (3) Evaluate with accuracy score, confusion matrix, and classification report, (4) Try improving with Random Forest. Submit your code and comparison." },
  { dayNumber: 7, title: "Linear & Logistic Regression", description: "Implement regression models for prediction tasks.", instructions: "Create two projects: (1) Linear Regression - predict house prices using area, rooms, age as features, evaluate with MSE and R², (2) Logistic Regression - predict loan approval (binary) with a sample dataset. Compare model performance. Submit your code." },
  { dayNumber: 8, title: "Feature Engineering", description: "Transform raw data into powerful features for ML models.", instructions: "Take a raw dataset of customer transactions. Create new features: (1) Transaction frequency per user, (2) Average transaction value, (3) Days since last purchase, (4) Seasonal flags. Use these features to improve a model vs. baseline. Submit your comparison." },
  { dayNumber: 9, title: "Natural Language Processing Basics", description: "Analyze text data using NLP techniques.", instructions: "Collect 50 product reviews (real or synthetic). Implement: (1) Tokenization and stop word removal, (2) TF-IDF vectorization, (3) Sentiment classification (positive/negative) using Naive Bayes. Evaluate accuracy. Submit your code." },
  { dayNumber: 10, title: "Final Data Science Project", description: "Apply all skills in a comprehensive end-to-end project.", instructions: "Choose a dataset from Kaggle or UCI ML Repository. Complete a full project: (1) EDA with at least 5 visualizations, (2) Data cleaning and feature engineering, (3) Train at least 3 different models, (4) Compare results, (5) Write a short report of findings. Submit code + report." },
];

const UI_UX_TASKS = [
  { dayNumber: 1, title: "Design Thinking Fundamentals", description: "Learn the 5 stages of design thinking and how to apply them.", instructions: "Choose a real-world problem (e.g., ordering food online). Apply design thinking: (1) Write an empathy map for 2 user personas, (2) Define the core problem statement (HMW format), (3) Sketch 5 different solution ideas. Submit your sketches and notes." },
  { dayNumber: 2, title: "UI Principles & Color Theory", description: "Learn core UI principles: hierarchy, contrast, spacing, and color.", instructions: "Analyze 3 popular websites (e.g., Airbnb, Stripe, Notion). For each: (1) Identify the primary color palette (extract hex codes), (2) Note how visual hierarchy is created, (3) Identify spacing system (4px/8px grid?). Then recreate one hero section in Figma. Submit screenshots + Figma link." },
  { dayNumber: 3, title: "Wireframing & Low-Fidelity Prototypes", description: "Create wireframes for a mobile app.", instructions: "Design a food delivery app. Create low-fidelity wireframes for: (1) Home/browse screen, (2) Restaurant detail screen, (3) Cart screen, (4) Checkout screen. Use Figma, Whimsical, or paper. Focus on layout and user flow, not visuals. Submit your wireframes." },
  { dayNumber: 4, title: "High-Fidelity UI Design", description: "Transform wireframes into polished, pixel-perfect designs.", instructions: "Take your wireframes from Day 3 and create high-fidelity mockups in Figma for at least 3 screens. Apply: (1) A consistent color palette, (2) Typography hierarchy (h1/h2/body/caption), (3) Consistent component spacing, (4) Custom icons or illustrations. Submit your Figma link." },
  { dayNumber: 5, title: "Interactive Prototyping", description: "Make your designs clickable and interactive.", instructions: "In Figma, connect your 4 screens with prototype interactions: (1) Click restaurant card → restaurant detail, (2) Add item → updates cart badge, (3) Go to cart → checkout flow, (4) Add a micro-animation (button press state). Share the prototype link. Submit link." },
  { dayNumber: 6, title: "Usability Testing & UX Research", description: "Conduct usability tests and analyze user feedback.", instructions: "Share your prototype with 3+ people (friends/family). Create a test script with 5 tasks (e.g., 'Find a pizza restaurant and add to cart'). Record: (1) Time to complete each task, (2) Where users get confused, (3) User feedback. Write a 300-word analysis. Submit your findings." },
  { dayNumber: 7, title: "Final UI/UX Case Study", description: "Document your design process as a professional case study.", instructions: "Create a complete case study for your food delivery app: (1) Problem statement and user research, (2) Wireframes → high-fi evolution, (3) Key design decisions and rationale, (4) Usability test results and iterations, (5) Final prototype. Present in a PDF or Notion page. Submit your case study." },
];

export async function seedDatabase() {
  // Seed internship templates if none exist
  const existingTemplates = await db.select({ id: internshipTemplatesTable.id })
    .from(internshipTemplatesTable)
    .limit(1);

  if (existingTemplates.length === 0) {
    console.log("Seeding internship templates...");

    const [webDev] = await db.insert(internshipTemplatesTable).values({
      title: "Web Development Internship",
      field: "Web Development",
      description: "A comprehensive 14-day internship covering HTML, CSS, JavaScript, and React. Perfect for beginners wanting to build real web applications.",
      isActive: true,
    }).returning();

    await db.insert(taskTemplatesTable).values(
      WEB_DEV_TASKS.map(t => ({ ...t, internshipTemplateId: webDev.id }))
    );

    const [dataSci] = await db.insert(internshipTemplatesTable).values({
      title: "Data Science Internship",
      field: "Data Science",
      description: "A 10-day hands-on internship covering Python, Pandas, data visualization, and machine learning fundamentals.",
      isActive: true,
    }).returning();

    await db.insert(taskTemplatesTable).values(
      DATA_SCIENCE_TASKS.map(t => ({ ...t, internshipTemplateId: dataSci.id }))
    );

    const [uiux] = await db.insert(internshipTemplatesTable).values({
      title: "UI/UX Design Internship",
      field: "UI/UX Design",
      description: "A 7-day design internship covering design thinking, wireframing, Figma, and usability testing for real product design skills.",
      isActive: true,
    }).returning();

    await db.insert(taskTemplatesTable).values(
      UI_UX_TASKS.map(t => ({ ...t, internshipTemplateId: uiux.id }))
    );

    console.log("Internship templates seeded successfully.");
  }

  // Seed default admin user if none exists
  const existingAdmin = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.isAdmin, true))
    .limit(1);

  if (existingAdmin.length === 0) {
    console.log("Creating default admin user...");
    const passwordHash = await bcrypt.hash("admin123", 12);

    // Get first active internship to assign to admin
    const [template] = await db.select().from(internshipTemplatesTable).where(eq(internshipTemplatesTable.isActive, true)).limit(1);
    const totalTasks = template ? (await db.select().from(taskTemplatesTable).where(eq(taskTemplatesTable.internshipTemplateId, template.id))).length : 0;

    await db.insert(usersTable).values({
      name: "Admin",
      email: "admin@internhub.com",
      passwordHash,
      isAdmin: true,
      internshipTitle: template?.title ?? "Web Development Internship",
      internshipField: template?.field ?? "Web Development",
      totalTasks,
      progress: 0,
      tasksCompleted: 0,
      certificateGenerated: false,
    });
    console.log("Admin user created: admin@internhub.com / admin123");
  }
}
