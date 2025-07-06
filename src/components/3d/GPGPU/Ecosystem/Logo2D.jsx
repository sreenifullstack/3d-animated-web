import { cn } from "@/lib/utils";

export const Logo2D = ({ src, className, ...props }) => {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center p-0 mx-auto md:mx-2 md:p-2 ",
        className
      )}
    >
      <img
        src={src}
        className="w-auto h-full max-h-32 scale-100  p-0 md:p-3   bg-black/5 backdrop-blur-sm rounded-sm  border-2 border-white/25 object-contain"
        {...props}
      />
    </div>
  );
};
