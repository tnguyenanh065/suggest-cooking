import { useState, useMemo } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useDishes, Dish } from "@/hooks/use-dishes";
import { DishCard } from "@/components/dish-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch as ToggleSwitch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Loader2, Sparkles, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const queryClient = new QueryClient();

function Home() {
  const { dishes, isLoading, error } = useDishes();
  
  const [selectedMeats, setSelectedMeats] = useState<Set<string>>(new Set(["Gà", "Heo", "Bò"]));
  const [haveIngredients, setHaveIngredients] = useState({
    trung: true,
    rauCu: true,
    bot: true,
    sua: true,
    giaVi: true,
  });
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set(["<30'", "30'-1h", ">1h"]));
  const [weather, setWeather] = useState<string>("Bình thường");
  
  const [randomSuggestion, setRandomSuggestion] = useState<Dish | null>(null);
  
  const handleMeatToggle = (meat: string) => {
    setSelectedMeats(prev => {
      const next = new Set(prev);
      if (next.has(meat)) next.delete(meat);
      else next.add(meat);
      return next;
    });
  };

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => {
      const next = new Set(prev);
      if (next.has(time)) next.delete(time);
      else next.add(time);
      return next;
    });
  };

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      // 1. Meat filter
      if (dish.thit && !selectedMeats.has(dish.thit)) return false;
      
      // 2. Ingredients filter (exclude if dish needs it but user doesn't have it)
      if (dish.canTrung && !haveIngredients.trung) return false;
      if (dish.canRauCu && !haveIngredients.rauCu) return false;
      if (dish.canBot && !haveIngredients.bot) return false;
      if (dish.canSua && !haveIngredients.sua) return false;
      if (dish.canGiVi && !haveIngredients.giaVi) return false;
      
      // 3. Time filter
      if (dish.thoiGian && !selectedTimes.has(dish.thoiGian)) return false;
      
      // 4. Weather filter
      if (weather !== "Bình thường" && dish.khongNenAn === weather) return false;
      
      return true;
    });
  }, [dishes, selectedMeats, haveIngredients, selectedTimes, weather]);

  const suggestRandom = () => {
    if (filteredDishes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredDishes.length);
    setRandomSuggestion(filteredDishes[randomIndex]);
  };

  const clearRandom = () => setRandomSuggestion(null);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Meats */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Loại thịt</h3>
        <div className="flex flex-col gap-2">
          {["Gà", "Heo", "Bò"].map(meat => (
            <div key={meat} className="flex items-center space-x-2">
              <Checkbox 
                id={`meat-${meat}`} 
                checked={selectedMeats.has(meat)}
                onCheckedChange={() => handleMeatToggle(meat)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor={`meat-${meat}`} className="text-base cursor-pointer">{meat}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Bạn có sẵn</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ing-trung" className="text-base cursor-pointer">Trứng</Label>
            <ToggleSwitch id="ing-trung" checked={haveIngredients.trung} onCheckedChange={(c) => setHaveIngredients(p => ({...p, trung: c}))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ing-raucu" className="text-base cursor-pointer">Rau củ</Label>
            <ToggleSwitch id="ing-raucu" checked={haveIngredients.rauCu} onCheckedChange={(c) => setHaveIngredients(p => ({...p, rauCu: c}))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ing-bot" className="text-base cursor-pointer">Bột</Label>
            <ToggleSwitch id="ing-bot" checked={haveIngredients.bot} onCheckedChange={(c) => setHaveIngredients(p => ({...p, bot: c}))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ing-sua" className="text-base cursor-pointer">Sữa</Label>
            <ToggleSwitch id="ing-sua" checked={haveIngredients.sua} onCheckedChange={(c) => setHaveIngredients(p => ({...p, sua: c}))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ing-giavi" className="text-base cursor-pointer text-muted-foreground">Gia vị đặc biệt</Label>
            <ToggleSwitch id="ing-giavi" checked={haveIngredients.giaVi} onCheckedChange={(c) => setHaveIngredients(p => ({...p, giaVi: c}))} />
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Thời gian nấu</h3>
        <div className="flex flex-col gap-2">
          {["<30'", "30'-1h", ">1h"].map(time => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox 
                id={`time-${time}`} 
                checked={selectedTimes.has(time)}
                onCheckedChange={() => handleTimeToggle(time)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor={`time-${time}`} className="text-base cursor-pointer">{time === "<30'" ? "Dưới 30 phút" : time === ">1h" ? "Hơn 1 tiếng" : "Từ 30p - 1 tiếng"}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Thời tiết tối nay</h3>
        <RadioGroup value={weather} onValueChange={setWeather} className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Bình thường" id="w-normal" className="text-primary border-primary" />
            <Label htmlFor="w-normal" className="text-base cursor-pointer">Bình thường</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Quá nóng" id="w-hot" className="text-primary border-primary" />
            <Label htmlFor="w-hot" className="text-base cursor-pointer">Nóng bức</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Quá lạnh" id="w-cold" className="text-primary border-primary" />
            <Label htmlFor="w-cold" className="text-base cursor-pointer">Trời lạnh</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <ChefHat className="h-6 w-6" />
            <h1 className="font-serif text-2xl font-bold tracking-tight">Tối nay ăn gì?</h1>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="font-serif text-xl">Lọc món ăn</SheetTitle>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 shrink-0 h-[calc(100vh-8rem)] sticky top-24 overflow-y-auto pr-6 custom-scrollbar">
          <FilterContent />
        </aside>

        {/* Main Content */}
        <section className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Đang dọn bếp...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-destructive">
              <p>Có lỗi xảy ra khi tải món ăn. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-foreground">
                    Có <span className="text-primary font-bold">{filteredDishes.length}</span> món phù hợp
                  </h2>
                  <p className="text-muted-foreground mt-1">Dựa trên nguyên liệu bạn đang có</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={suggestRandom}
                  disabled={filteredDishes.length === 0}
                  className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition-all active:scale-95 gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Gợi ý ngẫu nhiên
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {randomSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="relative z-10"
                  >
                    <div className="absolute -top-3 left-6 z-20">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Đề xuất cho bạn
                      </span>
                    </div>
                    <div className="relative pt-2 pb-6">
                      <DishCard dish={randomSuggestion} isHighlighted />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={clearRandom}
                        className="absolute top-4 right-2 text-muted-foreground hover:bg-black/5 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredDishes.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <ChefHat className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground">Bếp hôm nay hơi trống</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Không tìm thấy món nào phù hợp với nguyên liệu hiện tại. Bạn thử nới lỏng bộ lọc hoặc mua thêm chút đồ xem sao?
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDishes.map((dish, i) => (
                    <DishCard key={`${dish.stt}-${i}`} dish={dish} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
