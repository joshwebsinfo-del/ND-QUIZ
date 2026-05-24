import { hw_lo1 } from './hw_lo1';
import { hw_lo2 } from './hw_lo2';
import { hw_lo3 } from './hw_lo3';
import { hw_lo4 } from './hw_lo4';
import { hw_lo5 } from './hw_lo5';
import { hw_lo6 } from './hw_lo6';
import { hw_lo7 } from './hw_lo7';
import { hw_lo8 } from './hw_lo8';
import { net_lo1 } from './net_lo1';
import { net_lo2 } from './net_lo2';
import { net_lo3 } from './net_lo3';
import { sw_lo1 } from './sw_lo1';
import { sw_lo2 } from './sw_lo2';
import { sw_lo3 } from './sw_lo3';
import { sw_lo4 } from './sw_lo4';
import { sw_lo5 } from './sw_lo5';
import { sw_lo6 } from './sw_lo6';
import { oop_lo1, oop_lo2, oop_lo3, oop_lo4, oop_lo5, oop_lo6, oop_lo7 } from './oop_quizzes';
import { db_lo1, db_lo2, db_lo3, db_lo4, db_lo5 } from './db_quizzes';

const hwQuizzes = [hw_lo1, hw_lo2, hw_lo3, hw_lo4, hw_lo5, hw_lo6, hw_lo7, hw_lo8];
const netQuizzes = [net_lo1, net_lo2, net_lo3];
const swQuizzes = [sw_lo1, sw_lo2, sw_lo3, sw_lo4, sw_lo5, sw_lo6];
const oopQuizzes = [oop_lo1, oop_lo2, oop_lo3, oop_lo4, oop_lo5, oop_lo6, oop_lo7];
const dbQuizzes = [db_lo1, db_lo2, db_lo3, db_lo4, db_lo5];

export const modulesData = [
  {
    id: "module-hardware",
    title: "Hardware Administration",
    code: "553/23/M01",
    description: "Repair IT hardware, assemble components, maintain workshop practice, and enforce hardware security.",
    icon: "🖥️",
    color: "#4f46e5",
    quizzes: hwQuizzes.map(q => q.id),
  },
  {
    id: "module-network",
    title: "Network Administration",
    code: "553/23/M02",
    description: "Plan, install, configure, and maintain computer networks and their operations.",
    icon: "🌐",
    color: "#0891b2",
    quizzes: netQuizzes.map(q => q.id),
  },
  {
    id: "module-software",
    title: "Software Engineering",
    code: "553/23/M03",
    description: "Develop and maintain software using engineering methodologies from requirements to deployment.",
    icon: "⚙️",
    color: "#059669",
    quizzes: swQuizzes.map(q => q.id),
  },
  {
    id: "module-oop",
    title: "Object-Oriented Programming",
    code: "553/23/M05",
    description: "Master OOP pillars: classes, objects, encapsulation, inheritance, polymorphism, and design patterns.",
    icon: "🧩",
    color: "#7c3aed",
    quizzes: oopQuizzes.map(q => q.id),
  },
  {
    id: "module-database",
    title: "Database Administration",
    code: "553/23/M04",
    description: "Design, develop, maintain, and secure relational databases. Manage backups and concurrency.",
    icon: "🗄️",
    color: "#b45309",
    quizzes: dbQuizzes.map(q => q.id),
  },
];

const allQuizList = [...hwQuizzes, ...netQuizzes, ...swQuizzes, ...oopQuizzes, ...dbQuizzes];

export const getAllQuizzes = () => allQuizList;

export const getQuizById = (id) => allQuizList.find(q => q.id === id);
