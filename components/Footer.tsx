export default function Footer() {
  return (
    <footer className="bg-gaming-darker border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center text-gray-400">
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Gaming Hub.</p>
        </div>
      </div>
    </footer>
  );
}
