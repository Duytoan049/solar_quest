type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
import GlareHover from "./GlareHover";
import TargetCursor from "./TargetCursor";
export default function Button({ children, ...props }: Props) {
  return (
    <>
      <TargetCursor spinDuration={5} hideDefaultCursor={true} />
      <GlareHover
        glareColor="#ffffff"
        glareOpacity={0.3}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={800}
        playOnce={false}
        width={"200px"}
        height={"60px"}
        borderRadius={"20px"}
        style={{
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "12px",
          transform: "translateY(-2px)",
        }}
      >
        <button {...props} className="cursor-target w-48 h-14">
          {children}
        </button>
      </GlareHover>
    </>
  );
}
