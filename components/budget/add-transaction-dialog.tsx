'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { TransactionType } from '@/lib/constants/transactions';
import { getTodayLocalDate } from '@/lib/dates';
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

interface AddTransactionDialogProps {
  categoryId: string;
  budgetItemId: string;
  transactionType: TransactionType;
}

export const AddTransactionDialog = ({
  categoryId,
  budgetItemId,
  transactionType,
}: AddTransactionDialogProps) => {
  const addTransaction = useBudgetStore((s) => s.addTransaction);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => getTodayLocalDate());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) return;

    const saved = await addTransaction(categoryId, budgetItemId, {
      budgetItemId,
      amount: parsedAmount,
      description,
      date,
      type: transactionType,
    });
    if (!saved) return;

    setDescription('');
    setAmount('');
    setDate(getTodayLocalDate());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new transaction for this budget item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-description">Description</Label>
            <Input
              id="transaction-description"
              placeholder="e.g., Weekly grocery shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-amount">Amount</Label>
            <Input
              id="transaction-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-date">Date</Label>
            <Input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Add Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
