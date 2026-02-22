'use client';

import { Category } from '@/lib/types';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetItemCard } from './budget-item-card';
import { AddBudgetItemDialog } from './add-budget-item-dialog';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
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

interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  const { deleteCategory } = useBudgetStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const budgetItems = category.budgetItems ?? [];

  const totalPlanned = budgetItems.reduce(
    (sum, item) => sum + item.plannedAmount,
    0
  );
  const totalSpent = budgetItems.reduce(
    (sum, item) => sum + item.spentAmount,
    0
  );

  const handleDelete = async () => {
    await deleteCategory(category.id);
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold">
                {'$'}{totalSpent.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {'of $'}{totalPlanned.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{'Delete Category'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {'Are you sure you want to delete this category? This will remove all budget items and transactions within it.'}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {budgetItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {'No budget items yet. Add your first item to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {budgetItems.map((item) => (
                <BudgetItemCard
                  key={item.id}
                  categoryId={category.id}
                  item={item}
                  type={category.type}
                />
              ))}
            </div>
          )}
          <div className="mt-4">
            <AddBudgetItemDialog categoryId={category.id} />
          </div>
        </div>
      )}
    </Card>
  );
}
