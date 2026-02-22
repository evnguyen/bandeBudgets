'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/stores/budget-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddBudgetItemDialogProps {
  categoryId: string;
}

export function AddBudgetItemDialog({ categoryId }: AddBudgetItemDialogProps) {
  const { addBudgetItem, currentBudget } = useBudgetStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plannedAmount) return;
    const parsedAmount = parseFloat(plannedAmount);
    if (Number.isNaN(parsedAmount)) return;

    const category = currentBudget?.categories.find((c) => c.id === categoryId);
    const order = category?.budgetItems.length || 0;

    await addBudgetItem(categoryId, {
      categoryId,
      name,
      plannedAmount: parsedAmount,
      order,
    });

    setName('');
    setPlannedAmount('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {'Add Item'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Add Budget Item'}</DialogTitle>
          <DialogDescription>
            {'Add a new item to track in this category'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">{'Item Name'}</Label>
            <Input
              id="item-name"
              placeholder="e.g., Rent, Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="planned-amount">{'Planned Amount'}</Label>
            <Input
              id="planned-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {'Create Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
