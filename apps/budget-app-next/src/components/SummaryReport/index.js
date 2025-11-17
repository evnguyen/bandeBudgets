import { PieChart } from "@mui/x-charts";
import { useState, useMemo } from "react";
import { Columns } from "@/app/utils/constants";
import {
  Box,
  Stack,
  Tab,
  Tabs,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";

export const SummaryReport = ({ monthData = {} }) => {
  const tabsEnum = {
    PLANNED: 0,
    SPENT: 1,
    REMAINING: 2,
  };

  const [tab, setTab] = useState(tabsEnum.REMAINING); // Default to most useful view

  // Generate colors for categories
  const categoryColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D7BDE2",
  ];

  // Safe number formatting function
  const safeToFixed = (value, decimals = 2) => {
    const num = Number(value) || 0;
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };

  // Safe percentage formatting
  const safePercentage = (value, total) => {
    const numValue = Number(value) || 0;
    const numTotal = Number(total) || 0;
    if (numTotal === 0) return "0.0";
    const percentage = (numValue / numTotal) * 100;
    return isNaN(percentage) ? "0.0" : percentage.toFixed(1);
  };

  const calculateCategoryTotal = (categoryData, type) => {
    if (
      !categoryData ||
      !categoryData.rows ||
      !Array.isArray(categoryData.rows)
    ) {
      return 0;
    }

    let total = 0;
    for (let row of categoryData.rows) {
      if (!row) continue;

      if (type === "planned") {
        total += Number(row[Columns.PLANNED.id]) || 0;
      } else if (type === "spent" && categoryData.isSpendingType) {
        // For spending categories, calculate total spent from transactions
        if (row.transactions && Array.isArray(row.transactions)) {
          total += row.transactions.reduce(
            (sum, transaction) => sum + (Number(transaction?.amount) || 0),
            0,
          );
        }
      } else if (type === "received" && !categoryData.isSpendingType) {
        // For income categories, use received amount
        total += Number(row[Columns.RECEIVED.id]) || 0;
      } else if (type === "remaining" && categoryData.isSpendingType) {
        // For spending categories, remaining = planned - spent
        const planned = Number(row[Columns.PLANNED.id]) || 0;
        const spent =
          row.transactions && Array.isArray(row.transactions)
            ? row.transactions.reduce(
                (sum, transaction) => sum + (Number(transaction?.amount) || 0),
                0,
              )
            : 0;
        total += Math.max(0, planned - spent);
      }
    }
    return total;
  };

  const chartData = useMemo(() => {
    try {
      const data = [];
      let total = 0;
      let colorIndex = 0;

      // Calculate totals based on current tab
      const type =
        tab === tabsEnum.PLANNED
          ? "planned"
          : tab === tabsEnum.SPENT
            ? "spent"
            : "remaining";

      // Ensure monthData is an object
      const safeMonthData =
        monthData && typeof monthData === "object" ? monthData : {};

      for (const [categoryName, categoryData] of Object.entries(
        safeMonthData,
      )) {
        if (!categoryName || !categoryData) continue;

        const categoryTotal = calculateCategoryTotal(categoryData, type);
        if (categoryTotal > 0) {
          total += categoryTotal;
          data.push({
            id: categoryName || "Unknown",
            value: categoryTotal,
            color:
              categoryColors[colorIndex % categoryColors.length] || "#CCCCCC",
          });
          colorIndex++;
        }
      }

      // Convert to percentages for display
      return data.map((item) => ({
        ...item,
        percentage: safePercentage(item.value, total),
        displayValue: safeToFixed(item.value),
      }));
    } catch (error) {
      console.error("Error calculating chart data:", error);
      return [];
    }
  }, [monthData, tab, categoryColors]);

  const totalAmount = useMemo(() => {
    try {
      return chartData.reduce(
        (sum, item) => sum + (Number(item?.value) || 0),
        0,
      );
    } catch (error) {
      console.error("Error calculating total amount:", error);
      return 0;
    }
  }, [chartData]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const getTabLabel = () => {
    switch (tab) {
      case tabsEnum.PLANNED:
        return "Planned Budget Breakdown";
      case tabsEnum.SPENT:
        return "Actual Spending Breakdown";
      case tabsEnum.REMAINING:
        return "Remaining Budget Breakdown";
      default:
        return "Budget Breakdown";
    }
  };

  return (
    <Stack
      direction="column"
      spacing={3}
      sx={{
        height: "100%",
        p: 2,
        overflow: "auto",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
        >
          Budget Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your financial progress with detailed breakdowns
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        aria-label="budget breakdown tabs"
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
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
        <Tab label="Planned" />
        <Tab label="Spent" />
        <Tab label="Remaining" />
      </Tabs>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
        >
          {getTabLabel()}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <PieChart
            height={280}
            width={280}
            series={[
              {
                data:
                  chartData.length > 0
                    ? chartData
                    : [{ id: "No Data", value: 1, color: "#CCCCCC" }],
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                innerRadius: 80,
                paddingAngle: 3,
                cornerRadius: 6,
                highlight: {
                  borderWidth: 3,
                  borderColor: "white",
                  additionalRadius: 5,
                },
                valueFormatter: (value, { dataIndex }) => {
                  if (!chartData[dataIndex]) return "0%";
                  const percentage = chartData[dataIndex].percentage || "0.0";
                  return `${percentage}%`;
                },
                tooltip: {
                  formatter: (params) => {
                    const data = params.data;
                    return `${data.id}: $${data.displayValue} (${data.percentage}%)`;
                  },
                },
              },
            ]}
            margin={{ top: 40, bottom: 40, left: 40, right: 40 }}
            slotProps={{
              legend: { hidden: true }, // Hide default legend since we have custom one
            }}
          />

          <Paper
            elevation={1}
            sx={{
              width: "100%",
              maxWidth: 450,
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                p: 3,
                textAlign: "center",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "inherit",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, position: "relative", zIndex: 1 }}
              >
                Total Amount
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, position: "relative", zIndex: 1 }}
              >
                ${safeToFixed(totalAmount)}
              </Typography>
            </Box>

            <List dense sx={{ py: 2 }}>
              {chartData.map((item, index) => (
                <ListItem
                  key={item.id}
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom:
                      index < chartData.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "translateX(4px)",
                      borderRadius: 2,
                      mx: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: item.color,
                      borderRadius: "50%",
                      mr: 2,
                      flexShrink: 0,
                      boxShadow: `0 2px 8px ${item.color}40`,
                      border: "2px solid white",
                    }}
                  />
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              textTransform: "capitalize",
                              color: "text.primary",
                            }}
                          >
                            {item.id}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              minWidth: "fit-content",
                            }}
                          >
                            ${item?.displayValue ?? "0.00"}
                          </Typography>
                          <Chip
                            label={`${item?.percentage ?? "0.0"}%`}
                            size="small"
                            sx={{
                              height: 28,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              bgcolor: item?.color ?? "#CCCCCC",
                              color: "white",
                              boxShadow: (theme) =>
                                `0 2px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)"}`,
                              border: (theme) =>
                                `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)"}`,
                              "& .MuiChip-label": {
                                px: 1.5,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Paper>
    </Stack>
  );
};
