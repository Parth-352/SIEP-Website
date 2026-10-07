import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-alice-blue/70 backdrop-blur-lg border-b border-jet-black/10 shadow-sm pointer-events-auto font-sans transition-all duration-300">
      <Link href="/" className="text-2xl font-black text-jet-black tracking-tighter">
        Riders Bay<span className="text-orange">.</span>
      </Link>
      
      {/* Desktop Menu */}
      <div className="space-x-8 text-jet-black font-medium hidden md:flex items-center text-sm uppercase tracking-widest">
        <Link href="/about" className="hover:text-orange transition-colors">About</Link>
        <Link href="/competition" className="hover:text-orange transition-colors">Competition</Link>
        <Link href="/bike" className="hover:text-orange transition-colors">The Bike</Link>
        <Link href="/journey" className="hover:text-orange transition-colors">Journey</Link>
        <Link href="/student-hub" className="hover:text-orange transition-colors">Student Hub</Link>
        <Link href="/sponsorship" className="hover:text-orange transition-colors">Sponsors</Link>
        
        {/* Primary CTA */}
        <Link 
          href="/contact" 
          className="ml-4 px-6 py-2 bg-jet-black text-alice-blue hover:bg-orange transition-all rounded-sm font-bold shadow-md"
        >
          Contact
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden text-jet-black font-bold uppercase tracking-widest text-sm">
        Menu
      </div>
    </nav>
  );
}
