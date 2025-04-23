const Footer = () => {
    return (
        <footer className="mt-auto py-4 sm:py-6">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} DNS Export by ABCode. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
