"use client";
import { useState, useEffect, useMemo } from "react";
import db from "../../utils/firestore";
import { collection, setDoc, doc } from "firebase/firestore";
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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Switch,
  Stack,
  ClickAwayListener,
  AccordionSummary,
  Accordion,
  IconButton,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  useColorScheme,
  AppBar,
  Toolbar,
  CardContent,
  Card,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import "./style.css";
import { SummaryReport } from "@/components/SummaryReport";
import { Columns, themeModes } from "@/app/utils/constants";
import { BudgetDetails } from "@/components/BudgetDetails";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AddIcon from "@mui/icons-material/Add";

export default function Home() {
  const { mode, setMode } = useColorScheme();
  const [value, setValue] = useState("testetetetet");
  const [month, setMonth] = useState("January");
  const [rowModesModel, setRowModesModel] = useState({});
  const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] =
    useState(false);
  const [openAddRowDialog, setOpenAddRowDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  console.log(isMobile);
  const ITEMS_PER_PAGE = 50;

  dayjs.extend(duration);
  dayjs.extend(localeData);
  const listOfMonths = dayjs.months();

  // TODO: grab values from Database
  // TODO: either change to context API or redux(mobx)
  const initiateData = () => {
    const data = {};
    for (let i = 0; i < listOfMonths.length; i++) {
      data[listOfMonths[i]] = {
        income: {
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
              field: Columns.RECEIVED.id,
              headerName: Columns.RECEIVED.text,
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
          isSpendingType: false,
        },
      };
    }
    return data;
  };
  const [budgetData, setBudgetData] = useState(initiateData());
  console.log("111111111", budgetData);
  const paginationModel = { page: 0, pageSize: ITEMS_PER_PAGE };

  const router = useRouter();

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
    const [category, rowId] = id.split("__");

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
    console.log(budgetData, "1111");
    console.log(newBudgetData);
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

  const getTotalPlanned = useMemo(() => {
    let totalPlanned = 0;

    for (const [categoryName, categoryData] of Object.entries(
      budgetData[month],
    )) {
      if (!categoryData.isSpendingType) {
        for (const row of categoryData.rows) {
          totalPlanned += row.planned ? parseFloat(row.planned) : 0;
        }
      }
    }

    return totalPlanned;
  }, [month, budgetData[month]]);

  const getTotalSpent = useMemo(() => {
    let totalSpent = 0;

    // TODO: optimize
    for (const [categoryName, categoryData] of Object.entries(
      budgetData[month],
    )) {
      if (categoryData.isSpendingType) {
        for (const row of categoryData.rows) {
          for (const transaction of row?.transactions || []) {
            totalSpent += parseFloat(transaction.amount) || 0;
          }
        }
      }
    }

    return totalSpent;
  }, [month, budgetData[month]]);

  const renderBudget = () => (
    <Grid container className="budget" spacing={2}>
      {/* <main>
          <button onClick={handleSubmit}>Write to DB</button>
        </main> */}
      <Grid size={{ xs: 4 }}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Planned
            </Typography>
            <Typography gutterBottom variant="body2" component="div">
              {getTotalPlanned}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Spent
            </Typography>
            <Typography gutterBottom variant="body2" component="div">
              {getTotalSpent}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Remaining
            </Typography>
            <Typography gutterBottom variant="body2" component="div">
              00000
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <div className="monthSelector">
        <FormControl variant="standard">
          <Select
            labelId="month-selector"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
            }}
            sx={{
              ".MuiSelect-select": {
                fontSize: "2rem",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              },
            }}
          >
            {listOfMonths.map((el) => (
              <MenuItem key={el} value={el}>
                {el}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <Grid size={{ xs: 12 }}>
        {/* Make this into a component **********/}
        {Object.entries(budgetData[month]).map(([name, data]) => (
          <Accordion
            key={name}
            defaultExpanded={true}
            sx={{
              "& .mui-10rhlys-MuiButtonBase-root-MuiAccordionSummary-root": {
                flexDirection: "row-reverse",
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <AccordionSummary
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography variant="h6">{name}</Typography>
              </AccordionSummary>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={() => {
                    setOpenAddRowDialog({
                      category: name,
                      isSpendingType: data.isSpendingType,
                    });
                  }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton onClick={() => setOpenDeleteCategoryDialog(name)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
            <AccordionDetails>
              <Paper elevation={0}>
                <DataGrid
                  hideFooter={true}
                  editMode="cell"
                  onRowSelectionModelChange={(newRowSelectionModel) => {
                    handleRowSelectionModelChange(newRowSelectionModel);
                  }}
                  rowSelectionModel={rowSelectionModel}
                  rowModesModel={rowModesModel[name]}
                  processRowUpdate={(newRow) => processRowUpdate(name, newRow)}
                  onRowEditStart={(params) => {
                    switchMode(GridRowModes.Edit, name, params.id);
                  }}
                  onRowEditStop={(params) => {
                    switchMode(GridRowModes.View, name, params.id);
                  }}
                  rows={data.rows}
                  columns={data.columns}
                  initialState={{ pagination: { paginationModel } }}
                  sx={{
                    border: 0,
                  }}
                  // pageSizeOptions={[5, 10]}
                />
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))}

        <Button
          variant="outlined"
          onClick={() => {
            setOpenAddCategoryDialog(true);
          }}
          fullWidth
          className="budget__addCategoryButton"
        >
          New Category
        </Button>
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
        <SummaryReport monthData={budgetData[month]} />
      )}
    </div>
  );

  const renderMobileLayout = () => (
    <Grid container direction="row" spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>{renderSummaryDetails()}</Grid>

      {!showDetails || !isMobile ? (
        <Grid size={{ xs: 12, md: 8 }}>{renderBudget()}</Grid>
      ) : (
        ""
      )}
    </Grid>
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
          <IconButton
            onClick={() => {
              setMode(
                mode === themeModes.DARK ? themeModes.LIGHT : themeModes.DARK,
              );
            }}
          >
            {mode === themeModes.DARK ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid container direction="column" spacing={2} className="home__content">
        <Grid size={{ xs: 12 }}>
          {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        </Grid>

        <Grid size={{ xs: 12 }} className="footer">
          <Button
            onClick={async (e) => {
              // TODO: Change sign out to a server action
              auth.signOut();
              await deleteCookie("firebase_token");
              router.push("/login");
            }}
            variant="contained"
          >
            Sign out
          </Button>
        </Grid>
      </Grid>

      <Dialog
        open={openAddCategoryDialog}
        onClose={() => {
          setOpenAddCategoryDialog(false);
        }}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              handleAddNewCategory(formJson.name, formJson.type !== "on");
              setOpenAddCategoryDialog(false);
            },
          },
        }}
      >
        <DialogTitle>Category name</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography>Spend</Typography>
            <Switch name="type" />
            <Typography>Receive</Typography>
          </Stack>

          <TextField
            autoFocus
            required
            id="name"
            name="name"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddCategoryDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
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
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              handleAddItem(
                { ...formJson },
                openAddRowDialog.category,
                openAddCategoryDialog.isSpendingType,
              );
              setOpenAddRowDialog(false);
            },
          },
        }}
      >
        <DialogTitle>Add row</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TextField
              required
              id="name"
              name="name"
              variant="standard"
              placeholder="Name"
            />
            <TextField
              required
              id="planned"
              name="planned"
              variant="standard"
              placeholder="Planned"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddRowDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
