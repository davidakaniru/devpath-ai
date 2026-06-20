// prisma/seed.ts

import { prisma } from "@/lib/prisma";
import { DifficultyLevel, ResourceType } from "../generated/prisma/client";

async function main() {
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
