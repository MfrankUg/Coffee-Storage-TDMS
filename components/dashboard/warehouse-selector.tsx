"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Warehouse, ChevronDown } from "lucide-react"

export default function WarehouseSelector() {
  const [selectedWarehouse, setSelectedWarehouse] = useState("Main Warehouse")

  // Dummy data for demonstration
  const warehouses = ["Main Warehouse", "Secondary Storage", "Processing Facility", "Export Warehouse"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm w-full xs:w-auto h-8 xs:h-9 px-2 xs:px-3"
        >
          <Warehouse className="h-3 w-3 xs:h-4 xs:w-4" />
          <span className="truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">{selectedWarehouse}</span>
          <ChevronDown className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] xs:w-[200px] sm:w-auto">
        {warehouses.map((warehouse) => (
          <DropdownMenuItem
            key={warehouse}
            onClick={() => setSelectedWarehouse(warehouse)}
            className="text-xs xs:text-sm"
          >
            {warehouse}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
