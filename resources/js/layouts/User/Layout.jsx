import Sidebar from './Sidebar';
import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, Settings, User, LogOut, ChevronDown, ChevronsRight } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Breadcrumbs = () => {
    const { url } = usePage();
    const pathname = url.split('?')[0];    
    const segments = pathname.slice(1).split('/').filter(Boolean);

    const formatSegment = (segment) => {
        if (!isNaN(segment)) return "Detail";
        return segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase()); 
    };

    return (
        <nav className="flex items-center text-sm font-medium text-gray-500">
            <Link href="/dashboard" className="hover:text-[#BA682A]">Home</Link>
            {segments.map((segment, index) => {
                const href = '/' + segments.slice(0, index + 1).join('/');
                const isLast = index === segments.length - 1;

                return (
                    <Fragment key={index}>
                        <ChevronsRight className="w-4 h-4 mx-1" />
                        <Link 
                            href={href} 
                            className={isLast ? "text-[#BA682A] font-semibold" : "hover:text-gray-700"}
                        >
                            {formatSegment(segment)}
                        </Link>
                    </Fragment>
                );
            })}
        </nav>
    );
};

export default function UserLayout({ children, title }) {
  // Ambil data user dari props global Inertia
  const { auth, url } = usePage().props;
  const user = auth.user;

  return (
    <>
      <Head title={title} />
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden min-h-screen">
          <header
            className=" relative z-20 flex items-center justify-between px-6 py-6 border-b bg-white shadow-sm"
            style={{ height: '97px' }}
          >
            <div>
              <h1 className="text-2xl font-bold text-[#BA682A] mb-1">{title}</h1>
              {/* Sembunyikan breadcrumbs hanya di halaman dashboard utama */}
              {url !== '/dashboard' && <Breadcrumbs />}
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
              
              {/* Dropdown Profil Pengguna */}
              <Menu as="div" className="relative z-10">
                <MenuButton className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=BA682A&color=fff`} 
                    alt="Avatar" 
                    className="rounded-full w-8 h-8" 
                  />
                  <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </MenuButton>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <MenuItems className="z-100 absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                            <MenuItem>
                                {({ active }) => (
                                    <Link
                                        href={route('profile.edit')}
                                        className={`${
                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Profil
                                    </Link>
                                )}
                            </MenuItem>
                            <MenuItem>
                                {({ active }) => (
                                    <Link
                                        href={route('logout')}
                                        method="post" // Logout harus menggunakan metode POST
                                        as="button"   // Render sebagai tombol agar bisa diklik
                                        className={`${
                                            active ? 'bg-red-500 text-white' : 'text-gray-700'
                                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Link>
                                )}
                            </MenuItem>
                        </div>
                    </MenuItems>
                </Transition>
              </Menu>
            </div>
          </header>
          
          {/* Konten Halaman */}
          <div className="flex-1 overflow-y-auto p-6">
              {children}
          </div>

        </main>
      </div>
    </>
  );
}