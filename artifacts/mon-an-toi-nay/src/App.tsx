import { useState, useMemo } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import {
  useListDishes,
  useSyncDishes,
  useCreateDish,
  getListDishesQueryKey,
  Dish,
  DishInput,
} from "@workspace/api-client-react";
import { DishCard } from "@/components/dish-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch as ToggleSwitch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  X,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const EMPTY_FORM: DishInput = {
  stt: 0,
  ten: "",
  thit: "Gà",
  canTrung: false,
  canRauCu: false,
  canBot: false,
  canSua: false,
  canGiVi: false,
  thoiGian: "<30'",
  khongNenAn: "",
};

function AddDishDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DishInput>(EMPTY_FORM);
  const createDish = useCreateDish();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.ten.trim()) {
      toast({ title: "Vui lòng nhập tên món ăn", variant: "destructive" });
      return;
    }
    createDish.mutate(
      { data: form },
      {
        onSuccess: () => {
          toast({ title: `Đã thêm "${form.ten}" vào danh sách!` });
          setForm(EMPTY_FORM);
          setOpen(false);
          onSuccess();
        },
        onError: () => {
          toast({ title: "Có lỗi khi thêm món. Thử lại nhé!", variant: "destructive" });
        },
      }
    );
  };

  const toggle = (field: keyof Pick<DishInput, "canTrung" | "canRauCu" | "canBot" | "canSua" | "canGiVi">) =>
    setForm((p) => ({ ...p, [field]: !p[field] }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-add-dish">
          <Plus className="h-4 w-4" />
          Thêm món
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Thêm món mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="form-ten">Tên món</Label>
            <Input
              id="form-ten"
              data-testid="input-dish-name"
              placeholder="Ví dụ: Bò kho cà rốt"
              value={form.ten}
              onChange={(e) => setForm((p) => ({ ...p, ten: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="form-thit">Loại thịt</Label>
            <Select value={form.thit} onValueChange={(v) => setForm((p) => ({ ...p, thit: v }))}>
              <SelectTrigger id="form-thit" data-testid="select-dish-meat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gà">Gà</SelectItem>
                <SelectItem value="Heo">Heo</SelectItem>
                <SelectItem value="Bò">Bò</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="form-thoigian">Thời gian nấu</Label>
            <Select value={form.thoiGian} onValueChange={(v) => setForm((p) => ({ ...p, thoiGian: v }))}>
              <SelectTrigger id="form-thoigian" data-testid="select-dish-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<30'">Dưới 30 phút</SelectItem>
                <SelectItem value="30'-1h">30 phút - 1 tiếng</SelectItem>
                <SelectItem value=">1h">Hơn 1 tiếng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nguyên liệu cần thêm</Label>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["canTrung", "Trứng"],
                ["canRauCu", "Rau củ"],
                ["canBot", "Bột"],
                ["canSua", "Sữa"],
                ["canGiVi", "Gia vị đặc biệt"],
              ] as const).map(([field, label]) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={`form-${field}`}
                    checked={form[field]}
                    onCheckedChange={() => toggle(field)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={`form-${field}`} className="cursor-pointer font-normal">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="form-khongnenan">Không nên ăn khi (để trống nếu không có)</Label>
            <Select
              value={form.khongNenAn || "__none__"}
              onValueChange={(v) => setForm((p) => ({ ...p, khongNenAn: v === "__none__" ? "" : v }))}
            >
              <SelectTrigger id="form-khongnenan" data-testid="select-dish-avoid">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Không giới hạn</SelectItem>
                <SelectItem value="Quá nóng">Quá nóng</SelectItem>
                <SelectItem value="Quá lạnh">Quá lạnh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Huỷ</Button>
          <Button
            onClick={handleSubmit}
            disabled={createDish.isPending}
            data-testid="button-submit-dish"
            className="bg-primary text-white"
          >
            {createDish.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Thêm món
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Home() {
  const qc = useQueryClient();
  const { data: dishes = [], isLoading, error } = useListDishes();
  const syncDishes = useSyncDishes();
  const { toast } = useToast();

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
    setSelectedMeats((prev) => {
      if (prev.has(meat) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(meat)) next.delete(meat);
      else next.add(meat);
      return next;
    });
  };

  const handleTimeToggle = (time: string) => {
    setSelectedTimes((prev) => {
      if (prev.has(time) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(time)) next.delete(time);
      else next.add(time);
      return next;
    });
  };

  const handleSync = () => {
    syncDishes.mutate(undefined, {
      onSuccess: (result) => {
        toast({ title: result.message });
        qc.invalidateQueries({ queryKey: getListDishesQueryKey() });
        setRandomSuggestion(null);
      },
      onError: () => {
        toast({ title: "Đồng bộ thất bại. Kiểm tra kết nối mạng nhé!", variant: "destructive" });
      },
    });
  };

  const handleAddSuccess = () => {
    qc.invalidateQueries({ queryKey: getListDishesQueryKey() });
    setRandomSuggestion(null);
  };

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (dish.thit && !selectedMeats.has(dish.thit)) return false;
      if (dish.canTrung && !haveIngredients.trung) return false;
      if (dish.canRauCu && !haveIngredients.rauCu) return false;
      if (dish.canBot && !haveIngredients.bot) return false;
      if (dish.canSua && !haveIngredients.sua) return false;
      if (dish.canGiVi && !haveIngredients.giaVi) return false;
      if (dish.thoiGian && !selectedTimes.has(dish.thoiGian)) return false;
      if (weather !== "Bình thường" && dish.khongNenAn === weather) return false;
      return true;
    });
  }, [dishes, selectedMeats, haveIngredients, selectedTimes, weather]);

  const suggestRandom = () => {
    if (filteredDishes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredDishes.length);
    setRandomSuggestion(filteredDishes[randomIndex]);
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Loại thịt</h3>
        <div className="flex flex-col gap-2">
          {["Gà", "Heo", "Bò"].map((meat) => (
            <div key={meat} className="flex items-center space-x-2">
              <Checkbox
                id={`meat-${meat}`}
                checked={selectedMeats.has(meat)}
                onCheckedChange={() => handleMeatToggle(meat)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                data-testid={`checkbox-meat-${meat}`}
              />
              <Label htmlFor={`meat-${meat}`} className="text-base cursor-pointer">{meat}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Bạn có sẵn</h3>
        <div className="space-y-4">
          {([
            ["trung", "ing-trung", "Trứng"],
            ["rauCu", "ing-raucu", "Rau củ"],
            ["bot", "ing-bot", "Bột"],
            ["sua", "ing-sua", "Sữa"],
            ["giaVi", "ing-giavi", "Gia vị đặc biệt"],
          ] as const).map(([key, id, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={id} className="text-base cursor-pointer">{label}</Label>
              <ToggleSwitch
                id={id}
                checked={haveIngredients[key]}
                onCheckedChange={(c) => setHaveIngredients((p) => ({ ...p, [key]: c }))}
                data-testid={`toggle-${id}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Thời gian nấu</h3>
        <div className="flex flex-col gap-2">
          {(["<30'", "30'-1h", ">1h"] as const).map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${time}`}
                checked={selectedTimes.has(time)}
                onCheckedChange={() => handleTimeToggle(time)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                data-testid={`checkbox-time-${time}`}
              />
              <Label htmlFor={`time-${time}`} className="text-base cursor-pointer">
                {time === "<30'" ? "Dưới 30 phút" : time === ">1h" ? "Hơn 1 tiếng" : "Từ 30p - 1 tiếng"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-foreground">Thời tiết tối nay</h3>
        <RadioGroup value={weather} onValueChange={setWeather} className="flex flex-col space-y-1">
          {[
            ["Bình thường", "Bình thường"],
            ["Quá nóng", "Nóng bức"],
            ["Quá lạnh", "Trời lạnh"],
          ].map(([value, label]) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`w-${value}`} data-testid={`radio-weather-${value}`} />
              <Label htmlFor={`w-${value}`} className="text-base cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary shrink-0">
            <ChefHat className="h-6 w-6" />
            <h1 className="font-serif text-2xl font-bold tracking-tight">Tối nay ăn gì?</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
              onClick={handleSync}
              disabled={syncDishes.isPending}
              data-testid="button-sync"
            >
              <RefreshCw className={`h-4 w-4 ${syncDishes.isPending ? "animate-spin" : ""}`} />
              {syncDishes.isPending ? "Đang đồng bộ..." : "Đồng bộ từ Excel"}
            </Button>
            <AddDishDialog onSuccess={handleAddSuccess} />
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
                  <div className="mt-6 pt-4 border-t space-y-3">
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={handleSync}
                      disabled={syncDishes.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncDishes.isPending ? "animate-spin" : ""}`} />
                      Đồng bộ từ Excel
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-72 shrink-0 h-[calc(100vh-8rem)] sticky top-24 overflow-y-auto pr-6">
          <FilterContent />
        </aside>

        <section className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Đang dọn bếp...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">Chưa có dữ liệu. Nhấn đồng bộ từ Excel để tải về!</p>
              <Button onClick={handleSync} disabled={syncDishes.isPending} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${syncDishes.isPending ? "animate-spin" : ""}`} />
                Đồng bộ từ Excel
              </Button>
            </div>
          ) : dishes.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground text-center">
                Chưa có món nào. Nhấn <strong>Đồng bộ từ Excel</strong> để tải dữ liệu từ Google Sheets, hoặc <strong>Thêm món</strong> để thêm thủ công.
              </p>
              <Button onClick={handleSync} disabled={syncDishes.isPending} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${syncDishes.isPending ? "animate-spin" : ""}`} />
                Đồng bộ từ Excel
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-foreground">
                    Có <span className="text-primary font-bold" data-testid="text-dish-count">{filteredDishes.length}</span> món phù hợp
                  </h2>
                  <p className="text-muted-foreground mt-1">Dựa trên nguyên liệu bạn đang có</p>
                </div>
                <Button
                  size="lg"
                  onClick={suggestRandom}
                  disabled={filteredDishes.length === 0}
                  className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition-all active:scale-95 gap-2"
                  data-testid="button-random"
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
                        onClick={() => setRandomSuggestion(null)}
                        className="absolute top-4 right-2 text-muted-foreground hover:bg-black/5 rounded-full"
                        data-testid="button-clear-random"
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
                    <DishCard key={`${dish.id}-${i}`} dish={dish} />
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
