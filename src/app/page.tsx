import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="container py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">FitFusion</h1>
        <p className="text-gray-600 mb-8">
          Track workouts &amp; nutrition, visualize progress, join communities,
          and unlock AI coaching.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signin" className="btn">
            Get started
          </Link>
          <Link href="/dashboard" className="btn-outline">
            Preview
          </Link>
        </div>
      </div>
    </section>
  );
}
