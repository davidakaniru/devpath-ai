// prisma/seed-resources.ts
//
// Adds LearningResource entries to topics that don't have any yet.
// Safe to re-run: looks up each topic by (trackId, title) and skips it
// if it already has resources, rather than recreating topics.

import { prisma } from "@/lib/prisma";
import { ResourceType } from "../generated/prisma/client";

interface ResourceSeed {
  title: string;
  type: ResourceType;
  url: string;
}

interface TopicResourceSeed {
  topicTitle: string;
  resources: ResourceSeed[];
}

const TRACK_RESOURCES: Record<string, TopicResourceSeed[]> = {
  "Backend Developer": [
    {
      topicTitle: "API Fundamentals & HTTP",
      resources: [
        {
          title: "REST API Tutorial",
          type: ResourceType.ARTICLE,
          url: "https://restfulapi.net/",
        },
      ],
    },
    {
      topicTitle: "Databases & SQL Fundamentals",
      resources: [
        {
          title: "PostgreSQL Tutorial",
          type: ResourceType.DOCUMENTATION,
          url: "https://www.postgresql.org/docs/current/tutorial.html",
        },
      ],
    },
    {
      topicTitle: "Debugging Server Applications",
      resources: [
        {
          title: "Node.js Debugging Guide",
          type: ResourceType.DOCUMENTATION,
          url: "https://nodejs.org/en/learn/getting-started/debugging",
        },
      ],
    },
    {
      topicTitle: "Authentication & Authorization",
      resources: [
        {
          title: "OWASP Authentication Cheat Sheet",
          type: ResourceType.DOCUMENTATION,
          url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
        },
      ],
    },
    {
      topicTitle: "Backend System Architecture",
      resources: [
        {
          title: "Designing Data-Intensive Applications (overview)",
          type: ResourceType.ARTICLE,
          url: "https://martinfowler.com/architecture/",
        },
      ],
    },
    {
      topicTitle: "Performance & Scaling",
      resources: [
        {
          title: "Database Indexing Explained",
          type: ResourceType.ARTICLE,
          url: "https://use-the-index-luke.com/",
        },
      ],
    },
    {
      topicTitle: "API Security Fundamentals",
      resources: [
        {
          title: "OWASP API Security Top 10",
          type: ResourceType.DOCUMENTATION,
          url: "https://owasp.org/www-project-api-security/",
        },
      ],
    },
    {
      topicTitle: "Real-World Backend Patterns",
      resources: [
        {
          title: "Twelve-Factor App Methodology",
          type: ResourceType.DOCUMENTATION,
          url: "https://12factor.net/",
        },
      ],
    },
  ],

  "Full-Stack Developer": [
    {
      topicTitle: "Web Fundamentals (HTML, CSS, JS)",
      resources: [
        {
          title: "MDN: Web Fundamentals",
          type: ResourceType.DOCUMENTATION,
          url: "https://developer.mozilla.org/en-US/docs/Learn",
        },
      ],
    },
    {
      topicTitle: "Client-Server Communication",
      resources: [
        {
          title: "MDN: HTTP Overview",
          type: ResourceType.DOCUMENTATION,
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
        },
      ],
    },
    {
      topicTitle: "Debugging Across the Stack",
      resources: [
        {
          title: "Chrome DevTools Network Panel",
          type: ResourceType.DOCUMENTATION,
          url: "https://developer.chrome.com/docs/devtools/network/",
        },
      ],
    },
    {
      topicTitle: "Database Integration",
      resources: [
        {
          title: "Prisma ORM Documentation",
          type: ResourceType.DOCUMENTATION,
          url: "https://www.prisma.io/docs",
        },
      ],
    },
    {
      topicTitle: "Full-Stack Application Architecture",
      resources: [
        {
          title: "Next.js App Router Docs",
          type: ResourceType.DOCUMENTATION,
          url: "https://nextjs.org/docs/app",
        },
      ],
    },
    {
      topicTitle: "End-to-End Performance Optimization",
      resources: [
        {
          title: "Web.dev: Performance",
          type: ResourceType.DOCUMENTATION,
          url: "https://web.dev/learn/performance",
        },
      ],
    },
    {
      topicTitle: "Full-Stack Security Fundamentals",
      resources: [
        {
          title: "OWASP Top Ten",
          type: ResourceType.DOCUMENTATION,
          url: "https://owasp.org/www-project-top-ten/",
        },
      ],
    },
    {
      topicTitle: "Real-World Full-Stack Project Patterns",
      resources: [
        {
          title: "The Twelve-Factor App",
          type: ResourceType.DOCUMENTATION,
          url: "https://12factor.net/",
        },
      ],
    },
  ],

  "Mobile Developer": [
    {
      topicTitle: "Mobile UI Fundamentals",
      resources: [
        {
          title: "React Native: Core Components",
          type: ResourceType.DOCUMENTATION,
          url: "https://reactnative.dev/docs/components-and-apis",
        },
      ],
    },
    {
      topicTitle: "App State & Lifecycle",
      resources: [
        {
          title: "React Native: App Lifecycle",
          type: ResourceType.DOCUMENTATION,
          url: "https://reactnative.dev/docs/appstate",
        },
      ],
    },
    {
      topicTitle: "Debugging Mobile Applications",
      resources: [
        {
          title: "React Native Debugging Guide",
          type: ResourceType.DOCUMENTATION,
          url: "https://reactnative.dev/docs/debugging",
        },
      ],
    },
    {
      topicTitle: "Native APIs & Device Features",
      resources: [
        {
          title: "Expo: Device APIs",
          type: ResourceType.DOCUMENTATION,
          url: "https://docs.expo.dev/versions/latest/",
        },
      ],
    },
    {
      topicTitle: "Mobile App Architecture",
      resources: [
        {
          title: "React Navigation Docs",
          type: ResourceType.DOCUMENTATION,
          url: "https://reactnavigation.org/docs/getting-started",
        },
      ],
    },
    {
      topicTitle: "Mobile Performance Optimization",
      resources: [
        {
          title: "React Native: Performance Overview",
          type: ResourceType.DOCUMENTATION,
          url: "https://reactnative.dev/docs/performance",
        },
      ],
    },
    {
      topicTitle: "Mobile Security Fundamentals",
      resources: [
        {
          title: "OWASP Mobile Top 10",
          type: ResourceType.DOCUMENTATION,
          url: "https://owasp.org/www-project-mobile-top-10/",
        },
      ],
    },
    {
      topicTitle: "Real-World Mobile Release Patterns",
      resources: [
        {
          title: "Expo Application Services (EAS)",
          type: ResourceType.DOCUMENTATION,
          url: "https://docs.expo.dev/eas/",
        },
      ],
    },
  ],

  "Data Scientist": [
    {
      topicTitle: "Python & Data Fundamentals",
      resources: [
        {
          title: "pandas Documentation",
          type: ResourceType.DOCUMENTATION,
          url: "https://pandas.pydata.org/docs/",
        },
      ],
    },
    {
      topicTitle: "Data Cleaning & Wrangling",
      resources: [
        {
          title: "Real Python: Data Cleaning",
          type: ResourceType.ARTICLE,
          url: "https://realpython.com/python-data-cleaning-numpy-pandas/",
        },
      ],
    },
    {
      topicTitle: "Debugging Data Pipelines",
      resources: [
        {
          title: "pandas: Working with Missing Data",
          type: ResourceType.DOCUMENTATION,
          url: "https://pandas.pydata.org/docs/user_guide/missing_data.html",
        },
      ],
    },
    {
      topicTitle: "Statistics & Probability",
      resources: [
        {
          title: "Khan Academy: Statistics & Probability",
          type: ResourceType.VIDEO,
          url: "https://www.khanacademy.org/math/statistics-probability",
        },
      ],
    },
    {
      topicTitle: "Machine Learning Fundamentals",
      resources: [
        {
          title: "scikit-learn: Getting Started",
          type: ResourceType.DOCUMENTATION,
          url: "https://scikit-learn.org/stable/getting_started.html",
        },
      ],
    },
    {
      topicTitle: "Model Performance & Optimization",
      resources: [
        {
          title: "scikit-learn: Model Evaluation",
          type: ResourceType.DOCUMENTATION,
          url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
        },
      ],
    },
    {
      topicTitle: "Data Pipeline Architecture",
      resources: [
        {
          title: "Apache Airflow Documentation",
          type: ResourceType.DOCUMENTATION,
          url: "https://airflow.apache.org/docs/",
        },
      ],
    },
    {
      topicTitle: "Real-World Data Science Projects",
      resources: [
        {
          title: "Kaggle: Learn",
          type: ResourceType.PROJECT,
          url: "https://www.kaggle.com/learn",
        },
      ],
    },
  ],

  "DevOps Engineer": [
    {
      topicTitle: "Linux & Command Line Fundamentals",
      resources: [
        {
          title: "Linux Journey",
          type: ResourceType.DOCUMENTATION,
          url: "https://linuxjourney.com/",
        },
      ],
    },
    {
      topicTitle: "CI/CD Fundamentals",
      resources: [
        {
          title: "GitHub Actions Documentation",
          type: ResourceType.DOCUMENTATION,
          url: "https://docs.github.com/en/actions",
        },
      ],
    },
    {
      topicTitle: "Debugging Infrastructure Issues",
      resources: [
        {
          title: "Docker: Debugging Containers",
          type: ResourceType.DOCUMENTATION,
          url: "https://docs.docker.com/config/containers/logging/",
        },
      ],
    },
    {
      topicTitle: "Containers & Orchestration",
      resources: [
        {
          title: "Kubernetes Documentation",
          type: ResourceType.DOCUMENTATION,
          url: "https://kubernetes.io/docs/home/",
        },
      ],
    },
    {
      topicTitle: "Infrastructure Architecture",
      resources: [
        {
          title: "Terraform Documentation",
          type: ResourceType.DOCUMENTATION,
          url: "https://developer.hashicorp.com/terraform/docs",
        },
      ],
    },
    {
      topicTitle: "Reliability & Performance Monitoring",
      resources: [
        {
          title: "Google SRE Book",
          type: ResourceType.DOCUMENTATION,
          url: "https://sre.google/sre-book/table-of-contents/",
        },
      ],
    },
    {
      topicTitle: "Cloud & Infrastructure Security",
      resources: [
        {
          title: "AWS Security Best Practices",
          type: ResourceType.DOCUMENTATION,
          url: "https://aws.amazon.com/architecture/security-identity-compliance/",
        },
      ],
    },
    {
      topicTitle: "Real-World DevOps Project Patterns",
      resources: [
        {
          title: "The Phoenix Project (overview)",
          type: ResourceType.ARTICLE,
          url: "https://itrevolution.com/product/the-phoenix-project/",
        },
      ],
    },
  ],
};

async function main() {
  for (const [trackName, topicSeeds] of Object.entries(TRACK_RESOURCES)) {
    const track = await prisma.learningTrack.findFirst({
      where: { name: trackName },
    });

    if (!track) {
      console.warn(`Track not found, skipping: ${trackName}`);
      continue;
    }

    for (const { topicTitle, resources } of topicSeeds) {
      const topic = await prisma.topic.findFirst({
        where: { trackId: track.id, title: topicTitle },
        include: { _count: { select: { resources: true } } },
      });

      if (!topic) {
        console.warn(`  Topic not found, skipping: ${topicTitle}`);
        continue;
      }

      if (topic._count.resources > 0) {
        console.log(`  Skipping (already has resources): ${topicTitle}`);
        continue;
      }

      await prisma.topic.update({
        where: { id: topic.id },
        data: { resources: { create: resources } },
      });

      console.log(`  Added ${resources.length} resource(s): ${topicTitle}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
