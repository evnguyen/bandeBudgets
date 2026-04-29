export const getTodayLocalDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

export const getMonthString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const formatMonth = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
