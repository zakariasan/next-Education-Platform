import React from "react";
import ReviewQueue from "@/components/gamification/ReviewQueue";

const page = () => (
  <ReviewQueue apiBase="/api/student/reviews" title="Peer reviews" subtitle="Review classmates on projects you already validated — earn XP and correction points" peerMode />
);

export default page;
