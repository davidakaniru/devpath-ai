import {
  BarChart3,
  Boxes,
  Cloud,
  Layout,
  Server,
  Smartphone,
} from "lucide-react";

export const careerGoals = [
  {
    id: "frontend",
    title: "Frontend Developer",
    desc: "Focus on user interface development and web applications.",
    icon: Layout,
  },
  {
    id: "backend",
    title: "Backend Developer",
    desc: "Focus on server-side development and APIs.",
    icon: Server,
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    desc: "Combines frontend and backend development.",
    icon: Boxes,
  },
  {
    id: "mobile",
    title: "Mobile Developer",
    desc: "Focus on Android and iOS application development.",
    icon: Smartphone,
  },
  {
    id: "data",
    title: "Data Scientist",
    desc: "Focus on data analysis and machine learning.",
    icon: BarChart3,
  },
  {
    id: "devops",
    title: "DevOps Engineer",
    desc: "Focus on automation, cloud infrastructure, and deployment.",
    icon: Cloud,
  },
];
