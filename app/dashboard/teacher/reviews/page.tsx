import React from "react";
import ReviewQueue from "@/components/gamification/ReviewQueue";

const page = () => (
  <ReviewQueue apiBase="/api/teacher/reviews" title="Review queue" subtitle="Grade teacher criteria and spot-check peer reviews" />
);

export default page;
