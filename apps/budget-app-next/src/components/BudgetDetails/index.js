import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import "./style.css";
import { useMemo, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

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

  // getTotalSpent = getTotalReceived
  const getTotalSpent = useMemo(() => {
    const transactions = rowData.transactions || [];
    return parseInt(
      transactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount),
        0,
      ),
    );
  }, [rowData.transactions]);

  const getRemainingAmount = useMemo(() => {
    return rowData.planned - getTotalSpent;
  }, [getTotalSpent, rowData.planned]);

  // console.log(rowData);

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const deleteTransaction = (transaction, index) => {
    const newRowData = { ...rowData };

    newRowData.transactions = newRowData.transactions.filter(
      (_, i) => i !== index,
    );

    const newTotalSpent = newRowData.transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0,
    );

    const newRemainingAmount = rowData.planned - newTotalSpent;

    newRowData[isSpendingType ? "remaining" : "received"] = isSpendingType
      ? newRemainingAmount
      : newTotalSpent;

    handleUpdateBudgetData(category, newRowData);
  };

  return (
    <>
      <Paper elevation={3} className={"budgetDetails"}>
        <div className="budgetDetails__closeButton">
          <IconButton onClick={handleOnCloseDetails}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="budgetDetails__content">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "start", justifyContent: "space-between" }}
          >
            <Typography variant="h5">{rowData.name}</Typography>
            <Stack
              direction="column"
              sx={{ alignItems: "center", justifyContent: "center" }}
            >
              <Typography variant="h5">
                {isSpendingType ? "Remaining" : "Received"}
              </Typography>
              <Typography variant="h5">
                {isSpendingType
                  ? formatAmount(getRemainingAmount)
                  : formatAmount(getTotalSpent)}
              </Typography>
            </Stack>
          </Stack>
          {isSpendingType && (
            <Typography variant="h6">
              {`${formatAmount(getTotalSpent)} spent of ${formatAmount(rowData.planned)}`}
            </Typography>
          )}
          <Typography variant="h6" className="budgetDetails__transactionsTitle">
            Transactions
          </Typography>
          <List>
            {!rowData.transactions?.length ? (
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.5,
                  textAlign: "center",
                  marginTop: 2,
                  color: "text.secondary",
                }}
              >
                No transactions
              </Typography>
            ) : (
              rowData.transactions.map((transaction, index) => (
                <>
                  <ListItem
                    key={index}
                    className="budgetDetails__listItem"
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon
                          onClick={() => deleteTransaction(transaction, index)}
                        />
                      </IconButton>
                    }
                  >
                    <ListItemButton>
                      <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        sx={{ width: "100%" }}
                      >
                        <Grid item xs={2}>
                          <Typography variant="body1">
                            {transaction.date}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {transaction.name}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sx={{ textAlign: "right", marginLeft: "auto" }}
                        >
                          <Typography variant="body1">
                            {formatAmount(transaction.amount)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </ListItemButton>
                  </ListItem>
                  {rowData?.transactions?.length > 1 && (
                    <Divider component="li" />
                  )}
                </>
              ))
            )}
          </List>
          <Button onClick={handleAddTransaction}>Add Expense</Button>
        </div>
      </Paper>

      <Dialog
        open={openAddTransactionDialog}
        onClose={() => {
          setOpenAddTransactionDialog(false);
        }}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const remaining =
                rowData.planned - (parseInt(formJson.amount) + getTotalSpent);
              const received = getTotalSpent + parseInt(formJson.amount);

              const newRow = {
                ...rowData,
                transactions: [
                  ...(rowData?.transactions || []),
                  {
                    name: formJson.name,
                    amount: formJson.amount,
                    date: formJson.date,
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
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={1} sx={{ alignItems: "center" }}>
            <Stack direction="row" spacing={1} sx={{ marginBottom: "5px" }}>
              <TextField
                autoFocus
                required
                id="name"
                name="name"
                variant="standard"
                placeholder="Name"
              />
              <TextField
                autoFocus
                required
                id="amount"
                name="amount"
                variant="standard"
                placeholder="Amount"
                type="number"
              />
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker value={dayjs()} name="date" />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddTransactionDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
