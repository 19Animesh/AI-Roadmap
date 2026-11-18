// Curriculum data, quotes bank, and reason classification engine for PathPilot
// Strict rules: direct language, zero em dashes, zero AI slop.

const MOTIVATIONAL_AND_FUNNY_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "The best time to plant a tree was 20 years ago. The second best time is right now.",
  "If you want to be proud of yourself, do things you can be proud of.",
  "Procrastination makes easy things hard and hard things harder.",
  "Action cures fear. Inaction creates terror.",
  "Future you is either going to thank you or curse you. Choose right now.",
  "Even a slow turtle beats a hare taking a nap on Instagram.",
  "It is not about having time. It is about making time.",
  "Consistency is not doing 10 hours once. It is doing 1 hour 10 times.",
  "Your dream career will not build itself while you browse your phone.",
  "The secret to getting ahead is simply getting started."
];

const VALID_EXCUSE_KEYWORDS = [
  "too hard", "hard", "complex", "difficult", "struggled", "didn't understand",
  "unclear", "too big", "overwhelmed", "stuck", "bug", "error",
  "sick", "illness", "fever", "headache", "doctor", "hospital", "unwell",
  "family", "emergency", "personal issue", "funeral",
  "power", "internet", "wifi", "blackout", "electricity", "outage",
  "exam", "finals", "overtime", "urgent meeting", "work shift", "boss called",
  "urgent job", "workload"
];

const INVALID_EXCUSE_KEYWORDS = [
  "lazy", "laziness", "procrastinated", "procrastination", "distracted", "distraction",
  "social media", "instagram", "tiktok", "youtube", "twitter", "x", "reddit",
  "gaming", "game", "played", "playstation", "xbox", "steam",
  "didn't feel like it", "not in mood", "mood", "forgot", "slept",
  "netflix", "movie", "show", "binge", "tired from doing nothing", "bored"
];

const PREDEFINED_CURRICULA = {
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
          "Git repository workflow and static hosting"
        ],
        deliverable: "You will be able to build pixel-perfect, accessible, responsive interfaces from design specifications.",
        sampleDailyTasks: [
          {
            title: "Construct responsive dashboard layout with pure CSS Grid",
            minutes: 60,
            resource: "MDN CSS Grid Guide (developer.mozilla.org)",
            hint: "Use grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)).",
            description: "Build a multi-card dashboard view that collapses seamlessly from 4 columns to 1 column on mobile screens."
          },
          {
            title: "Conduct an accessibility audit using Chrome Lighthouse",
            minutes: 45,
            resource: "WebAIM Contrast Checker",
            hint: "Ensure focusable elements display high-contrast outline rings.",
            description: "Run Lighthouse in DevTools and eliminate all contrast and label warnings until the accessibility score reaches 100."
          },
          {
            title: "Configure Git repository and deploy to GitHub Pages",
            minutes: 30,
            resource: "Git Official Documentation (git-scm.com)",
            hint: "Write imperative semantic commit messages (e.g. 'feat: implement responsive grid').",
            description: "Initialize your repo, push clean commits, and configure GitHub Pages or Vercel for public preview."
          }
        ]
      },
      {
        id: "phase-2",
        name: "Phase 2: JavaScript Runtime & Asynchronous Programming",
        days: 16,
        milestones: [
          "Closures, lexical scope, and event loop mechanics",
          "Event delegation and DOM manipulation",
          "Promises, async/await, and Fetch API error handling",
          "Browser storage persistence (localStorage, IndexedDB)"
        ],
        deliverable: "You will be able to construct interactive client applications that consume REST APIs and handle offline caching.",
        sampleDailyTasks: [
          {
            title: "Build an API client with exponential backoff retry",
            minutes: 60,
            resource: "JavaScript.info Fetch & Promises Chapter",
            hint: "Wrap fetch in a recursive retry loop that multiplies delay by 2 on failure.",
            description: "Write an API client that queries a public endpoint and recovers gracefully from simulated 503 network drops."
          },
          {
            title: "Implement debounced search filtering with event delegation",
            minutes: 45,
            resource: "MDN Event Bubbling Guide",
            hint: "Attach one single listener on the parent ul element.",
            description: "Filter an in-memory dataset of 500 items, debounce input by 300ms, and render results smoothly."
          }
        ]
      },
      {
        id: "phase-3",
        name: "Phase 3: React Architecture & State Management",
        days: 18,
        milestones: [
          "Component lifecycle, custom hooks, and state isolation",
          "Context API and lightweight state stores",
          "Optimistic UI updates and cache invalidation",
          "Form validation with typed schemas"
        ],
        deliverable: "You will be able to architect scalable React applications with clean data flow and minimal re-renders.",
        sampleDailyTasks: [
          {
            title: "Develop custom useDebounce and useLocalStorage hooks",
            minutes: 60,
            resource: "React Official Docs (react.dev)",
            hint: "Return a cleanup function in useEffect to clear pending timeouts.",
            description: "Author reusable hooks with TypeScript generics and integrate them into a live filtering component."
          }
        ]
      },
      {
        id: "phase-4",
        name: "Phase 4: Automated Testing & Portfolio Capstone",
        days: 12,
        milestones: [
          "Unit and integration testing with Vitest and React Testing Library",
          "Core Web Vitals profiling (LCP, INP, CLS)",
          "Production bundling and CI/CD pipelines",
          "Technical interview project presentation"
        ],
        deliverable: "You will possess a live, tested capstone application ready to demo in engineering interviews.",
        sampleDailyTasks: [
          {
            title: "Write unit tests for state reducers and critical user flows",
            minutes: 60,
            resource: "Testing Library Best Practices (testing-library.com)",
            hint: "Assert against accessible roles (e.g. getByRole('button')) instead of class names.",
            description: "Write at least 5 meaningful test cases covering happy path, network failure, and form validation error states."
          }
        ]
      }
    ]
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
          "Data cleaning and deduplication in PostgreSQL"
        ],
        deliverable: "You will be able to query relational databases to compute cohort retention, conversion funnels, and churn rates.",
        sampleDailyTasks: [
          {
            title: "Write a multi-step CTE calculating monthly user cohort retention",
            minutes: 60,
            resource: "PostgreSQL Window Functions Guide",
            hint: "Use DATE_TRUNC('month', created_at) to group signup cohorts.",
            description: "Calculate percentage retention for months 1, 2, and 3 across an e-commerce transactions table."
          }
        ]
      },
      {
        id: "phase-2",
        name: "Phase 2: Python Data Cleansing & Pandas",
        days: 18,
        milestones: [
          "DataFrame manipulation, pivoting, and indexing",
          "Handling null values, data anomalies, and type coercion",
          "Statistical summarization and outlier detection",
          "Merging and transforming heterogeneous CSV/JSON datasets"
        ],
        deliverable: "You will be able to ingest raw, unformatted datasets and output cleansed analytical tables in Python.",
        sampleDailyTasks: [
          {
            title: "Clean untidy dataset and detect anomalies with Pandas",
            minutes: 60,
            resource: "Pandas User Guide (pandas.pydata.org)",
            hint: "Use pd.to_datetime with errors='coerce' to surface corrupted date strings.",
            description: "Load raw sales logs, clean missing customer identifiers, and calculate monthly revenue metrics."
          }
        ]
      },
      {
        id: "phase-3",
        name: "Phase 3: Visual Analytics & Executive Storytelling",
        days: 15,
        milestones: [
          "Exploratory Data Analysis with Seaborn and Plotly",
          "Correlation heatmaps and distribution analysis",
          "Executive summary dashboards in Power BI or Tableau",
          "Translating data metrics into strategic recommendations"
        ],
        deliverable: "You will be able to create executive charts that explain business drivers and outline actionable steps.",
        sampleDailyTasks: [
          {
            title: "Generate correlation matrix and draft 1-page executive brief",
            minutes: 60,
            resource: "Storytelling with Data (Cole Nussbaumer Knaflic)",
            hint: "Lead directly with the business recommendation before showing supporting charts.",
            description: "Plot customer churn correlations and write a 3-bullet executive briefing with quantitative proof."
          }
        ]
      },
      {
        id: "phase-4",
        name: "Phase 4: Capstone Analysis & Public Portfolio",
        days: 12,
        milestones: [
          "Reproducible Jupyter notebook published to GitHub",
          "Technical documentation and methodology writeup",
          "Interactive dashboard live on web",
          "Interview case study practice"
        ],
        deliverable: "You will have a reproducible data portfolio demonstrating how you solve real business problems with code.",
        sampleDailyTasks: [
          {
            title: "Structure and comment portfolio notebook for 100% reproducibility",
            minutes: 60,
            resource: "GitHub Reproducible Data Science Guide",
            hint: "Clear all notebook cell outputs and re-run top to bottom without errors.",
            description: "Publish your clean capstone notebook with sections for problem framing, cleaning, charts, and recommendations."
          }
        ]
      }
    ]
  },

  "machine-learning-engineer": {
    roleName: "Machine Learning Engineer",
    description: "Applied machine learning: math foundations, Scikit-learn, PyTorch deep learning, and model deployment.",
    defaultTimelineDays: 90,
    phases: [
      {
        id: "phase-1",
        name: "Phase 1: Linear Algebra, Calculus & Scikit-Learn",
        days: 22,
        milestones: [
          "Matrix operations, vectorization, and gradient descent algorithms",
          "Supervised learning: regression, regularized models, and trees",
          "Model evaluation, cross-validation, and bias-variance tradeoff",
          "Feature engineering and preprocessing pipelines"
        ],
        deliverable: "You will be able to formulate prediction problems, select the right classical models, and evaluate them rigorously against overfitting.",
        sampleDailyTasks: [
          {
            title: "Code linear regression from scratch using NumPy gradient descent",
            minutes: 60,
            resource: "Stanford CS229 Lecture Notes (cs229.stanford.edu)",
            hint: "Compute the gradient of MSE loss: (2/N) * X.T @ (X @ w - y).",
            description: "Implement gradient descent with weight updates, track loss per epoch, and verify parameters match Scikit-learn results."
          }
        ]
      },
      {
        id: "phase-2",
        name: "Phase 2: Deep Learning with PyTorch",
        days: 25,
        milestones: [
          "PyTorch tensors, autograd, and computation graphs",
          "Multi-layer perceptrons, activations, and backpropagation",
          "Convolutional neural networks (CNNs) for computer vision",
          "Optimization algorithms: Adam, SGD with momentum, schedulers"
        ],
        deliverable: "You will be able to design, train, and debug deep neural networks in PyTorch using custom training loops.",
        sampleDailyTasks: [
          {
            title: "Build a modular PyTorch training and validation harness",
            minutes: 60,
            resource: "Official PyTorch Tutorials (pytorch.org/tutorials)",
            hint: "Always call model.train() and model.eval() with torch.no_grad() during validation.",
            description: "Write a clean training loop supporting early stopping, gradient clipping, and per-epoch metrics logging."
          }
        ]
      },
      {
        id: "phase-3",
        name: "Phase 3: Transformers & Modern NLP / LLMs",
        days: 23,
        milestones: [
          "Self-attention mechanism and transformer architecture",
          "Hugging Face transformers, tokenizers, and datasets",
          "Fine-tuning pretrained models with LoRA/PEFT",
          "Retrieval augmented generation (RAG) pipelines"
        ],
        deliverable: "You will be able to fine-tune transformer models for downstream NLP tasks and build production-grade RAG systems.",
        sampleDailyTasks: [
          {
            title: "Fine-tune a lightweight BERT model for sentiment classification",
            minutes: 60,
            resource: "Hugging Face NLP Course (huggingface.co/learn/nlp-course)",
            hint: "Freeze lower layers to speed up training on consumer hardware.",
            description: "Load a pretrained transformer, tokenize inputs with proper padding, and fine-tune for 3 epochs with learning rate 2e-5."
          }
        ]
      },
      {
        id: "phase-4",
        name: "Phase 4: MLOps, Model Serving & Deployment",
        days: 20,
        milestones: [
          "Model packaging with ONNX and TorchScript",
          "FastAPI model inference microservice with schema validation",
          "Docker containerization for machine learning workloads",
          "Model monitoring and latency profiling"
        ],
        deliverable: "You will have a containerized, live inference API that serves predictions with low latency and health checks.",
        sampleDailyTasks: [
          {
            title: "Wrap a model in a FastAPI endpoint with Pydantic schemas",
            minutes: 60,
            resource: "FastAPI Documentation (fastapi.tiangolo.com)",
            hint: "Load the model in the lifespan context manager rather than on every request.",
            description: "Expose a POST /predict route that validates incoming tensors, runs inference, and returns probabilities in JSON."
          }
        ]
      }
    ]
  },

  "full-stack-developer": {
    roleName: "Full-Stack Developer",
    description: "End-to-end software engineering: modern frontend, Node/Python backend, databases, authentication, and deployment.",
    defaultTimelineDays: 75,
    phases: [
      {
        id: "phase-1",
        name: "Phase 1: Frontend Architecture & UI Systems",
        days: 18,
        milestones: [
          "Semantic HTML, responsive CSS, and TypeScript fundamentals",
          "React components, custom hooks, and state management",
          "API consumption and optimistic UI updates",
          "Unit testing with modern test runners"
        ],
        deliverable: "You will be able to construct responsive client applications with clean separation of presentation and state.",
        sampleDailyTasks: [
          {
            title: "Build a responsive form with client-side schema validation",
            minutes: 60,
            resource: "Zod Documentation (zod.dev)",
            hint: "Validate on blur for better user experience instead of every keystroke.",
            description: "Create a registration form with real-time error messages, typed schema validation, and submit prevention."
          }
        ]
      },
      {
        id: "phase-2",
        name: "Phase 2: Backend APIs, REST & Middleware",
        days: 20,
        milestones: [
          "RESTful API design and status code standards",
          "Request validation, error handling, and centralized middleware",
          "Authentication with JWT and secure HTTP-only cookies",
          "Password hashing with bcrypt and rate limiting"
        ],
        deliverable: "You will be able to architect secure, testable REST APIs with robust error handling and authentication.",
        sampleDailyTasks: [
          {
            title: "Implement JWT authentication with refresh token rotation",
            minutes: 60,
            resource: "OWASP Authentication Cheat Sheet",
            hint: "Store refresh tokens in HTTP-only, SameSite=Strict cookies to protect against XSS.",
            description: "Build login, token refresh, and logout endpoints with proper token expiry checks."
          }
        ]
      },
      {
        id: "phase-3",
        name: "Phase 3: Relational Databases, ORMs & Migrations",
        days: 20,
        milestones: [
          "Relational schema design, foreign keys, and indexes in PostgreSQL",
          "Prisma or Drizzle ORM migrations and relation modeling",
          "Transaction handling and race condition prevention",
          "Redis caching for expensive database queries"
        ],
        deliverable: "You will be able to design robust database schemas, manage versioned migrations, and write performant queries.",
        sampleDailyTasks: [
          {
            title: "Write database migrations and seed data for relational models",
            minutes: 60,
            resource: "Prisma Documentation / PostgreSQL Docs",
            hint: "Always define foreign key onDelete rules (CASCADE vs RESTRICT) explicitly.",
            description: "Model a multi-tenant user and project schema with many-to-many relationships and seed it with mock records."
          }
        ]
      },
      {
        id: "phase-4",
        name: "Phase 4: Docker, CI/CD & Production Deployment",
        days: 17,
        milestones: [
          "Multi-stage Dockerfile builds for frontend and backend",
          "GitHub Actions workflow for automated linting and tests",
          "Cloud deployment (Render, Fly.io, or Railway) with environment variables",
          "Logging, health checks, and production readiness audit"
        ],
        deliverable: "You will have a full-stack production application deployed to the public web with automated testing and continuous delivery.",
        sampleDailyTasks: [
          {
            title: "Create a multi-stage Docker build for your Node/Go API",
            minutes: 60,
            resource: "Docker Official Docs: Best Practices for Writing Dockerfiles",
            hint: "Separate build stage from runtime stage to keep final image size under 100MB.",
            description: "Write a production Dockerfile, test container build locally, and verify container starts with zero vulnerabilities."
          }
        ]
      }
    ]
  }
};

function generateCustomRoadmap(roleName, background, skillLevel, hoursPerDay, targetDays, learningStyle) {
  const days = parseInt(targetDays, 10) || 60;
  const p1Days = Math.max(7, Math.round(days * 0.22));
  const p2Days = Math.max(10, Math.round(days * 0.30));
  const p3Days = Math.max(10, Math.round(days * 0.28));
  const p4Days = Math.max(7, days - (p1Days + p2Days + p3Days));

  const roleClean = (roleName || "").trim() || "Software Engineer";

  return {
    roleName: roleClean,
    description: `Structured curriculum targeting ${roleClean} roles, tailored for ${skillLevel} level at ${hoursPerDay}h daily commitment.`,
    defaultTimelineDays: days,
    phases: [
      {
        id: "phase-1",
        name: `Phase 1: Core Fundamentals & Tooling for ${roleClean}`,
        days: p1Days,
        milestones: [
          `Core domain principles and foundational syntax for ${roleClean}`,
          "Development environment setup, version control, and shell tooling",
          "Foundational problem-solving and clean code standards",
          "First benchmark mini-project"
        ],
        deliverable: `You will master the basic building blocks and tools required in professional ${roleClean} workflows.`,
        sampleDailyTasks: [
          {
            title: `Set up professional environment and toolchain for ${roleClean}`,
            minutes: Math.min(60, Math.round(hoursPerDay * 40)),
            resource: "Official Documentation & Setup Guides",
            hint: "Keep configuration documented in a reproducible README.",
            description: `Install current stable runtime, package manager, and linter suited for ${roleClean} development.`
          },
          {
            title: "Implement core fundamentals exercise with unit tests",
            minutes: Math.min(75, Math.round(hoursPerDay * 50)),
            resource: "Exercism or LeetCode domain tracks",
            hint: "Break the problem down into input, expected output, and edge cases.",
            description: "Write modular code solving the foundational exercise and verify with at least 3 test assertions."
          }
        ]
      },
      {
        id: "phase-2",
        name: `Phase 2: Applied Architecture & Deep Dives`,
        days: p2Days,
        milestones: [
          "Intermediate concepts, patterns, and idiomatic practices",
          "Data structures, persistence, and external service integration",
          "Robust error handling and validation",
          "Constructing an intermediate real-world module"
        ],
        deliverable: `You will be able to construct production-ready features and integrate modular services autonomously.`,
        sampleDailyTasks: [
          {
            title: "Build an end-to-end functional feature with proper error handling",
            minutes: Math.min(90, Math.round(hoursPerDay * 60)),
            resource: "Domain Architectural Guides & API Specs",
            hint: "Handle edge cases such as network timeouts or missing parameters explicitly.",
            description: "Develop the core feature logic with typed inputs, boundary checks, and informative log outputs."
          }
        ]
      },
      {
        id: "phase-3",
        name: `Phase 3: Production Hardening, Testing & Optimization`,
        days: p3Days,
        milestones: [
          "Comprehensive automated testing (unit, integration)",
          "Performance profiling and bottleneck elimination",
          "Security hygiene, secret management, and compliance checks",
          "Refactoring for long-term maintainability"
        ],
        deliverable: `You will be able to evaluate code quality, write resilient automated tests, and optimize performance.`,
        sampleDailyTasks: [
          {
            title: "Implement automated test suite for critical paths",
            minutes: Math.min(80, Math.round(hoursPerDay * 55)),
            resource: "Automated Testing Best Practices",
            hint: "Focus your tests on business logic and error recovery branches.",
            description: "Write integration tests that exercise core workflows and verify output correctness."
          }
        ]
      },
      {
        id: "phase-4",
        name: `Phase 4: Capstone Project & Technical Portfolio`,
        days: p4Days,
        milestones: [
          "Architect and build an end-to-end showcase project",
          "Write technical documentation and architecture decision records",
          "Deploy live to cloud or public hosting with continuous delivery",
          "Technical interview mock preparation"
        ],
        deliverable: `You will possess a demonstrable, deployed capstone project with clean code, ready for technical interviews.`,
        sampleDailyTasks: [
          {
            title: "Deploy your capstone project and document architecture",
            minutes: Math.min(90, Math.round(hoursPerDay * 60)),
            resource: "Cloud Deployment Documentation",
            hint: "Include an Architecture diagram and step-by-step setup guide in your README.",
            description: "Publish your live project, test production behavior, and write a concise technical README."
          }
        ]
      }
    ]
  };
}

function classifyExcuse(reasonText) {
  if (!reasonText || typeof reasonText !== "string") {
    return { type: "unclear", text: "" };
  }

  const lower = reasonText.toLowerCase().trim();

  for (const kw of VALID_EXCUSE_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        type: "valid",
        matchedKeyword: kw,
        text: reasonText
      };
    }
  }

  for (const kw of INVALID_EXCUSE_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        type: "invalid",
        matchedKeyword: kw,
        text: reasonText
      };
    }
  }

  if (lower.length < 12 || lower.includes("idk") || lower.includes("nothing") || lower.includes("busy")) {
    return {
      type: "unclear",
      text: reasonText
    };
  }

  if (lower.includes("car") || lower.includes("baby") || lower.includes("health") || lower.includes("flu")) {
    return { type: "valid", matchedKeyword: "health/emergency", text: reasonText };
  }

  return { type: "unclear", text: reasonText };
}

window.PathPilotData = {
  PREDEFINED_CURRICULA,
  generateCustomRoadmap,
  classifyExcuse,
  MOTIVATIONAL_AND_FUNNY_QUOTES,
  VALID_EXCUSE_KEYWORDS,
  INVALID_EXCUSE_KEYWORDS
};

