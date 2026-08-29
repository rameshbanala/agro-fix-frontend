import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/ui/Button";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-brand-600 to-brand-400 text-white">
    <Compass className="w-16 h-16 mb-4 text-accent-300" />
    <h1 className="text-5xl font-extrabold mb-2">404</h1>
    <p className="text-xl mb-8 font-light">This page doesn't exist.</p>
    <Link to="/">
      <Button>Back to Home</Button>
    </Link>
  </div>
);

export default NotFound;
