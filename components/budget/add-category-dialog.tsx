'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { TransactionType } from '@/lib/types';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus } from 'lucide-react';

export function AddCategoryDialog() {
  const { addCategory, currentBudget } = useBudgetStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const order = currentBudget?.categories.length || 0;
    await addCategory({ name, type, order });

    setName('');
    setType('expense');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {'Add Category'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Add New Category'}</DialogTitle>
          <DialogDescription>
            {'Create a new category for your budget items'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">{'Category Name'}</Label>
            <Input
              id="category-name"
              placeholder="e.g., Housing, Transportation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{'Type'}</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="font-normal">
                  {'Income'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="font-normal">
                  {'Expense'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full">
            {'Create Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
