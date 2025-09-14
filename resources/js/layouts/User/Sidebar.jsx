import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
  const { url } = usePage();

  const menuItems = [
    {
      name: 'Batik Saya',
      href: '/dashboard',
      icon: url === '/dashboard' ? '/images/sideicon/home-active.svg' : '/images/sideicon/home.png',
    },
    { name: 'Motif', href: '/motif', 
      icon: url === '/motif' ? '/images/sideicon/motif-active.svg' : '/images/sideicon/motif.svg' },
    {
      name: 'Konveksi',
      href: '/konveksi',
      icon: url.startsWith('/konveksi') ? '/images/sideicon/konveksi-active.svg' : '/images/sideicon/konveksi.png',
    },
    { name: 'Produksi', href: '/produksi', 
      icon: url.startsWith('/produksi') ? '/images/sideicon/produksi-active.svg' : '/images/sideicon/produksi.png' },
    { name: 'Bantuan', href: '/bantuan', 
      icon: url === '/bantuan' ? '/images/sideicon/bantuan-active.svg' : '/images/sideicon/bantuan.png' },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className="px-6 pt-3 flex items-center h-24 w-64 border-b border-gray-100">
          <img
            src="/images/LARASENA.png"
            alt="Larasena Logo"
            className="object-contain h-46 hover:transform hover:scale-105 transition-transform duration-300"
          />
      </div>


      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = url.startsWith(item.href) && item.href !== '#';
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:bg-[#BA682A1A] hover:text-[#BA682A]'
              }`}
              style={{
                backgroundColor: isActive ? '#BA682A' : undefined,
              }}
            >
              <img
                src={item.icon}
                alt={item.name}
                className="w-5 h-5 object-contain"
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


