"use client";
import { Search, User, ShoppingCart, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import type { CategoryResponse } from "@/types/Category";
import { getCartCount } from "@/services/cartService";
import { AuthService } from "@/services/authService";

export function Header({ categories }: { categories: CategoryResponse[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const token = typeof window !== "undefined" ? AuthService.getToken?.() : null;
    if (!token) return; // Chỉ gọi khi đã đăng nhập
    getCartCount()
      .then(setCartCount)
      .catch(() => setCartCount(0));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          <Link href="/" className={`flex items-center gap-3 shrink-0 ${searchOpen ? "hidden lg:flex" : "flex"}`}>
            <img
              src="/logo-smart-mall.png"
              alt="SmartMall Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-semibold text-primary">SmartMall</span>
          </Link>

          <form onSubmit={handleSearch} className={`${searchOpen ? "flex-1" : "hidden lg:flex lg:flex-1"} max-w-4xl`}>
            <div className="relative w-full lg:w-[80%] mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-input-background border-0"
              />
            </div>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            {!searchOpen && (
              <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={() => setSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>
            )}

            {searchOpen && (
              <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={() => setSearchOpen(false)}>
                <span className="text-sm">Hủy</span>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="rounded-xl hidden lg:flex" onClick={() => router.push("/dang-nhap")}>
              <User className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`rounded-xl relative ${searchOpen ? "hidden lg:flex" : "flex"}`}
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1">{cartCount}</Badge>}
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`rounded-xl lg:hidden ${searchOpen ? "hidden" : "flex"}`}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <div className="mt-6 pb-4 border-b">
                  <button
                    onClick={() => {
                      router.push("/dang-nhap");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors w-full"
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-sm">Tài khoản</span>
                  </button>
                </div>

                <nav className="mt-4">
                  <p className="px-4 text-xs text-muted-foreground mb-2">DANH MỤC</p>
                  <ul className="space-y-1">
                    {categories.map((category) => (
                      <li key={category.id}>
                <Link
                          href={`/search?categoryIds=${category.id}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-xl text-sm text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <nav className="border-t hidden lg:block">
          <ul className="flex items-center gap-8 py-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/search?categoryIds=${category.id}`} className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}




