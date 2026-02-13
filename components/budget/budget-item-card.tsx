'use client';

import { BudgetItem } from '@/lib/types';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AddTransactionDialog } from './add-transaction-dialog';
import { Trash2, Edit } from 'lucide-react';
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
  
  const percentage = item.plannedAmount > 0 
    ? Math.min((item.spentAmount / item.plannedAmount) * 100, 100)
    : 0;
  
  const remaining = item.plannedAmount - item.spentAmount;
  const isOverBudget = item.spentAmount > item.plannedAmount;

  const handleDelete = async () => {
    await deleteBudgetItem(categoryId, item.id);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold">{item.name}</h4>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
                {'$'}{item.spentAmount.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {'of $'}{item.plannedAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
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
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className={isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>
              {isOverBudget ? 'Over by ' : 'Remaining: '}
              {'$'}{Math.abs(remaining).toFixed(2)}
            </span>
            <span className="text-muted-foreground">{percentage.toFixed(0)}{'%'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <AddTransactionDialog
            categoryId={categoryId}
            budgetItemId={item.id}
            transactionType={type}
          />
          
          {item.transactions.length > 0 && (
            <div className="space-y-1 rounded-md border p-2">
              <p className="text-xs font-medium text-muted-foreground">
                {'Recent Transactions'}
              </p>
              {item.transactions.slice(-3).reverse().map((txn) => (
                <div key={txn.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{txn.description}</span>
                  <span className="font-medium">
                    {'$'}{txn.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {item.transactions.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  {'+'}{item.transactions.length - 3}{' more'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
