const Footer = () => {
    return (
        <footer className="bg-deep-cocoa text-soft-peach py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h3 className="text-2xl font-playfair mb-4">ArtisanConnect</h3>
                <p className="text-sm font-light opacity-80">Empowering creative professionals and clients.</p>
                <div className="mt-6 pt-6 border-t border-muted-taupe/30">
                    <p className="text-xs">&copy; {new Date().getFullYear()} ArtisanConnect. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
