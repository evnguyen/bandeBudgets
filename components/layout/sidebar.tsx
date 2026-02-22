'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Settings, HelpCircle, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Budget',
      href: '/',
      icon: Wallet,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      label: 'Help',
      href: '#',
      icon: HelpCircle,
    },
  ];

  const navList = (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div className="flex w-full items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
        <h1 className="text-lg font-bold text-primary">Budget</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary">Budget</h2>
            </div>
            <nav className="space-y-2">{navList}</nav>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-64 border-r border-border bg-background lg:block">
        <nav className="space-y-2 p-4">
          <div className="mb-8 px-3 py-4">
            <h1 className="text-2xl font-bold text-primary">Budget</h1>
          </div>
          {navList}
        </nav>
      </aside>
    </>
  );
}
