import { useEffect, useState } from "react";

const FlashingDot = ({ cx, cy, fill }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 1 ? 0.3 : 1)); // Flash effect
    }, 700); // Change opacity every 700ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return <circle cx={cx} cy={cy} r={6} fill={fill} opacity={opacity} />;
};

export default FlashingDot;
