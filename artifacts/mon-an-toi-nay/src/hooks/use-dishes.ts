import { useState, useEffect } from "react";

export interface Dish {
  stt: number;
  ten: string;         // Món
  thit: string;        // Thịt
  canTrung: boolean;   // Trứng
  canRauCu: boolean;   // Rau củ
  canBot: boolean;     // Bột
  canSua: boolean;     // Sữa
  canGiVi: boolean;    // Cần gia vị không có sẵn
  thoiGian: string;    // Thời gian
  khongNenAn: string;  // Không nên ăn khi
}

const CSV_URL = "https://docs.google.com/spreadsheets/d/1tA0aowjseNHY2HhgPED7xTjemnqWA9R1wj4E-c3rv_8/export?format=csv&gid=0";

function parseBoolean(val: string): boolean {
  return val.trim().toUpperCase() === "TRUE";
}

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDishes() {
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu món ăn");
        }
        const text = await response.text();
        const lines = text.split("\n");
        
        const parsedDishes: Dish[] = [];
        
        // Skip first 3 rows (2 empty + 1 header)
        for (let i = 3; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const cols = line.split(",");
          const sttStr = cols[1]?.trim();
          const stt = parseInt(sttStr, 10);
          
          if (isNaN(stt)) continue;
          
          parsedDishes.push({
            stt,
            ten: cols[2]?.trim() || "",
            thit: cols[3]?.trim() || "",
            canTrung: parseBoolean(cols[4] || ""),
            canRauCu: parseBoolean(cols[5] || ""),
            canBot: parseBoolean(cols[6] || ""),
            canSua: parseBoolean(cols[7] || ""),
            canGiVi: parseBoolean(cols[8] || ""),
            thoiGian: cols[9]?.trim() || "",
            khongNenAn: cols[10]?.trim() || "",
          });
        }
        
        setDishes(parsedDishes);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchDishes();
  }, []);

  return { dishes, isLoading, error };
}
