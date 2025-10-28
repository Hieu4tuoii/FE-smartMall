// import { Search, User, ShoppingCart, Menu } from "lucide-react";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "./ui/sheet";
// import { useCart } from "../lib/cart-context";
// import { categories } from "../lib/data";
// import { useState } from "react";

// export function Header() {
//   const { getTotalItems } = useCart();
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
//     }
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
//       <div className="container mx-auto px-4">
//         {/* Top Header */}
//         <div className="flex items-center justify-between py-4 gap-4">
//           {/* Logo */}
//           <Link
//             to="/"
//             className={`flex items-center gap-3 shrink-0 ${searchOpen ? "hidden lg:flex" : "flex"}`}
//           >
//             <img
//               src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=120&h=120&fit=crop"
//               alt="SmartMall Logo"
//               className="w-10 h-10 rounded-xl object-cover"
//             />
//             <span className="text-xl font-semibold text-primary">
//               SmartMall
//             </span>
//           </Link>

//           {/* Search - Desktop Always Visible */}
//           <form
//             onSubmit={handleSearch}
//             className={`${searchOpen ? "flex-1" : "hidden lg:flex lg:flex-1"} max-w-4xl`}
//           >
//             <div className="relative w-full lg:w-[80%] mx-auto">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//               <Input
//                 type="text"
//                 placeholder="Tìm kiếm sản phẩm..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 h-11 rounded-2xl bg-input-background border-0"
//               />
//             </div>
//           </form>

//           {/* Actions */}
//           <div className="flex items-center gap-3 shrink-0">
//             {/* Search Button - Mobile Only */}
//             {!searchOpen && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="rounded-xl lg:hidden"
//                 onClick={() => setSearchOpen(true)}
//               >
//                 <Search className="w-5 h-5" />
//               </Button>
//             )}

//             {/* Close Search Button - Mobile Only */}
//             {searchOpen && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="rounded-xl lg:hidden"
//                 onClick={() => setSearchOpen(false)}
//               >
//                 <span className="text-sm">Hủy</span>
//               </Button>
//             )}

//             {/* User Button - Desktop Only */}
//             <Button
//               variant="ghost"
//               size="icon"
//               className="rounded-xl hidden lg:flex"
//               onClick={() => navigate("/login")}
//             >
//               <User className="w-5 h-5" />
//             </Button>

//             {/* Cart Button */}
//             <Button
//               variant="ghost"
//               size="icon"
//               className={`rounded-xl relative ${searchOpen ? "hidden lg:flex" : "flex"}`}
//               onClick={() => navigate("/cart")}
//             >
//               <ShoppingCart className="w-5 h-5" />
//               {getTotalItems() > 0 && (
//                 <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1">
//                   {getTotalItems()}
//                 </Badge>
//               )}
//             </Button>

//             {/* Mobile Menu Button - Always Rightmost */}
//             <Sheet
//               open={mobileMenuOpen}
//               onOpenChange={setMobileMenuOpen}
//             >
//               <SheetTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className={`rounded-xl lg:hidden ${searchOpen ? "hidden" : "flex"}`}
//                 >
//                   <Menu className="w-5 h-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="right" className="w-64">
//                 <SheetHeader>
//                   <SheetTitle>Menu</SheetTitle>
//                 </SheetHeader>

//                 {/* Account Section */}
//                 <div className="mt-6 pb-4 border-b">
//                   <button
//                     onClick={() => {
//                       navigate("/login");
//                       setMobileMenuOpen(false);
//                     }}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors w-full"
//                   >
//                     <User className="w-5 h-5 text-primary" />
//                     <span className="text-sm">Tài khoản</span>
//                   </button>
//                 </div>

//                 {/* Categories */}
//                 <nav className="mt-4">
//                   <p className="px-4 text-xs text-muted-foreground mb-2">
//                     DANH MỤC
//                   </p>
//                   <ul className="space-y-1">
//                     {categories.map((category) => (
//                       <li key={category.id}>
//                         <Link
//                           to={`/category/${category.slug}`}
//                           onClick={() =>
//                             setMobileMenuOpen(false)
//                           }
//                           className="block px-4 py-3 rounded-xl text-sm text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
//                         >
//                           {category.name}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </nav>
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>

//         {/* Navigation - Desktop Only */}
//         <nav className="border-t hidden lg:block">
//           <ul className="flex items-center gap-8 py-3">
//             {categories.map((category) => (
//               <li key={category.id}>
//                 <Link
//                   to={`/category/${category.slug}`}
//                   className="text-sm text-foreground/80 hover:text-primary transition-colors"
//                 >
//                   {category.name}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>
//     </header>
//   );
// }