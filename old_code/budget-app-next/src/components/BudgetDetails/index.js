import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  TextField,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Avatar,
  Fab,
} from "@mui/material";
import "./style.css";
import { useMemo, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export const BudgetDetails = ({
  rowData,
  category,
  handleUpdateBudgetData,
  handleOnCloseDetails,
  isSpendingType,
}) => {
  const [openAddTransactionDialog, setOpenAddTransactionDialog] =
    useState(false);

  const handleAddTransaction = () => {
    setOpenAddTransactionDialog(true);
  };

  // Safe number formatting
  const safeToFixed = (value, decimals = 2) => {
    const num = Number(value) || 0;
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };

  const getTotalSpent = useMemo(() => {
    const transactions = rowData?.transactions || [];
    return transactions.reduce(
      (sum, transaction) => sum + (Number(transaction?.amount) || 0),
      0,
    );
  }, [rowData?.transactions]);

  const getRemainingAmount = useMemo(() => {
    const planned = Number(rowData?.planned) || 0;
    return planned - getTotalSpent;
  }, [getTotalSpent, rowData?.planned]);

  const getProgressValue = useMemo(() => {
    if (!isSpendingType) return 0;
    const planned = Number(rowData?.planned) || 0;
    if (planned === 0) return 0;
    const spent = getTotalSpent;
    return Math.min((spent / planned) * 100, 100);
  }, [getTotalSpent, rowData?.planned, isSpendingType]);

  const getProgressColor = () => {
    const progress = getProgressValue;
    if (progress < 70) return "success";
    if (progress < 90) return "warning";
    return "error";
  };

  const formatAmount = (amount, showSign = false) => {
    const num = Number(amount) || 0;
    const formatted = `$${Math.abs(num).toFixed(2)}`;
    return showSign && num < 0 ? `-${formatted}` : formatted;
  };

  const deleteTransaction = (transaction, index) => {
    const newRowData = { ...rowData };

    newRowData.transactions = newRowData.transactions.filter(
      (_, i) => i !== index,
    );

    const newTotalSpent = newRowData.transactions.reduce(
      (sum, t) => sum + (Number(t?.amount) || 0),
      0,
    );

    const newRemainingAmount = (Number(rowData.planned) || 0) - newTotalSpent;

    newRowData[isSpendingType ? "remaining" : "received"] = isSpendingType
      ? newRemainingAmount
      : newTotalSpent;

    handleUpdateBudgetData(category, newRowData);
  };

  return (
    <>
      <Card
        elevation={8}
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          maxWidth: 500,
          width: "100%",
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 3,
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleOnCloseDetails}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "primary.contrastText",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 48,
                height: 48,
              }}
            >
              {isSpendingType ? <TrendingDownIcon /> : <TrendingUpIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {rowData?.name || "Unknown Category"}
              </Typography>
              <Chip
                label={isSpendingType ? "Spending" : "Income"}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            </Box>
          </Stack>

          {/* Progress bar for spending categories */}
          {isSpendingType && (
            <Box sx={{ mt: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Budget Progress
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {safeToFixed(getProgressValue, 0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={getProgressValue}
                color={getProgressColor()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Amount Summary */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
                border: 1,
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isSpendingType ? "Remaining Budget" : "Total Received"}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {isSpendingType
                    ? formatAmount(getRemainingAmount)
                    : formatAmount(getTotalSpent)}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: isSpendingType
                    ? getRemainingAmount >= 0
                      ? "success.light"
                      : "error.light"
                    : "success.light",
                  width: 48,
                  height: 48,
                }}
              >
                <AttachMoneyIcon sx={{ color: "white" }} />
              </Avatar>
            </Box>

            {isSpendingType && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {formatAmount(getTotalSpent)} of{" "}
                  {formatAmount(rowData?.planned || 0)} spent
                </Typography>
                <Chip
                  label={`${safeToFixed(getProgressValue, 0)}% used`}
                  size="small"
                  color={getProgressColor()}
                  variant="outlined"
                />
              </Box>
            )}
          </Stack>

          {/* Transactions Section */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ReceiptIcon />
                Transactions
                {(rowData?.transactions?.length || 0) > 0 && (
                  <Chip
                    label={rowData.transactions.length}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Typography>
            </Stack>

            {!rowData?.transactions?.length ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                }}
              >
                <ReceiptIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body1">No transactions yet</Typography>
                <Typography variant="body2">
                  Add your first transaction below
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {rowData.transactions.map((transaction, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: "background.paper",
                      "&:hover": {
                        bgcolor: "action.hover",
                        transform: "translateY(-1px)",
                        transition: "all 0.2s ease",
                      },
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => deleteTransaction(transaction, index)}
                        sx={{
                          color: "error.main",
                          "&:hover": { bgcolor: "error.light" },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton sx={{ p: 2 }}>
                      <Box sx={{ width: "100%" }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            >
                              {transaction?.name || "Unnamed Transaction"}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <CalendarTodayIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {transaction?.date || "No date"}
                              </Typography>
                            </Stack>
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color:
                                (Number(transaction?.amount) || 0) < 0
                                  ? "success.main"
                                  : "text.primary",
                              ml: 2,
                            }}
                          >
                            {formatAmount(transaction?.amount || 0, true)}
                          </Typography>
                        </Stack>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </CardContent>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          onClick={handleAddTransaction}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 1,
          }}
        >
          <AddIcon />
        </Fab>
      </Card>

      <Dialog
        open={openAddTransactionDialog}
        onClose={() => {
          setOpenAddTransactionDialog(false);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());

              if (!formJson.name || !formJson.amount) return;

              const transactionAmount = Number(formJson.amount) || 0;
              const remaining =
                (Number(rowData?.planned) || 0) -
                (transactionAmount + getTotalSpent);
              const received = getTotalSpent + transactionAmount;

              const newRow = {
                ...rowData,
                transactions: [
                  ...(rowData?.transactions || []),
                  {
                    name: formJson.name.trim(),
                    amount: transactionAmount,
                    date: formJson.date || dayjs().format("MM/DD/YYYY"),
                  },
                ],
                [isSpendingType ? "remaining" : "received"]: isSpendingType
                  ? remaining
                  : received,
              };

              handleUpdateBudgetData(category, newRow);
              setOpenAddTransactionDialog(false);
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 1,
          }}
        >
          <AddIcon color="primary" />
          Add Transaction
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Record a new {isSpendingType ? "expense" : "income"} for this
            category
          </Typography>

          <Stack spacing={3}>
            <TextField
              autoFocus
              required
              id="name"
              name="name"
              label="Transaction Name"
              fullWidth
              variant="outlined"
              placeholder={
                isSpendingType
                  ? "e.g., Grocery shopping, Gas, Coffee"
                  : "e.g., Salary, Freelance, Bonus"
              }
              InputProps={{
                startAdornment: (
                  <ReceiptIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />

            <TextField
              required
              id="amount"
              name="amount"
              label={`Amount (${isSpendingType ? "Spent" : "Received"})`}
              fullWidth
              variant="outlined"
              type="number"
              placeholder="0.00"
              inputProps={{ min: "0.01", step: "0.01" }}
              InputProps={{
                startAdornment: (
                  <AttachMoneyIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Transaction Date"
                value={dayjs()}
                name="date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    InputProps: {
                      startAdornment: (
                        <CalendarTodayIcon
                          sx={{ color: "action.active", mr: 1 }}
                        />
                      ),
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setOpenAddTransactionDialog(false);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
