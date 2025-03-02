import { useEffect, useState } from "react";

const FlashingDot = ({ cx, cy, fill }) => {
  if (!cx || !cy) return null; // Ensure valid positions

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6} // Slightly larger for visibility
      fill={fill || "#c21616"}
      className="glowing-dot" // ✅ Use CSS instead of state opacity
    />
  );
};

export default FlashingDot;
