import { useRef, useEffect, useState, useId, FC, ReactNode } from "react";
import "./CurvedLoop.css";

interface CurvedLoopProps {
  items: ReactNode[]; // Mảng content thay cho chữ
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  items,
  speed = 2,
  className,
  curveAmount = 400,
  direction = "left",
}) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const uid = useId();
  const pathId = `curve-${uid}`;

  // Tạo path cong
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  useEffect(() => {
    if (pathRef.current && items.length > 0) {
      const pathLength = pathRef.current.getTotalLength();
      const spacing = pathLength / items.length;

      const newPoints = items.map((_, i) =>
        pathRef.current!.getPointAtLength(i * spacing)
      );
      setPoints(newPoints.map((p) => ({ x: p.x, y: p.y })));
    }
  }, [items, curveAmount]);

  return (
    <div className="curved-loop-jacket">
      <svg className="curved-loop-svg" viewBox="0 0 1440 200">
        <defs>
          <path
            ref={pathRef}
            id={pathId}
            d={pathD}
            fill="none"
            stroke="transparent"
          />
        </defs>

        {points.map((p, i) => (
          <foreignObject
            key={i}
            x={p.x - 25}
            y={p.y - 25}
            width={50}
            height={50}
          >
            <div className={className}>{items[i % items.length]}</div>
          </foreignObject>
        ))}
      </svg>
    </div>
  );
};

export default CurvedLoop;
