import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/Components/ui/button";

const Header = () => {
    const [darkMode, setDarkMode] = useState(true); // Default to dark mode

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark", !darkMode);
    };

    // Apply the theme on initial load
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <header className="py-4">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between rounded-lg">
                {/* Left Section: Logo only */}
                <div className="flex items-center">
                    <a href="/" aria-label="Go to homepage">
                        <img
                            src={
                                darkMode
                                    ? "/images/DNSexport-logo-light.svg"
                                    : "/images/DNSexport-logo-dark.svg"
                            }
                            alt="DNS Export Logo"
                            className="h-10"
                        />
                    </a>
                </div>

                {/* Right Section: Dark Mode Toggle only */}
                <Button
                    onClick={toggleDarkMode}
                    variant="outline"
                    className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                        darkMode
                            ? "bg-[hsl(var(--menu-toggle))] text-[hsl(var(--text-standard))] hover:bg-[hsl(var(--menu-toggle-hover))]"
                            : "bg-[hsl(var(--menu-toggle))] text-[hsl(var(--text-standard))] hover:bg-[hsl(var(--menu-toggle-hover))]"
                    }`}
                    aria-label="Toggle Dark Mode"
                >
                    {darkMode ? (
                        <Moon className="h-5 w-5" />
                    ) : (
                        <Sun className="h-5 w-5" />
                    )}
                </Button>
            </div>
        </header>
    );
};

export default Header;