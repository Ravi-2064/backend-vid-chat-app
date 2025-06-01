import { ShipWheelIcon } from "lucide-react";

const Logo = ({ size = "default" }) => {
  const sizes = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const textSizes = {
    small: "text-sm",
    default: "text-xl",
    large: "text-2xl",
    xl: "text-4xl"
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className="relative">
        <ShipWheelIcon className={`${sizes[size]} text-primary group-hover:animate-spin transition-all duration-300`} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm" />
      </div>
      <div className="relative">
        <span className={`${textSizes[size]} font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
          Streamify
        </span>
        <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300" />
      </div>
    </div>
  );
};

export default Logo; 