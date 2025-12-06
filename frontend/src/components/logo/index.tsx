// import { AudioWaveform } from "lucide-react";
import { Link } from "react-router-dom";


const Logo = (props: { url?: string }) => {
  const { url = "/" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url}>
        <div className="flex h-9 w-9 items-center justify-center rounded-md text-primary-foreground">
          <img src="/images/SMKN5_MALANG.png" alt="Logo" className="size-9" />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
