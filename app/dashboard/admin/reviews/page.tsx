import React from "react";
import ReviewQueue from "@/components/gamification/ReviewQueue";

const page = () => (
  <ReviewQueue apiBase="/api/teacher/reviews" title="All review queues" subtitle="Every pending teacher and peer review across the platform" />
);

export default page;
