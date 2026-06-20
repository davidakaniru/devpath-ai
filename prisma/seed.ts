import { prisma } from "@/lib/prisma";
import { DifficultyLevel, ResourceType } from "../generated/prisma/client";

async function seedBackend() {
  const track = await prisma.learningTrack.upsert({
    where: { id: "backend-track" },
    update: {},
    create: {
      id: "backend-track",
      name: "Backend Developer",
      description: "Core skills for building server-side systems and APIs.",
    },
  });

  const apiFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "API Fundamentals & HTTP",
      description: "REST principles, HTTP methods, status codes, and request/response cycles.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      resources: {
        create: [
          { title: "MDN: HTTP Overview", type: ResourceType.DOCUMENTATION, url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
        ],
      },
    },
  });

  const databases = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Databases & SQL Fundamentals",
      description: "Relational modeling, joins, indexes, and query design.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: apiFundamentals.id,
    },
  });

  const debuggingServers = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Debugging Server Applications",
      description: "Logging strategies, stack traces, and diagnosing runtime failures.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: apiFundamentals.id,
    },
  });

  const authNAuthZ = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Authentication & Authorization",
      description: "Sessions, tokens, password hashing, and access control.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: databases.id,
    },
  });

  const systemArchitecture = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Backend System Architecture",
      description: "Service boundaries, layered architecture, and design patterns.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: authNAuthZ.id,
    },
  });

  const scalingPerformance = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Performance & Scaling",
      description: "Caching, query optimization, load balancing, and horizontal scaling.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: databases.id,
    },
  });

  const apiSecurity = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "API Security Fundamentals",
      description: "Input validation, rate limiting, SQL injection, and secure headers.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: authNAuthZ.id,
    },
  });

  await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Real-World Backend Patterns",
      description: "Background jobs, message queues, testing, and deployment pipelines.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: systemArchitecture.id,
    },
  });

  console.log("Seeded Backend Developer track.");
}

async function seedFullstack() {
  const track = await prisma.learningTrack.upsert({
    where: { id: "fullstack-track" },
    update: {},
    create: {
      id: "fullstack-track",
      name: "Full-Stack Developer",
      description: "End-to-end skills spanning client and server development.",
    },
  });

  const webFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Web Fundamentals (HTML, CSS, JS)",
      description: "Core building blocks of the web, shared by client and server work.",
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
  });

  const clientServerComm = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Client-Server Communication",
      description: "REST APIs, fetch/axios, request lifecycles, and data flow.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: webFundamentals.id,
    },
  });

  const debuggingFullstack = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Debugging Across the Stack",
      description: "Tracing issues across frontend, network, and backend layers.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: clientServerComm.id,
    },
  });

  const databasesIntegration = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Database Integration",
      description: "Connecting applications to relational databases via ORMs.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: clientServerComm.id,
    },
  });

  const fullstackArchitecture = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Full-Stack Application Architecture",
      description: "Structuring a unified codebase, shared types, and module boundaries.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: databasesIntegration.id,
    },
  });

  const performanceFullstack = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "End-to-End Performance Optimization",
      description: "Frontend rendering performance combined with backend query/response time.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: fullstackArchitecture.id,
    },
  });

  const securityFullstack = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Full-Stack Security Fundamentals",
      description: "Authentication flows, CSRF/XSS protection, and secure API design.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: databasesIntegration.id,
    },
  });

  await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Real-World Full-Stack Project Patterns",
      description: "Deployment, CI/CD, environment config, and testing across the stack.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: fullstackArchitecture.id,
    },
  });

  console.log("Seeded Full-Stack Developer track.");
}

async function seedMobile() {
  const track = await prisma.learningTrack.upsert({
    where: { id: "mobile-track" },
    update: {},
    create: {
      id: "mobile-track",
      name: "Mobile Developer",
      description: "Core skills for building native and cross-platform mobile applications.",
    },
  });

  const mobileFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Mobile UI Fundamentals",
      description: "Layouts, navigation, and platform design guidelines (iOS/Android).",
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
  });

  const stateLifecycle = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "App State & Lifecycle",
      description: "Component state, navigation stacks, and app lifecycle events.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: mobileFundamentals.id,
    },
  });

  const debuggingMobile = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Debugging Mobile Applications",
      description: "Device logs, breakpoints, and platform-specific debugging tools.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: stateLifecycle.id,
    },
  });

  const nativeApis = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Native APIs & Device Features",
      description: "Camera, location, storage, and permission handling.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: stateLifecycle.id,
    },
  });

  const mobileArchitecture = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Mobile App Architecture",
      description: "Component structure, state management patterns, and offline-first design.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: nativeApis.id,
    },
  });

  const mobilePerformance = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Mobile Performance Optimization",
      description: "Render performance, memory usage, and battery-efficient code.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: mobileArchitecture.id,
    },
  });

  const mobileSecurity = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Mobile Security Fundamentals",
      description: "Secure storage, certificate pinning, and safe API communication.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: nativeApis.id,
    },
  });

  await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Real-World Mobile Release Patterns",
      description: "App store deployment, testing, and CI/CD for mobile.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: mobileArchitecture.id,
    },
  });

  console.log("Seeded Mobile Developer track.");
}

async function seedDataScience() {
  const track = await prisma.learningTrack.upsert({
    where: { id: "data-science-track" },
    update: {},
    create: {
      id: "data-science-track",
      name: "Data Scientist",
      description: "Core skills for data analysis, machine learning, and statistical reasoning.",
    },
  });

  const pythonFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Python & Data Fundamentals",
      description: "Python syntax, data structures, and core libraries (NumPy, pandas).",
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
  });

  const dataWrangling = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Data Cleaning & Wrangling",
      description: "Handling missing data, outliers, and transforming raw datasets.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: pythonFundamentals.id,
    },
  });

  const debuggingPipelines = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Debugging Data Pipelines",
      description: "Tracing data quality issues and pipeline failures.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: dataWrangling.id,
    },
  });

  const statistics = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Statistics & Probability",
      description: "Distributions, hypothesis testing, and statistical inference.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: dataWrangling.id,
    },
  });

  const mlFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Machine Learning Fundamentals",
      description: "Supervised/unsupervised learning, model training, and evaluation.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: statistics.id,
    },
  });

  const modelPerformance = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Model Performance & Optimization",
      description: "Overfitting, cross-validation, hyperparameter tuning, and metrics.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: mlFundamentals.id,
    },
  });

  const dataArchitecture = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Data Pipeline Architecture",
      description: "ETL design, data warehousing, and reproducible workflows.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: statistics.id,
    },
  });

  await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Real-World Data Science Projects",
      description: "End-to-end project workflows, deployment, and model monitoring.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: mlFundamentals.id,
    },
  });

  console.log("Seeded Data Scientist track.");
}

async function seedDevOps() {
  const track = await prisma.learningTrack.upsert({
    where: { id: "devops-track" },
    update: {},
    create: {
      id: "devops-track",
      name: "DevOps Engineer",
      description: "Core skills for automation, infrastructure, and deployment pipelines.",
    },
  });

  const linuxFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Linux & Command Line Fundamentals",
      description: "Filesystem navigation, permissions, processes, and shell scripting.",
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
  });

  const cicdBasics = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "CI/CD Fundamentals",
      description: "Build pipelines, automated testing, and deployment automation.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: linuxFundamentals.id,
    },
  });

  const debuggingInfra = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Debugging Infrastructure Issues",
      description: "Reading logs, diagnosing failed deployments, and tracing outages.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: cicdBasics.id,
    },
  });

  const containers = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Containers & Orchestration",
      description: "Docker fundamentals, Kubernetes basics, and container networking.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: cicdBasics.id,
    },
  });

  const infraArchitecture = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Infrastructure Architecture",
      description: "Cloud architecture patterns, infrastructure as code, and environment design.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: containers.id,
    },
  });

  const reliabilityPerformance = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Reliability & Performance Monitoring",
      description: "Observability, alerting, autoscaling, and incident response.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: infraArchitecture.id,
    },
  });

  const cloudSecurity = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Cloud & Infrastructure Security",
      description: "IAM, network security, secrets management, and compliance basics.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: containers.id,
    },
  });

  await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Real-World DevOps Project Patterns",
      description: "End-to-end deployment pipelines, disaster recovery, and team workflows.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: infraArchitecture.id,
    },
  });

  console.log("Seeded DevOps Engineer track.");
}

async function seedFrontend() {
  const track = await prisma.learningTrack.upsert({
    where: { id: "frontend-track" },
    update: {},
    create: {
      id: "frontend-track",
      name: "Frontend Developer",
      description: "Core skills for building modern web user interfaces.",
    },
  });

  // Order matters here — we create earlier topics first so later ones can reference them as prerequisites.

  const htmlCss = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "HTML & CSS Fundamentals",
      description: "Semantic markup, the box model, flexbox, and grid layout.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      resources: {
        create: [
          {
            title: "MDN: HTML Basics",
            type: ResourceType.DOCUMENTATION,
            url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
          },
          {
            title: "CSS Grid Garden",
            type: ResourceType.PROJECT,
            url: "https://cssgridgarden.com/",
          },
        ],
      },
    },
  });

  const jsFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "JavaScript Fundamentals",
      description:
        "Variables, functions, closures, the event loop, and async/await.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: htmlCss.id,
      resources: {
        create: [
          {
            title: "MDN: JavaScript Guide",
            type: ResourceType.DOCUMENTATION,
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
          },
        ],
      },
    },
  });

  const domDebugging = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "DOM Manipulation & Debugging",
      description:
        "Browser devtools, breakpoints, console techniques, and common runtime errors.",
      difficultyLevel: DifficultyLevel.BEGINNER,
      prerequisiteTopicId: jsFundamentals.id,
      resources: {
        create: [
          {
            title: "Chrome DevTools Debugging",
            type: ResourceType.DOCUMENTATION,
            url: "https://developer.chrome.com/docs/devtools/javascript/",
          },
        ],
      },
    },
  });

  const reactFundamentals = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "React Fundamentals",
      description: "Components, props, state, and the rendering lifecycle.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: jsFundamentals.id,
      resources: {
        create: [
          {
            title: "React Official Docs: Learn",
            type: ResourceType.DOCUMENTATION,
            url: "https://react.dev/learn",
          },
        ],
      },
    },
  });

  const stateManagement = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "State Management",
      description:
        "Lifting state up, Context API, and external state libraries.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: reactFundamentals.id,
    },
  });

  const frontendArchitecture = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Frontend Architecture",
      description:
        "Component design patterns, folder structure, and scalable app organization.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: stateManagement.id,
    },
  });

  const performanceOptimization = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Frontend Performance Optimization",
      description:
        "Bundle size, lazy loading, memoization, and rendering performance.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: reactFundamentals.id,
    },
  });

  const webSecurity = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Frontend Security Fundamentals",
      description:
        "XSS, CSRF, secure authentication patterns, and content security policy.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: jsFundamentals.id,
    },
  });

  const accessibility = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Accessibility (a11y)",
      description:
        "ARIA roles, keyboard navigation, and inclusive design practices.",
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      prerequisiteTopicId: htmlCss.id,
    },
  });

  const realWorldProjects = await prisma.topic.create({
    data: {
      trackId: track.id,
      title: "Real-World Project Patterns",
      description:
        "API integration, error boundaries, testing, and deployment workflows.",
      difficultyLevel: DifficultyLevel.ADVANCED,
      prerequisiteTopicId: frontendArchitecture.id,
    },
  });

  console.log("Seeded Frontend Developer track with topics:", {
    htmlCss: htmlCss.id,
    jsFundamentals: jsFundamentals.id,
    domDebugging: domDebugging.id,
    reactFundamentals: reactFundamentals.id,
    stateManagement: stateManagement.id,
    frontendArchitecture: frontendArchitecture.id,
    performanceOptimization: performanceOptimization.id,
    webSecurity: webSecurity.id,
    accessibility: accessibility.id,
    realWorldProjects: realWorldProjects.id,
  });
}

async function main() {
  await seedFrontend();
  await seedBackend();
  await seedFullstack();
  await seedMobile();
  await seedDataScience();
  await seedDevOps();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });