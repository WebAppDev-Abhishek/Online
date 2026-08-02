import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPhone = process.env.ADMIN_PHONE || "9999999999";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      name: "Rajesh Kumar",
      phone: adminPhone,
      email: "admin@pcbonline.in",
      passwordHash,
      role: "ADMIN",
    },
  });

  const course1 = await prisma.course.upsert({
    where: { slug: "pcb-design-from-scratch" },
    update: {},
    create: {
      title: "PCB Design From Scratch",
      slug: "pcb-design-from-scratch",
      description:
        "Master the fundamentals of PCB design — schematic capture, footprint creation, routing, and manufacturing-ready Gerber files. Perfect for absolute beginners.",
      thumbnail: "/courses/pcb-basics.svg",
      level: "Beginner",
      duration: "6 weeks",
      isFree: true,
      isPublished: true,
      modules: {
        create: [
          {
            title: "Introduction to PCB Design",
            description: "What PCBs are and why they matter",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Welcome & Course Overview",
                  type: "VIDEO",
                  contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                  contentText:
                    "An overview of the PCB design journey — from idea to manufactured board.",
                  durationMin: 8,
                  order: 1,
                },
                {
                  title: "PCB vs Breadboard vs Perfboard",
                  type: "VIDEO",
                  contentText:
                    "Compare prototyping methods and when to move to a PCB.",
                  durationMin: 12,
                  order: 2,
                },
                {
                  title: "Module 1 Notes (PDF)",
                  type: "PDF",
                  contentText:
                    "Downloadable summary of PCB layers, copper, soldermask, and silkscreen.",
                  durationMin: 5,
                  order: 3,
                },
                {
                  title: "Module 1 Quiz",
                  type: "QUIZ",
                  durationMin: 10,
                  order: 4,
                  quiz: {
                    create: {
                      questions: JSON.stringify([
                        {
                          q: "What does PCB stand for?",
                          options: [
                            "Printed Circuit Board",
                            "Power Control Box",
                            "Primary Chip Bridge",
                            "Passive Current Bus",
                          ],
                          answer: 0,
                        },
                        {
                          q: "Which layer typically carries component labels?",
                          options: [
                            "Copper",
                            "Silkscreen",
                            "Soldermask",
                            "Core",
                          ],
                          answer: 1,
                        },
                      ]),
                    },
                  },
                },
              ],
            },
          },
          {
            title: "Schematic Capture",
            description: "Drawing circuits correctly",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Choosing EDA Software",
                  type: "VIDEO",
                  contentText: "KiCad, EasyEDA, and Altium — which to pick.",
                  durationMin: 15,
                  order: 1,
                },
                {
                  title: "Drawing Your First Schematic",
                  type: "VIDEO",
                  contentText:
                    "Symbols, nets, power flags, and ERC basics.",
                  durationMin: 20,
                  order: 2,
                },
                {
                  title: "Schematic Cheat Sheet",
                  type: "PDF",
                  contentText: "Quick reference for common schematic symbols.",
                  durationMin: 5,
                  order: 3,
                },
              ],
            },
          },
          {
            title: "PCB Layout & Routing",
            description: "From netlist to copper traces",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Footprints & Component Placement",
                  type: "VIDEO",
                  contentText:
                    "Best practices for placing ICs, connectors, and passives.",
                  durationMin: 18,
                  order: 1,
                },
                {
                  title: "Trace Width, Clearance & Ground Planes",
                  type: "VIDEO",
                  contentText:
                    "Design rules that keep boards manufacturable and reliable.",
                  durationMin: 22,
                  order: 2,
                },
                {
                  title: "Routing Lab Template",
                  type: "PDF",
                  contentText: "Practice board template for routing exercises.",
                  durationMin: 30,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "gerber-files-manufacturing" },
    update: {},
    create: {
      title: "Gerber Files & Manufacturing",
      slug: "gerber-files-manufacturing",
      description:
        "Learn how to generate Gerber and drill files, pick a fab house, and avoid the most common DFM mistakes.",
      thumbnail: "/courses/gerber.svg",
      level: "Intermediate",
      duration: "3 weeks",
      isFree: true,
      isPublished: true,
      modules: {
        create: [
          {
            title: "Exporting Manufacturing Files",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Gerber Layers Explained",
                  type: "VIDEO",
                  contentText: "RS-274X layers and what fabs expect.",
                  durationMin: 14,
                  order: 1,
                },
                {
                  title: "DFM Checklist",
                  type: "PDF",
                  contentText: "Pre-submit checklist for PCB fabs.",
                  durationMin: 8,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "kiCad-crash-course" },
    update: {},
    create: {
      title: "KiCad Crash Course",
      slug: "kiCad-crash-course",
      description:
        "A hands-on sprint through KiCad 8 — project setup, libraries, PCB editor, and 3D viewer.",
      thumbnail: "/courses/kicad.svg",
      level: "Beginner",
      duration: "2 weeks",
      isFree: true,
      isPublished: true,
      modules: {
        create: [
          {
            title: "KiCad Essentials",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Installing & First Project",
                  type: "VIDEO",
                  contentText: "Set up KiCad and create a blinky LED board.",
                  durationMin: 16,
                  order: 1,
                },
                {
                  title: "Library Management",
                  type: "VIDEO",
                  contentText: "Symbols, footprints, and custom libraries.",
                  durationMin: 18,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded admin:", admin.phone);
  console.log("Seeded courses:", course1.slug, course2.slug, course3.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
