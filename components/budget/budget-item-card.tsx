'use client';

import { BudgetItem } from '@/lib/types';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from './add-transaction-dialog';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BudgetItemCardProps {
  categoryId: string;
  item: BudgetItem;
  type: 'income' | 'expense';
}

export function BudgetItemCard({ categoryId, item, type }: BudgetItemCardProps) {
  const { deleteBudgetItem } = useBudgetStore();
  const isIncome = type === 'income';
  const transactions = item.transactions ?? [];

  const percentage = item.plannedAmount > 0
    ? Math.min((item.spentAmount / item.plannedAmount) * 100, 100)
    : 0;

  const remaining = item.plannedAmount - item.spentAmount;
  const isOverBudget = !isIncome && item.spentAmount > item.plannedAmount;

  const handleDelete = async () => {
    await deleteBudgetItem(categoryId, item.id);
  };

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="space-y-3">
        {/* Name + delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold">{item.name}</h4>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className={cn('text-lg font-bold', isOverBudget && 'text-red-500')}>
                {'$'}{item.spentAmount.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {isIncome ? 'of $' : '/ $'}
                {item.plannedAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{'Delete Budget Item'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {'Are you sure you want to delete this budget item? This action cannot be undone and will remove all associated transactions.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isOverBudget ? 'bg-red-500' : 'bg-primary'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {isIncome ? (
              <span>{'Received: $'}{item.spentAmount.toFixed(2)}</span>
            ) : (
              <span className={isOverBudget ? 'text-red-500' : ''}>
                {isOverBudget ? 'Over by $' : 'Left: $'}
                {Math.abs(remaining).toFixed(2)}
              </span>
            )}
            <span>{percentage.toFixed(0)}{'%'}</span>
          </div>
        </div>

        {/* Add transaction */}
        <AddTransactionDialog
          categoryId={categoryId}
          budgetItemId={item.id}
          transactionType={type}
        />

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{'Recent Transactions'}</p>
            {transactions.slice(-3).reverse().map((txn) => (
              <div key={txn.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-foreground/80">{txn.description}</span>
                <span className="shrink-0 font-medium">${txn.amount.toFixed(2)}</span>
              </div>
            ))}
            {transactions.length > 3 && (
              <p className="text-xs text-muted-foreground">
                {'+'}{transactions.length - 3}{' more'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
