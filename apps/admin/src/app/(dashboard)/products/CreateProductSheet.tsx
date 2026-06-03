"use client";

import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddProduct from "@/components/AddProduct";

export default function CreateProductSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tạo Sản Phẩm
        </Button>
      </SheetTrigger>
      <AddProduct onClose={() => setOpen(false)} />
    </Sheet>
  );
}
