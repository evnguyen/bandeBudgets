"use client";
import { useState, useEffect, useMemo } from "react";
import db from "../../utils/firestore";
import { setDoc, doc } from "firebase/firestore";
import { auth } from "../../../firebaseConfig";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/serverActions";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localeData from "dayjs/plugin/localeData";
import {
  Button,
  Paper,
  Grid2 as Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Avatar,
  Stack,
  AccordionSummary,
  Accordion,
  IconButton,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  useColorScheme,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import "./style.css";
import { SummaryReport } from "@/components/SummaryReport";
import { Columns, themeModes } from "@/app/utils/constants";
import { BudgetDetails } from "@/components/BudgetDetails";
import { BudgetTemplates } from "@/components/BudgetTemplates";
import { BudgetTips } from "@/components/BudgetTips";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TemplateIcon from "@mui/icons-material/Description";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import BarChartIcon from "@mui/icons-material/BarChart";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MovieIcon from "@mui/icons-material/Movie";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

export default function Home() {
  const { mode, setMode } = useColorScheme();
  const [value, setValue] = useState("testetetetet");
  const [month, setMonth] = useState("January");
  const [rowModesModel, setRowModesModel] = useState({});
  const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] =
    useState(false);
  const [openAddRowDialog, setOpenAddRowDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [openTemplatesDialog, setOpenTemplatesDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [mobileView, setMobileView] = useState("budget"); // 'budget', 'charts', 'tips'
  const [showWelcome, setShowWelcome] = useState(false);
  const [templatesFromWelcome, setTemplatesFromWelcome] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const ITEMS_PER_PAGE = 50;

  dayjs.extend(duration);
  dayjs.extend(localeData);
  const listOfMonths = dayjs.months();

  // TODO: grab values from Database
  // TODO: either change to context API or redux(mobx)
  const [budgetData, setBudgetData] = useState(() => {
    try {
      const emptyData = {};
      listOfMonths.forEach((month) => {
        emptyData[month] = {};
      });
      return emptyData;
    } catch (error) {
      console.error("Error initializing budget data:", error);
      return { January: {} };
    }
  });
  const paginationModel = { page: 0, pageSize: ITEMS_PER_PAGE };

  const router = useRouter();

  // Check if user has any categories - if not, show welcome dialog
  useEffect(() => {
    const currentMonthData = budgetData[month] || {};
    const hasCategories = Object.keys(currentMonthData).length > 0;
    setShowWelcome(!hasCategories);
  }, [budgetData, month]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const docRef = await setDoc(doc(db, "users", user.uid), {
        name: value,
      });
      setValue("");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleDeleteRow = (id) => {
    const [category] = id.split("__");

    setBudgetData((prevBudgetData) => {
      const updatedBudgetData = { ...prevBudgetData };
      const rows = updatedBudgetData[month][category].rows;

      updatedBudgetData[month][category].rows = rows.filter(
        (row) => row.id !== id,
      );

      return updatedBudgetData;
    });
  };

  const handleAddItem = (itemData, category, isSpendingType) => {
    const id = `${category}__${budgetData[month][category].rows.length + 1}`;
    const newRow = {
      id,
      name: itemData.name,
      planned: itemData.planned,
      [isSpendingType ? Columns.REMAINING.id : Columns.RECEIVED.id]: 0,
    };

    const newBudgetData = {
      ...budgetData,
      [month]: {
        ...budgetData[month],
        [category]: {
          ...budgetData[month][category],
          rows: [...budgetData[month][category].rows, newRow],
        },
      },
    };

    setBudgetData(newBudgetData);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [month]: {
        ...oldModel[month],
        [category]: {
          ...oldModel?.[month]?.[category],
          [id]: { mode: GridRowModes.Edit, fieldToFocus: Columns.NAME.id },
        },
      },
    }));
  };

  const handleAddNewCategory = (categoryName, isSpendingType) => {
    setBudgetData((oldBudgetData) => ({
      ...oldBudgetData,
      [month]: {
        ...oldBudgetData[month],
        [categoryName]: {
          rows: [],
          columns: [
            {
              field: Columns.NAME.id,
              headerName: Columns.NAME.text,
              flex: 3,
              editable: true,
            },
            {
              field: Columns.PLANNED.id,
              headerName: Columns.PLANNED.text,
              flex: 1,
              editable: true,
              type: "number",
            },
            {
              field: isSpendingType
                ? Columns.REMAINING.id
                : Columns.RECEIVED.id,
              headerName: isSpendingType
                ? Columns.REMAINING.text
                : Columns.RECEIVED.text,
              flex: 1,
              editable: false,
              type: "number",
            },
            {
              field: "actions",
              type: "actions",
              headerName: "Actions",
              cellClassName: "actions",
              getActions: ({ id }) => {
                return [
                  // eslint-disable-next-line react/jsx-key
                  <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDeleteRow(id)}
                    color="inherit"
                  />,
                ];
              },
            },
          ],
          isSpendingType,
        },
      },
    }));
  };

  const processRowUpdate = (name, newRow) => {
    const index = budgetData[month][name].rows.findIndex(
      (el) => el.id === newRow.id,
    );
    setBudgetData({
      ...budgetData,
      [month]: {
        ...budgetData[month],
        [name]: {
          ...budgetData[month][name],
          rows: budgetData[month][name].rows.toSpliced(index, 1, newRow),
        },
      },
    });

    // console.log("TO SAVE:", {
    //   ...budgetData,
    //   [month]: {
    //     ...budgetData[month],
    //     [name]: {
    //       ...budgetData[month][name],
    //       rows: budgetData[month][name].rows.toSpliced(index, 1, newRow),
    //     },
    //   },
    // });
    return newRow;
  };

  const switchMode = (mode, name, id) => {
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [month]: {
        [name]: {
          ...oldModel?.[month]?.[name],
          [id]: { mode },
        },
      },
    }));
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    if (newRowSelectionModel.length) {
      setShowDetails(true);
    } else {
      setShowDetails(false);
    }
    setRowSelectionModel(newRowSelectionModel);
  };

  const handleOnCloseDetails = () => {
    setShowDetails(false);
    setRowSelectionModel([]);
  };

  const handleUpdateBudgetData = (category, newRow) => {
    const rowIndex = budgetData[month][category].rows.findIndex(
      (row) => row.id === newRow.id,
    );

    setBudgetData({
      ...budgetData,
      [month]: {
        ...budgetData[month],
        [category]: {
          ...budgetData[month][category],
          rows: budgetData[month][category].rows.toSpliced(rowIndex, 1, newRow),
        },
      },
    });
  };

  const handleDeleteCategory = () => {
    const newBudgetData = { ...budgetData };
    delete newBudgetData[month][openDeleteCategoryDialog];
    setBudgetData(newBudgetData);
    setOpenDeleteCategoryDialog(false);
  };

  const handleEnvelopeTransfer = (transferData) => {
    if (
      !transferData ||
      !transferData.fromCategory ||
      !transferData.toCategory ||
      !transferData.amount
    ) {
      console.error("Invalid transfer data provided");
      return;
    }

    const { fromCategory, toCategory, amount } = transferData;
    const transferAmount = Number(amount) || 0;

    if (transferAmount <= 0) {
      console.error("Transfer amount must be positive");
      return;
    }

    setBudgetData((prevBudgetData) => {
      try {
        const newBudgetData = { ...(prevBudgetData ?? {}) };
        const currentMonthData = newBudgetData[month ?? "January"] ?? {};

        // For spending categories, we need to adjust the "remaining" amounts
        if (currentMonthData[fromCategory]?.isSpendingType) {
          // Find the first row in the from category to deduct from
          const fromRows = currentMonthData[fromCategory]?.rows;
          if (fromRows && Array.isArray(fromRows) && fromRows.length > 0) {
            // Calculate current spent amount for the first row
            const firstRow = fromRows[0];
            const currentSpent =
              firstRow?.transactions && Array.isArray(firstRow.transactions)
                ? firstRow.transactions.reduce(
                    (sum, transaction) =>
                      sum + (Number(transaction?.amount) || 0),
                    0,
                  )
                : 0;
            const currentRemaining =
              (Number(firstRow?.planned) || 0) - currentSpent;

            if (currentRemaining >= transferAmount) {
              // Add a transfer transaction to reduce remaining amount
              const transferTransaction = {
                name: `Transfer to ${toCategory || "Unknown"}`,
                amount: transferAmount,
                date: dayjs().format("MM/DD/YYYY"),
              };

              firstRow.transactions = firstRow.transactions ?? [];
              firstRow.transactions.push(transferTransaction);
              firstRow.remaining = currentRemaining - transferAmount;
            }
          }
        }

        // For destination category (receiving funds)
        if (currentMonthData[toCategory]?.isSpendingType) {
          // Find the first row in the to category to add to
          const toRows = currentMonthData[toCategory]?.rows;
          if (toRows && Array.isArray(toRows) && toRows.length > 0) {
            const firstRow = toRows[0];
            const currentSpent =
              firstRow?.transactions && Array.isArray(firstRow.transactions)
                ? firstRow.transactions.reduce(
                    (sum, transaction) =>
                      sum + (Number(transaction?.amount) || 0),
                    0,
                  )
                : 0;

            // Add a transfer transaction to increase remaining amount (reduce spent)
            const transferTransaction = {
              name: `Transfer from ${fromCategory || "Unknown"}`,
              amount: -transferAmount, // Negative amount to increase remaining
              date: dayjs().format("MM/DD/YYYY"),
            };

            firstRow.transactions = firstRow.transactions ?? [];
            firstRow.transactions.push(transferTransaction);
            firstRow.remaining =
              (Number(firstRow?.planned) || 0) -
              (currentSpent - transferAmount);
          }
        }

        return newBudgetData;
      } catch (error) {
        console.error("Error processing envelope transfer:", error);
        return prevBudgetData ?? {};
      }
    });
  };

  const handleApplyTemplate = (template) => {
    if (
      !template ||
      !template.categories ||
      !Array.isArray(template.categories)
    ) {
      console.error("Invalid template provided");
      return;
    }

    setBudgetData((prevBudgetData) => {
      try {
        const newBudgetData = { ...(prevBudgetData ?? {}) };
        const templateCategories = {};

        template.categories.forEach((category) => {
          if (!category || !category.name) return;

          const categoryName = category.name;
          const plannedAmount = Number(category.planned) || 0;
          const isSpendingType = Boolean(category.isSpendingType);

          templateCategories[categoryName] = {
            rows: [
              {
                id: `${categoryName}__1`,
                name: categoryName,
                planned: plannedAmount,
                [isSpendingType ? Columns.REMAINING.id : Columns.RECEIVED.id]:
                  isSpendingType ? plannedAmount : plannedAmount,
                transactions: isSpendingType ? [] : undefined,
              },
            ],
            columns: [
              {
                field: Columns.NAME.id,
                headerName: Columns.NAME.text,
                flex: 3,
                editable: true,
              },
              {
                field: Columns.PLANNED.id,
                headerName: Columns.PLANNED.text,
                flex: 1,
                editable: true,
                type: "number",
              },
              {
                field: isSpendingType
                  ? Columns.REMAINING.id
                  : Columns.RECEIVED.id,
                headerName: isSpendingType
                  ? Columns.REMAINING.text
                  : Columns.RECEIVED.text,
                flex: 1,
                editable: false,
                type: "number",
              },
              {
                field: "actions",
                type: "actions",
                headerName: "Actions",
                cellClassName: "actions",
                getActions: ({ id }) => {
                  return [
                    // eslint-disable-next-line react/jsx-key
                    <GridActionsCellItem
                      icon={<DeleteIcon />}
                      label="Delete"
                      onClick={() => handleDeleteRow(id)}
                      color="inherit"
                    />,
                  ];
                },
              },
            ],
            isSpendingType,
          };
        });

        newBudgetData[month ?? "January"] = templateCategories;
        return newBudgetData;
      } catch (error) {
        console.error("Error applying template:", error);
        return prevBudgetData ?? {};
      }
    });
  };

  const getTotalSpent = useMemo(() => {
    try {
      let totalSpent = 0;
      const currentMonthData = budgetData?.[month] ?? {};

      // TODO: optimize
      for (const [categoryName, categoryData] of Object.entries(
        currentMonthData,
      )) {
        if (
          categoryData?.isSpendingType &&
          categoryData?.rows &&
          Array.isArray(categoryData.rows)
        ) {
          for (const row of categoryData.rows) {
            if (!row?.transactions || !Array.isArray(row.transactions))
              continue;
            for (const transaction of row.transactions) {
              totalSpent += Number(transaction?.amount) || 0;
            }
          }
        }
      }

      return totalSpent;
    } catch (error) {
      console.error("Error calculating total spent:", error);
      return 0;
    }
  }, [month, budgetData]);

  const getTotalIncome = useMemo(() => {
    try {
      let totalIncome = 0;
      const currentMonthData = budgetData?.[month] ?? {};

      for (const [categoryName, categoryData] of Object.entries(
        currentMonthData,
      )) {
        if (
          !categoryData?.isSpendingType &&
          categoryData?.rows &&
          Array.isArray(categoryData.rows)
        ) {
          for (const row of categoryData.rows) {
            if (!row) continue;
            totalIncome += Number(row[Columns.RECEIVED.id]) || 0;
          }
        }
      }

      return totalIncome;
    } catch (error) {
      console.error("Error calculating total income:", error);
      return 0;
    }
  }, [month, budgetData]);

  const getZeroBasedBalance = useMemo(() => {
    try {
      return getTotalIncome - getTotalSpent;
    } catch (error) {
      console.error("Error calculating zero-based balance:", error);
      return 0;
    }
  }, [getTotalIncome, getTotalSpent]);

  // Check if transfers are possible (need at least 2 spending categories)
  const canTransfer = useMemo(() => {
    try {
      const spendingCategories = Object.values(budgetData[month] || {}).filter(
        (categoryData) => categoryData?.isSpendingType,
      );
      return spendingCategories.length >= 2;
    } catch (error) {
      console.error("Error checking transfer capability:", error);
      return false;
    }
  }, [budgetData, month]);

  const renderBudget = () => (
    <Grid
      container
      className="budget"
      spacing={isMobile ? 2 : 3}
      sx={{ mb: isMobile ? 2 : 4 }}
    >
      {/* Summary Cards */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            height: "100%",
            background:
              mode === "dark"
                ? "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))"
                : "linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.03))",
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? "rgba(76, 175, 80, 0.3)"
                : "rgba(76, 175, 80, 0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "dark"
                  ? "0 8px 25px rgba(0, 0, 0, 0.3)"
                  : "0 8px 25px rgba(0, 0, 0, 0.1)",
              borderColor: "success.main",
            },
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3, textAlign: "center" }}>
            <Box
              sx={{
                width: isMobile ? 40 : 56,
                height: isMobile ? 40 : 56,
                borderRadius: "50%",
                backgroundColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: isMobile ? 1.5 : 2,
              }}
            >
              <TrendingUpIcon
                sx={{ color: "white", fontSize: isMobile ? 20 : 28 }}
              />
            </Box>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="success.main"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: isMobile ? "0.9rem" : undefined,
              }}
            >
              Total Income
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h4"}
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
                fontSize: isMobile ? "1.1rem" : undefined,
              }}
            >
              ${(Number(getTotalIncome) || 0).toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? "0.8rem" : undefined }}
            >
              Money received this month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            height: "100%",
            background:
              mode === "dark"
                ? "linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))"
                : "linear-gradient(135deg, rgba(244, 67, 54, 0.08), rgba(244, 67, 54, 0.03))",
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? "rgba(244, 67, 54, 0.3)"
                : "rgba(244, 67, 54, 0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "dark"
                  ? "0 8px 25px rgba(0, 0, 0, 0.3)"
                  : "0 8px 25px rgba(0, 0, 0, 0.1)",
              borderColor: "error.main",
            },
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3, textAlign: "center" }}>
            <Box
              sx={{
                width: isMobile ? 40 : 56,
                height: isMobile ? 40 : 56,
                borderRadius: "50%",
                backgroundColor: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: isMobile ? 1.5 : 2,
              }}
            >
              <TrendingDownIcon
                sx={{ color: "white", fontSize: isMobile ? 20 : 28 }}
              />
            </Box>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="error.main"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: isMobile ? "0.9rem" : undefined,
              }}
            >
              Total Spent
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h4"}
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
                fontSize: isMobile ? "1.1rem" : undefined,
              }}
            >
              ${(Number(getTotalSpent) || 0).toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? "0.8rem" : undefined }}
            >
              Money spent this month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            height: "100%",
            background:
              Math.abs(getZeroBasedBalance) < 0.01
                ? mode === "dark"
                  ? "linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.08))"
                  : "linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(76, 175, 80, 0.05))"
                : mode === "dark"
                  ? "linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(244, 67, 54, 0.08))"
                  : "linear-gradient(135deg, rgba(244, 67, 54, 0.12), rgba(244, 67, 54, 0.05))",
            border: "2px solid",
            borderColor:
              Math.abs(getZeroBasedBalance) < 0.01
                ? "success.main"
                : "error.main",
            transition: "all 0.3s ease",
            position: "relative",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "dark"
                  ? "0 8px 25px rgba(0, 0, 0, 0.3)"
                  : "0 8px 25px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3, textAlign: "center" }}>
            {/* Status Badge */}
            <Box
              sx={{
                position: "absolute",
                top: isMobile ? 12 : 16,
                right: isMobile ? 12 : 16,
                width: isMobile ? 20 : 24,
                height: isMobile ? 20 : 24,
                borderRadius: "50%",
                backgroundColor:
                  Math.abs(getZeroBasedBalance) < 0.01
                    ? "success.main"
                    : "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Math.abs(getZeroBasedBalance) < 0.01 ? (
                <CheckCircleIcon
                  sx={{ color: "white", fontSize: isMobile ? 14 : 16 }}
                />
              ) : (
                <WarningIcon
                  sx={{ color: "white", fontSize: isMobile ? 14 : 16 }}
                />
              )}
            </Box>

            <Box
              sx={{
                width: isMobile ? 40 : 56,
                height: isMobile ? 40 : 56,
                borderRadius: "50%",
                backgroundColor:
                  Math.abs(getZeroBasedBalance) < 0.01
                    ? "success.main"
                    : "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: isMobile ? 1.5 : 2,
              }}
            >
              <AccountBalanceIcon
                sx={{ color: "white", fontSize: isMobile ? 20 : 28 }}
              />
            </Box>

            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                color:
                  Math.abs(getZeroBasedBalance) < 0.01
                    ? "success.main"
                    : "error.main",
                fontWeight: 600,
                mb: 1,
                fontSize: isMobile ? "0.9rem" : undefined,
              }}
            >
              Zero-Based Balance
            </Typography>

            <Typography
              variant={isMobile ? "h6" : "h4"}
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 2,
                fontSize: isMobile ? "1.1rem" : undefined,
              }}
            >
              ${(Number(getZeroBasedBalance) || 0).toFixed(2)}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color:
                    Math.abs(getZeroBasedBalance) < 0.01
                      ? "success.main"
                      : "error.main",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                {Math.abs(getZeroBasedBalance) < 0.01
                  ? "✓ Balanced!"
                  : "⚠ Not balanced"}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 3,
          px: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            backgroundColor:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            px: 1,
            py: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <IconButton
              onClick={() => {
                const currentIndex = listOfMonths.indexOf(month);
                const prevIndex =
                  currentIndex === 0
                    ? listOfMonths.length - 1
                    : currentIndex - 1;
                setMonth(listOfMonths[prevIndex]);
              }}
              size="small"
              sx={{
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                },
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                }}
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    py: 1,
                    px: 2,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                startAdornment={
                  <CalendarTodayIcon
                    sx={{
                      mr: 1,
                      color: "primary.main",
                      fontSize: "1.1rem",
                    }}
                  />
                }
              >
                {listOfMonths.map((monthName) => (
                  <MenuItem
                    key={monthName}
                    value={monthName}
                    sx={{
                      fontWeight: 500,
                      "&.Mui-selected": {
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                        "&:hover": {
                          backgroundColor: "primary.main",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {monthName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton
              onClick={() => {
                const currentIndex = listOfMonths.indexOf(month);
                const nextIndex =
                  currentIndex === listOfMonths.length - 1
                    ? 0
                    : currentIndex + 1;
                setMonth(listOfMonths[nextIndex]);
              }}
              size="small"
              sx={{
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                },
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        </Card>
      </Box>
      <Grid size={{ xs: 12 }}>
        {Object.keys(budgetData[month] || {}).length === 0 ? (
          // Empty state when no categories exist
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <CategoryIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No budget categories yet
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Start by adding your first budget category
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddCategoryDialog(true)}
              size="large"
            >
              Add Your First Category
            </Button>
          </Box>
        ) : (
          // Show existing categories with modern accordion + DataGrid layout
          <>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Your Budget Categories
            </Typography>

            {Object.entries(budgetData[month]).map(([name, data]) => (
              <Accordion
                key={name}
                defaultExpanded={true}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    boxShadow: (theme) => theme.shadows[4],
                  },
                  "& .MuiAccordionSummary-root": {
                    borderRadius: 2,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 2,
                    },
                  }}
                >
                  {/* Category Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: data?.isSpendingType
                          ? "primary.light"
                          : "success.light",
                        width: 48,
                        height: 48,
                      }}
                    >
                      {(() => {
                        if (!data?.isSpendingType) return <AttachMoneyIcon />;
                        if (name.toLowerCase().includes("food"))
                          return <RestaurantIcon />;
                        if (name.toLowerCase().includes("housing"))
                          return <HomeIcon />;
                        if (name.toLowerCase().includes("transport"))
                          return <DirectionsCarIcon />;
                        if (name.toLowerCase().includes("entertainment"))
                          return <MovieIcon />;
                        return <CategoryIcon />;
                      })()}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={data?.isSpendingType ? "Spending" : "Income"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: data?.isSpendingType
                              ? "primary.main"
                              : "success.main",
                            color: "white",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {data?.rows?.length || 0} item
                          {(data?.rows?.length || 0) !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAddRowDialog({
                          category: name,
                          isSpendingType: data?.isSpendingType,
                        });
                      }}
                      sx={{ color: "primary.main" }}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDeleteCategoryDialog(name);
                      }}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}>
                    <DataGrid
                      rows={data?.rows || []}
                      columns={data?.columns || []}
                      hideFooter={true}
                      autoHeight={true}
                      density={isMobile ? "compact" : "standard"}
                      editMode="cell"
                      rowModesModel={rowModesModel[name] || {}}
                      onRowSelectionModelChange={(newRowSelectionModel) => {
                        handleRowSelectionModelChange(newRowSelectionModel);
                      }}
                      rowSelectionModel={rowSelectionModel}
                      processRowUpdate={(newRow) =>
                        processRowUpdate(name, newRow)
                      }
                      onRowEditStart={(params) => {
                        switchMode(GridRowModes.Edit, name, params.id);
                      }}
                      onRowEditStop={(params) => {
                        switchMode(GridRowModes.View, name, params.id);
                      }}
                      initialState={{ pagination: { paginationModel } }}
                      sx={{
                        border: "none",
                        borderRadius: 3,
                        boxShadow:
                          mode === "dark"
                            ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                            : "0 2px 8px rgba(0, 0, 0, 0.08)",
                        backgroundColor: "background.paper",
                        "& .MuiDataGrid-main": {
                          borderRadius: 3,
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          background:
                            mode === "dark"
                              ? "linear-gradient(135deg, #424242, #303030)"
                              : "linear-gradient(135deg, #ffffff, #f5f5f5)",
                          borderBottom: "2px solid",
                          borderColor: "primary.light",
                          "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: 700,
                            color:
                              mode === "dark" ? "common.white" : "text.primary",
                            fontSize: "0.875rem",
                          },
                          "& .MuiDataGrid-columnHeader": {
                            "&:focus": {
                              outline: "none",
                            },
                            "&:focus-within": {
                              outline: "none",
                            },
                          },
                        },
                        "& .MuiDataGrid-cell": {
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:focus": {
                            outline: "none",
                          },
                          "&:focus-within": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: -1,
                          },
                        },
                        "& .MuiDataGrid-row": {
                          "&:hover": {
                            backgroundColor: "action.hover",
                            transform: "translateY(-1px)",
                            transition: "all 0.2s ease",
                            boxShadow:
                              mode === "dark"
                                ? "0 2px 4px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.06)",
                          },
                          "&.Mui-selected": {
                            backgroundColor:
                              mode === "dark"
                                ? "rgba(76, 175, 80, 0.3)"
                                : "rgba(86, 181, 63, 0.3)",
                            "&:hover": {
                              backgroundColor:
                                mode === "dark"
                                  ? "rgba(76, 175, 80, 0.5)"
                                  : "rgba(86, 181, 63, 0.5)",
                            },
                          },
                        },
                        "& .MuiDataGrid-cell--editing": {
                          backgroundColor: "background.default",
                          "& .MuiInputBase-root": {
                            backgroundColor: "transparent",
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          },
                        },
                        "& .MuiDataGrid-editInputCell": {
                          "& .MuiInputBase-input": {
                            padding: "8px 12px",
                            borderRadius: 1,
                            backgroundColor: "background.paper",
                            border: "1px solid",
                            borderColor: "primary.main",
                            boxShadow: "0 0 0 3px rgba(86, 181, 63, 0.1)",
                            "&:focus": {
                              boxShadow: "0 0 0 3px rgba(86, 181, 63, 0.2)",
                            },
                          },
                        },
                        "& .MuiDataGrid-footerContainer": {
                          display: "none",
                        },
                        "& .MuiDataGrid-scrollbar": {
                          "&::-webkit-scrollbar": {
                            width: "6px",
                            height: "6px",
                          },
                          "&::-webkit-scrollbar-track": {
                            backgroundColor: "transparent",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor:
                              mode === "dark"
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(0, 0, 0, 0.2)",
                            borderRadius: "3px",
                            "&:hover": {
                              backgroundColor:
                                mode === "dark"
                                  ? "rgba(255, 255, 255, 0.3)"
                                  : "rgba(0, 0, 0, 0.3)",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="outlined"
                onClick={() => setOpenAddCategoryDialog(true)}
                startIcon={<AddIcon />}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  border: "2px dashed",
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "primary.light",
                    borderStyle: "dashed",
                  },
                }}
              >
                Add New Category
              </Button>
            </Box>
          </>
        )}
      </Grid>
    </Grid>
  );

  const renderSummaryDetails = () => (
    <div className="summaryDetails">
      {showDetails ? (
        <BudgetDetails
          rowData={{
            ...budgetData?.[month]?.[
              rowSelectionModel?.[0]?.split("__")?.[0]
            ]?.rows?.find((row) => row.id === rowSelectionModel[0]),
          }}
          category={rowSelectionModel?.[0]?.split("__")?.[0]}
          handleUpdateBudgetData={handleUpdateBudgetData}
          handleOnCloseDetails={handleOnCloseDetails}
          isSpendingType={
            budgetData?.[month]?.[rowSelectionModel?.[0]?.split("__")?.[0]]
              ?.isSpendingType
          }
        />
      ) : (
        <Tabs
          value={showTips ? 1 : 0}
          onChange={(event, newValue) => setShowTips(newValue === 1)}
          aria-label="summary tabs"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
            pt: 2,
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              minHeight: 48,
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
          }}
        >
          <Tab label="Charts" />
          <Tab label="Tips" />
        </Tabs>
      )}

      {!showDetails &&
        (showTips ? (
          <BudgetTips />
        ) : (
          <SummaryReport monthData={budgetData[month]} />
        ))}
    </div>
  );

  const renderMobileLayout = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        pb: 8,
      }}
    >
      {/* Main Content Area */}
      <Box sx={{ flex: 1, p: isMobile ? 1 : 2 }}>
        {showDetails ? (
          <BudgetDetails
            rowData={{
              ...budgetData?.[month]?.[
                rowSelectionModel?.[0]?.split("__")?.[0]
              ]?.rows?.find((row) => row.id === rowSelectionModel[0]),
            }}
            category={rowSelectionModel?.[0]?.split("__")?.[0]}
            handleUpdateBudgetData={handleUpdateBudgetData}
            handleOnCloseDetails={handleOnCloseDetails}
            isSpendingType={
              budgetData?.[month]?.[rowSelectionModel?.[0]?.split("__")?.[0]]
                ?.isSpendingType
            }
          />
        ) : (
          <>
            {mobileView === "budget" && renderBudget()}
            {mobileView === "charts" && (
              <SummaryReport monthData={budgetData[month]} />
            )}
            {mobileView === "tips" && <BudgetTips />}
          </>
        )}
      </Box>

      {/* Bottom Navigation */}
      {!showDetails && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
          elevation={8}
        >
          <BottomNavigation
            value={mobileView}
            onChange={(event, newValue) => setMobileView(newValue)}
            sx={{
              borderRadius: "16px 16px 0 0",
              "& .MuiBottomNavigationAction-root": {
                minWidth: 70,
                padding: "6px 8px",
                "&.Mui-selected": {
                  color: "primary.main",
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  },
                },
                "& .MuiBottomNavigationAction-label": {
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  mt: 0.5,
                },
              },
            }}
          >
            <BottomNavigationAction
              value="budget"
              label="Budget"
              icon={<AccountBalanceWalletIcon />}
              sx={{ minWidth: "auto" }}
            />
            <BottomNavigationAction
              value="charts"
              label="Charts"
              icon={<BarChartIcon />}
              sx={{ minWidth: "auto" }}
            />
            <BottomNavigationAction
              value="tips"
              label="Tips"
              icon={<LightbulbIcon />}
              sx={{ minWidth: "auto" }}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );

  const renderDesktopLayout = () => (
    <Grid container direction="row" spacing={2}>
      {!showDetails || !isMobile ? (
        <Grid size={{ xs: 12, md: 8 }}>{renderBudget()}</Grid>
      ) : (
        ""
      )}

      <Grid size={{ xs: 12, md: 4 }}>{renderSummaryDetails()}</Grid>
    </Grid>
  );

  return (
    <div className="home">
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor:
            theme.colorSchemes[mode === "dark" ? "dark" : "light"].palette
              .background.paper,
          borderBottom: "1px solid #ccc",
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            B & E Budgets
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => {
                setOpenTemplatesDialog(true);
                setTemplatesFromWelcome(false);
              }}
              title="Load budget template"
              sx={{ color: "secondary.main" }}
            >
              <TemplateIcon />
            </IconButton>
            <IconButton
              onClick={() => setOpenTransferDialog(true)}
              title={
                canTransfer
                  ? "Transfer between envelopes"
                  : "Learn about envelope transfers"
              }
              sx={{
                color: "primary.main",
                opacity: canTransfer ? 1 : 0.7,
              }}
            >
              <SwapHorizIcon />
            </IconButton>
            <IconButton
              onClick={() => setShowWelcome(true)}
              title="Restart setup wizard"
              sx={{ color: "info.main" }}
            >
              <RestartAltIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                setMode(
                  mode === themeModes.DARK ? themeModes.LIGHT : themeModes.DARK,
                );
              }}
            >
              {mode === themeModes.DARK ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            <Button
              onClick={async () => {
                // TODO: Change sign out to a server action
                auth.signOut();
                await deleteCookie("firebase_token");
                router.push("/login");
              }}
              variant="outlined"
              size="small"
              sx={{
                ml: 1,
                color: "inherit",
                borderColor: "rgba(255, 255, 255, 0.23)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              Sign Out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Grid container direction="column" spacing={2} className="home__content">
        <Grid size={{ xs: 12 }}>
          {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        </Grid>
      </Grid>

      <Dialog
        open={openAddCategoryDialog}
        onClose={() => {
          setOpenAddCategoryDialog(false);
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
              if (formJson.name && formJson.name.trim()) {
                // Convert radio button value to boolean (true for spending, false for income)
                const isSpendingType = formJson.type === "spending";
                handleAddNewCategory(formJson.name.trim(), isSpendingType);
                setOpenAddCategoryDialog(false);
              }
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
          <CategoryIcon color="primary" />
          Add New Category
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new budget category to track your income or expenses
          </Typography>

          <Stack spacing={3}>
            <TextField
              autoFocus
              required
              id="name"
              name="name"
              label="Category Name"
              fullWidth
              variant="outlined"
              placeholder="e.g., Groceries, Salary, Entertainment"
              helperText="Choose a descriptive name for your category"
              InputProps={{
                startAdornment: (
                  <CategoryIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />

            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Category Type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select whether this category tracks money you spend or receive
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  name="type"
                  defaultValue="spending"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    value="spending"
                    control={<Radio color="error" />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccountBalanceWalletIcon color="error" />
                        <Box>
                          <Typography variant="h6" color="error.main">
                            Spending
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Money you spend
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      m: 0,
                      p: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                      },
                      "& .MuiFormControlLabel-label": {
                        width: "100%",
                      },
                    }}
                  />
                  <FormControlLabel
                    value="income"
                    control={<Radio color="success" />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TrendingUpIcon color="success" />
                        <Box>
                          <Typography variant="h6" color="success.main">
                            Income
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Money you receive
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      m: 0,
                      p: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                      },
                      "& .MuiFormControlLabel-label": {
                        width: "100%",
                      },
                    }}
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setOpenAddCategoryDialog(false);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!openDeleteCategoryDialog}
        onClose={() => {
          setOpenDeleteCategoryDialog(false);
        }}
      >
        <DialogTitle>
          Confirm Deletion of {openDeleteCategoryDialog}
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeleteCategoryDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleDeleteCategory}
            variant="contained"
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!openAddRowDialog}
        onClose={() => {
          setOpenAddRowDialog(false);
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
              if (formJson.name && formJson.name.trim() && formJson.planned) {
                handleAddItem(
                  {
                    name: formJson.name.trim(),
                    planned: formJson.planned,
                  },
                  openAddRowDialog.category,
                  openAddRowDialog.isSpendingType,
                );
                setOpenAddRowDialog(false);
              }
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
          Add Budget Item
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a new item to the <strong>{openAddRowDialog?.category}</strong>{" "}
            category
          </Typography>

          <Stack spacing={3}>
            <TextField
              autoFocus
              required
              id="name"
              name="name"
              label="Item Name"
              fullWidth
              variant="outlined"
              placeholder={`e.g., ${openAddRowDialog?.isSpendingType ? "Groceries, Gas, Coffee" : "Salary, Freelance, Bonus"}`}
              InputProps={{
                startAdornment: (
                  <ReceiptIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
              helperText="Enter a descriptive name for this budget item"
            />

            <TextField
              required
              id="planned"
              name="planned"
              label={`Planned ${openAddRowDialog?.isSpendingType ? "Spending" : "Income"} ($)`}
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
              helperText={`How much do you plan to ${openAddRowDialog?.isSpendingType ? "spend" : "earn"} on this item?`}
            />

            <Box
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>What happens next:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • This item will appear in your budget table • You can edit the
                amount by clicking on the cell •{" "}
                {openAddRowDialog?.isSpendingType
                  ? "Track actual spending by adding transactions in the detail view"
                  : "Update received income as you earn it"}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setOpenAddRowDialog(false);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTransferDialog}
        onClose={() => {
          setOpenTransferDialog(false);
        }}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              handleEnvelopeTransfer(formJson);
              setOpenTransferDialog(false);
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SwapHorizIcon color="primary" />
          Transfer Between Envelopes
        </DialogTitle>
        <DialogContent>
          {canTransfer ? (
            <Stack direction="column" spacing={3} sx={{ mt: 1, minWidth: 300 }}>
              <Typography variant="body2" color="text.secondary">
                Move money between your spending categories to reallocate your
                budget.
              </Typography>

              <FormControl fullWidth>
                <InputLabel>From Category</InputLabel>
                <Select name="fromCategory" required label="From Category">
                  {Object.entries(budgetData[month] || {}).map(
                    ([categoryName, categoryData]) => {
                      if (!categoryData?.isSpendingType) return null; // Only spending categories can transfer from

                      // Calculate available funds in this category
                      let availableFunds = 0;
                      categoryData.rows?.forEach((row) => {
                        const planned = Number(row?.planned) || 0;
                        const spent = row?.transactions
                          ? row.transactions.reduce(
                              (sum, t) => sum + (Number(t?.amount) || 0),
                              0,
                            )
                          : 0;
                        availableFunds += Math.max(0, planned - spent);
                      });

                      return (
                        <MenuItem
                          key={categoryName}
                          value={categoryName}
                          disabled={availableFunds <= 0}
                        >
                          <Box>
                            <Typography variant="body1">
                              {categoryName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ${availableFunds.toFixed(2)} available
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    },
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>To Category</InputLabel>
                <Select name="toCategory" required label="To Category">
                  {Object.entries(budgetData[month] || {}).map(
                    ([categoryName, categoryData]) => {
                      if (!categoryData?.isSpendingType) return null; // Only spending categories can receive transfers
                      return (
                        <MenuItem key={categoryName} value={categoryName}>
                          {categoryName}
                        </MenuItem>
                      );
                    },
                  )}
                </Select>
              </FormControl>

              <TextField
                autoFocus
                required
                id="amount"
                name="amount"
                label="Transfer Amount ($)"
                type="number"
                fullWidth
                inputProps={{ min: "0.01", step: "0.01" }}
                helperText="Enter the amount you want to transfer"
              />
            </Stack>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <SwapHorizIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Need More Categories
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You need at least 2 spending categories to transfer money
                between them.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create additional spending categories first, then you&apos;ll be
                able to transfer funds between them.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenTransferDialog(false);
            }}
          >
            {canTransfer ? "Cancel" : "Close"}
          </Button>
          {canTransfer && (
            <Button
              type="submit"
              variant="contained"
              startIcon={<SwapHorizIcon />}
            >
              Transfer Money
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <BudgetTemplates
        open={openTemplatesDialog}
        onClose={() => setOpenTemplatesDialog(false)}
        onApplyTemplate={handleApplyTemplate}
        onBack={
          templatesFromWelcome
            ? () => {
                setOpenTemplatesDialog(false);
                setShowWelcome(true);
              }
            : undefined
        }
      />

      {/* Welcome Dialog - Shows when no categories exist */}
      <Dialog
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            pb: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            color: "white",
            mb: 0,
            position: "relative",
          }}
        >
          <IconButton
            onClick={() => setShowWelcome(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome to B &amp; E Budgets! 🎉
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Let&apos;s set up your first budget
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textAlign: "center", mb: 4 }}
          >
            Choose how you&apos;d like to get started:
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              flexWrap: "wrap",
              maxWidth: 900,
              mx: "auto",
            }}
          >
            <Card
              sx={{
                cursor: "pointer",
                minWidth: 280,
                maxWidth: 400,
                height: 200,
                transition: "all 0.3s ease",
                border: "2px solid transparent",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: (theme) => theme.shadows[8],
                  borderColor: (theme) => theme.palette.primary.main,
                },
              }}
              onClick={() => {
                setOpenTemplatesDialog(true);
                setTemplatesFromWelcome(true);
                setShowWelcome(false);
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <TemplateIcon
                  sx={{
                    fontSize: 48,
                    color: "primary.main",
                    mb: 2,
                    mx: "auto",
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Start with a Template
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, flexGrow: 1 }}
                >
                  Choose from pre-built budget templates designed for different
                  lifestyles
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "primary.main" }}
                >
                  Recommended for beginners
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                cursor: "pointer",
                minWidth: 280,
                maxWidth: 400,
                height: 200,
                transition: "all 0.3s ease",
                border: "2px solid transparent",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: (theme) => theme.shadows[8],
                  borderColor: (theme) => theme.palette.secondary.main,
                },
              }}
              onClick={() => {
                setShowWelcome(false);
                setOpenAddCategoryDialog(true);
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <AddIcon
                  sx={{
                    fontSize: 48,
                    color: "secondary.main",
                    mb: 2,
                    mx: "auto",
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Start from Scratch
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, flexGrow: 1 }}
                >
                  Create your own custom budget categories and build it your way
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "secondary.main" }}
                >
                  For experienced budgeters
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{ mt: 4, p: 3, bgcolor: "background.default", borderRadius: 2 }}
          >
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LightbulbIcon color="primary" />
              Pro Tip
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Templates include realistic budget amounts based on average costs.
              You can always customize them later. Starting with a template
              helps you avoid missing important expense categories.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            You can change your budget anytime using the toolbar buttons above
          </Typography>
        </DialogActions>
      </Dialog>
    </div>
  );
}
