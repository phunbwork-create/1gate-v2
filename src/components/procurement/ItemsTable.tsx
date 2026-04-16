"use client";

import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, type Control, type FieldValues } from "react-hook-form";

interface ItemsTableProps {
  control: Control<FieldValues>;
  name: string;
  showPrice?: boolean;
}

export function ItemsTable({ control, name, showPrice = true }: ItemsTableProps) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium w-8">#</th>
              <th className="text-left px-3 py-2 font-medium">Tên hàng hóa / vật tư</th>
              <th className="text-left px-3 py-2 font-medium w-24">Số lượng</th>
              <th className="text-left px-3 py-2 font-medium w-24">Đơn vị</th>
              {showPrice && (
                <th className="text-left px-3 py-2 font-medium w-32">Đơn giá (VND)</th>
              )}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((field, index) => (
              <tr key={field.id} className="bg-card">
                <td className="px-3 py-1.5 text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-1.5">
                  <Input
                    {...control.register(`${name}.${index}.itemName`)}
                    placeholder="Tên hàng hóa..."
                    className="h-8 border-0 shadow-none px-0 focus-visible:ring-0"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Input
                    {...control.register(`${name}.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="0"
                    className="h-8 border-0 shadow-none px-0 focus-visible:ring-0"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Input
                    {...control.register(`${name}.${index}.unit`)}
                    placeholder="cái, kg..."
                    className="h-8 border-0 shadow-none px-0 focus-visible:ring-0"
                  />
                </td>
                {showPrice && (
                  <td className="px-3 py-1.5">
                    <Input
                      {...control.register(`${name}.${index}.estimatedPrice`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="0"
                      className="h-8 border-0 shadow-none px-0 focus-visible:ring-0"
                    />
                  </td>
                )}
                <td className="px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={showPrice ? 6 : 5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Chưa có hạng mục nào. Nhấn &quot;Thêm hàng&quot; để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ itemName: "", quantity: 1, unit: "cái", estimatedPrice: 0, note: "" })
        }
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Thêm hàng
      </Button>
    </div>
  );
}
