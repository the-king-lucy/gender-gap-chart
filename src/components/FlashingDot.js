import { useEffect, useState } from "react";

const FlashingDot = ({ cx, cy, fill }) => {
  if (!cx || !cy) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill || "#c21616"}
      className="glowing-dot"
    />
  );
};

export default FlashingDot;
