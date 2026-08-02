import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { CourseCard, TrustBar } from "@/components/CourseCard";
import { FaqAccordion, SyllabusAccordion } from "@/components/Accordions";
import { Testimonials } from "@/components/Testimonials";
import {
  ChatBanner,
  InstructorSection,
  WhySection,
} from "@/components/Sections";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getFeaturedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true, isFree: true },
      take: 6,
      orderBy: { createdAt: "asc" },
      include: {
        modules: { include: { lessons: true } },
      },
    });
    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      level: c.level,
      duration: c.duration,
      thumbnail: c.thumbnail,
      isFree: c.isFree,
      lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <WhySection />

        <section id="courses" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
                  Featured free courses
                </h2>
                <p className="mt-2 text-muted">
                  Start today — no payment, no OTP gate.
                </p>
              </div>
              <a href="/courses" className="btn-ghost !py-2 text-sm">
                View all
              </a>
            </div>
            {courses.length === 0 ? (
              <p className="text-muted">
                Courses will appear here after database setup.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </section>

        <InstructorSection />
        <ChatBanner />

        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
              Student stories
            </h2>
            <Testimonials />
          </div>
        </section>

        <section className="border-b border-line bg-elevated/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
                Curriculum preview
              </h2>
              <p className="mt-3 text-muted">
                Expand each module to see what you&apos;ll learn on the path from
                blank schematic to fab-ready Gerbers.
              </p>
            </div>
            <SyllabusAccordion />
          </div>
        </section>

        <section id="faq" className="border-b border-line">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
              FAQ
            </h2>
            <FaqAccordion />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
