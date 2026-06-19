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
    value: "FRONTEND_DEVELOPER",
    title: "Frontend Developer",
    desc: "Focus on user interface development and web applications.",
    icon: Layout,
  },
  {
    id: "backend",
    value: "BACKEND_DEVELOPER",
    title: "Backend Developer",
    desc: "Focus on server-side development and APIs.",
    icon: Server,
  },
  {
    id: "fullstack",
    value: "FULLSTACK_DEVELOPER",
    title: "Full Stack Developer",
    desc: "Combines frontend and backend development.",
    icon: Boxes,
  },
  {
    id: "mobile",
    value: "MOBILE_DEVELOPER",
    title: "Mobile Developer",
    desc: "Focus on Android and iOS application development.",
    icon: Smartphone,
  },
  {
    id: "data",
    value: "DATA_SCIENTIST",
    title: "Data Scientist",
    desc: "Focus on data analysis and machine learning.",
    icon: BarChart3,
  },
  {
    id: "devops",
    value: "DEVOPS_ENGINEER",
    title: "DevOps Engineer",
    desc: "Focus on automation, cloud infrastructure, and deployment.",
    icon: Cloud,
  },
];
