import { motion } from "framer-motion";
import { Dish } from "@/hooks/use-dishes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, UtensilsCrossed } from "lucide-react";

interface DishCardProps {
  dish: Dish;
  isHighlighted?: boolean;
}

export function DishCard({ dish, isHighlighted }: DishCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full overflow-hidden border-2 transition-colors duration-300 ${isHighlighted ? 'border-primary shadow-lg bg-primary/5' : 'border-transparent hover:border-primary/20'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col h-full gap-4">
            <h3 className="font-serif text-2xl font-semibold leading-tight text-foreground">
              {dish.ten}
            </h3>
            
            <div className="mt-auto flex flex-wrap gap-2">
              {dish.thit && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                  <UtensilsCrossed className="mr-1 h-3 w-3" />
                  {dish.thit}
                </Badge>
              )}
              {dish.thoiGian && (
                <Badge variant="outline" className="text-muted-foreground border-muted-foreground/20">
                  <Clock className="mr-1 h-3 w-3" />
                  {dish.thoiGian}
                </Badge>
              )}
            </div>
            
            {(dish.canTrung || dish.canRauCu || dish.canBot || dish.canSua || dish.canGiVi) && (
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Cần có: {[
                  dish.canTrung && "Trứng",
                  dish.canRauCu && "Rau củ",
                  dish.canBot && "Bột",
                  dish.canSua && "Sữa",
                  dish.canGiVi && "Gia vị đặc biệt"
                ].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
