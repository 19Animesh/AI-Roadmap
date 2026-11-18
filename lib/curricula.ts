export interface PhaseSampleTask {
  title: string;
  minutes: number;
  resource: string;
  hint: string;
  description: string;
}

export interface CurriculaPhase {
  id: string;
  name: string;
  days: number;
  milestones: string[];
  deliverable: string;
  sampleDailyTasks: PhaseSampleTask[];
}

export interface CurriculaTrack {
  roleName: string;
  description: string;
  defaultTimelineDays: number;
  phases: CurriculaPhase[];
}

export const PREDEFINED_CURRICULA: Record<string, CurriculaTrack> = {
  "frontend-developer": {
    roleName: "Frontend Developer",
    description: "Component architecture, modern TypeScript, React, state management, and web performance.",
    defaultTimelineDays: 60,
    phases: [
      {
        id: "phase-1",
        name: "Phase 1: Semantic Web & Layout Systems",
        days: 14,
        milestones: [
          "Semantic HTML5 & Accessible ARIA patterns",
          "CSS Grid and Flexbox responsive layouts",
          "Responsive typography and fluid sizing",
          "Git repository workflow and static hosting",
        ],
        deliverable: "You will be able to build pixel-perfect, accessible, responsive interfaces from design specifications.",
        sampleDailyTasks: [
          {
            title: "Construct responsive dashboard layout with pure CSS Grid",
            minutes: 60,
            resource: "MDN CSS Grid Guide (developer.mozilla.org)",
            hint: "Use grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)).",
            description: "Build a multi-card dashboard view that collapses seamlessly from 4 columns to 1 column on mobile screens.",
          },
          {
            title: "Conduct an accessibility audit using Chrome Lighthouse",
            minutes: 45,
            resource: "WebAIM Contrast Checker",
            hint: "Ensure focusable elements display high-contrast outline rings.",
            description: "Run Lighthouse in DevTools and eliminate all contrast and label warnings until the accessibility score reaches 100.",
          },
          {
            title: "Configure Git repository and deploy to GitHub Pages",
            minutes: 30,
            resource: "Git Official Documentation (git-scm.com)",
            hint: "Write imperative semantic commit messages (e.g. 'feat: implement responsive grid').",
            description: "Initialize your repo, push clean commits, and configure GitHub Pages or Vercel for public preview.",
          },
        ],
      },
      {
        id: "phase-2",
        name: "Phase 2: JavaScript Runtime & Asynchronous Programming",
        days: 16,
        milestones: [
          "Closures, lexical scope, and event loop mechanics",
          "Event delegation and DOM manipulation",
          "Promises, async/await, and Fetch API error handling",
          "Browser storage persistence (localStorage, IndexedDB)",
        ],
        deliverable: "You will be able to construct interactive client applications that consume REST APIs and handle offline caching.",
        sampleDailyTasks: [
          {
            title: "Build an API client with exponential backoff retry",
            minutes: 60,
            resource: "JavaScript.info Fetch & Promises Chapter",
            hint: "Wrap fetch in a recursive retry loop that multiplies delay by 2 on failure.",
            description: "Write an API client that queries a public endpoint and recovers gracefully from simulated 503 network drops.",
          },
          {
            title: "Implement debounced search filtering with event delegation",
            minutes: 45,
            resource: "MDN Event Bubbling Guide",
            hint: "Attach one single listener on the parent ul element.",
            description: "Filter an in-memory dataset of 500 items, debounce input by 300ms, and render results smoothly.",
          },
        ],
      },
      {
        id: "phase-3",
        name: "Phase 3: React Architecture & State Management",
        days: 18,
        milestones: [
          "Component lifecycle, custom hooks, and state isolation",
          "Context API and lightweight state stores",
          "Optimistic UI updates and cache invalidation",
          "Form validation with typed schemas",
        ],
        deliverable: "You will be able to architect scalable React applications with clean data flow and minimal re-renders.",
        sampleDailyTasks: [
          {
            title: "Develop custom useDebounce and useLocalStorage hooks",
            minutes: 60,
            resource: "React Official Docs (react.dev)",
            hint: "Return a cleanup function in useEffect to clear pending timeouts.",
            description: "Author reusable hooks with TypeScript generics and integrate them into a live filtering component.",
          },
        ],
      },
      {
        id: "phase-4",
        name: "Phase 4: Automated Testing & Portfolio Capstone",
        days: 12,
        milestones: [
          "Unit and integration testing with Vitest and React Testing Library",
          "Core Web Vitals profiling (LCP, INP, CLS)",
          "Production bundling and CI/CD pipelines",
          "Technical interview project presentation",
        ],
        deliverable: "You will possess a live, tested capstone application ready to demo in engineering interviews.",
        sampleDailyTasks: [
          {
            title: "Write unit tests for state reducers and critical user flows",
            minutes: 60,
            resource: "Testing Library Best Practices (testing-library.com)",
            hint: "Assert against accessible roles (e.g. getByRole('button')) instead of class names.",
            description: "Write at least 5 meaningful test cases covering happy path, network failure, and form validation error states.",
          },
        ],
      },
    ],
  },
  "data-analyst": {
    roleName: "Data Analyst",
    description: "SQL data modeling, Python Pandas analysis, exploratory statistics, and executive dashboard storytelling.",
    defaultTimelineDays: 60,
    phases: [
      {
        id: "phase-1",
        name: "Phase 1: Advanced Relational SQL & Aggregations",
        days: 15,
        milestones: [
          "Multi-table JOINs, subqueries, and Common Table Expressions (CTEs)",
          "Window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD)",
          "Query optimization with EXPLAIN and indexes",
          "Data cleaning and deduplication in PostgreSQL",
        ],
        deliverable: "You will be able to query relational databases to compute cohort retention, conversion funnels, and churn rates.",
        sampleDailyTasks: [
          {
            title: "Write a multi-step CTE calculating monthly user cohort retention",
            minutes: 60,
            resource: "PostgreSQL Window Functions Guide",
            hint: "Use DATE_TRUNC('month', created_at) to group signup cohorts.",
            description: "Calculate percentage retention for months 1, 2, and 3 across an e-commerce transactions table.",
          },
        ],
      },
      {
        id: "phase-2",
        name: "Phase 2: Python Data Cleansing & Pandas",
        days: 18,
        milestones: [
          "DataFrame manipulation, pivoting, and indexing",
          "Handling null values, data anomalies, and type coercion",
          "Statistical summarization and outlier detection (IQR, Z-scores)",
          "Merging and transforming heterogeneous CSV/JSON datasets",
        ],
        deliverable: "You will be able to ingest raw, unformatted datasets and output cleansed analytical tables in Python.",
        sampleDailyTasks: [
          {
            title: "Clean untidy dataset and detect anomalies with Pandas",
            minutes: 60,
            resource: "Pandas User Guide (pandas.pydata.org)",
            hint: "Use pd.to_datetime with errors='coerce' to surface corrupted date strings.",
            description: "Load raw sales logs, clean missing customer identifiers, and calculate monthly revenue metrics.",
          },
        ],
      },
      {
        id: "phase-3",
        name: "Phase 3: Visual Analytics & Executive Storytelling",
        days: 15,
        milestones: [
          "Exploratory Data Analysis with Seaborn and Plotly",
          "Correlation heatmaps and distribution analysis",
          "Executive summary dashboards in Power BI or Tableau",
          "Translating data metrics into strategic recommendations",
        ],
        deliverable: "You will be able to create executive charts that explain business drivers and outline actionable steps.",
        sampleDailyTasks: [
          {
            title: "Generate correlation matrix and draft 1-page executive brief",
            minutes: 60,
            resource: "Storytelling with Data (Cole Nussbaumer Knaflic)",
            hint: "Lead directly with the business recommendation before showing supporting charts.",
            description: "Plot customer churn correlations and write a 3-bullet executive briefing with quantitative proof.",
          },
        ],
      },
      {
        id: "phase-4",
        name: "Phase 4: Capstone Analysis & Public Portfolio",
        days: 12,
        milestones: [
          "Reproducible Jupyter notebook published to GitHub",
          "Technical documentation and methodology writeup",
          "Interactive dashboard live on web",
          "Interview case study practice",
        ],
        deliverable: "You will have a reproducible data portfolio demonstrating how you solve real business problems with code.",
        sampleDailyTasks: [
          {
            title: "Structure and comment portfolio notebook for 100% reproducibility",
            minutes: 60,
            resource: "GitHub Reproducible Data Science Guide",
            hint: "Clear all notebook cell outputs and re-run top to bottom without errors.",
            description: "Publish your clean capstone notebook with sections for problem framing, cleaning, charts, and recommendations.",
          },
        ],
      },
    ],
  },
};

export function generateCustomRoadmap(
  roleName: string,
  background: string,
  skillLevel: string,
  hoursPerDay: number,
  targetDays: number,
  learningStyle: string
): CurriculaTrack {
  const days = targetDays || 60;
  const p1 = Math.max(7, Math.round(days * 0.22));
  const p2 = Math.max(10, Math.round(days * 0.30));
  const p3 = Math.max(10, Math.round(days * 0.28));
  const p4 = Math.max(7, days - (p1 + p2 + p3));

  const cleanRole = roleName.trim() || "Software Engineer";

  return {
    roleName: cleanRole,
    description: `Structured curriculum targeting ${cleanRole} roles, tailored for ${skillLevel} level at ${hoursPerDay}h daily commitment (${learningStyle}).`,
    defaultTimelineDays: days,
    phases: [
      {
        id: "phase-1",
        name: `Phase 1: Foundations & Tooling for ${cleanRole}`,
        days: p1,
        milestones: [
          `Core domain syntax and standard idioms for ${cleanRole}`,
          "Development environment, shell workflow, and version control",
          "Foundational exercises and problem-solving benchmarks",
          "First runnable mini-module",
        ],
        deliverable: `You will master the foundational concepts and tooling necessary for ${cleanRole} development.`,
        sampleDailyTasks: [
          {
            title: `Configure development environment and toolchain for ${cleanRole}`,
            minutes: Math.min(60, Math.round(hoursPerDay * 40)),
            resource: "Official Toolchain Setup Guides",
            hint: "Document environment variables and commands in a clear README.",
            description: `Install current runtime, configure linting, and verify working directory for ${cleanRole} projects.`,
          },
          {
            title: "Complete foundational programming benchmark with tests",
            minutes: Math.min(75, Math.round(hoursPerDay * 50)),
            resource: "Domain Documentation & Code Katas",
            hint: "Separate input parsing from core calculation logic.",
            description: "Write modular code satisfying at least 3 distinct test assertions.",
          },
        ],
      },
      {
        id: "phase-2",
        name: `Phase 2: Applied Architecture & Deep Dives`,
        days: p2,
        milestones: [
          "Intermediate patterns, data structures, and state",
          "Consuming external services and handling error boundaries",
          "Data validation and security considerations",
          "Building an intermediate end-to-end feature",
        ],
        deliverable: `You will be able to construct production-grade features and integrate modular services autonomously.`,
        sampleDailyTasks: [
          {
            title: "Implement end-to-end feature with boundary validation",
            minutes: Math.min(90, Math.round(hoursPerDay * 60)),
            resource: "Domain Architectural Guides",
            hint: "Handle network failure and invalid user inputs explicitly.",
            description: "Develop the core feature logic with typed inputs, defensive checks, and clean error messages.",
          },
        ],
      },
      {
        id: "phase-3",
        name: `Phase 3: Testing, Profiling & Hardening`,
        days: p3,
        milestones: [
          "Automated test coverage (unit and integration)",
          "Performance profiling and bottleneck elimination",
          "Edge case handling and logging standards",
          "Code review and refactoring for maintainability",
        ],
        deliverable: `You will be able to test code thoroughly, optimize performance, and harden against common errors.`,
        sampleDailyTasks: [
          {
            title: "Implement automated test suite for critical paths",
            minutes: Math.min(80, Math.round(hoursPerDay * 55)),
            resource: "Automated Testing Best Practices",
            hint: "Focus tests on business logic and error recovery branches.",
            description: "Write integration tests that exercise core workflows and verify output correctness.",
          },
        ],
      },
      {
        id: "phase-4",
        name: `Phase 4: Capstone Project & Portfolio`,
        days: p4,
        milestones: [
          "Architect and build an end-to-end showcase project",
          "Write technical architecture documentation",
          "Deploy live to public cloud or hosting",
          "Technical interview mock preparation",
        ],
        deliverable: `You will possess a demonstrable, deployed capstone project with clean code, ready for technical interviews.`,
        sampleDailyTasks: [
          {
            title: "Deploy capstone project and document architecture",
            minutes: Math.min(90, Math.round(hoursPerDay * 60)),
            resource: "Production Deployment Documentation",
            hint: "Include an architecture diagram and setup guide in your README.",
            description: "Publish your live project, test production behavior, and write a concise technical README.",
          },
        ],
      },
    ],
  };
}

