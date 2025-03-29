import { PieChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import { Columns } from "@/app/utils/constants";
import { Box, Stack, Tab, Tabs } from "@mui/material";

export const SummaryReport = ({ monthData }) => {
  const tabsEnum = {
    PLANNED: 0,
    SPENT: 1,
    REMAINING: 2,
  };

  const [spendingData, setSpendingData] = useState([]);
  const [tab, setTab] = useState(tabsEnum.PLANNED);

  const calculateTotalInCategoryColumn = (categoryData, columnName) => {
    let total = 0;
    for (let row of categoryData.rows) {
      total += parseInt(row[columnName]) || 0;
    }
    return total;
  };

  const calculateTotalPlanned = () => {
    let total = 0;
    for (const [key, categoryData] of Object.entries(monthData)) {
      total += calculateTotalInCategoryColumn(categoryData, Columns.PLANNED.id);
    }
    return total;
  };

  const getSpendingData = () => {
    const seriesData = [];
    const totalSpendingPlanned = calculateTotalPlanned();

    if (!totalSpendingPlanned) {
      return [
        {
          id: 1,
          value: 100,
          color: "gray",
        },
      ];
    }

    for (const [key, categoryData] of Object.entries(monthData)) {
      console.log(
        "11111",
        calculateTotalInCategoryColumn(categoryData, Columns.REMAINING.id),
      );
      seriesData.push({
        id: key,
        value:
          (calculateTotalInCategoryColumn(categoryData, Columns.REMAINING.id) /
            totalSpendingPlanned) *
            100 || 0,
      });
    }

    const remainingValue = seriesData.reduce(
      (accumulator, current) => accumulator - current.value,
      100,
    );
    seriesData.push({
      id: "remaining",
      value: remainingValue,
      color: "gray",
    });

    console.log(seriesData);
    return seriesData;
  };

  const handleTabChange = (event, newValue) => {
    console.log(newValue);
    setTab(newValue);
  };

  useEffect(() => {
    setSpendingData(getSpendingData());
  }, [monthData]);

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={4}
      sx={{ height: "100vh" }}
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        aria-label="basic tabs example"
      >
        <Tab label="Planned" />
        <Tab label="Remaining" />
        <Tab label="Spent" />
      </Tabs>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PieChart
          height={400}
          width={400}
          series={[
            {
              data: spendingData,
              highlightScope: { fade: "global", highlight: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              innerRadius: 60,
            },
          ]}
        />
      </Box>
    </Stack>
  );
};
