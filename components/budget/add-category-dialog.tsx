'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { ExpenseGroup, TransactionType } from '@/lib/types';
import { DEFAULT_EXPENSE_GROUP, EXPENSE_GROUPS } from '@/lib/constants/budget-groups';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddCategoryDialogProps {
  type?: TransactionType;
  expenseGroup?: ExpenseGroup;
  buttonLabel?: string;
  allowTypeSelection?: boolean;
}

export function AddCategoryDialog({
  type,
  expenseGroup,
  buttonLabel = 'Add Category',
  allowTypeSelection = false,
}: AddCategoryDialogProps) {
  const { addCategory, currentBudget } = useBudgetStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType>(type || 'expense');
  const [selectedExpenseGroup, setSelectedExpenseGroup] = useState<ExpenseGroup>(
    expenseGroup || DEFAULT_EXPENSE_GROUP
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const order = currentBudget?.categories.length || 0;
    const finalType = allowTypeSelection ? selectedType : (type || 'expense');
    const finalExpenseGroup =
      finalType === 'expense'
        ? selectedExpenseGroup || DEFAULT_EXPENSE_GROUP
        : undefined;

    await addCategory({ name, type: finalType, expenseGroup: finalExpenseGroup, order });

    setName('');
    setSelectedType(type || 'expense');
    setSelectedExpenseGroup(expenseGroup || DEFAULT_EXPENSE_GROUP);
    setOpen(false);
  };

  const activeType = allowTypeSelection ? selectedType : (type || 'expense');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Plus className="h-4 w-4" />
          {buttonLabel}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Add New Category'}</DialogTitle>
          <DialogDescription>
            {activeType === 'income'
              ? 'Create a new income category.'
              : 'Create a new expense category.'}
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
          {allowTypeSelection && (
            <div className="space-y-2">
              <Label>{'Type'}</Label>
              <RadioGroup
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as TransactionType)}
              >
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
          )}
          {(allowTypeSelection ? selectedType : type) === 'expense' && (
            <div className="space-y-2">
              <Label>{'Expense Group'}</Label>
              <Select
                value={selectedExpenseGroup}
                onValueChange={(value) => setSelectedExpenseGroup(value as ExpenseGroup)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full">
            {'Create Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
