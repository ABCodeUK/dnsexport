import { PropsWithChildren } from 'react';
import Header from '@/Components/Header'; // Assuming the header template is here
import Footer from '@/Components/Footer'; // Assuming the footer template is here

export default function MainLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Section */}
            <Header />

            {/* Main Content Section */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}
