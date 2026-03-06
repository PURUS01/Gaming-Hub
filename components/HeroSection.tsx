export default function HeroSection() {
  const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
  
  return (
    <div className="relative bg-gradient-to-br from-gaming-darker via-gray-900 to-gaming-darker py-12 sm:py-16 md:py-20 mb-8 sm:mb-12 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${patternUrl}")` }}
      ></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gaming-purple via-gaming-blue to-gaming-green bg-clip-text text-transparent">
          Gaming Hub
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
          Your ultimate destination for browser games. Play, discover, and manage your favorite games all in one place.
        </p>
      </div>
    </div>
  );
}
